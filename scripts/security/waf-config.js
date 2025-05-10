#!/usr/bin/env node

/**
 * WAF and DDoS Protection Configuration
 * 
 * This script:
 * 1. Creates WAF (Web Application Firewall) rules to block malicious traffic
 * 2. Implements rate limiting and DDoS protection
 * 3. Generates Cloudflare Workers scripts for edge protection
 * 
 * NOTE: This is a template for WAF configuration. The actual implementation
 * depends on the specific cloud provider or CDN service you use (Cloudflare, AWS, etc).
 * 
 * Usage:
 *   node waf-config.js [--deploy]
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG_DIR = path.join(__dirname, '../../waf-configs');
const DEPLOY = process.argv.includes('--deploy');

// Create configuration directory if it doesn't exist
if (!fs.existsSync(CONFIG_DIR)) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
}

/**
 * Generate Cloudflare WAF rules
 */
function generateCloudflareWAFRules() {
  const wafRules = {
    // Block common web attacks
    rules: [
      {
        id: 'block-sql-injection',
        description: 'Block SQL injection attempts',
        expression: 'http.request.uri.query contains "SELECT" || http.request.uri.query contains "UNION" || http.request.uri.query contains "DROP"',
        action: 'block',
        priority: 1
      },
      {
        id: 'block-xss',
        description: 'Block cross-site scripting attempts',
        expression: 'http.request.uri.query contains "<script>" || http.request.uri.query contains "javascript:"',
        action: 'block',
        priority: 2
      },
      {
        id: 'block-path-traversal',
        description: 'Block path traversal attempts',
        expression: 'http.request.uri.path contains "../" || http.request.uri.path contains "..%2f"',
        action: 'block',
        priority: 3
      },
      {
        id: 'block-php-file-upload',
        description: 'Block PHP file uploads',
        expression: 'http.request.uri.path endsWith ".php" && http.request.method == "POST"',
        action: 'block',
        priority: 4
      },
      {
        id: 'block-sensitive-files',
        description: 'Block access to sensitive files',
        expression: 'http.request.uri.path contains ".env" || http.request.uri.path contains ".git/" || http.request.uri.path contains "wp-config.php"',
        action: 'block',
        priority: 5
      }
    ],
    // Rate limiting rules
    rate_limiting: {
      id: 'rate-limit-api',
      description: 'Rate limit API requests',
      expression: 'http.request.uri.path contains "/api/"',
      characteristics: ['ip.src'],
      period: 60,
      requests_per_period: 100,
      mitigation_timeout: 600,
      action: 'challenge'
    },
    // DDoS protection
    ddos_protection: {
      enabled: true,
      sensitivity_level: 'medium'
    }
  };

  const outputFile = path.join(CONFIG_DIR, 'cloudflare-waf-rules.json');
  fs.writeFileSync(outputFile, JSON.stringify(wafRules, null, 2));
  console.log(`Generated Cloudflare WAF rules: ${outputFile}`);
  
  return outputFile;
}

/**
 * Generate AWS WAF rules
 */
function generateAWSWAFRules() {
  const wafRules = {
    Name: 'BrandentifierProtectionRules',
    Rules: [
      {
        Name: 'RateBasedRule',
        Priority: 1,
        Action: {
          Block: {}
        },
        Statement: {
          RateBasedStatement: {
            Limit: 100,
            AggregateKeyType: 'IP',
            ScopeDownStatement: {
              ByteMatchStatement: {
                FieldToMatch: {
                  UriPath: {}
                },
                PositionalConstraint: 'CONTAINS',
                SearchString: '/api/',
                TextTransformations: [
                  {
                    Priority: 0,
                    Type: 'NONE'
                  }
                ]
              }
            }
          }
        },
        VisibilityConfig: {
          SampledRequestsEnabled: true,
          CloudWatchMetricsEnabled: true,
          MetricName: 'RateBasedRule'
        }
      },
      {
        Name: 'SQLiRule',
        Priority: 2,
        Action: {
          Block: {}
        },
        Statement: {
          SqliMatchStatement: {
            FieldToMatch: {
              AllQueryArguments: {}
            },
            TextTransformations: [
              {
                Priority: 0,
                Type: 'URL_DECODE'
              },
              {
                Priority: 1,
                Type: 'HTML_ENTITY_DECODE'
              }
            ]
          }
        },
        VisibilityConfig: {
          SampledRequestsEnabled: true,
          CloudWatchMetricsEnabled: true,
          MetricName: 'SQLiRule'
        }
      },
      {
        Name: 'XSSRule',
        Priority: 3,
        Action: {
          Block: {}
        },
        Statement: {
          XssMatchStatement: {
            FieldToMatch: {
              AllQueryArguments: {}
            },
            TextTransformations: [
              {
                Priority: 0,
                Type: 'URL_DECODE'
              },
              {
                Priority: 1,
                Type: 'HTML_ENTITY_DECODE'
              }
            ]
          }
        },
        VisibilityConfig: {
          SampledRequestsEnabled: true,
          CloudWatchMetricsEnabled: true,
          MetricName: 'XSSRule'
        }
      }
    ],
    VisibilityConfig: {
      SampledRequestsEnabled: true,
      CloudWatchMetricsEnabled: true,
      MetricName: 'BrandentifierProtection'
    }
  };

  const outputFile = path.join(CONFIG_DIR, 'aws-waf-rules.json');
  fs.writeFileSync(outputFile, JSON.stringify(wafRules, null, 2));
  console.log(`Generated AWS WAF rules: ${outputFile}`);
  
  return outputFile;
}

