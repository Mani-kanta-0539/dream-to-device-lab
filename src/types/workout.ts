export type WorkoutType = "strength" | "cardio" | "yoga" | "hiit" | "flexibility";
export type WorkoutDifficulty = "beginner" | "intermediate" | "advanced";

export interface Exercise {
  id: string;
  name: string;
  description: string;
  sets?: number;
  reps?: number;
  duration?: number; // in seconds
  restTime?: number; // in seconds
  thumbnailUrl?: string;
  instructions: string[];
}

export interface Workout {
  id: string;
  title: string;
  description: string;
  type: WorkoutType;
  difficulty: WorkoutDifficulty;
  duration: number; // in minutes
  caloriesBurned: number;
  exercises: Exercise[];
  thumbnailUrl?: string;
  isFavorite?: boolean;
  tags?: string[];
}

export interface WorkoutSession {
  id: string;
  workoutId: string;
  workoutTitle: string;
  date: Date;
  duration: number; // actual duration in minutes
  caloriesBurned: number;
  completed: boolean;
  rating?: number;
}

export interface WorkoutStats {
  totalWorkouts: number;
  currentStreak: number;
  totalCalories: number;
  averageRating: number;
  favoriteWorkoutType: WorkoutType;
}
