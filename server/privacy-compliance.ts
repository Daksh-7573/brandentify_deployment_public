/**
 * Privacy & Compliance Module
 * 
 * This module provides privacy and compliance features for global regulations:
 * - GDPR (European Union)
 * - IT Rules 2021 (India)
 * - Data Residency Controls
 * - Cookie Consent Management
 * 
 * These features are implemented in a non-breaking way that preserves
 * existing functionality including authentication.
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

// Regional compliance configurations 
const REGIONS = {
  EU: 'eu',
  INDIA: 'india',
  DEFAULT: 'global'
};

// Privacy policies directory
const POLICIES_DIR = path.join(process.cwd(), 'public', 'policies');

// Cookie categories
export enum CookieCategory {
  ESSENTIAL = 'essential',
  FUNCTIONAL = 'functional',
  ANALYTICS = 'analytics',
  ADVERTISING = 'advertising',
  SOCIAL_MEDIA = 'social_media'
}

// Cookie consent preferences
export interface CookieConsent {
  essential: boolean; // Always true, can't be disabled
  functional: boolean;
  analytics: boolean;
  advertising: boolean;
  social_media: boolean;
  lastUpdated: Date;
}

// Default consent configuration - essential cookies only
const DEFAULT_CONSENT: CookieConsent = {
  essential: true, // Cannot be disabled
  functional: false,
  analytics: false,
  advertising: false,
  social_media: false,
  lastUpdated: new Date()
};

// User data request types
export enum DataRequestType {
  ACCESS = 'access',
  DELETION = 'deletion',
  CORRECTION = 'correction',
  RESTRICTION = 'restriction',
  PORTABILITY = 'portability',
  OBJECTION = 'objection'
}

// Data request status
export enum DataRequestStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  REJECTED = 'rejected'
}

// Data request schema
export interface DataRequest {
  id: string;
  userId: string;
  type: DataRequestType;
  description?: string;
  status: DataRequestStatus;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  attachments?: string[];
}

// In-memory data request storage (would be database in production)
let dataRequests: DataRequest[] = [];
let userCookieConsents: Map<string, CookieConsent> = new Map();

/**
 * Initialize privacy and compliance module
 */
export function initializePrivacyCompliance() {
  try {
    console.log('Initializing privacy and compliance features...');
    
    // Create policies directory if it doesn't exist
    if (!fs.existsSync(POLICIES_DIR)) {
      fs.mkdirSync(POLICIES_DIR, { recursive: true });
    }
    
    // Create default privacy policy files if they don't exist
    createDefaultPolicies();
    
    console.log('Privacy and compliance features initialized');
    
    return true;
  } catch (error) {
    console.error('Error initializing privacy compliance:', error);
    // Do not throw error to avoid breaking the app
    return false;
  }
}

/**
 * Create default privacy policy files
 */
