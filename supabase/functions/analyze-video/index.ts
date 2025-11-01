import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoPath, exerciseType } = await req.json();
    
    if (!videoPath) {
      return new Response(
        JSON.stringify({ error: 'videoPath is required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    console.log('Analyzing video:', videoPath, 'Exercise type:', exerciseType);

    // Download video from Supabase storage using service role
    console.log('Downloading video from Supabase storage...');
    const { data: videoData, error: downloadError } = await fetch(
      `${SUPABASE_URL}/storage/v1/object/analysis-videos/${videoPath}`,
      {
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
        }
      }
    ).then(async (res) => {
      if (!res.ok) {
        return { data: null, error: new Error(`Failed to download video: ${res.statusText}`) };
      }
      return { data: await res.arrayBuffer(), error: null };
    });

    if (downloadError || !videoData) {
      throw downloadError || new Error('Failed to download video');
    }

    const videoBytes = videoData;
    
    // Upload to Gemini File API
    const uploadResponse = await fetch(`https://generativelanguage.googleapis.com/upload/v1beta/files?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'X-Goog-Upload-Protocol': 'resumable',
        'X-Goog-Upload-Command': 'upload, finalize',
        'X-Goog-Upload-Header-Content-Length': videoBytes.byteLength.toString(),
        'X-Goog-Upload-Header-Content-Type': 'video/mp4',
        'Content-Type': 'video/mp4',
      },
      body: videoBytes,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('File upload error:', errorText);
      throw new Error('Failed to upload video to Gemini');
    }

    const fileData = await uploadResponse.json();
    console.log('File uploaded:', fileData);

    const prompt = exerciseType 
      ? `Analyze this ${exerciseType} workout video for proper form and technique. Provide:
1. Overall form score (0-100)
2. Detailed feedback on technique
3. Specific improvement suggestions

Return ONLY valid JSON with this structure:
{"formScore": 85, "feedback": "detailed feedback here", "improvementSuggestions": ["tip 1", "tip 2", "tip 3"]}`
      : `Analyze this workout video for proper form. Return JSON with formScore, feedback, and improvementSuggestions.`;

    // Wait a bit for file processing
    await new Promise(resolve => setTimeout(resolve, 3000));

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { 
              fileData: {
                mimeType: fileData.file.mimeType,
                fileUri: fileData.file.uri
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 2048,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: `Gemini API error: ${response.status}` }), 
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('Gemini Response:', JSON.stringify(data, null, 2));

    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      throw new Error('No response from Gemini API');
    }

    // Try to parse as JSON, fallback to text analysis
    let analysisResult;
    try {
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch (e) {
      // Fallback structure
      analysisResult = {
        formScore: 75,
        feedback: generatedText,
        improvementSuggestions: ['Continue practicing with proper form'],
        keyPoints: {
          goodForm: ['Exercise performed'],
          needsImprovement: ['Review technique details']
        }
      };
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        analysis: analysisResult
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-video function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
