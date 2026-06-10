# TrainMate Project Functionality Documentation

Last updated: 2026-06-10

This document explains how the main TrainMate features work in the current codebase.
It is intended to be a single reference for product, backend, and frontend teams.

## 1) High-Level Architecture

TrainMate is split into:

- Frontend app in frontend
- Backend API in trainmate-backend
- Firebase Auth + Firestore for identity and data
- Gemini, Cohere, Pinecone for AI, ranking, and retrieval
- Gmail (Nodemailer) and Google Calendar for outbound communication

Backend startup and route mounting are defined in trainmate-backend/server.js.

## 2) Core Feature Set ("Foo features")

### 2.1 CV Validation

Purpose:
- Validate that uploaded file is a real CV before roadmap generation.
- Redact sensitive text before advanced analysis.

API:
- POST /api/roadmap/validate-cv

Code path:
- Route: trainmate-backend/routes/roadmapRoutes.js
- Controller: validateUploadedCv in trainmate-backend/controllers/roadmap.controller.orchestrator.js
- Services:
  - trainmate-backend/services/cvParser.service.js
  - trainmate-backend/services/policy/policyEngine.service.js

How it works:
1. File is downloaded from cvUrl.
2. Size checks enforce minimum and maximum boundaries.
3. Text is extracted from PDF or DOCX.
4. PII redaction masks email, phone, date, and ID-like patterns.
5. Policy engine applies heuristic + LLM validation:
   - File type checks
   - Word count, structure, section keywords
   - Structured CV evidence (skills, roles, education)
6. Final result returns isValidCV, score, confidence, reason, issues.

Data impact:
- Validation result is stored in user onboarding fields and later trusted by roadmap generation.

### 2.2 Roadmap Generation Process

Purpose:
- Build personalized training roadmap modules from CV + company context.

API:
- POST /api/roadmap/generate

Code path:
- Route: trainmate-backend/routes/roadmapRoutes.js
- Controller: generateUserRoadmap in trainmate-backend/controllers/roadmap.controller.orchestrator.js
- Orchestration service: trainmate-backend/services/agentOrchestrator.service.js

How it works:
1. Validates user and onboarding completion.
2. Requires prior successful CV validation.
3. Checks existing roadmap and reuses it if already present.
4. Acquires short roadmap generation lock to avoid duplicate concurrent generations.
5. Parses CV and builds learning profile.
6. Runs orchestrator multi-agent flow:
   - Planning
   - Skill extraction and gap analysis
   - Retrieval from company knowledge
   - Roadmap generation
   - Validation
7. Stores roadmap modules in user roadmap subcollection with order and metadata.
8. Saves orchestration metadata in user doc.
9. Generates roadmap PDF and triggers notifications.

Output:
- Ordered modules with title, description, estimated days, and skills.

### 2.3 Roadmap Regeneration

Purpose:
- Replace a weak/failed module with smaller recovery modules.

API:
- POST /api/roadmap/regenerate

Code path:
- Route: trainmate-backend/routes/roadmapRoutes.js
- Controller: regenerateRoadmapModule in trainmate-backend/controllers/roadmap.controller.js

How it works:
1. Reads current roadmap and target module.
2. Refuses regeneration for already completed and passed modules.
3. Collects failure insights (weak concepts, attempts, score patterns).
4. Chooses split count dynamically (2 or 3 modules).
5. Splits available time into new estimated day distribution.
6. Generates replacement modules with AI; fallback generator is used if AI parse fails.
7. Deletes old target module and inserts new modules in same roadmap position.
8. Resequences following modules and resets lock/progress flags where needed.
9. Updates user weaknessAnalysis and resolves admin notification if notificationId is provided.

Important behavior:
- Regeneration is recovery-focused and preserves sequence continuity.

### 2.4 Quiz Generation and Attempt Handling

Purpose:
- Generate module quiz, evaluate answers, and enforce progression rules.

APIs:
- POST /api/quiz/generate
- POST /api/quiz/submit
- POST /api/quiz/admin-unlock
- POST /api/quiz/admin-pass-module
- POST /api/quiz/proctoring-violation

Code path:
- Route: trainmate-backend/routes/quizRoutes.js
- Controller: trainmate-backend/controllers/QuizController.js

How quiz generation works:
1. Pulls module context and relevant material.
2. Uses LLM and ranking logic for question set construction.
3. Stores generated quiz in module quiz/current.

How attempts are handled:
- Base max attempts constant is 3.
- Actual effective max can include admin override paths.
- Attempts are recorded under module quizAttempts subcollection and mirrored in module counters.
- On pass:
  - Module is marked completed/passed.
  - Next module can be unlocked.
- On fail:
  - Retry rules apply based on score and policy decisions.
  - When attempts are exhausted, module lock flow is triggered.
  - Admin notification and email can be sent for intervention.

