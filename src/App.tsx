import React, { useState, useEffect } from 'react';
import { SplashScreen } from './components/SplashScreen';
import { LoginScreen } from './components/LoginScreen';
import { LocationPermissionScreen } from './components/LocationPermissionScreen';
import { MainApp } from './components/MainApp';
import { AdminPanel } from './components/AdminPanel';
import { Toaster } from 'sonner@2.0.3';
import { authService, User } from './services/authService';
import { fuelService, FuelEntry as BackendFuelEntry } from './services/fuelService';
import { toast } from 'sonner@2.0.3';

// Legacy interface for compatibility with existing components
export interface FuelEntry {
  id: string;
  userId: string;
  userName: string;
  stockNumber?: string;
  vin?: string;
  mileage: number;
  fuelAmount: number;
  fuelCost: number;
  timestamp: Date;
  notes?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  receiptPhoto: string;
  vinPhoto?: string;
  submittedAt: Date;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'splash' | 'login' | 'location-permission' | 'main' | 'admin'>('splash');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState<boolean | null>(null);
  const [currentLocation, setCurrentLocation] = useState<GeolocationPosition | null>(null);
  const [fuelEntries, setFuelEntries] = useState<FuelEntry[]>([
    // Sample data for demonstration
    {
      id: 'demo1',
      userId: '2',
      userName: 'John Porter',
      stockNumber: 'NAP2024001',
      mileage: 45678,
      fuelAmount: 12.5,
      fuelCost: 42.85,
      timestamp: new Date('2024-12-20T10:30:00'),
      notes: 'Regular fill-up at Shell station',
      location: {
        latitude: 41.8781,
        longitude: -87.6298,
        address: '41.8781, -87.6298'
      },
      receiptPhoto: 'data:image/jpeg;base64,sample-receipt',
      submittedAt: new Date('2024-12-20T10:35:00')
    },
    {
      id: 'demo2',
      userId: '2',
      userName: 'John Porter',
      vin: 'VIN_FROM_PHOTO',
      mileage: 23456,
      fuelAmount: 8.2,
      fuelCost: 28.15,
      timestamp: new Date('2024-12-19T14:15:00'),
      notes: 'Customer vehicle, VIN from photo',
      location: {
        latitude: 41.8825,
        longitude: -87.6235,
        address: '41.8825, -87.6235'
      },
      receiptPhoto: 'data:image/jpeg;base64,sample-receipt',
      vinPhoto: 'data:image/jpeg;base64,sample-vin',
      submittedAt: new Date('2024-12-19T14:20:00')
    }
  ]);

