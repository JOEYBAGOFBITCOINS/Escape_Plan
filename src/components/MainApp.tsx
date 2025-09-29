import React, { useState } from 'react';
import { Home, Plus, BarChart3, List, Settings, LogOut } from 'lucide-react';
import { GlassmorphicButton } from './GlassmorphicButton';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { FuelEntryForm } from './FuelEntryForm';
import { FuelEntryList } from './FuelEntryList';
import { Statistics } from './Statistics';
import { toast } from 'sonner@2.0.3';
import { User, FuelEntry } from '../App';
import napletonLogo from 'figma:asset/b2a9411c7fa7d1a1cf97fbc1b60e44151fe2dace.png';

interface MainAppProps {
  user: User | null;
  onLogout: () => void;
  onSubmitFuelEntry: (entry: Omit<FuelEntry, 'id' | 'userId' | 'userName' | 'submittedAt'>) => FuelEntry | undefined;
  onOpenAdmin: () => void;
  fuelEntries: FuelEntry[];
  isGuestMode?: boolean;
  locationPermissionGranted?: boolean | null;
  currentLocation?: GeolocationPosition | null;
}

export const MainApp: React.FC<MainAppProps> = ({
  user,
  onLogout,
  onSubmitFuelEntry,
  onOpenAdmin,
  fuelEntries,
  isGuestMode = false,
  locationPermissionGranted = null,
  currentLocation = null
}) => {
  const [activeTab, setActiveTab] = useState('home');
  const [showFuelForm, setShowFuelForm] = useState(false);

  // Debug tab changes
  React.useEffect(() => {
    console.log('Active tab changed to:', activeTab);
  }, [activeTab]);

  React.useEffect(() => {
    console.log('Show fuel form changed to:', showFuelForm);
  }, [showFuelForm]);

  const handleStartNewEntry = () => {
    console.log('Starting new entry...');
    console.log('Current activeTab:', activeTab);
    console.log('Current showFuelForm:', showFuelForm);
    setShowFuelForm(true);
    setActiveTab('add');
    console.log('Set activeTab to add and showFuelForm to true');
  };

  const handleFuelEntrySubmit = (entryData: Omit<FuelEntry, 'id' | 'userId' | 'userName' | 'submittedAt'>) => {
    const submittedEntry = onSubmitFuelEntry(entryData);
    if (submittedEntry) {
      setShowFuelForm(false);
      setActiveTab('home');
      toast.success('Fuel entry submitted successfully!', {
        description: `${entryData.fuelCost.toFixed(2)} • ${entryData.fuelAmount} gallons`,
        duration: 4000,
      });
    }
  };

  const handleBackFromForm = () => {
    setShowFuelForm(false);
    setActiveTab('home');
  };

  if (!user) {
    return null;
  }

  // Modern professional pattern - no bottom tabs!
  const renderCurrentView = () => {
    if (showFuelForm) {
      return (
        <FuelEntryForm
          onSubmit={handleFuelEntrySubmit}
          onBack={handleBackFromForm}
          locationPermissionGranted={locationPermissionGranted}
          currentLocation={currentLocation}
        />
      );
    }

    switch (activeTab) {
      case 'stats':
        return (
          <div className="h-full">
            {/* Stats Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <button
                onClick={() => setActiveTab('home')}
                className="w-10 h-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/20 transition-all duration-200"
              >
                <Home className="w-4 h-4" />
              </button>
              <h1 className="text-white text-xl font-medium">Statistics</h1>
              <div className="w-10" />
            </div>
            <Statistics fuelEntries={fuelEntries} user={user} />
          </div>
        );
      case 'history':
        return (
          <div className="h-full">
            {/* History Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <button
                onClick={() => setActiveTab('home')}
                className="w-10 h-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/20 transition-all duration-200"
              >
                <Home className="w-4 h-4" />
              </button>
              <h1 className="text-white text-xl font-medium">Fuel History</h1>
              <div className="w-10" />
            </div>
            <FuelEntryList fuelEntries={fuelEntries} user={user} />
          </div>
        );
      default:
        return (
          <div className="flex flex-col h-full">
            {/* Header Section */}
            <div className="flex-1 flex flex-col justify-center items-center px-8 pt-16 pb-8">
              {/* Logo and Title Container */}
              <div className="w-full max-w-80 flex flex-col items-center">
                {/* Logo */}
                <div className="mb-8">
                  <ImageWithFallback 
                    src={napletonLogo} 
                    alt="Napleton Automotive Group" 
                    className="h-32 w-auto rounded-lg shadow-lg" 
                  />
                </div>

                {/* App Title */}
                <div className="text-center mb-3 w-full">
                  <div className="border-2 border-dashed border-white/40 rounded-2xl px-8 py-4 mb-6 w-full">
                    <h1 className="text-white text-4xl tracking-widest font-light">
                      FuelTrakr
                    </h1>
                  </div>
                  <p className="text-slate-300/90 text-lg">
                    Welcome back, {user.name}
                  </p>
                  <p className="text-slate-400/80 text-sm">
                    {user.role === 'admin' ? 'Administrator' : 'Porter'} • {user.email}
                  </p>
                  {isGuestMode && (
                    <div className="mt-3 px-4 py-2 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-lg">
                      <p className="text-green-300 text-sm flex items-center justify-center">
                        🎉 <span className="ml-2">Guest Mode - All features available!</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-8 pb-8 flex flex-col items-center">
              <div className="w-full max-w-80 space-y-5">
                <GlassmorphicButton 
                  variant="primary"
                  size="large"
                  onClick={handleStartNewEntry}
                >
                  <Plus className="w-6 h-6 mr-3" />
                  <span className="text-lg">New Fuel Entry</span>
                </GlassmorphicButton>
                
                <div className="grid grid-cols-2 gap-4">
                  {user.role === 'admin' && (
                    <GlassmorphicButton 
                      variant="secondary"
                      size="medium"
                      onClick={() => setActiveTab('stats')}
                    >
                      <BarChart3 className="w-5 h-5 mr-2" />
                      <span>Statistics</span>
                    </GlassmorphicButton>
                  )}
                  
                  <GlassmorphicButton 
                    variant="secondary"
                    size="medium"
                    onClick={() => setActiveTab('history')}
                    className={user.role === 'porter' ? 'col-span-2' : ''}
                  >
                    <List className="w-5 h-5 mr-2" />
                    <span>History</span>
                  </GlassmorphicButton>
                </div>

                {/* Admin Access */}
                {user.role === 'admin' && !isGuestMode && (
                  <GlassmorphicButton 
                    variant="secondary"
                    size="large"
                    onClick={onOpenAdmin}
                  >
                    <Settings className="w-6 h-6 mr-3" />
                    <span className="text-lg">Admin Panel</span>
                  </GlassmorphicButton>
                )}
                
                {/* Guest Mode Info */}
                {isGuestMode && (
                  <div className="p-4 bg-blue-500/10 backdrop-blur-sm border border-blue-400/20 rounded-xl">
                    <p className="text-blue-200 text-sm text-center">
                      💡 <strong>Guest Mode:</strong> Data saved locally only<br/>
                      Sign in for full database features
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Porter Stats - Activity Only, No Financial Data */}
            {user.role === 'porter' && (
              <div className="px-8 pb-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-4">
                  <h3 className="text-white text-sm font-medium mb-3">Your Activity</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-xl p-3 text-center">
                      <p className="text-slate-300 text-xs">Runs Today</p>
                      <p className="text-white text-lg font-medium">
                        {fuelEntries.filter(entry => {
                          const today = new Date().toDateString();
                          return new Date(entry.timestamp).toDateString() === today;
                        }).length}
                      </p>
                      <p className="text-slate-400 text-xs">completed</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 text-center">
                      <p className="text-slate-300 text-xs">This Month</p>
                      <p className="text-white text-lg font-medium">
                        {fuelEntries.filter(entry => 
                          new Date(entry.timestamp).getMonth() === new Date().getMonth()
                        ).length}
                      </p>
                      <p className="text-slate-400 text-xs">runs</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Admin Stats - Show Financial Data */}
            {user.role === 'admin' && (
              <div className="px-8 pb-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-4">
                  <h3 className="text-white text-sm font-medium mb-3">Financial Overview</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-xl p-3 text-center">
                      <p className="text-slate-300 text-xs">This Month</p>
                      <p className="text-white text-lg font-medium">
                        ${fuelEntries.filter(entry => 
                          new Date(entry.timestamp).getMonth() === new Date().getMonth()
                        ).reduce((sum, entry) => sum + entry.fuelCost, 0).toFixed(0)}
                      </p>
                      <p className="text-slate-400 text-xs">spent</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 text-center">
                      <p className="text-slate-300 text-xs">Total Spent</p>
                      <p className="text-white text-lg font-medium">
                        ${fuelEntries.reduce((sum, entry) => sum + entry.fuelCost, 0).toFixed(0)}
                      </p>
                      <p className="text-slate-400 text-xs">lifetime</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen relative">
      {/* Main Content */}
      <div className="h-full">
        {renderCurrentView()}
      </div>

      {/* Floating Add Button - Only show on home screen */}
      {activeTab === 'home' && !showFuelForm && (
        <div className="fixed bottom-8 right-8">
          <button
            onClick={handleStartNewEntry}
            className="w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse-glow border border-blue-400/30"
          >
            <Plus className="w-6 h-6 text-white" />
          </button>
        </div>
      )}

      {/* Top Right Actions */}
      <div className="fixed top-4 right-4">
        <button
          onClick={onLogout}
          className="w-10 h-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/20 transition-all duration-200"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};