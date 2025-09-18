# Authentication System - Manual Test Cases

## Overview
This document outlines functional test scenarios for the authentication system, covering Google OAuth, direct login, email/password authentication, phone authentication, and session management across multiple domains.

---

## Test Environment Setup

### Prerequisites
- Access to development environment (localhost/Replit workspace)
- Access to published domain (*.replit.app)
- Valid Google account for OAuth testing
- Valid email account for verification testing
- Valid phone number for SMS testing
- Browser developer tools access

### Test Data Preparation
- **Valid Email**: `testuser@example.com`
- **Invalid Email**: `invalid-email`
- **Valid Phone**: `+1234567890`
- **Invalid Phone**: `123`
- **Valid Password**: `TestPass123!`
- **Weak Password**: `123`

---

## 1. Google OAuth Authentication

### Test Case 1.1: Successful Google Login (New User)
**Objective**: Verify Google OAuth creates new user account successfully

**Pre-conditions**: 
- User not previously registered
- Clear browser storage

**Steps**:
1. Navigate to login page
2. Click "Continue with Google" button
3. Complete Google authentication flow
4. Grant permissions when prompted

**Expected Results**:
- Redirected to Google OAuth page
- After authentication, redirected back to application
- New user account created automatically
- User logged in successfully
- Profile page shows Google account information
- Database contains new user record with Google ID

### Test Case 1.2: Successful Google Login (Existing User)
**Objective**: Verify existing Google user can log in

**Pre-conditions**: 
- User previously registered with Google
- Currently logged out

**Steps**:
1. Navigate to login page
2. Click "Continue with Google" button
3. Select existing Google account

**Expected Results**:
- User logged in without creating duplicate account
- Profile shows existing user data
- Last login timestamp updated in database

### Test Case 1.3: Google Login Cancellation
**Objective**: Verify proper handling when user cancels Google OAuth

**Steps**:
1. Click "Continue with Google" button
2. Cancel/close Google OAuth popup

**Expected Results**:
- User remains on login page
- No error messages displayed
- Application state unchanged
- No partial user records created

### Test Case 1.4: Google OAuth Error Handling
**Objective**: Verify error handling for Google OAuth failures

**Steps**:
1. Disconnect internet during Google OAuth flow
2. Try Google login with network issues

**Expected Results**:
- Appropriate error message displayed
- User can retry authentication
- No broken application state

---

## 2. Direct Login (Passwordless)

### Test Case 2.1: Direct Login - New User Creation
**Objective**: Verify passwordless login creates new user account

**Steps**:
1. Navigate to direct login endpoint
2. Enter valid email: `newuser@example.com`
3. Enter name: `Test User`
4. Submit login request

**Expected Results**:
- New user account created with provided email and name
- User automatically logged in
- Username generated from email (e.g., `newuser-1234`)
- Default profile values set (industry: Technology, title: Professional)
- `isVerified` set to true
- No password stored (null value)

### Test Case 2.2: Direct Login - Existing User
**Objective**: Verify passwordless login works for existing users

**Pre-conditions**: User exists in database

**Steps**:
1. Use direct login with existing email
2. Submit request

**Expected Results**:
- User logged in successfully
- No duplicate account created
- Last login timestamp updated
- Existing profile data preserved

### Test Case 2.3: Direct Login - Invalid Email
**Objective**: Verify validation for invalid email addresses

**Steps**:
1. Submit direct login with invalid email: `invalid-email`
2. Submit direct login with empty email

**Expected Results**:
- Error message: "Email is required" for empty email
- Appropriate validation error for malformed email
- No user account created
- User remains unauthenticated

---

## 3. Email/Password Authentication

### Test Case 3.1: New User Registration
**Objective**: Verify user can register with email and password

**Steps**:
1. Navigate to registration page
2. Enter email: `testuser@example.com`
3. Enter username: `testuser123`
4. Enter password: `TestPass123!`
5. Confirm password: `TestPass123!`
6. Submit registration form

**Expected Results**:
- Registration successful message displayed
- Email verification message sent
- User cannot log in until email verified
- User record created with `emailVerified: false`
- Verification token generated

### Test Case 3.2: Email Verification Process
**Objective**: Verify email verification workflow

**Pre-conditions**: User registered but not verified

**Steps**:
1. Check email for verification link
2. Click verification link
3. Attempt to log in with credentials

**Expected Results**:
- Verification link redirects to success page
- `emailVerified` set to true in database
- User can now log in successfully
- Verification token cleared

