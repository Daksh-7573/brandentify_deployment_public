#!/usr/bin/env node

/**
 * Automated Dependency Security Scanner
 * 
 * This script:
 * 1. Runs npm audit to identify vulnerabilities
 * 2. Generates a security report
 * 3. Can optionally auto-fix non-breaking vulnerabilities
 * 
 * Usage:
 *   node dependency-check.js [--fix] [--report-only]
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const REPORT_PATH = path.join(__dirname, '../../security-reports');
const AUTO_FIX = process.argv.includes('--fix');
const REPORT_ONLY = process.argv.includes('--report-only');
const SEVERITY_LEVELS = ['info', 'low', 'moderate', 'high', 'critical'];

// Create report directory if it doesn't exist
if (!fs.existsSync(REPORT_PATH)) {
  fs.mkdirSync(REPORT_PATH, { recursive: true });
}

/**
 * Run npm audit and return the results as JSON
 */
function runNpmAudit() {
  try {
    const auditOutput = execSync('npm audit --json', { encoding: 'utf8' });
    return JSON.parse(auditOutput);
  } catch (error) {
    // npm audit exits with non-zero code if vulnerabilities found
    if (error.stdout) {
      return JSON.parse(error.stdout);
    }
    console.error('Failed to run npm audit:', error.message);
    process.exit(1);
  }
}

/**
 * Generate a human-readable security report
 */
function generateReport(auditResults) {
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const reportFile = path.join(REPORT_PATH, `security-report-${timestamp}.txt`);
  
  const vulnerabilitiesBySeverity = {};
  
  // Initialize counts for each severity level
  SEVERITY_LEVELS.forEach(level => {
    vulnerabilitiesBySeverity[level] = {
      count: 0,
      items: []
    };
  });
  
  // Sort vulnerabilities by severity
  for (const [id, vuln] of Object.entries(auditResults.vulnerabilities || {})) {
    const severity = vuln.severity || 'unknown';
    
    if (vulnerabilitiesBySeverity[severity]) {
      vulnerabilitiesBySeverity[severity].count++;
      vulnerabilitiesBySeverity[severity].items.push({
        name: vuln.name,
        version: vuln.version,
        path: vuln.path,
        fixAvailable: vuln.fixAvailable,
        recommendation: vuln.recommendation || 'No specific recommendation provided'
      });
    }
  }
  
  // Generate report content
  let reportContent = `SECURITY VULNERABILITY SCAN REPORT\n`;
  reportContent += `Generated: ${new Date().toLocaleString()}\n\n`;
  reportContent += `SUMMARY:\n`;
  
  // Add summary counts
  SEVERITY_LEVELS.forEach(level => {
    reportContent += `${level.toUpperCase()}: ${vulnerabilitiesBySeverity[level].count}\n`;
  });
  
  // Add detailed vulnerability information
  reportContent += `\nDETAILS:\n`;
  
  // Start with highest severity
  [...SEVERITY_LEVELS].reverse().forEach(level => {
    const { count, items } = vulnerabilitiesBySeverity[level];
    
    if (count > 0) {
      reportContent += `\n[${level.toUpperCase()}] - ${count} vulnerabilities\n`;
      
      items.forEach((vuln, index) => {
        reportContent += `${index + 1}. ${vuln.name}@${vuln.version}\n`;
        reportContent += `   Path: ${vuln.path}\n`;
        reportContent += `   Fix available: ${vuln.fixAvailable ? 'Yes' : 'No'}\n`;
        reportContent += `   Recommendation: ${vuln.recommendation}\n\n`;
      });
    }
  });
  
  // Write report to file
  fs.writeFileSync(reportFile, reportContent);
  console.log(`Security report generated: ${reportFile}`);
  
  return reportFile;
}

/**
 * Attempt to fix vulnerabilities automatically
 */
function fixVulnerabilities() {
  try {
    console.log('Attempting to fix vulnerabilities...');
    const fixOutput = execSync('npm audit fix --force', { encoding: 'utf8' });
    console.log(fixOutput);
    
    // Run audit again to see if all issues are fixed
    console.log('Verifying fixes...');
    return runNpmAudit();
  } catch (error) {
    console.error('Error while fixing vulnerabilities:', error.message);
    return null;
  }
}

// Main execution
(async () => {
  console.log('Running security dependency check...');
  
  // Run initial audit
  const auditResults = runNpmAudit();
  
  if (REPORT_ONLY) {
    generateReport(auditResults);
    return;
  }
  
  // Check if there are vulnerabilities
  const totalVulnerabilities = auditResults.metadata?.vulnerabilities?.total || 0;
  
  if (totalVulnerabilities === 0) {
    console.log('✓ No vulnerabilities found!');
    return;
  }
  
  console.log(`Found ${totalVulnerabilities} vulnerabilities.`);
  
  // Generate initial report
  const initialReport = generateReport(auditResults);
  console.log(`Initial vulnerability report: ${initialReport}`);
  
  // Auto fix if requested
  if (AUTO_FIX) {
    console.log('Attempting to automatically fix vulnerabilities...');
    const fixedResults = fixVulnerabilities();
    
    if (fixedResults) {
      const remainingVulnerabilities = fixedResults.metadata?.vulnerabilities?.total || 0;
      console.log(`After fixing: ${remainingVulnerabilities} vulnerabilities remain.`);
      
      if (remainingVulnerabilities > 0) {
        // Generate updated report after fixes
        const updatedReport = generateReport(fixedResults);
        console.log(`Updated vulnerability report after fixes: ${updatedReport}`);
      } else {
        console.log('✓ All vulnerabilities have been fixed!');
      }
    }
  } else {
    console.log('Use --fix flag to attempt automatic vulnerability remediation.');
  }
})();