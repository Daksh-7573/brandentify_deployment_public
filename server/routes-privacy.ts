import express, { Router, Express } from 'express';
import { privacyService } from './services/privacy-service';
import { authenticateJWT } from './middleware/auth-middleware';
import { consentCategoryEnum, consentStatusEnum, geoRegionEnum } from '../shared/privacy-schema';
import { Session } from 'express-session';

// Extend the express-session SessionData type to include our consent preferences
declare module 'express-session' {
  interface SessionData {
    consentPreferences?: {
      essential: boolean;
      functional: boolean;
      analytics: boolean;
      advertising: boolean;
      social: boolean;
      [key: string]: boolean;  // Index signature for dynamic access
    };
  }
}

// Create our own simple rate limiter
class RateLimiterMemory {
  private points: number;
  private duration: number; 
  private store: Map<string, { count: number, lastReset: number }>;

  constructor({ points, duration }: { points: number, duration: number }) {
    this.points = points;
    this.duration = duration;
    this.store = new Map();
  }

  async consume(key: string): Promise<void> {
    const now = Date.now();
    const record = this.store.get(key) || { count: 0, lastReset: now };
    
    // Reset count if duration has passed
    if (now - record.lastReset > this.duration * 1000) {
      record.count = 0;
      record.lastReset = now;
    }
    
    // Check if limit is reached
    if (record.count >= this.points) {
      throw new Error('Rate limit exceeded');
    }
    
    // Increment count
    record.count++;
    this.store.set(key, record);
  }
};
import { z } from 'zod';
import path from 'path';

// Rate limiter for sensitive privacy operations
const privacyRateLimiter = new RateLimiterMemory({
  points: 10, // Number of points
  duration: 60 * 15, // Per 15 minutes
});

// Middleware to limit rate of sensitive privacy requests
const rateLimitPrivacyRequests = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const userId = req.user?.username || req.ip;
    await privacyRateLimiter.consume(userId);
    next();
  } catch (error) {
    res.status(429).json({ error: 'Too many privacy requests. Please try again later.' });
  }
};

// Input validation schemas
const consentPreferenceSchema = z.object({
  category: z.enum(consentCategoryEnum.enumValues),
  status: z.enum(consentStatusEnum.enumValues),
});

const policyAcknowledgmentSchema = z.object({
  policyVersion: z.string(),
});

const dataResidencySchema = z.object({
  preferredRegion: z.enum(geoRegionEnum.enumValues),
  detectedRegion: z.enum(geoRegionEnum.enumValues).optional(),
});

const communicationPreferencesSchema = z.object({
  marketingEmails: z.boolean().optional(),
  productUpdates: z.boolean().optional(),
  securityAlerts: z.boolean().optional(),
  newsletterFrequency: z.string().optional(),
});

