import { IStorage } from './storage';
import { InsertUserPersonalInfo } from '../shared/schema';

/**
 * Helper function that adds personal information to all demo profiles
 * This provides contact details and links for each user
 */
export async function addDemoPersonalInfo(storage: IStorage) {
  
  // Get user IDs from storage
  const elonMusk = await storage.getUserByUsername("elon_musk");
  const techExec = await storage.getUserByUsername("alex_johnson");
  const designer = await storage.getUserByUsername("maya_rodriguez");
  const dataScientist = await storage.getUserByUsername("david_patel");
  
  if (!elonMusk || !techExec || !designer || !dataScientist) {
    console.log("Demo profiles not found. Create them first using createDemoProfiles()");
    return;
  }

  // Personal info for Elon Musk (Industry Leader)
  const muskPersonalInfo: InsertUserPersonalInfo = {
    userId: elonMusk.id,
    contactEmail: "elon.musk@example.com",
    contactPhone: "+1 (512) 555-7890",
    website: "https://www.spacex.com",
    githubProfile: "elonmusk",
    linkedinProfile: "elonmusk",
    twitterProfile: "elonmusk",
    instagramProfile: "elonmusk",
    calendlyLink: "https://calendly.com/elonmusk-demo",
    preferredContactMethod: "email"
  };

  // Personal info for Tech Executive (Alex Johnson)
  const techExecPersonalInfo: InsertUserPersonalInfo = {
    userId: techExec.id,
    contactEmail: "alex.johnson@example.com",
    contactPhone: "+1 (415) 555-1234",
    website: "https://www.alexjohnson-tech.example.com",
    githubProfile: "alexj-tech",
    linkedinProfile: "alex-johnson-tech",
    twitterProfile: "alexj_tech",
    instagramProfile: null,
    calendlyLink: "https://calendly.com/alexjohnson-demo",
    preferredContactMethod: "linkedin"
  };

  // Personal info for UX Designer (Maya Rodriguez)
  const designerPersonalInfo: InsertUserPersonalInfo = {
    userId: designer.id,
    contactEmail: "maya.rodriguez@example.com",
    contactPhone: "+1 (628) 555-9876",
    website: "https://www.mayarodriguez-design.example.com",
    githubProfile: "mayarodriguez",
    linkedinProfile: "maya-rodriguez-ux",
    twitterProfile: "maya_designs",
    instagramProfile: "maya.ux",
    calendlyLink: "https://calendly.com/mayarodriguez-demo",
    preferredContactMethod: "email"
  };

  // Personal info for Data Scientist (David Patel)
  const dataScientistPersonalInfo: InsertUserPersonalInfo = {
    userId: dataScientist.id,
    contactEmail: "david.patel@example.com",
    contactPhone: "+1 (312) 555-5678",
    website: "https://www.davidpatel-ai.example.com",
    githubProfile: "dpatel-ai",
    linkedinProfile: "david-patel-ml",
    twitterProfile: "davidpatel_ai",
    instagramProfile: null,
    calendlyLink: "https://calendly.com/davidpatel-demo",
    preferredContactMethod: "linkedin"
  };

  // Create all personal info entries
  console.log("Adding personal information for all demo profiles...");
  
  await storage.createUserPersonalInfo(muskPersonalInfo);
  await storage.createUserPersonalInfo(techExecPersonalInfo);
  await storage.createUserPersonalInfo(designerPersonalInfo);
  await storage.createUserPersonalInfo(dataScientistPersonalInfo);

  console.log("Successfully added personal information for all demo profiles!");
}