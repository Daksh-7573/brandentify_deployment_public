import { db } from "../db";
import { 
  cookieConsents, 
  dataRequests, 
  dataDeletions, 
  policyAcknowledgments,
  privacyAuditLogs,
  dataResidency,
  communicationPreferences,
  consentCategoryEnum,
  consentStatusEnum,
  deletionStatusEnum,
  geoRegionEnum,
  type InsertCookieConsent,
  type InsertDataRequest,
  type InsertDataDeletion,
  type InsertPrivacyAuditLog
} from "../../shared/privacy-schema";
import { users } from "../../shared/schema";
import { eq, and, inArray } from "drizzle-orm";
import crypto from "crypto";
import path from "path";
import fs from "fs";

/**
 * Privacy Service
 * 
 * Handles all privacy-related functionality including:
 * - Cookie consent management
 * - GDPR compliance (data access, deletion)
 * - IT Rules 2021 compliance (India)
 * - Data residency management
 * - Privacy audit logging
 */
export class PrivacyService {
  /**
   * Cookie Consent Management
   */

  // Set user cookie preferences by category
  async setConsentPreference(
    userId: string, 
    category: typeof consentCategoryEnum.enumValues[number], 
    status: typeof consentStatusEnum.enumValues[number],
    ipAddress?: string,
    userAgent?: string
  ) {
    try {
      // Check if a preference already exists for this user and category
      const existingConsent = await db.select()
        .from(cookieConsents)
        .where(
          and(
            eq(cookieConsents.userId, userId),
            eq(cookieConsents.category, category)
          )
        );

      let result;
      
      if (existingConsent.length > 0) {
        // Update existing preference
        result = await db.update(cookieConsents)
          .set({
            status,
            lastUpdated: new Date(),
            ipAddress,
            userAgent
          })
          .where(
            and(
              eq(cookieConsents.userId, userId),
              eq(cookieConsents.category, category)
            )
          )
          .returning();
      } else {
        // Create new preference
        const insertData: InsertCookieConsent = {
          userId,
          category,
          status,
          ipAddress,
          userAgent,
        };
        
        result = await db.insert(cookieConsents)
          .values(insertData)
          .returning();
      }

      // Log this privacy action
      await this.logPrivacyAction(userId, 'set_cookie_consent', {
        category,
        status,
        ipAddress
      });

      return result[0];
    } catch (error) {
      console.error('Error setting consent preference:', error);
      throw error;
    }
  }

  // Get all consent preferences for a user
  async getUserConsents(userId: string) {
    try {
      return await db.select()
        .from(cookieConsents)
        .where(eq(cookieConsents.userId, userId));
    } catch (error) {
      console.error('Error getting user consents:', error);
      throw error;
    }
  }

  // Check if user has consented to a specific category
  async hasConsented(userId: string, category: typeof consentCategoryEnum.enumValues[number]): Promise<boolean> {
    try {
      const consent = await db.select()
        .from(cookieConsents)
        .where(
          and(
            eq(cookieConsents.userId, userId),
            eq(cookieConsents.category, category)
          )
        );
      
      return consent.length > 0 && consent[0].status === 'granted';
    } catch (error) {
      console.error('Error checking consent status:', error);
      return false;
    }
  }

  /**
   * Data Access Requests (GDPR)
   */

  // Request data export (GDPR right to access)
  async requestDataExport(userId: string, requestIp?: string): Promise<string> {
    try {
      // Generate a verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      
      const insertData: InsertDataRequest = {
        userId,
        requestType: 'export',
        status: 'pending',
        verificationToken,
        requestIp
      };
      
      await db.insert(dataRequests)
        .values(insertData);
      
      // Log this privacy action
      await this.logPrivacyAction(userId, 'request_data_export', {
        requestIp
      });
      
      return verificationToken;
    } catch (error) {
      console.error('Error requesting data export:', error);
      throw error;
    }
  }

  // Request data deletion (GDPR right to be forgotten)
  async requestDataDeletion(userId: string, requestIp?: string): Promise<string> {
    try {
      // Generate a verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      
      const insertData: InsertDataRequest = {
        userId,
        requestType: 'deletion',
        status: 'pending',
        verificationToken,
        requestIp
      };
      
      const result = await db.insert(dataRequests)
        .values(insertData)
        .returning();
      
      // Log this privacy action
      await this.logPrivacyAction(userId, 'request_data_deletion', {
        requestIp
      });
      
      return verificationToken;
    } catch (error) {
      console.error('Error requesting data deletion:', error);
      throw error;
    }
  }

