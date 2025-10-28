-- Create workouts table
CREATE TABLE public.workouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  duration INTEGER NOT NULL,
  estimated_calories INTEGER NOT NULL DEFAULT 0,
  thumbnail_url TEXT,
  is_template BOOLEAN NOT NULL DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create exercises table
CREATE TABLE public.exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  muscle_groups TEXT[] DEFAULT '{}',
  equipment_required TEXT[] DEFAULT '{}',
  difficulty TEXT NOT NULL,
  instructions TEXT[] DEFAULT '{}',
  video_url TEXT,
  thumbnail_url TEXT,
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workout_exercises junction table
CREATE TABLE public.workout_exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  sets INTEGER,
  reps INTEGER,
  duration INTEGER,
  rest_time INTEGER,
  notes TEXT,
  UNIQUE(workout_id, order_index)
);

-- Create workout_sessions table
CREATE TABLE public.workout_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_id UUID REFERENCES public.workouts(id) ON DELETE SET NULL,
  workout_title TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration INTEGER,
  calories_burned INTEGER,
  completed BOOLEAN NOT NULL DEFAULT false,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create exercise_sets table
CREATE TABLE public.exercise_sets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_session_id UUID NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL,
  reps INTEGER,
  weight NUMERIC,
  duration INTEGER,
  completed BOOLEAN NOT NULL DEFAULT false,
  notes TEXT
);

-- Create meal_plans table
CREATE TABLE public.meal_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  daily_calorie_target INTEGER NOT NULL,
  daily_protein_target INTEGER,
  daily_carbs_target INTEGER,
  daily_fat_target INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create meals table
CREATE TABLE public.meals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_plan_id UUID NOT NULL REFERENCES public.meal_plans(id) ON DELETE CASCADE,
  meal_type TEXT NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  name TEXT NOT NULL,
  description TEXT,
  calories INTEGER NOT NULL,
  protein INTEGER,
  carbs INTEGER,
  fat INTEGER,
  ingredients TEXT[] DEFAULT '{}',
  instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create goals table
CREATE TABLE public.goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_value NUMERIC,
  current_value NUMERIC,
  unit TEXT,
  target_date DATE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create video_analyses table
CREATE TABLE public.video_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  exercise_type TEXT,
  analysis_status TEXT NOT NULL DEFAULT 'pending',
  analysis_results JSONB,
  form_score INTEGER CHECK (form_score >= 0 AND form_score <= 100),
  feedback TEXT,
  improvement_suggestions TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_analyses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workouts
CREATE POLICY "Users can view template workouts and their own workouts"
ON public.workouts FOR SELECT
USING (is_template = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own workouts"
ON public.workouts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workouts"
ON public.workouts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workouts"
ON public.workouts FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for exercises
CREATE POLICY "Users can view system exercises and their own exercises"
ON public.exercises FOR SELECT
USING (is_system = true OR auth.uid() = created_by);

CREATE POLICY "Users can create their own exercises"
ON public.exercises FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own exercises"
ON public.exercises FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own exercises"
ON public.exercises FOR DELETE
USING (auth.uid() = created_by);

-- RLS Policies for workout_exercises
CREATE POLICY "Users can view workout exercises for accessible workouts"
ON public.workout_exercises FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.workouts w 
    WHERE w.id = workout_exercises.workout_id 
    AND (w.is_template = true OR w.user_id = auth.uid())
  )
);

CREATE POLICY "Users can manage workout exercises for their own workouts"
ON public.workout_exercises FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.workouts w 
    WHERE w.id = workout_exercises.workout_id 
    AND w.user_id = auth.uid()
  )
);

-- RLS Policies for workout_sessions
CREATE POLICY "Users can view their own workout sessions"
ON public.workout_sessions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workout sessions"
ON public.workout_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout sessions"
ON public.workout_sessions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workout sessions"
ON public.workout_sessions FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for exercise_sets
CREATE POLICY "Users can view their own exercise sets"
ON public.exercise_sets FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.workout_sessions ws 
    WHERE ws.id = exercise_sets.workout_session_id 
    AND ws.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage their own exercise sets"
