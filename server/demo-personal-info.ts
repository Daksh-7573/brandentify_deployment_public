import { UserPersonalInfo } from "@shared/schema";
import { IStorage } from "./storage";

/**
 * Creates personal information for demo users
 */
export async function addDemoPersonalInfo(storage: IStorage): Promise<void> {
  console.log("[addDemoPersonalInfo] Creating personal info for demo profiles");
  
  // Personal info for Alex Johnson (VP of Engineering)
  const techPersonalInfo: UserPersonalInfo = await storage.createUserPersonalInfo({
    userId: 2, // techProfile.id
    contactEmail: "alex.johnson@techcorp.com",
    contactPhone: "+1 (415) 555-7890",
    website: "https://alexjohnson.dev",
    githubProfile: "https://github.com/alexjohnson-dev",
    linkedinProfile: "https://linkedin.com/in/alexjohnson-tech",
    twitterProfile: "https://twitter.com/alexj_tech",
    instagramProfile: null,
    calendlyLink: "https://calendly.com/alexjohnson-tech",
    preferredContactMethod: "email"
  });
  
  // Personal info for Maya Rodriguez (Designer)
  const designerPersonalInfo: UserPersonalInfo = await storage.createUserPersonalInfo({
    userId: 3, // designerProfile.id
    contactEmail: "maya.rodriguez@designstudio.com",
    contactPhone: "+1 (628) 555-4321",
    website: "https://mayarodriguez.design",
    githubProfile: null,
    linkedinProfile: "https://linkedin.com/in/mayarodriguez-design",
    twitterProfile: "https://twitter.com/maya_designs",
    instagramProfile: "https://instagram.com/maya.creative",
    calendlyLink: "https://calendly.com/maya-rodriguez",
    preferredContactMethod: "phone"
  });
  
  // Personal info for David Patel (Data Scientist)
  const dataScientistPersonalInfo: UserPersonalInfo = await storage.createUserPersonalInfo({
    userId: 4, // dataScientistProfile.id
    contactEmail: "david.patel@ailab.io",
    contactPhone: "+1 (510) 555-6789",
    website: "https://davidpatel.ai",
    githubProfile: "https://github.com/davidpatel-ai",
    linkedinProfile: "https://linkedin.com/in/davidpatel-data",
    twitterProfile: "https://twitter.com/davidpatel_data",
    instagramProfile: null,
    calendlyLink: "https://calendly.com/david-patel-ai",
    preferredContactMethod: "email"
  });
  
  // Personal info for Elon Musk (CEO & Chief Engineer)
  const muskPersonalInfo: UserPersonalInfo = await storage.createUserPersonalInfo({
    userId: 5, // muskProfile.id
    contactEmail: "elon@spacex.com",
    contactPhone: "+1 (800) 555-1234",
    website: "https://elonmusk.com",
    githubProfile: null,
    linkedinProfile: "https://linkedin.com/in/elonmusk",
    twitterProfile: "https://twitter.com/elonmusk",
    instagramProfile: null,
    calendlyLink: null,
    preferredContactMethod: "twitter"
  });
  
  console.log("[addDemoPersonalInfo] Created personal info for all demo profiles");
}