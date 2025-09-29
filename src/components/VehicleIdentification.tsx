import React, { useState, useEffect } from 'react';
import { Car, Camera, ArrowLeft, Info } from 'lucide-react';
import { GlassmorphicButton } from './GlassmorphicButton';
import { VINScanner } from './VINScanner';
import { Input } from './ui/input';
import { vinService, VehicleInfo } from '../services/vinService';
import { toast } from 'sonner@2.0.3';
import { supabase } from '../utils/supabase/client';

interface VehicleIdentificationProps {
  onVehicleIdentified: (data: {
    stockNumber?: string;
    vin?: string;
    vinPhoto?: string;
    vehicleInfo?: VehicleInfo;
  }) => void;
  onBack: () => void;
  initialData?: {
    stockNumber?: string;
    vin?: string;
    vinPhoto?: string;
  };
}

export const VehicleIdentification: React.FC<VehicleIdentificationProps> = ({
  onVehicleIdentified,
  onBack,
  initialData
}) => {
  const [stockNumber, setStockNumber] = useState(initialData?.stockNumber || '');
  const [vin, setVin] = useState(initialData?.vin || '');
  const [vinPhoto, setVinPhoto] = useState(initialData?.vinPhoto || '');
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isDecodingVin, setIsDecodingVin] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [showVehicleDetails, setShowVehicleDetails] = useState(false);

  // Get access token on mount
  useEffect(() => {
    const getAccessToken = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          setAccessToken(session.access_token);
        }
      } catch (error) {
        console.error('Failed to get access token:', error);
      }
    };
    
    getAccessToken();
  }, []);

  // Auto-decode VIN when it's entered or detected
  useEffect(() => {
    if (vin && vin.length === 17) {
      decodeVin(vin);
    } else {
      setVehicleInfo(null);
    }
  }, [vin, accessToken]);

  const decodeVin = async (vinToCheck: string) => {
    setIsDecodingVin(true);
    try {
      const decoded = await vinService.decodeVin(vinToCheck, accessToken || undefined);
      setVehicleInfo(decoded);
      
      if (decoded.valid) {
        toast.success(`Vehicle identified: ${decoded.year} ${decoded.make} ${decoded.model}`);
      } else if (decoded.error) {
        toast.warning(decoded.error);
      }
    } catch (error) {
      console.error('VIN decode error:', error);
      toast.error('Failed to decode VIN');
    } finally {
      setIsDecodingVin(false);
    }
  };

  const handleVinPhotoCapture = (photoUrl: string) => {
    setVinPhoto(photoUrl);
    setShowCamera(false);
    // Here you could add OCR to extract VIN from photo
    toast.success('VIN scanned successfully');
  };

  const handleContinue = () => {
    // Must have either stock number or VIN scan
    if (!stockNumber && !vinPhoto) {
      toast.error('Please enter a stock number or scan a VIN');
      return;
    }

    onVehicleIdentified({
      stockNumber: stockNumber || undefined,
      vin: vin || undefined,
      vinPhoto: vinPhoto || undefined,
      vehicleInfo: vehicleInfo || undefined
    });
  };

  const canContinue = stockNumber || vinPhoto;

  if (showCamera) {
    return (
      <VINScanner
        onCapture={handleVinPhotoCapture}
        onClose={() => setShowCamera(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <GlassmorphicButton
            variant="secondary"
            size="icon"
            onClick={onBack}
            className="mr-3"
          >
            <ArrowLeft className="w-5 h-5" />
          </GlassmorphicButton>
          
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
              <Car className="w-5 h-5 text-blue-400" />
            </div>
            <h1 className="text-xl font-medium text-white">
              Vehicle Identification
            </h1>
          </div>
        </div>

        <div className="space-y-6">
          {/* Stock Number Section */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <div className="mb-4">
              <label className="block text-white font-medium mb-2">
                Stock Number{' '}
                <span className="text-blue-400 text-sm font-normal">(Preferred)</span>
              </label>
              <Input
                type="text"
                value={stockNumber}
                onChange={(e) => setStockNumber(e.target.value)}
                placeholder="Enter stock number"
                className="bg-white/10 border-white/20 text-white placeholder-slate-400 focus:border-blue-400/50 focus:ring-blue-400/50"
              />
            </div>
          </div>

          {/* OR Divider */}
          <div className="text-center">
            <span className="text-slate-400 text-lg font-medium">OR</span>
          </div>

          {/* VIN Scanner Section */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <div className="mb-4">
              <label className="block text-white font-medium mb-4">
                VIN Scanner{' '}
                <span className="text-slate-400 text-sm font-normal">(Required if no stock number)</span>
              </label>
              
              <GlassmorphicButton
                variant="primary"
                size="large"
                className="w-full"
                onClick={() => setShowCamera(true)}
              >
                <Camera className="w-5 h-5 mr-2" />
                Scan VIN
              </GlassmorphicButton>
              
              {vinPhoto && (
                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-green-200 text-sm">✓ VIN scanned successfully</p>
                </div>
              )}
            </div>

            {/* Manual VIN Entry (optional) */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <label className="block text-slate-300 text-sm mb-2">
                Or enter VIN manually
              </label>
              <Input
                type="text"
                value={vin}
                onChange={(e) => setVin(e.target.value.toUpperCase())}
                placeholder="Enter 17-character VIN"
                className="bg-white/10 border-white/20 text-white placeholder-slate-400 focus:border-blue-400/50 focus:ring-blue-400/50 font-mono"
                maxLength={17}
              />
              
              {/* Vehicle Info Display */}
              {isDecodingVin && (
                <div className="mt-3 flex items-center text-blue-300 text-sm">
                  <div className="w-4 h-4 border-2 border-blue-300/30 border-t-blue-300 rounded-full animate-spin mr-2"></div>
                  Decoding VIN...
                </div>
              )}
              
              {vehicleInfo && vehicleInfo.valid && (
                <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-blue-200 text-sm font-medium">
                    {vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}
                  </p>
                  {vehicleInfo.trim && (
                    <p className="text-blue-300 text-sm mt-1">Trim: {vehicleInfo.trim}</p>
                  )}
                  
                  <button
                    onClick={() => setShowVehicleDetails(!showVehicleDetails)}
                    className="mt-2 text-xs text-blue-400 hover:text-blue-300 flex items-center transition-colors"
                  >
                    <Info className="w-3 h-3 mr-1" />
                    {showVehicleDetails ? 'Hide' : 'Show'} Details
                  </button>
                  
                  {showVehicleDetails && (
                    <div className="mt-3 pt-3 border-t border-blue-500/20 space-y-1 text-xs text-blue-300">
                      {vehicleInfo.engine && <div>Engine: {vehicleInfo.engine}</div>}
                      {vehicleInfo.displacement && <div>Displacement: {vehicleInfo.displacement}L</div>}
                      {vehicleInfo.fuel_type && <div>Fuel Type: {vehicleInfo.fuel_type}</div>}
                      {vehicleInfo.transmission && <div>Transmission: {vehicleInfo.transmission}</div>}
                      {vehicleInfo.body_class && <div>Body: {vehicleInfo.body_class}</div>}
                      {vehicleInfo.manufacturer && <div>Manufacturer: {vehicleInfo.manufacturer}</div>}
                    </div>
                  )}
                </div>
              )}
              
              {vehicleInfo && !vehicleInfo.valid && vehicleInfo.error && (
                <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-yellow-200 text-sm">{vehicleInfo.error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Continue Button */}
          <div className="pt-4">
            <GlassmorphicButton
              variant="primary"
              size="large"
              className="w-full"
              onClick={handleContinue}
              disabled={!canContinue}
            >
              Continue to Fuel Details
            </GlassmorphicButton>
            
            {!canContinue && (
              <p className="text-slate-400 text-sm text-center mt-2">
                Enter a stock number or scan a VIN to continue
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};