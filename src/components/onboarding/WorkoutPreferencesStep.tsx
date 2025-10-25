import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dumbbell, Bike, Waves, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { workoutPreferencesSchema, WorkoutPreferencesData } from "@/lib/validations/onboarding";
import { cn } from "@/lib/utils";

interface WorkoutPreferencesStepProps {
  onNext: (data: WorkoutPreferencesData) => void;
}

export const WorkoutPreferencesStep = ({ onNext }: WorkoutPreferencesStepProps) => {
  const form = useForm<WorkoutPreferencesData>({
    resolver: zodResolver(workoutPreferencesSchema),
    defaultValues: {
      workoutTypes: [],
      equipment: [],
    },
  });

  const workoutTypes = [
    { id: "strength", icon: Dumbbell, label: "Strength Training" },
    { id: "cardio", icon: Heart, label: "Cardio" },
    { id: "yoga", icon: Waves, label: "Yoga & Flexibility" },
    { id: "hiit", icon: Bike, label: "HIIT" },
  ];

  const equipment = [
    { id: "dumbbells", label: "Dumbbells" },
    { id: "barbell", label: "Barbell" },
    { id: "resistance-bands", label: "Resistance Bands" },
    { id: "kettlebell", label: "Kettlebell" },
    { id: "pull-up-bar", label: "Pull-up Bar" },
    { id: "none", label: "No Equipment" },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
        <FormField
          control={form.control}
          name="workoutTypes"
          render={() => (
            <FormItem>
              <FormLabel>Preferred Workout Types</FormLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {workoutTypes.map((type) => (
                  <FormField
                    key={type.id}
                    control={form.control}
                    name="workoutTypes"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <label
                            className={cn(
                              "flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-primary/50",
                              field.value?.includes(type.id)
                                ? "border-primary bg-primary/5"
                                : "border-border"
                            )}
                          >
                            <Checkbox
                              checked={field.value?.includes(type.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, type.id])
                                  : field.onChange(
                                      field.value?.filter((value) => value !== type.id)
                                    );
                              }}
                            />
                            <type.icon className="h-5 w-5 text-primary" />
                            <span className="font-medium">{type.label}</span>
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
        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferred Workout Duration</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="grid grid-cols-2 sm:grid-cols-4 gap-4"
                >
                  {["15", "30", "45", "60"].map((duration) => (
                    <label
                      key={duration}
                      className={cn(
                        "flex items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-primary/50",
                        field.value === duration
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      )}
                    >
                      <RadioGroupItem value={duration} className="sr-only" />
                      <span className="font-medium">{duration} min</span>
                    </label>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="equipment"
          render={() => (
            <FormItem>
              <FormLabel>Available Equipment</FormLabel>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {equipment.map((item) => (
                  <FormField
                    key={item.id}
                    control={form.control}
                    name="equipment"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <label
                            className={cn(
                              "flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all hover:border-primary/50",
                              field.value?.includes(item.id)
                                ? "border-primary bg-primary/5"
                                : "border-border"
                            )}
                          >
                            <Checkbox
                              checked={field.value?.includes(item.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, item.id])
                                  : field.onChange(
                                      field.value?.filter((value) => value !== item.id)
                                    );
                              }}
                            />
                            <span className="text-sm font-medium">{item.label}</span>
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
