import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";

// Load MediaPipe from CDN
declare global {
  interface Window {
    Pose: any;
    POSE_CONNECTIONS: any;
    drawConnectors: any;
    drawLandmarks: any;
  }
}

interface PoseVideoPlayerProps {
  videoUrl: string;
}

export const PoseVideoPlayer = ({ videoUrl }: PoseVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPoseEnabled, setIsPoseEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [videoReady, setVideoReady] = useState(false);
  const poseRef = useRef<any>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const loadMediaPipeScripts = () => {
      return new Promise<void>((resolve, reject) => {
        // Check if already loaded
        if (window.Pose && window.drawConnectors && window.drawLandmarks) {
          resolve();
          return;
        }

        // Load pose script
        const poseScript = document.createElement('script');
        poseScript.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/pose.js';
        poseScript.crossOrigin = 'anonymous';
        
        // Load drawing utils script
        const drawingScript = document.createElement('script');
        drawingScript.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils@0.3.1675466124/drawing_utils.js';
        drawingScript.crossOrigin = 'anonymous';

        let scriptsLoaded = 0;
        const onScriptLoad = () => {
          scriptsLoaded++;
          if (scriptsLoaded === 2) {
            resolve();
          }
        };

        poseScript.onload = onScriptLoad;
        drawingScript.onload = onScriptLoad;
        poseScript.onerror = reject;
        drawingScript.onerror = reject;

        document.head.appendChild(poseScript);
        document.head.appendChild(drawingScript);
      });
    };

    const initializePose = async () => {
      try {
        // Load MediaPipe scripts first
        await loadMediaPipeScripts();

        const pose = new window.Pose({
          locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`;
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

        pose.onResults((results: any) => {
          if (!canvasRef.current || !videoRef.current) return;
          
          const canvas = canvasRef.current;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;

          // Clear canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (results.poseLandmarks && isPoseEnabled) {
            // Draw pose connections (skeleton lines)
            window.drawConnectors(ctx, results.poseLandmarks, window.POSE_CONNECTIONS, {
              color: "#00FF00",
              lineWidth: 4,
            });

            // Draw pose landmarks (joints)
            window.drawLandmarks(ctx, results.poseLandmarks, {
              color: "#FF0000",
              lineWidth: 2,
              radius: 6,
            });
          }
        });

        poseRef.current = pose;
        setIsLoading(false);
      } catch (error) {
        console.error("Error initializing MediaPipe Pose:", error);
        setIsLoading(false);
      }
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
      if (!videoRef.current || !poseRef.current || !isPlaying || !isPoseEnabled || !videoReady) return;

      const video = videoRef.current;
      if (video.paused || video.ended || video.videoWidth === 0 || video.videoHeight === 0) return;

      try {
        await poseRef.current.send({ image: video });
      } catch (error) {
        console.error("Error processing frame:", error);
      }

      animationFrameRef.current = requestAnimationFrame(processFrame);
    };

    if (isPlaying && isPoseEnabled && videoReady) {
      processFrame();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, isPoseEnabled, videoReady]);

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

  const handleVideoLoadedMetadata = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas size to match video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    setVideoReady(true);
    setIsLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="relative aspect-video rounded-lg bg-black overflow-hidden">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain"
          onEnded={handleVideoEnded}
          onLoadedMetadata={handleVideoLoadedMetadata}
          playsInline
          crossOrigin="anonymous"
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
          style={{ 
            width: '100%', 
            height: '100%',
            objectFit: 'contain'
          }}
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