export function setupPrivacyRoutes(): Router {
  const router = express.Router();

  /**
   * Cookie Consent Routes
   */
  
  // Get current cookie consent preferences
  router.get('/cookie-consent', authenticateJWT, async (req, res) => {
    try {
      const consents = await privacyService.getUserConsents(req.user!.username);
      res.json(consents);
    } catch (error) {
      console.error('Error getting cookie consents:', error);
      res.status(500).json({ error: 'Failed to get cookie consents' });
    }
  });

  // Set cookie consent preference for authenticated users
  router.post('/cookie-consent', authenticateJWT, async (req, res) => {
    try {
      const { category, status } = consentPreferenceSchema.parse(req.body);
      
      const result = await privacyService.setConsentPreference(
        req.user!.username,
        category,
        status,
        req.ip,
        req.headers['user-agent']
      );
      
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid consent data', details: error.errors });
      } else {
        console.error('Error setting cookie consent:', error);
        res.status(500).json({ error: 'Failed to set cookie consent' });
      }
    }
  });
  
  // Set cookie consent preference for anonymous users
  router.post('/cookie-consent/anonymous', async (req, res) => {
    try {
      const { category, status } = consentPreferenceSchema.parse(req.body);
      
      // Store in session instead of database
      if (!req.session.consentPreferences) {
        req.session.consentPreferences = {
          essential: true, // Always required
          functional: false,
          analytics: false,
          advertising: false,
          social: false,
        };
      }
      
      // TypeScript workaround - we know category is a valid key
      const categoryKey = category as keyof typeof req.session.consentPreferences;
      req.session.consentPreferences[categoryKey] = status === 'granted';
      
      // Save session explicitly to ensure it's persisted
      req.session.save((err) => {
        if (err) {
          console.error('Error saving session:', err);
          res.status(500).json({ error: 'Failed to save cookie consent preferences' });
          return;
        }
        
        res.json({ 
          success: true, 
          category, 
          status 
        });
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid consent data', details: error.errors });
      } else {
        console.error('Error setting anonymous cookie consent:', error);
        res.status(500).json({ error: 'Failed to set cookie consent' });
      }
    }
  });

  // Get all cookie consent preferences for anonymous users
  // This route needs to be defined BEFORE the /:category route to avoid conflicts
  router.get('/cookie-consent/anonymous', async (req, res) => {
    try {
      const preferences = req.session.consentPreferences || {
        essential: true, // Always required
        functional: false,
        analytics: false,
        advertising: false,
        social: false,
      };
      
      // Format the response to match the authenticated endpoint format
      const formattedPreferences = Object.entries(preferences).map(([category, granted]) => ({
        category,
        status: granted ? 'granted' : 'denied'
      }));
      
      res.json(formattedPreferences);
    } catch (error) {
      console.error('Error getting anonymous cookie consents:', error);
      res.status(500).json({ error: 'Failed to get cookie consents' });
    }
  });

  // Check specific consent status for authenticated users
  router.get('/cookie-consent/:category', authenticateJWT, async (req, res) => {
    try {
      const category = req.params.category;
      
      if (!consentCategoryEnum.enumValues.includes(category as any)) {
        return res.status(400).json({ error: 'Invalid consent category' });
      }
      
      const hasConsented = await privacyService.hasConsented(
        req.user!.username, 
        category as typeof consentCategoryEnum.enumValues[number]
      );
      
      res.json({ category, consented: hasConsented });
    } catch (error) {
      console.error('Error checking consent status:', error);
      res.status(500).json({ error: 'Failed to check consent status' });
    }
  });

  /**
   * Data Request Routes (GDPR)
   */
  
  // Request data export
  router.post('/data-export', authenticateJWT, rateLimitPrivacyRequests, async (req, res) => {
    try {
      const verificationToken = await privacyService.requestDataExport(
        req.user!.username,
        req.ip
      );
      
      // In a real app, you would email this token to the user for verification
      // For testing purposes, we'll return it directly
      res.json({ 
        message: 'Data export request submitted successfully', 
        verificationToken,
        note: 'In production, this token would be sent to the user email for verification'
      });
    } catch (error) {
      console.error('Error requesting data export:', error);
      res.status(500).json({ error: 'Failed to request data export' });
    }
  });

  // Request data deletion
  router.post('/data-deletion', authenticateJWT, rateLimitPrivacyRequests, async (req, res) => {
    try {
      const verificationToken = await privacyService.requestDataDeletion(
        req.user!.username,
        req.ip
      );
      
      // In a real app, you would email this token to the user for verification
      // For testing purposes, we'll return it directly
      res.json({ 
        message: 'Data deletion request submitted successfully', 
        verificationToken,
        note: 'In production, this token would be sent to the user email for verification'
      });
    } catch (error) {
      console.error('Error requesting data deletion:', error);
      res.status(500).json({ error: 'Failed to request data deletion' });
    }
  });

  // Verify data request (export or deletion)
  router.post('/verify-request/:token', async (req, res) => {
    try {
      const { token } = req.params;
      const verified = await privacyService.verifyDataRequest(token);
      
      if (verified) {
        res.json({ message: 'Request verified successfully' });
      } else {
        res.status(400).json({ error: 'Invalid or expired verification token' });
      }
    } catch (error) {
      console.error('Error verifying request:', error);
      res.status(500).json({ error: 'Failed to verify request' });
    }
  });

  // Download exported data (requires admin auth in real app)
  router.get('/download-export/:filename', authenticateJWT, async (req, res) => {
    try {
      const { filename } = req.params;
      
      // Security check to prevent path traversal
      if (filename.includes('..') || filename.includes('/')) {
        return res.status(400).json({ error: 'Invalid filename' });
      }
      
      const filePath = path.join(__dirname, '../exports', filename);
      
      res.download(filePath, (err) => {
        if (err) {
          console.error('Error downloading file:', err);
          res.status(404).json({ error: 'File not found or unavailable' });
        }
      });
    } catch (error) {
      console.error('Error downloading export:', error);
      res.status(500).json({ error: 'Failed to download export' });
    }
  });

  /**
   * Privacy Policy Routes
   */
  
  // Acknowledge privacy policy
  router.post('/acknowledge-policy', authenticateJWT, async (req, res) => {
    try {
      const { policyVersion } = policyAcknowledgmentSchema.parse(req.body);
      
      const result = await privacyService.acknowledgePolicyVersion(
        req.user!.username,
        policyVersion,
        req.ip,
        req.headers['user-agent']
      );
      
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid policy data', details: error.errors });
      } else {
        console.error('Error acknowledging policy:', error);
        res.status(500).json({ error: 'Failed to acknowledge policy' });
      }
    }
  });

  // Check if user has acknowledged latest policy
  router.get('/policy-status/:version', authenticateJWT, async (req, res) => {
    try {
      const { version } = req.params;
      
      const hasAcknowledged = await privacyService.hasAcknowledgedLatestPolicy(
        req.user!.username,
        version
      );
      
      res.json({ 
        policyVersion: version, 
        acknowledged: hasAcknowledged 
      });
    } catch (error) {
      console.error('Error checking policy status:', error);
      res.status(500).json({ error: 'Failed to check policy status' });
    }
  });

  /**
   * Data Residency Routes
   */
  
  // Set data residency preference
  router.post('/data-residency', authenticateJWT, async (req, res) => {
    try {
      const { preferredRegion, detectedRegion } = dataResidencySchema.parse(req.body);
      
      const result = await privacyService.setDataResidencyPreference(
        req.user!.username,
        preferredRegion,
        detectedRegion
      );
      
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid residency data', details: error.errors });
      } else {
        console.error('Error setting data residency:', error);
        res.status(500).json({ error: 'Failed to set data residency' });
      }
    }
  });

  // Get data residency preference
  router.get('/data-residency', authenticateJWT, async (req, res) => {
    try {
      const preference = await privacyService.getDataResidencyPreference(req.user!.username);
      
      if (preference) {
        res.json(preference);
      } else {
        res.json({ preferredRegion: 'global' });
      }
    } catch (error) {
      console.error('Error getting data residency:', error);
      res.status(500).json({ error: 'Failed to get data residency' });
    }
  });

  /**
   * Communication Preferences Routes
   */
  
  // Set communication preferences
  router.post('/communication-preferences', authenticateJWT, async (req, res) => {
    try {
      const preferences = communicationPreferencesSchema.parse(req.body);
      
      const result = await privacyService.setCommunicationPreferences(
        req.user!.username,
        preferences
      );
      
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid preferences data', details: error.errors });
      } else {
        console.error('Error setting communication preferences:', error);
        res.status(500).json({ error: 'Failed to set communication preferences' });
      }
    }
  });

  // Get communication preferences
  router.get('/communication-preferences', authenticateJWT, async (req, res) => {
    try {
      const preferences = await privacyService.getCommunicationPreferences(req.user!.username);
      
      if (preferences) {
        res.json(preferences);
      } else {
        res.status(404).json({ error: 'No communication preferences found' });
      }
    } catch (error) {
      console.error('Error getting communication preferences:', error);
      res.status(500).json({ error: 'Failed to get communication preferences' });
    }
  });

  /**
   * Privacy Audit Log Routes
   */
  
  // Get user privacy logs
  router.get('/audit-logs', authenticateJWT, async (req, res) => {
    try {
      const logs = await privacyService.getUserPrivacyLogs(req.user!.username);
      res.json(logs);
    } catch (error) {
      console.error('Error getting privacy logs:', error);
      res.status(500).json({ error: 'Failed to get privacy logs' });
    }
  });

  return router;
}