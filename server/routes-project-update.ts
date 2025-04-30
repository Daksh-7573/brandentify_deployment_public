import { Request, Response } from 'express';
import { storage } from './storage';

/**
 * Add a PATCH endpoint for projects that specifically handles industry updates
 * This fixes the issue with industry field not being properly updated
 */
export default function addProjectUpdateRoutes(apiRouter: any) {
  console.log("Setting up PATCH route for project industry updates at /api/projects/:id");
  
  // PATCH endpoint for updating project fields (including industry)
  apiRouter.patch("/projects/:id", async (req: Request, res: Response) => {
    console.log("PATCH /projects/:id handler received request");
    try {
      console.log(`[PATCH /projects/:id] Updating project fields with data:`, req.body);
      const projectId = parseInt(req.params.id);
      
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID format" });
      }
      
      // Check if project exists
      const existingProject = await storage.getProjectById(projectId);
      
      if (!existingProject) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      const projectData = req.body;
      console.log(`[PATCH /projects/:id] Updating project ${projectId} with data:`, projectData);
      console.log(`[PATCH /projects/:id] BEFORE update - Current project data:`, existingProject);
      
      // Special handling for industry field to ensure it's properly updated
      if (projectData.industry !== undefined) {
        console.log(`[PATCH /projects/:id] Industry field being updated to: "${projectData.industry}" (from "${existingProject.industry || 'empty'}")`);
      }
      
      const updatedProject = await storage.updateProject(projectId, projectData);
      console.log(`[PATCH /projects/:id] AFTER update - Updated project data:`, updatedProject);
      console.log(`[PATCH /projects/:id] Updated project ${projectId} successfully`);
      
      res.json(updatedProject);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return apiRouter;
}