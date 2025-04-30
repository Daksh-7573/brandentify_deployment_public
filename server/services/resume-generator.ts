/**
 * Resume Generator Service
 * 
 * This service automatically generates a resume PDF based on user profile data.
 * It compiles information from work experiences, education, skills, and other profile elements
 * to create a professional resume without requiring manual input.
 */

import { User, WorkExperience, Education, Skill, Service } from '@shared/schema';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { users, workExperiences, educations, skills, services } from '@shared/schema';
import { generatePdf } from './pdf-generator';
import * as fs from 'fs';
import * as path from 'path';

// Type to store all user data needed for resume
interface ResumeData {
  user: User;
  workExperiences: WorkExperience[];
  educations: Education[];
  skills: Skill[];
  services: Service[];
}

/**
 * Checks if a user has sufficient profile data to generate a resume
 * @param userId User ID to check
 * @returns Boolean indicating if resume can be generated
 */
export async function canGenerateResume(userId: number): Promise<boolean> {
  try {
    const userData = await fetchUserData(userId);
    
    // Basic requirement checks
    if (!userData.user || !userData.user.name || !userData.user.title) {
      console.log('[canGenerateResume] Missing basic user data');
      return false;
    }
    
    // Check for minimum data requirements
    const hasWorkExperience = userData.workExperiences.length > 0;
    const hasSkills = userData.skills.length > 0;
    
    return hasWorkExperience && hasSkills;
  } catch (error) {
    console.error('[canGenerateResume] Error checking resume eligibility:', error);
    return false;
  }
}

/**
 * Fetches all relevant user data needed for resume generation
 * @param userId User ID to fetch data for
 * @returns Compiled user data object
 */
async function fetchUserData(userId: number): Promise<ResumeData> {
  try {
    // Fetch user information
    const [userResult] = await db.select().from(users).where(eq(users.id, userId));
    
    // Fetch work experiences
    const workExperienceResults = await db
      .select()
      .from(workExperiences)
      .where(eq(workExperiences.userId, userId));
    
    // Fetch education
    const educationResults = await db
      .select()
      .from(educations)
      .where(eq(educations.userId, userId));
    
    // Fetch skills
    const skillResults = await db
      .select()
      .from(skills)
      .where(eq(skills.userId, userId));
    
    // Fetch services
    const serviceResults = await db
      .select()
      .from(services)
      .where(eq(services.userId, userId));
    
    return {
      user: userResult,
      workExperiences: workExperienceResults,
      educations: educationResults,
      skills: skillResults,
      services: serviceResults
    };
  } catch (error) {
    console.error('[fetchUserData] Error fetching user data:', error);
    throw error;
  }
}

/**
 * Generates an HTML template for the resume from user data
 * @param data User data for resume
 * @returns HTML string for the resume
 */
