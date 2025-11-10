# Musk AI Chat - QA Functional Test Cases

## Test Environment
- **Feature**: Musk AI Career Assistant Chat
- **AI Provider**: VPS Ollama (llama3.2:1b) at http://65.20.73.122:11434
- **Fallback**: OpenAI GPT-4 (if VPS unavailable)
- **Location**: Accessible via Musk AI chat panel/button across the platform

---

## Test Case 1: Initial Chat Opening - Personalized Questions Load

**Test ID**: MUSK-001  
**Priority**: High  
**Type**: Functional

### Prerequisites
- User is logged in
- User has profile data: work experience, skills, education (at least 1 entry each)

### Test Steps
1. Navigate to any page with Musk AI chat button
2. Click the Musk AI chat button/icon
3. Observe the chat panel opening

### Expected Results
- ✅ Chat panel opens with welcome message: "Hi there! I'm Musk, your AI career assistant..."
- ✅ Initially shows NO quick response questions (empty state for 1-2 seconds)
- ✅ After 1-3 seconds, 4 personalized suggestion questions appear
- ✅ Questions reference actual user data (company name, skills, years of experience, role, or industry)
- ✅ Questions are NOT generic (should NOT be "What career advice can you offer?", "Analyze my resume", etc.)

### Sample Personalized Questions
**For Mid-Level Software Engineer (5 years at Google):**
- "With your React expertise and 5 years at Google, should you target Staff Engineer or Tech Lead?"
- "How can you leverage your Google experience to break into FAANG+ companies?"

**For Entry-Level Designer:**
- "With Computer Science + UX design skills, what's your optimal career path in tech?"
- "How can you accelerate growth from Junior Designer to mid-level roles?"

---

## Test Case 2: AI Response Generation

**Test ID**: MUSK-002  
**Priority**: High  
**Type**: Functional

### Prerequisites
- User is logged in
- Chat panel is open

### Test Steps
1. Type a question in the input field (e.g., "How can I improve my career?")
2. Click Send button or press Enter
3. Observe AI response

### Expected Results
- ✅ User message appears immediately in chat
- ✅ "Musk is thinking..." indicator appears
- ✅ AI response appears within 5-15 seconds
- ✅ Response is personalized to user's profile (mentions their industry, role, or goals)
- ✅ After AI response, 3-4 new follow-up questions appear below the message
- ✅ Follow-up questions are contextually relevant to the conversation

---

## Test Case 3: Click Suggested Question

**Test ID**: MUSK-003  
**Priority**: High  
**Type**: Functional

### Prerequisites
- Chat panel is open
- Personalized questions are visible

### Test Steps
1. Click on one of the 4 suggested questions
2. Observe behavior

### Expected Results
- ✅ Clicked question appears as user message in chat
- ✅ AI processes the question automatically
- ✅ AI response appears with personalized guidance
- ✅ New contextual follow-up questions appear
- ✅ Questions are updated based on conversation context

---

## Test Case 4: Resume Upload and Analysis

**Test ID**: MUSK-004  
**Priority**: High  
**Type**: Functional

### Prerequisites
- User is logged in
- Chat panel is open
- PDF resume file available (valid PDF, 1-5 pages)

### Test Steps
1. Click the paperclip/upload icon
2. Select "Upload Resume"
3. Choose a PDF resume file
4. Observe upload and analysis

### Expected Results
- ✅ Upload progress indicator appears
- ✅ "Analyzing your resume..." message shows
- ✅ Analysis completes within 10-20 seconds
- ✅ AI provides detailed feedback about:
  - Resume strengths
  - ATS compatibility
  - Impact metrics
  - Missing elements
  - Improvement suggestions
- ✅ Resume context is saved for future questions
- ✅ Follow-up questions reference resume content (e.g., "How can I quantify my React projects better?")

---

## Test Case 5: Career Stage Detection

**Test ID**: MUSK-005  
**Priority**: Medium  
**Type**: Functional

### Test Data
Test with 4 different user profiles:

**Profile 1: Entry-Level (0-3 years experience)**
- Job Title: "Junior Developer"
- Years of Experience: 1 year

**Profile 2: Mid-Level (3-7 years experience)**
- Job Title: "Software Engineer"
- Years of Experience: 5 years

**Profile 3: Senior-Level (7-12 years experience)**
- Job Title: "Senior Product Manager"
- Years of Experience: 9 years

**Profile 4: Executive (12+ years experience)**
- Job Title: "VP of Engineering"
- Years of Experience: 15 years

### Test Steps
1. Log in with each test profile
2. Open Musk AI chat
3. Observe personalized questions

### Expected Results

**Entry-Level Questions:**
- ✅ Focus on skill building and career foundations
- ✅ Examples: "What complementary skills accelerate [industry] careers?"
- ✅ Examples: "How can I accelerate growth from [role] to senior roles?"

**Mid-Level Questions:**
- ✅ Focus on specialization vs. management decisions
- ✅ Examples: "After X years as [role], should I aim for Staff/Lead or management?"
- ✅ Examples: "How do I transition from [role] to leadership positions?"

**Senior-Level Questions:**
- ✅ Focus on leadership and strategy
- ✅ Examples: "How can I leverage [expertise] to move into leadership?"
- ✅ Examples: "With X years experience, should I specialize deeper or expand to management?"

**Executive Questions:**
- ✅ Focus on C-suite positioning and thought leadership
- ✅ Examples: "With X years in [industry], how do I position for C-suite roles?"
- ✅ Examples: "What's the path from [role] to executive sponsor or board member?"

---

## Test Case 6: Conversation Context Awareness - Resume Context

**Test ID**: MUSK-006  
**Priority**: Medium  
**Type**: Functional

