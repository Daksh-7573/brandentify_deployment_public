/**
 * Portfolio PDF Generator Service
 * 
 * This service generates PDFs from portfolio pages
 * by capturing the full design using Puppeteer.
 */

import { storage } from '../storage';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import puppeteer, { Browser } from 'puppeteer';
import fs from 'fs';
import path from 'path';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads', 'portfolios');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

interface PortfolioPdfOptions {
  userId: number;
  baseUrl: string;
}

interface PortfolioPdfResult {
  pdfPath: string;
  fileName: string;
}

/**
 * Generate a PDF of a user's portfolio
 * @param options Options including userId and baseUrl
 * @returns Path to the generated PDF file
 */
export async function generatePortfolioPdf(options: PortfolioPdfOptions): Promise<PortfolioPdfResult> {
  const { userId, baseUrl } = options;
  let browser: Browser | null = null;
  
  try {
    const [userData] = await db.select().from(users).where(eq(users.id, userId));
    if (!userData) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const userName = userData.name || 'user';
    const sanitizedName = userName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const fileName = `${sanitizedName}-portfolio.pdf`;
    const timestamp = Date.now();
    const pdfFilePath = path.join(UPLOADS_DIR, `portfolio_${userId}_${timestamp}.pdf`);
    
    const portfolioUrl = `${baseUrl}/portfolio/${userId}?print=true`;
    
    console.log(`[Portfolio PDF] Generating PDF for user ${userId} from ${portfolioUrl}`);
    
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process'
      ]
    });
    
    const page = await browser.newPage();
    
    await page.setViewport({
      width: 1200,
      height: 800,
      deviceScaleFactor: 2
    });
    
    const response = await page.goto(portfolioUrl, {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    
    if (!response) {
      throw new Error('Failed to navigate to portfolio page - no response received');
    }
    
    if (!response.ok()) {
      throw new Error(`Failed to load portfolio page - HTTP ${response.status()}: ${response.statusText()}`);
    }
    
    const pageUrl = page.url();
    if (pageUrl.includes('/login') || pageUrl.includes('/auth') || pageUrl.includes('/404')) {
      throw new Error(`Portfolio page redirected to ${pageUrl} - user may not have a public portfolio`);
    }
    
    try {
      await page.waitForSelector('.corporate-executive-template, .minimalist-pro-template, .dynamic-innovator-template, .scholar-template, .holographic-neo-template, [class*="-template"]', {
        timeout: 15000
      });
    } catch (selectorError) {
      console.log('[Portfolio PDF] Template selector not found, checking for portfolio content...');
      
      const hasPortfolioContent = await page.evaluate(() => {
        return document.body.innerText.length > 500;
      });
      
      if (!hasPortfolioContent) {
        throw new Error('Portfolio page does not contain expected content');
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await page.evaluate(() => {
      const nav = document.querySelector('.sticky');
      if (nav) (nav as HTMLElement).style.display = 'none';
      
      const downloadBtns = document.querySelectorAll('[data-testid*="download"]');
      downloadBtns.forEach(btn => (btn as HTMLElement).style.display = 'none');
      
      const body = document.body;
      body.style.overflow = 'visible';
      body.style.height = 'auto';
      
      const animations = document.querySelectorAll('[class*="fade-in"], [class*="animate"]');
      animations.forEach(el => {
        (el as HTMLElement).style.opacity = '1';
        (el as HTMLElement).style.transform = 'none';
        (el as HTMLElement).style.animation = 'none';
      });
    });
    
    await page.pdf({
      path: pdfFilePath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0.4in',
        right: '0.4in',
        bottom: '0.4in',
        left: '0.4in'
      },
      preferCSSPageSize: false
    });
    
    if (!fs.existsSync(pdfFilePath)) {
      throw new Error('PDF file was not created');
    }
    
    const stats = fs.statSync(pdfFilePath);
    if (stats.size < 1000) {
      fs.unlinkSync(pdfFilePath);
      throw new Error('Generated PDF is too small - likely empty or corrupted');
    }
    
    console.log(`[Portfolio PDF] Successfully generated PDF at ${pdfFilePath} (${stats.size} bytes)`);
    
    return {
      pdfPath: pdfFilePath,
      fileName
    };
  } catch (error) {
    console.error('[Portfolio PDF] Error generating PDF:', error);
    throw error;
  } finally {
    if (browser) {
      try {
        await browser.close();
        console.log('[Portfolio PDF] Browser closed successfully');
      } catch (closeError) {
        console.error('[Portfolio PDF] Error closing browser:', closeError);
      }
    }
  }
}

export async function cleanupOldPortfolioPdfs(maxAgeHours: number = 24): Promise<void> {
  try {
    const files = fs.readdirSync(UPLOADS_DIR);
    const now = Date.now();
    const maxAge = maxAgeHours * 60 * 60 * 1000;
    
    for (const file of files) {
      if (file.startsWith('portfolio_') && file.endsWith('.pdf')) {
        const filePath = path.join(UPLOADS_DIR, file);
        const stats = fs.statSync(filePath);
        if (now - stats.mtimeMs > maxAge) {
          fs.unlinkSync(filePath);
          console.log(`[Portfolio PDF] Cleaned up old file: ${file}`);
        }
      }
    }
  } catch (error) {
    console.error('[Portfolio PDF] Error cleaning up old PDFs:', error);
  }
}