ON public.exercise_sets FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.workout_sessions ws 
    WHERE ws.id = exercise_sets.workout_session_id 
    AND ws.user_id = auth.uid()
  )
);

-- RLS Policies for meal_plans
CREATE POLICY "Users can view their own meal plans"
ON public.meal_plans FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own meal plans"
ON public.meal_plans FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal plans"
ON public.meal_plans FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meal plans"
ON public.meal_plans FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for meals
CREATE POLICY "Users can view meals in their meal plans"
ON public.meals FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.meal_plans mp 
    WHERE mp.id = meals.meal_plan_id 
    AND mp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage meals in their meal plans"
ON public.meals FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.meal_plans mp 
    WHERE mp.id = meals.meal_plan_id 
    AND mp.user_id = auth.uid()
  )
);

-- RLS Policies for goals
CREATE POLICY "Users can view their own goals"
ON public.goals FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals"
ON public.goals FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
ON public.goals FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals"
ON public.goals FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for video_analyses
CREATE POLICY "Users can view their own video analyses"
ON public.video_analyses FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own video analyses"
ON public.video_analyses FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own video analyses"
ON public.video_analyses FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own video analyses"
ON public.video_analyses FOR DELETE
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_workouts_user_id ON public.workouts(user_id);
CREATE INDEX idx_workouts_type ON public.workouts(type);
CREATE INDEX idx_workouts_difficulty ON public.workouts(difficulty);
CREATE INDEX idx_workouts_is_template ON public.workouts(is_template);

CREATE INDEX idx_exercises_type ON public.exercises(type);
CREATE INDEX idx_exercises_is_system ON public.exercises(is_system);
CREATE INDEX idx_exercises_created_by ON public.exercises(created_by);

CREATE INDEX idx_workout_exercises_workout_id ON public.workout_exercises(workout_id);
CREATE INDEX idx_workout_exercises_exercise_id ON public.workout_exercises(exercise_id);

CREATE INDEX idx_workout_sessions_user_id ON public.workout_sessions(user_id);
CREATE INDEX idx_workout_sessions_date ON public.workout_sessions(date);
CREATE INDEX idx_workout_sessions_workout_id ON public.workout_sessions(workout_id);

CREATE INDEX idx_exercise_sets_workout_session_id ON public.exercise_sets(workout_session_id);
CREATE INDEX idx_exercise_sets_exercise_id ON public.exercise_sets(exercise_id);

CREATE INDEX idx_meal_plans_user_id ON public.meal_plans(user_id);
CREATE INDEX idx_meal_plans_is_active ON public.meal_plans(is_active);

CREATE INDEX idx_meals_meal_plan_id ON public.meals(meal_plan_id);

CREATE INDEX idx_goals_user_id ON public.goals(user_id);
CREATE INDEX idx_goals_status ON public.goals(status);

CREATE INDEX idx_video_analyses_user_id ON public.video_analyses(user_id);
CREATE INDEX idx_video_analyses_status ON public.video_analyses(analysis_status);

-- Create triggers for updated_at columns
CREATE TRIGGER update_workouts_updated_at
BEFORE UPDATE ON public.workouts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_exercises_updated_at
BEFORE UPDATE ON public.exercises
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_meal_plans_updated_at
BEFORE UPDATE ON public.meal_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_goals_updated_at
BEFORE UPDATE ON public.goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_video_analyses_updated_at
BEFORE UPDATE ON public.video_analyses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage buckets for videos
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('workout-videos', 'workout-videos', false),
  ('analysis-videos', 'analysis-videos', false);

-- Storage policies for workout-videos
CREATE POLICY "Users can view their own workout videos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'workout-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload their own workout videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'workout-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own workout videos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'workout-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own workout videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'workout-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for analysis-videos
CREATE POLICY "Users can view their own analysis videos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'analysis-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload their own analysis videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'analysis-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own analysis videos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'analysis-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own analysis videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'analysis-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);