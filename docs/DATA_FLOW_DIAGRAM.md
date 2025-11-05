# Interview Results Data Flow Diagram

## 🔄 Complete Interview Lifecycle & Data Storage

### Phase 1: Interview Setup
```
┌─────────────────────────────────────────────────────────────┐
│ USER INITIATES INTERVIEW                                    │
│ (SetupScreen.tsx → App.tsx → handleStartInterview)         │
└─────────────────────────────────┬───────────────────────────┘
                                  │
                                  ▼
                    ┌──────────────────────────┐
                    │  createInterview()       │
                    │  (supabaseService.ts)    │
                    └──────────────┬───────────┘
                                   │
                    ┌──────────────┴───────────────────┐
                    │ INSERT interviews table          │
                    │ - candidate_name                 │
                    │ - position                       │
                    │ - jobDescription                 │
                    │ - mode (Video/Audio/Chat)       │
                    │ - language                       │
                    │ - difficulty                     │
                    │ - status: 'lobby'               │
                    │ - created_at: NOW()             │
                    └──────────────┬───────────────────┘
                                   │
                                   ▼
                         ✓ Interview ID created
                         ✓ Audit log: INTERVIEW_CREATE
```

---

### Phase 2: Interview Execution
```
┌──────────────────────────────────────────────────────────────┐
│ INTERVIEW SCREEN (InterviewScreen.tsx)                       │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ For each question:                                      │ │
│ │                                                         │ │
│ │ 1. Capture question from Gemini AI chat               │ │
│ │ 2. Display to user                                     │ │
│ │ 3. Record audio/video (if applicable)                 │ │
│ │ 4. Capture user answer                                │ │
│ │ 5. Store in memory: qna[] array                        │ │
│ │    { question: string, answer: string }               │ │
│ │                                                         │ │
│ │ 6. Monitor for malpractice:                            │ │
│ │    - Multiple faces detected                           │ │
│ │    - Person off-screen                                │ │
│ │    - Document scanning                                │ │
│ │    - Unusual window activity                          │ │
│ │                                                         │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ Data Collected:                                              │
│ - mediaBlob: Blob (WebCodec encoded video/audio)           │
│ - fullTranscript: string (formatted Q&A)                   │
│ - malpracticeReport: string (violations found)             │
│ - qna: Array[{question, answer}]                           │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
            Interview COMPLETE button clicked
```

---

### Phase 3: Interview Results Processing
```
┌─────────────────────────────────────────────────────────────┐
│ PLAYBACK SCREEN (PlaybackScreen.tsx)                        │
│                                                             │
│ 1. Display media (video/audio) for review                  │
│ 2. Show full transcript                                    │
│ 3. Call AI Service to generate feedback:                   │
│    generateFeedback({                                      │
│      questions: InterviewQuestion[],  // mock objects     │
│      answers: InterviewAnswer[],      // mock objects     │
│      settings: InterviewSettings,                          │
│      malpracticeReport: string | null                      │
│    })                                                       │
│                                                             │
│ 4. Gemini AI evaluates:                                    │
│    - Overall rating (1-10)                                 │
│    - Technical depth (1-10)                               │
│    - Communication (1-10)                                 │
│    - Problem-solving (1-10)                               │
│    - Strengths (2-3 items)                                │
│    - Areas for improvement (2-3 items)                    │
│    - Recommendation (Hire/Improve/Not a Fit)             │
│                                                             │
│ 5. Display FeedbackPanel with results                      │
│                                                             │
│ 6. User clicks "Finish Review & Save to History"          │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
            onFinishReview() callback triggered
                 (App.tsx → handleFinishReview)
```

---

