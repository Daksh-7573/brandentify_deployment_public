import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { AnimationShowcase } from "@/components/demo/animation-showcase";
import Header from "@/components/layout/header";
import { Loader2 } from "lucide-react";

/**
 * Animation Demo Page
 * This page demonstrates various animation styles that can be applied across
 * the Brandentifier platform for a more engaging and interactive user experience.
 */
export default function AnimationDemoPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [_, setLocation] = useLocation();

  // Import CSS for animations
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/src/components/ui/animations.css';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Redirect to landing if not authenticated
  if (!isLoading && !isAuthenticated) {
    setLocation('/');
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation */}
      <Header />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden pt-16"> {/* Added padding-top (pt-16) to account for fixed header */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-gray-50">
          <AnimationShowcase />
        </div>
      </div>
    </div>
  );
}