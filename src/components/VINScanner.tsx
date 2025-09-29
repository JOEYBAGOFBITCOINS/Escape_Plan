import React, { useEffect, useRef, useState } from 'react';
import { X, Zap, ZapOff, RotateCcw, Camera, RefreshCw, Settings, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { GlassmorphicButton } from './GlassmorphicButton';

interface VINScannerProps {
  onCapture: (photoUrl: string) => void;
  onClose: () => void;
}

export function VINScanner({ onCapture, onClose }: VINScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [isScanning, setIsScanning] = useState(true);
  const [scanLinePosition, setScanLinePosition] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<'requesting' | 'granted' | 'denied' | 'error'>('requesting');

  useEffect(() => {
    // Check if we're in a secure context (HTTPS or localhost)
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname === '[::1]';
    
    if (!window.isSecureContext && !isLocalhost) {
      setCameraError('Camera requires a secure connection (HTTPS). Please use HTTPS or localhost.');
      setPermissionState('error');
      return;
    }

    startCamera();
    
    // Force landscape orientation hint (only if camera works)
    const orientationMessage = setTimeout(() => {
      if (permissionState === 'granted') {
        toast.info('📱 Turn your phone sideways for best results');
      }
    }, 2000);

    return () => {
      clearTimeout(orientationMessage);
      stopCamera();
    };
  }, []);

  // Watch for permission state changes
  useEffect(() => {
    if (permissionState === 'granted' && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [permissionState, stream]);

  // Animated scanning lines
  useEffect(() => {
    if (!isScanning) return;
    
    const animateScanning = () => {      
      setScanLinePosition(prev => {
        const newPos = prev + 2;
        return newPos > 100 ? -20 : newPos;
      });
    };

    const interval = setInterval(animateScanning, 50);
    return () => clearInterval(interval);
  }, [isScanning]);

  const startCamera = async () => {
    try {
      // First check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported on this device');
      }

      // Check camera permission
      if ('permissions' in navigator) {
        try {
          const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
          if (permission.state === 'denied') {
            setCameraError('Camera permission denied. Please enable camera access in your browser settings.');
            setPermissionState('denied');
            return;
          }
        } catch (permError) {
          console.warn('Permission query failed:', permError);
        }
      }

      // Try rear camera first, fallback to any camera
      let mediaStream: MediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        });
      } catch (backCameraError) {
        console.warn('Rear camera not available, trying any camera:', backCameraError);
        // Fallback to any available camera
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        });
        toast.info('Using front camera - rear camera not available');
      }
      
      setStream(mediaStream);
      setPermissionState('granted');
      setCameraError(null);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error: any) {
      console.error('Camera access failed:', error);
      
      let errorMessage = 'Failed to access camera';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied. Please allow camera access and try again.';
        setPermissionState('denied');
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera found on this device.';
        setPermissionState('error');
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Camera is already in use by another application.';
        setPermissionState('error');
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = 'Camera does not support the required settings.';
        setPermissionState('error');
      } else if (error.name === 'SecurityError') {
        errorMessage = 'Camera access blocked due to security restrictions.';
        setPermissionState('denied');
      }
      
      setCameraError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const toggleFlash = async () => {
    if (!stream) return;
    
    try {
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities();
      
      if (capabilities.torch) {
        await track.applyConstraints({
          advanced: [{ torch: !flashEnabled } as any]
        });
        setFlashEnabled(!flashEnabled);
      } else {
        toast.error('Flash not available on this device');
      }
    } catch (error) {
      console.error('Flash toggle failed:', error);
      toast.error('Failed to toggle flash');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    // Stop scanning animation immediately for feedback
    setIsScanning(false);

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current frame
    ctx.drawImage(video, 0, 0);
    
    // Show capture feedback with delay
    setTimeout(() => {
      toast.success('🚗 VIN captured! Processing...');
    }, 300);
    
    // Convert to blob and create URL
    canvas.toBlob((blob) => {
      if (blob) {
        const photoUrl = URL.createObjectURL(blob);
        // Add slight delay for better UX
        setTimeout(() => {
          onCapture(photoUrl);
        }, 800);
      }
    }, 'image/jpeg', 0.8);
  };

  const retryCamera = () => {
    setCameraError(null);
    setPermissionState('requesting');
    startCamera();
  };

  const openSettings = () => {
    toast.info('Go to browser settings → Privacy & Security → Camera → Allow access for this site');
  };

  // Render error state
  if (cameraError) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 z-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Close Button */}
          <div className="flex justify-end mb-4">
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Error Card */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              {permissionState === 'denied' ? (
                <Settings className="w-8 h-8 text-red-400" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-yellow-400" />
              )}
            </div>
            
            <h3 className="text-xl font-bold text-white mb-4">
              {permissionState === 'denied' ? 'Camera Permission Required' : 'Camera Error'}
            </h3>
            
            <p className="text-slate-300 mb-6 leading-relaxed">
              {cameraError}
            </p>

            <div className="space-y-3">
              {permissionState === 'denied' ? (
                <>
                  <GlassmorphicButton
                    variant="primary"
                    size="large"
                    className="w-full"
                    onClick={retryCamera}
                  >
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Try Again
                  </GlassmorphicButton>
                  
                  <GlassmorphicButton
                    variant="secondary"
                    size="large"
                    className="w-full"
                    onClick={openSettings}
                  >
                    <Settings className="w-5 h-5 mr-2" />
                    Open Settings Help
                  </GlassmorphicButton>
                </>
              ) : (
                <GlassmorphicButton
                  variant="primary"
                  size="large"
                  className="w-full"
                  onClick={retryCamera}
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Retry Camera
                </GlassmorphicButton>
              )}
            </div>

            {/* Manual VIN Option */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-slate-400 text-sm mb-3">Can't access camera?</p>
              <GlassmorphicButton
                variant="secondary"
                size="large"
                className="w-full"
                onClick={() => {
                  onClose();
                  toast.info('Use the manual VIN entry field below the scanner button');
                }}
              >
                Enter VIN Manually Instead
              </GlassmorphicButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render loading state
  if (permissionState === 'requesting') {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 z-50 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mx-auto mb-6"></div>
          <h3 className="text-xl font-bold mb-2">Requesting Camera Access</h3>
          <p className="text-slate-300">Please allow camera permissions when prompted</p>
          
          <button
            onClick={onClose}
            className="mt-6 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Force landscape hint overlay - show when height > width (portrait) */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-10 flex items-center justify-center portrait:flex landscape:hidden">
        <div className="text-center text-white p-8">
          <RotateCcw className="w-16 h-16 mx-auto mb-4 animate-pulse text-blue-400" />
          <h3 className="text-xl font-bold mb-2">Turn Phone Sideways</h3>
          <p className="text-slate-300">Rotate your device to landscape mode for better VIN scanning</p>
          <div className="mt-4 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-sm text-blue-200">
            📱 Landscape mode provides better VIN visibility
          </div>
        </div>
      </div>

      {/* Camera View */}
      <div className="relative w-full h-full overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        
        {/* Scanning Overlay */}
        <div className="absolute inset-0">
          {/* Corner Brackets - Top Left */}
          <div className="absolute top-8 left-8 w-16 h-16">
            <div className="absolute top-0 left-0 w-8 h-2 bg-white rounded-full shadow-lg"></div>
            <div className="absolute top-0 left-0 w-2 h-8 bg-white rounded-full shadow-lg"></div>
          </div>
          
          {/* Corner Brackets - Top Right */}
          <div className="absolute top-8 right-8 w-16 h-16">
            <div className="absolute top-0 right-0 w-8 h-2 bg-white rounded-full shadow-lg"></div>
            <div className="absolute top-0 right-0 w-2 h-8 bg-white rounded-full shadow-lg"></div>
          </div>
          
          {/* Corner Brackets - Bottom Left */}
          <div className="absolute bottom-8 left-8 w-16 h-16">
            <div className="absolute bottom-0 left-0 w-8 h-2 bg-white rounded-full shadow-lg"></div>
            <div className="absolute bottom-0 left-0 w-2 h-8 bg-white rounded-full shadow-lg"></div>
          </div>
          
          {/* Corner Brackets - Bottom Right */}
          <div className="absolute bottom-8 right-8 w-16 h-16">
            <div className="absolute bottom-0 right-0 w-8 h-2 bg-white rounded-full shadow-lg"></div>
            <div className="absolute bottom-0 right-0 w-2 h-8 bg-white rounded-full shadow-lg"></div>
          </div>

          {/* Scanning Frame */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-96 h-24 border-2 border-blue-400 rounded-lg bg-blue-400/10 backdrop-blur-sm shadow-lg shadow-blue-500/20">
              {/* VIN Text Hint */}
              <div className="absolute -top-8 left-0 right-0 text-center">
                <span className="text-white font-medium bg-black/60 px-4 py-1 rounded-full text-sm backdrop-blur-sm border border-white/20">
                  Position VIN in frame
                </span>
              </div>
              
              {/* Animated Scanning Lines - Multiple red lines sweeping */}
              {isScanning && (
                <>
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-red-500 to-transparent opacity-60"
                      style={{
                        left: `${((scanLinePosition + i * 8) % 120) - 10}%`,
                        animationDelay: `${i * 0.05}s`
                      }}
                    />
                  ))}
                  
                  {/* Main scanning beam */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-red-400 to-transparent shadow-lg shadow-red-500/50 opacity-90"
                    style={{
                      left: `${scanLinePosition}%`,
                      transition: 'left 0.05s linear'
                    }}
                  />
                  
                  {/* Secondary beam */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-orange-400 to-transparent opacity-70"
                    style={{
                      left: `${(scanLinePosition + 15) % 100}%`,
                      transition: 'left 0.05s linear'
                    }}
                  />
                </>
              )}
              
              {/* Corner indicators inside frame */}
              <div className="absolute top-1 left-1 w-4 h-4 border-l-2 border-t-2 border-blue-300 rounded-tl opacity-80"></div>
              <div className="absolute top-1 right-1 w-4 h-4 border-r-2 border-t-2 border-blue-300 rounded-tr opacity-80"></div>
              <div className="absolute bottom-1 left-1 w-4 h-4 border-l-2 border-b-2 border-blue-300 rounded-bl opacity-80"></div>
              <div className="absolute bottom-1 right-1 w-4 h-4 border-r-2 border-b-2 border-blue-300 rounded-br opacity-80"></div>
            </div>
          </div>

          {/* Status Text */}
          <div className="absolute bottom-32 left-0 right-0 text-center">
            {isScanning ? (
              <div className="text-white font-medium">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
                  <span>Scanning for VIN...</span>
                </div>
                <p className="text-slate-300 text-sm">Hold steady, looking for VIN number</p>
              </div>
            ) : (
              <div className="text-green-400 font-medium animate-pulse">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-ping mr-2"></div>
                  <span className="text-lg">✓ VIN Captured!</span>
                </div>
                <p className="text-green-300 text-sm">Processing vehicle data...</p>
              </div>
            )}
          </div>
        </div>

        {/* Side Controls */}
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex flex-col space-y-4">
          {/* Flash Toggle */}
          <button
            onClick={toggleFlash}
            className="w-12 h-12 bg-black/50 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all"
          >
            {flashEnabled ? (
              <Zap className="w-6 h-6 text-yellow-400" />
            ) : (
              <ZapOff className="w-6 h-6" />
            )}
          </button>

          {/* Auto barcode indicator */}
          <div className="px-3 py-1 bg-black/50 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-medium tracking-wide">auto barcode</span>
          </div>
        </div>

        {/* Top Controls */}
        <div className="absolute top-4 right-4 flex space-x-2">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-12 h-12 bg-black/50 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          {/* Capture Button */}
          <button
            onClick={capturePhoto}
            disabled={!isScanning}
            className="w-20 h-20 bg-white/20 backdrop-blur-sm border-4 border-white rounded-full flex items-center justify-center hover:bg-white/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <Camera className="w-8 h-8 text-gray-800" />
            </div>
          </button>
        </div>
      </div>

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}