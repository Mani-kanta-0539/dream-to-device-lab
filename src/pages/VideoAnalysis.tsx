import { useState } from "react";
import { VideoUpload } from "@/components/video/VideoUpload";
import { AnalysisHistory } from "@/components/video/AnalysisHistory";
import { RealtimePoseAnalysis } from "@/components/video/RealtimePoseAnalysis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const VideoAnalysis = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleUpload = async (file: File) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to analyze videos.",
        variant: "destructive"
      });
      return;
    }

    // Check file size (limit to 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Please upload a video smaller than 50MB. Try compressing your video or recording a shorter clip.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      console.log('Starting video upload...');
      
      // Upload video to storage - organize by user ID
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('analysis-videos')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }
      
      console.log('Video uploaded successfully:', filePath);

      // Get public URL since bucket is now public
      const { data: { publicUrl } } = supabase.storage
        .from('analysis-videos')
        .getPublicUrl(filePath);

      // Create video analysis record
      console.log('Creating analysis record...');
      const { data: analysisRecord, error: recordError } = await supabase
        .from('video_analyses')
        .insert({
          user_id: user.id,
          video_url: publicUrl,
          analysis_status: 'processing'
        })
        .select()
        .single();

      if (recordError) {
        console.error('Record creation error:', recordError);
        throw recordError;
      }
      
      console.log('Analysis record created:', analysisRecord.id);

      // Call AI analysis function with public URL
      console.log('Calling analyze-video function...');
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-video', {
        body: { 
          videoUrl: publicUrl,
          exerciseType: 'general' 
        }
      });

      if (analysisError) {
        console.error('Analysis function error:', analysisError);
        throw analysisError;
      }
      
      console.log('Analysis completed:', analysisData);

      // Update analysis record with results
      console.log('Updating analysis record with results...');
      const { error: updateError } = await supabase
        .from('video_analyses')
        .update({
          analysis_status: 'completed',
          analysis_results: analysisData.analysis,
          form_score: analysisData.analysis.formScore,
          feedback: analysisData.analysis.feedback,
          improvement_suggestions: analysisData.analysis.improvementSuggestions
        })
        .eq('id', analysisRecord.id);
      
      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

      toast({
        title: "Analysis Complete!",
        description: "Your workout video has been analyzed successfully.",
      });

      // Navigate to results
      navigate(`/analysis/${analysisRecord.id}`);

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to analyze video. Please try again.";
      
      // Handle specific error codes
      if (error instanceof Error) {
        if (error.message.includes('429') || error.message.includes('Rate limit')) {
          toast({
            title: "Rate Limit Exceeded",
            description: "Too many requests. Please wait a moment and try again.",
            variant: "destructive"
          });
        } else if (error.message.includes('402') || error.message.includes('Payment required')) {
          toast({
            title: "Credits Required",
            description: "Please add credits to your workspace to continue using AI features.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Analysis Failed",
            description: errorMessage,
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Analysis Failed",
          description: "Failed to analyze video. Please try again.",
          variant: "destructive"
        });
      }
      
      if (import.meta.env.DEV) {
        console.error('Error analyzing video:', error);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2">Video Analysis</h1>
            <p className="text-muted-foreground">
              Upload workout videos or analyze your form in real-time
            </p>
          </div>

          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="upload">Upload Video</TabsTrigger>
              <TabsTrigger value="realtime">Real-Time Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="mt-6">
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
            </TabsContent>

            <TabsContent value="realtime" className="mt-6">
              <RealtimePoseAnalysis />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default VideoAnalysis;