/**
 * Generate Cloudflare Worker script for DDoS protection and bot detection
 */
function generateCloudflareWorker() {
  const workerScript = `
// Cloudflare Worker for DDoS Protection and Bot Detection

// Configure the protection settings
const PROTECTION_CONFIG = {
  // Rate limiting configuration
  rateLimiting: {
    enabled: true,
    requestsPerMinute: 60,
    banDurationMinutes: 10
  },
  
  // Bot detection configuration
  botDetection: {
    enabled: true,
    blockBots: true,
    challengeSuspicious: true
  },
  
  // IP reputation checking
  ipReputation: {
    enabled: true,
    blockHighRisk: true,
    challengeMediumRisk: true
  },
  
  // Path-specific protection
  paths: {
    '/api/': {
      requestsPerMinute: 30,
      requireAuthToken: true
    },
    '/login': {
      requestsPerMinute: 10,
      challengeAll: true
    }
  }
};

// KV namespace to track rate limiting
// const RATE_LIMITS = global.RATE_LIMITS;

// Helper function to check if a request is from a bot
function isBot(request) {
  const ua = request.headers.get('user-agent') || '';
  
  // Check for common bot signatures
  const botPatterns = [
    /bot/i,
    /spider/i,
    /crawl/i,
    /API-Beast/i,
    /slurp/i,
    /mediapartners/i,
    /HeadlessChrome/i
  ];
  
  // Check for missing or suspicious headers
  const hasAcceptHeader = request.headers.has('Accept');
  const hasAcceptLanguage = request.headers.has('Accept-Language');
  
  // Bot detection based on User-Agent
  const isUserAgentBot = botPatterns.some(pattern => pattern.test(ua));
  
  // Headless browser detection (missing common headers)
  const isSuspiciousHeaders = !hasAcceptHeader || !hasAcceptLanguage;
  
  return isUserAgentBot || isSuspiciousHeaders;
}

// Helper function for rate limiting
async function checkRateLimit(request, key, limit) {
  /* 
  // Note: Requires KV binding in Cloudflare
  const ip = request.headers.get('CF-Connecting-IP');
  const rateLimitKey = \`rate_limit:\${key}:\${ip}\`;
  
  // Get current count
  let count = 0;
  let timestamp = Date.now();
  
  const storedData = await RATE_LIMITS.get(rateLimitKey);
  if (storedData) {
    const data = JSON.parse(storedData);
    count = data.count;
    timestamp = data.timestamp;
    
    // Reset counter if outside the time window (1 minute)
    if (Date.now() - timestamp > 60000) {
      count = 0;
      timestamp = Date.now();
    }
  }
  
  // Increment count
  count++;
  
  // Store updated count
  await RATE_LIMITS.put(
    rateLimitKey, 
    JSON.stringify({ count, timestamp }), 
    { expirationTtl: 70 } // Store for 70 seconds
  );
  
  // Check if rate limit exceeded
  return count > limit;
  */
  
  // Simplified version without KV namespace
  return false;
}

// Main event handler
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  
  // 1. Bot detection
  if (PROTECTION_CONFIG.botDetection.enabled && isBot(request)) {
    if (PROTECTION_CONFIG.botDetection.blockBots) {
      return new Response('Access denied: Bot traffic not allowed', { status: 403 });
    }
    
    if (PROTECTION_CONFIG.botDetection.challengeSuspicious) {
      // Return Cloudflare challenge
      return new Response('', {
        status: 403,
        headers: {
          'cf-mitigated': 'challenge'
        }
      });
    }
  }
  
  // 2. Path-specific rate limiting
  for (const [pathPrefix, pathConfig] of Object.entries(PROTECTION_CONFIG.paths)) {
    if (path.startsWith(pathPrefix)) {
      const isRateLimited = await checkRateLimit(
        request, 
        \`path:\${pathPrefix}\`, 
        pathConfig.requestsPerMinute
      );
      
      if (isRateLimited) {
        return new Response('Too many requests', { status: 429 });
      }
      
      // Add additional path-specific protection
      if (pathConfig.challengeAll) {
        // Always challenge requests to this path
        // Note: In real worker, use Cloudflare's challenge
        return new Response('Challenge required', { status: 403 });
      }
      
      break;
    }
  }
  
  // 3. Global rate limiting
  if (PROTECTION_CONFIG.rateLimiting.enabled) {
    const isGloballyRateLimited = await checkRateLimit(
      request,
      'global',
      PROTECTION_CONFIG.rateLimiting.requestsPerMinute
    );
    
    if (isGloballyRateLimited) {
      return new Response('Too many requests', { status: 429 });
    }
  }
  
  // Pass request to origin
  return fetch(request);
}
`;

  const outputFile = path.join(CONFIG_DIR, 'cloudflare-worker.js');
  fs.writeFileSync(outputFile, workerScript);
  console.log(`Generated Cloudflare Worker: ${outputFile}`);
  
  return outputFile;
}