  // Verify a data request using the token
  async verifyDataRequest(token: string): Promise<boolean> {
    try {
      const request = await db.select()
        .from(dataRequests)
        .where(eq(dataRequests.verificationToken, token));
      
      if (request.length === 0) {
        return false;
      }
      
      // Update the request status
      await db.update(dataRequests)
        .set({
          status: 'verified'
        })
        .where(eq(dataRequests.verificationToken, token));
      
      // Log this privacy action
      await this.logPrivacyAction(request[0].userId, 'verify_data_request', {
        requestType: request[0].requestType,
        requestId: request[0].id
      });
      
      return true;
    } catch (error) {
      console.error('Error verifying data request:', error);
      return false;
    }
  }

  // Process a verified data export request
  async processDataExport(requestId: number): Promise<string> {
    try {
      const request = await db.select()
        .from(dataRequests)
        .where(eq(dataRequests.id, requestId));
      
      if (request.length === 0 || request[0].status !== 'verified') {
        throw new Error('Invalid or unverified request');
      }
      
      const userId = request[0].userId;
      
      // Gather user data from all relevant tables
      const userData = await this.gatherUserData(userId);
      
      // Create a JSON file with the user data
      const exportFileName = `user_data_${userId}_${Date.now()}.json`;
      const exportPath = path.join(__dirname, '../../exports', exportFileName);
      
      // Ensure the exports directory exists
      if (!fs.existsSync(path.join(__dirname, '../../exports'))) {
        fs.mkdirSync(path.join(__dirname, '../../exports'), { recursive: true });
      }
      
      fs.writeFileSync(exportPath, JSON.stringify(userData, null, 2));
      
      // Update the request status
      await db.update(dataRequests)
        .set({
          status: 'completed',
          completionDate: new Date()
        })
        .where(eq(dataRequests.id, requestId));
      
      // Log this privacy action
      await this.logPrivacyAction(userId, 'process_data_export', {
        requestId,
        exportFileName
      });
      
      return exportPath;
    } catch (error) {
      console.error('Error processing data export:', error);
      throw error;
    }
  }

  // Process a verified data deletion request
  async processDataDeletion(requestId: number): Promise<boolean> {
    try {
      const request = await db.select()
        .from(dataRequests)
        .where(eq(dataRequests.id, requestId));
      
      if (request.length === 0 || request[0].status !== 'verified') {
        throw new Error('Invalid or unverified request');
      }
      
      const userId = request[0].userId;
      
      // Start the deletion process
      const insertData: InsertDataDeletion = {
        userId,
        requestId,
        status: 'processing',
      };
      
      const deletion = await db.insert(dataDeletions)
        .values(insertData)
        .returning();
      
      // Perform the actual deletion
      const deletionSuccess = await this.deleteUserData(userId, deletion[0].id);
      
      if (deletionSuccess) {
        // Update the deletion record
        await db.update(dataDeletions)
          .set({
            status: 'completed',
            completedAt: new Date()
          })
          .where(eq(dataDeletions.id, deletion[0].id));
        
        // Update the request status
        await db.update(dataRequests)
          .set({
            status: 'completed',
            completionDate: new Date()
          })
          .where(eq(dataRequests.id, requestId));
      } else {
        // Update the deletion record
        await db.update(dataDeletions)
          .set({
            status: 'failed'
          })
          .where(eq(dataDeletions.id, deletion[0].id));
        
        // Update the request status
        await db.update(dataRequests)
          .set({
            status: 'failed'
          })
          .where(eq(dataRequests.id, requestId));
      }
      
      // Log this privacy action
      await this.logPrivacyAction(userId, 'process_data_deletion', {
        requestId,
        success: deletionSuccess
      });
      
      return deletionSuccess;
    } catch (error) {
      console.error('Error processing data deletion:', error);
      throw error;
    }
  }