Time-gate behavior:
- Quiz access is gated by module-time progress threshold (70 percent default).

### 2.5 Final Quiz

Purpose:
- Run a cross-module final certification assessment after module completion.

APIs:
- POST /api/quiz/final/open
- POST /api/quiz/final/generate
- POST /api/quiz/final/submit
- GET /api/quiz/final/report/:companyId/:deptId/:userId

Code path:
- Route: trainmate-backend/routes/quizRoutes.js
- Controller methods in trainmate-backend/controllers/QuizController.js

Rules:
- Max attempts: 2
- Pass threshold: 70
- Time window: 2 days
- Feature gating: Final certification quiz is restricted to License Pro inside controller logic.

Storage:
- finalQuiz/current for active state
- finalQuizAttempts for attempt history
- finalQuiz/current/results/latest for latest result snapshot

### 2.6 Certification

Purpose:
- Unlock certificate after passing final quiz.

How it works:
1. Final quiz submission computes result.
2. On passing score, system:
   - Sets certificateUnlocked
   - Stores certificateUnlockedAt
   - Stores certificateFinalQuizScore
   - Generates agentic certificate title and stores certificateFinalQuizTitle
3. Training summary report can be generated and downloaded.

Related report flow:
- downloadTrainingSummaryReport endpoint composes completion summary and serves PDF output path logic.

### 2.7 Fresher Chatbot

Purpose:
- AI learning assistant for each fresher.

APIs:
- POST /api/chat/init
- POST /api/chat
- POST /api/chat/feedback
- POST /api/chat/missed-dates
- POST /api/chat/artifacts

Code path:
- Route: trainmate-backend/routes/chatRoutes.js
- Controller: trainmate-backend/controllers/chatController.js

How it works:
- Retrieves contextual content from Pinecone and knowledge connectors.
- Uses Gemini for response generation.
- Applies relevance and policy guardrails.
- Stores memory and progress signals for personalization.
- Supports micro-assessment behaviors and attendance-related insights.

### 2.8 Company Admin Chatbot

Purpose:
- Provide company-side fresher analytics and actionable insights.

APIs:
- POST /api/company-chat/chat
- GET /api/company-chat/summary/:companyId
- GET /api/company-chat/top-performers/:companyId
- GET /api/company-chat/attention/:companyId

Code path:
- Route: trainmate-backend/routes/companyFresherChatRoutes.js
- Controller: trainmate-backend/controllers/companyFresherChatController.js

Outputs:
- Cohort summaries
- Top learner signals
- At-risk learners needing intervention

### 2.9 Statistics

Purpose:
- Provide aggregate business and learner metrics.

APIs:
- GET /api/stats/companies
- GET /api/stats/companies/all
- GET /api/stats/users

Code path:
- Route: trainmate-backend/routes/statsRoutes.js
- Controller: trainmate-backend/controllers/statsController.js

Additional analytics paths:
- Company admin notification and module lock endpoints in companyRoutes.
- Superadmin agent health endpoints in superAdminRoutes.

## 3) Payment Method and SaaS Model

### 3.1 Payment Method (Current Implementation)

Current state:
- No direct external payment gateway integration found (for example Stripe/Razorpay).
- Billing is stored as Firestore records in companies/{companyId}/billingPayments.

Code path:
- trainmate-backend/controllers/company-specific/companyLicenseController.js

Recorded billing fields include:
- plan
- amountUsd
- amountInr
- currency
- status
- provider
- paymentMethod
- cardLast4
- billingPeriodDays
- renewalDate
- createdAt

Practical meaning:
- License renewal and plan changes create billing records but do not process real card payment in backend code.

### 3.2 SaaS License Model

Plan model:
- License Basic
- License Pro

Plan prices in controller:
- License Basic: 99 USD (8250 PKR)
- License Pro: 299 USD (24750 PKR)

Core APIs:
- POST /api/company/:companyId/renew-license
- PUT /api/company/:companyId/license-plan
- GET /api/company/:companyId/license-info

License behavior:
- Renewal extends by 30 days.
- Company document stores active plan and renewal date.
- Scheduled reminder job sends renewal alerts at multiple day offsets and deduplicates via licenseNotifications subcollection.

Feature gating:
- Final quiz route checks Pro plan before allowing generation.

## 4) Email Integration

Purpose:
- System notifications and user/company communication.

Code path:
- Service: trainmate-backend/services/emailService.js
- Routes: trainmate-backend/routes/emailRoutes.js

Provider and auth:
- Nodemailer with Gmail service
- Uses trainmate01@gmail.com and GMAIL_APP_PASSWORD env variable

