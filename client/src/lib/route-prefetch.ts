import { queryClient } from "@/lib/queryClient";

const prefetchedRoutes = new Set<string>();
const prefetchedData = new Set<string>();

const routeChunks: Record<string, () => Promise<any>> = {
  "/industry-pulse": () => import("@/pages/industry-pulse-new"),
  "/profile": () => import("@/pages/profile-neo"),
  "/brand-quests": () => import("@/pages/brand-quests"),
  "/career-capsule": () => import("@/pages/career-capsule"),
  "/portfolio-builder": () => import("@/pages/portfolio-builder"),
  "/smart-connect": () => import("@/pages/smart-connect"),
  "/messages": () => import("@/pages/ChatPage"),
  "/quantum-card": () => import("@/pages/quantum-card"),
  "/connections": () => import("@/pages/ConnectionsPage"),
  "/search": () => import("@/pages/search-fixed"),
  "/radar": () => import("@/pages/radar"),
  "/privacy": () => import("@/pages/privacy"),
};

const safeRequestIdleCallback = (
  callback: () => void,
  options?: { timeout: number }
): void => {
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    (window as any).requestIdleCallback(callback, options);
  } else {
    setTimeout(callback, options?.timeout || 1);
  }
};

export function prefetchRoute(route: string): void {
  if (prefetchedRoutes.has(route)) return;
  
  const loader = routeChunks[route];
  if (loader) {
    prefetchedRoutes.add(route);
    safeRequestIdleCallback(() => {
      loader().catch(() => {
        prefetchedRoutes.delete(route);
      });
    }, { timeout: 2000 });
  }
}

export function prefetchOnHover(route: string): void {
  prefetchRoute(route);
}

export function prefetchProfileData(userId: string | number): void {
  if (!userId) return;
  const key = `profile-${userId}`;
  if (prefetchedData.has(key)) return;
  
  prefetchedData.add(key);
  safeRequestIdleCallback(() => {
    queryClient.prefetchQuery({
      queryKey: ['/api/users', userId, 'profile-complete'],
      queryFn: async () => {
        const response = await fetch(`/api/users/${userId}/profile-complete`, {
          credentials: 'include',
          headers: { 'Accept': 'application/json' }
        });
        if (!response.ok) throw new Error('Prefetch failed');
        return response.json();
      },
      staleTime: 60000,
    });
  }, { timeout: 100 });
}

export function prefetchCommonRoutes(): void {
  safeRequestIdleCallback(() => {
    prefetchRoute("/industry-pulse");
    prefetchRoute("/profile");
  }, { timeout: 3000 });
}

export function setupLinkPrefetching(): void {
  if (typeof window === "undefined") return;
  
  const handleMouseEnter = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const link = target.closest("a[href]") as HTMLAnchorElement | null;
    if (link) {
      const href = link.getAttribute("href");
      if (href && href.startsWith("/") && routeChunks[href]) {
        prefetchRoute(href);
      }
    }
  };
  
  document.addEventListener("mouseover", handleMouseEnter, { passive: true });
}

if (typeof window !== "undefined") {
  setupLinkPrefetching();
}
