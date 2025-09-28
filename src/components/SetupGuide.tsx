import React from 'react';
import { ExternalLink, Copy, CheckCircle } from 'lucide-react';
import { GlassmorphicButton } from './GlassmorphicButton';
import { toast } from 'sonner@2.0.3';

export const SetupGuide: React.FC = () => {
  const copyCode = (code: string, description: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`${description} copied to clipboard!`);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
        <h2 className="text-white text-xl mb-4 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
          Quick Setup Guide
        </h2>
        
        <div className="space-y-4 text-slate-300">
          <div className="space-y-2">
            <h3 className="text-white font-medium">Step 1: Create Supabase Project</h3>
            <p className="text-sm">
              1. Go to{' '}
              <a 
                href="https://supabase.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 inline-flex items-center"
              >
                supabase.com <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </p>
            <p className="text-sm">2. Click "Start your project" and sign up</p>
            <p className="text-sm">3. Create a new project named "fueltrakr-napleton"</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-white font-medium">Step 2: Get Your Keys</h3>
            <p className="text-sm">1. Go to Settings → API in your Supabase dashboard</p>
            <p className="text-sm">2. Copy your Project URL and anon key</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-white font-medium">Step 3: Update Configuration</h3>
            <p className="text-sm">Edit the file: <code className="bg-black/20 px-1 rounded">/utils/supabase/info.tsx</code></p>
            
            <div className="bg-black/20 rounded-lg p-3 mt-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-slate-400">Configuration Example:</span>
                <button
                  onClick={() => copyCode(`export const projectId = 'your-project-id-here';
export const publicAnonKey = 'your-anon-key-here';`, 'Configuration template')}
                  className="text-slate-400 hover:text-white"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <pre className="text-xs text-green-400 overflow-x-auto">
{`export const projectId = 'abc123def';
export const publicAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';`}
              </pre>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-white font-medium">Step 4: Demo Credentials</h3>
            <p className="text-sm">While in demo mode, use these test accounts:</p>
            
            <div className="bg-black/20 rounded-lg p-3 space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-blue-400">Admin Account</p>
                  <p className="text-xs">admin@napleton.com / admin123</p>
                </div>
                <button
                  onClick={() => copyCode('admin@napleton.com', 'Admin email')}
                  className="text-slate-400 hover:text-white"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-green-400">Porter Account</p>
                  <p className="text-xs">porter@napleton.com / porter123</p>
                </div>
                <button
                  onClick={() => copyCode('porter@napleton.com', 'Porter email')}
                  className="text-slate-400 hover:text-white"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-blue-200 text-sm">
            <strong>Note:</strong> Your FuelTrakr app is fully functional in demo mode! 
            All features work with local storage. Set up Supabase when you're ready 
            for production deployment with real user accounts and data persistence.
          </p>
        </div>
      </div>
    </div>
  );
};