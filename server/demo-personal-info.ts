/**
 * Helper function that adds personal information to all demo profiles
 * This provides contact details and links for each user
 */

import { InsertUserPersonalInfo } from "../shared/schema";
import { IStorage } from "./storage";

export async function addDemoPersonalInfo(storage: IStorage) {
  console.log("[demo-personal-info] Adding personal information to demo profiles");

  // Elon Musk personal information
  const muskPersonalInfo: InsertUserPersonalInfo = {
    userId: 2, // Musk user ID
    contactEmail: "elon@spacex.com",
    contactPhone: "+1 (800) MARS-NOW",
    website: "https://spacex.com",
    linkedinProfile: "https://linkedin.com/in/elonmusk",
    twitterProfile: "https://twitter.com/elonmusk",
    instagramProfile: null,
    githubProfile: null,
    preferredContactMethod: "twitter"
  };
  await storage.createUserPersonalInfo(muskPersonalInfo);

  // Tech Executive personal information
  const techExecPersonalInfo: InsertUserPersonalInfo = {
    userId: 3, // Tech Exec user ID
    contactEmail: "alex.johnson@techcorp.com",
    contactPhone: "+1 (415) 555-1234",
    website: "https://alexjohnson.dev",
    linkedinProfile: "https://linkedin.com/in/alexjohnson",
    twitterProfile: "https://twitter.com/alexjtech",
    githubProfile: "https://github.com/alexjohnson-dev",
    instagramProfile: "https://instagram.com/alexj.tech",
    preferredContactMethod: "email"
  };
  await storage.createUserPersonalInfo(techExecPersonalInfo);

  // Designer personal information
  const designerPersonalInfo: InsertUserPersonalInfo = {
    userId: 4, // Designer user ID
    contactEmail: "maya@designbymaya.com",
    contactPhone: "+1 (628) 555-9876",
    website: "https://designbymaya.com",
    linkedinProfile: "https://linkedin.com/in/mayarodriguez",
    twitterProfile: null,
    githubProfile: "https://github.com/maya-designs",
    instagramProfile: "https://instagram.com/maya.designs",
    preferredContactMethod: "website"
  };
  await storage.createUserPersonalInfo(designerPersonalInfo);

  // Data Scientist personal information
  const dataScientistPersonalInfo: InsertUserPersonalInfo = {
    userId: 5, // Data Scientist user ID
    contactEmail: "david.patel@datainsights.ai",
    contactPhone: "+1 (510) 555-4567",
    website: "https://davidpatel.ai",
    linkedinProfile: "https://linkedin.com/in/davidpatel",
    twitterProfile: "https://twitter.com/davidpatel_ai",
    githubProfile: "https://github.com/davidpatel",
    instagramProfile: null,
    preferredContactMethod: "linkedin"
  };
  await storage.createUserPersonalInfo(dataScientistPersonalInfo);

  // Create personal info for demo user (user1)
  const demoUserPersonalInfo: InsertUserPersonalInfo = {
    userId: 1, // Demo user ID
    contactEmail: "user1@example.com",
    contactPhone: "+1 (555) 123-4567",
    website: "https://myportfolio.com",
    linkedinProfile: "https://linkedin.com/in/seniorpro",
    twitterProfile: "https://twitter.com/seniorpro",
    githubProfile: "https://github.com/seniorpro",
    instagramProfile: "https://instagram.com/seniorpro",
    preferredContactMethod: "email"
  };
  await storage.createUserPersonalInfo(demoUserPersonalInfo);

  console.log("[demo-personal-info] Successfully added personal information to all demo profiles");
}