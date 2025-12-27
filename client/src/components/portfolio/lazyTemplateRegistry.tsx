import { lazy, Suspense, ComponentType } from "react";
import type { PortfolioLayoutKey } from "./templateRegistry";

const TemplateSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 animate-pulse">
    <div className="max-w-6xl mx-auto p-8">
      <div className="h-32 bg-gray-700 rounded-xl mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-48 bg-gray-700 rounded-lg" />
        <div className="h-48 bg-gray-700 rounded-lg" />
        <div className="h-48 bg-gray-700 rounded-lg" />
      </div>
    </div>
  </div>
);

const lazyTemplates: Record<string, () => Promise<any>> = {
  "professional": () => import("@/components/portfolio/templates/freelancer-hub"),
  "minimal": () => import("@/components/portfolio/templates/timeline-storyteller-2"),
  "technical": () => import("@/components/portfolio/templates/dynamic-innovator"),
  "executive": () => import("@/components/portfolio/templates/corporate-executive"),
  "timeline-storyteller-2": () => import("@/components/portfolio/templates/timeline-storyteller-2"),
  "creative-bold": () => import("@/components/portfolio/templates/creative-bold"),
  "corporate-executive": () => import("@/components/portfolio/templates/corporate-executive"),
  "dynamic-innovator": () => import("@/components/portfolio/templates/dynamic-innovator"),
  "freelancer-hub": () => import("@/components/portfolio/templates/freelancer-hub"),
  "animated": () => import("@/components/portfolio/templates/animated"),
  "scholar": () => import("@/components/portfolio/templates/scholar"),
  "designer-portfolio": () => import("@/components/portfolio/templates/designer-portfolio"),
  "photographer-portfolio": () => import("@/components/portfolio/templates/photographer-portfolio"),
  "pastel-dreamscape": () => import("@/components/portfolio/templates/pastel-dreamscape"),
  "nature-creative": () => import("@/components/portfolio/templates/nature-creative"),
  "fashion-runway": () => import("@/components/portfolio/templates/fashion-runway"),
  "fashion-is-art": () => import("@/components/portfolio/templates/fashion-is-art"),
  "yoga-fitness-model": () => import("@/components/portfolio/templates/yoga-fitness-model"),
  "3d-portfolio": () => import("@/components/portfolio/templates/3d-portfolio"),
  "holographic-neo": () => import("@/components/portfolio/templates/holographic-neo"),
  "creative-quantum": () => import("@/components/portfolio/templates/creative-quantum"),
  "artistic-portfolio": () => import("@/components/portfolio/templates/artistic-portfolio"),
  "fashion-quantum": () => import("@/components/portfolio/templates/fashion-quantum"),
  "light-designer": () => import("@/components/portfolio/templates/designer-portfolio"),
  "photography-cinematic": () => import("@/components/portfolio/templates/photography-cinematic"),
  "fitness-portfolio": () => import("@/components/portfolio/templates/fitness-portfolio"),
  "ceo-executive": () => import("@/components/portfolio/templates/ceo-executive-portfolio"),
};

const layoutAliasMap: Record<string, string> = {
  "corporate_executive": "corporate-executive",
  "dynamic_innovator": "dynamic-innovator",
  "freelancer_hub": "freelancer-hub",
  "designer_portfolio": "designer-portfolio",
  "photographer_portfolio": "photographer-portfolio",
  "creative_bold": "creative-bold",
  "timeline_storyteller_2": "timeline-storyteller-2",
  "pastel_dreamscape": "pastel-dreamscape",
  "nature_creative": "nature-creative",
  "fashion_runway": "fashion-runway",
  "fashion_is_art": "fashion-is-art",
  "yoga_fitness_model": "yoga-fitness-model",
  "3d_portfolio": "3d-portfolio",
  "holographic_neo": "holographic-neo",
  "creative_quantum": "creative-quantum",
  "artistic_portfolio": "artistic-portfolio",
  "fashion_quantum": "fashion-quantum",
  "light_designer": "light-designer",
  "photography_cinematic": "photography-cinematic",
  "fitness_portfolio": "fitness-portfolio",
  "ceo_executive": "ceo-executive",
};

function normalizeLayoutKey(layout: string): string {
  const lowercased = layout.toLowerCase();
  if (layoutAliasMap[lowercased]) {
    return layoutAliasMap[lowercased];
  }
  if (lazyTemplates[lowercased]) {
    return lowercased;
  }
  return "corporate-executive";
}

const templateCache = new Map<string, ComponentType<any>>();

export async function loadTemplate(layout: string): Promise<ComponentType<any>> {
  const normalizedKey = normalizeLayoutKey(layout);
  
  if (templateCache.has(normalizedKey)) {
    return templateCache.get(normalizedKey)!;
  }
  
  const loader = lazyTemplates[normalizedKey];
  if (!loader) {
    console.warn(`Template "${layout}" not found, falling back to corporate-executive`);
    const fallback = await lazyTemplates["corporate-executive"]();
    const component = fallback.default || Object.values(fallback)[0];
    templateCache.set(normalizedKey, component as ComponentType<any>);
    return component as ComponentType<any>;
  }
  
  const module = await loader();
  const component = module.default || Object.values(module)[0];
  templateCache.set(normalizedKey, component as ComponentType<any>);
  return component as ComponentType<any>;
}

export function LazyPortfolioTemplate({
  layout,
  ...props
}: { layout: string } & Record<string, any>) {
  const normalizedKey = normalizeLayoutKey(layout);
  
  const LazyComponent = lazy(async () => {
    const component = await loadTemplate(normalizedKey);
    return { default: component };
  });
  
  return (
    <Suspense fallback={<TemplateSkeleton />}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

export function preloadTemplate(layout: string): void {
  const normalizedKey = normalizeLayoutKey(layout);
  const loader = lazyTemplates[normalizedKey];
  if (loader && !templateCache.has(normalizedKey)) {
    loader().then((module) => {
      const component = module.default || Object.values(module)[0];
      templateCache.set(normalizedKey, component as ComponentType<any>);
    });
  }
}

export function preloadCommonTemplates(): void {
  const commonTemplates = ["corporate-executive", "scholar"];
  commonTemplates.forEach(preloadTemplate);
}