### Phase 4: Database Storage (finalizeInterview)
```
┌──────────────────────────────────────────────────────────────┐
│ FINALIZE INTERVIEW (supabaseService.ts:185-318)             │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ STEP 1: Upload Media (if present)                     │ │
│ │ ├─ Storage: interview-recordings bucket               │ │
│ │ ├─ Path: {userId}/recordings/{interviewId}.webm       │ │
│ │ ├─ Size: Variable (video size)                        │ │
│ │ └─ Result: mediaPath (stored URL)                     │ │
│ └────────────────────────────────────────────────────────┘ │
│                          │                                  │
│ ┌────────────────────────┴───────────────────────────────┐ │
│ │ STEP 2: Calculate Duration (NEW FIX)                  │ │
│ │ ├─ Fetch: interview.started_at from DB                │ │
│ │ ├─ Calculate: now() - started_at = duration_minutes   │ │
│ │ └─ Result: durationMinutes (integer)                  │ │
│ └────────────────────────────────────────────────────────┘ │
│                          │                                  │
│ ┌────────────────────────┴───────────────────────────────┐ │
│ │ STEP 3: Update Interview Record (NEW FIELDS)          │ │
│ │ UPDATE interviews SET:                                │ │
│ │  - status = 'completed'                              │ │
│ │  - ended_at = NOW()                                  │ │
│ │  - duration_minutes = calculated value   ✨ NEW     │ │
│ │  - overall_score = feedback.rating       ✨ NEW     │ │
│ │  - video_url = mediaPath (if uploaded)               │ │
│ │  - malpractice_report = violations (if any)          │ │
│ │ WHERE id = interviewId                               │ │
│ └────────────────────────────────────────────────────────┘ │
│                          │                                  │
│ ┌────────────────────────┴───────────────────────────────┐ │
│ │ STEP 4: Store Questions with Ordering (IMPROVED)      │ │
│ │ INSERT INTO interview_questions:                      │ │
│ │  For each Q&A pair:                                  │ │
│ │  - question_text = pair.question                     │ │
│ │  - question_order = index + 1        ✨ IMPROVED   │ │
│ │  - asked_at = calculated_time         ✨ IMPROVED   │ │
│ │  - interview_id = interviewId                        │ │
│ │                                                       │ │
│ │ Returns: Array of question IDs & texts               │ │
│ └────────────────────────────────────────────────────────┘ │
│                          │                                  │
│ ┌────────────────────────┴───────────────────────────────┐ │
│ │ STEP 5: Store Answers with Relationships (IMPROVED)   │ │
│ │ INSERT INTO interview_answers:                        │ │
│ │  For each question_id returned:                      │ │
│ │  - question_id = returned_id                         │ │
│ │  - answer_text = corresponding_answer                │ │
│ │  - duration_seconds = estimated_from_text ✨ NEW   │ │
│ │  - created_at = NOW()                               │ │
│ │                                                       │ │
│ │ Result: All Q&A linked with proper relationships     │ │
│ └────────────────────────────────────────────────────────┘ │
│                          │                                  │
│ ┌────────────────────────┴───────────────────────────────┐ │
│ │ STEP 6: Store Performance Report (ENHANCED)           │ │
│ │ INSERT INTO performance_reports:                      │ │
│ │  - interview_id = interviewId                         │ │
│ │  - overall_score = feedback.overallRating             │ │
│ │  - technical_score = metric where name includes...    │ │
│ │  - communication_score = metric where name includes.. │ │
│ │  - problem_solving_score = metric where name...       │ │
│ │  - recommendation = feedback.recommendation           │ │
│ │  - feedback = formatted text:                         │ │
│ │      "Overall Reasoning: ...\n\n                     │ │
│ │       Metrics:\n                                      │ │
│ │       Technical Depth: 8/10 - ...\n                 │ │
│ │       Communication: 7/10 - ...\n                   │ │
│ │       Problem-Solving: 7.5/10 - ...\n              │ │
│ │                                                       │ │
│ │       Strengths:\n                                   │ │
│ │       - Item 1\n                                    │ │
│ │       - Item 2\n                                    │ │
│ │                                                       │ │
│ │       Areas for Improvement:\n                       │ │
│ │       - Item 1\n                                    │ │
│ │       - Item 2"                                      │ │
│ │                                                       │ │
│ │ Result: Complete performance evaluation stored       │ │
│ └────────────────────────────────────────────────────────┘ │
│                          │                                  │
│ ┌────────────────────────┴───────────────────────────────┐ │
│ │ STEP 7: Audit Logging (ENHANCED)                      │ │
│ │ INSERT INTO audit_logs:                               │ │
│ │  - user_id = userId                                  │ │
│ │  - action = 'INTERVIEW_FINALIZE'                     │ │
│ │  - entity_id = interviewId                           │ │
│ │  - table_name = 'interviews'                         │ │
│ │  - details = {                    ✨ ENHANCED       │ │
│ │      questionCount: qna.length,                       │ │
│ │      hasVideo: !!mediaPath,                          │ │
│ │      hasMalpractice: !!malpracticeReport             │ │
│ │    }                                                  │ │
│ │  - created_at = NOW()                               │ │
│ │                                                       │ │
│ │ Result: Complete audit trail for compliance          │ │
│ └────────────────────────────────────────────────────────┘ │
│                          │                                  │
│                          ▼                                  │
│                    RETURN success: true                     │
└──────────────────────────────────────────────────────────────┘
```

---

