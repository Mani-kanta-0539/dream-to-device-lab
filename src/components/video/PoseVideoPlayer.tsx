import { useEffect, useRef, useState } from "react";
import { Pose, POSE_CONNECTIONS } from "@mediapipe/pose";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";

interface PoseVideoPlayerProps {
  videoUrl: string;
}

export const PoseVideoPlayer = ({ videoUrl }: PoseVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPoseEnabled, setIsPoseEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const poseRef = useRef<Pose | null>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const initializePose = async () => {
      const pose = new Pose({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        },
      });

      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      pose.onResults((results) => {
        if (!canvasRef.current || !videoRef.current) return;
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Set canvas size to match video
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (results.poseLandmarks && isPoseEnabled) {
          // Draw pose connections (skeleton lines)
          drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, {
            color: "#00FF00",
            lineWidth: 4,
          });

          // Draw pose landmarks (joints)
          drawLandmarks(ctx, results.poseLandmarks, {
            color: "#FF0000",
            lineWidth: 2,
            radius: 6,
          });
        }
      });

      poseRef.current = pose;
      setIsLoading(false);
    };

    initializePose();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (poseRef.current) {
        poseRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    const processFrame = async () => {
      if (!videoRef.current || !poseRef.current || !isPlaying || !isPoseEnabled) return;

      const video = videoRef.current;
      if (video.paused || video.ended) return;

      try {
        await poseRef.current.send({ image: video });
      } catch (error) {
        console.error("Error processing frame:", error);
      }

      animationFrameRef.current = requestAnimationFrame(processFrame);
    };

    if (isPlaying && isPoseEnabled) {
      processFrame();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, isPoseEnabled]);

  const handlePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    if (!isPlaying) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div className="space-y-4">
      <div className="relative aspect-video rounded-lg bg-black overflow-hidden">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain"
          onEnded={handleVideoEnded}
          onLoadedData={() => setIsLoading(false)}
          playsInline
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{ objectFit: "contain" }}
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <p className="text-white">Loading pose detection...</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePlayPause}
            disabled={isLoading}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRestart}
            disabled={isLoading}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <Button
          variant={isPoseEnabled ? "default" : "outline"}
          onClick={() => setIsPoseEnabled(!isPoseEnabled)}
          disabled={isLoading}
        >
          {isPoseEnabled ? "Hide" : "Show"} Pose Lines
        </Button>
      </div>

      <div className="text-sm text-muted-foreground">
        <p>• Green lines show body connections (skeleton)</p>
        <p>• Red dots show joint positions</p>
        <p>• Toggle pose visualization using the button above</p>
      </div>
    </div>
  );
};
