import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface FeedbackItem {
  category: string;
  score: number;
  status: "excellent" | "good" | "needs-improvement";
  comments: string;
}

const AnalysisResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: analysis, isLoading } = useQuery({
    queryKey: ["analysisResult", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("video_analyses")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!id,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "text-emerald-500";
      case "good":
        return "text-orange-500";
      case "needs-improvement":
        return "text-red-500";
      default:
        return "text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "excellent":
        return <CheckCircle2 className="h-5 w-5" />;
      case "good":
        return <AlertCircle className="h-5 w-5" />;
      case "needs-improvement":
        return <XCircle className="h-5 w-5" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/video-analysis")}
          className="mb-4"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Video Analysis
        </Button>

        {isLoading ? (
          <p>Loading analysis results...</p>
        ) : !analysis ? (
          <p>Analysis not found.</p>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Analysis Results</h1>
                <p className="text-muted-foreground">
                  {analysis.video_url.split("/").pop()}
                </p>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-primary mb-1">
                  {analysis.form_score}
                </div>
                <p className="text-sm text-muted-foreground">Overall Score</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Video Player */}
                <Card>
                  <CardContent className="p-6">
                    <div className="aspect-video rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
                      <video src={analysis.video_url} controls className="w-full h-full rounded-lg" />
                    </div>
                  </CardContent>
                </Card>

                {/* Detailed Feedback */}
                <Card>
                  <CardHeader>
                    <CardTitle>Detailed Feedback</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {analysis.feedback.map((item: FeedbackItem, index: number) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={getStatusColor(item.status)}>
                              {getStatusIcon(item.status)}
                            </span>
                            <h3 className="font-semibold">{item.category}</h3>
                          </div>
                          <span className="text-2xl font-bold">{item.score}</span>
                        </div>
                        <Progress value={item.score} className="h-2" />
                        <p className="text-sm text-muted-foreground">{item.comments}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Improvement Suggestions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Improvement Suggestions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {analysis.improvement_suggestions.map((suggestion: string, index: number) => (
                      <div key={index} className="flex gap-2">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </span>
                        <p className="text-sm">{suggestion}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

              {/* Actions */}
              <Card>
                <CardContent className="p-4 space-y-2">
                  <Button className="w-full">Schedule Follow-up</Button>
                  <Button variant="outline" className="w-full">
                    Save to Favorites
                  </Button>
                  <Button variant="outline" className="w-full">
                    Share Results
                  </Button>
                </CardContent>
              </Card>
            </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisResults;