### Phase 5: Data Review & History
```
┌──────────────────────────────────────────────────────────────┐
│ HISTORY SCREEN (HistoryScreen.tsx)                           │
│                                                              │
│ User navigates to /history                                  │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ Query 1: Get All Interviews                            │ │
│ │ SELECT * FROM interviews                              │ │
│ │ WHERE user_id = current_user.id                       │ │
│ │ ORDER BY created_at DESC                              │ │
│ │                                                         │ │
│ │ Result: Interview list with:                          │ │
│ │ - candidate_name, position                            │ │
│ │ - overall_score (NOW AVAILABLE ✓)                     │ │
│ │ - duration_minutes (NOW AVAILABLE ✓)                  │ │
│ │ - status, created_at                                  │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ Query 2: Get Performance Report                        │ │
│ │ SELECT * FROM performance_reports                     │ │
│ │ WHERE interview_id = selected_interview_id            │ │
│ │                                                         │
│ │ Result: Feedback with all metrics:                    │ │
│ │ - overall_score (duplicated for convenience)          │ │
│ │ - technical_score, communication_score, etc.          │ │
│ │ - recommendation                                      │ │
│ │ - feedback (detailed text with metrics) ✓ IMPROVED   │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ Query 3: Get Q&A Transcript                            │ │
│ │ SELECT q.*, a.* FROM interview_questions q            │ │
│ │ LEFT JOIN interview_answers a ON a.question_id = q.id │ │
│ │ WHERE q.interview_id = selected_interview_id          │ │
│ │ ORDER BY q.question_order ASC ✓ IMPROVED             │ │
│ │                                                         │ │
│ │ Result: Full transcript in order:                     │ │
│ │ Q1: [...], A1: [...]                                  │ │
│ │ Q2: [...], A2: [...]                                  │ │
│ │ Q3: [...], A3: [...]                                  │ │
│ │ ... (ordered by question_order)                       │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ Display in UI:                                         │ │
│ │ - Interview metadata (name, position, score)          │ │
│ │ - FeedbackPanel with metrics and visualization        │ │
│ │ - Full transcript tab                                 │ │
│ │ - Comments section                                    │ │
│ │ - Download link to video recording                    │ │
│ └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

---

## 📊 Database Relationships

```
┌─────────────────────┐
│     users           │
│  (auth users)       │
│                     │
│  id (PK) ────────┐  │
│  userid (FK) ──┐ │  │
└─────────────────────┘
                 │
                 │
    ┌────────────┘
    │
    │ (1:N relationship)
    │
    ▼
┌──────────────────────────────────┐
│       interviews                 │    ◄── MAIN RECORD
│                                  │
│ id (PK) ───────────────┐         │
│ user_id (FK) ──────────┼──→ users│
│ candidate_name         │         │
│ position               │         │
│ overall_score      ✨  │         │ (NEW - from report)
│ duration_minutes   ✨  │         │ (NEW - calculated)
│ status                 │         │
│ started_at             │         │
│ ended_at               │         │
│ video_url              │         │
│ malpractice_report     │         │
└──────────────┬─────────┴─────────┘
               │
       ┌───────┴────────┬──────────────────┐
       │                │                  │
       │                │                  │
  (1:N)│           (1:N)│                  │
       │                │                  │
       ▼                ▼                  ▼
┌──────────────┐   ┌──────────────────┐  ┌──────────────────┐
│ interview_   │   │ performance_     │  │   comments       │
│ questions    │   │ reports          │  │                  │
│              │   │                  │  │ interview_id(FK) │
│ id (PK)  ─┐  │   │ id (PK)          │  │ user_id (FK)     │
│ interview_ │  │   │ interview_id(FK) │  │ comment_text     │
│   id(FK)─┐│  │   │ overall_score    │  │ is_internal      │
│ question_│├─┼─┼─┐ │ technical_score  │  │ created_at       │
│   text   │││ │ │ │ communication_   │  └──────────────────┘
│ question_││ │ │ │ │   score          │
│   order ││ │ │ │ │ problem_solving_ │
│ asked_at ││ │ │ │ │   score          │
└──────┬───┘│ │ │ │ │ recommendation   │
       │    │ │ │ │ │ feedback     ✨  │ (ENHANCED)
       │    │ │ │ │ └──────────────────┘
       │    │ │ │ │
   (1:N)   │ │ │ │
       │    │ │ │ │
       ▼    │ │ │ │
┌──────────────┐ │ │ │
│ interview_   │ │ │ │
│ answers      │ │ │ │
│              │ │ │ │
│ id (PK)  ──┐ │ │ │ │
│ question_│──┼─┘ │ │
│   id(FK) │  │   │ │
│ answer_text │   │ │
│ duration_│  │   │ │ (NEW - estimated)
│   seconds   │   │ │
│ created_at  │   │ │
└──────────────┘   │ │
                   │ │
              ┌────┘ │
              │      │
              ▼      ▼
          ┌────────────────┐
          │  audit_logs    │
          │                │
          │ user_id (FK)   │
          │ action         │
          │ entity_id      │
          │ table_name     │
          │ details    ✨  │ (ENHANCED)
          │ created_at     │
          └────────────────┘

Legend:
  PK = Primary Key
  FK = Foreign Key
  ✨ = New or Enhanced field
  (1:N) = One-to-Many relationship
