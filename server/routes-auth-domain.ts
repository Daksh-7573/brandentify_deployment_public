import { Router, Request, Response } from 'express';

const router = Router();

/**
 * Domain Registration Route
 * Helps resolve Firebase OAuth domain authorization issues
 */
router.post('/auth/register-domain', async (req: Request, res: Response) => {
  try {
    const { domain, fullUrl, userAgent, timestamp } = req.body;
    
    console.log('Domain registration request:', {
      domain,
      fullUrl,
      userAgent: userAgent?.substring(0, 100),
      timestamp
    });
    
    // Log domain information for manual Firebase Console configuration
    console.log(`
=== FIREBASE CONSOLE CONFIGURATION REQUIRED ===
Domain to add: ${domain}
Full URL: ${fullUrl}
Time: ${new Date().toISOString()}

Steps to fix OAuth client error:
1. Go to: https://console.firebase.google.com/
2. Select your Firebase project
3. Navigate to: Authentication > Settings > Authorized domains
4. Add domain: ${domain}
5. Also add: *.replit.dev and *.replit.app for future deployments

This will resolve the "OAuth client was not found" error.
===============================================
    `);
    
    // Store domain registration attempt in memory (could be database in production)
    const domainRegistry = (global as any).__domain_registry || [];
    domainRegistry.push({
      domain,
      fullUrl,
      userAgent,
      timestamp,
      registered: new Date().toISOString()
    });
    (global as any).__domain_registry = domainRegistry;
    
    res.json({
      success: true,
      message: 'Domain registration logged for manual Firebase Console setup',
      domain,
      instructions: {
        step1: 'Go to Firebase Console',
        step2: 'Select your project',
        step3: 'Navigate to Authentication > Settings > Authorized domains',
        step4: `Add domain: ${domain}`,
        step5: 'Also add wildcards: *.replit.dev, *.replit.app'
      }
    });
    
  } catch (error) {
    console.error('Domain registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register domain',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get domain registry for debugging
 */
router.get('/auth/domains', (req: Request, res: Response) => {
  const domainRegistry = (global as any).__domain_registry || [];
  
  res.json({
    domains: domainRegistry,
    count: domainRegistry.length,
    currentDomain: req.get('host'),
    timestamp: new Date().toISOString()
  });
});

export default router;