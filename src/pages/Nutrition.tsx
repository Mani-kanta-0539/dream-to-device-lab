import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Apple, Droplets, Flame, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";

interface Meal {
  name: string;
  mealType: string;
  description?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  instructions?: string;
}

const Nutrition = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [dailyGoals, setDailyGoals] = useState({
    calories: { current: 0, target: 2200 },
    protein: { current: 0, target: 150 },
    carbs: { current: 0, target: 220 },
    fats: { current: 0, target: 70 },
    water: { current: 0, target: 8 },
  });
  const [meals, setMeals] = useState<Meal[]>([]);

  const { data: mealPlanData, isLoading: isLoadingMealPlan } = useQuery({
    queryKey: ["mealPlan", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("meal_plans")
        .select("*, meals(*)")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .single();
      if (error && error.code !== "PGRST116") { // Ignore no rows found error
        throw new Error(error.message);
      }
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (mealPlanData?.meals) {
      const { meals: mealItems, daily_calorie_target, daily_protein_target, daily_carbs_target, daily_fat_target } = mealPlanData;

      const formattedMeals = mealItems.map((meal: any) => ({
        name: meal.name,
        mealType: meal.meal_type,
        description: meal.description,
        calories: meal.calories || 0,
        protein: meal.protein || 0,
        carbs: meal.carbs || 0,
        fat: meal.fat || 0,
        ingredients: meal.ingredients || [],
        instructions: meal.instructions
      }));
      setMeals(formattedMeals);

      const totalCalories = mealItems.reduce((acc: number, meal: any) => acc + (meal.calories || 0), 0);
      const totalProtein = mealItems.reduce((acc: number, meal: any) => acc + (meal.protein || 0), 0);
      const totalCarbs = mealItems.reduce((acc: number, meal: any) => acc + (meal.carbs || 0), 0);
      const totalFats = mealItems.reduce((acc: number, meal: any) => acc + (meal.fat || 0), 0);

      setDailyGoals(prev => ({
        ...prev,
        calories: { current: totalCalories, target: daily_calorie_target || prev.calories.target },
        protein: { current: totalProtein, target: daily_protein_target || prev.protein.target },
        carbs: { current: totalCarbs, target: daily_carbs_target || prev.carbs.target },
        fats: { current: totalFats, target: daily_fat_target || prev.fats.target }
      }));
    }
  }, [mealPlanData]);

  const handleGenerateMealPlan = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to generate a meal plan.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Get user preferences
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('goals, dietary_restrictions')
        .eq('user_id', user.id)
        .single();

      const { data, error } = await supabase.functions.invoke('generate-meal-plan', {
        body: {
          goals: preferences?.goals || ['general health'],
          dietaryRestrictions: preferences?.dietary_restrictions || [],
          calorieTarget: dailyGoals.calories.target,
          preferences: 'balanced diet'
        }
      });

      if (error) throw error;

      if (data.success && data.mealPlan) {
        // Save to database
        const { data: planData } = await supabase
          .from('meal_plans')
          .insert({
            user_id: user.id,
            name: data.mealPlan.planName,
            description: data.mealPlan.description,
            start_date: new Date().toISOString().split('T')[0],
            daily_calorie_target: data.mealPlan.totalCalories,
            daily_protein_target: data.mealPlan.totalProtein,
            daily_carbs_target: data.mealPlan.totalCarbs,
            daily_fat_target: data.mealPlan.totalFat,
            is_active: true
          })
          .select()
          .single();

        if (planData) {
          // Save meals
          const mealsToInsert = data.mealPlan.meals.map((meal: any) => ({
            meal_plan_id: planData.id,
            meal_type: meal.mealType,
            day_of_week: new Date().getDay(),
            name: meal.name,
            description: meal.description,
            calories: meal.calories,
            protein: meal.protein,
            carbs: meal.carbs,
            fat: meal.fat,
            ingredients: meal.ingredients,
            instructions: meal.instructions
          }));

          await supabase.from('meals').insert(mealsToInsert);
        }

        // Update UI with new meals
        setMeals(data.mealPlan.meals);

        toast({
          title: "Meal Plan Generated!",
          description: "Your personalized meal plan is ready.",
        });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to generate meal plan. Please try again.";
      
      // Handle specific error codes
      if (error instanceof Error) {
        if (error.message.includes('429')) {
          toast({
            title: "Rate Limit Exceeded",
            description: "Too many requests. Please wait a moment and try again.",
            variant: "destructive"
          });
        } else if (error.message.includes('402')) {
          toast({
            title: "Credits Required",
            description: "Please add credits to your workspace to continue using AI features.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Generation Failed",
            description: errorMessage,
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Generation Failed",
          description: "Failed to generate meal plan. Please try again.",
          variant: "destructive"
        });
      }
      
      if (import.meta.env.DEV) {
        console.error('Error generating meal plan:', error);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Nutrition Planning</h1>
              <p className="text-muted-foreground">
                Track your meals and reach your nutrition goals
              </p>
            </div>
            <Button onClick={handleGenerateMealPlan} disabled={isGenerating}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'Generating...' : 'Generate New Plan'}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Daily Goals */}
              <Card>
                <CardHeader>
                  <CardTitle>Today's Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <Flame className="h-4 w-4 text-orange-500" />
                        Calories
                      </span>
                      <span className="font-medium">
                        {dailyGoals.calories.current} / {dailyGoals.calories.target} kcal
                      </span>
                    </div>
                    <Progress
                      value={(dailyGoals.calories.current / dailyGoals.calories.target) * 100}
                      className="h-2"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: "Protein", current: dailyGoals.protein.current, target: dailyGoals.protein.target, unit: "g" },
                      { label: "Carbs", current: dailyGoals.carbs.current, target: dailyGoals.carbs.target, unit: "g" },
                      { label: "Fats", current: dailyGoals.fats.current, target: dailyGoals.fats.target, unit: "g" },
                    ].map((macro) => (
                      <div key={macro.label} className="space-y-2">
                        <div className="text-xs text-muted-foreground">{macro.label}</div>
                        <div className="text-lg font-bold">
                          {macro.current}{macro.unit}
                        </div>
                        <Progress
                          value={(macro.current / macro.target) * 100}
                          className="h-1"
                        />
                        <div className="text-xs text-muted-foreground">
                          of {macro.target}{macro.unit}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <Droplets className="h-4 w-4 text-blue-500" />
                        Water Intake
                      </span>
                      <span className="font-medium">
                        {dailyGoals.water.current} / {dailyGoals.water.target} glasses
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: dailyGoals.water.target }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-8 flex-1 rounded ${
                            i < dailyGoals.water.current
                              ? "bg-blue-500"
                              : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Meal Plan */}
              <Card>
                <CardHeader>
                  <CardTitle>Today's Meal Plan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoadingMealPlan ? (
                    <p>Loading meal plan...</p>
                  ) : meals.length > 0 ? (
                    meals.map((meal, idx) => (
                      <div
                        key={`${meal.name}-${idx}`}
                        className="p-4 rounded-lg border hover:bg-muted/50 transition-colors space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                {meal.mealType}
                              </Badge>
                            </div>
                            <h3 className="font-semibold text-lg">{meal.name}</h3>
                            {meal.description && (
                              <p className="text-sm text-muted-foreground mt-1">{meal.description}</p>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-lg font-bold">{meal.calories} cal</div>
                            <div className="text-xs text-muted-foreground space-y-0.5">
                              <div>{meal.protein}g protein</div>
                              <div>{meal.carbs}g carbs</div>
                              <div>{meal.fat}g fat</div>
                            </div>
                          </div>
                        </div>
                        
                        {meal.ingredients && meal.ingredients.length > 0 && (
                          <div className="space-y-1">
                            <h4 className="text-sm font-medium">Ingredients:</h4>
                            <ul className="space-y-1">
                              {meal.ingredients.map((item, index) => (
                                <li key={index} className="text-sm flex items-center gap-2">
                                  <Apple className="h-3 w-3 text-primary flex-shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {meal.instructions && (
                          <div className="space-y-1 pt-2 border-t">
                            <h4 className="text-sm font-medium">Instructions:</h4>
                            <p className="text-sm text-muted-foreground">{meal.instructions}</p>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">No active meal plan found.</p>
                      <p className="text-sm">Click "Generate New Plan" to create your personalized nutrition plan!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <div className="text-3xl font-bold text-primary mb-1">94%</div>
                    <p className="text-sm text-muted-foreground">Goal Achievement</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Days on track</span>
                      <span className="font-medium">6/7</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Avg. calories</span>
                      <span className="font-medium">2,150</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Avg. protein</span>
                      <span className="font-medium">142g</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shopping List */}
              <Card>
                <CardHeader>
                  <CardTitle>Shopping List</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Generate List
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Nutrition;
