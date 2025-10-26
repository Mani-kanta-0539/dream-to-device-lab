import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Calendar as CalendarIcon } from "lucide-react";
import { WorkoutCard } from "@/components/workouts/WorkoutCard";
import { WorkoutFilters } from "@/components/workouts/WorkoutFilters";
import { WorkoutCalendar } from "@/components/workouts/WorkoutCalendar";
import { Workout } from "@/types/workout";

const Workouts = () => {
  // Mock workout data
  const mockWorkouts: Workout[] = [
    {
      id: "1",
      title: "Full Body Strength",
      description: "Complete workout targeting all major muscle groups with compound movements",
      type: "strength",
      difficulty: "intermediate",
      duration: 45,
      caloriesBurned: 320,
      exercises: [],
      isFavorite: true,
      tags: ["Full Body", "Strength", "Muscle Building"],
    },
    {
      id: "2",
      title: "HIIT Cardio Blast",
      description: "High-intensity interval training to boost metabolism and burn fat",
      type: "hiit",
      difficulty: "advanced",
      duration: 30,
      caloriesBurned: 400,
      exercises: [],
      isFavorite: false,
      tags: ["HIIT", "Cardio", "Fat Burn"],
    },
    {
      id: "3",
      title: "Morning Yoga Flow",
      description: "Gentle yoga sequence to energize your morning and improve flexibility",
      type: "yoga",
      difficulty: "beginner",
      duration: 20,
      caloriesBurned: 120,
      exercises: [],
      isFavorite: true,
      tags: ["Yoga", "Flexibility", "Morning"],
    },
    {
      id: "4",
      title: "Upper Body Power",
      description: "Intense upper body workout focusing on chest, back, and arms",
      type: "strength",
      difficulty: "intermediate",
      duration: 40,
      caloriesBurned: 280,
      exercises: [],
      isFavorite: false,
      tags: ["Upper Body", "Strength", "Push/Pull"],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Workout Library</h1>
              <p className="text-muted-foreground">
                Discover and schedule your perfect workout
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <CalendarIcon className="mr-2 h-4 w-4" />
                Schedule
              </Button>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Custom
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="browse" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
              <TabsTrigger value="browse">Browse</TabsTrigger>
              <TabsTrigger value="my-plans">My Plans</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-3 space-y-6">
                  <WorkoutFilters />
                  
                  {/* Workout Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {mockWorkouts.map((workout) => (
                      <WorkoutCard key={workout.id} workout={workout} />
                    ))}
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  <WorkoutCalendar />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="my-plans">
              <div className="text-center py-12">
                <p className="text-muted-foreground">Your custom workout plans will appear here</p>
              </div>
            </TabsContent>

            <TabsContent value="favorites">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockWorkouts.filter(w => w.isFavorite).map((workout) => (
                  <WorkoutCard key={workout.id} workout={workout} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Workouts;
