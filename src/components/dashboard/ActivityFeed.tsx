import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Trophy, Target } from "lucide-react";

export const ActivityFeed = () => {
  const activities = [
    {
      id: 1,
      icon: CheckCircle2,
      title: "Completed Full Body Workout",
      time: "2 hours ago",
      type: "workout",
    },
    {
      id: 2,
      icon: Trophy,
      title: "Earned 'Week Warrior' Badge",
      time: "1 day ago",
      type: "achievement",
    },
    {
      id: 3,
      icon: Target,
      title: "Reached Weekly Goal",
      time: "2 days ago",
      type: "goal",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <activity.icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{activity.title}</p>
              <p className="text-xs text-muted-foreground">{activity.time}</p>
            </div>
            <Badge variant="secondary" className="text-xs">
              {activity.type}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
