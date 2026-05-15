# Musk Chat File Upload Structural Fix

## Problem Summary
The Musk Chat file upload handlers (`handleResumeUpload` and `handlePitchDeckUpload`) were returning 400 Bad Request errors in production while testing appeared to work. The root cause was a fragile middleware architecture that conditionally applied the `express-fileupload` middleware based on the `content-type` header.

## Root Causes Identified

### 1. **Conditional Middleware Application (Index.ts)**
**Issue**: The middleware was conditionally applied only when a request had `multipart/form-data` in its content-type header:
```typescript
app.use((req, res, next) => {
  if (req.headers['content-type']?.includes('multipart/form-data')) {
    return fileUpload({...})(req, res, next);
  }
  next(); // Non-multipart requests skip the middleware entirely
});
```

**Problem**: This created a race condition and unpredictable behavior where:
- Request streams might be partially consumed before middleware applied
- No fallback for content-type header parsing issues
- Middleware not guaranteed to process multipart data consistently

### 2. **File Extraction Logic (Routes-musk.ts)**
**Issues**:
- No proper error handling for missing file data
- Fallback between `tempFilePath` and `data` buffer was inconsistent
- No validation that extracted buffer was valid before processing
- Missing detailed logging for debugging

### 3. **FormData Parsing Inconsistency**
**Issue**: The frontend sends FormData correctly, but backend wasn't reliably receiving it due to:
- Conditional middleware not applying to all multipart requests
- No guaranteed order of middleware execution
- Body parsing middleware (express.json/urlencoded) potentially interfering

## Solutions Implemented

### 1. **Global express-fileupload Middleware (server/index.ts:502)**
**Fixed**: Applied middleware globally to all requests (express-fileupload only processes multipart internally):
```typescript
app.use(fileUpload({
  limits: { fileSize: 25 * 1024 * 1024 },
  useTempFiles: true,
  tempFileDir: tmpDir,
  createParentPath: true,
  debug: true,
  abortOnLimit: true,
  safeFileNames: true,
  preserveExtension: true,
  responseOnLimit: 'File size exceeds maximum allowed (25MB)',
  responseOnAbortData: 'File upload was aborted'
}));
```

**Benefits**:
- Guarantees middleware applies to all requests
- express-fileupload internally skips non-multipart requests
- No race conditions or stream consumption issues
- Consistent request handling across all routes

### 2. **Improved File Extraction Logic (server/routes-musk.ts:773-855)**

#### Resume Upload Handler Improvements:
```typescript
// Enumerate all strategies for retrieving file data
if (resumeFile.tempFilePath && fs.existsSync(tempPath)) {
  // Primary: Read from temp file (production-safe)
  pdfBuffer = fs.readFileSync(tempPath);
} else if (resumeFile.data) {
  // Fallback: Use data buffer if temp file unavailable
  pdfBuffer = resumeFile.data;
} else {
  throw new Error('No PDF data available - neither temp file nor data buffer');
}

// Validate buffer before processing
if (!pdfBuffer || pdfBuffer.length === 0) {
  throw new Error('PDF buffer is empty or invalid');
}
```

#### Key Improvements:
- **Explicit validation**: Check file exists before reading
- **Proper fallback**: Try temp file first, fall back to buffer
- **Buffer validation**: Verify buffer exists and has content before extraction
- **Detailed logging**: Track which method was used for debugging
- **Type safety**: Handle both Buffer and data correctly

#### Pitch Deck Handler Improvements:
```typescript
try {
  let pdfBuffer: Buffer;

  // Try tempFilePath first (production-safe)
  if (pitchDeckFile.tempFilePath && fs.existsSync(pitchDeckFile.tempFilePath)) {
    pdfBuffer = fs.readFileSync(pitchDeckFile.tempFilePath);
  } else if (pitchDeckFile.data) {
    // Fallback to data buffer
    pdfBuffer = pitchDeckFile.data;
  } else {
    throw new Error('No PDF data available - temp file not created and no data buffer present');
  }

  // Validate before use
  if (!pdfBuffer || pdfBuffer.length === 0) {
    throw new Error('PDF buffer is empty or invalid');
  }
} catch (extractError) {
  // Detailed error messages for users
  return res.status(400).json({
    error: 'TEXT_EXTRACTION_FAILED',
    message: userMessage,
    hint: 'Make sure your PDF file is readable and contains actual content',
    technicalError: errorMessage // For debugging
  });
}
```

