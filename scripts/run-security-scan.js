/**
 * Scheduled Security Scan Script
 * 
 * This script runs automated security scans for the application, including:
 * - Dependency vulnerability scanning
 * - Configuration security checks
 * - Code security scanning
 * 
 * Recommended to run this on a schedule (e.g., weekly) and after major changes.
 */

const { Pool } = require('pg');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const { v4: uuidv4 } = require('uuid');

// Database connection
if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable not set');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Helper functions
const execPromise = util.promisify(exec);

// Application configuration
const REPO_ROOT = process.cwd();
const PACKAGE_JSON_PATH = path.join(REPO_ROOT, 'package.json');
const SERVER_DIR = path.join(REPO_ROOT, 'server');
const CLIENT_DIR = path.join(REPO_ROOT, 'client');
const SCAN_TYPES = ['dependencies', 'config', 'code', 'all'];

/**
 * Execute database query
 */
async function executeQuery(queryText, params = []) {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(queryText, params);
      return result;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
}

/**
 * Create a new vulnerability scan record
 */
async function createVulnerabilityScan(scanData) {
  try {
    const result = await executeQuery(`
      INSERT INTO vulnerability_scan_results (
        scan_id, scan_type, scanner_name, scan_date, status, scan_config, initiated_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      scanData.scanId,
      scanData.scanType,
      scanData.scannerName,
      new Date(),
      scanData.status,
      JSON.stringify(scanData.scanConfig || {}),
      scanData.initiatedBy
    ]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error creating vulnerability scan:', error);
    throw error;
  }
}

/**
 * Add a vulnerability to the database
 */
async function addVulnerability(vulnerabilityData) {
  try {
    const result = await executeQuery(`
      INSERT INTO vulnerabilities (
        scan_id, title, description, severity, affected_component, 
        cve_id, status, technical_details, mitigation_steps
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      vulnerabilityData.scanId,
      vulnerabilityData.title,
      vulnerabilityData.description,
      vulnerabilityData.severity,
      vulnerabilityData.affectedComponent,
      vulnerabilityData.cveId || null,
      vulnerabilityData.status || 'open',
      JSON.stringify(vulnerabilityData.technicalDetails || {}),
      vulnerabilityData.mitigationSteps || null
    ]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error adding vulnerability:', error);
    throw error;
  }
}

/**
 * Update a vulnerability scan with results
 */
async function updateVulnerabilityScan(scanId, updateData) {
  try {
    const result = await executeQuery(`
      UPDATE vulnerability_scan_results
      SET 
        status = $1,
        completed_date = $2,
        vulnerability_count = $3,
        critical_count = $4,
        high_count = $5,
        medium_count = $6,
        low_count = $7,
        scan_results = $8
      WHERE scan_id = $9
      RETURNING *
    `, [
      updateData.status,
      updateData.completedDate,
      updateData.vulnerabilityCount || 0,
      updateData.criticalCount || 0,
      updateData.highCount || 0,
      updateData.mediumCount || 0,
      updateData.lowCount || 0,
      JSON.stringify(updateData.scanResults || {}),
      scanId
    ]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error updating vulnerability scan:', error);
    throw error;
  }
}

/**
 * Calculate vulnerability counts by severity
 */
function calculateVulnerabilityCounts(vulnerabilities) {
  return vulnerabilities.reduce((counts, vuln) => {
    counts.total += 1;
    
    switch (vuln.severity) {
      case 'critical':
        counts.critical += 1;
        break;
      case 'high':
        counts.high += 1;
        break;
      case 'medium':
        counts.medium += 1;
        break;
      case 'low':
      case 'info':
        counts.low += 1;
        break;
    }
    
    return counts;
  }, { total: 0, critical: 0, high: 0, medium: 0, low: 0 });
}

/**
 * Process scan results and add vulnerabilities to database
 */
async function processScanResults(scanId, scanResults) {
  try {
    const { summary } = scanResults;
    
    if (summary && summary.vulnerabilities && Array.isArray(summary.vulnerabilities)) {
      // Add each vulnerability to the database
      for (const vuln of summary.vulnerabilities) {
        await addVulnerability({
          scanId,
          title: vuln.title,
          description: vuln.description,
          severity: vuln.severity,
          affectedComponent: vuln.component || 'unknown',
          cveId: vuln.cveId,
          status: 'open',
          technicalDetails: vuln.details || {},
          mitigationSteps: vuln.recommendation || '',
        });
      }
    }
  } catch (error) {
    console.error('Error processing scan results:', error);
    throw error;
  }
}

/**
 * Scan project dependencies for known vulnerabilities
 */
async function scanDependencies() {
  try {
    console.log('Scanning dependencies for vulnerabilities...');
    
    // Check if package.json exists
    if (!fs.existsSync(PACKAGE_JSON_PATH)) {
      return {
        status: 'error',
        message: 'package.json not found',
        vulnerabilities: []
      };
    }
    
    // Read package.json
    const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'));
    
    // Get dependencies
    const dependencies = {
      ...packageJson.dependencies || {},
      ...packageJson.devDependencies || {}
    };
    
    // Helper function to check if a dependency version is using a vulnerable pattern
    const isVulnerablePattern = (version) => {
      // Check for wildcards or very broad version ranges
      return version.includes('*') || 
             version === 'latest' || 
             version.startsWith('>') || 
             version.startsWith('>=') ||
             version.startsWith('^0.');
    };
    
    // Check for common dependency vulnerabilities
    const vulnerabilities = [];
    
    // Check for potentially vulnerable dependencies
    const knownVulnerableDeps = {
      'node-fetch': { versions: ['<2.6.7', '<3.1.1'], cve: 'CVE-2022-0235' },
      'express-fileupload': { versions: ['<1.2.0'], cve: 'CVE-2020-7699' },
      'jsonwebtoken': { versions: ['<9.0.0'], cve: 'CVE-2022-23539' },
      'sequelize': { versions: ['<6.29.0'], cve: 'CVE-2023-22458' },
      'axios': { versions: ['<0.21.1', '<1.6.0'], cve: 'CVE-2023-45857' },
      'ws': { versions: ['<7.4.6'], cve: 'CVE-2021-32640' },
      'moment': { versions: ['<2.29.2'], cve: 'CVE-2022-24785' },
      'express': { versions: ['<4.17.3'], cve: 'CVE-2022-24999' },
    };
    
    // Function to check if a version is vulnerable based on known patterns
    const isVersionVulnerable = (depName, version) => {
      const vulnInfo = knownVulnerableDeps[depName];
      if (!vulnInfo) return false;
      
      // Extract the main version number without ^ or ~
      const actualVersion = version.replace(/[\^~]/, '');
      
      // Simple version check (would be more robust with semver library in production)
      return vulnInfo.versions.some(vulnVersion => {
        if (vulnVersion.startsWith('<')) {
          const compareVersion = vulnVersion.substring(1);
          return actualVersion < compareVersion;
        }
        return actualVersion === vulnVersion;
      });
    };
    
    // Scan dependencies
    for (const [depName, version] of Object.entries(dependencies)) {
      // Check for wildcard or broad version ranges
      if (isVulnerablePattern(version)) {
        vulnerabilities.push({
          title: `Insecure dependency pattern for ${depName}`,
          description: `Dependency ${depName} uses a potentially insecure version pattern: ${version}`,
          severity: 'medium',
          component: `dependency:${depName}`,
          details: {
            dependency: depName,
            version: version,
            pattern: 'wildcard or broad range'
          },
          recommendation: `Update to use a fixed version for ${depName}`
        });
      }
      
      // Check against known vulnerable versions
      if (isVersionVulnerable(depName, version)) {
        const vulnInfo = knownVulnerableDeps[depName];
        vulnerabilities.push({
          title: `Vulnerable version of ${depName}`,
          description: `Dependency ${depName} at version ${version} has known vulnerabilities`,
          severity: 'high',
          component: `dependency:${depName}`,
          cveId: vulnInfo.cve,
          details: {
            dependency: depName,
            version: version,
            vulnerableVersions: vulnInfo.versions,
            cve: vulnInfo.cve
          },
          recommendation: `Update ${depName} to the latest secure version`
        });
      }
    }
    
    // Check for deprecated-but-included packages
    const deprecatedPackages = [
      'request',
      'moment',
      'left-pad',
      'coffee-script'
    ];
    
    for (const pkg of deprecatedPackages) {
      if (dependencies[pkg]) {
        vulnerabilities.push({
          title: `Deprecated package in use: ${pkg}`,
          description: `Dependency ${pkg} is deprecated and may contain unpatched security issues`,
          severity: 'medium',
          component: `dependency:${pkg}`,
          details: {
            dependency: pkg,
            version: dependencies[pkg],
            status: 'deprecated'
          },
          recommendation: `Replace ${pkg} with a maintained alternative`
        });
      }
    }
    
    // Summary of findings
    return {
      status: 'completed',
      scannedDependencies: Object.keys(dependencies).length,
      vulnerabilities,
      summary: {
        vulnerabilities,
        dependencyCount: Object.keys(dependencies).length,
        vulnerabilityCount: vulnerabilities.length,
      }
    };
  } catch (error) {
    console.error('Error scanning dependencies:', error);
    return {
      status: 'error',
      message: `Error scanning dependencies: ${error.message}`,
      vulnerabilities: []
    };
  }
}

/**
 * Scan project configurations for security issues
 */
async function scanConfigurations() {
  try {
    console.log('Scanning project configurations for security issues...');
    
    const vulnerabilities = [];
    
    // Check for environment configuration issues
    const envFiles = [
      '.env',
      '.env.local',
      '.env.development',
      '.env.production'
    ];
    
    // Patterns to look for in env files and configs
    const sensitivePatterns = [
      /key/i,
      /secret/i,
      /password/i,
      /passwd/i,
      /token/i,
      /auth/i,
      /credential/i,
      /apikey/i,
      /api_key/i
    ];
    
    // Check for env files with test values or credentials
    for (const envFile of envFiles) {
      const envPath = path.join(REPO_ROOT, envFile);
      
      if (fs.existsSync(envPath)) {
        // Check if file is gitignored
        const isGitIgnored = await checkIfFileIsGitIgnored(envPath);
        
        if (!isGitIgnored) {
          vulnerabilities.push({
            title: `Environment file not gitignored: ${envFile}`,
            description: `The environment file ${envFile} is not ignored by git and could expose sensitive information`,
            severity: 'high',
            component: 'config:env',
            details: {
              file: envFile,
              gitignored: false
            },
            recommendation: `Add ${envFile} to .gitignore file to prevent committing sensitive information`
          });
        }
        
        // Check content for hardcoded secrets
        const content = fs.readFileSync(envPath, 'utf8');
        const lines = content.split('\n');
        
        for (const line of lines) {
          if (line.trim() && !line.startsWith('#')) {
            const [key, value] = line.split('=');
            
            if (key && value && sensitivePatterns.some(pattern => pattern.test(key))) {
              // Check if the value is hard-coded
              if (
                value.length > 10 && 
                !value.includes('$') && 
                !value.includes('process.env') &&
                !value.includes('{{') && 
                !value.includes('__')
              ) {
                vulnerabilities.push({
                  title: `Potential hardcoded secret in ${envFile}`,
                  description: `The environment file ${envFile} contains what appears to be a hardcoded secret for ${key}`,
                  severity: 'critical',
                  component: 'config:env',
                  details: {
                    file: envFile,
                    key: key,
                    // Don't include the actual value for security reasons
                    valueLength: value.length
                  },
                  recommendation: `Remove hardcoded secrets from ${envFile}. Use environment variables or a secure secret management solution.`
                });
              }
            }
          }
        }
      }
    }
    
    // Check CORS configuration
    const corsConfigFiles = [
      path.join(SERVER_DIR, 'config', 'security-config.ts'),
      path.join(SERVER_DIR, 'index.ts'),
      path.join(SERVER_DIR, 'app.js'),
      path.join(SERVER_DIR, 'app.ts')
    ];
    
    let corsConfigFound = false;
    
    for (const configFile of corsConfigFiles) {
      if (fs.existsSync(configFile)) {
        const content = fs.readFileSync(configFile, 'utf8');
        
        // Check for wildcards in CORS
        if ((content.includes('cors(') || content.includes('CORS')) && content.includes('*')) {
          vulnerabilities.push({
            title: 'Overly permissive CORS configuration',
            description: 'CORS is configured with a wildcard (*) origin, which is a security risk',
            severity: 'high',
            component: 'config:cors',
            details: {
              file: path.relative(REPO_ROOT, configFile),
              pattern: 'wildcard (*) in CORS configuration'
            },
            recommendation: 'Configure CORS with specific allowed origins instead of using a wildcard'
          });
        }
        
        if (content.includes('cors(') || content.includes('CORS')) {
          corsConfigFound = true;
        }
      }
    }
    
    if (!corsConfigFound) {
      vulnerabilities.push({
        title: 'Missing CORS configuration',
        description: 'No CORS configuration was found, which could lead to CORS vulnerabilities',
        severity: 'medium',
        component: 'config:cors',
        details: {
          issue: 'No CORS configuration detected'
        },
        recommendation: 'Implement proper CORS headers to restrict cross-origin requests'
      });
    }
    
    // Summary of findings
    return {
      status: 'completed',
      vulnerabilities,
      summary: {
        vulnerabilities,
        configurationCount: envFiles.length,
        vulnerabilityCount: vulnerabilities.length,
      }
    };
  } catch (error) {
    console.error('Error scanning configurations:', error);
    return {
      status: 'error',
      message: `Error scanning configurations: ${error.message}`,
      vulnerabilities: []
    };
  }
}

/**
 * Check if a file is gitignored
 */
async function checkIfFileIsGitIgnored(filePath) {
  try {
    const relativePath = path.relative(REPO_ROOT, filePath);
    const { stdout } = await execPromise(`git check-ignore -q "${relativePath}" || echo "not-ignored"`, {
      cwd: REPO_ROOT
    });
    
    return !stdout.includes('not-ignored');
  } catch (error) {
    console.error('Error checking if file is gitignored:', error);
    return false;
  }
}

/**
 * Scan code for common security issues
 */
async function scanCode() {
  try {
    console.log('Scanning code for security issues...');
    
    const vulnerabilities = [];
    
    // Directories to scan
    const scanDirs = [
      { path: SERVER_DIR, type: 'server' },
      { path: CLIENT_DIR, type: 'client' }
    ];
    
    // Patterns to look for in code files
    const vulnerabilityPatterns = [
      {
        name: 'SQL Injection',
        pattern: /execute\s*\(\s*['"`].*?\$\{/i,
        severity: 'critical',
        component: 'code:sql',
        description: 'Potential SQL injection vulnerability found',
        recommendation: 'Use parameterized queries or an ORM instead of string concatenation'
      },
      {
        name: 'Cross-Site Scripting (XSS)',
        pattern: /dangerouslySetInnerHTML|innerHTML\s*=|document\.write\(/i,
        severity: 'high',
        component: 'code:xss',
        description: 'Potential XSS vulnerability found',
        recommendation: 'Use safe DOM manipulation methods or frameworks that automatically escape content'
      },
      {
        name: 'Path Traversal',
        pattern: /fs\.(read|write)file(sync)?\s*\(\s*(?!path\.normalize).*\.\.\//i,
        severity: 'high',
        component: 'code:path-traversal',
        description: 'Potential path traversal vulnerability found',
        recommendation: 'Normalize and validate file paths before accessing the file system'
      },
      {
        name: 'Hardcoded Secrets',
        pattern: /(const|let|var)\s+(secret|api_?key|token|password|credentials?)\s*=\s*['"`].{8,}['"`]/i,
        severity: 'critical',
        component: 'code:secrets',
        description: 'Potential hardcoded secret found',
        recommendation: 'Never hardcode secrets in your code. Use environment variables or a secure secret management solution.'
      },
      {
        name: 'Insecure Crypto',
        pattern: /crypto\.createHash\s*\(\s*['"`]md5['"`]\)/i,
        severity: 'high',
        component: 'code:crypto',
        description: 'Usage of insecure cryptographic algorithm (MD5)',
        recommendation: 'Use a secure hashing algorithm like SHA-256 or SHA-3'
      }
    ];
    
    // Function to scan a file for vulnerability patterns
    const scanFile = (filePath, fileType) => {
      const fileVulnerabilities = [];
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const fileRelativePath = path.relative(REPO_ROOT, filePath);
      
      for (const vulnPattern of vulnerabilityPatterns) {
        // Skip if this pattern should only be checked in specific files
        if (vulnPattern.fileNamePattern && !vulnPattern.fileNamePattern.test(filePath)) {
          continue;
        }
        
        // Check for the pattern
        const matches = fileContent.match(vulnPattern.pattern);
        
        if (matches) {
          // Find the line numbers for the matches
          const lines = fileContent.split('\n');
          const matchLineNumbers = [];
          
          for (const match of matches) {
            for (let i = 0; i < lines.length; i++) {
              if (lines[i].includes(match)) {
                matchLineNumbers.push(i + 1);
                break;
              }
            }
          }
          
          fileVulnerabilities.push({
            title: `${vulnPattern.name} in ${fileRelativePath}`,
            description: vulnPattern.description,
            severity: vulnPattern.severity,
            component: vulnPattern.component,
            details: {
              file: fileRelativePath,
              lines: matchLineNumbers,
              matches: matches.map(m => m.substring(0, 100))
            },
            recommendation: vulnPattern.recommendation
          });
        }
      }
      
      return fileVulnerabilities;
    };
    
    // Function to recursively get all files in a directory
    const getAllFiles = (dirPath, extensions, fileList = []) => {
      const files = fs.readdirSync(dirPath);
      
      files.forEach(file => {
        const filePath = path.join(dirPath, file);
        
        if (fs.statSync(filePath).isDirectory()) {
          // Skip node_modules and .git
          if (file !== 'node_modules' && file !== '.git') {
            getAllFiles(filePath, extensions, fileList);
          }
        } else {
          const ext = path.extname(file).toLowerCase();
          
          if (extensions.includes(ext)) {
            fileList.push(filePath);
          }
        }
      });
      
      return fileList;
    };
    
    // Scan each directory
    for (const dir of scanDirs) {
      if (fs.existsSync(dir.path)) {
        console.log(`Scanning ${dir.type} files in ${dir.path}...`);
        
        // Get all JavaScript and TypeScript files
        const files = getAllFiles(dir.path, ['.js', '.ts', '.jsx', '.tsx'], []);
        
        for (const file of files) {
          const fileVulnerabilities = scanFile(file, dir.type);
          vulnerabilities.push(...fileVulnerabilities);
        }
      }
    }
    
    // Remove duplicate vulnerabilities
    const uniqueVulnerabilities = vulnerabilities.filter((vuln, index, self) => 
      index === self.findIndex(v => v.title === vuln.title)
    );
    
    // Summary of findings
    return {
      status: 'completed',
      scannedDirectories: scanDirs.length,
      vulnerabilities: uniqueVulnerabilities,
      summary: {
        vulnerabilities: uniqueVulnerabilities,
        directoryCount: scanDirs.length,
        vulnerabilityCount: uniqueVulnerabilities.length,
      }
    };
  } catch (error) {
    console.error('Error scanning code:', error);
    return {
      status: 'error',
      message: `Error scanning code: ${error.message}`,
      vulnerabilities: []
    };
  }
}

/**
 * Run a specific type of security scan
 */
async function runSecurityScan(scanType, initiatedBy) {
  try {
    console.log(`Starting ${scanType} security scan...`);
    
    // Generate a unique scan ID
    const scanId = `scan-${uuidv4()}`;
    
    // Create scan record in database
    const scan = await createVulnerabilityScan({
      scanId,
      scanType,
      scannerName: 'BrandentifierSecurityScanner',
      status: 'in-progress',
      initiatedBy,
      scanConfig: {}
    });
    
    console.log(`Created scan record with ID: ${scanId}`);
    
    // Run the appropriate scan based on type
    let scanResults;
    
    switch (scanType) {
      case 'dependencies':
        scanResults = await scanDependencies();
        break;
      case 'config':
        scanResults = await scanConfigurations();
        break;
      case 'code':
        scanResults = await scanCode();
        break;
      case 'all':
        // Run all scan types and combine results
        const dependencyScan = await scanDependencies();
        const configScan = await scanConfigurations();
        const codeScan = await scanCode();
        
        scanResults = {
          dependencies: dependencyScan,
          config: configScan,
          code: codeScan,
          summary: {
            vulnerabilities: [
              ...dependencyScan.vulnerabilities,
              ...configScan.vulnerabilities,
              ...codeScan.vulnerabilities
            ]
          }
        };
        break;
      default:
        throw new Error(`Invalid scan type: ${scanType}`);
    }
    
    // Process scan results and add vulnerabilities to database
    await processScanResults(scanId, scanResults);
    
    // Calculate vulnerability counts
    const vulnerabilityCounts = calculateVulnerabilityCounts(scanResults.summary.vulnerabilities);
    
    // Update scan status to completed
    await updateVulnerabilityScan(scanId, {
      status: 'completed',
      completedDate: new Date(),
      vulnerabilityCount: vulnerabilityCounts.total,
      criticalCount: vulnerabilityCounts.critical,
      highCount: vulnerabilityCounts.high,
      mediumCount: vulnerabilityCounts.medium,
      lowCount: vulnerabilityCounts.low,
      scanResults,
    });
    
    console.log(`Completed ${scanType} security scan`);
    console.log(`Vulnerabilities found: ${vulnerabilityCounts.total}`);
    console.log(`- Critical: ${vulnerabilityCounts.critical}`);
    console.log(`- High: ${vulnerabilityCounts.high}`);
    console.log(`- Medium: ${vulnerabilityCounts.medium}`);
    console.log(`- Low: ${vulnerabilityCounts.low}`);
    
    return {
      scanId,
      status: 'completed',
      vulnerabilityCount: vulnerabilityCounts.total,
      results: scanResults
    };
  } catch (error) {
    console.error(`Error running ${scanType} security scan:`, error);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  try {
    const args = process.argv.slice(2);
    let scanType = 'all';
    
    // Parse command line arguments
    if (args.length > 0) {
      scanType = args[0];
      
      if (!SCAN_TYPES.includes(scanType)) {
        console.error(`Invalid scan type: ${scanType}`);
        console.error(`Valid scan types: ${SCAN_TYPES.join(', ')}`);
        process.exit(1);
      }
    }
    
    console.log(`Starting security scan of type: ${scanType}`);
    
    // Run the scan
    await runSecurityScan(scanType, 'system');
    
    console.log('Security scan completed successfully!');
  } catch (error) {
    console.error('Error running security scan:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();