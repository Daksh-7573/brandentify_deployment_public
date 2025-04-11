import { IStorage } from './storage';
import { InsertPulse } from '../shared/schema';

/**
 * Creates demo news pulses, including an industry leader (Elon Musk) news pulse
 */
export async function createDemoNewsPulses(storage: IStorage) {
  console.log("[createDemoNewsPulses] Creating demo news pulses...");
  
  // Get the Elon Musk profile (assuming it was already created)
  const muskProfile = await storage.getUserByUsername("elon_musk");
  
  if (!muskProfile) {
    console.log("[createDemoNewsPulses] Error: Elon Musk profile not found. Please create demo profiles first.");
    return null;
  }
  
  // Create an AI-generated news pulse from Elon Musk (industry leader)
  const muskNewsPulse: InsertPulse = {
    userId: muskProfile.id,
    type: "news-pulse",
    title: "Space Industry Growth & AI Safety",
    content: `While SpaceX continues its rapid growth trajectory with Starship development and expanded Starlink coverage, I remain deeply concerned about AI safety. Our latest brain-computer interface at Neuralink has shown promising results in preliminary testing. The goal remains creating a symbiotic relationship between humans and AI, ensuring we maintain control as AI capabilities advance. Meanwhile, global EV adoption is accelerating faster than projected, with Tesla's next-generation manufacturing techniques reducing production costs by nearly 30%.`,
    mediaType: null,
    mediaUrls: [],
    mediaLocalStorageKeys: [],
    pollOptions: [],
    projectId: null,
    insightfulCount: 0,
    misinformedCount: 0,
    shareCount: 0,
    isPublished: true
  };
  
  const createdMuskPulse = await storage.createPulse(muskNewsPulse);
  
  // Create a standard news pulse about technology trends
  const techNewsPulse: InsertPulse = {
    userId: muskProfile.id,
    type: "news-pulse",
    title: "Technology Market Update",
    content: "Recent developments in quantum computing suggest we'll reach practical quantum advantage earlier than anticipated. Several companies have demonstrated error correction techniques that significantly improve qubit stability. Meanwhile, chip manufacturing innovations continue to push boundaries despite ongoing supply chain challenges. AI model sizes have plateaued as researchers focus on efficiency and specialized architectures rather than raw parameter counts.",
    mediaType: null,
    mediaUrls: [],
    mediaLocalStorageKeys: [],
    pollOptions: [],
    projectId: null,
    insightfulCount: 0,
    misinformedCount: 0,
    shareCount: 0,
    isPublished: true
  };
  
  const createdTechPulse = await storage.createPulse(techNewsPulse);
  
  const count = (createdMuskPulse ? 1 : 0) + (createdTechPulse ? 1 : 0);
  console.log(`[createDemoNewsPulses] Successfully created ${count} demo news pulses`);
  
  return {
    muskNewsPulse: createdMuskPulse,
    techNewsPulse: createdTechPulse
  };
}