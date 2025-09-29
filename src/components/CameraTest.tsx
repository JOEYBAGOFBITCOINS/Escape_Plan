import React, { useState } from 'react';
import { Camera, TestTube, CheckCircle, XCircle } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner@2.0.3';

export const CameraTest: React.FC = () => {
  const [testResults, setTestResults] = useState<{
    https: boolean | null;
    mediaDevices: boolean | null;
    getUserMedia: boolean | null;
    permission: boolean | null;
  }>({
    https: null,
    mediaDevices: null,
    getUserMedia: null,
    permission: null
  });

  const runTests = async () => {
    const results = {
      https: location.protocol === 'https:' || location.hostname === 'localhost',
      mediaDevices: !!(navigator.mediaDevices),
      getUserMedia: !!(navigator.mediaDevices?.getUserMedia),
      permission: null as boolean | null
    };

    // Test camera permission
    try {
      const stream = await navigator.mediaDevices?.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (stream) {
        results.permission = true;
        stream.getTracks().forEach(track => track.stop());
        toast.success('All camera tests passed!');
      }
    } catch (error: any) {
      results.permission = false;
      
      if (error.name === 'NotAllowedError') {
        toast.error('Camera permission denied');
      } else if (error.name === 'NotFoundError') {
        toast.error('No camera found');
      } else {
        toast.error('Camera test failed: ' + error.message);
      }
    }

    setTestResults(results);
  };

  const TestResult: React.FC<{ 
    label: string; 
    result: boolean | null;
    description: string;
  }> = ({ label, result, description }) => (
    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
      <div>
        <div className="text-white font-medium">{label}</div>
        <div className="text-slate-400 text-sm">{description}</div>
      </div>
      <div>
        {result === null ? (
          <div className="w-5 h-5 bg-slate-500 rounded-full"></div>
        ) : result ? (
          <CheckCircle className="w-5 h-5 text-green-400" />
        ) : (
          <XCircle className="w-5 h-5 text-red-400" />
        )}
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <TestTube className="w-8 h-8 text-blue-400" />
        </div>
        <h2 className="text-white text-xl font-medium mb-2">Camera Diagnostics</h2>
        <p className="text-slate-400 text-sm">Test camera functionality and requirements</p>
      </div>

      <div className="space-y-3 mb-6">
        <TestResult
          label="HTTPS Connection"
          result={testResults.https}
          description="Required for camera access (except localhost)"
        />
        <TestResult
          label="MediaDevices API"
          result={testResults.mediaDevices}
          description="Browser support for camera access"
        />
        <TestResult
          label="getUserMedia"
          result={testResults.getUserMedia}
          description="Camera permission API availability"
        />
        <TestResult
          label="Camera Permission"
          result={testResults.permission}
          description="Actual camera access and permission"
        />
      </div>

      <Button
        onClick={runTests}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        <Camera className="w-4 h-4 mr-2" />
        Run Camera Tests
      </Button>

      <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
        <p className="text-yellow-200 text-xs">
          <strong>Note:</strong> Camera functionality requires HTTPS in production. 
          If tests fail, ensure you're accessing the app via HTTPS and have granted camera permissions.
        </p>
      </div>
    </div>
  );
};