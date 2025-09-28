import React, { useState } from 'react';
import { MapPin, Shield, Navigation, Check, X, AlertCircle } from 'lucide-react';
import { GlassmorphicButton } from './GlassmorphicButton';
import { toast } from 'sonner@2.0.3';

interface LocationPermissionScreenProps {
  onPermissionResult: (granted: boolean, position?: GeolocationPosition) => void;
  userName: string;
}

export const LocationPermissionScreen: React.FC<LocationPermissionScreenProps> = ({ 
  onPermissionResult, 
  userName 
}) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [permissionState, setPermissionState] = useState<'initial' | 'granted' | 'denied'>('initial');

  const requestLocationPermission = async () => {
    setIsRequesting(true);
    
    try {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        toast.error('Location services are not supported by your browser');
        onPermissionResult(false);
        return;
      }

      // Request current position (this triggers permission prompt)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Location permission granted:', position);
          setPermissionState('granted');
          setIsRequesting(false);
          toast.success('Location access granted! 📍');
          
          // Small delay to show success state
          setTimeout(() => {
            onPermissionResult(true, position);
          }, 1500);
        },
        (error) => {
          console.log('Location permission error:', error);
          setPermissionState('denied');
          setIsRequesting(false);
          
          let errorMessage = '';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access was denied. You can still use the app with manual location entry.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable. Using default location.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Using default location.';
              break;
            default:
              errorMessage = 'An unknown error occurred. Using default location.';
              break;
          }
          
          toast.error(errorMessage);
          
          // Continue to app even without location
          setTimeout(() => {
            onPermissionResult(false);
          }, 2000);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } catch (error) {
      console.error('Geolocation error:', error);
      setIsRequesting(false);
      setPermissionState('denied');
      toast.error('Unable to access location services');
      
      setTimeout(() => {
        onPermissionResult(false);
      }, 2000);
    }
  };

  const skipLocationPermission = () => {
    toast.success('You can enable location access later in settings');
    onPermissionResult(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm border border-blue-400/20 flex items-center justify-center">
            <MapPin className="w-10 h-10 text-blue-400" />
          </div>
          <h1 className="text-2xl font-medium text-white mb-2">
            Welcome, {userName}! 👋
          </h1>
          <p className="text-blue-200/80">
            Let's set up location services for accurate fuel tracking
          </p>
        </div>

        {/* Permission Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-6">
          {permissionState === 'initial' && (
            <>
              <div className="flex items-center mb-4">
                <Navigation className="w-6 h-6 text-blue-400 mr-3" />
                <h2 className="text-lg font-medium text-white">Location Access</h2>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium">Automatic GPS Coordinates</p>
                    <p className="text-blue-200/70 text-sm">No manual entry required for fuel locations</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium">Accurate Reporting</p>
                    <p className="text-blue-200/70 text-sm">Precise location data for expense tracking</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium">Field Efficiency</p>
                    <p className="text-blue-200/70 text-sm">Quick entries without typing addresses</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-400/20 rounded-lg p-3 mb-6">
                <div className="flex items-start">
                  <Shield className="w-5 h-5 text-blue-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-blue-200 text-sm font-medium">Privacy Protected</p>
                    <p className="text-blue-200/70 text-xs">Location data is only used for fuel entry tracking and is securely stored.</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {permissionState === 'granted' && (
            <div className="text-center py-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Location Access Granted!</h3>
              <p className="text-green-200/80">Ready to track fuel entries with GPS precision</p>
            </div>
          )}

          {permissionState === 'denied' && (
            <div className="text-center py-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Location Access Denied</h3>
              <p className="text-yellow-200/80">You can still use the app - locations will default to Chicago area</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {permissionState === 'initial' && (
          <div className="space-y-3">
            <GlassmorphicButton
              onClick={requestLocationPermission}
              variant="primary"
              size="large"
              className="w-full"
              disabled={isRequesting}
            >
              {isRequesting ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Requesting Permission...
                </div>
              ) : (
                <>
                  <MapPin className="w-5 h-5 mr-2" />
                  Enable Location Access
                </>
              )}
            </GlassmorphicButton>

            <GlassmorphicButton
              onClick={skipLocationPermission}
              variant="secondary"
              size="large"
              className="w-full"
            >
              <X className="w-5 h-5 mr-2" />
              Skip for Now
            </GlassmorphicButton>
          </div>
        )}

        {permissionState !== 'initial' && (
          <div className="text-center">
            <p className="text-blue-200/60 text-sm">
              Continuing to FuelTrakr...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};