import { z } from "zod";

export const fitnessLevelSchema = z.object({
  level: z.enum(["beginner", "intermediate", "advanced"], {
    required_error: "Please select your fitness level",
  }),
});

export const goalSchema = z.object({
  goals: z.array(z.string()).min(1, { message: "Please select at least one goal" }),
});

export const statsSchema = z.object({
  age: z.number().min(13, { message: "You must be at least 13 years old" }).max(120),
  height: z.number().min(100, { message: "Height must be at least 100 cm" }).max(250),
  weight: z.number().min(30, { message: "Weight must be at least 30 kg" }).max(300),
  gender: z.enum(["male", "female", "other"], {
    required_error: "Please select your gender",
  }),
});

export const workoutPreferencesSchema = z.object({
  workoutTypes: z.array(z.string()).min(1, { message: "Please select at least one workout type" }),
  duration: z.enum(["15", "30", "45", "60"], {
    required_error: "Please select preferred workout duration",
  }),
  equipment: z.array(z.string()),
});

export const dietaryPreferencesSchema = z.object({
  dietType: z.enum(["none", "vegetarian", "vegan", "keto", "paleo", "other"]),
  allergies: z.array(z.string()),
  restrictions: z.string().trim().max(500).optional(),
});

export type FitnessLevelData = z.infer<typeof fitnessLevelSchema>;
export type GoalData = z.infer<typeof goalSchema>;
export type StatsData = z.infer<typeof statsSchema>;
export type WorkoutPreferencesData = z.infer<typeof workoutPreferencesSchema>;
export type DietaryPreferencesData = z.infer<typeof dietaryPreferencesSchema>;
