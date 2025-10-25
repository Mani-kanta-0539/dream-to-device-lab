import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Activity, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { fitnessLevelSchema, FitnessLevelData } from "@/lib/validations/onboarding";
import { cn } from "@/lib/utils";

interface FitnessLevelStepProps {
  onNext: (data: FitnessLevelData) => void;
}

export const FitnessLevelStep = ({ onNext }: FitnessLevelStepProps) => {
  const form = useForm<FitnessLevelData>({
    resolver: zodResolver(fitnessLevelSchema),
  });

  const levels = [
    {
      value: "beginner",
      icon: Activity,
      title: "Beginner",
      description: "Just starting my fitness journey",
    },
    {
      value: "intermediate",
      icon: TrendingUp,
      title: "Intermediate",
      description: "I workout regularly",
    },
    {
      value: "advanced",
      icon: Zap,
      title: "Advanced",
      description: "I'm an experienced athlete",
    },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
        <FormField
          control={form.control}
          name="level"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="grid gap-4"
                >
                  {levels.map((level) => (
                    <label
                      key={level.value}
                      className={cn(
                        "flex items-start gap-4 p-6 rounded-lg border-2 cursor-pointer transition-all hover:border-primary/50",
                        field.value === level.value
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      )}
                    >
                      <RadioGroupItem value={level.value} className="mt-1" />
                      <level.icon className="h-6 w-6 text-primary mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{level.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {level.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              </FormControl>
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
