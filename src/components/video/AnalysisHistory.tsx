import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const AnalysisHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: analyses, isLoading } = useQuery({
    queryKey: ["analysisHistory", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("video_analyses")
        .select("id, video_url, created_at, form_score, analysis_status")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!user,
  });

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
        {isLoading ? (
          <p>Loading history...</p>
        ) : !analyses || analyses.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center">
            No analyses found. Upload a video to get started!
          </p>
        ) : (
          analyses.map((analysis) => (
            <div
              key={analysis.id}
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Video className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {analysis.video_url.split("/").pop()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(analysis.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {analysis.analysis_status === "completed" && analysis.form_score && (
                  <span
                    className={`text-2xl font-bold ${getScoreColor(analysis.form_score)}`}
                  >
                    {analysis.form_score}
                  </span>
                )}
                {analysis.analysis_status === "processing" && (
                  <Badge variant="outline">Processing</Badge>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigate(`/analysis/${analysis.id}`)}
                  disabled={analysis.analysis_status !== "completed"}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