Email scenarios implemented:
- Roadmap generated (with PDF)
- Quiz unlock
- Training lock alerts
- Final quiz opened
- Final quiz failed
- Training completed
- Training summary report
- Admin regenerate roadmap notice
- Admin granted attempts notice
- License renewal reminders and confirmations
- Quiz security alerts

## 5) Google Calendar Integration

Purpose:
- Calendar reminders for roadmap learning flow.

OAuth APIs:
- GET /api/auth/company-google-auth-url
- POST /api/auth/company-google-callback
- POST /api/auth/google-callback

Code path:
- Controller: trainmate-backend/controllers/googleAuthController.js
- Services:
  - trainmate-backend/services/calendarService.js
  - trainmate-backend/services/notificationService.js

How it works:
- User-level tokens are preferred when available.
- Fallback to company admin tokens if user tokens are missing.
- Uses primary calendar.

Reminder model:
- Roadmap flow creates/updates one recurring training reminder event model.
- Quiz unlock notifications are handled by email in notification service flow.

Defaults:
- Timezone defaults to Asia/Karachi unless env overrides.

## 6) Notification System

Purpose:
- Deliver roadmap, quiz, lock, and completion events with adaptive logic.

Code path:
- trainmate-backend/services/notificationService.js
- trainmate-backend/services/aiAgenticNotificationService.js
- trainmate-backend/routes/notificationRoutes.js

User preference APIs:
- GET /api/notifications/preferences/:companyId/:deptId/:userId
- PUT /api/notifications/preferences/:companyId/:deptId/:userId

Notable notification classes:
- roadmap generated
- quiz unlock
- module lock (retries/time/deadline)
- training completion
- final quiz failed
- training summary report
- quiz security alert

Storage:
- User level notification preferences under user documents
- Company admin notifications in companies/{companyId}/adminNotifications

Adaptive behavior:
- Engagement and cooldown signals influence whether non-critical notifications are sent.

## 7) Privacy, Security, and Authentication

### 7.1 Authentication

Current mechanism:
- Firebase Auth and Google OAuth token exchange endpoints are implemented.

Key files:
- trainmate-backend/controllers/googleAuthController.js
- trainmate-backend/config/firebase.js

### 7.2 Privacy Controls

PII redaction:
- CV parser and policy sanitizer redact common PII before heavy LLM use.

Sensitive data handling:
- OAuth tokens are stored in Firestore for user/company integration flows.
- Firestore and Firebase infra provide managed transport and at-rest security.

### 7.3 Security and Guardrails

Guardrails and policy engine enforce:
- CV validity checks
- Quiz time/attempt lock rules
- Regeneration and progression decisions
- Notification policy decisions

Key files:
- trainmate-backend/services/policy/policyEngine.service.js
- trainmate-backend/services/guardrail.service.js

### 7.4 Important Current Gaps

1. No global backend auth middleware is mounted in server.js for route protection in this file set.
2. License enforcement is feature-specific, not fully centralized as a global middleware gate.
3. Payment processing is record-based and appears to require external/manual completion path.

These are architecture risks to track for production hardening.

## 8) Firestore Data Model (Practical Summary)

Main collections:
- companies
- freshers

Common nested paths:
- companies/{companyId}/billingPayments
- companies/{companyId}/adminNotifications
- companies/{companyId}/licenseNotifications
- freshers/{companyId}/departments/{deptId}/users/{userId}
- user roadmap modules in roadmap subcollection
- module quiz state in quiz/current and quizAttempts
- final assessment in finalQuiz/current and finalQuizAttempts

This structure supports company multi-tenancy by companyId and department partitioning.

## 9) Environment Variables You Need

Critical keys used by this functionality:
- GEMINI_API_KEY
- COHERE_API_KEY
- PINECONE_API_KEY
- PINECONE_INDEX
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GOOGLE_REDIRECT_URI
- COMPANY_GOOGLE_REDIRECT_URI
- GOOGLE_REFRESH_TOKEN (fallback/admin mode)
- GMAIL_APP_PASSWORD
- FIREBASE_PROJECT_ID and Firebase service credentials
- FRONTEND_URL
- DEFAULT_TIMEZONE
- DAILY_REMINDER_TIME

## 10) Operational Notes

1. If roadmap generation fails intermittently, inspect orchestrator logs and validation threshold behavior.
2. If calendar events fail, verify OAuth refresh tokens at both user and company levels.
3. If reminder emails are missing, validate Gmail app password and scheduler run status.
4. If final quiz access is denied, verify company license plan resolution path.

## 11) Suggested Next Hardening Steps

1. Add backend authentication and authorization middleware at route level.
2. Add centralized license enforcement middleware for all gated features.
3. Integrate real payment provider flow and webhook-based billing truth.
4. Add end-to-end tests for regeneration, final quiz attempts, and notification dedup logic.
