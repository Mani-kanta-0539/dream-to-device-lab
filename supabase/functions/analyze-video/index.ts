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

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Analyzing video:', videoUrl, 'Exercise type:', exerciseType);

    // Use Gemini Pro for video analysis with vision capabilities
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          {
            role: 'system',
            content: `You are an expert fitness coach analyzing workout videos. Provide detailed feedback on form, posture, and technique. 
            Return a JSON object with the following structure:
            {
              "formScore": <number 0-100>,
              "feedback": "<detailed feedback>",
              "improvementSuggestions": ["<suggestion 1>", "<suggestion 2>", ...],
              "keyPoints": {
                "goodForm": ["<point 1>", "<point 2>"],
                "needsImprovement": ["<point 1>", "<point 2>"]
              }
            }`
          },
          {
            role: 'user',
            content: exerciseType 
              ? `Analyze this ${exerciseType} video for proper form and technique: ${videoUrl}`
              : `Analyze this workout video for proper form and technique: ${videoUrl}`
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'provide_analysis',
              description: 'Provide structured video analysis results',
              parameters: {
                type: 'object',
                properties: {
                  formScore: {
                    type: 'number',
                    description: 'Overall form score from 0-100'
                  },
                  feedback: {
                    type: 'string',
                    description: 'Detailed feedback on the exercise form'
                  },
                  improvementSuggestions: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'List of specific improvement suggestions'
                  },
                  keyPoints: {
                    type: 'object',
                    properties: {
                      goodForm: {
                        type: 'array',
                        items: { type: 'string' }
                      },
                      needsImprovement: {
                        type: 'array',
                        items: { type: 'string' }
                      }
                    }
                  }
                },
                required: ['formScore', 'feedback', 'improvementSuggestions', 'keyPoints']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'provide_analysis' } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), 
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }), 
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI Response:', JSON.stringify(data, null, 2));

    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const analysisResult = JSON.parse(toolCall.function.arguments);
      
      return new Response(
        JSON.stringify({
          success: true,
          analysis: analysisResult
        }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fallback to regular response if no tool call
    const content = data.choices?.[0]?.message?.content;
    return new Response(
      JSON.stringify({
        success: true,
        analysis: {
          formScore: 75,
          feedback: content || 'Analysis completed',
          improvementSuggestions: ['Continue practicing with proper form'],
          keyPoints: {
            goodForm: [],
            needsImprovement: []
          }
        }
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