function createDefaultPolicies() {
  const policies = [
    {
      filename: 'privacy-policy.md',
      content: `# Privacy Policy
Last updated: ${new Date().toLocaleDateString()}

This Privacy Policy describes how we collect, use, process, and disclose your information,
including personal information, in conjunction with your access to and use of our platform.

## 1. Information We Collect

### 1.1 Information You Provide
- Account information (name, email, etc.)
- Profile information
- Content you share
- Communications with us

### 1.2 Information We Automatically Collect
- Usage information
- Log data
- Device information
- Cookies and similar technologies

## 2. How We Use Your Information
We use the information we collect for the following purposes:
- Provide and improve our services
- Communicate with you
- Personalize your experience
- Ensure safety and security

## 3. Your Rights
Depending on your location, you may have certain rights regarding your personal data:
- Access, correct, or delete your personal data
- Object to processing of your data
- Data portability
- Withdraw consent

## 4. Data Storage and Security
We implement appropriate security measures to protect your personal data.

## 5. International Data Transfers
Your information may be transferred to different countries. We ensure appropriate safeguards.

## 6. Contact Us
If you have any questions about this Privacy Policy, please contact us.`
    },
    {
      filename: 'cookie-policy.md',
      content: `# Cookie Policy
Last updated: ${new Date().toLocaleDateString()}

This Cookie Policy explains how we use cookies and similar technologies.

## 1. What Are Cookies
Cookies are small text files stored on your device by websites you visit.

## 2. Types of Cookies We Use

### 2.1 Essential Cookies
Required for core functionality. Cannot be disabled.

### 2.2 Functional Cookies
Enable enhanced functionality and personalization.

### 2.3 Analytics Cookies
Help us understand how visitors interact with our platform.

### 2.4 Advertising Cookies
Used to deliver relevant ads and marketing communications.

### 2.5 Social Media Cookies
Enable integration with social media platforms.

## 3. Your Cookie Choices
You can manage your cookie preferences through our platform's consent manager.

## 4. Contact Us
If you have any questions about our Cookie Policy, please contact us.`
    },
    {
      filename: 'data-deletion-policy.md',
      content: `# Data Deletion Policy
Last updated: ${new Date().toLocaleDateString()}

This Data Deletion Policy outlines how you can request deletion of your data.

## 1. Requesting Data Deletion
You can request deletion of your personal data by:
- Using the data deletion request form in your account settings
- Contacting our support team

## 2. What We Delete
Upon request, we will delete:
- Your account information
- Your content
- Your activity data

Some information may be retained for legal or legitimate business purposes.

## 3. Timeline
We aim to process deletion requests within 30 days.

## 4. Verification
We may need to verify your identity before processing your request.

## 5. Third-Party Data
We will make reasonable efforts to delete your data from third-party services.

## 6. Contact Us
If you have any questions about our Data Deletion Policy, please contact us.`
    },
    {
      filename: 'it-rules-2021-compliance.md',
      content: `# IT Rules 2021 Compliance (India)
Last updated: ${new Date().toLocaleDateString()}

This document outlines our compliance with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021.

## 1. Grievance Redressal Mechanism
We have appointed a Grievance Officer for addressing user complaints:
- Name: [Grievance Officer Name]
- Email: [Grievance Officer Email]
- Response Time: Within 24 hours
- Resolution Time: 15 days

## 2. Content Removal
We have a process for handling content removal requests.

## 3. User Verification
We implement appropriate measures to verify user identities.

## 4. Data Storage
We store required information as per the Rules.

## 5. Incident Response
We have a cybersecurity incident response team and processes.

## 6. Contact Us
If you have any questions about our IT Rules 2021 compliance, please contact us.`
    }
  ];
  
  policies.forEach(policy => {
    const policyPath = path.join(POLICIES_DIR, policy.filename);
    if (!fs.existsSync(policyPath)) {
      fs.writeFileSync(policyPath, policy.content);
      console.log(`Created default policy: ${policy.filename}`);
    }
  });
}

/**
 * Detect user's region based on request data
 * This is a simplified implementation and would need to be enhanced
 * in production with proper geo-IP detection
 */
export function detectUserRegion(req: Request): string {
  try {
    // Simple detection based on accept-language header
    // In production, use proper geo-IP detection services
    const acceptLanguage = req.headers['accept-language'] || '';
    
    // This is just a very basic example - production would use geo-IP databases
    if (acceptLanguage.includes('en-IN') || 
        req.headers['x-country-code'] === 'IN' ||
        req.query.region === 'india') {
      return REGIONS.INDIA;
    } else if (acceptLanguage.match(/^(de|fr|es|it|nl|pt|da|sv|fi|el|cs|et|hu|lv|lt|mt|pl|sk|sl)-/) ||
               req.headers['x-country-code']?.toString().match(/^(AT|BE|BG|HR|CY|CZ|DK|EE|FI|FR|DE|GR|HU|IE|IT|LV|LT|LU|MT|NL|PL|PT|RO|SK|SI|ES|SE)$/) ||
               req.query.region === 'eu') {
      return REGIONS.EU;
    }
    
    return REGIONS.DEFAULT;
  } catch (error) {
    console.error('Error detecting user region:', error);
    return REGIONS.DEFAULT;
  }
}

/**
 * Get appropriate privacy notice based on user's region
 */
export function getPrivacyNotice(region: string): string {
  try {
    // Base privacy policy
    let policyPath = path.join(POLICIES_DIR, 'privacy-policy.md');
    
    // Region-specific extensions
    if (region === REGIONS.EU) {
      policyPath = path.join(POLICIES_DIR, 'privacy-policy-eu.md');
    } else if (region === REGIONS.INDIA) {
      policyPath = path.join(POLICIES_DIR, 'privacy-policy-india.md');
    }
    
    // Fall back to default if specific policy doesn't exist
    if (!fs.existsSync(policyPath)) {
      policyPath = path.join(POLICIES_DIR, 'privacy-policy.md');
    }
    
    return fs.readFileSync(policyPath, 'utf8');
  } catch (error) {
    console.error('Error getting privacy notice:', error);
    // Return a minimal notice to avoid breaking the app
    return '# Privacy Policy\n\nOur privacy policy is currently being updated. Please check back later.';
  }
}

/**
 * Get cookie policy
 */
