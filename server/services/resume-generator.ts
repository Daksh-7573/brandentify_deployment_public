/**
 * Resume Generator Service
 * 
 * This service creates professional PDFs from user profile data
 * using HTML templates and Puppeteer.
 */

import { storage } from '../storage';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

// Make sure the uploads directory exists
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads', 'resumes');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

/**
 * Check if a user is eligible to generate a resume
 * @param userId ID of the user to check
 * @returns Boolean indicating eligibility
 */
export async function canGenerateResume(userId: number): Promise<boolean> {
  try {
    // Get required data to check eligibility
    const [userData] = await db.select().from(users).where(eq(users.id, userId));
    if (!userData) {
      return false;
    }
    
    // Fetch skills and experiences
    const skills = await storage.getSkillsByUserId(userId);
    const experiences = await storage.getWorkExperiencesByUserId(userId);
    
    // User must have at least one skill and one work experience
    return skills.length > 0 && experiences.length > 0;
  } catch (error) {
    console.error('[canGenerateResume] Error:', error);
    return false;
  }
}

/**
 * Generate a PDF resume for a user
 * @param userId ID of the user
 * @returns URL of the generated resume
 */
export async function generateResume(userId: number): Promise<string> {
  try {
    // Get user data
    const [userData] = await db.select().from(users).where(eq(users.id, userId));
    if (!userData) {
      throw new Error('User not found');
    }
    
    // Fetch all user profile data
    const skills = await storage.getSkillsByUserId(userId);
    const experiences = await storage.getWorkExperiencesByUserId(userId);
    const education = await storage.getEducationsByUserId(userId);
    const services = await storage.getServicesByUserId(userId); 
    const projects = await storage.getProjectsByUserId(userId);
    
    // Sort experiences and education by date (newest first)
    const sortedExperiences = [...experiences].sort((a, b) => {
      const dateA = new Date(a.startDate).getTime();
      const dateB = new Date(b.startDate).getTime();
      return dateB - dateA;
    });
    
    const sortedEducation = [...education].sort((a, b) => {
      const dateA = new Date(a.startDate).getTime();
      const dateB = new Date(b.startDate).getTime();
      return dateB - dateA;
    });
    
    // Generate HTML content for the resume
    const htmlContent = generateResumeHtml({
      user: userData,
      skills,
      experiences: sortedExperiences,
      education: sortedEducation,
      services,
      projects: projects.slice(0, 2) // Only include first 2 projects
    });
    
    // Generate a unique filename
    const timestamp = Date.now();
    const fileNameWithoutExt = `resume_${userId}_${timestamp}`;
    const htmlPath = path.join(UPLOADS_DIR, `${fileNameWithoutExt}.html`);
    const pdfPath = path.join(UPLOADS_DIR, `${fileNameWithoutExt}.pdf`);
    
    // Save HTML version for debugging
    fs.writeFileSync(htmlPath, htmlContent);
    
    // Generate PDF with puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    // Set the page size to Letter (8.5 x 11 inches)
    await page.pdf({
      path: pdfPath,
      format: 'Letter',
      printBackground: true,
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      }
    });
    
    await browser.close();
    
    // Create relative URL for the resume
    const resumeUrl = `/uploads/resumes/${fileNameWithoutExt}.pdf`;
    
    // Update user's resume status in the database
    await db.update(users)
      .set({
        hasGeneratedResume: true,
        resumeUrl,
        resumeGeneratedAt: new Date()
      })
      .where(eq(users.id, userId));
    
    return resumeUrl;
  } catch (error) {
    console.error('[generateResume] Error:', error);
    throw error;
  }
}

interface ResumeData {
  user: any;
  skills: any[];
  experiences: any[];
  education: any[];
  services: any[];
  projects: any[];
}

/**
 * Generate HTML content for the resume
 * @param data User profile data
 * @returns HTML string
 */
