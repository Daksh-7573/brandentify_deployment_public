import { useState } from "react";
import { useReplitAuthContext } from "@/contexts/ReplitAuthContext";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function ReplitAuth() {
  const { login, isLoading } = useReplitAuthContext();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  const handleLogin = () => {
    setIsAuthenticating(true);
    login();
  };
  
  return (
    <div className="grid gap-4">
      <Button 
        onClick={handleLogin}
        disabled={isLoading || isAuthenticating}
        className="w-full"
      >
        {(isLoading || isAuthenticating) ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connecting...
          </>
        ) : (
          <>Sign in with Replit</>
        )}
      </Button>
    </div>
  );
}