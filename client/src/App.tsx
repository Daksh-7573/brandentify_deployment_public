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
import { AppShell } from "@/components/layout/app-shell";
const AuthCallback = lazy(() => import("@/pages/auth-callback"));
const CatchAllAuthHandler = lazy(() => import("@/routes/CatchAllAuthHandler"));

// Custom redirect component to handle page redirects
const PageRedirect = ({ to }: { to: string }) => {
  const [_, navigate] = useLocation();
  
  useEffect(() => {
    navigate(to);
  }, [navigate, to]);
  
  return null;
};

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
      // Prefetch critical data once secondary components are ready
      const userId = localStorage.getItem('userId');
      if (userId) {
        import("@/lib/route-prefetch").then(({ prefetchProfileData, prefetchCommonRoutes, prefetchRoute }) => {
          // Wrap in requestIdleCallback if available for zero impact on main thread
          const prefetch = () => {
            prefetchProfileData(userId);
            prefetchCommonRoutes();
            ["/industry-pulse", "/profile", "/brand-quests", "/search", "/career-capsule", "/radar", "/messaging"].forEach(route => prefetchRoute(route));
          };
          
          if ('requestIdleCallback' in window) {
            (window as any).requestIdleCallback(prefetch);
          } else {
            setTimeout(prefetch, 50);
          }
        });
      }
    }, 1); // Maximum speed secondary load
    
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
const ProfileNeo = lazy(() => import("@/pages/profile-neo"));
const AuthPage = lazy(() => import("@/pages/auth-page"));
const AuthCallbackPage = lazy(() => import("@/pages/auth-callback"));

// Secondary components (loaded after first paint)
const NotFound = lazy(() => import("@/pages/not-found"));
const Profile = lazy(() => import("@/pages/profile"));
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
const AddServicePage = lazy(() => import("@/pages/add-service"));
const ChatPage = lazy(() => import("@/pages/ChatPage"));
const ConnectionsPage = lazy(() => import("@/pages/ConnectionsPage"));
const PrivacyPage = lazy(() => import("@/pages/privacy"));
const DirectUsersPage = lazy(() => import("@/pages/direct-users"));
const DirectContentPage = lazy(() => import("@/pages/direct-content"));
const DirectContentManagementPage = lazy(() => import("@/pages/direct-content-management"));
const NeoGlassDemoPage = lazy(() => import("@/pages/neo-glass-demo"));
const NeoGlassSpotifyDemoPage = lazy(() => import("@/pages/neo-glass-demo-spotify"));
const NeoGlassFormDemoPage = lazy(() => import("@/pages/neo-glass-form-demo"));
const NeoGlassDemoMainPage = lazy(() => import("@/pages/neo-glass-demo-main"));
const NeoGlassSimplePage = lazy(() => import("@/pages/neo-glass-simple"));
const PitchDeckDownload = lazy(() => import("@/pages/pitch-deck-download"));
const DocsDownload = lazy(() => import("@/pages/docs-download"));
const CookieConsentBanner = lazy(() => import("@/components/privacy/cookie-consent-banner"));
// Lazy load the SharedCardPage to improve performance and show loader immediately
const SharedCardPage = lazy(() => import("@/pages/shared-card"));
// Referral join page
const JoinReferralPage = lazy(() => import("@/pages/join-referral"));
// Brand of the Day is now integrated into Nowboard


import { DynamicPageSkeleton } from "@/components/ui/dynamic-page-skeleton";
import { MuskLoadingShell, MuskLoadingCompact } from "@/components/ui/musk-loading-shell";

// Loading placeholder - shows AppShell with dynamic skeleton while page code is loading
const LoadingPlaceholder = () => {
  const [location] = useLocation();
  return <DynamicPageSkeleton route={location} />;
};

// Minimal loading placeholder without shell for public pages
const MinimalLoadingPlaceholder = () => (
  <MuskLoadingShell />
);

// Lazy route wrapper - handles Suspense for any lazy component
function LazyRoute({ component: Component, withShell = false }: { component: React.ComponentType; withShell?: boolean }) {
  const [location] = useLocation();
  const suspenseFallback = <DynamicPageSkeleton route={location} />;

  if (withShell) {
    return (
      <AppShell>
        <Suspense fallback={<div className="flex-1" />}>
          <Component />
        </Suspense>
      </AppShell>
    );
  }
  return (
    <Suspense fallback={<MinimalLoadingPlaceholder />}>
      <Component />
    </Suspense>
  );
}

