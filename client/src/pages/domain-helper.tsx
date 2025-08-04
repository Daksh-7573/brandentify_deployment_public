import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

export default function DomainHelper() {
  const [copied, setCopied] = useState(false);

  const currentDomain = window.location.hostname;
  const currentOrigin = window.location.origin;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const domains = [
    currentDomain,
    'localhost',
    `${projectId}.firebaseapp.com`,
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="bg-red-900/20 border-red-600 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-5 w-5" />
              Firebase Domain Authorization Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-red-900/30 p-4 rounded-lg">
              <p className="text-red-200 mb-3">
                <strong>Issue:</strong> Google authentication fails because the current domain is not authorized in Firebase.
              </p>
              <p className="text-red-200">
                <strong>Solution:</strong> Add the current domain to Firebase's authorized domains list.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-red-400">Current Domain Information</h3>
              <div className="bg-gray-900 p-4 rounded font-mono text-sm">
                <div className="space-y-2">
                  <div>
                    <span className="text-yellow-400">Current Domain:</span>{' '}
                    <span className="text-green-400">{currentDomain}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="ml-2 h-6 text-xs"
                      onClick={() => copyToClipboard(currentDomain)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div>
                    <span className="text-yellow-400">Full Origin:</span>{' '}
                    <span className="text-green-400">{currentOrigin}</span>
                  </div>
                  <div>
                    <span className="text-yellow-400">Firebase Project:</span>{' '}
                    <span className="text-green-400">{projectId}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-400">Step-by-Step Instructions</h3>
              <div className="space-y-3">
                <div className="bg-blue-900/20 p-4 rounded border border-blue-600">
                  <h4 className="font-semibold text-blue-300 mb-2">Step 1: Open Firebase Console</h4>
                  <p className="text-blue-200 mb-2">Go to Firebase Console and select your project:</p>
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => window.open('https://console.firebase.google.com/', '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Firebase Console
                  </Button>
                </div>

                <div className="bg-blue-900/20 p-4 rounded border border-blue-600">
                  <h4 className="font-semibold text-blue-300 mb-2">Step 2: Go to Authentication Settings</h4>
                  <ul className="text-blue-200 space-y-1 text-sm">
                    <li>• Click on "Authentication" in the left sidebar</li>
                    <li>• Click on the "Settings" tab</li>
                    <li>• Scroll down to "Authorized domains"</li>
                  </ul>
                </div>

                <div className="bg-blue-900/20 p-4 rounded border border-blue-600">
                  <h4 className="font-semibold text-blue-300 mb-2">Step 3: Add Current Domain</h4>
                  <p className="text-blue-200 mb-2">Click "Add domain" and add this exact domain:</p>
                  <div className="bg-gray-900 p-3 rounded font-mono text-green-400 flex items-center justify-between">
                    <span>{currentDomain}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(currentDomain)}
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                </div>

                <div className="bg-green-900/20 p-4 rounded border border-green-600">
                  <h4 className="font-semibold text-green-300 mb-2">Step 4: Save and Test</h4>
                  <ul className="text-green-200 space-y-1 text-sm">
                    <li>• Click "Add" to save the domain</li>
                    <li>• Wait 1-2 minutes for changes to propagate</li>
                    <li>• Return to the authentication test page</li>
                    <li>• Try Google sign-in again</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-yellow-900/20 p-4 rounded border border-yellow-600">
              <h4 className="font-semibold text-yellow-300 mb-2">Important Notes</h4>
              <ul className="text-yellow-200 space-y-1 text-sm">
                <li>• The domain must match exactly (no http:// or trailing slashes)</li>
                <li>• Changes may take 1-2 minutes to take effect</li>
                <li>• You can add multiple domains for different environments</li>
                <li>• Localhost is usually already authorized by default</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => window.location.href = '/auth-console'}
                className="bg-green-600 hover:bg-green-700"
              >
                Back to Authentication Test
              </Button>
              <Button
                onClick={() => window.open('https://console.firebase.google.com/', '_blank')}
                variant="outline"
                className="border-blue-600 text-blue-400 hover:bg-blue-900/20"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Firebase Console
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}