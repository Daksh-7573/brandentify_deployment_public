import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./context/simple-auth-context";
import { useAuth } from "./hooks/use-auth";
import { useEffect, Suspense, lazy, useState } from "react";
import GlobalMuskButton from "@/components/musk/global-musk-button";
// DomainHelper removed - Firebase disabled, using custom OAuth only
// import { DomainHelper } from "./lib/domain-helper";
import { DomainAuthHelper } from "@/components/firebase/DomainAuthHelper";
import { FeedSkeleton } from "@/components/ui/skeleton-components";
import AuthCallback from "@/pages/auth-callback";
import CatchAllAuthHandler from "@/routes/CatchAllAuthHandler";
import { CareerCapsulePageSkeleton } from "@/components/ui/page-skeletons/career-capsule-skeleton";
import { ResumeParserPageSkeleton } from "@/components/ui/page-skeletons/resume-parser-skeleton";
import { ServicesPageSkeleton } from "@/components/ui/page-skeletons/services-skeleton";
import { DashboardPageSkeleton } from "@/components/ui/page-skeletons/dashboard-skeleton";
import { ChatPageSkeleton } from "@/components/ui/page-skeletons/chat-skeleton";
import { SearchPageSkeleton } from "@/components/ui/page-skeletons/search-skeleton";
import { QuestPageSkeleton } from "@/components/ui/page-skeletons/quest-skeleton";
import { ProfilePageSkeleton } from "@/components/ui/page-skeletons/profile-skeleton";
import { PortfolioPageSkeleton } from "@/components/ui/page-skeletons/portfolio-skeleton";
import { CreatePulsePageSkeleton } from "@/components/ui/page-skeletons/create-pulse-skeleton";
import { PricingPageSkeleton } from "@/components/ui/page-skeletons/pricing-skeleton";
import { ConnectionsPageSkeleton } from "@/components/ui/page-skeletons/connections-skeleton";
import { MessagingPageSkeleton } from "@/components/ui/page-skeletons/messaging-skeleton";
import { BrandScorePageSkeleton } from "@/components/ui/page-skeletons/brand-score-skeleton";
import { NowboardPageSkeleton } from "@/components/ui/page-skeletons/nowboard-skeleton";

// Enhanced progressive loading state management
const useProgressiveLoading = () => {
  const [coreLoaded, setCoreLoaded] = useState(false);
  const [secondaryLoaded, setSecondaryLoaded] = useState(false);
  const [adminLoaded, setAdminLoaded] = useState(false);

  useEffect(() => {
    const perfStart = performance.now();
    console.log('[Progressive Loading] Starting tiered component loading');
    
    // Tier 1: Critical components load immediately
    setCoreLoaded(true);
    console.log('[Progressive Loading] ⚡ Core components ready');
    
    // Tier 2: Secondary components after first paint
    const secondaryTimer = setTimeout(() => {
      setSecondaryLoaded(true);
      console.log('[Progressive Loading] 🚀 Secondary components loaded');
    }, 50); // Reduced from 100ms for faster perceived performance
    
    // Tier 3: Admin/debug components load last
    const adminTimer = setTimeout(() => {
      setAdminLoaded(true);
      console.log(`[Progressive Loading] 🔧 All components loaded in ${(performance.now() - perfStart).toFixed(2)}ms`);
    }, 200);

    return () => {
      clearTimeout(secondaryTimer);
      clearTimeout(adminTimer);
    };
  }, []);

  return { coreLoaded, secondaryLoaded, adminLoaded };
};

// Simple test component to verify React is working
function SimpleTestApp() {
  console.log("Simple React app mounted successfully");
  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Brandentifier Loading Test</h1>
      <p>If you see this, React is working correctly.</p>
      <p>Server is running and frontend is connecting properly.</p>
    </div>
  );
}

