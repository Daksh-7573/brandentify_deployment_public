import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { storage } from "./storage";

const router = Router();

function getAuthenticatedUserId(req: Request): number | null {
  const sessionToken = req.cookies?.brandentifier_session;

  if (sessionToken) {
    try {
      const decoded = jwt.verify(
        sessionToken,
        process.env.JWT_SECRET || "brandentifier-jwt-secret-key"
      ) as any;
      if (decoded.userId) {
        return decoded.userId;
      }
    } catch (error) {
      console.warn("[PROFILE BATCH] Invalid session token");
    }
  }

  const headerUserId = req.headers["x-user-id"] ? parseInt(req.headers["x-user-id"] as string) : null;
  const sessionUserId = (req as any).session?.userId;
  const userObjectId = (req as any).user?.id;
  const directUserId = (req as any).userId;

  return headerUserId || sessionUserId || userObjectId || directUserId || null;
}

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

router.get("/users/:userId/onboarding-status", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const currentUserId = getAuthenticatedUserId(req);
    if (!currentUserId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    if (currentUserId !== userId) {
      return res.status(403).json({ error: "You can only check your own onboarding status" });
    }

    const [user, brandGoals] = await Promise.all([
      storage.getUser(userId),
      storage.getBrandGoalsByUserId(userId)
    ]);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const selectedGoals = (brandGoals as any)?.selectedGoals || (brandGoals as any)?.selected_goals || [];
    const customGoals = (brandGoals as any)?.customGoals || (brandGoals as any)?.custom_goals || [];
    const totalGoals = (selectedGoals?.length || 0) + (customGoals?.length || 0);

    const requiredFields = ["name", "title", "location", "industry", "domain", "goals"];
    const missingFields: string[] = [];

    if (!user.name || !user.name.trim()) missingFields.push("name");
    if (!user.title || !user.title.trim()) missingFields.push("title");
    if (!user.location || !user.location.trim()) missingFields.push("location");
    if (!user.industry || !user.industry.trim()) missingFields.push("industry");
    if (!user.domain || !user.domain.trim()) missingFields.push("domain");
    if (totalGoals < 1) missingFields.push("goals");

    const isComplete = missingFields.length === 0;

    const payload = {
      userId,
      isComplete,
      requiredFields,
      missingFields,
      goals: {
        selectedCount: selectedGoals?.length || 0,
        customCount: customGoals?.length || 0,
        totalGoals
      }
    };

    if (!isComplete) {
      return res.status(403).json(payload);
    }

    return res.json(payload);
  } catch (error) {
    console.error("[PROFILE BATCH] Error checking onboarding status:", error);
    return res.status(500).json({ error: "Failed to check onboarding status" });
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
