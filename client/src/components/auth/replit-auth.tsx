import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ReplitAuth() {
  const handleLogin = () => {
    // Direct to the backend login route
    window.location.href = "/api/login";
  };

  const handleLogout = () => {
    // Direct to the backend logout route
    window.location.href = "/api/logout";
  };

  return (
    <div className="space-y-4">
      <Button
        variant="outline"
        onClick={handleLogin}
        className="w-full"
      >
        <img 
          src="https://replit.com/public/images/icon-square.png"
          alt="Replit Logo" 
          className="w-5 h-5 mr-2" 
        />
        Continue with Replit
      </Button>
    </div>
  );
}

export function ReplitLogoutButton() {
  return (
    <Button
      variant="outline"
      onClick={() => window.location.href = "/api/logout"}
      className="w-full"
    >
      Log out
    </Button>
  );
}