  // Helper to gather user data from all tables
  private async gatherUserData(userId: string): Promise<any> {
    const userData: any = {};
    
    // Get user profile
    const userProfile = await db.select()
      .from(users)
      .where(eq(users.username, userId));
    
    if (userProfile.length > 0) {
      userData.profile = userProfile[0];
    }
    
    // Get cookie consents
    userData.cookieConsents = await db.select()
      .from(cookieConsents)
      .where(eq(cookieConsents.userId, userId));
    
    // Get data requests
    userData.dataRequests = await db.select()
      .from(dataRequests)
      .where(eq(dataRequests.userId, userId));
    
    // Get policy acknowledgments
    userData.policyAcknowledgments = await db.select()
      .from(policyAcknowledgments)
      .where(eq(policyAcknowledgments.userId, userId));
    
    // Get data residency preferences
    const residencyPrefs = await db.select()
      .from(dataResidency)
      .where(eq(dataResidency.userId, userId));
    
    if (residencyPrefs.length > 0) {
      userData.dataResidency = residencyPrefs[0];
    }
    
    // Get communication preferences
    const commPrefs = await db.select()
      .from(communicationPreferences)
      .where(eq(communicationPreferences.userId, userId));
    
    if (commPrefs.length > 0) {
      userData.communicationPreferences = commPrefs[0];
    }
    
    // Get all audit logs
    userData.auditLogs = await db.select()
      .from(privacyAuditLogs)
      .where(eq(privacyAuditLogs.userId, userId));
    
    // Add more data collections as needed
    
    return userData;
  }

  // Helper to delete user data from all tables
  private async deleteUserData(userId: string, deletionId: number): Promise<boolean> {
    try {
      const logs: any[] = [];
      
      // Delete cookie consents
      const cookieResult = await db.delete(cookieConsents)
        .where(eq(cookieConsents.userId, userId))
        .returning({ id: cookieConsents.id });
      
      logs.push({
        table: 'cookie_consents',
        deleted: cookieResult.length,
        ids: cookieResult.map(r => r.id)
      });
      
      // Delete policy acknowledgments
      const policyResult = await db.delete(policyAcknowledgments)
        .where(eq(policyAcknowledgments.userId, userId))
        .returning({ id: policyAcknowledgments.id });
      
      logs.push({
        table: 'policy_acknowledgments',
        deleted: policyResult.length,
        ids: policyResult.map(r => r.id)
      });
      
      // Delete data residency preferences
      const residencyResult = await db.delete(dataResidency)
        .where(eq(dataResidency.userId, userId))
        .returning({ userId: dataResidency.userId });
      
      logs.push({
        table: 'data_residency',
        deleted: residencyResult.length
      });
      
      // Delete communication preferences
      const commResult = await db.delete(communicationPreferences)
        .where(eq(communicationPreferences.userId, userId))
        .returning({ userId: communicationPreferences.userId });
      
      logs.push({
        table: 'communication_preferences',
        deleted: commResult.length
      });
      
      // Update the deletion logs
      await db.update(dataDeletions)
        .set({
          logs
        })
        .where(eq(dataDeletions.id, deletionId));
      
      return true;
    } catch (error) {
      console.error('Error deleting user data:', error);
      
      // Update the deletion logs with the error
      await db.update(dataDeletions)
        .set({
          logs: {
            error: error.message,
            stack: error.stack
          }
        })
        .where(eq(dataDeletions.id, deletionId));
      
      return false;
    }
  }

  /**
   * Privacy Policy Management
   */

  // Record user acknowledgment of privacy policy
  async acknowledgePolicyVersion(
    userId: string, 
    policyVersion: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    try {
      const result = await db.insert(policyAcknowledgments)
        .values({
          userId,
          policyVersion,
          ipAddress,
          userAgent
        })
        .returning();
      
      // Log this privacy action
      await this.logPrivacyAction(userId, 'acknowledge_policy', {
        policyVersion,
        ipAddress
      });
      
      return result[0];
    } catch (error) {
      console.error('Error acknowledging policy:', error);
      throw error;
    }
  }