function generateResumeHtml(data: ResumeData): string {
  const { user, skills, experiences, education, services, projects } = data;
  
  // Format date utility
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Present';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Resume - ${user.name}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        body {
          font-family: 'Inter', sans-serif;
          margin: 0;
          padding: 0;
          color: #333;
          line-height: 1.6;
        }
        
        .resume-container {
          max-width: 100%;
          margin: 0 auto;
          padding: 20px;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #eaeaea;
          padding-bottom: 20px;
        }
        
        .header h1 {
          font-size: 28px;
          margin: 0 0 5px 0;
          color: #1a1a1a;
        }
        
        .header h2 {
          font-size: 18px;
          font-weight: 500;
          margin: 0 0 10px 0;
          color: #666;
        }
        
        .contact-info {
          font-size: 14px;
          color: #666;
        }
        
        .section {
          margin-bottom: 25px;
        }
        
        .section-title {
          font-size: 20px;
          font-weight: 600;
          margin: 0 0 15px 0;
          color: #4169E1;
          border-bottom: 1px solid #eaeaea;
          padding-bottom: 5px;
        }
        
        .entry {
          margin-bottom: 20px;
        }
        
        .entry-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
        }
        
        .entry-title {
          font-size: 16px;
          font-weight: 600;
          color: #444;
          margin: 0;
        }
        
        .entry-date {
          font-size: 14px;
          color: #666;
        }
        
        .entry-subtitle {
          font-size: 15px;
          color: #666;
          margin: 0 0 5px 0;
        }
        
        .entry-location {
          font-size: 14px;
          color: #888;
          margin: 0 0 5px 0;
          font-style: italic;
        }
        
        .entry-description {
          font-size: 14px;
          color: #555;
        }
        
        .skills-container {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        
        .skill-item {
          font-size: 14px;
          background-color: #f5f5f5;
          padding: 5px 12px;
          border-radius: 15px;
          color: #555;
        }
        
        .projects-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }
        
        .project-item {
          border: 1px solid #eaeaea;
          padding: 12px;
          border-radius: 5px;
        }
        
        .project-title {
          font-size: 15px;
          font-weight: 600;
          color: #444;
          margin: 0 0 5px 0;
        }
        
        .project-description {
          font-size: 13px;
          color: #666;
          margin: 0;
        }
      </style>
    </head>
    <body>
      <div class="resume-container">
        <!-- Header -->
        <div class="header">
          <h1>${user.name}</h1>
          <h2>${user.title || 'Professional'}</h2>
          <div class="contact-info">
            ${user.email ? `<div>${user.email}</div>` : ''}
            ${user.phoneNumber ? `<div>${user.phoneNumber}</div>` : ''}
            ${user.location ? `<div>${user.location}</div>` : ''}
          </div>
        </div>
        
        <!-- Profile Section -->
        ${user.aboutMe ? `
        <div class="section">
          <h3 class="section-title">Professional Summary</h3>
          <p class="entry-description">${user.aboutMe}</p>
        </div>
        ` : ''}
        
        <!-- Skills Section -->
        ${skills.length > 0 ? `
        <div class="section">
          <h3 class="section-title">Skills</h3>
          <div class="skills-container">
            ${skills.map(skill => `
              <div class="skill-item">${skill.name} ${skill.level ? `- ${skill.level}` : ''}</div>
            `).join('')}
          </div>
        </div>
        ` : ''}
        
        <!-- Experience Section -->
        ${experiences.length > 0 ? `
        <div class="section">
          <h3 class="section-title">Work Experience</h3>
          ${experiences.map(exp => `
            <div class="entry">
              <div class="entry-header">
                <h4 class="entry-title">${exp.title}</h4>
                <div class="entry-date">${formatDate(exp.startDate)} - ${formatDate(exp.endDate)}</div>
              </div>
              <div class="entry-subtitle">${exp.company}</div>
              <div class="entry-location">${exp.location || ''}</div>
              ${exp.description ? `<p class="entry-description">${exp.description}</p>` : ''}
            </div>
          `).join('')}
        </div>
        ` : ''}
        
        <!-- Education Section -->
        ${education.length > 0 ? `
        <div class="section">
          <h3 class="section-title">Education</h3>
          ${education.map(edu => `
            <div class="entry">
              <div class="entry-header">
                <h4 class="entry-title">${edu.degree}</h4>
                <div class="entry-date">${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}</div>
              </div>
              <div class="entry-subtitle">${edu.institution}</div>
              <div class="entry-location">${edu.location || ''}</div>
              ${edu.fieldOfStudy ? `<p class="entry-description">Field of Study: ${edu.fieldOfStudy}</p>` : ''}
            </div>
          `).join('')}
        </div>
        ` : ''}
        
        <!-- Services Section -->
        ${services.length > 0 ? `
        <div class="section">
          <h3 class="section-title">Services Offered</h3>
          <ul>
            ${services.map(service => `
              <li>
                <strong>${service.title}</strong>
                ${service.description ? ` - ${service.description}` : ''}
              </li>
            `).join('')}
          </ul>
        </div>
        ` : ''}
        
        <!-- Projects Section -->
        ${projects.length > 0 ? `
        <div class="section">
          <h3 class="section-title">Selected Projects</h3>
          <div class="projects-container">
            ${projects.map(project => `
              <div class="project-item">
                <h4 class="project-title">${project.title}</h4>
                <p class="project-description">${project.description || ''}</p>
                ${project.projectUrl ? `<p><small><a href="${project.projectUrl}">${project.projectUrl}</a></small></p>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}
      </div>
    </body>
    </html>
  `;
}