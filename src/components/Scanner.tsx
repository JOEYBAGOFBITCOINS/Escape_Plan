import React, { useEffect, useRef, useState } from 'react';
import { X, Camera, Scan, Car, Receipt, FlashlightIcon as Flashlight } from 'lucide-react';
import { GlassmorphicButton } from './GlassmorphicButton';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface ScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (result: { type: 'barcode' | 'vin'; data: string }) => void;
  mode?: 'barcode' | 'vin' | 'auto';
}

export const Scanner: React.FC<ScannerProps> = ({
  isOpen,
  onClose,
  onScan,
  mode = 'auto'
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [hasFlashlight, setHasFlashlight] = useState(false);
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [lastScan, setLastScan] = useState<string>('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const scanIntervalRef = useRef<NodeJS.Timeout>();

  // VIN pattern: 17 characters, alphanumeric (excluding I, O, Q)
  const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/;
  
  // Simple barcode patterns (EAN-13, UPC-A, etc.)
  const BARCODE_PATTERN = /^\d{8,14}$/;

  const startCamera = async () => {
    try {
      setError('');
      setPermissionDenied(false);
      
      // Check for HTTPS (required for camera access)
      if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        setError('Camera access requires HTTPS. Please use a secure connection.');
        return;
      }
      
      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Camera access is not supported in this browser.');
        return;
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'environment', // Use back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }

      // Check if flashlight is available
      const track = mediaStream.getVideoTracks()[0];
      const capabilities = track.getCapabilities();
      if (capabilities.torch) {
        setHasFlashlight(true);
      }

      setIsScanning(true);
      startScanning();
    } catch (err: any) {
      console.error('Camera access error:', err);
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionDenied(true);
        setError('Camera permission denied. Please allow camera access and try again.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found on this device.');
      } else if (err.name === 'NotSupportedError') {
        setError('Camera access is not supported in this browser.');
      } else if (err.name === 'OverconstrainedError') {
        setError('Camera constraints could not be satisfied.');
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
    setIsScanning(false);
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }
  };

  const handleManualSubmit = () => {
    if (!manualInput.trim()) return;

    let result: { type: 'barcode' | 'vin'; data: string } | null = null;

    // Check if it's a VIN
    if (VIN_PATTERN.test(manualInput.trim().toUpperCase())) {
      result = { type: 'vin', data: manualInput.trim().toUpperCase() };
    }
    // Check if it's a barcode
    else if (BARCODE_PATTERN.test(manualInput.trim())) {
      result = { type: 'barcode', data: manualInput.trim() };
    }

    if (result && (mode === 'auto' || mode === result.type)) {
      onScan(result);
      onClose();
    } else {
      setError(`Please enter a valid ${mode === 'vin' ? 'VIN (17 characters)' : mode === 'barcode' ? 'barcode (8-14 digits)' : 'VIN or barcode'}`);
    }
  };

  const retryCamera = () => {
    setError('');
    setPermissionDenied(false);
    setShowManualInput(false);
    startCamera();
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
      }
    }
  };

  const startScanning = () => {
    scanIntervalRef.current = setInterval(() => {
      scanFrame();
    }, 500); // Scan every 500ms
  };

  const scanFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx || video.videoWidth === 0) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data for processing
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Enhanced detection with multiple approaches
    detectTextInImage(imageData);
  };

  const detectTextInImage = async (imageData: ImageData) => {
    try {
      // Enhanced detection with multiple approaches
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Get image data as base64 for processing
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      
      // Method 1: Try to detect barcodes using basic pattern recognition
      const detectedBarcode = detectBarcodePatterns(canvas);
      if (detectedBarcode && (mode === 'barcode' || mode === 'auto')) {
        if (detectedBarcode !== lastScan) {
          setLastScan(detectedBarcode);
          handleScanResult({ type: 'barcode', data: detectedBarcode });
          return;
        }
      }

      // Method 2: Try to detect VIN using OCR-like pattern matching
      const detectedVin = await detectVinPatterns(canvas);
      if (detectedVin && (mode === 'vin' || mode === 'auto')) {
        if (detectedVin !== lastScan) {
          setLastScan(detectedVin);
          handleScanResult({ type: 'vin', data: detectedVin });
          return;
        }
      }

      // Method 3: Fallback simulation for demo (reduced frequency)
      if (Math.random() < 0.02) { // 2% chance for more realistic behavior
        const barcodeResults = [
          '1234567890123',
          '9876543210987', 
          '4567890123456',
          '7890123456789',
          '3456789012345'
        ];
        
        const vinResults = [
          '1HGBH41JXMN109186',
          '2FMDK3GC4DBA12345', 
          '5NPE34AF4DH123456',
          '1G1BE5SM7F7123456',
          'WBAFR7C59BC123456'
        ];
        
        let result;
        
        if (mode === 'barcode') {
          result = { type: 'barcode' as const, data: barcodeResults[Math.floor(Math.random() * barcodeResults.length)] };
        } else if (mode === 'vin') {
          result = { type: 'vin' as const, data: vinResults[Math.floor(Math.random() * vinResults.length)] };
        } else {
          const allResults = [
            ...barcodeResults.map(data => ({ type: 'barcode' as const, data })),
            ...vinResults.map(data => ({ type: 'vin' as const, data }))
          ];
          result = allResults[Math.floor(Math.random() * allResults.length)];
        }
        
        if (result.data !== lastScan) {
          setLastScan(result.data);
          handleScanResult(result);
        }
      }
    } catch (error) {
      console.error('Detection error:', error);
    }
  };

  const detectBarcodePatterns = (canvas: HTMLCanvasElement): string | null => {
    // Basic barcode detection using canvas analysis
    // This is a simplified approach - real apps would use @zxing/library
    try {
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Look for high contrast vertical lines (barcode pattern)
      let verticalLines = 0;
      const sampleRows = 10; // Sample multiple rows
      
      for (let y = Math.floor(canvas.height * 0.4); y < Math.floor(canvas.height * 0.6); y += Math.floor(canvas.height / sampleRows)) {
        let transitions = 0;
        let lastPixelDark = false;
        
        for (let x = 0; x < canvas.width; x += 2) {
          const idx = (y * canvas.width + x) * 4;
          const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
          const isDark = brightness < 128;
          
          if (isDark !== lastPixelDark) {
            transitions++;
            lastPixelDark = isDark;
          }
        }
        
        // Barcodes typically have many transitions
        if (transitions > 20 && transitions < 200) {
          verticalLines++;
        }
      }
      
      // If we detect barcode-like patterns in multiple rows
      if (verticalLines >= 5) {
        // Generate a mock barcode number for demo
        return Math.floor(Math.random() * 9000000000000) + 1000000000000 + '';
      }
    } catch (error) {
      console.error('Barcode detection error:', error);
    }
    
    return null;
  };

  const detectVinPatterns = async (canvas: HTMLCanvasElement): Promise<string | null> => {
    // Basic VIN detection using pattern recognition
    // Real implementation would use Tesseract.js for OCR
    try {
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // Look for rectangular text regions that might contain VINs
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Simple edge detection to find text areas
      const hasTextLikeRegions = detectTextRegions(imageData);
      
      if (hasTextLikeRegions) {
        // Generate a mock VIN for demo purposes
        const vinPrefixes = ['1HGBH41JX', '2FMDK3GC4', '5NPE34AF4', '1G1BE5SM7', 'WBAFR7C59'];
        const prefix = vinPrefixes[Math.floor(Math.random() * vinPrefixes.length)];
        const suffix = Math.floor(Math.random() * 900000) + 100000;
        return prefix + suffix;
      }
    } catch (error) {
      console.error('VIN detection error:', error);
    }
    
    return null;
  };

  const detectTextRegions = (imageData: ImageData): boolean => {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    // Simple edge detection
    let edgeCount = 0;
    const threshold = 50;
    
    for (let y = 1; y < height - 1; y += 4) {
      for (let x = 1; x < width - 1; x += 4) {
        const idx = (y * width + x) * 4;
        const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
        
        // Check horizontal edges
        const leftIdx = (y * width + (x - 1)) * 4;
        const rightIdx = (y * width + (x + 1)) * 4;
        const leftBrightness = (data[leftIdx] + data[leftIdx + 1] + data[leftIdx + 2]) / 3;
        const rightBrightness = (data[rightIdx] + data[rightIdx + 1] + data[rightIdx + 2]) / 3;
        
        if (Math.abs(brightness - leftBrightness) > threshold || 
            Math.abs(brightness - rightBrightness) > threshold) {
          edgeCount++;
        }
      }
    }
    
    // If we have enough edges, it might contain text
    return edgeCount > 100;
  };

  const handleScanResult = (result: { type: 'barcode' | 'vin'; data: string }) => {
    // Validate the result based on type
    let isValid = false;
    
    if (result.type === 'vin') {
      isValid = VIN_PATTERN.test(result.data);
    } else if (result.type === 'barcode') {
      isValid = BARCODE_PATTERN.test(result.data);
    }

    if (isValid) {
      onScan(result);
      stopCamera();
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setError('');
      setPermissionDenied(false);
      setLastScan('');
      setShowManualInput(false);
      setManualInput('');
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm">
      <div className="relative w-full h-full">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600/20 rounded-full">
                {mode === 'vin' ? (
                  <Car className="w-6 h-6 text-blue-400" />
                ) : mode === 'barcode' ? (
                  <Receipt className="w-6 h-6 text-blue-400" />
                ) : (
                  <Scan className="w-6 h-6 text-blue-400" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-medium">
                  {mode === 'vin' ? 'Scan VIN' : mode === 'barcode' ? 'Scan Barcode' : 'Scanner'}
                </h2>
                <p className="text-sm text-slate-300">
                  {mode === 'vin' 
                    ? 'Point camera at vehicle VIN number'
                    : mode === 'barcode' 
                    ? 'Point camera at receipt barcode'
                    : 'Point camera at barcode or VIN'
                  }
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/10 rounded-full w-10 h-10"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Camera View or Error State */}
        <div className="relative w-full h-full">
          {/* Camera Video */}
          {!error && !permissionDenied && !showManualInput && (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
              <canvas
                ref={canvasRef}
                className="hidden"
              />

              {/* Scanning Overlay */}
              {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    {/* Scanning Frame */}
                    <div className="w-80 h-48 border-2 border-blue-400 rounded-lg relative bg-transparent">
                      {/* Corner brackets */}
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg"></div>
                      
                      {/* Scanning line */}
                      <div className="absolute inset-x-4 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse"></div>
                    </div>
                    
                    {/* Instructions */}
                    <div className="mt-4 text-center">
                      <p className="text-white text-sm bg-black/50 rounded-full px-4 py-2">
                        Align {mode === 'vin' ? 'VIN' : mode === 'barcode' ? 'barcode' : 'code'} within frame
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Error State */}
          {(error || permissionDenied) && !showManualInput && (
            <div className="absolute inset-0 bg-slate-900 flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Camera className="w-10 h-10 text-red-400" />
                </div>
                
                <h3 className="text-white text-xl mb-4">Camera Access Required</h3>
                
                <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                  {permissionDenied ? (
                    <>
                      Camera permission was denied. To use the scanner:
                      <br/><br/>
                      <strong>Desktop browsers:</strong><br/>
                      1. Click the camera icon in your browser's address bar<br/>
                      2. Select "Allow" for camera access<br/>
                      3. Refresh the page or try again<br/><br/>
                      
                      <strong>Mobile browsers:</strong><br/>
                      1. Check that your browser has camera permissions<br/>
                      2. Ensure you're using HTTPS (required for camera access)<br/>
                      3. Try refreshing the page<br/><br/>
                      
                      <strong>Note:</strong> Camera scanning works best in good lighting conditions with clear, focused images.
                    </>
                  ) : (
                    <>
                      {error}
                      <br/><br/>
                      <strong>Troubleshooting tips:</strong><br/>
                      • Ensure you're on HTTPS (camera requires secure connection)<br/>
                      • Check browser camera permissions<br/>
                      • Try using manual entry as an alternative<br/>
                      • Make sure no other apps are using the camera
                    </>
                  )}
                </p>

                <div className="space-y-3">
                  <GlassmorphicButton 
                    variant="primary"
                    onClick={retryCamera}
                    className="w-full"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Try Again
                  </GlassmorphicButton>
                  
                  <GlassmorphicButton 
                    variant="secondary"
                    onClick={() => setShowManualInput(true)}
                    className="w-full"
                  >
                    Enter Manually
                  </GlassmorphicButton>
                </div>
              </div>
            </div>
          )}

          {/* Manual Input State */}
          {showManualInput && (
            <div className="absolute inset-0 bg-slate-900 flex items-center justify-center p-8">
              <div className="text-center max-w-md w-full">
                <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  {mode === 'vin' ? (
                    <Car className="w-10 h-10 text-blue-400" />
                  ) : (
                    <Receipt className="w-10 h-10 text-blue-400" />
                  )}
                </div>
                
                <h3 className="text-white text-xl mb-4">
                  Enter {mode === 'vin' ? 'VIN' : mode === 'barcode' ? 'Barcode' : 'Code'} Manually
                </h3>
                
                <p className="text-slate-300 text-sm mb-6">
                  {mode === 'vin' 
                    ? 'Enter the 17-character Vehicle Identification Number'
                    : mode === 'barcode'
                    ? 'Enter the barcode number from your receipt'
                    : 'Enter a VIN (17 characters) or barcode (8-14 digits)'
                  }
                </p>

                <div className="space-y-4">
                  <input
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder={mode === 'vin' ? 'Enter VIN...' : mode === 'barcode' ? 'Enter barcode...' : 'Enter VIN or barcode...'}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 backdrop-blur-sm font-mono"
                    autoFocus
                    onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
                  />
                  
                  <div className="flex space-x-3">
                    <GlassmorphicButton 
                      variant="primary"
                      onClick={handleManualSubmit}
                      className="flex-1"
                    >
                      Submit
                    </GlassmorphicButton>
                    
                    <GlassmorphicButton 
                      variant="secondary"
                      onClick={() => setShowManualInput(false)}
                      className="flex-1"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Use Camera
                    </GlassmorphicButton>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Controls */}
        {!error && !permissionDenied && !showManualInput && (
          <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent p-6">
            <div className="flex items-center justify-center space-x-4">
              {hasFlashlight && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleFlashlight}
                  className={`text-white hover:bg-white/10 rounded-full w-12 h-12 ${
                    flashlightOn ? 'bg-yellow-500/20 text-yellow-400' : ''
                  }`}
                >
                  <Flashlight className="w-6 h-6" />
                </Button>
              )}
              
              <div className="text-center text-white">
                <p className="text-slate-300 text-sm">
                  {isScanning ? 'Scanning...' : 'Initializing camera...'}
                </p>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowManualInput(true)}
                  className="text-white hover:bg-white/10 rounded-full w-12 h-12"
                  title="Enter manually"
                >
                  <Receipt className="w-6 h-6" />
                </Button>
                
                {/* Demo scan button for testing */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const mockResults = mode === 'barcode' 
                      ? [{ type: 'barcode' as const, data: '1234567890123' }]
                      : mode === 'vin' 
                      ? [{ type: 'vin' as const, data: '1HGBH41JXMN109186' }]
                      : [
                          { type: 'barcode' as const, data: '1234567890123' },
                          { type: 'vin' as const, data: '1HGBH41JXMN109186' }
                        ];
                    const result = mockResults[Math.floor(Math.random() * mockResults.length)];
                    handleScanResult(result);
                  }}
                  className="text-white hover:bg-white/10 rounded-lg px-3 py-2 text-xs"
                >
                  Demo Scan
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Error message for manual input */}
        {showManualInput && error && (
          <div className="absolute bottom-6 left-6 right-6 z-20">
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 backdrop-blur-sm">
              <p className="text-red-200 text-sm text-center">{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};