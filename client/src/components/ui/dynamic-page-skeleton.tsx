import { FeedSkeleton } from "./skeleton-components";
import { ProfilePageSkeleton } from "./page-skeletons/profile-skeleton";
import { QuestPageSkeleton } from "./page-skeletons/quest-skeleton";
import { AppShell } from "@/components/layout/app-shell";
import { MuskLoadingCompact } from "./musk-loading-shell";
import { BrandScorePageSkeleton } from "./page-skeletons/brand-score-skeleton";
import { CareerCapsulePageSkeleton } from "./page-skeletons/career-capsule-skeleton";
import { ChatPageSkeleton } from "./page-skeletons/chat-skeleton";
import { ConnectionsPageSkeleton } from "./page-skeletons/connections-skeleton";
import { CreatePulsePageSkeleton } from "./page-skeletons/create-pulse-skeleton";
import { DashboardPageSkeleton } from "./page-skeletons/dashboard-skeleton";
import { MessagingPageSkeleton } from "./page-skeletons/messaging-skeleton";
import { NowboardPageSkeleton } from "./page-skeletons/nowboard-skeleton";
import { PortfolioPageSkeleton } from "./page-skeletons/portfolio-skeleton";
import { PricingPageSkeleton } from "./page-skeletons/pricing-skeleton";
import { ResumeParserPageSkeleton } from "./page-skeletons/resume-parser-skeleton";
import { SearchPageSkeleton } from "./page-skeletons/search-skeleton";
import { ServicesPageSkeleton } from "./page-skeletons/services-skeleton";

interface DynamicPageSkeletonProps {
  route: string;
}

export function DynamicPageSkeleton({ route }: DynamicPageSkeletonProps) {
  const getSkeleton = () => {
    // Normalize route by removing query params and trailing slashes
    const path = route.split('?')[0].replace(/\/$/, '') || '/';

    // Exact matches or startsWith for nested routes
    if (path === "/industry-pulse" || path === "/industry-pulse-new" || path === "/dashboard" || path === "/industry-pulse-fixed") {
      return <FeedSkeleton />;
    }
    
    // Profile related routes (including @username)
    if (path.startsWith("/profile") || path.startsWith("/@") || path.startsWith("/unified-profile") || path.startsWith("/public-profile")) {
      return <ProfilePageSkeleton />;
    }
    
    // Quest related routes
    if (path.startsWith("/brand-quests") || path.startsWith("/career-quests") || path.includes("/quests")) {
      return <QuestPageSkeleton />;
    }
    
    // Messaging/Chat
    if (path.startsWith("/messages") || path.startsWith("/chat") || path === "/ChatPage") {
      return <MessagingPageSkeleton />;
    }
    
    // Connections
    if (path.startsWith("/connections")) {
      return <ConnectionsPageSkeleton />;
    }
    
    // Content Creation
    if (path.startsWith("/create-pulse")) {
      return <CreatePulsePageSkeleton />;
    }
    
    // Analytics/Score
    if (path.startsWith("/brand-score")) {
      return <BrandScorePageSkeleton />;
    }
    
    // Career Capsule / Roadmap
    if (path.startsWith("/career-capsule") || path.startsWith("/career-roadmap")) {
      return <CareerCapsulePageSkeleton />;
    }
    
    // Portfolio
    if (path.startsWith("/portfolio") || path.startsWith("/designer-portfolio") || path.startsWith("/portfolio-builder")) {
      return <PortfolioPageSkeleton />;
    }
    
    // Subscription/Pricing
    if (path.startsWith("/pricing") || path.startsWith("/upgrade") || path.startsWith("/checkout") || path.startsWith("/subscription")) {
      return <PricingPageSkeleton />;
    }
    
    // Resume
    if (path.startsWith("/resume")) {
      return <ResumeParserPageSkeleton />;
    }
    
    // Search
    if (path.startsWith("/search")) {
      return <SearchPageSkeleton />;
    }
    
    // Services
    if (path.startsWith("/services") || path.startsWith("/manage-services") || path.startsWith("/add-service")) {
      return <ServicesPageSkeleton />;
    }
    
    // Opportunities
    if (path.startsWith("/nowboard")) {
      return <NowboardPageSkeleton />;
    }
    
    // Default fallback
    return (
      <div className="flex flex-col items-center justify-center p-20 w-full">
        <MuskLoadingCompact />
        <div className="mt-4 animate-pulse text-white/40 font-medium">Loading professional intelligence...</div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {getSkeleton()}
    </div>
  );
}
