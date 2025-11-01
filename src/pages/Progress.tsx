import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsChart } from "@/components/progress/StatsChart";
import { GoalTracker } from "@/components/progress/GoalTracker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

const Progress = () => {
  const { user } = useAuth();
  const [weightData, setWeightData] = useState([]);
  const [workoutData, setWorkoutData] = useState([]);
  const [caloriesData, setCaloriesData] = useState([]);

  const { data: progressData, isLoading: isLoadingProgress } = useQuery({
    queryKey: ["progress", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      // Get workout sessions for workout duration and calories
      const { data: workoutData, error: workoutError } = await supabase
        .from("workout_sessions")
        .select("date, duration, calories_burned")
        .eq("user_id", user.id)
        .order("date", { ascending: true });
      
      if (workoutError) throw new Error(workoutError.message);
      
      // Get user stats for weight tracking
      const { data: statsData, error: statsError } = await supabase
        .from("user_stats")
        .select("date, weight")
        .eq("user_id", user.id)
        .order("date", { ascending: true });
      
      if (statsError) throw new Error(statsError.message);
      
      // Merge the data by date
      const dateMap = new Map();
      
      workoutData?.forEach(w => {
        const dateKey = w.date;
        if (!dateMap.has(dateKey)) {
          dateMap.set(dateKey, { date: dateKey });
        }
        const entry = dateMap.get(dateKey);
        entry.workout_duration = w.duration;
        entry.calories_burned = w.calories_burned;
      });
      
      statsData?.forEach(s => {
        const dateKey = s.date;
        if (!dateMap.has(dateKey)) {
          dateMap.set(dateKey, { date: dateKey });
        }
        const entry = dateMap.get(dateKey);
        entry.weight = s.weight;
      });
      
      return Array.from(dateMap.values());
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (progressData) {
      const formattedWeightData = progressData.map((d) => ({
        date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        value: d.weight,
      }));
      setWeightData(formattedWeightData);

      const formattedWorkoutData = progressData.map((d) => ({
        date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        value: d.workout_duration,
      }));
      setWorkoutData(formattedWorkoutData);

      const formattedCaloriesData = progressData.map((d) => ({
        date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        value: d.calories_burned,
      }));
      setCaloriesData(formattedCaloriesData);
    }
  }, [progressData]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Progress Tracking</h1>
              <p className="text-muted-foreground">
                Monitor your fitness journey and celebrate achievements
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Set Date Range
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </div>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="weight">Weight</TabsTrigger>
              <TabsTrigger value="workouts">Workouts</TabsTrigger>
              <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Weight Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoadingProgress ? (
                        <p>Loading...</p>
                      ) : (
                        <StatsChart data={weightData} color="#10B981" unit="kg" />
                      )}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Weekly Workouts</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoadingProgress ? (
                        <p>Loading...</p>
                      ) : (
                        <StatsChart data={workoutData} color="#F97316" unit=" workouts" />
                      )}
                    </CardContent>
                  </Card>
                </div>
                <div>
                  <GoalTracker />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="weight" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Weight Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingProgress ? (
                    <p>Loading...</p>
                  ) : (
                    <StatsChart data={weightData} color="#10B981" unit="kg" />
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Body Measurements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Chest", value: "98 cm" },
                      { label: "Waist", value: "82 cm" },
                      { label: "Hips", value: "95 cm" },
                      { label: "Arms", value: "35 cm" },
                    ].map((measurement) => (
                      <div key={measurement.label} className="text-center p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">{measurement.label}</p>
                        <p className="text-2xl font-bold">{measurement.value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="workouts">
              <Card>
                <CardHeader>
                  <CardTitle>Workout Frequency</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingProgress ? (
                    <p>Loading...</p>
                  ) : (
                    <StatsChart data={workoutData} color="#F97316" unit=" sessions" />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="nutrition">
              <Card>
                <CardHeader>
                  <CardTitle>Daily Calorie Intake</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingProgress ? (
                    <p>Loading...</p>
                  ) : (
                    <StatsChart data={caloriesData} color="#1E40AF" unit=" cal" />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Progress;
