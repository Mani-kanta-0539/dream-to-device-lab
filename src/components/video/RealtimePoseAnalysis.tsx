import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, CameraOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Load MediaPipe from CDN
declare global {
  interface Window {
    Pose: any;
    POSE_CONNECTIONS: any;
    drawConnectors: any;
    drawLandmarks: any;
  }
}

export const RealtimePoseAnalysis = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pushUpCount, setPushUpCount] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<'up' | 'down' | 'none'>('none');
  const [feedback, setFeedback] = useState<string>('');
  const { toast } = useToast();
  const poseRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const loadMediaPipeScripts = () => {
      return new Promise<void>((resolve, reject) => {
        if (window.Pose && window.drawConnectors && window.drawLandmarks) {
          resolve();
          return;
        }

        const poseScript = document.createElement('script');
        poseScript.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/pose.js';
        poseScript.crossOrigin = 'anonymous';
        
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
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.7,
        });

        pose.onResults((results: any) => {
          if (!canvasRef.current || !videoRef.current) return;
          
          const canvas = canvasRef.current;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;

          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (results.poseLandmarks) {
            // Draw pose connections
            window.drawConnectors(ctx, results.poseLandmarks, window.POSE_CONNECTIONS, {
              color: "#00FF00",
              lineWidth: 6,
            });

            window.drawLandmarks(ctx, results.poseLandmarks, {
              color: "#FF0000",
              lineWidth: 3,
              radius: 8,
            });

            // Analyze push-up
            analyzePushUp(results.poseLandmarks);
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

  const analyzePushUp = (landmarks: any[]) => {
    // Get key landmarks for push-up analysis
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftElbow = landmarks[13];
    const rightElbow = landmarks[14];
    const leftWrist = landmarks[15];
    const rightWrist = landmarks[16];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];

    // Calculate elbow angle (average of both arms)
    const leftElbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
    const rightElbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
    const avgElbowAngle = (leftElbowAngle + rightElbowAngle) / 2;

    // Calculate body alignment (shoulder to hip)
    const leftBodyAngle = calculateAngle(leftShoulder, leftHip, { x: leftHip.x, y: leftHip.y + 0.1, z: leftHip.z });
    const rightBodyAngle = calculateAngle(rightShoulder, rightHip, { x: rightHip.x, y: rightHip.y + 0.1, z: rightHip.z });
    const avgBodyAngle = (leftBodyAngle + rightBodyAngle) / 2;

    // Push-up detection logic
    let newFeedback = '';

    // Check body alignment
    if (avgBodyAngle < 160) {
      newFeedback = '⚠️ Keep your body straight! Don\'t let hips sag.';
    } else if (avgBodyAngle > 190) {
      newFeedback = '⚠️ Don\'t arch your back! Engage your core.';
    }

    // Detect push-up phases
    if (avgElbowAngle < 90 && currentPhase !== 'down') {
      setCurrentPhase('down');
      if (!newFeedback) newFeedback = '👇 Good! Now push up!';
    } else if (avgElbowAngle > 160 && currentPhase === 'down') {
      setCurrentPhase('up');
      setPushUpCount(prev => prev + 1);
      newFeedback = '✅ Push-up counted! Great form!';
    } else if (avgElbowAngle > 160 && currentPhase !== 'down') {
      setCurrentPhase('up');
      if (!newFeedback) newFeedback = '💪 Ready! Lower yourself down.';
    }

    // Check elbow position
    if (avgElbowAngle < 160 && avgElbowAngle > 90) {
      if (!newFeedback) newFeedback = '🔽 Lower down more for full range!';
    }

    setFeedback(newFeedback);
  };

  const calculateAngle = (a: any, b: any, c: any) => {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    
    if (angle > 180.0) {
      angle = 360 - angle;
    }
    
    return angle;
  };

  const processFrame = async () => {
    if (!videoRef.current || !poseRef.current || !isActive) return;

    const video = videoRef.current;
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      try {
        await poseRef.current.send({ image: video });
      } catch (error) {
        console.error("Error processing frame:", error);
      }
    }

    animationFrameRef.current = requestAnimationFrame(processFrame);
  };

  const startCamera = async () => {
    setIsLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;

        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            canvasRef.current.width = video.videoWidth;
            canvasRef.current.height = video.videoHeight;
            console.log('Video dimensions:', video.videoWidth, 'x', video.videoHeight);
            setIsActive(true);
            setIsLoading(false);
            processFrame();
          }
        };

        await videoRef.current.play();
      }

      toast({
        title: "Camera Started",
        description: "Position yourself in frame to start counting push-ups!",
      });
    } catch (error) {
      console.error("Error accessing camera:", error);
      setIsLoading(false);
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    setIsActive(false);
    setFeedback('');
  };

  const resetCount = () => {
    setPushUpCount(0);
    setCurrentPhase('none');
    setFeedback('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Real-Time Posture Analysis</h2>
          <p className="text-muted-foreground">Live push-up counter with form feedback</p>
        </div>
        <div className="flex gap-2">
          {!isActive ? (
            <Button onClick={startCamera} disabled={isLoading}>
              <Camera className="mr-2 h-4 w-4" />
              {isLoading ? 'Loading...' : 'Start Camera'}
            </Button>
          ) : (
            <Button onClick={stopCamera} variant="destructive">
              <CameraOff className="mr-2 h-4 w-4" />
              Stop Camera
            </Button>
          )}
          {isActive && (
            <Button onClick={resetCount} variant="outline">
              Reset Count
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
          <div className="relative aspect-video rounded-lg bg-black overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ transform: 'scaleX(-1)' }}
            />
            {!isActive && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <p className="text-white text-lg">Click "Start Camera" to begin</p>
              </div>
            )}
          </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Push-Up Count</CardTitle>
              <CardDescription>Completed repetitions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-6xl font-bold text-center text-primary">
                {pushUpCount}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Live Feedback</CardTitle>
              <CardDescription>Real-time form corrections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="min-h-[100px] flex items-center justify-center">
                {feedback ? (
                  <p className="text-lg text-center font-medium">{feedback}</p>
                ) : (
                  <p className="text-muted-foreground text-center">
                    Start doing push-ups to see feedback
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>• Position yourself so your full body is visible</p>
              <p>• Start in push-up position (arms extended)</p>
              <p>• Lower down until elbows reach 90°</p>
              <p>• Push back up to complete the rep</p>
              <p>• Keep your body straight throughout</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