### Test Case 3.3: Login with Verified Account
**Objective**: Verify login works after email verification

**Pre-conditions**: Account exists and is verified

**Steps**:
1. Navigate to login page
2. Enter verified email and password
3. Submit login form

**Expected Results**:
- User logged in successfully
- Redirected to dashboard/main application
- Session established
- Last login timestamp updated

### Test Case 3.4: Login with Unverified Account
**Objective**: Verify unverified accounts cannot log in

**Pre-conditions**: Account exists but email not verified

**Steps**:
1. Attempt login with unverified account credentials

**Expected Results**:
- Login rejected
- Error message: "Email not verified. Please verify your email to login."
- Option to resend verification email
- User remains unauthenticated

### Test Case 3.5: Password Reset Flow
**Objective**: Verify password reset functionality

**Steps**:
1. Click "Forgot Password" link
2. Enter registered email address
3. Check email for reset link
4. Click reset link and enter new password
5. Log in with new password

**Expected Results**:
- Reset email sent successfully
- Reset link works within time limit
- Password updated in database
- Login successful with new password
- Old password no longer works

---

## 4. Phone Authentication

### Test Case 4.1: Phone Number Registration
**Objective**: Verify user can register with phone number

**Steps**:
1. Navigate to phone registration
2. Enter valid phone number: `+1234567890`
3. Request OTP code
4. Enter received OTP code

**Expected Results**:
- OTP sent to phone number
- OTP verification successful
- User account created with phone number
- `authProvider` set to "phone"
- User logged in automatically

### Test Case 4.2: Phone Login - Existing User
**Objective**: Verify existing phone users can log in

**Pre-conditions**: User previously registered with phone

**Steps**:
1. Enter existing phone number
2. Request OTP
3. Enter valid OTP code

**Expected Results**:
- User logged in successfully
- No duplicate account created
- Last login updated

### Test Case 4.3: Invalid Phone Number
**Objective**: Verify validation for phone numbers

**Steps**:
1. Enter invalid phone number: `123`
2. Enter phone number with invalid format

**Expected Results**:
- Validation error displayed
- OTP not sent
- User not registered/logged in

### Test Case 4.4: Invalid OTP Code
**Objective**: Verify OTP validation

**Steps**:
1. Enter valid phone number
2. Request OTP
3. Enter incorrect OTP code

**Expected Results**:
- Error message displayed
- User not authenticated
- Option to retry or request new OTP

---

## 5. Session Management

### Test Case 5.1: Session Persistence - Development
**Objective**: Verify session persists in development environment

**Steps**:
1. Log in successfully
2. Close and reopen browser
3. Navigate to application

**Expected Results**:
- User remains logged in
- Session restored from localStorage/sessionStorage
- User data accessible

### Test Case 5.2: Session Persistence - Published Domain
**Objective**: Verify session works on published domain

**Steps**:
1. Log in on *.replit.app domain
2. Refresh page
3. Open new tab to same domain

**Expected Results**:
- User remains logged in
- Server-side session active
- Cookie-based authentication working

### Test Case 5.3: Session Expiration
**Objective**: Verify session expires appropriately

**Steps**:
1. Log in successfully
2. Wait for session timeout period
3. Try to access protected content

**Expected Results**:
- Session expires after timeout
- User redirected to login
- Protected routes inaccessible

### Test Case 5.4: Manual Logout
**Objective**: Verify logout functionality

**Steps**:
1. Log in successfully
2. Click logout button
3. Try to access protected content

**Expected Results**:
- User logged out immediately
- Local storage/session cleared
- Server session invalidated
- Redirected to login page

---

## 6. Cross-Domain Authentication

### Test Case 6.1: Development to Published Domain
**Objective**: Verify auth works across domains

**Steps**:
1. Log in on development environment
2. Navigate to published domain
3. Check authentication state

**Expected Results**:
- Authentication handled appropriately
- User may need to re-authenticate on published domain
- No broken authentication state

### Test Case 6.2: Published to Development Domain
**Objective**: Verify reverse domain flow

**Steps**:
1. Log in on published domain
2. Open development environment
3. Check authentication state

**Expected Results**:
- Development environment detects published domain session
- Or prompts for re-authentication as expected

---

## 7. Error Scenarios

### Test Case 7.1: Network Connection Issues
**Objective**: Verify graceful handling of network failures

**Steps**:
1. Start authentication process
2. Disconnect network during authentication
3. Reconnect and retry

**Expected Results**:
- Appropriate error messages shown
- User can retry authentication
- No corrupted application state

