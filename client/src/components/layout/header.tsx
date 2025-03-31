import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Header() {
  const { user, signOut } = useAuth();
  const [_, setLocation] = useLocation();

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <span 
                className="text-primary text-2xl font-bold cursor-pointer"
                onClick={() => setLocation('/dashboard')}
              >
                Brandentifier
              </span>
            </div>
          </div>
          <div className="flex items-center">
            <div className="ml-3 relative">
              <div>
                <button className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                  <span className="sr-only">Open user menu</span>
                  <img 
                    className="h-8 w-8 rounded-full" 
                    src={user?.photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"} 
                    alt="User profile" 
                  />
                </button>
              </div>
            </div>
            <Button 
              variant="ghost" 
              className="ml-4"
              onClick={signOut}
            >
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