### Prerequisites
- Log in as **Sarah Johnson** (Mid-Level PM at Google, 5 years exp)
- Profile must have: Title, Industry, 2+ work experiences, 5+ skills
- Navigate to page with Musk AI chat button
- Chat panel is closed initially

### Detailed Test Steps
1. **Open chat panel**
   - Click Musk AI chat button
   - Wait 3 seconds for personalized questions to load
   - **Verify**: 4 personalized questions appear

2. **Type resume-related question**
   - In input field, type: "I'm working on my resume"
   - Click Send button (or press Enter)
   - **Verify**: Message appears in chat with "Sarah Johnson" user bubble on right side

3. **Observe AI response**
   - Wait for "Musk is thinking..." indicator
   - Wait for AI response (5-15 seconds)
   - **Verify**: AI response mentions resume-related advice
   - **Verify**: Response is personalized (mentions "Product Manager", "Google", or "5 years")

4. **Check follow-up questions**
   - Scroll to bottom of AI response
   - **Count**: Exactly 3-4 follow-up questions displayed
   - **Read each question carefully**

### Expected Results - Pass Criteria
✅ **All of the following must be true:**

1. **Follow-up questions are resume-focused** (at least 3 out of 4):
   - Contains keywords: "resume", "metrics", "ATS", "achievements", "quantify", "impact", "experience"
   
2. **Questions reference user's actual data** (at least 2 out of 4):
   - Mentions "Product Manager" OR "PM" OR user's title
   - Mentions "Google" OR user's company
   - Mentions "5 years" OR references mid-level experience
   - Mentions specific skills from profile (e.g., "Product Strategy", "Agile")

3. **Example acceptable questions:**
   - "As a Product Manager with 5 years experience, what metrics should highlight my impact?"
   - "How can Product Strategy skills be quantified for ATS systems in Technology?"
   - "Should I emphasize my progression at Google or depth of PM experience?"
   - "What resume format works best for mid-level Technology roles?"

4. **Questions are NOT generic** (reject if you see):
   - ❌ "What should I put on my resume?"
   - ❌ "How do I write a good resume?"
   - ❌ "What are resume best practices?"

### Test Variations

**Variation A: Job Search Context**
- Step 2: Type "I'm looking for a new job"
- Expected: Questions about salary, companies, interview prep, positioning
- Example: "What's the typical salary range for mid-level Product Manager roles in Technology?"

**Variation B: Skill Development Context**
- Step 2: Type "I want to learn new skills"
- Expected: Questions about certifications, learning paths, complementary skills
- Example: "With Product Strategy foundation, what complementary skills accelerate Technology careers?"

**Variation C: Networking Context**
- Step 2: Type "I need to expand my network"
- Expected: Questions about thought leadership, events, connections, visibility
- Example: "As a Product Manager at Google, who should I connect with in Technology?"

### Pass/Fail Criteria
- **PASS**: At least 3 out of 4 questions meet criteria 1-3 above
- **FAIL**: Questions are generic OR don't reference user data OR not contextually relevant

---

## Test Case 7: Empty or Incomplete Profile

**Test ID**: MUSK-007  
**Priority**: Medium  
**Type**: Negative/Edge Case

### Test Setup - Create Empty Profile User
1. **Register new account** with these details:
   - Email: `qa.empty.profile@test.com`
   - Name: `Empty Profile User`
   - Password: `Test123!`

2. **Leave profile incomplete** - DO NOT fill:
   - ❌ No Title
   - ❌ No Industry
   - ❌ No Work Experience
   - ❌ No Skills
   - ❌ No Education
   - ❌ No Projects
   - ✅ Only: Name, Email (basic auth data)

### Detailed Test Steps
1. **Log in with empty profile user**
   - Email: `qa.empty.profile@test.com`
   - Password: `Test123!`
   - **Verify**: Login successful, redirected to dashboard

2. **Navigate to any page**
   - Go to Dashboard, Profile, or Pulses page
   - **Verify**: Musk AI chat button visible

3. **Open Musk AI chat**
   - Click Musk AI chat button
   - **Verify**: Chat panel slides in from right
   - Wait 3 seconds for questions to load

4. **Check for errors**
   - Open browser DevTools Console (F12)
   - Look for JavaScript errors
   - **Verify**: No errors related to "undefined", "null", or "Cannot read property"

5. **Observe personalized questions**
   - Count number of questions displayed
   - Read each question text
   - **Verify**: Exactly 4 questions appear

6. **Test AI interaction**
   - Type: "What should I focus on first?"
   - Click Send
   - Wait for AI response (5-15 seconds)
   - **Verify**: Response received without errors

### Expected Results - Pass Criteria
✅ **All must be true:**

1. **Chat opens without errors**
   - No JavaScript console errors
   - No blank screen or "500 error" messages
   - Chat UI renders completely

2. **4 questions appear** (even with empty profile):
   - Questions are helpful and actionable
   - Questions encourage profile completion
   
3. **Questions are appropriately generic** (accept these):
   - ✅ "How can I improve my professional profile?"
   - ✅ "What career opportunities should I be exploring?"
   - ✅ "How can I stand out in my industry?"
   - ✅ "Which portfolio layout is best for my profile?"
   - ✅ "What skills should I develop to advance my career?"

4. **Questions do NOT reference missing data** (reject these):
   - ❌ "With your undefined years at undefined..."
   - ❌ "As a null working at null..."
   - ❌ "Should you leverage your  experience..." (empty string)

5. **AI responses work normally**
   - Responses arrive within 15 seconds
   - No error messages like "Failed to generate response"
   - Responses are helpful and encourage profile completion

### Pass/Fail Criteria
- **PASS**: Chat works, 4 questions appear, no errors, questions are generic but helpful
- **FAIL**: Any JavaScript errors, fewer than 4 questions, questions reference "undefined/null"

---

## Test Case 8: VPS Ollama Fallback

**Test ID**: MUSK-008  
**Priority**: High  
**Type**: Fallback/Error Handling

