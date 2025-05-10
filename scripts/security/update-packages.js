#!/usr/bin/env node

/**
 * Package Update Script
 * 
 * This script:
 * 1. Checks for outdated packages using npm-check-updates
 * 2. Provides an upgrade report
 * 3. Can automatically update packages with proper testing
 * 
 * Usage:
 *   node update-packages.js [--upgrade] [--test] [--report-only]
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const REPORT_PATH = path.join(__dirname, '../../security-reports');
const UPGRADE = process.argv.includes('--upgrade');
const RUN_TESTS = process.argv.includes('--test');
const REPORT_ONLY = process.argv.includes('--report-only');

// Create report directory if it doesn't exist
if (!fs.existsSync(REPORT_PATH)) {
  fs.mkdirSync(REPORT_PATH, { recursive: true });
}

/**
 * Run npm-check-updates and return the results
 */
function checkUpdates() {
  try {
    console.log('Checking for outdated packages...');
    const output = execSync('npx npm-check-updates --format json', { encoding: 'utf8' });
    return JSON.parse(output);
  } catch (error) {
    console.error('Failed to check for updates:', error.message);
    process.exit(1);
  }
}

/**
 * Generate a human-readable report about available updates
 */
function generateReport(updateData) {
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const reportFile = path.join(REPORT_PATH, `update-report-${timestamp}.txt`);
  
  // Generate report content
  let reportContent = `PACKAGE UPDATE REPORT\n`;
  reportContent += `Generated: ${new Date().toLocaleString()}\n\n`;
  
  // Count updates by type (patch, minor, major)
  const updateTypes = {
    patch: [],
    minor: [],
    major: []
  };
  
  let totalPackages = 0;
  let updatablePackages = 0;
  
  for (const [packageName, data] of Object.entries(updateData.dependencies || {})) {
    totalPackages++;
    
    if (data.current !== data.latest) {
      updatablePackages++;
      
      // Determine update type
      const current = data.current.split('.');
      const latest = data.latest.split('.');
      
      let updateType = 'patch';
      if (current[0] !== latest[0]) {
        updateType = 'major';
      } else if (current[1] !== latest[1]) {
        updateType = 'minor';
      }
      
      updateTypes[updateType].push({
        name: packageName,
        current: data.current,
        latest: data.latest,
        url: `https://www.npmjs.com/package/${packageName}`
      });
    }
  }
  
  // Add summary
  reportContent += `SUMMARY:\n`;
  reportContent += `Total packages: ${totalPackages}\n`;
  reportContent += `Packages needing updates: ${updatablePackages}\n`;
  reportContent += `Major version updates: ${updateTypes.major.length}\n`;
  reportContent += `Minor version updates: ${updateTypes.minor.length}\n`;
  reportContent += `Patch updates: ${updateTypes.patch.length}\n\n`;
  
  // Add detailed information about each update type
  reportContent += `MAJOR UPDATES (potentially breaking changes):\n`;
  if (updateTypes.major.length === 0) {
    reportContent += `  None\n`;
  } else {
    updateTypes.major.forEach(pkg => {
      reportContent += `  - ${pkg.name}: ${pkg.current} → ${pkg.latest}\n`;
      reportContent += `    ${pkg.url}\n`;
    });
  }
  
  reportContent += `\nMINOR UPDATES (new features, non-breaking):\n`;
  if (updateTypes.minor.length === 0) {
    reportContent += `  None\n`;
  } else {
    updateTypes.minor.forEach(pkg => {
      reportContent += `  - ${pkg.name}: ${pkg.current} → ${pkg.latest}\n`;
    });
  }
  
  reportContent += `\nPATCH UPDATES (bug fixes, security patches):\n`;
  if (updateTypes.patch.length === 0) {
    reportContent += `  None\n`;
  } else {
    updateTypes.patch.forEach(pkg => {
      reportContent += `  - ${pkg.name}: ${pkg.current} → ${pkg.latest}\n`;
    });
  }
  
  // Write report to file
  fs.writeFileSync(reportFile, reportContent);
  console.log(`Update report generated: ${reportFile}`);
  
  return {
    reportFile,
    stats: {
      total: totalPackages,
      updatable: updatablePackages,
      major: updateTypes.major.length,
      minor: updateTypes.minor.length,
      patch: updateTypes.patch.length
    }
  };
}

/**
 * Upgrade packages
 */
function upgradePackages(includeMajor = false) {
  try {
    const command = includeMajor 
      ? 'npx npm-check-updates -u' 
      : 'npx npm-check-updates -u --target minor';
    
    console.log(`Upgrading packages (${includeMajor ? 'including' : 'excluding'} major versions)...`);
    const upgradeOutput = execSync(command, { encoding: 'utf8' });
    console.log(upgradeOutput);
    
    console.log('Installing updated packages...');
    const installOutput = execSync('npm install', { encoding: 'utf8' });
    console.log(installOutput);
    
    return true;
  } catch (error) {
    console.error('Error upgrading packages:', error.message);
    return false;
  }
}

/**
 * Run tests to verify updates don't break functionality
 */
function runTests() {
  try {
    console.log('Running tests to verify updates...');
    const testOutput = execSync('npm test', { encoding: 'utf8' });
    console.log(testOutput);
    return true;
  } catch (error) {
    console.error('Tests failed after package updates:', error.message);
    return false;
  }
}

// Main execution
(async () => {
  // Check for updates
  const updateData = checkUpdates();
  
  // Generate report
  const { reportFile, stats } = generateReport(updateData);
  
  if (REPORT_ONLY) {
    return;
  }
  
  if (stats.updatable === 0) {
    console.log('✓ All packages are up to date!');
    return;
  }
  
  // Upgrade packages if requested
  if (UPGRADE) {
    console.log(`Preparing to update ${stats.updatable} packages...`);
    
    // First upgrade non-major versions (safer)
    const upgradedMinorAndPatch = upgradePackages(false);
    
    if (!upgradedMinorAndPatch) {
      console.error('Failed to upgrade minor and patch versions. Stopping.');
      return;
    }
    
    // If tests are requested, run them after minor/patch updates
    if (RUN_TESTS && stats.minor + stats.patch > 0) {
      const testsPass = runTests();
      if (!testsPass) {
        console.error('Tests failed after minor/patch updates. Stopping before major updates.');
        return;
      }
    }
    
    // Only upgrade major versions if there are any and tests pass
    if (stats.major > 0) {
      console.log(`Proceeding with ${stats.major} major version updates...`);
      const upgradedMajor = upgradePackages(true);
      
      if (!upgradedMajor) {
        console.error('Failed to upgrade major versions.');
        return;
      }
      
      // Run tests again after major updates
      if (RUN_TESTS) {
        const majorTestsPass = runTests();
        if (!majorTestsPass) {
          console.error('Tests failed after major updates. Some functionality may be broken.');
        }
      }
    }
    
    console.log('✓ Package updates completed!');
    console.log('Run dependency-check.js to verify no new vulnerabilities were introduced.');
  } else {
    console.log('Use --upgrade flag to update packages.');
    console.log('Add --test to run tests after updates.');
  }
})();