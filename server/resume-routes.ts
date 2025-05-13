import express from 'express';
import { upload, extractTextFromFile, parseResume, cleanupFile } from './services/resume-parser-service';
import { storage } from './storage';

const router = express.Router();

// Parse a resume file
router.post('/resume/parse', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Get file path and type
    const filePath = req.file.path;
    const fileType = req.file.mimetype;
    
    // Extract text from file
    const resumeText = await extractTextFromFile(filePath, fileType);
    
    // Use OpenAI to parse resume content
    const parsedResume = await parseResume(resumeText);
    
    // Cleanup temporary file
    await cleanupFile(filePath);
    
    // Return parsed data
    res.json(parsedResume);
  } catch (error) {
    console.error('Error processing resume:', error);
    res.status(500).json({ 
      error: 'Failed to process resume', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Update user profile with resume data
router.post('/profile/update-from-resume', async (req, res) => {
  try {
    const { userId, mappedData } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    if (!mappedData) {
      return res.status(400).json({ error: 'Mapped data is required' });
    }
    
    // Get user
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update user profile information
    if (mappedData.personalInfo && mappedData.personalInfo.include) {
      const personalInfo = mappedData.personalInfo.data;
      
      // Update user basic info
      const updatedUser = {
        ...user,
        name: personalInfo.name || user.name,
        title: personalInfo.title || user.title,
        location: personalInfo.location || user.location,
        aboutMe: personalInfo.summary || user.aboutMe
      };
      
      await storage.updateUser(userId, updatedUser);
    }
    
    // Add work experiences
    if (mappedData.workExperience && mappedData.workExperience.include && 
        mappedData.workExperience.data && mappedData.workExperience.data.length > 0) {
      
      for (const experience of mappedData.workExperience.data) {
        await storage.addWorkExperience({
          userId,
          title: experience.title,
          company: experience.company,
          location: experience.location || null,
          startDate: experience.startDate || '',
          endDate: experience.endDate || null,
          description: experience.description || null,
          industry: experience.industry || null,
          domain: experience.domain || null
        });
      }
    }
    
    // Add education
    if (mappedData.education && mappedData.education.include &&
        mappedData.education.data && mappedData.education.data.length > 0) {
      
      for (const education of mappedData.education.data) {
        await storage.addEducation({
          userId,
          institution: education.institution,
          degree: education.degree,
          fieldOfStudy: education.fieldOfStudy || null,
          location: education.location || null,
          startDate: education.startDate || '',
          endDate: education.endDate || null
        });
      }
    }
    
    // Add skills
    if (mappedData.skills && mappedData.skills.include &&
        mappedData.skills.data && mappedData.skills.data.length > 0) {
      
      for (const skill of mappedData.skills.data) {
        await storage.addSkill({
          userId,
          name: skill.name,
          category: skill.category || null,
          proficiency: skill.level || 3
        });
      }
    }
    
    // Add projects
    if (mappedData.projects && mappedData.projects.include &&
        mappedData.projects.data && mappedData.projects.data.length > 0) {
      
      for (const project of mappedData.projects.data) {
        await storage.addProject({
          userId,
          title: project.title,
          description: project.description || null,
          projectUrl: project.url || null,
          startDate: project.startDate || null,
          technologies: project.technologies?.join(', ') || null
        });
      }
    }
    
    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile from resume:', error);
    res.status(500).json({ 
      error: 'Failed to update profile', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

export default router;