  // Check if user has acknowledged the latest policy version
  async hasAcknowledgedLatestPolicy(userId: string, latestVersion: string): Promise<boolean> {
    try {
      const acknowledgment = await db.select()
        .from(policyAcknowledgments)
        .where(
          and(
            eq(policyAcknowledgments.userId, userId),
            eq(policyAcknowledgments.policyVersion, latestVersion)
          )
        );
      
      return acknowledgment.length > 0;
    } catch (error) {
      console.error('Error checking policy acknowledgment:', error);
      return false;
    }
  }

  /**
   * Data Residency Management
   */

  // Set user's data residency preference
  async setDataResidencyPreference(
    userId: string, 
    preferredRegion: typeof geoRegionEnum.enumValues[number],
    detectedRegion?: typeof geoRegionEnum.enumValues[number]
  ) {
    try {
      // Check if a preference already exists
      const existingPref = await db.select()
        .from(dataResidency)
        .where(eq(dataResidency.userId, userId));
      
      let result;
      
      if (existingPref.length > 0) {
        // Update existing preference
        result = await db.update(dataResidency)
          .set({
            preferredRegion,
            detectedRegion,
            lastUpdated: new Date()
          })
          .where(eq(dataResidency.userId, userId))
          .returning();
      } else {
        // Create new preference
        result = await db.insert(dataResidency)
          .values({
            userId,
            preferredRegion,
            detectedRegion
          })
          .returning();
      }
      
      // Log this privacy action
      await this.logPrivacyAction(userId, 'set_data_residency', {
        preferredRegion,
        detectedRegion
      });
      
      return result[0];
    } catch (error) {
      console.error('Error setting data residency preference:', error);
      throw error;
    }
  }

  // Get user's data residency preference
  async getDataResidencyPreference(userId: string) {
    try {
      const pref = await db.select()
        .from(dataResidency)
        .where(eq(dataResidency.userId, userId));
      
      return pref.length > 0 ? pref[0] : null;
    } catch (error) {
      console.error('Error getting data residency preference:', error);
      throw error;
    }
  }

  /**
   * Communication Preferences
   */

  // Set user's communication preferences
  async setCommunicationPreferences(
    userId: string, 
    preferences: {
      marketingEmails?: boolean;
      productUpdates?: boolean;
      securityAlerts?: boolean;
      newsletterFrequency?: string;
    }
  ) {
    try {
      // Check if preferences already exist
      const existingPrefs = await db.select()
        .from(communicationPreferences)
        .where(eq(communicationPreferences.userId, userId));
      
      let result;
      
      if (existingPrefs.length > 0) {
        // Update existing preferences
        result = await db.update(communicationPreferences)
          .set({
            ...preferences,
            lastUpdated: new Date()
          })
          .where(eq(communicationPreferences.userId, userId))
          .returning();
      } else {
        // Create new preferences
        result = await db.insert(communicationPreferences)
          .values({
            userId,
            ...preferences
          })
          .returning();
      }
      
      // Log this privacy action
      await this.logPrivacyAction(userId, 'set_communication_preferences', preferences);
      
      return result[0];
    } catch (error) {
      console.error('Error setting communication preferences:', error);
      throw error;
    }
  }

  // Get user's communication preferences
  async getCommunicationPreferences(userId: string) {
    try {
      const prefs = await db.select()
        .from(communicationPreferences)
        .where(eq(communicationPreferences.userId, userId));
      
      return prefs.length > 0 ? prefs[0] : null;
    } catch (error) {
      console.error('Error getting communication preferences:', error);
      throw error;
    }
  }

  /**
   * Privacy Audit Logging
   */

  // Log a privacy-related action
  async logPrivacyAction(
    userId: string, 
    action: string, 
    details?: any,
    ipAddress?: string,
    userAgent?: string
  ) {
    try {
      const logData: InsertPrivacyAuditLog = {
        userId,
        action,
        details,
        ipAddress,
        userAgent
      };
      
      await db.insert(privacyAuditLogs)
        .values(logData);
      
      return true;
    } catch (error) {
      console.error('Error logging privacy action:', error);
      return false;
    }
  }

  // Get privacy audit logs for a user
  async getUserPrivacyLogs(userId: string) {
    try {
      return await db.select()
        .from(privacyAuditLogs)
        .where(eq(privacyAuditLogs.userId, userId))
        .orderBy(privacyAuditLogs.performedAt);
    } catch (error) {
      console.error('Error getting user privacy logs:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const privacyService = new PrivacyService();