  // Initialize app and auto-login in demo mode
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const session = await authService.getSession();
        if (session) {
          setCurrentUser(session.user);
          setAccessToken(session.token);
          setCurrentScreen('main');
          setIsLoading(false);
        } else {
          // Auto-login as porter user - no credentials needed!
          const autoUser: User = {
            id: 'auto-porter',
            email: 'porter@napleton.com',
            name: 'John Porter',
            role: 'porter'
          };

          // Show splash screen for 2 seconds then auto-login
          setTimeout(() => {
            setCurrentUser(autoUser);
            setAccessToken('auto-token');
            setIsGuestMode(true); // Use guest mode for local storage
            setCurrentScreen('location-permission');
            setIsLoading(false);
            toast.success(`Welcome ${autoUser.name}! Ready to track fuel entries! 🚗⛽`);
          }, 2000);
        }
      } catch (error) {
        console.error('Session check error:', error);
        // Even on error, auto-login
        const autoUser: User = {
          id: 'auto-porter',
          email: 'porter@napleton.com',
          name: 'John Porter',
          role: 'porter'
        };

        setTimeout(() => {
          setCurrentUser(autoUser);
          setAccessToken('auto-token');
          setIsGuestMode(true);
          setCurrentScreen('location-permission');
          setIsLoading(false);
          toast.success(`Welcome ${autoUser.name}! Ready to track fuel entries! 🚗⛽`);
        }, 2000);
      }
    };

    initializeApp();
  }, []);

  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    console.log('handleLogin called with:', { email, password });
    try {
      // Check for hardcoded test credentials first
      const testCredentials = [
        { email: 'admin@napleton.com', password: 'admin123', name: 'Test Admin', role: 'admin' as const },
        { email: 'porter@napleton.com', password: 'porter123', name: 'Test Porter', role: 'porter' as const }
      ];

      const testUser = testCredentials.find(cred => 
        cred.email.toLowerCase() === email.toLowerCase() && cred.password === password
      );

      console.log('Test user found:', testUser);

      if (testUser) {
        // Use test credentials - bypass actual authentication
        const mockUser: User = {
          id: `test-${testUser.role}`,
          email: testUser.email,
          name: testUser.name,
          role: testUser.role
        };

        console.log('Setting mock user:', mockUser);
        setCurrentUser(mockUser);
        setAccessToken('test-token'); // Mock token for test users
        
        // Small delay to ensure state updates, then go to location permission
        setTimeout(() => {
          console.log('Setting screen to location permission...');
          setCurrentScreen('location-permission');
          toast.success(`Welcome back, ${mockUser.name}! (Test Mode)`);
        }, 100);
        
        console.log('Login successful, returning true');
        return true;
      }

      // Regular authentication for non-test credentials
      const result = await authService.signIn(email, password);
      
      if ('error' in result) {
        toast.error(result.error);
        return false;
      }

      setCurrentUser(result.user);
      setAccessToken(result.token);
      setCurrentScreen('location-permission');
      toast.success(`Welcome back, ${result.user.name}!`);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
      return false;
    }
  };

  const handleLogout = async () => {
    try {
      if (!isGuestMode) {
        await authService.signOut();
      }
      setCurrentUser(null);
      setAccessToken(null);
      setIsGuestMode(false);
      setCurrentScreen('login');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };



  const handleSignUp = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const result = await authService.signUp(email, password, name);
      
      if ('error' in result) {
        toast.error(result.error);
        return false;
      }

      toast.success('Account created successfully! You can now sign in.');
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('Failed to create account. Please try again.');
      return false;
    }
  };

  const handleSubmitFuelEntry = async (entryData: Omit<FuelEntry, 'id' | 'userId' | 'userName' | 'submittedAt'>) => {
    if (!currentUser) return;

    // Guest mode - store locally
    if (isGuestMode || !accessToken) {
      const newEntry: FuelEntry = {
        id: `guest-${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.name,
        stockNumber: entryData.stockNumber,
        vin: entryData.vin,
        mileage: entryData.mileage,
        fuelAmount: entryData.fuelAmount,
        fuelCost: entryData.fuelCost,
        timestamp: entryData.timestamp,
        notes: entryData.notes,
        location: entryData.location,
        receiptPhoto: entryData.receiptPhoto,
        vinPhoto: entryData.vinPhoto,
        submittedAt: new Date()
      };

      setFuelEntries(prev => [newEntry, ...prev]);
      toast.success('Fuel entry saved locally! (Guest Mode)');
      return newEntry;
    }

    try {
      // Convert legacy format to backend format
      const backendData = {
        stock_number: entryData.stockNumber || '',
        vin: entryData.vin,
        gallons: entryData.fuelAmount,
        price_per_gallon: entryData.fuelCost / entryData.fuelAmount,
        total_amount: entryData.fuelCost,
        odometer: entryData.mileage,
        fuel_type: 'Regular', // Default fuel type
        location: entryData.location?.address || `${entryData.location?.latitude}, ${entryData.location?.longitude}` || 'Unknown',
        latitude: entryData.location?.latitude,
        longitude: entryData.location?.longitude,
        receipt_photo: entryData.receiptPhoto,
        vin_photo: entryData.vinPhoto,
        notes: entryData.notes,
        timestamp: entryData.timestamp.toISOString()
      };

      const result = await fuelService.createFuelEntry(backendData, accessToken);
      
      if ('error' in result) {
        toast.error(result.error);
        return;
      }

      // Convert back to legacy format for UI
      const newEntry: FuelEntry = {
        id: result.entry.id,
        userId: result.entry.user_id,
        userName: currentUser.name,
        stockNumber: result.entry.stock_number,
        vin: result.entry.vin,
        mileage: result.entry.odometer,
        fuelAmount: result.entry.gallons,
        fuelCost: result.entry.total_amount,
        timestamp: new Date(result.entry.timestamp),
        notes: result.entry.notes,
        location: {
          latitude: result.entry.latitude || 0,
          longitude: result.entry.longitude || 0,
          address: result.entry.location
        },
        receiptPhoto: result.entry.receipt_photo || '',
        vinPhoto: result.entry.vin_photo,
        submittedAt: new Date(result.entry.created_at)
      };

      setFuelEntries(prev => [newEntry, ...prev]);
      toast.success('Fuel entry submitted successfully!');
      return newEntry;
    } catch (error) {
      console.error('Submit fuel entry error:', error);
      toast.error('Failed to submit fuel entry. Please try again.');
    }
  };

  const handleBackToMain = () => {
    setCurrentScreen('main');
  };

  const handleOpenAdmin = () => {
    if (currentUser?.role === 'admin') {
      setCurrentScreen('admin');
    }
  };

  const handleLocationPermissionResult = (granted: boolean, position?: GeolocationPosition) => {
    console.log('Location permission result:', { granted, position });
    setLocationPermissionGranted(granted);
    
    if (position) {
      setCurrentLocation(position);
    }
    
    // Continue to main app
    setCurrentScreen('main');
    
    if (granted) {
      toast.success('Location services enabled! Ready to track fuel entries. 📍');
    } else {
      toast.success('App ready! Location will default to Chicago area. 📍');
    }
  };

  if (isLoading || currentScreen === 'splash') {
    return <SplashScreen />;
  }

  if (currentScreen === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
        <LoginScreen 
          onLogin={handleLogin} 
          onSignUp={handleSignUp} 
        />
        <Toaster 
          theme="dark"
          position="top-center"
          toastOptions={{
            style: {
              background: 'rgba(15, 23, 42, 0.9)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              color: 'white',
            },
          }}
        />
      </div>
    );
  }

  if (currentScreen === 'location-permission' && currentUser) {
    return (
      <div>
        <LocationPermissionScreen
          onPermissionResult={handleLocationPermissionResult}
          userName={currentUser.name}
        />
        <Toaster 
          theme="dark"
          position="top-center"
          toastOptions={{
            style: {
              background: 'rgba(15, 23, 42, 0.9)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              color: 'white',
            },
          }}
        />
      </div>
    );
  }

  if (currentScreen === 'admin' && currentUser?.role === 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
        <AdminPanel 
          users={users}
          fuelEntries={fuelEntries}
          onAddUser={handleSignUp}
          onBack={handleBackToMain}
          onLogout={handleLogout}
          accessToken={accessToken}
        />
        <Toaster 
          theme="dark"
          position="top-center"
          toastOptions={{
            style: {
              background: 'rgba(15, 23, 42, 0.9)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              color: 'white',
            },
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      <MainApp 
        user={currentUser}
        onLogout={handleLogout}
        onSubmitFuelEntry={handleSubmitFuelEntry}
        onOpenAdmin={handleOpenAdmin}
        fuelEntries={fuelEntries}
        isGuestMode={isGuestMode}
        locationPermissionGranted={locationPermissionGranted}
        currentLocation={currentLocation}
      />
      <Toaster 
        theme="dark"
        position="top-center"
        toastOptions={{
          style: {
            background: 'rgba(15, 23, 42, 0.9)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            color: 'white',
          },
        }}
      />
    </div>
  );
}