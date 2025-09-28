import React, { useState } from 'react';
import { GlassmorphicButton } from './GlassmorphicButton';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function SetupHelper() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const setupDemoUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-218dc5b7/setup-demo-users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      setResults(data);
      
      if (response.ok) {
        console.log('Setup results:', data);
      } else {
        console.error('Setup error:', data);
      }
    } catch (error) {
      console.error('Setup network error:', error);
      setResults({ error: 'Network error during setup' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-8 p-6 bg-black/20 backdrop-blur-sm border border-blue-400/20 rounded-xl">
      <h3 className="text-lg font-medium text-white mb-4">Database Setup</h3>
      <p className="text-blue-200 text-sm mb-4">
        If you're having sign-in issues, click below to create the demo test accounts in your Supabase database.
      </p>
      
      <GlassmorphicButton
        onClick={setupDemoUsers}
        disabled={isLoading}
        className="w-full mb-4"
      >
        {isLoading ? 'Creating Users...' : 'Setup Demo Users'}
      </GlassmorphicButton>

      {results && (
        <div className="mt-4 p-4 bg-black/30 rounded-lg">
          <h4 className="text-white font-medium mb-2">Setup Results:</h4>
          {results.error ? (
            <p className="text-red-400 text-sm">{results.error}</p>
          ) : (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-200">Admin User:</span>
                <span className={results.results?.admin?.success ? 'text-green-400' : 'text-orange-400'}>
                  {results.results?.admin?.success ? '✅ Created' : '⚠️ ' + results.results?.admin?.message}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200">Porter User:</span>
                <span className={results.results?.porter?.success ? 'text-green-400' : 'text-orange-400'}>
                  {results.results?.porter?.success ? '✅ Created' : '⚠️ ' + results.results?.porter?.message}
                </span>
              </div>
              <div className="mt-3 p-2 bg-blue-900/30 rounded">
                <p className="text-blue-200 text-xs">
                  <strong>Test Credentials:</strong><br/>
                  Admin: admin@napleton.com / admin123<br/>
                  Porter: porter@napleton.com / porter123
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}