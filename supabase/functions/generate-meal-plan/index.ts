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
    const { goals, dietaryRestrictions, calorieTarget, preferences } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating meal plan:', { goals, dietaryRestrictions, calorieTarget, preferences });

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
            content: 'You are an expert nutritionist creating personalized meal plans. Create balanced, nutritious meal plans that meet the user\'s dietary needs and goals.'
          },
          {
            role: 'user',
            content: `Create a daily meal plan for someone with the following requirements:
            Goals: ${Array.isArray(goals) ? goals.join(', ') : goals || 'general health'}
            Dietary restrictions: ${Array.isArray(dietaryRestrictions) ? dietaryRestrictions.join(', ') : dietaryRestrictions || 'none'}
            Daily calorie target: ${calorieTarget || 2000} calories
            Preferences: ${preferences || 'balanced diet'}
            
            Include breakfast, lunch, dinner, and 2 snacks. For each meal, provide nutritional information and ingredients.`
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'create_meal_plan',
              description: 'Create a structured daily meal plan',
              parameters: {
                type: 'object',
                properties: {
                  planName: { type: 'string' },
                  description: { type: 'string' },
                  totalCalories: { type: 'number' },
                  totalProtein: { type: 'number' },
                  totalCarbs: { type: 'number' },
                  totalFat: { type: 'number' },
                  meals: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        mealType: { type: 'string', enum: ['breakfast', 'lunch', 'dinner', 'snack'] },
                        name: { type: 'string' },
                        description: { type: 'string' },
                        calories: { type: 'number' },
                        protein: { type: 'number' },
                        carbs: { type: 'number' },
                        fat: { type: 'number' },
                        ingredients: {
                          type: 'array',
                          items: { type: 'string' }
                        },
                        instructions: { type: 'string' }
                      },
                      required: ['mealType', 'name', 'calories', 'ingredients']
                    }
                  }
                },
                required: ['planName', 'description', 'totalCalories', 'meals']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'create_meal_plan' } }
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
      const mealPlan = JSON.parse(toolCall.function.arguments);
      
      return new Response(
        JSON.stringify({
          success: true,
          mealPlan: mealPlan
        }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Failed to generate meal plan');

  } catch (error) {
    console.error('Error in generate-meal-plan function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
