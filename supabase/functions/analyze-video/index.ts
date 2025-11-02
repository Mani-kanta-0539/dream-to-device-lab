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
    const { videoUrl, exerciseType } = await req.json();
    
    if (!videoUrl) {
      return new Response(
        JSON.stringify({ error: 'videoUrl is required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    console.log('Analyzing video from URL:', videoUrl, 'Exercise type:', exerciseType);

    // Step 1: Download video from Supabase storage
    console.log('Fetching video from Supabase...');
    const videoResponse = await fetch(videoUrl);
    if (!videoResponse.ok) {
      throw new Error(`Failed to fetch video: ${videoResponse.statusText}`);
    }

    const videoBlob = await videoResponse.arrayBuffer();
    console.log('Video downloaded, size:', videoBlob.byteLength, 'bytes');
    
    // Step 2: Upload to Gemini File API
    console.log('Uploading video to Gemini File API...');
    const uploadResponse = await fetch(`https://generativelanguage.googleapis.com/upload/v1beta/files?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'X-Goog-Upload-Protocol': 'resumable',
        'X-Goog-Upload-Command': 'upload, finalize',
        'X-Goog-Upload-Header-Content-Length': videoBlob.byteLength.toString(),
        'X-Goog-Upload-Header-Content-Type': 'video/mp4',
        'Content-Type': 'video/mp4',
      },
      body: videoBlob,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('File upload error:', uploadResponse.status, errorText);
      throw new Error(`Failed to upload video to Gemini: ${errorText}`);
    }

    const fileData = await uploadResponse.json();
    console.log('File uploaded to Gemini:', fileData);

    // Step 3: Wait for file processing
    console.log('Waiting for file processing...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    const prompt = exerciseType 
      ? `Analyze this ${exerciseType} workout video for proper form and technique. Provide:
1. Overall form score (0-100)
2. Detailed feedback on technique
3. Specific improvement suggestions

Return ONLY valid JSON with this structure:
{"formScore": 85, "feedback": "detailed feedback here", "improvementSuggestions": ["tip 1", "tip 2", "tip 3"]}`
      : `Analyze this workout video for proper form. Return JSON with formScore, feedback, and improvementSuggestions.`;

    // Step 4: Analyze with Gemini
    console.log('Analyzing video with Gemini...');
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
