import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Analysis {
  id: string;
  videoName: string;
  date: Date;
  score: number;
  status: "completed" | "processing" | "failed";
}

export const AnalysisHistory = () => {
  const navigate = useNavigate();

  const mockAnalyses: Analysis[] = [
    {
      id: "1",
      videoName: "Morning Workout Session.mp4",
      date: new Date(Date.now() - 86400000),
      score: 87,
      status: "completed",
    },
    {
      id: "2",
      videoName: "Leg Day Training.mp4",
      date: new Date(Date.now() - 172800000),
      score: 92,
      status: "completed",
    },
    {
      id: "3",
      videoName: "Upper Body Strength.mp4",
      date: new Date(Date.now() - 259200000),
      score: 78,
      status: "completed",
    },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-500";
    if (score >= 70) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analysis History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {mockAnalyses.map((analysis) => (
          <div
            key={analysis.id}
            className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
          >
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Video className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{analysis.videoName}</p>
              <p className="text-xs text-muted-foreground">
                {analysis.date.toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {analysis.status === "completed" && (
                <span className={`text-2xl font-bold ${getScoreColor(analysis.score)}`}>
                  {analysis.score}
                </span>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigate(`/analysis/${analysis.id}`)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