// Critical components (loaded first for fast perceived performance)
const Landing = lazy(() => import("@/pages/landing"));
const IndustryPulsePage = lazy(() => import("@/pages/industry-pulse-new"));
const PulseDetail = lazy(() => import("@/pages/pulse-detail"));
const Profile = lazy(() => import("@/pages/profile"));
const AuthPage = lazy(() => import("@/pages/auth-page"));
const AuthCallbackPage = lazy(() => import("@/pages/auth-callback"));

// Secondary components (loaded after first paint)
const NotFound = lazy(() => import("@/pages/not-found"));
const ProfileNeo = lazy(() => import("@/pages/profile-neo"));
const PublicProfile = lazy(() => import("@/pages/public-profile"));
const BrandProfile = lazy(() => import("@/pages/brand-profile"));
const ProfileResolver = lazy(() => import("@/pages/profile-resolver"));
const CareerTools = lazy(() => import("@/pages/career-tools"));
const RandomProfile = lazy(() => import("@/pages/random-profile"));
const PortfolioBuilder = lazy(() => import("@/pages/portfolio-builder"));
const DesignerPortfolio = lazy(() => import("@/pages/designer-portfolio"));
const CreatePulsePage = lazy(() => import("@/pages/create-pulse-new"));
const SearchPage = lazy(() => import("@/pages/search-fixed"));
const EmailVerification = lazy(() => import("@/pages/email-verification"));
const PricingPage = lazy(() => import("@/pages/pricing"));
const SubscriptionManagePage = lazy(() => import("@/pages/subscription-manage"));
const SubscriptionSuccessPage = lazy(() => import("@/pages/subscription-success"));
const CheckoutPage = lazy(() => import("@/pages/checkout"));

// Admin and debug components (lowest priority)
const NavigationTest = lazy(() => import("@/pages/navigation-test"));
const URLInputDemo = lazy(() => import("@/pages/url-input-demo"));
const NewsSourcesPage = lazy(() => import("@/pages/news-sources"));
const LoginPage = lazy(() => import("@/pages/login"));
const AuthStatusPage = lazy(() => import("@/pages/auth-status"));