### Prerequisites
- Log in as **Marcus Williams** (Senior UX Designer at Apple, 9 years exp)
- VPS Ollama must be unavailable (see Test Setup below)

### Test Setup - Simulate VPS Failure
**Option A: Network Block (Recommended)**
1. Open browser DevTools (F12) → Network tab
2. Add request blocking rule: `*65.20.73.122*`
3. Verify rule is active

**Option B: Coordinate with DevOps**
1. Request temporary VPS shutdown for testing window
2. Confirm endpoint `http://65.20.73.122:11434` returns connection timeout

### Detailed Test Steps

**Part 1: Question Generation Fallback**
1. **Open Musk AI chat**
   - With VPS blocked, click Musk AI button
   - **Start timer**: Note current time
   - Wait for questions to load

2. **Measure load time**
   - **Stop timer** when questions appear
   - **Record**: Time taken (should be <3 seconds)
   - **Verify**: 4 questions displayed

3. **Inspect question quality**
   - Read each of the 4 questions carefully
   - **Verify**: Questions reference Marcus's actual data
   - Look for: "Apple", "UX Designer", "9 years", "senior", "Design", "Figma"

4. **Check browser console**
   - Open DevTools Console (F12)
   - Look for log: `[Contextual Suggestions] VPS Ollama not available, using enriched fallback`
   - **Verify**: No red error messages displayed to user

**Part 2: AI Response Fallback**
5. **Send a test message**
   - Type: "What should I focus on to reach principal designer level?"
   - Click Send
   - **Verify**: Message sent successfully

6. **Observe response behavior**
   - Wait for "Musk is thinking..." indicator
   - **Start timer**: Note response start time
   - Wait for AI response

7. **Check response source**
   - In DevTools Console, look for:
     - `[AI] Using OpenAI fallback` OR
     - `[AI] Primary Ollama unavailable`
   - **Verify**: Response arrives (may be slower, 10-20 seconds)

8. **Validate response quality**
   - **Verify**: Response is personalized to Marcus (mentions UX, design, Apple, or senior level)
   - **Verify**: Response is helpful and actionable
   - **Verify**: No error message shown to user like "AI service unavailable"

### Expected Results - Pass Criteria
✅ **All must be true:**

1. **Personalized questions load successfully**
   - Load time: <3 seconds
   - Count: Exactly 4 questions
   - Quality: NOT generic

2. **Questions reference actual user data** (at least 2 out of 4):
   - ✅ "With 9 years as Senior UX Designer at Apple..."
   - ✅ "How can Figma expertise help reach principal level..."
   - ✅ "Should you leverage Apple experience for..."
   - ✅ "As a senior-level Design professional..."

3. **Questions are NOT generic** (reject if you see):
   - ❌ "How can I improve my career?"
   - ❌ "What skills should I learn?"
   - ❌ "What are the best career tips?"

4. **AI responses work** (with fallback):
   - Response arrives (even if slower)
   - Response is personalized
   - No user-facing error messages

5. **User experience is seamless**
   - No indication of service degradation
   - No "Service Unavailable" errors
   - Chat remains fully functional

### Pass/Fail Criteria
- **PASS**: Questions load with user data, AI responds (via fallback), no errors visible to user
- **FAIL**: Generic questions, no AI response, or user sees error messages

### Cleanup
- Remove network blocking rule after test
- Verify VPS Ollama is restored for subsequent tests

---

## Test Case 9: Resume Context Persistence

**Test ID**: MUSK-009  
**Priority**: Medium  
**Type**: Functional

### Prerequisites
- Log in as **Alex Chen** (Junior Frontend Developer, 1.5 years exp)
- Have a test resume PDF ready (name it: `alex_chen_resume.pdf`)
- Resume should contain: React, JavaScript skills, 1.5 years experience

### Detailed Test Steps

**Part 1: Upload Resume**
1. **Open Musk AI chat**
   - Click Musk AI chat button
   - Wait for chat panel to open
   - **Verify**: Chat panel visible

2. **Upload resume file**
   - Click paperclip icon (upload button)
   - Select "Upload Resume" from menu
   - Choose file: `alex_chen_resume.pdf`
   - **Verify**: Upload progress bar appears
   - **Verify**: "Analyzing your resume..." message shows

3. **Wait for analysis**
   - **Start timer**: Note analysis start time
   - Wait for analysis to complete
   - **Stop timer**: Should complete in <20 seconds
   - **Verify**: AI message appears with resume feedback

4. **Ask resume-related question**
   - Type: "What are the strongest parts of my resume?"
   - Click Send
   - Wait for AI response
   - **Verify**: Response references specific resume content (React projects, 1.5 years, etc.)
   - **Take screenshot** of this response for comparison

**Part 2: Test Context Persistence**
5. **Close chat panel**
   - Click X button to close chat
   - **Verify**: Chat panel closes/slides out
   - **DO NOT**: Refresh page or log out (stay in same session)

6. **Wait 10 seconds**
   - Count to 10
   - Browse other parts of the app (optional)

7. **Reopen chat panel**
   - Click Musk AI chat button again
   - **Verify**: Chat panel reopens
   - **Verify**: Previous conversation history is visible
   - **Verify**: Your previous messages and AI responses are still there

8. **Ask follow-up question WITHOUT re-uploading**
   - Type: "Based on my resume, what should I improve?"
   - Click Send
   - Wait for AI response (5-15 seconds)

9. **Validate context retention**
   - Read AI response carefully
   - **Verify**: Response references resume details WITHOUT you re-uploading
   - Look for mentions of: React, JavaScript, 1.5 years, specific projects
   - **Verify**: Response doesn't say "Please upload your resume first"

### Expected Results - Pass Criteria
✅ **All must be true:**

