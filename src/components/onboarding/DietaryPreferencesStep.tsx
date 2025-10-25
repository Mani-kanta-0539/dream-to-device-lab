import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { dietaryPreferencesSchema, DietaryPreferencesData } from "@/lib/validations/onboarding";
import { cn } from "@/lib/utils";

interface DietaryPreferencesStepProps {
  onNext: (data: DietaryPreferencesData) => void;
}

export const DietaryPreferencesStep = ({ onNext }: DietaryPreferencesStepProps) => {
  const form = useForm<DietaryPreferencesData>({
    resolver: zodResolver(dietaryPreferencesSchema),
    defaultValues: {
      dietType: "none",
      allergies: [],
    },
  });

  const dietTypes = [
    { value: "none", label: "No specific diet" },
    { value: "vegetarian", label: "Vegetarian" },
    { value: "vegan", label: "Vegan" },
    { value: "keto", label: "Ketogenic" },
    { value: "paleo", label: "Paleo" },
    { value: "other", label: "Other" },
  ];

  const commonAllergies = [
    { id: "dairy", label: "Dairy" },
    { id: "eggs", label: "Eggs" },
    { id: "nuts", label: "Nuts" },
    { id: "soy", label: "Soy" },
    { id: "gluten", label: "Gluten" },
    { id: "shellfish", label: "Shellfish" },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
        <FormField
          control={form.control}
          name="dietType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Diet Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                >
                  {dietTypes.map((diet) => (
                    <label
                      key={diet.value}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-primary/50",
                        field.value === diet.value
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      )}
                    >
                      <RadioGroupItem value={diet.value} />
                      <span className="font-medium">{diet.label}</span>
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
          name="allergies"
          render={() => (
            <FormItem>
              <FormLabel>Allergies & Food Sensitivities</FormLabel>
              <FormDescription>Select any that apply to you</FormDescription>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {commonAllergies.map((allergy) => (
                  <FormField
                    key={allergy.id}
                    control={form.control}
                    name="allergies"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <label
                            className={cn(
                              "flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all hover:border-primary/50",
                              field.value?.includes(allergy.id)
                                ? "border-primary bg-primary/5"
                                : "border-border"
                            )}
                          >
                            <Checkbox
                              checked={field.value?.includes(allergy.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, allergy.id])
                                  : field.onChange(
                                      field.value?.filter((value) => value !== allergy.id)
                                    );
                              }}
                            />
                            <span className="text-sm font-medium">{allergy.label}</span>
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
          name="restrictions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Dietary Restrictions (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any other dietary restrictions or preferences..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Complete Setup
        </Button>
      </form>
    </Form>
  );
};
