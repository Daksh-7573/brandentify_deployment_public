import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./context/auth-context";
import { useAuth } from "./hooks/use-auth";
import { useEffect } from "react";
import FloatingMusk from "@/components/musk/floating-musk";

import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Profile from "@/pages/profile";
import PublicProfile from "@/pages/public-profile";
import PersonalDetailsPage from "@/pages/personal-details";
import AICareer from "@/pages/ai-career";
import PortfolioBuilder from "@/pages/portfolio-builder";
import CreatePulsePage from "@/pages/create-pulse";
import IndustryPulsePage from "@/pages/industry-pulse-new";
import SearchPage from "@/pages/search";
import AuthPage from "@/pages/auth-page";
import EmailVerification from "@/pages/email-verification";
import NewsSourcesPage from "@/pages/news-sources";
import Radar from "@/pages/radar";
import SmartConnectPage from "@/pages/smart-connect";

// Redirect component to handle page redirects
const Redirect = ({ to }: { to: string }) => {
  const [_, navigate] = useLocation();
  
  useEffect(() => {
    navigate(to);
  }, [navigate, to]);
  
  return null;
};

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
        <ProtectedRoute path="/dashboard" component={() => <Redirect to="/industry-pulse" />} />
      </Route>
      <Route path="/profile">
        <ProtectedRoute path="/profile" component={Profile} />
      </Route>
      <Route path="/personal-details">
        <ProtectedRoute path="/personal-details" component={PersonalDetailsPage} />
      </Route>
      {/* Public profile using username route (/@username) - dynamic path parameter */}
      <Route path="/@:username">
        {(params) => <PublicProfile username={params.username} />}
      </Route>
      <Route path="/ai-career">
        <ProtectedRoute path="/ai-career" component={AICareer} />
      </Route>
      <Route path="/smart-connect">
        <ProtectedRoute path="/smart-connect" component={SmartConnectPage} />
      </Route>
      <Route path="/portfolio-builder">
        <ProtectedRoute path="/portfolio-builder" component={PortfolioBuilder} />
      </Route>
      <Route path="/services">
        {/* Redirect services to industry-pulse for now */}
        <Redirect to="/industry-pulse" />
      </Route>
      <Route path="/create-pulse">
        <ProtectedRoute path="/create-pulse" component={CreatePulsePage} />
      </Route>
      <Route path="/industry-pulse">
        <ProtectedRoute path="/industry-pulse" component={IndustryPulsePage} />
      </Route>
      <Route path="/search">
        <ProtectedRoute path="/search" component={SearchPage} />
      </Route>
      <Route path="/news-sources">
        <ProtectedRoute path="/news-sources" component={NewsSourcesPage} />
      </Route>
      <Route path="/radar">
        <ProtectedRoute path="/radar" component={Radar} />
      </Route>
      <Route path="/ai-career">
        <ProtectedRoute path="/ai-career" component={AICareer} />
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
        <FloatingMusk />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
