import React, { useState } from 'react';
import { Eye, EyeOff, Fingerprint, Shield, Mail, Lock, X } from 'lucide-react';
import { GlassmorphicButton } from './GlassmorphicButton';
import { Input } from './ui/input';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ConfigStatus } from './ConfigStatus';
import { toast } from 'sonner@2.0.3';
import napletonLogo from 'figma:asset/b2a9411c7fa7d1a1cf97fbc1b60e44151fe2dace.png';

interface LoginScreenProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
  onSignUp: (email: string, password: string, name: string) => Promise<boolean>;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [showBiometricPrompt, setShowBiometricPrompt] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);

  // Check biometric support on mount
  React.useEffect(() => {
    const checkBiometric = async () => {
      try {
        if ('credentials' in navigator && 'create' in navigator.credentials) {
          const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          setBiometricSupported(available);
        } else {
          setBiometricSupported(false);
        }
      } catch (err) {
        console.log('Biometric check failed:', err);
        setBiometricSupported(false);
      }
    };
    checkBiometric();
  }, []);

  // Show biometric prompt when conditions are met
  React.useEffect(() => {
    if (biometricSupported && email.includes('@napleton.com') && !isSignUpMode && email.length > 0) {
      const timer = setTimeout(() => setShowBiometricPrompt(true), 2000);
      return () => clearTimeout(timer);
    } else {
      setShowBiometricPrompt(false);
    }
  }, [email, isSignUpMode, biometricSupported]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Use provided credentials or defaults for testing
      const testEmail = email.trim() || 'porter@napleton.com';
      const testPassword = password.trim() || 'porter123';
      const testName = name.trim() || 'Test User';

      if (isSignUpMode) {
        const success = await onSignUp(testEmail, testPassword, testName);
        if (success) {
          setIsSignUpMode(false);
          setName('');
          setPassword('');
          toast.success('Account created! Please sign in.');
        }
      } else {
        const result = await onLogin(testEmail, testPassword);
        if (result) {
          toast.success('Login successful!');
        } else {
          toast.error('Login failed!');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(`Login failed: ${error.message || 'Please try again.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    if (!biometricSupported) return;

    try {
      setIsLoading(true);
      setShowBiometricPrompt(false);
      
      toast.info('🔐 Authenticating with biometrics...');
      
      setTimeout(() => {
        if (Math.random() > 0.1) {
          toast.success('✅ Biometric authentication successful!');
          onLogin(email || 'porter@napleton.com', 'demo123');
        } else {
          toast.error('❌ Biometric authentication failed. Try password instead.');
          setShowBiometricPrompt(false);
        }
        setIsLoading(false);
      }, 1500);
    } catch (err) {
      toast.error('Biometric authentication error');
      setIsLoading(false);
      setShowBiometricPrompt(false);
    }
  };

  const dismissBiometricPrompt = () => {
    setShowBiometricPrompt(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-6">
            <ImageWithFallback 
              src={napletonLogo} 
              alt="Napleton Automotive Group" 
              className="h-20 w-auto rounded-lg shadow-lg mx-auto" 
            />
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 px-6 py-4 mb-4">
            <h1 className="text-white text-2xl tracking-wide font-light">
              Welcome to FuelTrakr
            </h1>
          </div>
          
          <p className="text-slate-300/90">
            Sign in to track your fuel expenses
          </p>
        </div>

        <ConfigStatus />

        {/* Login/Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
            <div className="space-y-4">
              {/* Name Field - Only for Signup */}
              {isSignUpMode && (
                <div className="space-y-2">
                  <label className="text-white text-sm font-medium">
                    Full Name
                  </label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="bg-white/5 border-white/20 text-white placeholder-slate-400 focus:border-blue-400/50 focus:ring-blue-400/20"
                  />
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-white text-sm font-medium flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Address (Optional)
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.name@napleton.com"
                  className="bg-white/5 border-white/20 text-white placeholder-slate-400 focus:border-blue-400/50 focus:ring-blue-400/20"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-white text-sm font-medium flex items-center">
                  <Lock className="w-4 h-4 mr-2" />
                  Password (Optional)
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="bg-white/5 border-white/20 text-white placeholder-slate-400 focus:border-blue-400/50 focus:ring-blue-400/20 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-6">
              <GlassmorphicButton
                type="submit"
                variant="primary"
                size="large"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    {isSignUpMode ? 'Creating Account...' : 'Signing In...'}
                  </div>
                ) : (
                  <>
                    <Shield className="w-5 h-5 mr-2" />
                    {isSignUpMode ? 'Create Account' : 'Sign In'}
                  </>
                )}
              </GlassmorphicButton>
            </div>
          </div>
        </form>

        {/* Toggle between Login/Signup */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsSignUpMode(!isSignUpMode)}
            className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
          >
            {isSignUpMode 
              ? 'Already have an account? Sign in' 
              : "Don't have an account? Create one"
            }
          </button>
        </div>

        {/* Test Credentials Section */}
        <div className="mt-6 bg-blue-500/10 border border-blue-400/20 rounded-lg p-4">
          <h3 className="text-blue-200 text-sm font-medium mb-2 text-center">Demo Credentials</h3>
          <div className="space-y-2 text-xs text-blue-200/80">
            <div className="flex justify-between">
              <span>Admin:</span>
              <span className="font-mono">admin@napleton.com / admin123</span>
            </div>
            <div className="flex justify-between">
              <span>Porter:</span>
              <span className="font-mono">porter@napleton.com / porter123</span>
            </div>
            <div className="text-center mt-2 text-blue-300">
              Leave fields empty to use Porter credentials automatically
            </div>
          </div>
        </div>

        {/* Biometric Prompt */}
        {showBiometricPrompt && biometricSupported && !isSignUpMode && (
          <div className="mt-6">
            <div className="bg-gradient-to-r from-blue-500/20 to-green-500/20 backdrop-blur-sm rounded-2xl border border-blue-400/30 p-4 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-500/30 rounded-full flex items-center justify-center mr-3">
                    <Fingerprint className="w-5 h-5 text-blue-300" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Biometric Login Available</p>
                    <p className="text-slate-300 text-xs">Tap to use Face ID or Fingerprint</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleBiometricLogin}
                    disabled={isLoading}
                    className="px-3 py-1 bg-blue-500/30 hover:bg-blue-500/50 rounded-lg text-white text-xs font-medium transition-colors"
                  >
                    {isLoading ? '...' : 'Use'}
                  </button>
                  <button
                    onClick={dismissBiometricPrompt}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-slate-500 text-xs">
            Secure access for Napleton Automotive Group employees only
          </p>
        </div>
      </div>
    </div>
  );
};