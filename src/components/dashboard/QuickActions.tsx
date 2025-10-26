import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Dumbbell, Apple, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    { icon: Dumbbell, label: "Browse Workouts", path: "/workouts" },
    { icon: Video, label: "Upload Video", path: "/video-analysis" },
    { icon: Apple, label: "Meal Plan", path: "/nutrition" },
    { icon: TrendingUp, label: "View Progress", path: "/progress" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            className="h-auto py-4 flex-col gap-2"
            onClick={() => navigate(action.path)}
          >
            <action.icon className="h-5 w-5" />
            <span className="text-xs">{action.label}</span>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};