const DevLoginPage = lazy(() => import("@/pages/dev-login"));
const SimpleLoginPage = lazy(() => import("@/pages/simple-login"));
const ReliableLoginPage = lazy(() => import("@/pages/reliable-login"));
const UniversalLoginPage = lazy(() => import("@/pages/universal-login"));
const SimpleUniversalLoginPage = lazy(() => import("@/pages/simple-universal-login"));
const EasyLoginPage = lazy(() => import("@/pages/easy-login"));
const GoogleAuthFixPage = lazy(() => import("@/pages/google-auth-fix"));
const ReplitDomainLogin = lazy(() => import("@/pages/replit-domain-login"));
const UniversalGoogleAuthPage = lazy(() => import("@/pages/universal-google-auth"));
const CrossDomainGoogleAuth = lazy(() => import("@/pages/cross-domain-google-auth"));
const ReplitRedirectAuth = lazy(() => import("@/pages/replit-redirect-auth"));
const GoogleRedirectOnly = lazy(() => import("@/pages/google-redirect-only"));
const DomainDebug = lazy(() => import("@/pages/domain-debug"));
const FinalReplitAuth = lazy(() => import("@/pages/final-replit-auth"));
const Radar = lazy(() => import("@/pages/radar"));
const FirebaseAuthTest = lazy(() => import("@/pages/auth-test"));
const GoogleAuthTest = lazy(() => import("@/pages/google-auth-test"));
const GoogleAuthDebug = lazy(() => import("@/pages/google-auth-debug"));
const AuthCleaner = lazy(() => import("@/pages/auth-cleaner"));
const SmartConnectPage = lazy(() => import("@/pages/smart-connect"));
const MuskMatchPage = lazy(() => import("@/pages/musk-match"));
const ResumePage = lazy(() => import("@/pages/resume"));
const ResumeCV = lazy(() => import("@/pages/resume-cv"));
const ResumeEditor = lazy(() => import("@/pages/resume-editor"));
const UnifiedProfilePage = lazy(() => import("@/pages/unified-profile"));
const CareerQuestsPage = lazy(() => import("@/pages/career-quests"));
const BrandQuestsPage = lazy(() => import("@/pages/brand-quests"));
const CareerCapsulePage = lazy(() => import("@/pages/career-capsule"));
const QuantumCardPage = lazy(() => import("@/pages/quantum-card"));
const OnboardingPage = lazy(() => import("@/pages/onboarding"));
const OnboardingFlowPage = lazy(() => import("@/pages/onboarding-flow"));
const EditProfilePage = lazy(() => import("@/pages/edit-profile"));
const MuskTestingPage = lazy(() => import("@/pages/musk-testing"));
const ManageServicesPage = lazy(() => import("@/pages/manage-services"));
import AddServicePage from "@/pages/add-service";
// TestNowboardPage import removed as it's no longer needed
import ChatPage from "@/pages/ChatPage"; // Chat messaging feature
import ConnectionsPage from "@/pages/ConnectionsPage"; // Connections management
import PrivacyPage from "@/pages/privacy"; // Privacy & Data Control page
// Quest Demo Page removed per request
import CookieConsentBanner from "@/components/privacy/cookie-consent-banner"; // Cookie consent banner
import DirectUsersPage from "@/pages/direct-users"; // Direct access to users (debugging)
import DirectContentPage from "@/pages/direct-content"; // Direct access to content items (debugging)
import DirectContentManagementPage from "@/pages/direct-content-management"; // Direct content management (debugging)
import NeoGlassDemoPage from "@/pages/neo-glass-demo"; // Neo-Glass UI demo page
import NeoGlassSpotifyDemoPage from "@/pages/neo-glass-demo-spotify"; // Spotify-style Neo-Glass UI demo
import NeoGlassFormDemoPage from "@/pages/neo-glass-form-demo"; // Neo-Glass Form UI demo
import NeoGlassDemoMainPage from "@/pages/neo-glass-demo-main"; // Main platform styled Neo-Glass UI demo
import NeoGlassSimplePage from "@/pages/neo-glass-simple"; // Simple Neo-Glass demo without dependencies
import PitchDeckDownload from "@/pages/pitch-deck-download"; // Pitch deck download page
// Lazy load the SharedCardPage to improve performance and show loader immediately
const SharedCardPage = lazy(() => import("@/pages/shared-card"));
// Referral join page
const JoinReferralPage = lazy(() => import("@/pages/join-referral"));
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
      console.log('User not authenticated, redirecting to auth page');
      navigate('/auth');
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  // Render component immediately - it will show page-specific skeleton during data loading
  // Only block if we've confirmed user is NOT authenticated
  if (!isLoading && !isAuthenticated) {
    return null;
  }
  
  return <Component />;
}