function generateResumeHtml(data: ResumeData): string {
  const { user, workExperiences, educations, skills, services } = data;
  
  // Generate the HTML template
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Resume - ${user.name}</title>
      <style>
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .resume-container {
          max-width: 800px;
          margin: 0 auto;
          border: 1px solid #eaeaea;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          padding: 40px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 20px;
        }
        .name {
          font-size: 28px;
          font-weight: 700;
          margin: 0;
          color: #111;
        }
        .title {
          font-size: 18px;
          color: #555;
          margin: 5px 0 10px;
        }
        .contact-info {
          font-size: 14px;
          color: #666;
          margin: 5px 0;
        }
        .section {
          margin-bottom: 30px;
        }
        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #222;
          margin-bottom: 15px;
          border-bottom: 1px solid #eaeaea;
          padding-bottom: 5px;
        }
        .experience-item, .education-item, .skill-item {
          margin-bottom: 20px;
        }
        .job-title, .degree {
          font-weight: 600;
          font-size: 16px;
          color: #333;
          margin: 0;
        }
        .company, .institution {
          font-weight: 500;
          font-size: 15px;
          color: #444;
          margin: 5px 0;
        }
        .period, .location {
          font-size: 14px;
          color: #666;
          margin: 2px 0;
        }
        .description {
          font-size: 14px;
          color: #555;
          margin-top: 8px;
          line-height: 1.5;
        }
        .skills-container {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .skill-badge {
          background-color: #f5f5f5;
          border-radius: 15px;
          padding: 5px 12px;
          font-size: 14px;
        }
        .responsibilities {
          margin-top: 10px;
          padding-left: 20px;
        }
        .responsibilities li {
          margin-bottom: 5px;
          font-size: 14px;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          font-size: 12px;
          color: #999;
        }
      </style>
    </head>
    <body>
      <div class="resume-container">
        <div class="header">
          <h1 class="name">${user.name}</h1>
          <p class="title">${user.title || ''}</p>
          <p class="contact-info">
            ${user.location ? `${user.location} | ` : ''}
            ${user.email ? `${user.email} | ` : ''}
            ${user.phoneNumber ? user.phoneNumber : ''}
          </p>
        </div>
        
        ${user.aboutMe ? `
        <div class="section">
          <h2 class="section-title">Professional Summary</h2>
          <p class="description">${user.aboutMe}</p>
        </div>
        ` : ''}
        
        ${workExperiences.length > 0 ? `
        <div class="section">
          <h2 class="section-title">Work Experience</h2>
          ${workExperiences.map(exp => `
            <div class="experience-item">
              <h3 class="job-title">${exp.title}</h3>
              <p class="company">${exp.company}${exp.location ? ` - ${exp.location}` : ''}</p>
              <p class="period">${exp.startDate} - ${exp.endDate || 'Present'}</p>
              ${exp.description ? `<p class="description">${exp.description}</p>` : ''}
              ${exp.keyResponsibilities && Array.isArray(exp.keyResponsibilities) && exp.keyResponsibilities.length > 0 ? `
                <ul class="responsibilities">
                  ${exp.keyResponsibilities.map((resp: string) => `<li>${resp}</li>`).join('')}
                </ul>
              ` : ''}
            </div>
          `).join('')}
        </div>
        ` : ''}
        
        ${educations.length > 0 ? `
        <div class="section">
          <h2 class="section-title">Education</h2>
          ${educations.map(edu => `
            <div class="education-item">
              <h3 class="degree">${edu.degree}${edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}</h3>
              <p class="institution">${edu.institution}${edu.location ? ` - ${edu.location}` : ''}</p>
              <p class="period">${edu.startDate} - ${edu.endDate || 'Present'}</p>
            </div>
          `).join('')}
        </div>
        ` : ''}
        
        ${skills.length > 0 ? `
        <div class="section">
          <h2 class="section-title">Skills</h2>
          <div class="skills-container">
            ${skills.map(skill => `
              <span class="skill-badge">${skill.name}${skill.level ? ` - ${skill.level}` : ''}</span>
            `).join('')}
          </div>
        </div>
        ` : ''}
        
        ${services.length > 0 ? `
        <div class="section">
          <h2 class="section-title">Services & Expertise</h2>
          ${services.map(service => `
            <div class="experience-item">
              <h3 class="job-title">${service.title}</h3>
              ${service.description ? `<p class="description">${service.description}</p>` : ''}
            </div>
          `).join('')}
        </div>
        ` : ''}
        
        <div class="footer">
          <p>This resume was automatically generated from profile data on ${new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Service to create a PDF generator (stub implementation)
 * In a real implementation, this would use a PDF generation library
 */
export const generatePdf = async (html: string, outputPath: string): Promise<string> => {
  try {
    // Simulating PDF generation
    // In a real implementation, you would use a library like puppeteer or html-pdf
    // to convert the HTML to a PDF and save it to the output path
    
    // For now, we'll just write the HTML to a file as a placeholder
    const tempDir = path.join(process.cwd(), 'tmp');
    
    // Ensure tmp directory exists
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Write HTML to file
    fs.writeFileSync(outputPath, html);
    
    console.log(`[generatePdf] Generated resume at ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('[generatePdf] Error generating PDF:', error);
    throw error;
  }
};

/**
 * Main function to generate a resume for a user
 * @param userId User ID to generate resume for
 * @returns URL to the generated resume
 */
export async function generateResume(userId: number): Promise<string> {
  try {
    // Check if user can have a resume generated
    const canGenerate = await canGenerateResume(userId);
    if (!canGenerate) {
      throw new Error('User does not have sufficient profile data to generate a resume');
    }
    
    // Fetch user data
    const userData = await fetchUserData(userId);
    
    // Generate HTML for the resume
    const html = generateResumeHtml(userData);
    
    // Generate a unique filename
    const timestamp = Date.now();
    const filename = `resume_${userId}_${timestamp}.html`;
    
    // Set the output path
    const outputDir = path.join(process.cwd(), 'public', 'resumes');
    
    // Ensure directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const outputPath = path.join(outputDir, filename);
    
    // Generate PDF (in this case, just HTML)
    await generatePdf(html, outputPath);
    
    // Public URL for the resume
    const resumeUrl = `/resumes/${filename}`;
    
    // Update user record to indicate resume has been generated
    await db.update(users)
      .set({
        hasGeneratedResume: true,
        resumeUrl: resumeUrl,
        resumeGeneratedAt: new Date(),
      })
      .where(eq(users.id, userId));
    
    console.log(`[generateResume] Resume generated for user ${userId}: ${resumeUrl}`);
    return resumeUrl;
  } catch (error) {
    console.error('[generateResume] Error generating resume:', error);
    throw error;
  }
}