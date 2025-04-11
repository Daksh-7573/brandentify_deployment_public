import { Request, Response } from 'express';
import { IStorage } from './storage';
import { createDemoProfiles } from './demo-profiles';

/**
 * Creates three detailed demo profiles with work experiences, education, skills, and projects
 */
export async function handleCreateDemoProfiles(req: Request, res: Response, storage: IStorage) {
  try {
    console.log("[handleCreateDemoProfiles] Creating demo profiles with complete details");
    
    const result = await createDemoProfiles(storage);
    
    res.status(200).json({
      message: "Demo profiles created successfully",
      profiles: {
        techProfile: { id: result.techProfile.id, name: result.techProfile.name },
        designerProfile: { id: result.designerProfile.id, name: result.designerProfile.name },
        dataScientistProfile: { id: result.dataScientistProfile.id, name: result.dataScientistProfile.name }
      }
    });
  } catch (error) {
    console.error("[handleCreateDemoProfiles] Error creating demo profiles:", error);
    res.status(500).json({ message: "Failed to create demo profiles" });
  }
}