import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./context/auth-context";
import { useAuth } from "./hooks/use-auth";
import { useEffect } from "react";
import GlobalMuskButton from "@/components/musk/global-musk-button";
import { DomainHelper } from "./lib/domain-helper";
import { DomainAuthHelper } from "@/components/firebase/DomainAuthHelper";
import AuthCallback from "@/pages/auth-callback";
import CatchAllAuthHandler from "@/routes/CatchAllAuthHandler";

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
import FirebaseAuthTest from "@/pages/auth-test";
import SmartConnectPage from "@/pages/smart-connect";
import MuskMatchPage from "@/pages/musk-match";
import ResumePage from "@/pages/resume";
import ResumeCV from "@/pages/resume-cv";
import ResumeEditor from "@/pages/resume-editor";
// Resume Parser page removed per request
import UnifiedProfilePage from "@/pages/unified-profile";
import FeedTestPage from "@/pages/feed-test";
import CareerQuestsPage from "@/pages/career-quests";
import BrandQuestsPage from "@/pages/brand-quests";
import CareerCapsulePage from "@/pages/career-capsule"; // Career Capsule feature (renamed from Roadmap)
import OnboardingPage from "@/pages/onboarding";
import EditProfilePage from "@/pages/edit-profile";
import MuskTestingPage from "@/pages/musk-testing";
import ManageServicesPage from "@/pages/manage-services";
// TestNowboardPage import removed as it's no longer needed
import ChatPage from "@/pages/ChatPage"; // Chat messaging feature
import PrivacyPage from "@/pages/privacy"; // Privacy & Data Control page
// Quest Demo Page removed per request
import CookieConsentBanner from "@/components/privacy/cookie-consent-banner"; // Cookie consent banner
import DirectUsersPage from "@/pages/direct-users"; // Direct access to users (debugging)
import DirectContentPage from "@/pages/direct-content"; // Direct access to content items (debugging)
import DirectContentManagementPage from "@/pages/direct-content-management"; // Direct content management (debugging)
import NeoGlassDemoPage from "@/pages/neo-glass-demo"; // Neo-Glass UI demo page
// Lazy load the SharedCardPage to improve performance and show loader immediately
import { lazy, Suspense } from "react";
const SharedCardPage = lazy(() => import("@/pages/shared-card"));
// Brand of the Day is now integrated into Nowboard

