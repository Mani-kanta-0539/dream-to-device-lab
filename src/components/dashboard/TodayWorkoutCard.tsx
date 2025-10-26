import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const TodayWorkoutCard = () => {
  const navigate = useNavigate();

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Today's Workout
          <Badge variant="secondary">Recommended</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="aspect-video rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <Play className="h-12 w-12 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-2">Full Body Strength</h3>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" /> 45 min
            </span>
            <span className="flex items-center gap-1">
              <Flame className="h-4 w-4" /> 320 cal
            </span>
          </div>
        </div>
        <Button 
          className="w-full" 
          size="lg"
          onClick={() => navigate("/workout/today")}
        >
          <Play className="mr-2 h-4 w-4" /> Start Workout
        </Button>
      </CardContent>
    </Card>
  );
};
