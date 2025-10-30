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
    const { goals, dietaryRestrictions, calorieTarget, preferences } = await req.json();

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    console.log('Generating meal plan:', { goals, dietaryRestrictions, calorieTarget, preferences });

    const prompt = `Create a daily meal plan for someone with the following requirements:
Goals: ${Array.isArray(goals) ? goals.join(', ') : goals || 'general health'}
Dietary restrictions: ${Array.isArray(dietaryRestrictions) ? dietaryRestrictions.join(', ') : dietaryRestrictions || 'none'}
Daily calorie target: ${calorieTarget || 2000} calories
Preferences: ${preferences || 'balanced diet'}

Include breakfast, lunch, dinner, and 2 snacks. For each meal, provide nutritional information and ingredients.

Format your response as JSON with this structure:
{
  "planName": "<name>",
  "description": "<description>",
  "totalCalories": <number>,
  "totalProtein": <number>,
  "totalCarbs": <number>,
  "totalFat": <number>,
  "meals": [
    {
      "mealType": "breakfast|lunch|dinner|snack",
      "name": "<meal name>",
      "description": "<description>",
      "calories": <number>,
      "protein": <number>,
      "carbs": <number>,
      "fat": <number>,
      "ingredients": ["<ingredient 1>", "<ingredient 2>"],
      "instructions": "<cooking instructions>"
    }
  ]
}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
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

    // Extract JSON from response
    let mealPlan;
    try {
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        mealPlan = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (e) {
      console.error('Failed to parse meal plan:', e);
      throw new Error('Failed to generate meal plan in proper format');
    }

    return new Response(
      JSON.stringify({
        success: true,
        mealPlan: mealPlan
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-meal-plan function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
