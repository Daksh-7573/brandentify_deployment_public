import React from "react";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import ProfileLoadingAnimation from "@/components/ui/profile-loading-animation";

export function QueryLoader() {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  
  // Only show loader when fetching or mutating is happening
  const isLoading = isFetching > 0 || isMutating > 0;
  
  if (!isLoading) return null;
  
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-white rounded-xl shadow-lg p-4 flex items-center gap-3">
        <ProfileLoadingAnimation size="small" text="" />
        <div className="text-sm text-muted-foreground">
          {isMutating > 0 ? "Saving data..." : "Loading..."}
        </div>
      </div>
    </div>
  );
}

export default QueryLoader;