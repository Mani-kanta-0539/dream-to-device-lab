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
    const { fitnessLevel, goals, duration, equipment, workoutType } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating workout plan:', { fitnessLevel, goals, duration, equipment, workoutType });

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are an expert fitness trainer creating personalized workout plans. Generate workout plans that are safe, effective, and tailored to the user\'s fitness level and goals.'
          },
          {
            role: 'user',
            content: `Create a ${duration || 30}-minute ${workoutType || 'full body'} workout plan for someone with ${fitnessLevel || 'intermediate'} fitness level. 
            Goals: ${Array.isArray(goals) ? goals.join(', ') : goals || 'general fitness'}
            Available equipment: ${Array.isArray(equipment) ? equipment.join(', ') : equipment || 'bodyweight only'}
            
            Include warm-up, main exercises, and cool-down. For each exercise, provide sets, reps/duration, and brief instructions.`
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'create_workout_plan',
              description: 'Create a structured workout plan',
              parameters: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  totalDuration: { type: 'number' },
                  estimatedCalories: { type: 'number' },
                  exercises: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        type: { type: 'string', enum: ['warmup', 'main', 'cooldown'] },
                        sets: { type: 'number' },
                        reps: { type: 'number' },
                        duration: { type: 'number' },
                        restTime: { type: 'number' },
                        instructions: { type: 'string' }
                      },
                      required: ['name', 'type', 'instructions']
                    }
                  }
                },
                required: ['title', 'description', 'totalDuration', 'estimatedCalories', 'exercises']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'create_workout_plan' } }
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

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const workoutPlan = JSON.parse(toolCall.function.arguments);
      
      return new Response(
        JSON.stringify({
          success: true,
          workout: workoutPlan
        }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Failed to generate workout plan');

  } catch (error) {
    console.error('Error in generate-workout function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
