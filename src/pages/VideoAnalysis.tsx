import { useState } from "react";
import { VideoUpload } from "@/components/video/VideoUpload";
import { AnalysisHistory } from "@/components/video/AnalysisHistory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const VideoAnalysis = () => {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleUpload = (file: File) => {
    setIsAnalyzing(true);
    
    // Simulate analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      toast({
        title: "Analysis Complete!",
        description: "Your workout video has been analyzed successfully.",
      });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2">Video Analysis</h1>
            <p className="text-muted-foreground">
              Upload your workout videos to get AI-powered form feedback
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <VideoUpload onUpload={handleUpload} />

              {/* Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-primary" />
                    How It Works
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">1. Upload Your Video</h3>
                    <p className="text-sm text-muted-foreground">
                      Record your workout and upload the video. Make sure your full body is visible.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">2. AI Analysis</h3>
                    <p className="text-sm text-muted-foreground">
                      Our AI analyzes your form, posture, and technique in real-time.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">3. Get Feedback</h3>
                    <p className="text-sm text-muted-foreground">
                      Receive detailed feedback with specific improvement suggestions.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div>
              <AnalysisHistory />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoAnalysis;