1. **Resume uploads successfully**
   - Upload completes in <20 seconds
   - Analysis message appears
   - AI provides initial feedback

2. **Initial response references resume**
   - Mentions specific skills from resume (React, JavaScript)
   - References experience level (1.5 years, junior)
   - Provides actionable feedback

3. **Chat panel closes and reopens**
   - No errors during close/reopen
   - Conversation history persists

4. **Follow-up question works without re-upload**
   - AI responds to follow-up within 15 seconds
   - Response STILL references resume details
   - AI doesn't ask you to upload again

5. **Context retention examples** (accept responses like):
   - ✅ "Based on your 1.5 years of React experience, you should add more quantified achievements..."
   - ✅ "Your JavaScript projects show solid fundamentals. Consider adding metrics..."
   - ✅ "The skills you listed (React, JavaScript) are strong, but your resume could benefit from..."

6. **Reject if response says**:
   - ❌ "Please upload your resume so I can analyze it"
   - ❌ "I don't have your resume information"
   - ❌ Generic advice with no resume references

### Pass/Fail Criteria
- **PASS**: Resume context persists after close/reopen, follow-up works without re-upload
- **FAIL**: AI asks for re-upload OR doesn't reference resume details in follow-up

---

## Test Case 10: Multiple File Uploads

**Test ID**: MUSK-010  
**Priority**: Low  
**Type**: Functional

### Prerequisites
- Log in as **Sarah Johnson** (Mid-Level PM at Google)
- Prepare 2 test files:
  - `sarah_resume.pdf` (1-2 pages, Product Manager role)
  - `sarah_pitch_deck.pdf` (5-10 slides, product presentation)

### Detailed Test Steps

**Part 1: Upload Resume**
1. **Open Musk AI chat**
   - Click Musk AI button
   - **Verify**: Chat opens

2. **Upload resume**
   - Click paperclip icon
   - Select "Upload Resume"
   - Choose `sarah_resume.pdf`
   - **Verify**: Progress bar shows
   - Wait for "Analyzing your resume..." message
   - **Start timer**
   - Wait for analysis complete
   - **Stop timer**: Record time (should be <20 sec)
   - **Verify**: AI provides resume analysis
   - **Take screenshot**: Save as `resume_analysis.png`

**Part 2: Upload Pitch Deck**
3. **Upload pitch deck**
   - Click paperclip icon again
   - Select "Upload Pitch Deck"
   - Choose `sarah_pitch_deck.pdf`
   - **Verify**: Progress bar shows
   - Wait for "Analyzing your pitch deck..." message
   - **Start timer**
   - Wait for analysis complete
   - **Stop timer**: Record time (should be <30 sec for larger file)
   - **Verify**: AI provides pitch deck feedback
   - **Take screenshot**: Save as `pitch_deck_analysis.png`

**Part 3: Cross-Document Analysis**
4. **Ask comparison question**
   - Type: "Compare my resume and pitch deck alignment"
   - Click Send
   - Wait for AI response (10-20 seconds)
   - **Verify**: Response arrives

5. **Analyze response content**
   - Read response carefully
   - Look for references to BOTH documents
   - Check for comparative insights

6. **Test resume-specific follow-up**
   - Type: "What skills from my resume should I emphasize in my pitch?"
   - Click Send
   - **Verify**: Response references both resume AND pitch deck

7. **Test pitch deck-specific follow-up**
   - Type: "Does my pitch deck match my resume experience?"
   - Click Send
   - **Verify**: Response cross-references both documents

### Expected Results - Pass Criteria
✅ **All must be true:**

1. **Both files upload successfully**
   - Resume upload: <20 seconds
   - Pitch deck upload: <30 seconds
   - No upload errors
   - Both analysis messages appear

2. **AI analyzes both documents**
   - Resume analysis mentions: skills, experience, achievements
   - Pitch deck analysis mentions: product concept, market, team, financials

3. **Comparison response references BOTH documents** (examples):
   - ✅ "Your resume shows 5 years in Product Management, which aligns well with the 'Experienced Team' slide in your pitch deck"
   - ✅ "The Google experience on your resume adds credibility to your market analysis in the deck"
   - ✅ "Your resume highlights Agile skills, but your pitch deck doesn't emphasize your execution methodology"

4. **Cross-document insights provided** (at least 2 of these):
   - Alignment: What matches between resume and deck
   - Gaps: What's in one but missing from the other
   - Recommendations: How to strengthen both
   - Credibility: How resume strengthens pitch (or vice versa)

5. **Follow-up questions work**
   - AI maintains context of both documents
   - Can discuss either document or both
   - No need to re-upload

### Pass/Fail Criteria
- **PASS**: Both upload, AI references both in comparison, cross-document insights provided
- **FAIL**: Upload fails, AI can't access both documents, or only discusses one at a time

---

## Test Case 11: Long Conversation Flow

**Test ID**: MUSK-011  
**Priority**: Medium  
**Type**: Performance

### Prerequisites
- Log in as **Jennifer Lee** (VP Engineering at Microsoft, 15 years)
- Fresh chat session (clear any existing conversations)
- Stopwatch or timer ready

### Detailed Test Steps

**Preparation**
1. **Open Musk AI chat**
   - Click Musk AI button
   - **Verify**: Chat opens with welcome message
   - **Verify**: 4 personalized questions appear

**Conversation Flow (15 messages total)**
2. **Message 1**: Click first suggested question
   - **Verify**: Question auto-sends
   - Wait for AI response
   - **Verify**: 3-4 new follow-up questions appear

3. **Message 2**: Type "What skills should executive leaders prioritize?"
   - Click Send
   - **Start timer**: Note response time
   - **Stop timer** when response arrives
   - **Record**: Response time (should be <15 sec)

4. **Message 3**: Click one of the new suggested questions
   - **Verify**: Response arrives
   - **Verify**: New questions update

