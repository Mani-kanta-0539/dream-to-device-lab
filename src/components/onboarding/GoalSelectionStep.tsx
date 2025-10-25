import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Target, TrendingDown, Dumbbell, Heart, Activity, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { goalSchema, GoalData } from "@/lib/validations/onboarding";
import { cn } from "@/lib/utils";

interface GoalSelectionStepProps {
  onNext: (data: GoalData) => void;
}

export const GoalSelectionStep = ({ onNext }: GoalSelectionStepProps) => {
  const form = useForm<GoalData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      goals: [],
    },
  });

  const goals = [
    { id: "weight-loss", icon: TrendingDown, label: "Weight Loss" },
    { id: "muscle-gain", icon: Dumbbell, label: "Muscle Gain" },
    { id: "endurance", icon: Activity, label: "Build Endurance" },
    { id: "flexibility", icon: Zap, label: "Improve Flexibility" },
    { id: "general-fitness", icon: Target, label: "General Fitness" },
    { id: "health", icon: Heart, label: "Better Health" },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
        <FormField
          control={form.control}
          name="goals"
          render={() => (
            <FormItem>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {goals.map((goal) => (
                  <FormField
                    key={goal.id}
                    control={form.control}
                    name="goals"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <label
                            className={cn(
                              "flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-primary/50",
                              field.value?.includes(goal.id)
                                ? "border-primary bg-primary/5"
                                : "border-border"
                            )}
                          >
                            <Checkbox
                              checked={field.value?.includes(goal.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, goal.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== goal.id
                                      )
                                    );
                              }}
                            />
                            <goal.icon className="h-5 w-5 text-primary" />
                            <span className="font-medium">{goal.label}</span>
                          </label>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Continue
        </Button>
      </form>
    </Form>
  );
};
