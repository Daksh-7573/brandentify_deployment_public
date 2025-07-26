// Performance optimization configuration
// Bundle size optimization and code splitting strategies

export const bundleOptimization = {
  // Critical routes that should be loaded immediately
  criticalRoutes: [
    '/',
    '/industry-pulse',
    '/profile',
    '/auth'
  ],
  
  // Secondary routes loaded after first paint
  secondaryRoutes: [
    '/portfolio-builder',
    '/create-pulse',
    '/search',
    '/brand-quests',
    '/career-quests'
  ],
  
  // Admin/debug routes loaded on demand
  adminRoutes: [
    '/auth-debug',
    '/auth-status',
    '/domain-debug',
    '/news-sources'
  ],
  
  // Large dependencies to be code-split
  heavyDependencies: [
    'firebase',
    '@radix-ui',
    'recharts',
    'framer-motion'
  ],
  
  // Preload configuration
  preloadResources: [
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    '/src/main.tsx'
  ],
  
  // Preconnect domains for faster DNS resolution
  preconnectDomains: [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://brandentifier-app.firebaseapp.com',
    'https://firebase.googleapis.com',
    'https://identitytoolkit.googleapis.com',
    'https://cdnjs.cloudflare.com'
  ]
};

// Performance metrics targets
export const performanceTargets = {
  firstContentfulPaint: 800, // ms
  largestContentfulPaint: 1200, // ms
  timeToInteractive: 1500, // ms
  cumulativeLayoutShift: 0.1,
  firstInputDelay: 100 // ms
};

export default bundleOptimization;