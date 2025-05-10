#!/usr/bin/env node

/**
 * Environment Separation Management Script
 * 
 * This script:
 * 1. Manages environment-specific configurations
 * 2. Helps enforce separation between development, staging, and production
 * 3. Prevents accidental dev/staging leakage into production
 * 
 * Usage:
 *   node env-separation.js [--create-env=env_name] [--validate-env=env_name]
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuration
const ENV_CONFIG_DIR = path.join(__dirname, '../../env-configs');
const ENV_TEMPLATE_DIR = path.join(__dirname, '../../env-templates');
const SUPPORTED_ENVIRONMENTS = ['development', 'staging', 'production'];

// Parse command line arguments
const args = process.argv.slice(2);
const createEnvArg = args.find(arg => arg.startsWith('--create-env='));
const validateEnvArg = args.find(arg => arg.startsWith('--validate-env='));

const createEnv = createEnvArg ? createEnvArg.split('=')[1] : null;
const validateEnv = validateEnvArg ? validateEnvArg.split('=')[1] : null;

// Create directories if they don't exist
if (!fs.existsSync(ENV_CONFIG_DIR)) {
  fs.mkdirSync(ENV_CONFIG_DIR, { recursive: true });
}
if (!fs.existsSync(ENV_TEMPLATE_DIR)) {
  fs.mkdirSync(ENV_TEMPLATE_DIR, { recursive: true });
}

/**
 * Generate a secure random string for use as secrets
 */