// Custom redirect component to handle page redirects
const PageRedirect = ({ to }: { to: string }) => {
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
      {/* Add multiple routes to catch all possible auth callback paths */}
      <Route path="/auth-callback" component={AuthCallback} />
      <Route path="/__/auth/handler" component={AuthCallback} />
      <Route path="/_/auth/callback" component={AuthCallback} />
      <Route path="/auth/callback" component={AuthCallback} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/auth-test" component={FirebaseAuthTest} />
      <Route path="/auth-debug" component={() => {
        const AuthDebugPage = lazy(() => import("@/pages/auth-debug"));
        return (
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
            <AuthDebugPage />
          </Suspense>
        );
      }} />
      <Route path="/auth-popup-debug" component={() => {
        const AuthPopupDebugPage = lazy(() => import("@/pages/auth-popup-debug"));
        return (
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
            <AuthPopupDebugPage />
          </Suspense>
        );
      }} />
      <Route path="/verify-email" component={EmailVerification} />
      {/* Quest demo route removed per request */}
      <Route path="/dashboard">
        <ProtectedRoute path="/dashboard" component={() => {
          const [_, navigate] = useLocation();
          useEffect(() => {
            navigate("/industry-pulse");
          }, [navigate]);
          return <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>;
        }} />
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
      {/* Resume parser route removed per request */}
      <Route path="/feed-test">
        <ProtectedRoute path="/feed-test" component={FeedTestPage} />
      </Route>
      {/* Brand Quests - All demo mode functionality removed */}
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
      {/* Removed Test route for nowboard integration as it's now part of quests */}
      {/* Messaging feature */}
      <Route path="/messages">
        <ProtectedRoute path="/messages" component={ChatPage} />
      </Route>
      {/* Privacy & Data Control page */}
      <Route path="/privacy">
        <ProtectedRoute path="/privacy" component={PrivacyPage} />
      </Route>
      
      {/* Direct access to users for debugging */}
      <Route path="/direct-users" component={DirectUsersPage} />
      
      {/* Direct access to content for debugging */}
      <Route path="/direct-content" component={DirectContentPage} />
      {/* Direct access to content management for debugging */}
      <Route path="/direct-content-management" component={DirectContentManagementPage} />
      {/* Unified Profile Page with comprehensive data fetching */}
      <Route path="/unified-profile">
        <ProtectedRoute path="/unified-profile" component={UnifiedProfilePage} />
      </Route>
      <Route path="/unified-profile/:userId">
        {(params) => <ProtectedRoute path="/unified-profile/:userId" component={() => <UnifiedProfilePage />} />}
      </Route>
      
      {/* Admin Panel Routes - Using lazy loading */}
      <Route path="/admin">
        <ProtectedRoute path="/admin" component={() => {
          const AdminLayout = lazy(() => import("@/pages/admin/layout"));
          const AdminDashboard = lazy(() => import("@/pages/admin/index"));
          const AdminCheck = lazy(() => import("@/middleware/admin-check").then(mod => ({ default: mod.AdminCheck })));
          
          const AdminDashboardWithLayout = () => (
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
              <AdminCheck>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </AdminCheck>
            </Suspense>
          );
          
          return <AdminDashboardWithLayout />;
        }} />
      </Route>
      <Route path="/admin/users">
        <ProtectedRoute path="/admin/users" component={() => {
          const AdminLayout = lazy(() => import("@/pages/admin/layout"));
          const AdminUsers = lazy(() => import("@/pages/admin/users"));
          const AdminCheck = lazy(() => import("@/middleware/admin-check").then(mod => ({ default: mod.AdminCheck })));
          
          const AdminUsersWithLayout = () => (
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
              <AdminCheck>
                <AdminLayout>
                  <AdminUsers />
                </AdminLayout>
              </AdminCheck>
            </Suspense>
          );
          
          return <AdminUsersWithLayout />;
        }} />
      </Route>
      {/* Content Management page using our direct API approach */}
      <Route path="/admin/content">
        <ProtectedRoute path="/admin/content" component={() => {
          const AdminLayout = lazy(() => import("@/pages/admin/layout"));
          const AdminContentNew = lazy(() => import("@/pages/admin/content-new"));
          const AdminCheck = lazy(() => import("@/middleware/admin-check").then(mod => ({ default: mod.AdminCheck })));
          
          const AdminContentWithLayout = () => (
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
              <AdminCheck>
                <AdminLayout>
                  <AdminContentNew />
                </AdminLayout>
              </AdminCheck>
            </Suspense>
          );
          
          return <AdminContentWithLayout />;
        }} />
      </Route>
      <Route path="/admin/analytics">
        <ProtectedRoute path="/admin/analytics" component={() => {
          const AdminLayout = lazy(() => import("@/pages/admin/layout"));
          const AdminCheck = lazy(() => import("@/middleware/admin-check").then(mod => ({ default: mod.AdminCheck })));
          
          const AdminAnalytics = () => (
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
              <AdminCheck>
                <AdminLayout>
                  <AnalyticsDashboard />
                </AdminLayout>
              </AdminCheck>
            </Suspense>
          );
          
          const AnalyticsDashboard = lazy(() => import("@/pages/admin/analytics-new"));
          
          return <AdminAnalytics />;
        }} />
      </Route>
      {/* Additional route for direct access to analytics-new for debugging */}
      <Route path="/admin/analytics-new">
        <ProtectedRoute path="/admin/analytics-new" component={() => {
          const AdminLayout = lazy(() => import("@/pages/admin/layout"));
          const AdminCheck = lazy(() => import("@/middleware/admin-check").then(mod => ({ default: mod.AdminCheck })));
          
          const AdminAnalytics = () => (
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
              <AdminCheck>
                <AdminLayout>
                  <AnalyticsDashboard />
                </AdminLayout>
              </AdminCheck>
            </Suspense>
          );
          
          const AnalyticsDashboard = lazy(() => import("@/pages/admin/analytics-new"));
          
          return <AdminAnalytics />;
        }} />
      </Route>
      <Route path="/admin/settings">
        <ProtectedRoute path="/admin/settings" component={() => {
          const AdminLayout = lazy(() => import("@/pages/admin/layout"));
          const AdminCheck = lazy(() => import("@/middleware/admin-check").then(mod => ({ default: mod.AdminCheck })));
          
          const AdminSettings = () => (
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
              <AdminCheck>
                <AdminLayout>
                  <SettingsPage />
                </AdminLayout>
              </AdminCheck>
            </Suspense>
          );
          
          const SettingsPage = lazy(() => import("@/pages/admin/settings"));
          
          return <AdminSettings />;
        }} />
      </Route>
      <Route path="/admin/roles">
        <ProtectedRoute path="/admin/roles" component={() => {
          const AdminLayout = lazy(() => import("@/pages/admin/layout"));
          const AdminCheck = lazy(() => import("@/middleware/admin-check").then(mod => ({ default: mod.AdminCheck })));
          
          const AdminRoles = () => (
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
              <AdminCheck>
                <AdminLayout>
                  <RolesManagement />
                </AdminLayout>
              </AdminCheck>
            </Suspense>
          );
          
          const RolesManagement = lazy(() => import("@/pages/admin/roles"));
          
          return <AdminRoles />;
        }} />
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
      
      {/* Add catch-all route for handling any Google Auth redirects with common Firebase paths */}
      <Route path="/__/auth/handler">
        <CatchAllAuthHandler />
      </Route>
      <Route path="/_/auth/*">
        <CatchAllAuthHandler />
      </Route>
      <Route path="/auth/callback/*">
        <CatchAllAuthHandler />
      </Route>
      <Route path="/oauth/callback/*">
        <CatchAllAuthHandler />
      </Route>
      <Route path="/auth-callback/*">
        <CatchAllAuthHandler />
      </Route>
      <Route path="/signin-callback">
        <CatchAllAuthHandler />
      </Route>
      
      {/* Default 404 route */}
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
          <DomainHelper />
          <DomainAuthHelper />
          <Toaster />
          {/* Cookie Consent Banner - shown based on user's consent status */}
          <CookieConsentBanner />
        </Suspense>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
