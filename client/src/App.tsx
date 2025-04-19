import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./context/auth-context";
import { useAuth } from "./hooks/use-auth";
import { useEffect } from "react";
import GlobalMuskButton from "@/components/musk/global-musk-button";
import { TransitionLayout } from "@/components/ui/transition-layout";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Profile from "@/pages/profile";
import PublicProfile from "@/pages/public-profile";
import PersonalDetailsPage from "@/pages/personal-details";
import PortfolioBuilder from "@/pages/portfolio-builder";
import CreatePulsePage from "@/pages/create-pulse";
import IndustryPulsePage from "@/pages/industry-pulse-new";
import SearchPage from "@/pages/search";
import AuthPage from "@/pages/auth-page";
import EmailVerification from "@/pages/email-verification";
import NewsSourcesPage from "@/pages/news-sources";
import Radar from "@/pages/radar";
import SmartConnectPage from "@/pages/smart-connect";
import MuskMatchPage from "@/pages/musk-match";
import ResumePage from "@/pages/resume";
import FeedTestPage from "@/pages/feed-test";
import CareerQuestsPage from "@/pages/career-quests";
import OnboardingPage from "@/pages/onboarding";
import EditProfilePage from "@/pages/edit-profile";
import UIDemo from "@/pages/ui-demo";

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
      <div className="flex flex-col items-center justify-center min-h-screen">
        <LoadingSpinner 
          size="lg" 
          variant="gradient" 
          text="Loading your professional space..." 
          className="mb-4"
        />
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
        <ProtectedRoute path="/ai-career" component={Dashboard} />
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
      <Route path="/musk-match">
        <ProtectedRoute path="/musk-match" component={MuskMatchPage} />
      </Route>
      <Route path="/resume">
        <ProtectedRoute path="/resume" component={ResumePage} />
      </Route>
      <Route path="/feed-test">
        <ProtectedRoute path="/feed-test" component={FeedTestPage} />
      </Route>
      <Route path="/career-quests">
        <ProtectedRoute path="/career-quests" component={CareerQuestsPage} />
      </Route>
      <Route path="/onboarding">
        <ProtectedRoute path="/onboarding" component={OnboardingPage} />
      </Route>
      <Route path="/edit-profile">
        <ProtectedRoute path="/edit-profile" component={EditProfilePage} />
      </Route>
      <Route path="/ui-demo" component={UIDemo} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TransitionLayout animation="fade" duration={0.4}>
          <Router />
        </TransitionLayout>
        <GlobalMuskButton />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