### Test Case 7.2: Server Unavailable
**Objective**: Verify handling when backend is down

**Steps**:
1. Stop server
2. Attempt authentication
3. Restart server and retry

**Expected Results**:
- User-friendly error message
- Application doesn't crash
- Works normally when server restored

### Test Case 7.3: Multiple Authentication Attempts
**Objective**: Verify rate limiting and security

**Steps**:
1. Make multiple rapid authentication attempts
2. Try authentication with same email multiple times

**Expected Results**:
- Rate limiting applied appropriately
- Account not locked inappropriately
- Security measures active

---

## 8. Security Test Cases

### Test Case 8.1: XSS Protection
**Objective**: Verify XSS protection in authentication forms

**Steps**:
1. Enter malicious script in email field: `<script>alert('xss')</script>`
2. Enter script in name field
3. Submit forms

**Expected Results**:
- Scripts not executed
- Input properly sanitized
- No XSS vulnerabilities

### Test Case 8.2: SQL Injection Protection
**Objective**: Verify SQL injection protection

**Steps**:
1. Enter SQL injection attempts in email field: `'; DROP TABLE users; --`
2. Try injection in other form fields

**Expected Results**:
- No SQL injection successful
- Database queries parameterized
- Error handling doesn't reveal database structure

### Test Case 8.3: CSRF Protection
**Objective**: Verify CSRF token protection

**Steps**:
1. Attempt authentication requests without proper tokens
2. Try cross-origin authentication requests

**Expected Results**:
- CSRF tokens validated
- Cross-origin requests blocked appropriately
- Authentication endpoints protected

---

## 9. User Experience Test Cases

### Test Case 9.1: Loading States
**Objective**: Verify appropriate loading indicators

**Steps**:
1. Initiate authentication processes
2. Observe UI during authentication
3. Check loading states for slow connections

**Expected Results**:
- Loading spinners shown during processing
- Buttons disabled during submission
- Clear feedback for user actions

### Test Case 9.2: Error Messages
**Objective**: Verify user-friendly error messages

**Steps**:
1. Trigger various error conditions
2. Review error message clarity and helpfulness

**Expected Results**:
- Error messages are user-friendly
- Technical errors not exposed to users
- Clear guidance on how to resolve issues

### Test Case 9.3: Success Messages
**Objective**: Verify clear success feedback

**Steps**:
1. Complete successful authentication flows
2. Review success messages and confirmations

**Expected Results**:
- Clear confirmation of successful actions
- Appropriate success messages displayed
- User knows what happened and what to do next

---

## 10. Accessibility Testing

### Test Case 10.1: Keyboard Navigation
**Objective**: Verify authentication forms work with keyboard only

**Steps**:
1. Navigate authentication forms using only Tab/Enter keys
2. Complete authentication flows without mouse

**Expected Results**:
- All interactive elements accessible via keyboard
- Focus indicators visible
- Authentication completable without mouse

### Test Case 10.2: Screen Reader Compatibility
**Objective**: Verify forms work with screen readers

**Steps**:
1. Use screen reader to navigate authentication
2. Check form labels and instructions

**Expected Results**:
- Form fields properly labeled
- Error messages announced
- Instructions clear via screen reader

---

## Test Execution Checklist

### Pre-Testing Setup
- [ ] Clear browser cache and storage
- [ ] Verify test data availability
- [ ] Confirm both development and published environments accessible
- [ ] Prepare test user accounts

### During Testing
- [ ] Document actual results vs expected results
- [ ] Take screenshots of error states
- [ ] Note performance issues
- [ ] Record browser console errors
- [ ] Test on multiple browsers (Chrome, Firefox, Safari)

### Post-Testing
- [ ] Clean up test data
- [ ] Document any bugs found
- [ ] Verify critical authentication flows work
- [ ] Confirm security measures are effective

---

## Bug Reporting Template

**Test Case ID**: [e.g., Test Case 1.1]
**Bug Title**: [Brief description]
**Environment**: [Development/Published]
**Browser**: [Chrome/Firefox/Safari + version]
**Steps to Reproduce**: 
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Result**: [What should happen]
**Actual Result**: [What actually happened]
**Severity**: [Critical/High/Medium/Low]
**Screenshots**: [If applicable]

---

## Success Criteria

All authentication flows must:
- ✅ Work correctly for new and existing users
- ✅ Handle errors gracefully
- ✅ Maintain security standards
- ✅ Provide clear user feedback
- ✅ Function across all supported browsers and devices
- ✅ Meet accessibility requirements