/**
 * Generate Nginx configuration with rate limiting and basic WAF
 */
function generateNginxConfig() {
  const nginxConfig = `
# Nginx configuration with WAF rules and rate limiting
# Place this in /etc/nginx/conf.d/waf.conf

# Define rate limiting zones
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login_limit:10m rate=5r/s;

# Define bad bot user agents
map $http_user_agent $bad_bot {
    default 0;
    ~*(?:acunetix|anarana|ahrefs|asteria|attackbot|backdoor|blast|collector|copier|crawler|curl|dionaea|extern|grab|harvest|hunter|indy|libwww|miner|nikto|nmap|nutch|planetwork|pycurl|python|scan|scanner|scrape|sf|sqlmap|strict|sucker|wget|zmeu) 1;
}

# Define bad request strings
map $request_uri $bad_request {
    default 0;
    ~*(?:\\.\\./) 1;                          # Path traversal
    ~*(?:\\./\\.) 1;                          # Path traversal
    ~*(?:%2e%2e/) 1;                          # Encoded path traversal
    ~*(?:etc/passwd) 1;                       # Sensitive file access attempts
    ~*(?:boot\\.ini) 1;                       # Sensitive file access attempts
    ~*(?:eval\\() 1;                          # PHP code injection
    ~*(?:system\\() 1;                        # System command injection
    ~*(?:exec\\() 1;                          # Command execution
    ~*(?:\\/\\?=.+) 1;                        # Suspicious query strings
    ~*(?:union\\s+select) 1;                 # SQL injection
    ~*(?:concat\\s*\\() 1;                   # SQL injection
    ~*(?:msg=|%3Cscript) 1;                  # XSS
    ~*(?:()\\s*{) 1;                         # Shell shock
}

# Define WAF rules
server {
    # This configuration will be merged with your main server block
    
    # Basic DDoS protection
    client_body_timeout 10s;
    client_header_timeout 10s;
    keepalive_timeout 65;
    send_timeout 10s;
    
    # Block bad bots
    if ($bad_bot = 1) {
        return 403;
    }
    
    # Block bad requests
    if ($bad_request = 1) {
        return 403;
    }
    
    # Rate limiting for API endpoints
    location ~ ^/api/ {
        limit_req zone=api_limit burst=20 nodelay;
        
        # Additional security headers
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        
        # Continue normal processing
        try_files $uri $uri/ /index.html;
    }
    
    # Rate limiting for login endpoint
    location = /login {
        limit_req zone=login_limit burst=5 nodelay;
        
        # Additional security for login
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-Frame-Options "DENY" always;
        add_header X-XSS-Protection "1; mode=block" always;
        
        # Continue normal processing
        try_files $uri $uri/ /index.html;
    }
}
`;

  const outputFile = path.join(CONFIG_DIR, 'nginx-waf.conf');
  fs.writeFileSync(outputFile, nginxConfig);
  console.log(`Generated Nginx WAF configuration: ${outputFile}`);
  
  return outputFile;
}

// Main execution
(async () => {
  try {
    console.log('Generating WAF and DDoS protection configurations...');
    
    // Generate WAF rules for different platforms
    const cloudflareRules = generateCloudflareWAFRules();
    const awsRules = generateAWSWAFRules();
    const cloudflareWorker = generateCloudflareWorker();
    const nginxConfig = generateNginxConfig();
    
    console.log('\nWAF and DDoS protection configurations generated successfully!');
    console.log('\nNext steps:');
    console.log('1. Review the generated configurations and customize them for your specific needs.');
    console.log('2. Deploy the configurations to your chosen platform (Cloudflare, AWS, Nginx, etc.).');
    console.log('3. Test the WAF rules to ensure they block malicious traffic without affecting legitimate users.');
    
    if (DEPLOY) {
      console.log('\nAutomatic deployment not implemented. Please deploy manually using the appropriate tools for your platform.');
    }
  } catch (error) {
    console.error('Error generating WAF configuration:', error.message);
    process.exit(1);
  }
})();