import { IStorage } from './storage';
import { InsertUserPersonalInfo } from '@shared/schema';

/**
 * Creates demo personal information entries for the demo profiles
 * This file contains contact information that will be displayed in the Quantum Card
 */
export async function addDemoPersonalInfo(storage: IStorage): Promise<void> {
  console.log('[addDemoPersonalInfo] Creating demo personal info for profiles');
  
  // Personal info for the Tech Professional (Alex Johnson)
  const techProfileInfo: InsertUserPersonalInfo = {
    userId: 1, // Tech profile ID from demo-profiles.ts
    contactEmail: "alex.johnson@techcompany.com",
    contactPhone: "+1 (555) 123-4567",
    website: "https://alexjohnson.dev",
    githubProfile: "https://github.com/alexjohnson-dev",
    linkedinProfile: "https://linkedin.com/in/alexjohnson-dev",
    twitterProfile: "https://twitter.com/alexjohnson_dev",
    instagramProfile: null,
    calendlyLink: "https://calendly.com/alexjohnson-dev",
    preferredContactMethod: "email"
  };
  
  // Personal info for the Designer (Maya Rodriguez)
  const designerProfileInfo: InsertUserPersonalInfo = {
    userId: 2, // Designer profile ID from demo-profiles.ts
    contactEmail: "maya.rodriguez@designstudio.com",
    contactPhone: "+1 (555) 234-5678",
    website: "https://mayarodriguez.design",
    githubProfile: null,
    linkedinProfile: "https://linkedin.com/in/mayarodriguez-design",
    twitterProfile: null,
    instagramProfile: "https://instagram.com/maya.creates",
    calendlyLink: "https://calendly.com/maya-designs",
    preferredContactMethod: "calendly"
  };
  
  // Personal info for the Data Scientist (David Patel)
  const dataScientistProfileInfo: InsertUserPersonalInfo = {
    userId: 3, // Data Scientist profile ID from demo-profiles.ts
    contactEmail: "david.patel@datainsights.com",
    contactPhone: "+1 (555) 345-6789",
    website: "https://davidpatel.ai",
    githubProfile: "https://github.com/davidpatel-ai",
    linkedinProfile: "https://linkedin.com/in/davidpatel-datascience",
    twitterProfile: "https://twitter.com/david_ai_insights",
    instagramProfile: null,
    calendlyLink: null,
    preferredContactMethod: "linkedin"
  };
  
  // Personal info for Elon Musk (Industry Leader)
  const muskProfileInfo: InsertUserPersonalInfo = {
    userId: 4, // Elon Musk profile ID from demo-profiles.ts
    contactEmail: "elon@spacex.com",
    contactPhone: null, // Elon is too busy for phone calls!
    website: "https://www.spacex.com",
    githubProfile: null,
    linkedinProfile: null,
    twitterProfile: "https://twitter.com/elonmusk",
    instagramProfile: null,
    calendlyLink: null,
    preferredContactMethod: "twitter"
  };
  
  // Create all demo personal info entries
  try {
    const techPersonalInfo = await storage.createUserPersonalInfo(techProfileInfo);
    console.log(`[addDemoPersonalInfo] Created personal info for Tech Professional with ID: ${techPersonalInfo.id}`);
    
    const designerPersonalInfo = await storage.createUserPersonalInfo(designerProfileInfo);
    console.log(`[addDemoPersonalInfo] Created personal info for Designer with ID: ${designerPersonalInfo.id}`);
    
    const dataScientistPersonalInfo = await storage.createUserPersonalInfo(dataScientistProfileInfo);
    console.log(`[addDemoPersonalInfo] Created personal info for Data Scientist with ID: ${dataScientistPersonalInfo.id}`);
    
    const muskPersonalInfo = await storage.createUserPersonalInfo(muskProfileInfo);
    console.log(`[addDemoPersonalInfo] Created personal info for Elon Musk with ID: ${muskPersonalInfo.id}`);
  } catch (error) {
    console.error('[addDemoPersonalInfo] Error creating demo personal info:', error);
  }
}