5. **Messages 4-10**: Continue conversation naturally
   - Alternate between clicking suggestions and typing custom questions
   - Test questions:
     - "How can I build a stronger C-suite network?"
     - "What's the best way to mentor VPs?"
     - "Should I focus on technical depth or business strategy?"
     - "How do I position for board roles?"
     - "What thought leadership topics work best?"
     - "How can I improve executive presence?"
     - "What metrics matter most for VPs?"

6. **After message 10**: Check scroll behavior
   - **Verify**: Chat auto-scrolls to latest message
   - Manually scroll up to see old messages
   - **Verify**: Scroll works smoothly
   - Scroll back to bottom
   - **Verify**: Can see latest message

7. **Messages 11-15**: Continue conversation
   - Type longer message (2-3 sentences)
   - Ask complex question: "Based on our discussion, what's my optimal path from VP to CTO or CEO in the next 3-5 years?"
   - Click suggested questions
   - Ask follow-up: "Can you elaborate on that last point?"

8. **Performance check at message 15**
   - **Measure**: Time from clicking Send to AI response start
   - Open DevTools → Performance tab
   - **Check**: Memory usage (should not spike excessively)
   - **Verify**: No lag when typing in input field

9. **Context retention test**
   - Type: "Summarize the key advice you've given me today"
   - Click Send
   - **Verify**: AI references multiple topics from conversation
   - **Verify**: AI maintains context from messages 1-14

10. **Follow-up question evolution**
    - Compare questions at message 5 vs. message 15
    - **Verify**: Questions evolved based on conversation
    - **Verify**: Later questions are more specific to discussed topics

### Expected Results - Pass Criteria
✅ **All must be true:**

1. **Performance remains stable**
   - Response time for message 15: Still <15 seconds
   - No noticeable lag or delay
   - No browser freezing or slowdown
   - Input field remains responsive

2. **Scroll functionality works**
   - Auto-scroll to new messages
   - Manual scroll up/down works smoothly
   - No scroll jumping or glitches
   - Can view all 15+ messages by scrolling

3. **AI maintains context**
   - Responses reference earlier conversation points
   - AI doesn't repeat same advice
   - Summary (step 9) mentions multiple topics discussed

4. **Follow-up questions update contextually**
   - Early questions (message 2-5): Broad executive topics
   - Later questions (message 12-15): Specific to discussed topics
   - Example evolution:
     - Message 3: "How can I build executive presence?"
     - Message 13: "Based on your Microsoft experience, should you focus on cloud architecture or AI strategy for CTO positioning?"

5. **No degradation after 15 messages**
   - Chat UI still responsive
   - No memory leaks (check DevTools)
   - No JavaScript errors in console
   - Can continue conversation beyond 15 messages

### Performance Benchmarks
- **Response time**: Message 1 vs Message 15 should be within 3 seconds of each other
- **Typing lag**: Input field should have <100ms response when typing
- **Scroll smoothness**: 60 FPS when scrolling (check DevTools Performance)
- **Memory usage**: Should not exceed 200MB increase over 15 messages

### Pass/Fail Criteria
- **PASS**: All 15 messages work, performance stable, context maintained, scroll works
- **FAIL**: Lag after 10+ messages, context lost, scroll broken, or errors occur

---

## Test Case 12: Cross-Browser Compatibility

**Test ID**: MUSK-012  
**Priority**: Medium  
**Type**: Compatibility

### Prerequisites
- Same test user account accessible on all devices
- Use **Alex Chen** profile (Entry-level, complete profile)
- Test resume PDF ready for upload test

### Browser/Device Matrix

| Browser | Version | OS | Device Type |
|---------|---------|----|----|
| Chrome | Latest stable | Windows/Mac | Desktop |
| Edge | Latest stable | Windows | Desktop |
| Firefox | Latest stable | Windows/Mac | Desktop |
| Safari | Latest stable | macOS | Desktop |
| Mobile Chrome | Latest | Android 12+ | Mobile |
| Mobile Safari | Latest | iOS 15+ | Mobile |

### Detailed Test Steps (Repeat for EACH browser)

**Part 1: Desktop Browsers (Chrome, Edge, Firefox, Safari)**

1. **Open browser and log in**
   - Navigate to: `[your-app-url]`
   - Log in with Alex Chen credentials
   - **Verify**: Login successful
   - **Take screenshot**: `[browser]_login.png`

2. **Open Musk AI chat**
   - Click Musk AI chat button
   - **Verify**: Chat panel slides in from right
   - **Verify**: No rendering issues (overlapping text, broken layout)
   - **Take screenshot**: `[browser]_chat_open.png`

3. **Check personalized questions**
   - Wait 3 seconds for questions to load
   - **Count**: Should be exactly 4 questions
   - **Verify**: All question text is readable (no truncation)
   - **Verify**: Questions reference user data
   - **Take screenshot**: `[browser]_personalized_questions.png`

4. **Test click interaction**
   - Click first suggested question
   - **Verify**: Question auto-sends
   - **Verify**: "Musk is thinking..." appears
   - Wait for AI response
   - **Verify**: Response displays correctly
   - **Verify**: Follow-up questions appear

5. **Test typing and sending**
   - In input field, type: "What skills should I focus on?"
   - **Verify**: Text appears as you type (no lag)
   - Press Enter (or click Send)
   - **Verify**: Message sends
   - **Verify**: Response arrives

6. **Test file upload (Desktop only)**
   - Click paperclip icon
   - Select "Upload Resume"
   - Choose test PDF file
   - **Verify**: File picker opens correctly
   - **Verify**: Upload progress shows
   - **Verify**: Analysis completes
   - **Record**: Upload time

7. **Test scrolling**
   - If chat has 5+ messages, scroll up
   - **Verify**: Smooth scrolling
   - Scroll to bottom
   - **Verify**: Auto-scroll works for new messages