function generateSecureSecret(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Create environment-specific configuration
 */
function createEnvironmentConfig(envName) {
  if (!SUPPORTED_ENVIRONMENTS.includes(envName)) {
    console.error(`Error: Unsupported environment '${envName}'. Supported environments are: ${SUPPORTED_ENVIRONMENTS.join(', ')}`);
    process.exit(1);
  }
  
  console.log(`Creating configuration for ${envName} environment...`);
  
  // Environment-specific settings
  const config = {
    environment: envName,
    server: {
      port: envName === 'production' ? 443 : (envName === 'staging' ? 8443 : 3000),
      host: envName === 'production' ? '0.0.0.0' : 'localhost',
      useHttps: envName === 'development' ? false : true
    },
    database: {
      host: `${envName}-db.brandentifier.internal`,
      name: `brandentifier_${envName}`,
      user: `brandentifier_${envName}_user`,
      password: generateSecureSecret(16),
      poolMin: envName === 'production' ? 5 : 2,
      poolMax: envName === 'production' ? 20 : 10
    },
    redis: {
      host: `${envName}-redis.brandentifier.internal`,
      port: 6379,
      password: generateSecureSecret(16)
    },
    logging: {
      level: envName === 'production' ? 'info' : (envName === 'staging' ? 'debug' : 'trace'),
      console: envName !== 'production',
      file: true,
      metrics: envName !== 'development'
    },
    security: {
      jwtSecret: generateSecureSecret(),
      csrfSecret: generateSecureSecret(),
      cookieSecret: generateSecureSecret(),
      encryptionKey: generateSecureSecret(),
      allowedOrigins: 
        envName === 'production' 
          ? ['https://brandentifier.com', 'https://app.brandentifier.com'] 
          : (envName === 'staging' 
              ? ['https://staging.brandentifier.com', 'https://app.staging.brandentifier.com', 'http://localhost:3000'] 
              : ['http://localhost:3000'])
    },
    features: {
      enableAnalytics: envName !== 'development',
      enableNotifications: true,
      maintenanceMode: false,
      enableDebugEndpoints: envName === 'development'
    },
    services: {
      openaiApiKey: 'USE_ENVIRONMENT_VARIABLE',
      twilioAccountSid: 'USE_ENVIRONMENT_VARIABLE',
      twilioAuthToken: 'USE_ENVIRONMENT_VARIABLE',
      sendgridApiKey: 'USE_ENVIRONMENT_VARIABLE',
      stripeSecretKey: 'USE_ENVIRONMENT_VARIABLE',
      stripeEndpointSecret: 'USE_ENVIRONMENT_VARIABLE',
      awsAccessKeyId: 'USE_ENVIRONMENT_VARIABLE',
      awsSecretAccessKey: 'USE_ENVIRONMENT_VARIABLE'
    }
  };
  
  // Generate environment dotenv template
  const dotenvTemplate = generateDotenvTemplate(config, envName);
  const dotenvPath = path.join(ENV_TEMPLATE_DIR, `.env.${envName}.template`);
  fs.writeFileSync(dotenvPath, dotenvTemplate);
  
  // Save the full config
  const configPath = path.join(ENV_CONFIG_DIR, `${envName}-config.json`);
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  
  console.log(`Environment configuration created:`);
  console.log(`- Full config: ${configPath}`);
  console.log(`- Dotenv template: ${dotenvPath}`);
  
  // Create deployment checklist for production
  if (envName === 'production') {
    const checklistPath = path.join(ENV_CONFIG_DIR, 'production-deployment-checklist.md');
    fs.writeFileSync(checklistPath, generateProductionChecklist());
    console.log(`- Production deployment checklist: ${checklistPath}`);
  }
  
  return { configPath, dotenvPath };
}

/**
 * Generate a dotenv template file from the config
 */
function generateDotenvTemplate(config, envName) {
  let template = `# Environment: ${envName.toUpperCase()}\n`;
  template += `# Generated on: ${new Date().toISOString()}\n`;
  template += `# DO NOT COMMIT THIS FILE WITH REAL VALUES\n\n`;
  
  template += `# Environment\n`;
  template += `NODE_ENV=${envName}\n\n`;
  
  template += `# Server\n`;
  template += `PORT=${config.server.port}\n`;
  template += `HOST=${config.server.host}\n`;
  template += `USE_HTTPS=${config.server.useHttps}\n\n`;
  
  template += `# Database\n`;
  template += `DATABASE_URL=postgres://${config.database.user}:${config.database.password}@${config.database.host}:5432/${config.database.name}\n`;
  template += `DB_HOST=${config.database.host}\n`;
  template += `DB_NAME=${config.database.name}\n`;
  template += `DB_USER=${config.database.user}\n`;
  template += `DB_PASSWORD=${config.database.password}\n`;
  template += `DB_POOL_MIN=${config.database.poolMin}\n`;
  template += `DB_POOL_MAX=${config.database.poolMax}\n\n`;
  
  template += `# Redis\n`;
  template += `REDIS_HOST=${config.redis.host}\n`;
  template += `REDIS_PORT=${config.redis.port}\n`;
  template += `REDIS_PASSWORD=${config.redis.password}\n\n`;
  
  template += `# Security\n`;
  template += `JWT_SECRET=${config.security.jwtSecret}\n`;
  template += `CSRF_SECRET=${config.security.csrfSecret}\n`;
  template += `COOKIE_SECRET=${config.security.cookieSecret}\n`;
  template += `ENCRYPTION_KEY=${config.security.encryptionKey}\n`;
  template += `ALLOWED_ORIGINS=${config.security.allowedOrigins.join(',')}\n\n`;
  
  template += `# Features\n`;
  template += `ENABLE_ANALYTICS=${config.features.enableAnalytics}\n`;
  template += `ENABLE_NOTIFICATIONS=${config.features.enableNotifications}\n`;
  template += `MAINTENANCE_MODE=${config.features.maintenanceMode}\n`;
  template += `ENABLE_DEBUG_ENDPOINTS=${config.features.enableDebugEndpoints}\n\n`;
  
  template += `# External Services\n`;
  template += `OPENAI_API_KEY=sk-your-openai-api-key\n`;
  template += `ANTHROPIC_API_KEY=sk-ant-api-key\n`;
  template += `TWILIO_ACCOUNT_SID=your-twilio-account-sid\n`;
  template += `TWILIO_AUTH_TOKEN=your-twilio-auth-token\n`;
  template += `SENDGRID_API_KEY=your-sendgrid-api-key\n`;
  template += `STRIPE_SECRET_KEY=your-stripe-secret-key\n`;
  template += `STRIPE_ENDPOINT_SECRET=your-stripe-endpoint-secret\n`;
  template += `AWS_ACCESS_KEY_ID=your-aws-access-key-id\n`;
  template += `AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key\n`;
  
  return template;
}

/**
 * Generate a production deployment checklist
 */
function generateProductionChecklist() {
  return `# Production Deployment Checklist

## Before Deployment

### Security
- [ ] Audit npm dependencies for vulnerabilities (npm audit)
- [ ] Ensure all environment-specific secrets are set
- [ ] Verify HTTPS is properly configured
- [ ] Test CORS configuration with production domains
- [ ] Confirm JWT expiration settings are appropriate
- [ ] Disable debug endpoints and tools

### Database
- [ ] Verify database migrations work correctly
- [ ] Confirm database backups are configured and tested
- [ ] Set appropriate connection pool settings
- [ ] Set up database monitoring alerts

### Performance
- [ ] Run load testing
- [ ] Optimize database queries
- [ ] Configure proper caching strategies
- [ ] Verify static asset bundling and minification

### Logging & Monitoring
- [ ] Configure production logging levels
- [ ] Set up error alerting
- [ ] Implement performance monitoring
- [ ] Configure uptime monitoring
- [ ] Set up log rotation

## Deployment Process

### Pre-Launch
- [ ] Create full database backup
- [ ] Notify relevant stakeholders
- [ ] Verify maintenance mode functionality

### Launch
- [ ] Deploy to production
- [ ] Verify database connections
- [ ] Check for deployment errors
- [ ] Test critical flows (authentication, API endpoints)
- [ ] Monitor application logs for issues

### Post-Launch
- [ ] Perform UAT (User Acceptance Testing)
- [ ] Verify analytics are working
- [ ] Monitor application performance
- [ ] Check server resource utilization
- [ ] Update documentation

## Rollback Plan

### Triggers for Rollback
- [ ] Critical user-facing bugs
- [ ] Significant performance degradation
- [ ] Security vulnerabilities
- [ ] Data integrity issues

### Rollback Process
- [ ] Revert to previous deployment
- [ ] Restore from database backup if necessary
- [ ] Notify relevant stakeholders
- [ ] Update status page or documentation
- [ ] Conduct post-mortem analysis
`;
}

/**
 * Validate an environment configuration for security and best practices
 */
function validateEnvironmentConfig(envName) {
  if (!SUPPORTED_ENVIRONMENTS.includes(envName)) {
    console.error(`Error: Unsupported environment '${envName}'. Supported environments are: ${SUPPORTED_ENVIRONMENTS.join(', ')}`);
    process.exit(1);
  }
  
  const configPath = path.join(ENV_CONFIG_DIR, `${envName}-config.json`);
  
  if (!fs.existsSync(configPath)) {
    console.error(`Error: Configuration file not found for '${envName}' environment. Run with --create-env=${envName} first.`);
    process.exit(1);
  }
  
  console.log(`Validating configuration for ${envName} environment...`);
  
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    // Define validation rules
    const validationRules = [
      {
        check: () => config.environment === envName,
        message: 'Environment name in config does not match specified environment.'
      },
      {
        check: () => config.server && typeof config.server.port === 'number',
        message: 'Server port must be defined and be a number.'
      },
      {
        check: () => config.database && typeof config.database.password === 'string' && config.database.password.length >= 12,
        message: 'Database password must be at least 12 characters long.'
      },
      {
        check: () => config.security && typeof config.security.jwtSecret === 'string' && config.security.jwtSecret.length >= 32,
        message: 'JWT secret must be at least 32 characters long.'
      },
      {
        check: () => !config.features.enableDebugEndpoints || envName !== 'production',
        message: 'Debug endpoints should be disabled in production environment.'
      },
      {
        check: () => Array.isArray(config.security.allowedOrigins) && config.security.allowedOrigins.length > 0,
        message: 'Allowed origins must be a non-empty array.'
      },
      {
        check: () => envName === 'production' ? config.server.useHttps === true : true,
        message: 'HTTPS must be enabled in production environment.'
      }
    ];
    
    // Run validation
    let valid = true;
    const issues = [];
    
    for (const rule of validationRules) {
      try {
        if (!rule.check()) {
          valid = false;
          issues.push(rule.message);
        }
      } catch (error) {
        valid = false;
        issues.push(`Validation error: ${error.message}`);
      }
    }
    
    // Production-specific validations
    if (envName === 'production') {
      // Check for development or staging values in production
      const suspiciousValues = ['localhost', 'development', 'staging', 'test'];
      const configStr = JSON.stringify(config).toLowerCase();
      
      for (const value of suspiciousValues) {
        if (configStr.includes(value)) {
          valid = false;
          issues.push(`Production config contains suspicious value: '${value}'`);
        }
      }
    }
    
    // Output validation results
    if (valid) {
      console.log(`✓ Configuration for ${envName} environment is valid.`);
    } else {
      console.error(`✗ Configuration validation failed for ${envName} environment:`);
      issues.forEach((issue, index) => {
        console.error(`   ${index + 1}. ${issue}`);
      });
      process.exit(1);
    }
    
    return { valid, issues };
  } catch (error) {
    console.error(`Error validating configuration: ${error.message}`);
    process.exit(1);
  }
}

// Main execution
(async () => {
  try {
    if (createEnv) {
      createEnvironmentConfig(createEnv);
    } else if (validateEnv) {
      validateEnvironmentConfig(validateEnv);
    } else {
      // Show usage if no action specified
      console.log('Environment Separation Management Script');
      console.log('');
      console.log('Usage:');
      console.log('  node env-separation.js --create-env=<env_name>   Create config for the specified environment');
      console.log('  node env-separation.js --validate-env=<env_name> Validate config for the specified environment');
      console.log('');
      console.log('Supported environments:');
      for (const env of SUPPORTED_ENVIRONMENTS) {
        console.log(`  - ${env}`);
      }
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
})();