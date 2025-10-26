import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Flame, Heart } from "lucide-react";
import { Workout } from "@/types/workout";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface WorkoutCardProps {
  workout: Workout;
}

export const WorkoutCard = ({ workout }: WorkoutCardProps) => {
  const navigate = useNavigate();

  const difficultyColors = {
    beginner: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    intermediate: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    advanced: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <CardContent className="p-0">
        {/* Workout Image */}
        <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-accent/20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          <div className="absolute top-3 right-3 flex gap-2">
            <Badge className={cn("border", difficultyColors[workout.difficulty])}>
              {workout.difficulty}
            </Badge>
            <button className="h-8 w-8 rounded-full bg-background/80 hover:bg-background flex items-center justify-center transition-colors">
              <Heart className={cn("h-4 w-4", workout.isFavorite && "fill-red-500 text-red-500")} />
            </button>
          </div>
        </div>

        {/* Workout Info */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
              {workout.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {workout.description}
            </p>
          </div>

          {/* Workout Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {workout.duration} min
            </span>
            <span className="flex items-center gap-1">
              <Flame className="h-4 w-4" />
              {workout.caloriesBurned} cal
            </span>
          </div>

          {/* Tags */}
          {workout.tags && workout.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {workout.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <Button 
            className="w-full" 
            onClick={() => navigate(`/workout/${workout.id}`)}
          >
            Start Workout
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