```

---

## 🔄 Data Flow Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                        INTERVIEW LIFECYCLE                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  START                                                          │
│    │                                                            │
│    ├─→ createInterview()                                       │
│    │    └─→ INSERT interviews (status='lobby')                │
│    │         └─→ audit_logs: INTERVIEW_CREATE                │
│    │                                                            │
│    ├─→ Interview Screen (User answers questions)              │
│    │    └─→ Collect: qna[], mediaBlob, malpracticeReport     │
│    │                                                            │
│    ├─→ generateFeedback() (AI evaluation)                     │
│    │    └─→ Returns: FeedbackData with metrics               │
│    │                                                            │
│    ├─→ finalizeInterview()  ← FIXED & ENHANCED              │
│    │    │                                                     │
│    │    ├─→ Upload media                                     │
│    │    │                                                     │
│    │    ├─→ Calculate duration_minutes ✨                    │
│    │    │                                                     │
│    │    ├─→ UPDATE interviews:                               │
│    │    │   - status = 'completed'                           │
│    │    │   - duration_minutes ✨                            │
│    │    │   - overall_score ✨                               │
│    │    │   - video_url, malpractice_report                 │
│    │    │   - ended_at                                       │
│    │    │                                                     │
│    │    ├─→ INSERT interview_questions:                      │
│    │    │   - question_text                                  │
│    │    │   - question_order ✨                              │
│    │    │   - asked_at ✨                                    │
│    │    │                                                     │
│    │    ├─→ INSERT interview_answers:                        │
│    │    │   - answer_text                                    │
│    │    │   - duration_seconds ✨                            │
│    │    │                                                     │
│    │    ├─→ INSERT performance_reports:                      │
│    │    │   - All scores                                     │
│    │    │   - recommendation                                 │
│    │    │   - feedback (detailed) ✨                         │
│    │    │                                                     │
│    │    └─→ INSERT audit_logs:                               │
│    │        - action: INTERVIEW_FINALIZE                     │
│    │        - details: counts & flags ✨                     │
│    │                                                            │
│    ├─→ Show notification: "Interview saved!"                │
│    │                                                            │
│    └─→ END (redirect to /history)                             │
│                                                                 │
│  HistoryScreen: User can now review complete interview data    │
│    - Interview metadata + score + duration                     │
│    - Complete Q&A transcript (ordered)                         │
│    - Performance report with all metrics                       │
│    - Audit trail of all operations                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Legend: ✨ = Enhanced/New in this fix
```

---

## ✅ Key Improvements Visualized

### Before vs After Storage

**BEFORE** ❌
```
interviews
├─ id: "123"
├─ candidate_name: "John"
├─ position: "Engineer"
├─ ... (missing: duration, overall_score)
└─ created_at

interview_questions
├─ id: "q1"
├─ question_text: "Tell me about..."
├─ ... (missing: question_order, asked_at)
└─ created_at

interview_answers
├─ id: "a1"
├─ answer_text: "..."
├─ ... (missing: duration_seconds)
└─ created_at

performance_reports
├─ id: "r1"
├─ overall_score: 7.5
├─ feedback: "Overall: Good. Strengths: [...]"
├─ ... (feedback lacks metric details)
└─ created_at
```

**AFTER** ✅
```
interviews
├─ id: "123"
├─ candidate_name: "John"
├─ position: "Engineer"
├─ overall_score: 7.5          ✨ NEW
├─ duration_minutes: 15         ✨ NEW
├─ started_at: "2025-11-02..."
├─ ended_at: "2025-11-02..."
└─ created_at

interview_questions
├─ id: "q1"
├─ question_text: "Tell me about..."
├─ question_order: 1            ✨ NEW
├─ asked_at: "2025-11-02..."    ✨ NEW (calculated)
└─ created_at

interview_answers
├─ id: "a1"
├─ question_id: "q1"
├─ answer_text: "..."
├─ duration_seconds: 45         ✨ NEW (estimated)
└─ created_at

performance_reports
├─ id: "r1"
├─ overall_score: 7.5
├─ technical_score: 8.0
├─ communication_score: 7.0
├─ problem_solving_score: 7.5
├─ recommendation: "Recommended for Hire"
├─ feedback:                    ✨ ENHANCED
│  "Overall Reasoning: Strong technical foundation...
│   Metrics:
│   Technical Depth: 8/10 - Demonstrates solid...
│   Communication: 7/10 - Clear explanations...
│   Problem-Solving: 7.5/10 - Good approach...
│   Strengths:
│   - Deep knowledge of TypeScript
│   - Good experience with leadership
│   Areas for Improvement:
│   - Could provide more specific examples
│   - Could elaborate more on architecture"
└─ created_at
```

---

This comprehensive data flow ensures complete, traceable, and auditable interview result storage. ✅

