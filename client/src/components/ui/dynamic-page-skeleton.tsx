import { FeedSkeleton } from "./skeleton-components";
import { ProfilePageSkeleton } from "./page-skeletons/profile-skeleton";
import { QuestPageSkeleton } from "./page-skeletons/quest-skeleton";
import { AppShell } from "@/components/layout/app-shell";

interface DynamicPageSkeletonProps {
  route: string;
}

export function DynamicPageSkeleton({ route }: DynamicPageSkeletonProps) {
  const getSkeleton = () => {
    if (route.startsWith("/industry-pulse") || route.startsWith("/dashboard")) {
      return <FeedSkeleton />;
    }
    if (route.startsWith("/profile") || route.startsWith("/@")) {
      return <ProfilePageSkeleton />;
    }
    if (route.startsWith("/brand-quests") || route.startsWith("/career-quests")) {
      return <QuestPageSkeleton />;
    }
    // Default fallback
    return <div className="flex-1 animate-pulse bg-white/5 rounded-3xl m-4" />;
  };

  return (
    <AppShell>
      {getSkeleton()}
    </AppShell>
  );
}
