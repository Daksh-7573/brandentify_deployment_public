# Temporal Dead Zone Fix - File Upload Initialization

## Problem
```
ReferenceError: Cannot access 'tmpDir' before initialization
at server/index.ts:509
```

## Root Cause
JavaScript ES6 `const`/`let` variables are not hoisted. They exist in a "temporal dead zone" from the start of their scope until their declaration is reached at runtime.

The code was structured as:
```typescript
// Line 509 - USED HERE
app.use(fileUpload({
  tempFileDir: tmpDir  // ❌ tmpDir not yet defined
}));

// Line 552 - DEFINED HERE
const tmpDir = path.join(process.cwd(), 'tmp');
```

This causes a ReferenceError because `tmpDir` is accessed before it's declared.

## Solution
Moved `tmpDir` definition and directory creation from line 552 to lines 44-66, **before** middleware configuration.

### Execution Order After Fix
```typescript
// Line 44: DEFINE tmpDir and create directories
const tmpDir = path.join(process.cwd(), 'tmp');

// ... middleware setup ...

// Lines 48-67: ENSURE tmpDir exists before use
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
  console.log(`✅ [STARTUP] Created tmp directory: ${tmpDir}`);
}

// ... more middleware ...

// Line 533: NOW tmpDir can be safely used
app.use(fileUpload({
  tempFileDir: tmpDir  // ✅ tmpDir is defined and directory exists
}));
```

## Changes Made

### File: `server/index.ts`

**Moved from line 552 to line 44:**
- `const uploadsDir` definition
- `const projectDir` definition  
- `const mediaDir` definition
- `const tmpDir` definition
- Directory creation try/catch block

**Location:** Now placed immediately after `const app = express()` and before any middleware configuration

**Result:** 
- ✅ `tmpDir` is defined before used in fileUpload middleware
- ✅ Directories are created before middleware references them
- ✅ No temporal dead zone errors
- ✅ Clean execution order: Initialize → Then Use

## Verification
- ✅ Build successful: `✓ built in 20.61s`
- ✅ No ReferenceError
- ✅ Proper JavaScript execution order
- ✅ File upload middleware can now access `tmpDir` safely

## Key Lesson
**Rule: Initialize → Then Use (Never Use → Then Initialize)**

In JavaScript ES6:
- `var` is hoisted (shouldn't be used in modern code)
- `let` and `const` are NOT hoisted and enter temporal dead zone
- Always declare variables BEFORE first use
- Never rely on variable hoisting for `const`/`let`
