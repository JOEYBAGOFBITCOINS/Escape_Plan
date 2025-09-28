import React, { useState, useEffect } from 'react';
import { ArrowLeft, Camera, MapPin, Car, Receipt, Save, X, Plus } from 'lucide-react';
import { GlassmorphicButton } from './GlassmorphicButton';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner@2.0.3';
import { FuelEntry } from '../App';

interface FuelEntryFormProps {
  onSubmit: (entry: Omit<FuelEntry, 'id' | 'userId' | 'userName' | 'submittedAt'>) => void;
  onBack: () => void;
  locationPermissionGranted?: boolean | null;
  currentLocation?: GeolocationPosition | null;
}

export const FuelEntryForm: React.FC<FuelEntryFormProps> = ({
  onSubmit,
  onBack,
  locationPermissionGranted = null,
  currentLocation = null
}) => {
  const [formData, setFormData] = useState({
    stockNumber: '',
    mileage: '',
    fuelAmount: '',
    fuelCost: '',
    notes: ''
  });
  
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    address?: string;
  } | null>(null);
  
  const [receiptPhoto, setReceiptPhoto] = useState<string>('');
  const [vinPhoto, setVinPhoto] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submittedEntry, setSubmittedEntry] = useState<any>(null);

  // Get location on component mount with error handling
  useEffect(() => {
    console.log('🎯 FuelEntryForm - Location Permission Status:', locationPermissionGranted);
    console.log('🎯 FuelEntryForm - Current Location:', currentLocation);
    
    if (locationPermissionGranted && currentLocation) {
      // Use the location we already have from onboarding
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        address: `${currentLocation.coords.latitude}, ${currentLocation.coords.longitude}`
      });
      console.log('✅ Using pre-granted location from onboarding');
    } else if (locationPermissionGranted) {
      // Permission was granted but we need to get fresh location
      getCurrentLocation().catch(error => {
        console.log('ℹ️ Location refresh failed, using fallback:', error);
      });
    } else {
      // No permission or permission denied - use fallback
      setLocation({
        latitude: 41.8781,
        longitude: -87.6298,
        address: 'Default Location - Chicago, IL'
      });
      console.log('ℹ️ Using default Chicago location (no permission)');
    }
  }, [locationPermissionGranted, currentLocation]);

  const getCurrentLocation = async () => {
    if (!('geolocation' in navigator)) {
      console.log('Geolocation not supported');
      setLocation({
        latitude: 41.8781,
        longitude: -87.6298,
        address: 'Demo Location - Geolocation not supported'
      });
      return;
    }

    // Check permissions first to avoid policy errors
    try {
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        console.log('📍 Geolocation permission status:', permission.state);
        
        if (permission.state === 'denied') {
          console.log('ℹ️ Geolocation permission denied, using fallback location');
          setLocation({
            latitude: 41.8781,
            longitude: -87.6298,
            address: 'Demo Location - Permission denied'
          });
          return;
        }
      }
    } catch (permissionError) {
      console.log('ℹ️ Could not check geolocation permissions:', permissionError);
      // Continue with location request anyway
    }

    console.log('🗺️ Requesting location...');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log('✅ Location obtained:', { latitude, longitude });
        
        // Reverse geocode to get address (simplified)
        const address = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        setLocation({ latitude, longitude, address });
        
        toast.success('Location captured successfully');
      },
      (error) => {
        console.error('❌ Location error details:', {
          code: error.code,
          message: error.message,
          errorType: error.code === 1 ? 'PERMISSION_DENIED' : 
                    error.code === 2 ? 'POSITION_UNAVAILABLE' : 
                    error.code === 3 ? 'TIMEOUT' : 'UNKNOWN'
        });
        
        let errorMessage = 'Unable to get location';
        
        switch (error.code) {
          case 1: // PERMISSION_DENIED
            if (error.message.includes('permissions policy')) {
              errorMessage = 'Location disabled by browser policy. Using demo location.';
            } else {
              errorMessage = 'Location access denied. Please enable location permissions.';
            }
            break;
          case 2: // POSITION_UNAVAILABLE
            errorMessage = 'Location information unavailable. Using demo location.';
            break;
          case 3: // TIMEOUT
            errorMessage = 'Location request timed out. Using demo location.';
            break;
          default:
            errorMessage = `Location error (code: ${error.code}). Using demo location.`;
            break;
        }
        
        // Use a less intrusive toast for permission/policy errors
        if (error.code === 1) {
          console.log('ℹ️ Location access denied, using fallback location');
        } else {
          toast.info(errorMessage);
        }
        
        // Set a fallback location for demo purposes
        setLocation({
          latitude: 41.8781,
          longitude: -87.6298,
          address: 'Demo Location - Chicago, IL (Location unavailable)'
        });
      },
      {
        enableHighAccuracy: false, // Faster response
        timeout: 5000, // Shorter timeout to avoid hanging
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoCapture = async (type: 'receipt' | 'vin') => {
    try {
      // Mock photo capture with simulated camera access
      // In a real app, you'd use navigator.mediaDevices.getUserMedia()
      toast.info(`Opening camera for ${type} photo...`);
      
      // Simulate camera delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock photo URL (in real app, this would be from camera)
      const mockPhotoUrl = `data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=`;
      
      if (type === 'receipt') {
        setReceiptPhoto(mockPhotoUrl);
        toast.success('Receipt photo captured successfully');
      } else {
        setVinPhoto(mockPhotoUrl);
        toast.success('VIN photo captured successfully');
      }
    } catch (error) {
      console.error('Photo capture error:', error);
      toast.error(`Failed to capture ${type} photo. Please try again.`);
    }
  };

  const removePhoto = (type: 'receipt' | 'vin') => {
    if (type === 'receipt') {
      setReceiptPhoto('');
    } else {
      setVinPhoto('');
    }
    toast.info(`${type === 'receipt' ? 'Receipt' : 'VIN'} photo removed`);
  };

  const validateForm = () => {
    const errors: string[] = [];

    // Either stock number or VIN photo is required
    if (!formData.stockNumber.trim() && !vinPhoto) {
      errors.push('Stock Number or VIN photo is required');
    }

    // Numeric validations
    if (!formData.mileage || isNaN(Number(formData.mileage)) || Number(formData.mileage) <= 0) {
      errors.push('Valid mileage is required');
    }

    if (!formData.fuelAmount || isNaN(Number(formData.fuelAmount)) || Number(formData.fuelAmount) <= 0) {
      errors.push('Valid fuel amount is required');
    }

    if (!formData.fuelCost || isNaN(Number(formData.fuelCost)) || Number(formData.fuelCost) <= 0) {
      errors.push('Valid fuel cost is required');
    }

    // Receipt photo is required
    if (!receiptPhoto) {
      errors.push('Receipt photo is required');
    }

    // If no stock number, VIN photo is required
    if (!formData.stockNumber.trim() && !vinPhoto) {
      errors.push('VIN photo is required when no stock number is provided');
    }

    return errors;
  };

  const handleSubmit = () => {
    const errors = validateForm();
    
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    setIsSubmitting(true);

    // Simulate submission delay
    setTimeout(() => {
      const entryData = {
        stockNumber: formData.stockNumber || undefined,
        vin: vinPhoto ? 'VIN_FROM_PHOTO' : undefined, // VIN extracted from photo
        mileage: Number(formData.mileage),
        fuelAmount: Number(formData.fuelAmount),
        fuelCost: Number(formData.fuelCost),
        timestamp: new Date(),
        notes: formData.notes || undefined,
        location,
        receiptPhoto,
        vinPhoto: vinPhoto || undefined
      };

      setSubmittedEntry(entryData);
      setIsSubmitting(false);
      setShowConfirmation(true);
    }, 2000);
  };

  const handleConfirmSubmission = () => {
    if (submittedEntry) {
      onSubmit(submittedEntry);
    }
  };

  if (showConfirmation && submittedEntry) {
    return (
      <div className="flex flex-col h-full px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Save className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-white text-2xl mb-2">Entry Complete</h2>
          <p className="text-slate-300/80">
            Review your fuel entry submission
          </p>
        </div>

        {/* Confirmation Details */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 mb-8">
          <h3 className="text-white text-lg mb-4">Entry Summary</h3>
          
          <div className="space-y-3">
            {submittedEntry.stockNumber && (
              <div className="flex justify-between">
                <span className="text-slate-300">Stock Number:</span>
                <span className="text-white font-mono">{submittedEntry.stockNumber}</span>
              </div>
            )}
            
            {submittedEntry.vin && (
              <div className="flex justify-between">
                <span className="text-slate-300">VIN:</span>
                <span className="text-white font-mono text-sm">
                  {submittedEntry.vin === 'VIN_FROM_PHOTO' ? 'Captured from photo' : submittedEntry.vin}
                </span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-slate-300">Mileage:</span>
              <span className="text-white">{submittedEntry.mileage.toLocaleString()} miles</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-slate-300">Fuel Amount:</span>
              <span className="text-white">{submittedEntry.fuelAmount} gallons</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-slate-300">Cost:</span>
              <span className="text-white font-medium">${submittedEntry.fuelCost.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-slate-300">Date & Time:</span>
              <span className="text-white text-sm">{submittedEntry.timestamp.toLocaleString()}</span>
            </div>
            
            {location && (
              <div className="flex justify-between">
                <span className="text-slate-300">Location:</span>
                <span className="text-white text-sm">{location.address}</span>
              </div>
            )}
            
            {submittedEntry.notes && (
              <div>
                <span className="text-slate-300">Notes:</span>
                <p className="text-white text-sm mt-1">{submittedEntry.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Photos Summary */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 mb-8">
          <h3 className="text-white text-lg mb-4">Attached Photos</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Receipt className="w-6 h-6 text-blue-400" />
              </div>
              <p className="text-slate-300 text-sm">Receipt Photo</p>
              <p className="text-green-400 text-xs">✓ Attached</p>
            </div>
            {submittedEntry.vinPhoto && (
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Car className="w-6 h-6 text-green-400" />
                </div>
                <p className="text-slate-300 text-sm">VIN Photo</p>
                <p className="text-green-400 text-xs">✓ Attached</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-auto space-y-4">
          <GlassmorphicButton
            variant="primary"
            size="large"
            onClick={handleConfirmSubmission}
            className="w-full"
          >
            <Save className="w-5 h-5 mr-2" />
            Confirm & Submit
          </GlassmorphicButton>
          
          <GlassmorphicButton
            variant="secondary"
            onClick={() => setShowConfirmation(false)}
            className="w-full"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Edit
          </GlassmorphicButton>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <button
          onClick={onBack}
          className="flex items-center text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
        <h1 className="text-white text-lg font-medium">Fuel Entry</h1>
        <div className="w-6"></div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {/* Vehicle Identification */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
          <h3 className="text-white text-lg mb-4 flex items-center">
            <Car className="w-5 h-5 mr-2" />
            Vehicle Identification
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-white text-sm font-medium mb-2 block">
                Stock Number (Preferred)
              </label>
              <Input
                value={formData.stockNumber}
                onChange={(e) => handleInputChange('stockNumber', e.target.value)}
                placeholder="Enter stock number"
                className="bg-white/5 border-white/20 text-white placeholder-slate-400 focus:border-blue-400/50 focus:ring-blue-400/20"
              />
              <p className="text-slate-400 text-xs mt-1">Enter the vehicle's stock number if available</p>
            </div>

            {!formData.stockNumber.trim() && (
              <>
                <div className="text-center text-slate-400 text-sm">OR</div>
                
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">
                    VIN Photo (Required if no stock number)
                  </label>
                  <p className="text-slate-400 text-xs mb-3">
                    Take a clear photo of the vehicle's VIN plate
                  </p>
                  
                  {vinPhoto ? (
                    <div className="relative bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mr-3">
                            <Car className="w-6 h-6 text-green-400" />
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">VIN Photo Captured</p>
                            <p className="text-slate-400 text-xs">Ready for submission</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removePhoto('vin')}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <GlassmorphicButton
                      variant="secondary"
                      onClick={() => handlePhotoCapture('vin')}
                      className="w-full"
                    >
                      <Camera className="w-5 h-5 mr-2" />
                      Take VIN Photo
                    </GlassmorphicButton>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Fuel Information */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
          <h3 className="text-white text-lg mb-4">Fuel Information</h3>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-white text-sm font-medium mb-2 block">
                Mileage
              </label>
              <Input
                type="number"
                value={formData.mileage}
                onChange={(e) => handleInputChange('mileage', e.target.value)}
                placeholder="Current mileage"
                className="bg-white/5 border-white/20 text-white placeholder-slate-400 focus:border-blue-400/50 focus:ring-blue-400/20"
                inputMode="numeric"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-white text-sm font-medium mb-2 block">
                  Fuel Amount (Gallons)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.fuelAmount}
                  onChange={(e) => handleInputChange('fuelAmount', e.target.value)}
                  placeholder="0.00"
                  className="bg-white/5 border-white/20 text-white placeholder-slate-400 focus:border-blue-400/50 focus:ring-blue-400/20"
                  inputMode="decimal"
                />
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">
                  Total Cost ($)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.fuelCost}
                  onChange={(e) => handleInputChange('fuelCost', e.target.value)}
                  placeholder="0.00"
                  className="bg-white/5 border-white/20 text-white placeholder-slate-400 focus:border-blue-400/50 focus:ring-blue-400/20"
                  inputMode="decimal"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Photo Capture */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
          <h3 className="text-white text-lg mb-4">Photo Documentation</h3>
          
          <div className="space-y-4">
            {/* Receipt Photo */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-white text-sm font-medium">
                  Receipt Photo *
                </label>
                <span className="text-red-400 text-xs">Required</span>
              </div>
              
              {receiptPhoto ? (
                <div className="relative bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3">
                        <Receipt className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">Receipt Photo</p>
                        <p className="text-slate-400 text-xs">Captured successfully</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removePhoto('receipt')}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <GlassmorphicButton
                  variant="secondary"
                  onClick={() => handlePhotoCapture('receipt')}
                  className="w-full"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Capture Receipt Photo
                </GlassmorphicButton>
              )}
            </div>


          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
          <h3 className="text-white text-lg mb-4">Additional Information</h3>
          
          <div className="space-y-4">
            {/* Location */}
            <div>
              <label className="text-white text-sm font-medium mb-2 block flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                Location
              </label>
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                {location ? (
                  <div className="text-sm">
                    <p className="text-green-400 mb-1">✓ Location captured</p>
                    <p className="text-slate-300 font-mono text-xs">{location.address}</p>
                  </div>
                ) : (
                  <div className="text-sm">
                    <p className="text-slate-400">Getting location...</p>
                    <button
                      onClick={getCurrentLocation}
                      className="text-blue-400 hover:text-blue-300 text-xs mt-1"
                    >
                      Retry
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-white text-sm font-medium mb-2 block">
                Notes (Optional)
              </label>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Add any additional notes..."
                className="bg-white/5 border-white/20 text-white placeholder-slate-400 focus:border-blue-400/50 focus:ring-blue-400/20 min-h-[80px]"
                rows={3}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="p-6 border-t border-white/10">
        <GlassmorphicButton
          variant="primary"
          size="large"
          onClick={handleSubmit}
          className="w-full"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
              Submitting...
            </div>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              Submit Fuel Entry
            </>
          )}
        </GlassmorphicButton>
      </div>
    </div>
  );
};