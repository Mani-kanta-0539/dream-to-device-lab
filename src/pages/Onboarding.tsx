import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { FitnessLevelStep } from "@/components/onboarding/FitnessLevelStep";
import { GoalSelectionStep } from "@/components/onboarding/GoalSelectionStep";
import { PersonalStatsStep } from "@/components/onboarding/PersonalStatsStep";
import { WorkoutPreferencesStep } from "@/components/onboarding/WorkoutPreferencesStep";
import { DietaryPreferencesStep } from "@/components/onboarding/DietaryPreferencesStep";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface OnboardingData {
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
  goals?: string[];
  weight?: number;
  height?: number;
  workoutTypes?: string[];
  workoutDuration?: number;
  dietaryRestrictions?: string[];
  equipment?: string[];
}

const steps = [
  { title: "Fitness Level", description: "Tell us about your experience" },
  { title: "Goals", description: "What do you want to achieve?" },
  { title: "Personal Info", description: "Help us personalize your plan" },
  { title: "Workout Preferences", description: "How do you like to train?" },
  { title: "Diet Preferences", description: "Let's plan your nutrition" },
];

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = (data: Partial<OnboardingData>) => {
    setOnboardingData({ ...onboardingData, ...data });
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to complete onboarding.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Update user preferences
      const { error: preferencesError } = await supabase
        .from('user_preferences')
        .update({
          fitness_level: onboardingData.fitnessLevel,
          goals: onboardingData.goals || [],
          preferred_workout_types: onboardingData.workoutTypes || [],
          preferred_workout_duration: onboardingData.workoutDuration,
          dietary_restrictions: onboardingData.dietaryRestrictions || []
        })
        .eq('user_id', user.id);

      if (preferencesError) throw preferencesError;

      // Insert initial stats if provided
      if (onboardingData.weight || onboardingData.height) {
        const { error: statsError } = await supabase
          .from('user_stats')
          .insert({
            user_id: user.id,
            weight: onboardingData.weight,
            height: onboardingData.height
          });

        if (statsError) throw statsError;
      }

      // Insert equipment if provided
      if (onboardingData.equipment && onboardingData.equipment.length > 0) {
        const equipmentData = onboardingData.equipment.map((eq: string) => ({
          user_id: user.id,
          equipment_name: eq
        }));

        const { error: equipmentError } = await supabase
          .from('user_equipment')
          .insert(equipmentData);

        if (equipmentError) throw equipmentError;
      }

      toast({
        title: "Welcome to AscendFit!",
        description: "Your profile has been set up successfully.",
      });
      
      navigate("/dashboard");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save preferences. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <FitnessLevelStep onNext={handleNext} />;
      case 1:
        return <GoalSelectionStep onNext={handleNext} />;
      case 2:
        return <PersonalStatsStep onNext={handleNext} />;
      case 3:
        return <WorkoutPreferencesStep onNext={handleNext} />;
      case 4:
        return <DietaryPreferencesStep onNext={handleNext} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="mb-8 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Welcome to AscendFit!</h1>
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center flex-1">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    index < currentStep
                      ? "bg-primary text-primary-foreground"
                      : index === currentStep
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index < currentStep ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      index < currentStep ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>{steps[currentStep].title}</CardTitle>
            <CardDescription>{steps[currentStep].description}</CardDescription>
          </CardHeader>
          <CardContent>{renderStep()}</CardContent>
        </Card>

        {currentStep > 0 && (
          <div className="mt-4">
            <Button variant="ghost" onClick={handleBack}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
