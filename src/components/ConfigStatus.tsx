import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, ExternalLink, Play, Loader2 } from 'lucide-react';
import { isDemoMode } from '../utils/supabase/demo-config';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Alert, AlertDescription } from './ui/alert';
import { GlassmorphicButton } from './GlassmorphicButton';
import { toast } from 'sonner@2.0.3';

export const ConfigStatus: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const isConfigured = !isDemoMode && projectId !== 'your-project-id-here';

  const initializeBackend = async () => {
    setIsInitializing(true);
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-218dc5b7/setup-demo-users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Backend initialization result:', result);
        toast.success('Backend initialized! Demo users ready.');
      } else {
        console.error('Backend init failed:', response.status);
        toast.error('Backend initialization failed. Check console for details.');
      }
    } catch (error) {
      console.error('Backend init error:', error);
      toast.error('Failed to connect to backend.');
    } finally {
      setIsInitializing(false);
    }
  };

  if (isConfigured) {
    return (
      <Alert className="mb-4 bg-green-500/10 border-green-500/20 text-green-400">
        <CheckCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Connected to Supabase backend</span>
          <GlassmorphicButton
            onClick={initializeBackend}
            disabled={isInitializing}
            variant="secondary"
            size="small"
            className="ml-2"
          >
            {isInitializing ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Play className="w-3 h-3" />
            )}
            {isInitializing ? 'Initializing...' : 'Initialize'}
          </GlassmorphicButton>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="mb-4 bg-yellow-500/10 border-yellow-500/20 text-yellow-400">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <strong>Demo Mode:</strong> Using local storage. 
        <a 
          href="https://supabase.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="ml-2 inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
        >
          Set up Supabase <ExternalLink className="ml-1 h-3 w-3" />
        </a>
      </AlertDescription>
    </Alert>
  );
};