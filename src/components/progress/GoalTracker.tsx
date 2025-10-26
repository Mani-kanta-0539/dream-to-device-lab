import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp } from "lucide-react";

interface Goal {
  id: string;
  title: string;
  current: number;
  target: number;
  unit: string;
  deadline: Date;
  status: "on-track" | "at-risk" | "completed";
}

export const GoalTracker = () => {
  const goals: Goal[] = [
    {
      id: "1",
      title: "Weight Loss",
      current: 73,
      target: 70,
      unit: "kg",
      deadline: new Date(Date.now() + 2592000000),
      status: "on-track",
    },
    {
      id: "2",
      title: "Weekly Workouts",
      current: 18,
      target: 20,
      unit: "sessions",
      deadline: new Date(Date.now() + 604800000),
      status: "on-track",
    },
    {
      id: "3",
      title: "Running Distance",
      current: 45,
      target: 50,
      unit: "km",
      deadline: new Date(Date.now() + 1209600000),
      status: "completed",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "on-track":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "at-risk":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "completed":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default:
        return "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Goal Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {goals.map((goal) => {
          const progress = (goal.current / goal.target) * 100;
          const remaining = goal.target - goal.current;

          return (
            <div key={goal.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{goal.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {goal.current} / {goal.target} {goal.unit}
                  </p>
                </div>
                <Badge className={getStatusColor(goal.status)}>
                  {goal.status === "completed" 
                    ? "Completed" 
                    : goal.status === "on-track"
                    ? "On Track"
                    : "At Risk"}
                </Badge>
              </div>
              <Progress value={Math.min(progress, 100)} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {remaining > 0 ? `${remaining} ${goal.unit} to go` : "Goal achieved!"}
                </span>
                <span>Due: {goal.deadline.toLocaleDateString()}</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
