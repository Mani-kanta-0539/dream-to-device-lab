import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, Apple, Video, TrendingUp } from "lucide-react";

interface QuickActionsProps {
  onActionClick: (action: string) => void;
}

export const QuickActions = ({ onActionClick }: QuickActionsProps) => {
  const actions = [
    {
      icon: Dumbbell,
      label: "Exercise Tips",
      prompt: "Can you give me tips for better push-up form?",
    },
    {
      icon: Apple,
      label: "Nutrition Advice",
      prompt: "What should I eat before a workout?",
    },
    {
      icon: Video,
      label: "Form Check",
      prompt: "How can I improve my squat technique?",
    },
    {
      icon: TrendingUp,
      label: "Progress Review",
      prompt: "Can you review my progress this week?",
    },
  ];

  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm font-medium mb-3">Quick Questions</p>
        <div className="grid grid-cols-2 gap-2">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              className="h-auto py-3 flex-col gap-2 text-xs"
              onClick={() => onActionClick(action.prompt)}
            >
              <action.icon className="h-4 w-4" />
              {action.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
