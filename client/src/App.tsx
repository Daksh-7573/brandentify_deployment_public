import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./context/auth-context";
import { useAuth } from "./hooks/use-auth";
import { useEffect } from "react";
import GlobalMuskButton from "@/components/musk/global-musk-button";

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
import ResumeCV from "@/pages/resume-cv";
import ResumeEditor from "@/pages/resume-editor";
import UnifiedProfilePage from "@/pages/unified-profile";
import FeedTestPage from "@/pages/feed-test";
import CareerQuestsPage from "@/pages/career-quests";
import BrandQuestsPage from "@/pages/brand-quests";
import CareerCapsulePage from "@/pages/career-capsule"; // Career Capsule feature (renamed from Roadmap)
import OnboardingPage from "@/pages/onboarding";
import EditProfilePage from "@/pages/edit-profile";
import MuskTestingPage from "@/pages/musk-testing";
import ManageServicesPage from "@/pages/manage-services";
import TestNowboardPage from "@/pages/test-nowboard";
import ScreenTestingPage from "@/pages/screen-testing";
// Lazy load the SharedCardPage to improve performance and show loader immediately
import { lazy, Suspense } from "react";
const SharedCardPage = lazy(() => import("@/pages/shared-card"));
// Brand of the Day is now integrated into Nowboard

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
        <ProtectedRoute path="/ai-career" component={Dashboard} />
      </Route>
      <Route path="/smart-connect">
        <ProtectedRoute path="/smart-connect" component={SmartConnectPage} />
      </Route>
      <Route path="/portfolio-builder">
        <ProtectedRoute path="/portfolio-builder" component={PortfolioBuilder} />
      </Route>
      <Route path="/services">
        <ProtectedRoute path="/services" component={ManageServicesPage} />
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
      <Route path="/resume-cv">
        <ProtectedRoute path="/resume-cv" component={ResumeCV} />
      </Route>
      <Route path="/resume-editor">
        {/* Explicitly using the fixed version to avoid hook ordering issues */}
        <ProtectedRoute path="/resume-editor" component={ResumeEditor} />
      </Route>
      <Route path="/resume/edit/:userId">
        {/* Explicitly using the fixed version with direct import to ensure consistent usage */}
        {(params) => <ProtectedRoute path="/resume/edit/:userId" component={() => {
          const FixedResumeEditor = require('@/pages/resume-editor-fixed').default;
          return <FixedResumeEditor />;
        }} />}
      </Route>
      <Route path="/feed-test">
        <ProtectedRoute path="/feed-test" component={FeedTestPage} />
      </Route>
      {/* Brand Quests (new name) */}
      <Route path="/brand-quests">
        <ProtectedRoute path="/brand-quests" component={BrandQuestsPage} />
      </Route>
      
      {/* Legacy route - keeping for backward compatibility */}
      <Route path="/career-quests">
        <ProtectedRoute path="/career-quests" component={BrandQuestsPage} />
      </Route>
      <Route path="/career-capsule">
        <ProtectedRoute path="/career-capsule" component={CareerCapsulePage} />
      </Route>
      {/* Replaced with Career Capsule - keeping both routes for backward compatibility */}
      <Route path="/career-roadmap">
        <ProtectedRoute path="/career-roadmap" component={CareerCapsulePage} />
      </Route>
      <Route path="/onboarding">
        <ProtectedRoute path="/onboarding" component={OnboardingPage} />
      </Route>
      <Route path="/edit-profile">
        <ProtectedRoute path="/edit-profile" component={EditProfilePage} />
      </Route>
      <Route path="/musk-testing">
        <ProtectedRoute path="/musk-testing" component={MuskTestingPage} />
      </Route>
      {/* Test route for nowboard integration */}
      <Route path="/test-nowboard">
        <ProtectedRoute path="/test-nowboard" component={TestNowboardPage} />
      </Route>
      {/* Screen Testing Page */}
      <Route path="/screen-testing">
        <ProtectedRoute path="/screen-testing" component={ScreenTestingPage} />
      </Route>
      {/* Unified Profile Page with comprehensive data fetching */}
      <Route path="/unified-profile">
        <ProtectedRoute path="/unified-profile" component={UnifiedProfilePage} />
      </Route>
      <Route path="/unified-profile/:userId">
        {(params) => <ProtectedRoute path="/unified-profile/:userId" component={() => <UnifiedProfilePage />} />}
      </Route>
      {/* Shared Quantum Card View route */}
      <Route path="/profile/card/:userId">
        {(params) => (
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="w-[280px] aspect-[2/3.5] rounded-lg overflow-hidden shadow-lg">
                <div className="h-[24%] bg-gray-300 dark:bg-gray-700 relative animate-pulse"></div>
                <div className="bg-white dark:bg-gray-800 h-[76%] p-5 flex flex-col gap-4">
                  <div className="h-5 w-[70%] bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 w-[50%] bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-24 w-full bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 w-[80%] bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 w-[60%] bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          }>
            <SharedCardPage userId={params.userId} />
          </Suspense>
        )}
      </Route>
      {/* Brand of the Day is now integrated into Nowboard panel */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Add a root-level Suspense boundary to ensure we never show a white screen
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="w-[280px] aspect-[2/3.5] rounded-lg overflow-hidden shadow-lg">
              <div className="h-[24%] bg-gray-300 dark:bg-gray-700 relative animate-pulse"></div>
              <div className="bg-white dark:bg-gray-800 h-[76%] p-5 flex flex-col gap-4">
                <div className="h-5 w-[70%] bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-4 w-[50%] bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-24 w-full bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-4 w-[80%] bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-4 w-[60%] bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        }>
          <Router />
          <GlobalMuskButton />
          <Toaster />
        </Suspense>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
