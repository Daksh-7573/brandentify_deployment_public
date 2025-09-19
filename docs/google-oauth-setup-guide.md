# Google Cloud Console OAuth Setup Guide

## Overview

This guide provides comprehensive instructions for setting up Google OAuth authentication for Brandentifier across all Replit environments. The implementation supports both development and production environments with automatic credential rotation and comprehensive domain pattern support.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Google Cloud Console Setup](#google-cloud-console-setup)
3. [OAuth Application Configuration](#oauth-application-configuration)
4. [Redirect URI Configuration](#redirect-uri-configuration)
5. [Environment Variables Setup](#environment-variables-setup)
6. [Production vs Development Separation](#production-vs-development-separation)
7. [Testing and Verification](#testing-and-verification)
8. [Troubleshooting](#troubleshooting)
9. [Security Best Practices](#security-best-practices)

## Prerequisites

- Google Cloud Console account with billing enabled
- Admin access to your Google Cloud project
- Access to Replit environment variables
- Basic understanding of OAuth 2.0 flow

## Google Cloud Console Setup

### Step 1: Create or Select a Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note the Project ID for reference

### Step 2: Enable Required APIs

Enable the following APIs in your Google Cloud project:

1. **Google Identity Services API** (current Google OAuth 2.0 standard)
   - Go to APIs & Services > Library
   - Search for "Google Identity Services API"
   - Click "Enable"

2. **Google OAuth2 API** 
   - Search for "Google OAuth2 API"
   - Click "Enable"

3. **Google Identity and Access Management (IAM) API**
   - Search for "Google Identity and Access Management API"
   - Click "Enable"

**Note**: Google+ API is deprecated and no longer required for OAuth 2.0 flows. Use Google Identity Services API instead.

### Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services > OAuth consent screen**
2. Choose **External** user type (unless you have Google Workspace)
3. Fill in the required information:

   **App Information:**
   - App name: `Brandentifier`
   - User support email: Your support email
   - App logo: Upload Brandentifier logo (optional)

   **App domain:**
   - Application home page: `https://brandentifier.com`
   - Application privacy policy link: `https://brandentifier.com/privacy`
   - Application terms of service link: `https://brandentifier.com/terms`

   **Authorized domains:**
   ```
   brandentifier.com
   brandentifier.replit.app
   replit.app
   replit.dev
   picard.replit.dev
   ```

   **Developer contact information:**
   - Add your email address

4. Click **Save and Continue**

### Step 4: Configure Scopes

1. Click **Add or Remove Scopes**
2. Add these scopes (our implementation uses minimal required scopes for security):
   - `openid` - Required for OpenID Connect authentication
   - `email` - User email address for account identification
   - `profile` - Basic profile information (name, photo)

3. Click **Update** and then **Save and Continue**

## OAuth Application Configuration

### Step 5: Create OAuth 2.0 Credentials

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth 2.0 Client IDs**
3. Choose **Web application** as the application type
4. Set the name: `Brandentifier OAuth Client`

## Redirect URI Configuration

### Step 6: Add Authorized Redirect URIs

⚠️ **CRITICAL**: Add ALL of the following **EXACT** redirect URIs to your Google Cloud Console OAuth configuration. These are not patterns - each URI must be added individually:

📋 **COPY-PASTE CHECKLIST**: Add each URI exactly as shown (no modifications):

#### Production Domains
```
https://brandentifier.com/api/auth/google/callback
https://www.brandentifier.com/api/auth/google/callback
```

#### Primary Replit Published Domain
```
https://brandentifier.replit.app/api/auth/google/callback
```

#### Development Environments
```
http://localhost:5000/api/auth/google/callback
http://localhost:3000/api/auth/google/callback
http://127.0.0.1:5000/api/auth/google/callback
http://127.0.0.1:3000/api/auth/google/callback
```

#### Common Replit Variations (for staging/testing)
```
https://brandentifier-v2.replit.app/api/auth/google/callback
https://brandentifier-staging.replit.app/api/auth/google/callback
https://brandentifier-test.replit.app/api/auth/google/callback
https://brandentifier-demo.replit.app/api/auth/google/callback
https://brandentifier-beta.replit.app/api/auth/google/callback
https://brandentifier-prod.replit.app/api/auth/google/callback
```

#### Replit Development Patterns
```
https://replit.com/api/auth/google/callback
https://replit.dev/api/auth/google/callback
```

### Dynamic Replit Domains

🔄 **Auto-Handled**: The following domain patterns are automatically handled by our enhanced domain matching system and will fall back to `brandentifier.replit.app`:

- `*.replit.app` - Published Replit applications
- `*.replit.dev` - Preview environments  
- `*.picard.replit.dev` - Development preview environments
- `*.replit.com` - Legacy domains
- `*.repl.co` - Legacy short domains
- Team workspace domains: `*.team.replit.app`

## Environment Variables Setup

### Step 7: Configure Environment Variables

After creating the OAuth credentials, you'll receive:
- **Client ID**: Long string ending in `.apps.googleusercontent.com`
- **Client Secret**: Shorter alphanumeric string

#### For Single Environment Setup:
```bash
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
JWT_SECRET=your_secure_jwt_secret_here
CSRF_SECRET=your_secure_csrf_secret_here
```

#### For Production/Development Separation:
```bash
# Production credentials
PROD_GOOGLE_CLIENT_ID=your_prod_client_id.apps.googleusercontent.com
PROD_GOOGLE_CLIENT_SECRET=your_prod_client_secret

# Development credentials  
DEV_GOOGLE_CLIENT_ID=your_dev_client_id.apps.googleusercontent.com
DEV_GOOGLE_CLIENT_SECRET=your_dev_client_secret

# Shared secrets (REQUIRED for production)
JWT_SECRET=your_secure_jwt_secret_here
CSRF_SECRET=your_secure_csrf_secret_here
NODE_ENV=production  # or development
```

#### **CRITICAL**: CSRF_SECRET Security Requirements

⚠️ **Production Security**: Starting with the latest security updates, `CSRF_SECRET` is **mandatory** in production environments. The server will **fail to start** if this variable is not set.

**Generate secure secrets:**
```bash
# Generate JWT_SECRET (64 characters)
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"

# Generate CSRF_SECRET (64 characters) 
node -e "console.log('CSRF_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
```

**Development**: If secrets are not set in development, cryptographically random secrets will be generated per-process (not persistent across restarts).

## Production vs Development Separation

### Benefits of Separate OAuth Apps

1. **Security**: Isolates production user data from development
2. **Analytics**: Separate usage tracking and monitoring
3. **Credential Rotation**: Independent credential management
4. **Testing**: Safe testing without affecting production users

### Setup Instructions

1. **Create two separate OAuth applications** in Google Cloud Console:
   - `Brandentifier Production OAuth`
   - `Brandentifier Development OAuth`

2. **Configure different redirect URIs** for each:
   
   **Production OAuth App:**
   ```
   https://brandentifier.com/api/auth/google/callback
   https://www.brandentifier.com/api/auth/google/callback
   https://brandentifier.replit.app/api/auth/google/callback
   ```
   
   **Development OAuth App:**
   ```
   http://localhost:5000/api/auth/google/callback
   http://127.0.0.1:5000/api/auth/google/callback
   https://brandentifier-staging.replit.app/api/auth/google/callback
   https://brandentifier-test.replit.app/api/auth/google/callback
   # Add other development/staging domains as needed
   ```

3. **Set environment-specific variables** as shown above

## Testing and Verification

### Step 8: Test OAuth Configuration

1. **Check Configuration Status:**
   Visit `/api/auth/oauth-config-status` to see detailed configuration validation

2. **Test OAuth Flow:**
   - Visit `/api/auth/google/url` to generate OAuth URL
   - Complete the Google authentication flow
   - Verify successful redirect and session creation

3. **Verify Cross-Domain Functionality:**
   - Test on different Replit domains
   - Confirm session handoff works correctly
   - Check localStorage and cookie authentication

### Configuration Validation Endpoint

The system provides a comprehensive configuration status endpoint:

```
GET /api/auth/oauth-config-status
```

This endpoint returns:
- Credential validation status
- Redirect URI coverage
- Domain pattern matching
- Scope configuration
- Environment detection
- Security warnings and recommendations

## Troubleshooting

### Common Issues and Solutions

#### 1. "redirect_uri_mismatch" Error

**Cause**: The redirect URI in the OAuth request doesn't match any authorized URI in Google Cloud Console.

**Solution**:
- Check the exact redirect URI being used (found in browser developer tools)
- Add the exact URI to Google Cloud Console OAuth configuration
- Ensure no trailing slashes or case mismatches

#### 2. "invalid_client" Error

**Cause**: Incorrect Client ID or Client Secret.

**Solution**:
- Verify environment variables are set correctly
- Check for extra spaces or hidden characters
- Ensure Client ID ends with `.apps.googleusercontent.com`

#### 3. OAuth Works on Some Domains but Not Others

**Cause**: Missing redirect URIs for specific domains.

**Solution**:
- Check which domain is failing using browser developer tools
- Add the specific redirect URI to Google Cloud Console
- Verify domain pattern matching in our system

#### 4. "access_denied" Error

**Cause**: User denied permission or OAuth consent screen issues.

**Solution**:
- Check OAuth consent screen configuration
- Ensure app verification status if needed
- Verify required scopes are properly configured

#### 5. Session Not Persisting Across Domains

**Cause**: Cross-domain session handoff issues.

**Solution**:
- Check session exchange mechanism
- Verify CSRF token validation
- Ensure localStorage authentication is working

### Debug Tools

1. **Server Logs**: Check console for OAuth validation messages
2. **Configuration Status**: Use `/api/auth/oauth-config-status` endpoint
3. **Browser Developer Tools**: Check Network tab for OAuth flow details
4. **Session Check**: Use `/api/auth/session` to verify current session

## Security Best Practices

### 1. Credential Management

- **Never commit credentials to code**
- **Use environment-specific credentials**
- **Rotate credentials regularly**
- **Monitor credential usage**

### 2. PKCE (Proof Key for Code Exchange) Security

🔐 **Enhanced OAuth 2.0 Security**: Our implementation includes PKCE (RFC 7636) for protection against authorization code interception attacks:

- **Code Verifier**: Cryptographically random 256-bit string generated per OAuth flow
- **Code Challenge**: SHA256 hash of code_verifier, base64url encoded  
- **S256 Method**: Industry standard hash method for maximum security
- **Single-Use**: Each PKCE parameter set is used only once and automatically expires

**PKCE Flow**:
1. Client generates code_verifier and code_challenge
2. Authorization request includes code_challenge and method=S256
3. Google validates code_challenge during token exchange
4. Prevents replay attacks and authorization code interception

### 3. Scope Minimization

Our implementation uses minimal required scopes:
- `openid` - Required for OAuth 2.0 / OpenID Connect
- `email` - User identification and account linking
- `profile` - Basic profile information only

**Avoid requesting unnecessary scopes** like:
- File access scopes
- Calendar access
- Drive access
- Additional Google service scopes

### 4. Domain Security

- **Host-only cookies** prevent subdomain security issues
- **HTTPS enforcement** for all production domains
- **Domain validation** prevents unauthorized redirects
- **CSRF protection** for all authentication requests

**Preview Environment Behavior**: Preview environments (e.g., `*.picard.replit.dev`) intentionally redirect to the published domain (`brandentifier.replit.app`) for security. This consolidates authentication and prevents subdomain cookie issues.

### 5. Session Security

- **JWT tokens** with expiration for stateless authentication
- **Secure cookie options** with SameSite protection
- **Cross-domain handoff** mechanism for Replit environments
- **Automatic session cleanup** for expired tokens

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
- [OAuth 2.0 Security Best Practices](https://tools.ietf.org/html/draft-ietf-oauth-security-topics)
- [OpenID Connect Specification](https://openid.net/connect/)

## Support

For additional help:
1. Check the configuration status endpoint
2. Review server logs for detailed error messages  
3. Verify all redirect URIs are properly configured
4. Ensure environment variables are set correctly

---

**Last Updated**: September 19, 2025
**Version**: 2.0 - Comprehensive Replit Environment Support