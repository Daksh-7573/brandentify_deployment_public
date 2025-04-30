/**
 * Resume Generator Service
 * 
 * This service automatically generates a resume PDF based on user profile data.
 * It compiles information from work experiences, education, skills, and other profile elements
 * to create a professional resume without requiring manual input.
 */

import { db } from '../db';
import { users, workExperiences, educations, skills, services } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { User, WorkExperience, Education, Skill, Service } from '@shared/schema';
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

// Define the resume data interface
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
    // Check if user exists
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      return false;
    }
    
    // Check if user has at least one work experience
    const workExperienceCount = await db
      .select({ count: { id: workExperiences.id } })
      .from(workExperiences)
      .where(eq(workExperiences.userId, userId));
    
    if (!workExperienceCount[0] || workExperienceCount[0].count < 1) {
      return false;
    }
    
    // Check if user has at least one skill
    const skillCount = await db
      .select({ count: { id: skills.id } })
      .from(skills)
      .where(eq(skills.userId, userId));
    
    if (!skillCount[0] || skillCount[0].count < 1) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('[canGenerateResume] Error:', error);
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
    // Fetch user basic info
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      throw new Error('User not found');
    }
    
    // Fetch work experiences
    const userWorkExperiences = await db
      .select()
      .from(workExperiences)
      .where(eq(workExperiences.userId, userId))
      .orderBy((exp) => exp.startDate);
    
    // Fetch education
    const userEducations = await db
      .select()
      .from(educations)
      .where(eq(educations.userId, userId))
      .orderBy((edu) => edu.startDate);
    
    // Fetch skills
    const userSkills = await db
      .select()
      .from(skills)
      .where(eq(skills.userId, userId));
    
    // Fetch services
    const userServices = await db
      .select()
      .from(services)
      .where(eq(services.userId, userId));
    
    return {
      user,
      workExperiences: userWorkExperiences,
      educations: userEducations,
      skills: userSkills,
      services: userServices
    };
  } catch (error) {
    console.error('[fetchUserData] Error:', error);
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
  
  // Format the date to a readable format
  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return 'Present';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };
  
  // Create a skills section with a max of 9 skills
  const skillsHtml = skills.slice(0, 9).map(skill => `
    <div class="skill">
      <span class="skill-name">${skill.name}</span>
      <div class="skill-bar">
        <div class="skill-level" style="width: ${skill.proficiency || 80}%"></div>
      </div>
    </div>
  `).join('');
  
  // Create work experience section
  const workExperienceHtml = workExperiences.map(exp => {
    let responsibilities = [];
    try {
      if (exp.responsibilities && typeof exp.responsibilities === 'string') {
        responsibilities = JSON.parse(exp.responsibilities);
      }
    } catch (e) {
      responsibilities = [];
    }
    
    const responsibilitiesHtml = Array.isArray(responsibilities) && responsibilities.length > 0
      ? `<ul class="responsibilities">
          ${responsibilities.map(item => `<li>${item}</li>`).join('')}
        </ul>`
      : '';
    
    return `
      <div class="experience">
        <div class="experience-header">
          <h3>${exp.title}</h3>
          <h4>${exp.company}</h4>
          <span class="date">${formatDate(exp.startDate)} - ${formatDate(exp.endDate)}</span>
        </div>
        <p>${exp.description || ''}</p>
        ${responsibilitiesHtml}
      </div>
    `;
  }).join('');
  
  // Create education section
  const educationHtml = educations.map(edu => {
    return `
      <div class="education">
        <h3>${edu.institution}</h3>
        <h4>${edu.degree}${edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}</h4>
        <span class="date">${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}</span>
      </div>
    `;
  }).join('');
  
  // Create services section (treated as "What I Offer" in the resume)
  const servicesHtml = services.length > 0 
    ? `<div class="services-section">
        <h2>What I Offer</h2>
        <div class="services">
          ${services.map(service => `
            <div class="service">
              <h3>${service.title}</h3>
              <p>${service.description}</p>
            </div>
          `).join('')}
        </div>
      </div>`
    : '';
  
  // Generate the full HTML
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${user.name} - Resume</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      }
      body {
        font-size: 12pt;
        line-height: 1.6;
        color: #333;
        background: white;
        max-width: 8.5in;
        margin: 0 auto;
        padding: 0.5in;
      }
      .header {
        text-align: center;
        margin-bottom: 20px;
        padding-bottom: 20px;
        border-bottom: 1px solid #eee;
      }
      .header h1 {
        font-size: 24pt;
        margin-bottom: 5px;
        color: #2a4365;
      }
      .header h2 {
        font-size: 14pt;
        font-weight: 400;
        color: #4a5568;
      }
      .contact-info {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 15px;
        margin: 10px 0;
        font-size: 10pt;
      }
      .contact-info span {
        display: inline-flex;
        align-items: center;
      }
      .section {
        margin: 20px 0;
      }
      .section h2 {
        font-size: 14pt;
        color: #2a4365;
        margin-bottom: 10px;
        padding-bottom: 5px;
        border-bottom: 1px solid #eee;
      }
      .experience, .education {
        margin-bottom: 15px;
      }
      .experience-header, .education-header {
        margin-bottom: 5px;
      }
      .experience-header h3, .education h3 {
        font-size: 12pt;
        color: #1a365d;
      }
      .experience-header h4, .education h4 {
        font-size: 11pt;
        font-weight: 600;
        color: #4a5568;
      }
      .date {
        font-size: 10pt;
        color: #718096;
        font-style: italic;
      }
      .responsibilities {
        margin-top: 5px;
        padding-left: 20px;
      }
      .responsibilities li {
        margin-bottom: 3px;
      }
      .skills-section {
        margin: 20px 0;
      }
      .skills-container {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
      }
      .skill {
        flex: 0 0 calc(33.333% - 10px);
      }
      .skill-name {
        font-weight: 600;
        display: block;
        margin-bottom: 3px;
      }
      .skill-bar {
        height: 8px;
        background: #edf2f7;
        border-radius: 4px;
        overflow: hidden;
      }
      .skill-level {
        height: 100%;
        background: #4299e1;
        border-radius: 4px;
      }
      .services-section {
        margin: 20px 0;
      }
      .services {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
      }
      .service {
        flex: 0 0 calc(50% - 10px);
        padding: 10px;
        background: #f7fafc;
        border-radius: 5px;
      }
      .service h3 {
        font-size: 11pt;
        color: #2c5282;
        margin-bottom: 5px;
      }
      .about-me {
        margin: 20px 0;
      }
      @media print {
        body {
          padding: 0;
        }
        .page-break {
          page-break-after: always;
        }
      }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>${user.name}</h1>
      <h2>${user.title || 'Professional'}</h2>
      <div class="contact-info">
        ${user.email ? `<span>📧 ${user.email}</span>` : ''}
        ${user.phoneNumber ? `<span>📱 ${user.phoneNumber}</span>` : ''}
        ${user.location ? `<span>📍 ${user.location}</span>` : ''}
      </div>
    </div>
    
    ${user.aboutMe ? `
      <div class="about-me">
        <h2>About Me</h2>
        <p>${user.aboutMe}</p>
      </div>
    ` : ''}
    
    <div class="section">
      <h2>Work Experience</h2>
      ${workExperienceHtml}
    </div>
    
    <div class="section">
      <h2>Education</h2>
      ${educationHtml}
    </div>
    
    <div class="skills-section">
      <h2>Skills</h2>
      <div class="skills-container">
        ${skillsHtml}
      </div>
    </div>
    
    ${servicesHtml}
    
    <div class="footer">
      <p style="text-align: center; font-size: 9pt; color: #a0aec0; margin-top: 30px;">
        Generated by Brandentifier on ${new Date().toLocaleDateString()}
      </p>
    </div>
  </body>
  </html>
  `;
}

/**
 * Service to create a PDF from HTML using puppeteer
 * @param html HTML content to convert to PDF
 * @param outputPath Path to save the PDF file
 * @returns URL to the generated PDF file
 */
export const generatePdf = async (html: string, outputPath: string): Promise<string> => {
  try {
    // Create upload directory if it doesn't exist
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Launch a headless browser
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true,
    });
    
    // Create a new page
    const page = await browser.newPage();
    
    // Set the content to our HTML template
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Generate PDF
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });
    
    // Close the browser
    await browser.close();
    
    // Return the URL path to the PDF
    return outputPath.replace(/^public/, '');
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
    // Fetch user data
    const userData = await fetchUserData(userId);
    
    // Generate resume HTML
    const resumeHtml = generateResumeHtml(userData);
    
    // Set output file path in public uploads directory
    const timestamp = Date.now();
    const filename = `${userData.user.name.replace(/\s+/g, '_')}_Resume_${timestamp}.pdf`;
    const outputPath = path.join(process.cwd(), 'public', 'uploads', 'resumes', filename);
    
    // Generate PDF file
    const resumeUrl = await generatePdf(resumeHtml, outputPath);
    
    // Update user record with resume information
    await db.update(users)
      .set({
        hasGeneratedResume: true,
        resumeUrl: resumeUrl,
        resumeGeneratedAt: new Date()
      })
      .where(eq(users.id, userId));
    
    return resumeUrl;
  } catch (error) {
    console.error('[generateResume] Error:', error);
    throw error;
  }
}