function Router() {
  const { coreLoaded, secondaryLoaded, adminLoaded } = useProgressiveLoading();
  
  return (
    <Switch>
      {/* Tier 1: Critical Routes (Always Available) */}
      <Route path="/" component={Landing} />
      <Route path="/nav-test" component={NavigationTest} />
      <Route path="/url-demo" component={URLInputDemo} />
      <Route path="/industry-pulse" component={() => (
        <ProtectedRoute path="/industry-pulse" component={IndustryPulsePage} />
      )} />
      <Route path="/pulse/:id" component={PulseDetail} />
      <Route path="/create-pulse" component={() => (
        <ProtectedRoute path="/create-pulse" component={CreatePulsePage} />
      )} />
      <Route path="/create-pulse-new" component={() => (
        <ProtectedRoute path="/create-pulse-new" component={CreatePulsePage} />
      )} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/auth-success" component={() => {
        const AuthSuccessPage = lazy(() => import('./pages/auth-success'));
        return <ProtectedRoute path="/services" component={ManageServicesPage} />
      )} />
      
      <Route path="/add-service" component={() => (
        <ProtectedRoute path="/add-service" component={AddServicePage} />
      )} />
      
      {/* Dashboard route - direct to Industry Pulse */}
      <Route path="/dashboard" component={() => (
        <ProtectedRoute path="/dashboard" component={IndustryPulsePage} />
      )} />
      
      <Route path="/news-sources" component={() => (
        <ProtectedRoute path="/news-sources" component={NewsSourcesPage} />
      )} />
      
      {/* Additional system routes */}
      <Route path="/radar" component={() => (
        <ProtectedRoute path="/radar" component={Radar} />
      )} />
      
      <Route path="/musk-match" component={() => (
        <ProtectedRoute path="/musk-match" component={MuskMatchPage} />
      )} />
      
      <Route path="/resume-builder" component={() => (
        <ProtectedRoute path="/resume-builder" component={ResumePage} />
      )} />
      
      <Route path="/brand-quests" component={() => (
        <ProtectedRoute path="/brand-quests" component={BrandQuestsPage} />
      )} />
      
      {/* Legacy route - keeping for backward compatibility */}
      <Route path="/career-quests">
        <ProtectedRoute path="/career-quests" component={BrandQuestsPage} />
      </Route>
      <Route path="/career-capsule">
        <ProtectedRoute path="/career-capsule" component={CareerCapsulePage} />
      </Route>
      {/* Quantum Card route - dedicated digital visiting card feature */}
      <Route path="/quantum-card">
        <ProtectedRoute path="/quantum-card" component={QuantumCardPage} />
      </Route>
      {/* Replaced with Career Capsule - keeping both routes for backward compatibility */}
      <Route path="/career-roadmap">
        <ProtectedRoute path="/career-roadmap" component={CareerCapsulePage} />
      </Route>
      <Route path="/onboarding">
        <ProtectedRoute path="/onboarding" component={OnboardingFlowPage} />
      </Route>
      <Route path="/onboarding-old">
        <ProtectedRoute path="/onboarding-old" component={OnboardingPage} />
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
      {/* Connections management */}
      <Route path="/connections">
        <ProtectedRoute path="/connections" component={ConnectionsPage} />
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
      
      {/* Profile Quest Routes - Nested under profile */}
      <Route path="/profile/:userId/quests">
        {(params) => <ProtectedRoute path="/profile/:userId/quests" component={() => <BrandQuestsPage />} />}
      </Route>
      
      {/* Admin Panel Routes - Using lazy loading */}
      <Route path="/admin">
        <ProtectedRoute path="/admin" component={() => {
          const AdminLayout = lazy(() => import("@/pages/admin/layout"));
          const AdminDashboard = lazy(() => import("@/pages/admin/index"));
          const AdminCheck = lazy(() => import("@/middleware/admin-check").then(mod => ({ default: mod.AdminCheck })));
          
          const AdminDashboardWithLayout = () => (
            <Suspense fallback={<DashboardPageSkeleton />}>
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
            <Suspense fallback={<DashboardPageSkeleton />}>
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
            <Suspense fallback={<DashboardPageSkeleton />}>
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
            <Suspense fallback={<DashboardPageSkeleton />}>
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
            <Suspense fallback={<DashboardPageSkeleton />}>
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
            <Suspense fallback={<DashboardPageSkeleton />}>
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
            <Suspense fallback={<DashboardPageSkeleton />}>
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
      
      {/* Pitch Deck Download page */}
      <Route path="/pitch-deck-download" component={PitchDeckDownload} />
      
      {/* Shared Quantum Card View route */}
      <Route path="/profile/card/:userId">
        {(params) => (
          <Suspense fallback={<DashboardPageSkeleton />}>
            <SharedCardPage userId={params.userId} />
          </Suspense>
        )}
      </Route>
      {/* Brand of the Day is now integrated into Nowboard panel */}
      
      {/* Add catch-all route for handling any Google Auth redirects with common Firebase paths */}
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
      
      {/* Random profile link route */}
      <Route path="/r/:randomLink">
        {(params) => (
          <Suspense fallback={<DashboardPageSkeleton />}>
            <RandomProfile />
          </Suspense>
        )}
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
        <Suspense fallback={<DashboardPageSkeleton />}>
          <Router />
          <GlobalMuskButton />
          {/* DomainHelper removed - Firebase disabled */}
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
