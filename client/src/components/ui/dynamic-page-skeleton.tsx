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
    // Exact matches or startsWith for nested routes
    if (route === "/industry-pulse" || route.startsWith("/dashboard")) {
      return <DashboardPageSkeleton />;
    }
    if (route === "/industry-pulse-new") {
      return <FeedSkeleton />;
    }
    if (route.startsWith("/profile") || route.startsWith("/@") || route.startsWith("/unified-profile")) {
      return <ProfilePageSkeleton />;
    }
    if (route.startsWith("/brand-quests") || route.startsWith("/career-quests") || route.includes("/quests")) {
      return <QuestPageSkeleton />;
    }
    if (route.startsWith("/messages") || route.startsWith("/chat")) {
      return <MessagingPageSkeleton />;
    }
    if (route.startsWith("/connections")) {
      return <ConnectionsPageSkeleton />;
    }
    if (route.startsWith("/create-pulse")) {
      return <CreatePulsePageSkeleton />;
    }
    if (route.startsWith("/brand-score")) {
      return <BrandScorePageSkeleton />;
    }
    if (route.startsWith("/career-capsule")) {
      return <CareerCapsulePageSkeleton />;
    }
    if (route.startsWith("/portfolio") || route.startsWith("/designer-portfolio")) {
      return <PortfolioPageSkeleton />;
    }
    if (route.startsWith("/pricing") || route.startsWith("/upgrade") || route.startsWith("/checkout")) {
      return <PricingPageSkeleton />;
    }
    if (route.startsWith("/resume")) {
      return <ResumeParserPageSkeleton />;
    }
    if (route.startsWith("/search")) {
      return <SearchPageSkeleton />;
    }
    if (route.startsWith("/services") || route.startsWith("/manage-services")) {
      return <ServicesPageSkeleton />;
    }
    if (route.startsWith("/nowboard")) {
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
