import React, { useEffect, useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import napletonLogo from 'figma:asset/b2a9411c7fa7d1a1cf97fbc1b60e44151fe2dace.png';

export const SplashScreen: React.FC = () => {
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    const phases = [
      { delay: 500, phase: 1 },   // Logo fade in
      { delay: 1500, phase: 2 },  // Title appear
      { delay: 2500, phase: 3 },  // Tagline appear
      { delay: 4000, phase: 4 },  // Pulse animation
      { delay: 6000, phase: 5 },  // Ready to transition
    ];

    phases.forEach(({ delay, phase }) => {
      setTimeout(() => setAnimationPhase(phase), delay);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-pulse" 
             style={{ animationDelay: '0s', animationDuration: '4s' }}></div>
        <div className="absolute top-3/4 right-1/4 w-40 h-40 bg-blue-400/8 rounded-full blur-2xl animate-pulse" 
             style={{ animationDelay: '2s', animationDuration: '6s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-24 h-24 bg-blue-600/12 rounded-full blur-lg animate-pulse" 
             style={{ animationDelay: '1s', animationDuration: '5s' }}></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-8 max-w-md">
        {/* Logo */}
        <div className={`mb-8 transition-all duration-1000 ease-out ${
          animationPhase >= 1 
            ? 'opacity-100 transform translate-y-0' 
            : 'opacity-0 transform translate-y-8'
        }`}>
          <div className="relative">
            {/* Glow effect behind logo */}
            <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full scale-110"></div>
            <ImageWithFallback 
              src={napletonLogo} 
              alt="Napleton Automotive Group" 
              className="h-32 w-auto rounded-lg shadow-2xl relative z-10 mx-auto" 
            />
          </div>
        </div>

        {/* App Title */}
        <div className={`mb-6 transition-all duration-1000 ease-out delay-300 ${
          animationPhase >= 2 
            ? 'opacity-100 transform translate-y-0' 
            : 'opacity-0 transform translate-y-8'
        }`}>
          <div className="relative">
            {/* Glassmorphic container */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 px-8 py-6 relative overflow-hidden">
              {/* Animated border */}
              <div className={`absolute inset-0 border-2 border-blue-400/30 rounded-2xl transition-all duration-2000 ${
                animationPhase >= 4 ? 'animate-pulse' : ''
              }`}></div>
              
              <h1 className="text-white text-4xl tracking-widest font-light relative z-10">
                FuelTrakr
              </h1>
            </div>
          </div>
        </div>

        {/* Tagline */}
        <div className={`mb-8 transition-all duration-1000 ease-out delay-500 ${
          animationPhase >= 3 
            ? 'opacity-100 transform translate-y-0' 
            : 'opacity-0 transform translate-y-8'
        }`}>
          <p className="text-slate-300/90 text-lg">
            Professional Fuel Expense Tracking
          </p>
          <p className="text-slate-400/80 text-sm mt-2">
            For Napleton Automotive Group
          </p>
        </div>

        {/* Loading indicator */}
        <div className={`transition-all duration-1000 ease-out delay-700 ${
          animationPhase >= 4 
            ? 'opacity-100 transform translate-y-0' 
            : 'opacity-0 transform translate-y-8'
        }`}>
          <div className="flex items-center justify-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
          <p className="text-slate-400 text-sm mt-4">Loading...</p>
        </div>

        {/* Version info */}
        <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-all duration-1000 ease-out delay-1000 ${
          animationPhase >= 5 
            ? 'opacity-100 transform translate-y-0' 
            : 'opacity-0 transform translate-y-4'
        }`}>
          <p className="text-slate-500 text-xs">
            Version 1.0.0 • Napleton Automotive Group
          </p>
        </div>
      </div>

      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(37, 99, 235, 0.3) 0%, transparent 50%)`
        }}></div>
      </div>
    </div>
  );
};