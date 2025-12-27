const prefetchedRoutes = new Set<string>();

const routeChunks: Record<string, () => Promise<any>> = {
  "/industry-pulse": () => import("@/pages/industry-pulse-new"),
  "/profile": () => import("@/pages/profile-neo"),
  "/brand-quests": () => import("@/pages/brand-quests"),
  "/career-capsule": () => import("@/pages/career-capsule"),
  "/portfolio-builder": () => import("@/pages/portfolio-builder"),
  "/smart-connect": () => import("@/pages/smart-connect"),
  "/messages": () => import("@/pages/ChatPage"),
  "/quantum-card": () => import("@/pages/quantum-card"),
};

export function prefetchRoute(route: string): void {
  if (prefetchedRoutes.has(route)) return;
  
  const loader = routeChunks[route];
  if (loader) {
    prefetchedRoutes.add(route);
    requestIdleCallback(() => {
      loader().catch(() => {
        prefetchedRoutes.delete(route);
      });
    }, { timeout: 2000 });
  }
}

export function prefetchOnHover(route: string): void {
  prefetchRoute(route);
}

export function prefetchCommonRoutes(): void {
  requestIdleCallback(() => {
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

if (typeof window !== "undefined" && "requestIdleCallback" in window) {
  setupLinkPrefetching();
}
