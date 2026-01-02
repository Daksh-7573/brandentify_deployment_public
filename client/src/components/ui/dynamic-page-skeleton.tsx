import { FeedSkeleton } from "./skeleton-components";
import { ProfilePageSkeleton } from "./page-skeletons/profile-skeleton";
import { QuestPageSkeleton } from "./page-skeletons/quest-skeleton";
import { AppShell } from "@/components/layout/app-shell";
import { MuskLoadingCompact } from "./musk-loading-shell";

interface DynamicPageSkeletonProps {
  route: string;
}

export function DynamicPageSkeleton({ route }: DynamicPageSkeletonProps) {
  const getSkeleton = () => {
    if (route.startsWith("/industry-pulse") || route.startsWith("/dashboard")) {
      return <FeedSkeleton />;
    }
    if (route.startsWith("/profile") || route.startsWith("/@") || route.startsWith("/unified-profile")) {
      return <ProfilePageSkeleton />;
    }
    if (route.startsWith("/brand-quests") || route.startsWith("/career-quests") || route.includes("/quests")) {
      return <QuestPageSkeleton />;
    }
    if (route.startsWith("/messages")) {
      return (
        <div className="flex flex-col items-center justify-center p-20 w-full">
          <MuskLoadingCompact />
          <div className="mt-4 animate-pulse text-white/40 font-medium">Synchronizing communications...</div>
        </div>
      );
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
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center justify-center min-h-[60[px]">
      {getSkeleton()}
    </div>
  );
}