// Protected route component that checks if the user is authenticated
// Wraps all protected pages in AppShell for consistent layout
// Includes Suspense boundary to support lazy-loaded components
function ProtectedRoute({ component: Component, fallback, noShell, ...rest }: { component: React.ComponentType, path: string, fallback?: React.ReactNode, noShell?: boolean }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [_, navigate] = useLocation();
  const [location] = useLocation();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log('User not authenticated, redirecting to auth page');
      navigate('/auth');
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  // Default fallback for lazy loading
  const suspenseFallback = fallback || <DynamicPageSkeleton route={location} />;
  
  // During auth check, show loading state
  if (isLoading) {
    if (noShell) {
      return <>{suspenseFallback}</>;
    }
    return (
      <AppShell>
        {suspenseFallback}
      </AppShell>
    );
  }
  
  // Only block if we've confirmed user is NOT authenticated
  if (!isAuthenticated) {
    return null;
  }
  
  // Wrap page in AppShell and Suspense for consistent header, background, and lazy loading support
  if (noShell) {
    return (
      <Suspense fallback={<>{suspenseFallback}</>}>
        <Component />
      </Suspense>
    );
  }
  
  return (
    <AppShell>
      <Suspense fallback={suspenseFallback}>
        <Component />
      </Suspense>
    </AppShell>
  );
}

