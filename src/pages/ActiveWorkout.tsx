import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ExerciseTimer } from "@/components/workout/ExerciseTimer";
import { RepCounter } from "@/components/workout/RepCounter";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ChevronLeft, Pause, SkipForward, CheckCircle2 } from "lucide-react";
import { Exercise } from "@/types/workout";

const ActiveWorkout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Mock exercise data
  const exercises: Exercise[] = [
    {
      id: "1",
      name: "Push-ups",
      description: "Standard push-ups for chest and triceps",
      sets: 3,
      reps: 15,
      restTime: 60,
      instructions: [
        "Start in plank position with hands shoulder-width apart",
        "Lower your body until chest nearly touches the floor",
        "Push back up to starting position",
        "Keep your core engaged throughout",
      ],
    },
    {
      id: "2",
      name: "Squats",
      description: "Bodyweight squats for legs and glutes",
      sets: 3,
      reps: 20,
      restTime: 60,
      instructions: [
        "Stand with feet shoulder-width apart",
        "Lower your body by bending knees and hips",
        "Keep chest up and knees behind toes",
        "Push through heels to return to standing",
      ],
    },
    {
      id: "3",
      name: "Plank Hold",
      description: "Core strengthening exercise",
      duration: 60,
      restTime: 45,
      instructions: [
        "Start in forearm plank position",
        "Keep body in straight line from head to heels",
        "Engage your core and hold the position",
        "Breathe steadily throughout",
      ],
    },
  ];

  const currentExercise = exercises[currentExerciseIndex];
  const progress = ((currentExerciseIndex + 1) / exercises.length) * 100;

  const handleNextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    } else {
      handleCompleteWorkout();
    }
  };

  const handleCompleteWorkout = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/workouts")}
            className="mb-4"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Workouts
          </Button>

          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Full Body Strength</h1>
              <p className="text-muted-foreground">
                Exercise {currentExerciseIndex + 1} of {exercises.length}
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Pause className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Pause Workout?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You can resume your workout or end it here.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Resume</AlertDialogCancel>
                  <AlertDialogAction onClick={() => navigate("/dashboard")}>
                    End Workout
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Exercise */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {currentExercise.name}
                  <Badge>
                    {currentExercise.sets && `${currentExercise.sets} sets`}
                    {currentExercise.duration && `${currentExercise.duration}s`}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{currentExercise.description}</p>

                {/* Exercise Demo Area */}
                <div className="aspect-video rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <p className="text-muted-foreground">Exercise Demo</p>
                </div>

                {/* Instructions */}
                <div>
                  <h3 className="font-semibold mb-3">Instructions:</h3>
                  <ol className="space-y-2">
                    {currentExercise.instructions.map((instruction, index) => (
                      <li key={index} className="flex gap-2">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <span className="text-sm">{instruction}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </CardContent>
            </Card>

            {/* Control Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleNextExercise}
              >
                <SkipForward className="mr-2 h-4 w-4" />
                Skip Exercise
              </Button>
              <Button className="flex-1" onClick={handleNextExercise}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Complete Exercise
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Timer or Rep Counter */}
            {currentExercise.duration ? (
              <ExerciseTimer
                duration={currentExercise.duration}
                onComplete={handleNextExercise}
              />
            ) : (
              <RepCounter
                targetReps={currentExercise.reps || 0}
                onComplete={handleNextExercise}
              />
            )}

            {/* Exercise List */}
            <Card>
              <CardHeader>
                <CardTitle>Exercise List</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {exercises.map((exercise, index) => (
                  <div
                    key={exercise.id}
                    className={`p-3 rounded-lg border transition-colors ${
                      index === currentExerciseIndex
                        ? "border-primary bg-primary/5"
                        : index < currentExerciseIndex
                        ? "border-emerald-500 bg-emerald-500/5"
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {index < currentExerciseIndex && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{exercise.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {exercise.sets && `${exercise.sets} sets × ${exercise.reps} reps`}
                          {exercise.duration && `${exercise.duration}s`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveWorkout;
