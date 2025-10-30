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

    console.log('Analyzing video:', videoUrl, 'Exercise type:', exerciseType);

    const prompt = exerciseType 
      ? `Analyze this ${exerciseType} video for proper form and technique. Provide a detailed analysis including:
1. Overall form score (0-100)
2. Detailed feedback on the technique
3. Specific improvement suggestions
4. Key points about what's done well
5. Areas that need improvement

Format your response as JSON with the following structure:
{
  "formScore": <number>,
  "feedback": "<detailed feedback>",
  "improvementSuggestions": ["<suggestion 1>", "<suggestion 2>"],
  "keyPoints": {
    "goodForm": ["<point 1>", "<point 2>"],
    "needsImprovement": ["<point 1>", "<point 2>"]
  }
}`
      : `Analyze this workout video for proper form and technique. Provide a detailed analysis.`;

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
                mimeType: "video/mp4",
                fileUri: videoUrl
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
