/**
 * Main file for initializing all demo data
 * This file orchestrates the creation of comprehensive demo profiles with all components
 */

import { IStorage } from "./storage";
import { createDemoProfiles } from "./demo-profiles";
import { addDemoServices } from "./demo-services";
import { addDemoPersonalInfo } from "./demo-personal-info";

/**
 * Initialize all demo data
 * Call this function to create comprehensive demo profiles with:
 * - User information
 * - Work experience
 * - Education
 * - Skills
 * - Projects with collaborators
 * - Services
 * - Personal information for contact details
 */
export async function initializeComprehensiveDemoData(storage: IStorage) {
  console.log("[initialize-demo-data] Starting comprehensive demo data initialization");
  
  // Create demo profiles with basic user info, work experience, education, skills, and projects
  await createDemoProfiles(storage);
  
  // Add services to all profiles
  await addDemoServices(storage);
  
  // Add personal information (contact details) to all profiles
  await addDemoPersonalInfo(storage);
  
  console.log("[initialize-demo-data] Successfully initialized all comprehensive demo data");
}