8. **Test close/reopen**
   - Click X to close chat
   - **Verify**: Chat closes smoothly
   - Click Musk AI button again
   - **Verify**: Chat reopens with conversation history

**Part 2: Mobile Browsers (Mobile Chrome, Mobile Safari)**

9. **Mobile login**
   - Open mobile browser
   - Navigate to app URL
   - Log in with Alex Chen
   - **Verify**: Login works on mobile

10. **Mobile chat interaction**
    - Tap Musk AI chat button
    - **Verify**: Chat panel opens (should take full width on mobile)
    - **Verify**: All 4 questions are visible without horizontal scroll
    - **Verify**: Questions are tappable (good touch target size)

11. **Mobile typing test**
    - Tap input field
    - **Verify**: Mobile keyboard appears
    - Type a question using mobile keyboard
    - **Verify**: Text input works smoothly
    - Tap Send button
    - **Verify**: Message sends

12. **Mobile scroll test**
    - Have 5+ messages in conversation
    - Swipe up to scroll through messages
    - **Verify**: Scrolling is smooth (60fps)
    - **Verify**: No accidental page refresh (pull-to-refresh)

13. **Mobile file upload**
    - Tap paperclip icon
    - Select "Upload Resume"
    - **Verify**: File picker opens (iOS Files or Android picker)
    - Select PDF from device
    - **Verify**: Upload works on mobile
    - **Verify**: Progress bar displays

14. **Mobile orientation test**
    - Test in portrait mode (steps 10-13)
    - Rotate device to landscape
    - **Verify**: Chat adapts to landscape orientation
    - **Verify**: UI still usable in landscape

### Expected Results - Pass Criteria
✅ **For EACH browser/device:**

1. **Visual rendering**
   - No layout breaking
   - All text readable
   - Buttons/inputs properly sized
   - No overlapping elements

2. **Functional parity**
   - Questions load and display
   - Clicking/tapping works
   - AI responses arrive
   - File upload works (desktop/mobile)
   - Scroll works smoothly

3. **Mobile-specific**
   - Touch targets are ≥44x44px
   - Keyboard doesn't break layout
   - Orientation changes handled
   - No horizontal scrolling required

4. **Performance**
   - Question load: <3 seconds on all browsers
   - Response time: <15 seconds on all browsers
   - No lag when typing (all browsers)

### Browser-Specific Pass/Fail

| Browser | Chat Opens | Questions Load | Send Works | Upload Works | Result |
|---------|-----------|---------------|-----------|-------------|--------|
| Chrome | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | PASS/FAIL |
| Edge | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | PASS/FAIL |
| Firefox | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | PASS/FAIL |
| Safari | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | PASS/FAIL |
| Mobile Chrome | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | PASS/FAIL |
| Mobile Safari | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | PASS/FAIL |

### Overall Pass/Fail
- **PASS**: All 6 browsers/devices work with no critical issues
- **FAIL**: Any browser has broken functionality or visual issues

---

## Test Case 13: Special Characters in Input

**Test ID**: MUSK-013  
**Priority**: Low  
**Type**: Edge Case

### Prerequisites
- Log in as **Sarah Johnson** (Mid-level PM)
- Open fresh Musk AI chat

### Detailed Test Steps

**Test 1: Parentheses and Ampersands**
1. **Type message with special punctuation**
   - In input field, type: `How can I improve my skills? (React, Node.js & TypeScript)`
   - **Verify**: Text displays correctly in input field as you type
   - Click Send
   - **Verify**: Message appears in chat with all characters visible
   - **Verify**: Parentheses `(` `)` display correctly
   - **Verify**: Ampersand `&` displays correctly
   - Wait for AI response
   - **Verify**: AI understands and responds to all three skills mentioned

**Test 2: Emojis**
2. **Type message with emojis**
   - Type: `What's next for my career? 🚀💼`
   - **Verify**: Emojis render correctly in input field
   - Click Send
   - **Verify**: Message displays with emojis visible in chat bubble
   - **Verify**: 🚀 (rocket) and 💼 (briefcase) emojis render properly
   - Wait for AI response
   - **Verify**: AI responds to the career question (ignoring or acknowledging emojis appropriately)

**Test 3: Code Syntax (Backticks)**
3. **Type message with code formatting**
   - Type: `Should I learn \`async/await\` or \`Promises\`?`
   - **Verify**: Backticks and slashes display in input field
   - Click Send
   - **Verify**: Message appears with all characters
   - Wait for AI response
   - **Verify**: AI understands the technical question about JavaScript async patterns

**Test 4: Quotation Marks**
4. **Type message with quotes**
   - Type: `My boss said "you need to upskill" - what should I focus on?`
   - **Verify**: Double quotes display correctly
   - Click Send
   - **Verify**: Message displays with quotes intact
   - Wait for AI response
   - **Verify**: AI responds to upskilling question

**Test 5: URLs**
5. **Type message with URL**
   - Type: `I saw this job posting: https://example.com/jobs/pm-role - should I apply?`
   - **Verify**: URL displays in input field
   - Click Send
   - **Verify**: URL appears in chat (may be clickable link or plain text)
   - Wait for AI response
   - **Verify**: AI responds to job application question

**Test 6: Numbers and Symbols**
6. **Type message with numbers and symbols**
   - Type: `I earn $85K/year but want $120K+ in my next role. Realistic?`
   - **Verify**: Dollar signs `$`, letters `K`, plus `+` display correctly
   - Click Send
   - **Verify**: All numbers and symbols visible
   - Wait for AI response
   - **Verify**: AI understands salary context and provides relevant advice

