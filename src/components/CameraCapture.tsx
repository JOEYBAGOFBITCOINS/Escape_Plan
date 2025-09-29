import React, { useRef, useEffect, useState } from 'react';
import { X, Camera, RotateCcw, FlashlightIcon as Flashlight } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner@2.0.3';

interface CameraCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (photoDataUrl: string) => void;
  title: string;
  subtitle?: string;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  isOpen,
  onClose,
  onCapture,
  title,
  subtitle
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [isReady, setIsReady] = useState(false);
  const [hasFlashlight, setHasFlashlight] = useState(false);
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const startCamera = async () => {
    try {
      setError('');
      setIsReady(false);

      // Check for HTTPS (required for camera access)
      if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        setError('Camera access requires HTTPS. Please use a secure connection.');
        return;
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Camera not supported in this browser');
        return;
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode,
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 }
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
        setIsReady(true);

        // Check for flashlight capability
        const track = mediaStream.getVideoTracks()[0];
        const capabilities = track.getCapabilities();
        if (capabilities.torch) {
          setHasFlashlight(true);
        }
      }
    } catch (err: any) {
      console.error('Camera error:', err);
      
      if (err.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access and try again.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found on this device.');
      } else if (err.name === 'NotSupportedError') {
        setError('Camera access is not supported in this browser.');
      } else if (err.name === 'OverconstrainedError') {
        setError('Camera constraints could not be satisfied. Try switching camera.');
      } else {
        setError('Unable to access camera. Please check your browser settings.');
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsReady(false);
    setFlashlightOn(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !isReady) {
      toast.error('Camera not ready. Please wait.');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      toast.error('Unable to capture photo. Please try again.');
      return;
    }

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64 with good quality
    const photoDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    
    onCapture(photoDataUrl);
    onClose();
  };

  const toggleFlashlight = async () => {
    if (stream && hasFlashlight) {
      const track = stream.getVideoTracks()[0];
      try {
        await track.applyConstraints({
          advanced: [{ torch: !flashlightOn }]
        });
        setFlashlightOn(!flashlightOn);
      } catch (err) {
        console.error('Flashlight toggle error:', err);
        toast.error('Unable to toggle flashlight');
      }
    }
  };

  const switchCamera = () => {
    setFacingMode(current => current === 'environment' ? 'user' : 'environment');
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setError('');
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Video */}
      {!error && (
        <>
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />
          <canvas ref={canvasRef} className="hidden" />
        </>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-b from-black/80 to-transparent p-4 flex items-center justify-between">
          <div>
            <h2 className="text-white text-lg font-medium">{title}</h2>
            {subtitle && (
              <p className="text-slate-300 text-sm">{subtitle}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/10 rounded-full"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Center - Camera View or Error */}
        <div className="flex-1 flex items-center justify-center p-4">
          {error ? (
            <div className="text-center max-w-md">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-10 h-10 text-red-400" />
              </div>
              <h3 className="text-white text-xl mb-2">Camera Error</h3>
              <p className="text-slate-300 text-sm mb-4">{error}</p>
              <Button
                onClick={startCamera}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Camera className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          ) : !isReady ? (
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white">Initializing camera...</p>
            </div>
          ) : null}
        </div>

        {/* Bottom Controls */}
        {!error && isReady && (
          <div className="bg-gradient-to-t from-black/80 to-transparent p-6">
            <div className="flex items-center justify-center space-x-8">
              {/* Switch Camera */}
              <Button
                variant="ghost"
                size="icon"
                onClick={switchCamera}
                className="text-white hover:bg-white/10 rounded-full w-12 h-12"
                title="Switch camera"
              >
                <RotateCcw className="w-6 h-6" />
              </Button>

              {/* Capture Button */}
              <button
                onClick={capturePhoto}
                className="w-20 h-20 bg-white rounded-full border-4 border-blue-500/50 hover:border-blue-400 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl"
                title="Capture photo"
              >
                <Camera className="w-8 h-8 text-gray-800" />
              </button>

              {/* Flashlight */}
              {hasFlashlight ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleFlashlight}
                  className={`text-white hover:bg-white/10 rounded-full w-12 h-12 ${
                    flashlightOn ? 'bg-yellow-500/20 text-yellow-400' : ''
                  }`}
                  title="Toggle flashlight"
                >
                  <Flashlight className="w-6 h-6" />
                </Button>
              ) : (
                <div className="w-12 h-12" /> // Placeholder for spacing
              )}
            </div>

            <div className="text-center mt-4">
              <p className="text-slate-300 text-sm">
                Tap the camera button to capture photo
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};