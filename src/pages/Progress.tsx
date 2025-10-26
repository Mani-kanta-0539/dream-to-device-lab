import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsChart } from "@/components/progress/StatsChart";
import { GoalTracker } from "@/components/progress/GoalTracker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Calendar } from "lucide-react";

const Progress = () => {
  const weightData = Array.from({ length: 12 }, (_, i) => ({
    date: new Date(Date.now() - (11 - i) * 7 * 86400000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    value: 78 - i * 0.5 + Math.random() * 2,
  }));

  const workoutData = Array.from({ length: 12 }, (_, i) => ({
    date: new Date(Date.now() - (11 - i) * 7 * 86400000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    value: Math.floor(3 + Math.random() * 4),
  }));

  const caloriesData = Array.from({ length: 12 }, (_, i) => ({
    date: new Date(Date.now() - (11 - i) * 7 * 86400000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    value: Math.floor(2200 + Math.random() * 600),
  }));

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
                  <StatsChart
                    title="Weight Progress"
                    data={weightData}
                    color="#10B981"
                    unit="kg"
                  />
                  <StatsChart
                    title="Weekly Workouts"
                    data={workoutData}
                    color="#F97316"
                    unit=" workouts"
                  />
                </div>
                <div>
                  <GoalTracker />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="weight" className="space-y-6">
              <StatsChart
                title="Weight Tracking"
                data={weightData}
                color="#10B981"
                unit="kg"
              />
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
              <StatsChart
                title="Workout Frequency"
                data={workoutData}
                color="#F97316"
                unit=" sessions"
              />
            </TabsContent>

            <TabsContent value="nutrition">
              <StatsChart
                title="Daily Calorie Intake"
                data={caloriesData}
                color="#1E40AF"
                unit=" cal"
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Progress;