**Test 7: Multiple Line Breaks (Enter key)**
7. **Type multi-line message**
   - Type: `I have three questions:`
   - Press Shift+Enter (line break, not send)
   - Type: `1. Career path?`
   - Press Shift+Enter
   - Type: `2. Salary expectations?`
   - Press Shift+Enter
   - Type: `3. Skills to learn?`
   - **Verify**: All lines visible in input field
   - Click Send (not Enter)
   - **Verify**: Message displays with line breaks preserved
   - Wait for AI response
   - **Verify**: AI addresses all three questions

**Test 8: Accented Characters**
8. **Type message with accented letters**
   - Type: `I'm working at café résumé - how can I grow my career?`
   - **Verify**: é (e-acute) displays correctly
   - Click Send
   - **Verify**: Accented characters render properly in chat
   - Wait for AI response
   - **Verify**: Response received without errors

### Expected Results - Pass Criteria
✅ **All must be true for EACH test:**

1. **Input field handles characters correctly**
   - All characters visible as typed
   - No character replacement or garbling
   - No input field freezing

2. **Message sends successfully**
   - Send button/Enter works
   - Message appears in chat within 1 second
   - All characters preserved in sent message

3. **Display rendering correct**
   - Special characters render properly: `() & ? " $ + /`
   - Emojis render as colored icons (not boxes/question marks)
   - Accented characters display correctly: `é à ñ`
   - URLs display (as link or text)
   - Multi-line messages preserve line breaks

4. **AI processes message correctly**
   - AI response arrives (no errors)
   - AI understands message content
   - Special characters don't break AI processing
   - Response is relevant to question asked

### Character Test Results Table

| Test | Character Type | Displays? | Sends? | AI Responds? | Pass/Fail |
|------|---------------|-----------|---------|-------------|-----------|
| 1 | `()` & `&` | ✅/❌ | ✅/❌ | ✅/❌ | PASS/FAIL |
| 2 | Emojis 🚀💼 | ✅/❌ | ✅/❌ | ✅/❌ | PASS/FAIL |
| 3 | Backticks `` ` `` | ✅/❌ | ✅/❌ | ✅/❌ | PASS/FAIL |
| 4 | Quotes `"` | ✅/❌ | ✅/❌ | ✅/❌ | PASS/FAIL |
| 5 | URLs | ✅/❌ | ✅/❌ | ✅/❌ | PASS/FAIL |
| 6 | Numbers/$ | ✅/❌ | ✅/❌ | ✅/❌ | PASS/FAIL |
| 7 | Line breaks | ✅/❌ | ✅/❌ | ✅/❌ | PASS/FAIL |
| 8 | Accents é | ✅/❌ | ✅/❌ | ✅/❌ | PASS/FAIL |

### Pass/Fail Criteria
- **PASS**: All 8 tests show characters display, send, and AI responds correctly
- **FAIL**: Any character causes display issues, send failure, or AI errors

---

## Test Case 14: Rapid Question Clicking

**Test ID**: MUSK-014  
**Priority**: Low  
**Type**: Stress Test

### Prerequisites
- Log in as **Marcus Williams** (Senior UX Designer)
- Fresh chat session with NO conversation history
- Stopwatch ready to measure timing

### Detailed Test Steps

**Setup**
1. **Open Musk AI chat**
   - Click Musk AI button
   - Wait for 4 personalized questions to appear
   - **Verify**: All 4 questions are clickable
   - **DO NOT** click anything yet

**Test 1: Double Click Same Question**
2. **Rapid double-click first question**
   - Identify the first suggested question
   - Click it twice as fast as possible (within 0.5 seconds)
   - **Observe**: What happens

3. **Check for duplicate messages**
   - Look at chat conversation area
   - **Count**: How many user messages with same text appear?
   - **Verify**: Should see only ONE user message (not two)

4. **Check AI response count**
   - Wait for AI response
   - **Count**: Number of AI responses
   - **Verify**: Should get only ONE AI response (not two)

**Test 2: Click Multiple Different Questions Rapidly**
5. **Reset chat** (close and reopen for fresh questions)
   - Close chat panel
   - Reopen Musk AI chat
   - Wait for 4 questions to appear

6. **Click 3 questions in rapid succession**
   - **Ready, set, go**:
     - Click question 1
     - Immediately click question 2 (within 0.5 sec)
     - Immediately click question 3 (within 0.5 sec)
   - **Total time**: All 3 clicks within 2 seconds

7. **Observe message behavior**
   - Look at chat area
   - **Count**: How many user messages appear?
   - **Expected**: Only 1 message (first click)
   - **Verify**: Questions 2 and 3 did NOT send

8. **Check for errors**
   - Open DevTools Console (F12)
   - Look for JavaScript errors (red messages)
   - **Verify**: No errors like "Cannot send message" or "Undefined"

