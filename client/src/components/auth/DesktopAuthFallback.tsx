import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ExternalLink, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DesktopAuthFallbackProps {
  onClose?: () => void;
}

export function DesktopAuthFallback({ onClose }: DesktopAuthFallbackProps) {
  const [email, setEmail] = useState("");
  const [showBrowserLink, setShowBrowserLink] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(window.location.href.replace(window.location.pathname, '/auth'));
  const { toast } = useToast();
  
  const handleOpenInBrowser = () => {
    // Copy URL to clipboard for easy access
    navigator.clipboard.writeText(currentUrl);
    
    // Try to open in default browser
    if ((window as any).electronAPI?.openExternal) {
      (window as any).electronAPI.openExternal(currentUrl);
    } else {
      // For web-based desktop app, open in new tab
      window.open(currentUrl, '_blank');
    }
    
    toast({
      title: "Opening in Browser",
      description: "URL copied to clipboard. Complete authentication in your browser, then return here.",
    });
  };

  const handleEmailSignup = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address to continue.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Simple email-based authentication for desktop users
      const response = await fetch('/api/auth/email-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "Authentication Link Generated",
          description: data.instructions || "Open the link in your browser to continue.",
        });
        
        // Show the auth link for easy access
        if (data.authLink) {
          setShowBrowserLink(true);
          // Update current URL to the auth link
          setCurrentUrl(data.authLink);
        }
      } else {
        throw new Error(data.message || 'Email signup failed');
      }
    } catch (error: any) {
      console.error('Email signup error:', error);
      toast({
        title: "Authentication Error", 
        description: error.message || "Please try opening in browser or contact support.",
        variant: "destructive"
      });
      setShowBrowserLink(true);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-gray-900/50 border-gray-700">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-2">
          <AlertCircle className="h-8 w-8 text-yellow-500" />
        </div>
        <CardTitle className="text-white">Desktop App Authentication</CardTitle>
        <p className="text-gray-300 text-sm">
          Google authentication works better in your browser
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm text-gray-300">
            Email Address
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
            className="bg-gray-800 border-gray-600 text-white"
          />
        </div>

        <Button
          onClick={handleEmailSignup}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          Continue with Email
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-600" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-gray-900 px-2 text-gray-400">or</span>
          </div>
        </div>

        <Button
          onClick={handleOpenInBrowser}
          variant="outline"
          className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Open in Browser
        </Button>

        {showBrowserLink && (
          <div className="p-3 bg-gray-800 rounded-md">
            <p className="text-sm text-gray-300 mb-2">
              Copy this link and open it in your browser:
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs text-gray-400 bg-gray-700 p-2 rounded truncate">
                {currentUrl}
              </code>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  navigator.clipboard.writeText(currentUrl);
                  toast({ title: "Copied!", description: "URL copied to clipboard" });
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {onClose && (
          <Button
            variant="ghost"
            onClick={onClose}
            className="w-full text-gray-400"
          >
            Cancel
          </Button>
        )}
      </CardContent>
    </Card>
  );
}