import { ReactNode, useEffect, useState } from "react";
import Header from "@/components/layout/header";
import { MandatoryFieldsModal } from "@/components/onboarding/mandatory-fields-modal";
import { useAuth } from "@/hooks/use-auth";
import backgroundImage from "@assets/Brandentifier Landing_1751376023002.png";

interface AppShellProps {
  children: ReactNode;
  hideHeader?: boolean;
  className?: string;
}

export function AppShell({ children, hideHeader = false, className = "" }: AppShellProps) {
  const { user } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check if mandatory fields are filled
  useEffect(() => {
    if (!user?.id) return;

    const checkMandatoryFields = async () => {
      try {
        const response = await fetch(`/api/users/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setUserData(data);

          // Show onboarding if any mandatory field is missing
          const isMissingMandatoryField = !data.title || !data.industry || !data.location || !data.lookingFor;
          
          if (isMissingMandatoryField) {
            // Check if user has already dismissed onboarding (stored in localStorage)
            const dismissedOnboarding = localStorage.getItem(`onboarding_dismissed_${user.id}`);
            if (!dismissedOnboarding) {
              setShowOnboarding(true);
            }
          }
        }
      } catch (error) {
        console.error('Error checking mandatory fields:', error);
      }
    };

    checkMandatoryFields();
  }, [user?.id]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // Store that onboarding was completed for this user
    localStorage.setItem(`onboarding_dismissed_${user?.id}`, 'true');
  };

  console.log('[AppShell] Rendering with hideHeader:', hideHeader);
  return (
    <div 
      className="fixed inset-0 w-full h-full responsive-background"
      style={{ 
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900/80 via-black/70 to-gray-800/80 backdrop-blur-sm" />
      
      <div className="relative z-10 w-full h-full overflow-auto flex flex-col">
        {!hideHeader && (
          <>
            {console.log('[AppShell] Rendering Header component')}
            <Header />
          </>
        )}
        
        <main className={`flex-1 ${className}`}>
          {children}
        </main>
      </div>

      {/* Onboarding Modal - Shows when mandatory fields are missing */}
      <MandatoryFieldsModal
        isOpen={showOnboarding}
        userData={userData}
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
}

export default AppShell;