export function getCookiePolicy(): string {
  try {
    const policyPath = path.join(POLICIES_DIR, 'cookie-policy.md');
    
    if (!fs.existsSync(policyPath)) {
      return '# Cookie Policy\n\nOur cookie policy is currently being updated. Please check back later.';
    }
    
    return fs.readFileSync(policyPath, 'utf8');
  } catch (error) {
    console.error('Error getting cookie policy:', error);
    return '# Cookie Policy\n\nOur cookie policy is currently being updated. Please check back later.';
  }
}

/**
 * Set cookie consent for a user
 */
export function setCookieConsent(userId: string, consent: Partial<CookieConsent>): CookieConsent {
  try {
    // Get existing consent or create default
    const existingConsent = userCookieConsents.get(userId) || { ...DEFAULT_CONSENT };
    
    // Update consent with new preferences, ensuring essential cookies remain enabled
    const updatedConsent: CookieConsent = {
      ...existingConsent,
      ...consent,
      essential: true, // Essential cookies can't be disabled
      lastUpdated: new Date()
    };
    
    // Store updated consent
    userCookieConsents.set(userId, updatedConsent);
    
    return updatedConsent;
  } catch (error) {
    console.error('Error setting cookie consent:', error);
    return DEFAULT_CONSENT;
  }
}

/**
 * Get cookie consent for a user
 */
export function getCookieConsent(userId: string): CookieConsent {
  try {
    // Return existing consent or default
    return userCookieConsents.get(userId) || DEFAULT_CONSENT;
  } catch (error) {
    console.error('Error getting cookie consent:', error);
    return DEFAULT_CONSENT;
  }
}

/**
 * Create a data request (access, deletion, etc.)
 */
export function createDataRequest(userId: string, type: DataRequestType, description?: string): DataRequest {
  try {
    const request: DataRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      userId,
      type,
      description,
      status: DataRequestStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    dataRequests.push(request);
    
    return request;
  } catch (error) {
    console.error('Error creating data request:', error);
    throw error;
  }
}

/**
 * Get data requests for a user
 */
export function getDataRequests(userId: string): DataRequest[] {
  try {
    return dataRequests.filter(request => request.userId === userId);
  } catch (error) {
    console.error('Error getting data requests:', error);
    return [];
  }
}

/**
 * Update data request status
 */
export function updateDataRequestStatus(requestId: string, status: DataRequestStatus): DataRequest | null {
  try {
    const requestIndex = dataRequests.findIndex(request => request.id === requestId);
    
    if (requestIndex === -1) {
      return null;
    }
    
    const updatedRequest = {
      ...dataRequests[requestIndex],
      status,
      updatedAt: new Date(),
      ...(status === DataRequestStatus.COMPLETED ? { completedAt: new Date() } : {})
    };
    
    dataRequests[requestIndex] = updatedRequest;
    
    return updatedRequest;
  } catch (error) {
    console.error('Error updating data request status:', error);
    return null;
  }
}

/**
 * Extract all user data for GDPR access request
 * In a real implementation, this would compile data from various sources
 */
export async function compileUserData(userId: string): Promise<any> {
  try {
    // This is a simplified implementation
    // In a real system, this would query multiple data sources
    
    // Simulated user data (in production, fetch from actual data sources)
    const userData = {
      userId,
      profile: {
        message: 'In a real implementation, this would contain the user profile data'
      },
      activity: {
        message: 'In a real implementation, this would contain user activity data'
      },
      content: {
        message: 'In a real implementation, this would contain user-generated content'
      },
      preferences: {
        message: 'In a real implementation, this would contain user preferences'
      },
      cookieConsent: getCookieConsent(userId),
      dataRequests: getDataRequests(userId)
    };
    
    return userData;
  } catch (error) {
    console.error('Error compiling user data:', error);
    throw error;
  }
}

/**
 * Middleware to add privacy headers to responses
 */
export function privacyHeadersMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    // Add privacy-related headers
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    
    // Add region information for client-side adaptation
    const region = detectUserRegion(req);
    res.setHeader('X-Detected-Region', region);
    
    next();
  } catch (error) {
    console.error('Error in privacy headers middleware:', error);
    next();
  }
}

/**
 * Middleware to check cookie consent for non-essential features
 */
export function cookieConsentMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    // Get user ID from authentication
    const userId = req.headers['user-id'] as string || 'anonymous';
    
    // Get consent or use default if not found
    const consent = getCookieConsent(userId);
    
    // Attach consent to request for use in route handlers
    (req as any).cookieConsent = consent;
    
    next();
  } catch (error) {
    console.error('Error in cookie consent middleware:', error);
    next();
  }
}

/**
 * Set up privacy compliance routes
 */