### 3. **Enhanced Error Handling**

Both handlers now include:
- **Source tracking**: Logs which data source was used (tempFilePath vs data)
- **Buffer validation**: Checks buffer exists and contains data
- **Detailed error types**: Specific messages for different failure modes
- **User-friendly messages**: Clear guidance on what went wrong
- **Technical errors**: Include in response for debugging

### 4. **Comprehensive Logging**

Added logging at key points:
```typescript
console.log(`[Resume Extract] Reading PDF from tempFilePath: ${tempPath}`);
console.log(`[Resume Extract] Successfully read PDF from temp file (${pdfBuffer.length} bytes)`);
console.log("[Resume Extract] File details:", {
  size: resumeFile.size,
  bufferLength: pdfBuffer?.length || 0,
  mimeType: resumeFile.mimetype,
  bufferType: typeof pdfBuffer,
  isBuffer: Buffer.isBuffer(pdfBuffer)
});
```

## File Upload Flow (End-to-End)

### Frontend (musk-chat-panel.tsx)
1. User selects file
2. Validation:
   - File type check (PDF/Word for resume, PDF for pitch deck)
   - File size check (5MB max)
3. FormData created:
   ```typescript
   const formData = new FormData();
   formData.append('file', file);
   formData.append('userId', userId.toString());
   ```
4. XMLHttpRequest sends to `/api/musk/resume-upload` or `/api/musk/pitchdeck-upload`
5. Request includes automatic `multipart/form-data` content-type header

### Backend Middleware (index.ts:502-516)
1. Global fileUpload middleware receives request
2. express-fileupload checks if multipart/form-data
3. If multipart: parses form data and populates `req.files` and `req.body`
4. If not multipart: passes through unchanged
5. Both cases continue to route handler

### Route Handler (routes-musk.ts)
1. **Resume Upload Handler (line 654)**:
   - Extract userId from req.body
   - Verify userId resolves to valid user
   - Check req.files exists
   - Get file from req.files.file or req.files.resume
   - Validate file type and size
   - Extract text from PDF/DOCX/TXT
   - Call ResumeScorerService.analyzeResume()
   - Store context in database
   - Return analysis with scores

2. **Pitch Deck Upload Handler (line 1079)**:
   - Similar flow but for pitch deck analysis
   - Only accepts PDF files
   - Calls analyzePitchDeck() instead of analyzeResume()

## Testing Recommendations

### Unit Tests
```typescript
// Test FormData parsing
POST /api/musk/resume-upload
Content-Type: multipart/form-data; boundary=...
[Binary PDF data]
userId=123

// Expected: 200 with analysis result
```

### Integration Tests
1. Test with actual PDF files (1-10 page resumes)
2. Test with corrupted PDFs (should fail gracefully)
3. Test with oversized files (should fail gracefully)
4. Test with invalid userId (should return 400)
5. Test progress tracking (XMLHttpRequest.upload.onprogress)

### Load Testing
- Simulate concurrent file uploads
- Verify tempFileDir has space for concurrent uploads
- Ensure cleanup of temp files after upload

## Files Modified

1. **server/index.ts** (lines 502-516)
   - Changed: Global fileUpload middleware configuration
   - Impact: Ensures consistent multipart parsing across all requests

2. **server/routes-musk.ts** (lines 654-1025, 1079-1225)
   - Changed: handleResumeUpload and handlePitchDeckUpload implementations
   - Impact: Improved file extraction, error handling, and logging

## Deployment Notes

### Prerequisites
- Ensure `tmpDir` directory exists and is writable (created in index.ts line 65)
- Verify file upload size limits match client-side limits
- Check disk space for temp file storage during uploads

### Backward Compatibility
- ✅ No breaking changes to API endpoints
- ✅ No changes to request/response format
- ✅ Existing clients continue to work
- ✅ Fallback between temp files and buffers handles both cases

### Monitoring
- Watch for "File upload was aborted" or "File size exceeds" errors
- Monitor temp directory disk usage
- Track extraction success/failure rates by file type
- Alert on repeated TEXT_EXTRACTION_FAILED errors

## Related Documentation
- See QUANTUM_CARD_ACTIVATION_FIX.md for card unlock system
- See REFERRAL_SYSTEM_FIX.md for share tracking
- See Node v22 migration notes for database driver changes
