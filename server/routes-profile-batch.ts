import { Router, Request, Response } from "express";
import { storage } from "./storage";

const router = Router();

router.get("/users/:userId/profile-complete", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    
    console.log(`[PROFILE BATCH] Fetching complete profile for user ${userId}`);
    const startTime = Date.now();
    
    const [
      user,
      experiences,
      educations,
      skills,
      projects,
      services
    ] = await Promise.all([
      storage.getUser(userId),
      storage.getWorkExperiencesByUserId(userId),
      storage.getEducationsByUserId(userId),
      storage.getSkillsByUserId(userId),
      storage.getProjectsByUserId(userId),
      storage.getServicesByUserId(userId)
    ]);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const projectIds = projects.map(p => p.id);
    
    let collaboratorsMap: Record<number, any[]> = {};
    let endorsementsMap: Record<number, any[]> = {};
    
    if (projectIds.length > 0) {
      const [collaboratorsResults, endorsementsResults] = await Promise.all([
        Promise.all(projectIds.map(id => storage.getProjectCollaboratorsByProjectId(id))),
        Promise.all(projectIds.map(id => storage.getProjectEndorsementsByProjectId(id)))
      ]);
      
      projectIds.forEach((id, index) => {
        collaboratorsMap[id] = collaboratorsResults[index] || [];
        endorsementsMap[id] = endorsementsResults[index] || [];
      });
    }
    
    const enrichedProjects = projects.map(project => ({
      ...project,
      collaborators: collaboratorsMap[project.id] || [],
      endorsements: endorsementsMap[project.id] || []
    }));
    
    const duration = Date.now() - startTime;
    console.log(`[PROFILE BATCH] Complete profile fetched in ${duration}ms`);
    
    res.json({
      user,
      experiences,
      educations,
      skills,
      projects: enrichedProjects,
      services,
      _meta: {
        fetchedAt: new Date().toISOString(),
        durationMs: duration
      }
    });
  } catch (error) {
    console.error("[PROFILE BATCH] Error fetching complete profile:", error);
    res.status(500).json({ error: "Failed to fetch complete profile" });
  }
});

router.get("/users/:userId/profile-summary", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    
    const [user, experiencesCount, educationsCount, skillsCount, projectsCount, servicesCount] = await Promise.all([
      storage.getUser(userId),
      storage.getWorkExperiencesByUserId(userId).then(arr => arr.length),
      storage.getEducationsByUserId(userId).then(arr => arr.length),
      storage.getSkillsByUserId(userId).then(arr => arr.length),
      storage.getProjectsByUserId(userId).then(arr => arr.length),
      storage.getServicesByUserId(userId).then(arr => arr.length)
    ]);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({
      user,
      counts: {
        experiences: experiencesCount,
        educations: educationsCount,
        skills: skillsCount,
        projects: projectsCount,
        services: servicesCount
      }
    });
  } catch (error) {
    console.error("[PROFILE SUMMARY] Error:", error);
    res.status(500).json({ error: "Failed to fetch profile summary" });
  }
});

export default router;