**Test 3: Click While AI is Responding**
9. **Start a normal conversation**
   - Close and reopen chat for fresh questions
   - Click first suggested question
   - **Immediately** after clicking (don't wait for response):
     - Try clicking another suggested question
     - Try typing a message and clicking Send

10. **Observe behavior during AI thinking**
    - **Verify**: "Musk is thinking..." indicator is showing
    - **Verify**: Subsequent clicks are either:
      - Ignored (nothing happens) OR
      - Queued (sent after AI responds) OR
      - Disabled (buttons grayed out)
    - **Verify**: No duplicate messages appear

**Test 4: Spam Click Send Button**
11. **Type a message**
    - Type: "What should I focus on?"
    - **DO NOT** click Send yet

12. **Rapid-fire click Send button**
    - Click Send button 5 times rapidly (within 2 seconds)
    - **Observe**: What happens

13. **Check for duplicates**
    - **Count**: User messages in chat
    - **Verify**: Only ONE message sent (not 5)
    - **Verify**: Only ONE AI response arrives

**Test 5: Button State During Processing**
14. **Check button states**
    - Click a suggested question
    - **Immediately check**:
      - Are other suggestion buttons still clickable?
      - Is Send button still clickable?
      - Is input field still editable?
    
15. **Verify disabled state**
    - **Expected behavior** (one of these):
      - Buttons are disabled (grayed out) while AI thinking
      - Buttons are clickable but clicks are ignored
      - Error message if attempting to send while processing

### Expected Results - Pass Criteria
✅ **All must be true:**

1. **No duplicate messages from rapid clicking**
   - Double-click same question: Only 1 user message
   - Click 3 questions rapidly: Only 1 user message (first click)
   - Spam click Send: Only 1 message sent

2. **Appropriate handling of rapid input**
   - System ignores subsequent clicks OR
   - System queues messages OR
   - System disables buttons during processing
   - (Any of the above is acceptable, as long as no duplicates)

3. **No errors or crashes**
   - No JavaScript console errors
   - Chat UI doesn't break or freeze
   - No "Cannot send message" errors shown to user

4. **AI responds correctly**
   - Only 1 AI response per user message
   - AI response is for the FIRST clicked question
   - No confused or mixed responses

5. **Chat remains functional after stress test**
   - Can send normal messages after rapid clicking
   - Suggested questions still work
   - Input field still accepts text
   - Send button still works

### Rapid Click Test Results

| Test | Action | User Msgs | AI Responses | Errors? | Pass/Fail |
|------|--------|-----------|--------------|---------|-----------|
| 1 | Double-click same question | 1 (expected) | 1 (expected) | ✅/❌ | PASS/FAIL |
| 2 | Click 3 questions rapidly | 1 (expected) | 1 (expected) | ✅/❌ | PASS/FAIL |
| 3 | Click while AI responding | No new msgs | 1 (original) | ✅/❌ | PASS/FAIL |
| 4 | Spam Send button 5x | 1 (expected) | 1 (expected) | ✅/❌ | PASS/FAIL |
| 5 | Buttons disabled/handled | N/A | N/A | ✅/❌ | PASS/FAIL |

### Pass/Fail Criteria
- **PASS**: No duplicates in all tests, no errors, chat remains functional
- **FAIL**: Any test creates duplicate messages OR causes errors OR breaks chat

### Recovery Test
16. **Verify system recovery**
    - After all rapid clicking tests complete
    - Type a normal question: "What skills should I develop?"
    - Click Send (once, normally)
    - **Verify**: System works normally
    - **Verify**: AI response arrives as expected
    - **Result**: System fully recovered from stress test

---

## Automated Test Checklist

### Visual Regression Tests
- [ ] Chat panel layout renders correctly
- [ ] Suggested questions display properly
- [ ] Messages align correctly (user right, AI left)
- [ ] Upload button is visible and accessible
- [ ] Scrolling works with long conversations

### Accessibility Tests
- [ ] Chat is keyboard navigable (Tab, Enter, Esc)
- [ ] Screen readers can read messages
- [ ] Focus indicators are visible
- [ ] Color contrast meets WCAG standards
- [ ] All interactive elements have proper ARIA labels

### Performance Benchmarks
- [ ] Personalized questions load within 3 seconds
- [ ] AI response time < 15 seconds (VPS Ollama)
- [ ] Resume analysis completes < 20 seconds
- [ ] Chat panel opens < 500ms
- [ ] No memory leaks after 20+ messages

---

## Known Issues / Limitations

1. **VPS Ollama Response Time**: Responses may take 10-15 seconds during high load
2. **Resume File Size**: PDFs larger than 5MB may timeout
3. **Conversation Memory**: Limited to current session (resets on page reload)
4. **Supported File Types**: Only PDF files supported for resume/pitch deck

---

## Test Data Setup

### Test User Profiles

**User 1: Entry-Level Software Engineer**
- Name: Alex Chen
- Title: Junior Frontend Developer
- Company: Startup XYZ
- Years Experience: 1.5 years
- Skills: React, JavaScript, HTML/CSS
- Education: BS Computer Science
- Looking For: A Career Mentor

**User 2: Mid-Level Product Manager**
- Name: Sarah Johnson
- Title: Product Manager
- Company: Google
- Years Experience: 5 years
- Skills: Product Strategy, User Research, Agile, SQL
- Education: MBA, BS Engineering
- Looking For: A New Job

**User 3: Senior Designer**
- Name: Marcus Williams
- Title: Senior UX Designer
- Company: Apple
- Years Experience: 9 years
- Skills: Figma, User Research, Design Systems, Prototyping
- Education: BFA Design
- Looking For: Expand My Network

**User 4: Executive**
- Name: Jennifer Lee
- Title: VP of Engineering
- Company: Microsoft
- Years Experience: 15 years
- Skills: Leadership, Architecture, Team Building, Strategy
- Education: MS Computer Science
- Looking For: Industry Insights

---

## Bug Reporting Template

**Bug ID**: MUSK-BUG-XXX  
**Severity**: Critical / High / Medium / Low  
**Summary**: [Brief description]  
**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]

**Expected Result**: [What should happen]  
**Actual Result**: [What actually happens]  
**Screenshots**: [Attach if applicable]  
**Browser/Device**: [Chrome 120, Windows 11]  
**User Profile**: [Entry-level / Mid-level / Senior / Executive]

---

## Sign-Off Criteria

**Ready for Production Release**:
- [ ] All High priority test cases pass (MUSK-001 through MUSK-004, MUSK-008)
- [ ] No critical or high severity bugs
- [ ] Personalized questions load correctly for all career stages
- [ ] AI responses are accurate and personalized
- [ ] Fallback mechanisms work when VPS unavailable
- [ ] Cross-browser compatibility verified
- [ ] Performance benchmarks met
- [ ] Accessibility standards met (WCAG 2.1 AA)

---

**Document Version**: 1.0  
**Last Updated**: November 10, 2025  
**Prepared By**: Brandentifier Development Team  
**Review Status**: Ready for QA Testing