function Router() {
  const { coreLoaded, secondaryLoaded, adminLoaded } = useProgressiveLoading();
  
  return (
    <Switch>
      {/* Landing page */}
      <Route path="/">
        {() => (
          <Suspense fallback={<LoadingPlaceholder />}>
            <LazyRoute component={Landing} />
          </Suspense>
        )}
      </Route>
      <Route path="/nav-test">
        {() => (
          <Suspense fallback={<LoadingPlaceholder />}>
            <LazyRoute component={NavigationTest} />
          </Suspense>
        )}
      </Route>
      <Route path="/url-demo">
        {() => (
          <Suspense fallback={<LoadingPlaceholder />}>
            <LazyRoute component={URLInputDemo} />
          </Suspense>
        )}
      </Route>
      
      <Route path="/profile">
        {() => (
          <Suspense fallback={<LoadingPlaceholder />}>
            <ProtectedRoute path="/profile" component={ProfileNeo} />
          </Suspense>
        )}
      </Route>
      <Route path="/industry-pulse">
        {() => (
          <Suspense fallback={<LoadingPlaceholder />}>
            <ProtectedRoute path="/industry-pulse" component={IndustryPulsePage} />
          </Suspense>
        )}
      </Route>
      <Route path="/pulse/:id">
        {(params) => (
          <Suspense fallback={<LoadingPlaceholder />}>
            <LazyRoute component={PulseDetail} withShell />
          </Suspense>
        )}
      </Route>
      <Route path="/create-pulse">
        {() => (
          <Suspense fallback={<LoadingPlaceholder />}>
            <ProtectedRoute path="/create-pulse" component={CreatePulsePage} />
          </Suspense>
        )}
      </Route>
      <Route path="/create-pulse-new">
        {() => (
          <Suspense fallback={<LoadingPlaceholder />}>
            <ProtectedRoute path="/create-pulse-new" component={CreatePulsePage} />
          </Suspense>
        )}
      </Route>
      <Route path="/auth" component={() => <LazyRoute component={AuthPage} />} />
      <Route path="/auth-success" component={() => {
        const AuthSuccessPage = lazy(() => import('./pages/auth-success'));
        return <Suspense fallback={<LoadingPlaceholder />}><AuthSuccessPage /></Suspense>;
      }} />
      {/* Referral join link handler */}
      <Route path="/join/:code">
        {(params) => (
          <Suspense fallback={<LoadingPlaceholder />}>
            <JoinReferralPage code={params.code} />
          </Suspense>
        )}
      </Route>



      <Route path="/auth-test" component={() => {
        const AuthTest = lazy(() => import("@/pages/auth-test"));
        return (
          <Suspense fallback={<LoadingPlaceholder />}>
            <AuthTest />
          </Suspense>
        );
      }} />
      <Route path="/simple-auth-test" component={() => {
        const SimpleAuthTest = lazy(() => import("@/pages/simple-auth-test"));
        return (
          <Suspense fallback={<LoadingPlaceholder />}>
            <SimpleAuthTest />
          </Suspense>
        );
      }} />
      <Route path="/auth-popup-fix" component={() => {
        const AuthPopupFix = lazy(() => import("@/pages/auth-popup-fix"));
        return (
          <Suspense fallback={<LoadingPlaceholder />}>
            <AuthPopupFix />
          </Suspense>
        );
      }} />
      <Route path="/auth-flow-test" component={() => {
        const AuthFlowTest = lazy(() => import("@/pages/auth-flow-test"));
        return (
          <Suspense fallback={<LoadingPlaceholder />}>
            <AuthFlowTest />
          </Suspense>
        );
      }} />
      <Route path="/auth-debug-detailed" component={() => {
        const AuthDebugDetailed = lazy(() => import("@/pages/auth-debug-detailed"));
        return (
          <Suspense fallback={<LoadingPlaceholder />}>
            <AuthDebugDetailed />
          </Suspense>
        );
      }} />
      <Route path="/auth-enhanced-popup" component={() => {
        const AuthEnhancedPopup = lazy(() => import("@/pages/auth-enhanced-popup"));
        return (
          <Suspense fallback={<LoadingPlaceholder />}>
            <AuthEnhancedPopup />
          </Suspense>
        );
      }} />
      <Route path="/auth-redirect-test" component={() => {
        const AuthRedirectTest = lazy(() => import("@/pages/auth-redirect-test"));
        return (
          <Suspense fallback={<LoadingPlaceholder />}>
            <AuthRedirectTest />
          </Suspense>
        );
      }} />
      <Route path="/auth-direct-oauth" component={() => {
        const AuthDirectOAuth = lazy(() => import("@/pages/auth-direct-oauth"));
        return (
          <Suspense fallback={<LoadingPlaceholder />}>
            <AuthDirectOAuth />
          </Suspense>
        );
      }} />
      <Route path="/auth-working-test" component={() => {
        const AuthWorkingTest = lazy(() => import("@/pages/auth-working-test"));
        return (
          <Suspense fallback={<LoadingPlaceholder />}>
            <AuthWorkingTest />
          </Suspense>
        );
      }} />

      <Route path="/auth-callback" component={() => <LazyRoute component={AuthCallbackPage} />} />
      <Route path="/_/auth/callback" component={() => <LazyRoute component={AuthCallbackPage} />} />
      <Route path="/auth/callback" component={() => <LazyRoute component={AuthCallbackPage} />} />
      
      {/* Critical routes - must be outside conditional to avoid conflict with /@:username */}
      <Route path="/search">
        {() => (
          <Suspense fallback={<LoadingPlaceholder />}>
            <ProtectedRoute path="/search" component={SearchPage} />
          </Suspense>
        )}
      </Route>
      <Route path="/brand-score">
        {() => {
          const BrandScore = lazy(() => import("@/pages/BrandScore"));
          return (
            <Suspense fallback={<LoadingPlaceholder />}>
              <ProtectedRoute path="/brand-score" component={BrandScore} />
            </Suspense>
          );
        }}
      </Route>
      
      {/* Tier 2: Secondary Routes (Load after 5ms) */}
      {secondaryLoaded && (
        <>
          <Route path="/profile-legacy">
            {() => (
              <ProtectedRoute path="/profile-legacy" component={Profile} />
            )}
          </Route>
          <Route path="/profile/:userId">
            {(params) => (
              <Suspense fallback={<LoadingPlaceholder />}>
                <RandomProfile />
              </Suspense>
            )}
          </Route>
          <Route path="/career-tools">
            {() => (
              <ProtectedRoute path="/career-tools" component={CareerTools} />
            )}
          </Route>
          <Route path="/portfolio-builder">
            {() => (
              <ProtectedRoute path="/portfolio-builder" component={PortfolioBuilder} />
            )}
          </Route>
          <Route path="/designer-portfolio">
            {() => (
              <ProtectedRoute path="/designer-portfolio" component={DesignerPortfolio} />
            )}
          </Route>
          <Route path="/pricing">
            {() => <LazyRoute component={PricingPage} />}
          </Route>
          <Route path="/upgrade">
            {() => <LazyRoute component={PricingPage} />}
          </Route>
          <Route path="/checkout">
            {() => (
              <ProtectedRoute path="/checkout" component={CheckoutPage} />
            )}
          </Route>
          <Route path="/subscription-manage">
            {() => (
              <ProtectedRoute path="/subscription-manage" component={SubscriptionManagePage} />
            )}
          </Route>
          <Route path="/subscription/manage">
            {() => (
              <ProtectedRoute path="/subscription/manage" component={SubscriptionManagePage} />
            )}
          </Route>
          <Route path="/subscription/success">
            {() => (
              <ProtectedRoute path="/subscription/success" component={SubscriptionSuccessPage} />
            )}
          </Route>
        </>
      )}
      
      {/* Tier 3: Admin & Debug Routes (Load after 200ms) */}
      {adminLoaded && (
        <>
          <Route path="/login" component={() => <PageRedirect to="/auth" />} />
          <Route path="/auth-status" component={() => <LazyRoute component={AuthStatusPage} />} />
          <Route path="/dev-login" component={() => <LazyRoute component={DevLoginPage} />} />
          <Route path="/simple-login" component={() => <LazyRoute component={SimpleLoginPage} />} />
          <Route path="/reliable-login" component={() => <LazyRoute component={ReliableLoginPage} />} />
          <Route path="/universal-login" component={() => <LazyRoute component={UniversalLoginPage} />} />
          <Route path="/simple-universal-login" component={() => <LazyRoute component={SimpleUniversalLoginPage} />} />
          <Route path="/easy-login" component={() => <LazyRoute component={EasyLoginPage} />} />
          <Route path="/fixed-login" component={() => {
        const FixedLoginPage = lazy(() => import("@/pages/fixed-login"));
        return (
          <Suspense fallback={<LoadingPlaceholder />}>
            <FixedLoginPage />
          </Suspense>
        );
      }} />
      <Route path="/dev-auth" component={() => {
        const DevAuthUtilityPage = lazy(() => import("@/pages/dev-auth-utility"));
        return (
          <Suspense fallback={<LoadingPlaceholder />}>
            <DevAuthUtilityPage />
          </Suspense>
        );
      }} />
      <Route path="/auth-test" component={() => <LazyRoute component={FirebaseAuthTest} />} />
      <Route path="/google-auth-test" component={() => <LazyRoute component={GoogleAuthTest} />} />
      <Route path="/google-auth-debug" component={() => <LazyRoute component={GoogleAuthDebug} />} />
      <Route path="/auth-cleaner" component={() => <LazyRoute component={AuthCleaner} />} />
      <Route path="/google-auth-fix" component={() => <LazyRoute component={GoogleAuthFixPage} />} />
      <Route path="/universal-google-auth" component={() => <LazyRoute component={UniversalGoogleAuthPage} />} />
      <Route path="/cross-domain-google-auth" component={() => <LazyRoute component={CrossDomainGoogleAuth} />} />
      <Route path="/replit-login" component={() => <LazyRoute component={ReplitDomainLogin} />} />
      <Route path="/replit-redirect-auth" component={() => <LazyRoute component={ReplitRedirectAuth} />} />
      <Route path="/google-login" component={() => <LazyRoute component={GoogleRedirectOnly} />} />
      <Route path="/domain-debug" component={() => <LazyRoute component={DomainDebug} />} />
      <Route path="/replit-auth" component={() => <LazyRoute component={FinalReplitAuth} />} />
      <Route path="/auth-debug" component={() => {
        const AuthDebugPage = lazy(() => import("@/pages/auth-debug"));
        return (
          <Suspense fallback={<LoadingPlaceholder />}>
            <AuthDebugPage />
          </Suspense>
        );
      }} />
      <Route path="/auth-popup-debug" component={() => {
        const AuthPopupDebugPage = lazy(() => import("@/pages/auth-popup-debug"));
        return (
          <Suspense fallback={<LoadingPlaceholder />}>
            <AuthPopupDebugPage />
          </Suspense>
        );
      }} />
          <Route path="/verify-email" component={() => <LazyRoute component={EmailVerification} />} />
        </>
      )}
      
      {/* Routes that should always be available */}
      {/* Profile route - uses resolver to choose between BrandProfile and PublicProfile */}
      <Route path="/@:identifier">
        {(params) => (
          <Suspense fallback={<MinimalLoadingPlaceholder />}>
            <ProfileResolver identifier={params.identifier} />
          </Suspense>
        )}
      </Route>
      
      {/* Additional protected routes */}
      <Route path="/ai-career">
        {() => (
          <Suspense fallback={<LoadingPlaceholder />}>
            <ProtectedRoute path="/ai-career" component={() => {
              const AICareerPage = lazy(() => import("@/pages/ai-career"));
              return (
                <Suspense fallback={<LoadingPlaceholder />}>
                  <AICareerPage />
                </Suspense>
              );
            }} />
          </Suspense>
        )}
      </Route>
      
      <Route path="/smart-connect">
        {() => (
          <Suspense fallback={<LoadingPlaceholder />}>
            <ProtectedRoute path="/smart-connect" component={SmartConnectPage} />
          </Suspense>
        )}
      </Route>
      
      <Route path="/services">
        {() => (
          <Suspense fallback={<LoadingPlaceholder />}>
            <ProtectedRoute path="/services" component={ManageServicesPage} />
          </Suspense>
        )}
      </Route>
      
      <Route path="/add-service">
        {() => (
          <Suspense fallback={<LoadingPlaceholder />}>
            <ProtectedRoute path="/add-service" component={AddServicePage} />
          </Suspense>
        )}
      </Route>
      
      {/* Dashboard route - direct to Industry Pulse */}
      <Route path="/dashboard">
        {() => (
          <Suspense fallback={<LoadingPlaceholder />}>
            <ProtectedRoute path="/dashboard" component={IndustryPulsePage} />
          </Suspense>
        )}
      </Route>
      
      <Route path="/news-sources">
        {() => (
          <Suspense fallback={<LoadingPlaceholder />}>
            <ProtectedRoute path="/news-sources" component={NewsSourcesPage} />
          </Suspense>
        )}
      </Route>
      
      {/* Additional system routes */}
      <Route path="/radar">
        {() => (
          <Suspense fallback={<LoadingPlaceholder />}>
            <ProtectedRoute path="/radar" component={Radar} />
          </Suspense>
        )}
      </Route>
      
      <Route path="/musk-match">
        {() => (
          <Suspense fallback={<LoadingPlaceholder />}>
            <ProtectedRoute path="/musk-match" component={MuskMatchPage} />
          </Suspense>
        )}
      </Route>
      
      <Route path="/resume-builder">
        {() => (
          <Suspense fallback={<LoadingPlaceholder />}>
            <ProtectedRoute path="/resume-builder" component={ResumePage} />
          </Suspense>
        )}
      </Route>
      
      <Route path="/brand-quests">
        {() => (
          <Suspense fallback={<LoadingPlaceholder />}>
            <ProtectedRoute path="/brand-quests" component={BrandQuestsPage} />
          </Suspense>
        )}
      </Route>
      
      {/* Legacy route - keeping for backward compatibility */}
      <Route path="/career-quests">
        {() => (
          <Suspense fallback={<LoadingPlaceholder />}>
            <ProtectedRoute path="/career-quests" component={BrandQuestsPage} />
          </Suspense>
        )}
      </Route>
      <Route path="/career-capsule">
        {() => (
          <Suspense fallback={<LoadingPlaceholder />}>
            <ProtectedRoute path="/career-capsule" component={CareerCapsulePage} />
          </Suspense>
        )}
      </Route>
      {/* Quantum Card route - dedicated digital visiting card feature */}
      <Route path="/quantum-card">
        {() => (
          <Suspense fallback={<LoadingPlaceholder />}>
            <ProtectedRoute path="/quantum-card" component={QuantumCardPage} />
          </Suspense>
        )}
      </Route>
      {/* Replaced with Career Capsule - keeping both routes for backward compatibility */}
      <Route path="/career-roadmap">
        {() => (
          <Suspense fallback={<LoadingPlaceholder />}>
            <ProtectedRoute path="/career-roadmap" component={CareerCapsulePage} />
          </Suspense>
        )}
      </Route>
      <Route path="/onboarding">
        {() => (
          <Suspense fallback={<LoadingPlaceholder />}>
            <ProtectedRoute path="/onboarding" component={OnboardingFlowPage} />
          </Suspense>
        )}
      </Route>
      <Route path="/onboarding-old">
        {() => (
          <Suspense fallback={<LoadingPlaceholder />}>
            <ProtectedRoute path="/onboarding-old" component={OnboardingPage} />
          </Suspense>
        )}
      </Route>
      <Route path="/edit-profile">
        {() => (
          <Suspense fallback={<LoadingPlaceholder />}>
            <ProtectedRoute path="/edit-profile" component={EditProfilePage} />
          </Suspense>
        )}
      </Route>
      <Route path="/musk-testing">
        {() => (
          <Suspense fallback={<LoadingPlaceholder />}>
            <ProtectedRoute path="/musk-testing" component={MuskTestingPage} />
          </Suspense>
        )}
      </Route>
      {/* Removed Test route for nowboard integration as it's now part of quests */}
      {/* Messaging feature */}
      <Route path="/messages">
        {() => (
          <Suspense fallback={<LoadingPlaceholder />}>
            <ProtectedRoute path="/messages" component={ChatPage} />
          </Suspense>
        )}
      </Route>
      {/* Connections management */}
      <Route path="/connections">
        {() => (
          <Suspense fallback={<LoadingPlaceholder />}>
            <ProtectedRoute path="/connections" component={ConnectionsPage} />
          </Suspense>
        )}
      </Route>
      {/* Privacy & Data Control page */}
      <Route path="/privacy">
        {() => (
          <Suspense fallback={<LoadingPlaceholder />}>
            <ProtectedRoute path="/privacy" component={PrivacyPage} />
          </Suspense>
        )}
      </Route>
      
      <Route path="/direct-users">
        {() => (
          <Suspense fallback={<LoadingPlaceholder />}>
            <ProtectedRoute path="/direct-users" component={DirectUsersPage} noShell={false} />
          </Suspense>
        )}
      </Route>
      
      {/* Direct access to content for debugging */}
      <Route path="/direct-content">
        {() => (
          <Suspense fallback={<LoadingPlaceholder />}>
            <ProtectedRoute path="/direct-content" component={DirectContentPage} noShell={false} />
          </Suspense>
        )}
      </Route>
      {/* Direct access to content management for debugging */}
      <Route path="/direct-content-management">
        {() => (
          <Suspense fallback={<LoadingPlaceholder />}>
            <ProtectedRoute path="/direct-content-management" component={DirectContentManagementPage} noShell={false} />
          </Suspense>
        )}
      </Route>
      {/* Unified Profile Page with comprehensive data fetching */}
      <Route path="/unified-profile">
        {() => (
          <Suspense fallback={<LoadingPlaceholder />}>
            <ProtectedRoute path="/unified-profile" component={UnifiedProfilePage} />
          </Suspense>
        )}
      </Route>
      <Route path="/unified-profile/:userId">
        {(params) => (
          <Suspense fallback={<LoadingPlaceholder />}>
            <ProtectedRoute path="/unified-profile/:userId" component={() => <UnifiedProfilePage />} />
          </Suspense>
        )}
      </Route>
      
      {/* Profile Quest Routes - Nested under profile */}
      <Route path="/profile/:userId/quests">
        {(params) => (
          <Suspense fallback={<LoadingPlaceholder />}>
            <ProtectedRoute path="/profile/:userId/quests" component={() => <BrandQuestsPage />} />
          </Suspense>
        )}
      </Route>
      
      <Route path="/admin">
        {() => (
          <Suspense fallback={<LoadingPlaceholder />}>
            <ProtectedRoute path="/admin" component={() => {
              const AdminLayout = lazy(() => import("@/pages/admin/layout"));
              const AdminDashboard = lazy(() => import("@/pages/admin/index"));
              const AdminCheck = lazy(() => import("@/middleware/admin-check").then(mod => ({ default: mod.AdminCheck })));
              
              const AdminDashboardWithLayout = () => (
                <Suspense fallback={<LoadingPlaceholder />}>
                  <AdminCheck>
                    <AdminLayout>
                      <AdminDashboard />
                    </AdminLayout>
                  </AdminCheck>
                </Suspense>
              );
              
              return <AdminDashboardWithLayout />;
            }} />
          </Suspense>
        )}
      </Route>
      <Route path="/admin/users">
        {() => (
          <Suspense fallback={<LoadingPlaceholder />}>
            <ProtectedRoute path="/admin/users" component={() => {
              const AdminLayout = lazy(() => import("@/pages/admin/layout"));
              const AdminUsers = lazy(() => import("@/pages/admin/users"));
              const AdminCheck = lazy(() => import("@/middleware/admin-check").then(mod => ({ default: mod.AdminCheck })));
              
              const AdminUsersWithLayout = () => (
                <Suspense fallback={<LoadingPlaceholder />}>
                  <AdminCheck>
                    <AdminLayout>
                      <AdminUsers />
                    </AdminLayout>
                  </AdminCheck>
                </Suspense>
              );
              
              return <AdminUsersWithLayout />;
            }} />
          </Suspense>
        )}
      </Route>
      {/* Content Management page using our direct API approach */}
      <Route path="/admin/content">
        {() => (
          <Suspense fallback={<LoadingPlaceholder />}>
            <ProtectedRoute path="/admin/content" component={() => {
              const AdminLayout = lazy(() => import("@/pages/admin/layout"));
              const AdminContentNew = lazy(() => import("@/pages/admin/content-new"));
              const AdminCheck = lazy(() => import("@/middleware/admin-check").then(mod => ({ default: mod.AdminCheck })));
              
              const AdminContentWithLayout = () => (
                <Suspense fallback={<LoadingPlaceholder />}>
                  <AdminCheck>
                    <AdminLayout>
                      <AdminContentNew />
                    </AdminLayout>
                  </AdminCheck>
                </Suspense>
              );
              
              return <AdminContentWithLayout />;
            }} />
          </Suspense>
        )}
      </Route>
      <Route path="/admin/analytics">
        <ProtectedRoute path="/admin/analytics" component={() => {
          const AdminLayout = lazy(() => import("@/pages/admin/layout"));
          const AdminCheck = lazy(() => import("@/middleware/admin-check").then(mod => ({ default: mod.AdminCheck })));
          
          const AdminAnalytics = () => (
            <Suspense fallback={<LoadingPlaceholder />}>
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
            <Suspense fallback={<LoadingPlaceholder />}>
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
            <Suspense fallback={<LoadingPlaceholder />}>
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
            <Suspense fallback={<LoadingPlaceholder />}>
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
      <Route path="/pitch-deck-download">
        <Suspense fallback={<LoadingPlaceholder />}>
          <PitchDeckDownload />
        </Suspense>
      </Route>
      
      {/* Documentation Download page */}
      <Route path="/docs-download">
        <Suspense fallback={<LoadingPlaceholder />}>
          <DocsDownload />
        </Suspense>
      </Route>
      
      {/* Shared Quantum Card View route */}
      <Route path="/profile/card/:userId">
        {(params) => (
          <Suspense fallback={<LoadingPlaceholder />}>
            <SharedCardPage userId={params.userId} />
          </Suspense>
        )}
      </Route>
      {/* Brand of the Day is now integrated into Nowboard panel */}
      
      {/* Add catch-all route for handling any Google Auth redirects with common Firebase paths */}
      <Route path="/_/auth/*">
        <Suspense fallback={<LoadingPlaceholder />}><CatchAllAuthHandler /></Suspense>
      </Route>
      <Route path="/auth/callback/*">
        <Suspense fallback={<LoadingPlaceholder />}><CatchAllAuthHandler /></Suspense>
      </Route>
      <Route path="/oauth/callback/*">
        <Suspense fallback={<LoadingPlaceholder />}><CatchAllAuthHandler /></Suspense>
      </Route>
      <Route path="/auth-callback/*">
        <Suspense fallback={<LoadingPlaceholder />}><CatchAllAuthHandler /></Suspense>
      </Route>
      <Route path="/signin-callback">
        <Suspense fallback={<LoadingPlaceholder />}><CatchAllAuthHandler /></Suspense>
      </Route>
      
      {/* Random profile link route */}
      <Route path="/r/:randomLink">
        {(params) => (
          <Suspense fallback={<LoadingPlaceholder />}>
            <RandomProfile />
          </Suspense>
        )}
      </Route>
      
      {/* Default 404 route */}
      <Route component={() => <LazyRoute component={NotFound} />} />
    </Switch>
  );
}

function App() {
  // Add a root-level Suspense boundary to ensure we never show a white screen
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Suspense fallback={<LoadingPlaceholder />}>
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