export function setupPrivacyRoutes(app: any) {
  try {
    console.log('Setting up privacy and compliance routes...');
    
    // Initialize module
    initializePrivacyCompliance();
    
    // Add global privacy-related middleware
    app.use(privacyHeadersMiddleware);
    app.use(cookieConsentMiddleware);
    
    // Privacy notices endpoints
    app.get('/api/privacy/notice', (req: Request, res: Response) => {
      const region = detectUserRegion(req);
      const notice = getPrivacyNotice(region);
      res.json({ region, notice });
    });
    
    app.get('/api/privacy/cookie-policy', (req: Request, res: Response) => {
      const policy = getCookiePolicy();
      res.json({ policy });
    });
    
    // Cookie consent endpoints
    app.get('/api/privacy/cookie-consent', (req: Request, res: Response) => {
      const userId = req.headers['user-id'] as string || 'anonymous';
      const consent = getCookieConsent(userId);
      res.json(consent);
    });
    
    app.post('/api/privacy/cookie-consent', (req: Request, res: Response) => {
      try {
        const userId = req.headers['user-id'] as string || 'anonymous';
        
        // Validate request body
        const consentSchema = z.object({
          functional: z.boolean().optional(),
          analytics: z.boolean().optional(),
          advertising: z.boolean().optional(),
          social_media: z.boolean().optional()
        });
        
        const validatedData = consentSchema.parse(req.body);
        const updatedConsent = setCookieConsent(userId, validatedData);
        
        res.json(updatedConsent);
      } catch (error) {
        console.error('Error updating cookie consent:', error);
        res.status(400).json({ message: 'Invalid consent data' });
      }
    });
    
    // Data request endpoints
    app.post('/api/privacy/data-requests', (req: Request, res: Response) => {
      try {
        const userId = req.headers['user-id'] as string;
        
        if (!userId) {
          return res.status(401).json({ message: 'Authentication required' });
        }
        
        // Validate request body
        const requestSchema = z.object({
          type: z.enum([
            DataRequestType.ACCESS,
            DataRequestType.DELETION,
            DataRequestType.CORRECTION,
            DataRequestType.RESTRICTION,
            DataRequestType.PORTABILITY,
            DataRequestType.OBJECTION
          ]),
          description: z.string().optional()
        });
        
        const validatedData = requestSchema.parse(req.body);
        const dataRequest = createDataRequest(userId, validatedData.type, validatedData.description);
        
        res.json(dataRequest);
      } catch (error) {
        console.error('Error creating data request:', error);
        res.status(400).json({ message: 'Invalid request data' });
      }
    });
    
    app.get('/api/privacy/data-requests', (req: Request, res: Response) => {
      try {
        const userId = req.headers['user-id'] as string;
        
        if (!userId) {
          return res.status(401).json({ message: 'Authentication required' });
        }
        
        const requests = getDataRequests(userId);
        res.json(requests);
      } catch (error) {
        console.error('Error fetching data requests:', error);
        res.status(500).json({ message: 'Error fetching data requests' });
      }
    });
    
    // Data access endpoint (GDPR right to access)
    app.get('/api/privacy/my-data', async (req: Request, res: Response) => {
      try {
        const userId = req.headers['user-id'] as string;
        
        if (!userId) {
          return res.status(401).json({ message: 'Authentication required' });
        }
        
        const userData = await compileUserData(userId);
        res.json(userData);
      } catch (error) {
        console.error('Error compiling user data:', error);
        res.status(500).json({ message: 'Error compiling user data' });
      }
    });
    
    // IT Rules 2021 compliance (India) - Grievance contact
    app.get('/api/privacy/grievance-officer', (req: Request, res: Response) => {
      res.json({
        name: 'Grievance Officer',
        email: 'grievance@example.com',
        responseTime: '24 hours',
        resolutionTime: '15 days'
      });
    });
    
    // Add static policy files to public
    app.get('/privacy-policy', (req: Request, res: Response) => {
      const region = detectUserRegion(req);
      const notice = getPrivacyNotice(region);
      res.send(`<!DOCTYPE html>
      <html>
      <head>
        <title>Privacy Policy</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
          h1, h2, h3 { color: #333; }
          a { color: #0070f3; text-decoration: none; }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <div id="content">
          ${notice}
        </div>
      </body>
      </html>`);
    });
    
    app.get('/cookie-policy', (req: Request, res: Response) => {
      const policy = getCookiePolicy();
      res.send(`<!DOCTYPE html>
      <html>
      <head>
        <title>Cookie Policy</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
          h1, h2, h3 { color: #333; }
          a { color: #0070f3; text-decoration: none; }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <div id="content">
          ${policy}
        </div>
      </body>
      </html>`);
    });
    
    console.log('Privacy and compliance routes setup complete');
  } catch (error) {
    console.error('Error setting up privacy routes:', error);
    // Do not throw error to avoid breaking the app
  }
}