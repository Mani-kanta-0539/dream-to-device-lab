import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Minus, Plus, RotateCcw } from "lucide-react";

interface RepCounterProps {
  targetReps: number;
  onComplete?: () => void;
}

export const RepCounter = ({ targetReps, onComplete }: RepCounterProps) => {
  const [reps, setReps] = useState(0);

  const handleIncrement = () => {
    const newReps = reps + 1;
    setReps(newReps);
    if (newReps >= targetReps) {
      onComplete?.();
    }
  };

  const handleDecrement = () => {
    setReps(Math.max(0, reps - 1));
  };

  const handleReset = () => {
    setReps(0);
  };

  const progress = (reps / targetReps) * 100;

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="text-center">
          <div className="text-5xl font-bold mb-2">
            {reps} <span className="text-2xl text-muted-foreground">/ {targetReps}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        <div className="flex justify-center gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={handleDecrement}
            disabled={reps === 0}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            size="lg"
            className="px-8"
            onClick={handleIncrement}
          >
            <Plus className="mr-2 h-4 w-4" />
            Count Rep
          </Button>
          <Button size="icon" variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
