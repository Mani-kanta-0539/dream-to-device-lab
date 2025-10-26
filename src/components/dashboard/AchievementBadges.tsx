import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Flame, Target, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const AchievementBadges = () => {
  const navigate = useNavigate();

  const badges = [
    { icon: Flame, label: "7 Day Streak", color: "text-orange-500" },
    { icon: Trophy, label: "First Win", color: "text-yellow-500" },
    { icon: Target, label: "Goal Crusher", color: "text-emerald-500" },
    { icon: Award, label: "Consistency", color: "text-blue-500" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Achievements
          <Button variant="ghost" size="sm" onClick={() => navigate("/achievements")}>
            View All
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-4 gap-3">
        {badges.map((badge) => (
          <div key={badge.label} className="flex flex-col items-center gap-2">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <badge.icon className={`h-6 w-6 ${badge.color}`} />
            </div>
            <span className="text-xs text-center text-muted-foreground">
              {badge.label}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
