import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./context/auth-context";
import { useAuth } from "./hooks/use-auth";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Profile from "@/pages/profile";
import AICareer from "@/pages/ai-career";
import SmartConnect from "@/pages/smart-connect";
import PortfolioBuilder from "@/pages/portfolio-builder";
import ServicesPage from "@/pages/services";
import IndustryPulsePage from "@/pages/industry-pulse";
import AuthPage from "@/pages/auth-page";
import EmailVerification from "@/pages/email-verification";

// Protected route component that checks if the user is authenticated
function ProtectedRoute({ component: Component, ...rest }: { component: React.ComponentType, path: string }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [_, navigate] = useLocation();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return isAuthenticated ? <Component /> : null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/verify-email" component={EmailVerification} />
      <Route path="/dashboard">
        <ProtectedRoute path="/dashboard" component={Dashboard} />
      </Route>
      <Route path="/profile">
        <ProtectedRoute path="/profile" component={Profile} />
      </Route>
      <Route path="/ai-career">
        <ProtectedRoute path="/ai-career" component={AICareer} />
      </Route>
      <Route path="/smart-connect">
        <ProtectedRoute path="/smart-connect" component={SmartConnect} />
      </Route>
      <Route path="/portfolio-builder">
        <ProtectedRoute path="/portfolio-builder" component={PortfolioBuilder} />
      </Route>
      <Route path="/services">
        <ProtectedRoute path="/services" component={ServicesPage} />
      </Route>
      <Route path="/industry-pulse">
        <ProtectedRoute path="/industry-pulse" component={IndustryPulsePage} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
