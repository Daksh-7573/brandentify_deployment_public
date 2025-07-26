import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export function AuthInstructions() {
  return (
    <Card className="mt-4 bg-blue-500/10 border-blue-400/20">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="text-blue-100 font-medium mb-2">Authentication Process</p>
            <ul className="text-blue-200 space-y-1 text-xs">
              <li>• Click "Sign in with Google" to start authentication</li>
              <li>• You'll be redirected to Google's secure login page</li>
              <li>• Select your Google account and approve access</li>
              <li>• You'll be automatically redirected back to Brandentifier</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}