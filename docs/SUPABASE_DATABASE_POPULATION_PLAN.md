# Supabase Database Population Plan

**Date:** November 3, 2025
**Status:** Ready for Implementation
**Purpose:** Populate all database tables with comprehensive, realistic sample data

---

## Table of Contents
1. [Overview](#overview)
2. [Database Schema Summary](#database-schema-summary)
3. [Population Strategy](#population-strategy)
4. [Sample Data by Table](#sample-data-by-table)
5. [SQL Migration File](#sql-migration-file)
6. [Verification & Testing](#verification--testing)

---

## Overview

The JD Labs Interview Platform uses **10 main database tables** plus Supabase Auth for user authentication. This plan provides a complete data population strategy to create a realistic testing and demo environment.

### Goals
- ✅ Populate all tables with interconnected, realistic data
- ✅ Maintain proper foreign key relationships
- ✅ Create diverse scenarios (various positions, difficulties, outcomes)
- ✅ Enable full feature testing (interviews, reports, comments, audit logs)
- ✅ Demonstrate malpractice detection capabilities

---

## Database Schema Summary

### Table Dependencies (Population Order)

```
Phase 1: Foundation (No Dependencies)
  ├─ languages
  └─ users (linked to auth.users)

Phase 2: Job Postings
  └─ jobs (FK: users.userid)

Phase 3: Interviews
  └─ interviews (FK: users.id)

Phase 4: Interview Details
  ├─ interview_questions (FK: interviews.id)
  ├─ interview_answers (FK: interview_questions.id, interviews.id)
  ├─ performance_reports (FK: interviews.id)
  └─ comments (FK: interviews.id, users.userid)

Phase 5: Monitoring
  ├─ audit_logs (FK: users.userid)
  └─ screen_shares (FK: interviews.id)
```

### Key Constraints

**Critical Foreign Key Mapping:**
```
auth.users.id (UUID)
  ↓ (userid)
users.userid (UUID)
users.id (BIGINT) ← interviews.user_id
```

**Important:** `interviews.user_id` uses the **internal** `users.id` (BIGINT), NOT `auth.uid()` (UUID)!

---

## Population Strategy

### 1. **Languages Table** (10 records)

Support for major global languages:

| ID | Name | Code | Is Active |
|----|------|------|-----------|
| 1 | English | en | true |
| 2 | Spanish | es | true |
| 3 | French | fr | true |
| 4 | German | de | true |
| 5 | Mandarin Chinese | zh | true |
| 6 | Japanese | ja | true |
| 7 | Hindi | hi | true |
| 8 | Portuguese | pt | true |
| 9 | Arabic | ar | true |
| 10 | Russian | ru | true |

---

### 2. **Users Table** (6 records)

Sample team members and candidates:

| ID | UserID (UUID) | Email | Name | Role |
|----|---------------|-------|------|------|
| 1 | a1b2c3d4-... | admin@jdlabs.com | Admin User | Platform Admin |
| 2 | e5f6g7h8-... | veerabathirankarthik@gmail.com | Karthik Veerabathiran | Interviewer |
| 3 | i9j0k1l2-... | recruiter@jdlabs.com | Sarah Johnson | Recruiter |
| 4 | m3n4o5p6-... | interviewer@jdlabs.com | Michael Chen | Technical Interviewer |
| 5 | q7r8s9t0-... | candidate1@email.com | Emma Davis | Candidate |
| 6 | u1v2w3x4-... | candidate2@email.com | James Wilson | Candidate |

**Note:** These users must first exist in `auth.users` (Supabase Auth). The UUIDs should match actual auth user IDs.

---

### 3. **Jobs Table** (15 records)

Diverse job postings across tech roles:

#### Sample Jobs:

**1. Senior Frontend Engineer**
```json
{
  "title": "Senior Frontend Engineer",
  "company_name": "TechCorp Inc",
  "location": "San Francisco, CA (Remote)",
  "employment_type": "Full-time",
  "salary_range": "$140,000 - $180,000",
  "description": "Build scalable, performant web applications using React 19, TypeScript, and modern frontend tooling.",
  "requirements": [
    "5+ years of React experience",
    "Expert in TypeScript and modern ES6+",
    "Strong understanding of state management (Redux, Zustand, Context API)",
    "Experience with performance optimization and code splitting",
    "Familiarity with testing frameworks (Jest, React Testing Library)"
  ],
  "created_by": "e5f6g7h8-..." // Karthik's userid
}
```

**2. Backend Engineer (Node.js)**
```json
{
  "title": "Backend Engineer - Node.js",
  "company_name": "DataFlow Systems",
  "location": "Austin, TX (Hybrid)",
  "employment_type": "Full-time",
  "salary_range": "$130,000 - $160,000",
  "description": "Design and implement RESTful APIs and microservices using Node.js, Express, and PostgreSQL.",
  "requirements": [
    "4+ years Node.js development",
    "Strong SQL and database design skills",
    "Experience with Docker and Kubernetes",
    "Knowledge of event-driven architectures",
    "API security best practices"
  ]
}
```

**3. Full-Stack Developer**
```json
{
  "title": "Full-Stack Developer",
  "company_name": "StartupHub",
  "location": "New York, NY",
  "employment_type": "Full-time",
  "salary_range": "$120,000 - $150,000",
  "description": "Work across the entire stack from React frontend to Node.js/PostgreSQL backend.",
  "requirements": [
    "3+ years full-stack experience",
    "React and Node.js proficiency",
    "Database design (PostgreSQL, MongoDB)",
    "RESTful API development",
    "Git version control"
  ]
}
```

**4. DevOps Engineer**
**5. Mobile Developer (React Native)**
**6. Data Scientist**
**7. Machine Learning Engineer**
**8. QA Automation Engineer**
**9. Product Manager (Technical)**
**10. UI/UX Designer**
**11. Cloud Architect (AWS)**
**12. Security Engineer**
**13. Site Reliability Engineer (SRE)**
**14. Content Strategist**
**15. Engineering Manager**

---

### 4. **Interviews Table** (20 records)

Diverse interview scenarios covering all modes, difficulties, and statuses:

#### Interview Distribution:
- **Modes:**
  - Video Interview: 10
  - Audio Interview: 5
  - Chat Interview: 3
  - Live Share Interview: 2

- **Difficulties:**
  - Easy: 6
  - Medium: 9
  - Hard: 5

- **Statuses:**
  - completed: 14
  - in_progress: 2
  - lobby: 3
  - cancelled: 1

- **Positions:** Match job postings (Frontend, Backend, DevOps, etc.)

#### Sample Interview Records:

**Interview #1: Completed Video Interview (High Score)**
```json
{
  "id": "int-001-uuid",
  "user_id": 2, // Karthik's internal ID
  "candidate_name": "Emma Davis",
  "position": "Senior Frontend Engineer",
  "jobDescription": "Build scalable web applications...",
  "mode": "Video Interview",
  "language": "English",
  "model": "gemini-2.5-flash-native-audio-preview-09-2025",
  "difficulty": "Hard",
  "status": "completed",
  "started_at": "2025-10-28T14:00:00Z",
  "ended_at": "2025-10-28T14:35:00Z",
  "duration_minutes": 35,
  "overall_score": 92,
  "video_url": "e5f6g7h8-.../recordings/int-001-uuid.webm",
  "malpractice_report": null,
  "created_at": "2025-10-28T13:55:00Z"
}
```

**Interview #2: Completed with Malpractice Detection**
```json
{
  "id": "int-002-uuid",
  "user_id": 2,
  "candidate_name": "James Wilson",
  "position": "Backend Engineer - Node.js",
  "mode": "Video Interview",
  "language": "English",
  "model": "gemini-2.5-flash-native-audio-preview-09-2025",
  "difficulty": "Medium",
  "status": "completed",
  "started_at": "2025-10-29T10:00:00Z",
  "ended_at": "2025-10-29T10:28:00Z",
  "duration_minutes": 28,
  "overall_score": 73,
  "video_url": "e5f6g7h8-.../recordings/int-002-uuid.webm",
  "malpractice_report": "[10:12:30] Screen Switch: Candidate switched tabs for 8 seconds.\n[10:18:45] Long Pause: Silence detected for 18 seconds.",
  "created_at": "2025-10-29T09:55:00Z"
}
```

**Interview #3: Audio Interview (Easy Difficulty)**
```json
{
  "id": "int-003-uuid",
  "user_id": 3, // Sarah Johnson
  "candidate_name": "Alex Martinez",
  "position": "QA Automation Engineer",
  "mode": "Audio Interview",
  "language": "English",
  "model": "gemini-2.5-flash-native-audio-preview-09-2025",
  "difficulty": "Easy",
  "status": "completed",
  "started_at": "2025-10-30T15:00:00Z",
  "ended_at": "2025-10-30T15:22:00Z",
  "duration_minutes": 22,
  "overall_score": 81,
  "video_url": "i9j0k1l2-.../recordings/int-003-uuid.webm",
  "malpractice_report": null
}
```

**Interview #4: In Progress**
```json
{
  "id": "int-004-uuid",
  "user_id": 4, // Michael Chen
  "candidate_name": "Sophia Lee",
  "position": "Data Scientist",
  "mode": "Chat Interview",
  "language": "English",
  "model": "gemini-2.5-flash-native-audio-preview-09-2025",
  "difficulty": "Hard",
  "status": "in_progress",
  "started_at": "2025-11-03T09:30:00Z",
  "ended_at": null,
  "duration_minutes": null,
  "overall_score": null,
  "video_url": null,
  "malpractice_report": null
}
```

**Interview #5: Lobby Status**
```json
{
  "id": "int-005-uuid",
  "user_id": 2,
  "candidate_name": "David Kim",
  "position": "DevOps Engineer",
  "mode": "Live Share Interview",
  "language": "English",
  "model": "gemini-2.5-flash-native-audio-preview-09-2025",
  "difficulty": "Medium",
  "status": "lobby",
  "started_at": null,
  "ended_at": null,
  "duration_minutes": null,
  "overall_score": null
}
```

**Additional Interviews (6-20):** Similar variety with different candidates, positions, scores ranging from 45-95.

---

### 5. **Interview Questions Table** (~120 records)

Each completed interview has 5-8 questions. Sample questions by position:

#### Frontend Engineer Questions:
1. "Tell me about your experience with React and modern frontend frameworks."
2. "Explain the difference between useState and useReducer hooks. When would you use each?"
3. "How do you approach performance optimization in React applications?"
4. "Describe your experience with state management libraries like Redux or Zustand."
5. "Walk me through how you would implement code splitting and lazy loading."
6. "What's your approach to testing React components?"
7. "How do you handle accessibility in web applications?"

#### Backend Engineer Questions:
1. "Describe your experience designing RESTful APIs."
2. "How do you handle database transactions and ensure data integrity?"
3. "Explain the difference between horizontal and vertical scaling."
4. "What's your approach to API security and authentication?"
5. "How do you design microservices architecture?"
6. "Describe your experience with caching strategies."

#### DevOps Questions:
1. "Walk me through your CI/CD pipeline setup."
2. "How do you approach infrastructure as code?"
3. "Describe your experience with Docker and Kubernetes."
4. "What monitoring and logging tools have you used?"
5. "How do you handle production incidents?"

#### Data Science Questions:
1. "Explain the machine learning workflow you typically follow."
2. "What's the difference between supervised and unsupervised learning?"
3. "How do you handle imbalanced datasets?"
4. "Describe your experience with feature engineering."
5. "What metrics do you use to evaluate model performance?"

**Sample Question Records:**

```json
[
  {
    "id": "q-001-uuid",
    "interview_id": "int-001-uuid",
    "question_text": "Tell me about your experience with React and modern frontend frameworks.",
    "question_order": 1,
    "asked_at": "2025-10-28T14:02:00Z"
  },
  {
    "id": "q-002-uuid",
    "interview_id": "int-001-uuid",
    "question_text": "Explain the difference between useState and useReducer hooks. When would you use each?",
    "question_order": 2,
    "asked_at": "2025-10-28T14:07:00Z"
  }
]
```

---

### 6. **Interview Answers Table** (~120 records)

Corresponding answers for each question:

**Sample Answer Records:**

```json
[
  {
    "id": "a-001-uuid",
    "interview_id": "int-001-uuid",
    "question_id": "q-001-uuid",
    "answer_text": "I have over 5 years of experience working with React, starting from class components and transitioning to functional components with hooks. I've built large-scale applications using React 18 and 19, implementing features like concurrent rendering, suspense for data fetching, and server components. I'm particularly experienced with TypeScript integration, state management using Context API and Zustand, and performance optimization through memoization and code splitting.",
    "duration_seconds": 62,
    "created_at": "2025-10-28T14:03:00Z"
  },
  {
    "id": "a-002-uuid",
    "interview_id": "int-001-uuid",
    "question_id": "q-002-uuid",
    "answer_text": "useState is ideal for simple state management where you need to track a single value or a simple object. useReducer is better suited for complex state logic involving multiple sub-values or when the next state depends on the previous one. For example, I'd use useState for a toggle or input field, but useReducer for managing a complex form with validation, multiple fields, and interdependent states. useReducer also makes testing easier since the logic is extracted into a pure function.",
    "duration_seconds": 58,
    "created_at": "2025-10-28T14:08:00Z"
  }
]
```

**Answer Quality Distribution:**
- Excellent (90+ score interviews): Detailed, technical, demonstrates deep knowledge
- Good (75-89): Solid understanding, some technical depth
- Average (60-74): Basic understanding, less detailed
- Below Average (<60): Vague, lacks technical depth

---

### 7. **Performance Reports Table** (~14 records)

AI-generated reports for completed interviews:

**Sample Report (High Score - 92):**

```json
{
  "id": "rep-001-uuid",
  "interview_id": "int-001-uuid",
  "candidate_id": null,
  "interviewer_id": "e5f6g7h8-...", // Karthik's auth.uid
  "overall_score": 92,
  "technical_score": 10,
  "communication_score": 9,
  "problem_solving_score": 9,
  "recommendation": "Recommended for Hire",
  "feedback": "Overall Reasoning:\nEmma demonstrated exceptional technical knowledge of React and modern frontend development. Her answers were well-structured, detailed, and showed deep understanding of advanced concepts. She communicated clearly and provided practical examples from real-world experience.\n\nMetrics:\nTechnical: 10/10 - Expert-level knowledge of React hooks, state management, and performance optimization\nCommunication: 9/10 - Clear, articulate responses with good structure\nProblem Solving: 9/10 - Analytical approach to technical challenges\n\nStrengths:\n- Deep understanding of React internals and advanced patterns\n- Strong TypeScript skills\n- Excellent performance optimization knowledge\n- Clear communication of complex technical concepts\n- Practical experience with production-scale applications\n\nAreas for Improvement:\n- Could elaborate more on testing strategies\n- Accessibility considerations could be more detailed\n\nRecommendation: Highly recommend for Senior Frontend Engineer role. Candidate exceeds expectations.",
  "created_at": "2025-10-28T14:36:00Z"
}
```

**Sample Report (Medium Score - 73, with Malpractice):**

```json
{
  "id": "rep-002-uuid",
  "interview_id": "int-002-uuid",
  "interviewer_id": "e5f6g7h8-...",
  "overall_score": 73,
  "technical_score": 7,
  "communication_score": 7,
  "problem_solving_score": 8,
  "recommendation": "Needs Improvement",
  "feedback": "Overall Reasoning:\nJames showed solid foundational knowledge of backend development with Node.js. However, some answers lacked depth and there were concerning behaviors detected during the interview including tab switching and unusual pauses.\n\nMetrics:\nTechnical: 7/10 - Good understanding but needs more depth in advanced topics\nCommunication: 7/10 - Generally clear but some hesitation\nProblem Solving: 8/10 - Good analytical thinking\n\nStrengths:\n- Solid Node.js fundamentals\n- Good understanding of async/await patterns\n- Experience with PostgreSQL\n\nAreas for Improvement:\n- Deepen knowledge of microservices architecture\n- Improve understanding of database optimization\n- Address interview conduct (detected tab switching)\n\nMalpractice Concerns:\n- Screen switching detected at 10:12:30 (8 seconds)\n- Unusual pause at 10:18:45 (18 seconds)\n\nRecommendation: Candidate shows potential but needs improvement. Consider for junior-level role with mentorship.",
  "created_at": "2025-10-29T10:29:00Z"
}
```

**Sample Report (Low Score - 58):**

```json
{
  "id": "rep-003-uuid",
  "interview_id": "int-006-uuid",
  "interviewer_id": "m3n4o5p6-...",
  "overall_score": 58,
  "technical_score": 5,
  "communication_score": 6,
  "problem_solving_score": 6,
  "recommendation": "Not a Fit",
  "feedback": "Overall Reasoning:\nCandidate demonstrated limited technical knowledge for the senior-level position. Answers were often vague and lacked specific examples or depth.\n\nMetrics:\nTechnical: 5/10 - Basic understanding but insufficient for senior role\nCommunication: 6/10 - Struggled to articulate technical concepts\nProblem Solving: 6/10 - Approaches were superficial\n\nStrengths:\n- Enthusiasm for learning\n- Basic understanding of core concepts\n\nAreas for Improvement:\n- Significant gaps in technical knowledge\n- Need more hands-on experience with advanced topics\n- Improve ability to explain technical decisions\n\nRecommendation: Not suitable for senior position. May be appropriate for junior role with extensive training.",
  "created_at": "2025-10-25T11:30:00Z"
}
```

---

### 8. **Comments Table** (~25 records)

Team collaboration on interviews:

**Sample Comments:**

```json
[
  {
    "id": "com-001-uuid",
    "interview_id": "int-001-uuid",
    "user_id": "i9j0k1l2-...", // Sarah (Recruiter)
    "comment_text": "Excellent candidate! Moving forward to team interview stage. Technical skills are outstanding.",
    "is_internal": false,
    "created_at": "2025-10-28T15:00:00Z"
  },
  {
    "id": "com-002-uuid",
    "interview_id": "int-001-uuid",
    "user_id": "m3n4o5p6-...", // Michael
    "comment_text": "Agreed. Her React knowledge is exceptional. Let's schedule system design round.",
    "is_internal": false,
    "created_at": "2025-10-28T15:15:00Z"
  },
  {
    "id": "com-003-uuid",
    "interview_id": "int-002-uuid",
    "user_id": "e5f6g7h8-...", // Karthik
    "comment_text": "Note the malpractice detection. Need to discuss this with the candidate before proceeding.",
    "is_internal": true,
    "created_at": "2025-10-29T10:45:00Z"
  },
  {
    "id": "com-004-uuid",
    "interview_id": "int-002-uuid",
    "user_id": "i9j0k1l2-...",
    "comment_text": "Following up with candidate about the technical assessment concerns.",
    "is_internal": true,
    "created_at": "2025-10-29T11:00:00Z"
  }
]
```

---

### 9. **Audit Logs Table** (~60 records)

Comprehensive activity tracking:

**Sample Audit Log Records:**

```json
[
  {
    "id": "audit-001-uuid",
    "user_id": "e5f6g7h8-...",
    "action": "USER_LOGIN",
    "entity_id": "e5f6g7h8-...",
    "table_name": "auth.users",
    "details": {
      "login_method": "email",
      "ip_address": "192.168.1.100"
    },
    "created_at": "2025-10-28T13:55:00Z"
  },
  {
    "id": "audit-002-uuid",
    "user_id": "e5f6g7h8-...",
    "action": "INTERVIEW_CREATE",
    "entity_id": "int-001-uuid",
    "table_name": "interviews",
    "details": {
      "position": "Senior Frontend Engineer",
      "mode": "Video Interview",
      "difficulty": "Hard"
    },
    "created_at": "2025-10-28T13:55:30Z"
  },
  {
    "id": "audit-003-uuid",
    "user_id": "e5f6g7h8-...",
    "action": "INTERVIEW_FINALIZE",
    "entity_id": "int-001-uuid",
    "table_name": "interviews",
    "details": {
      "questionCount": 7,
      "hasVideo": true,
      "hasMalpractice": false,
      "overall_score": 92
    },
    "created_at": "2025-10-28T14:36:00Z"
  },
  {
    "id": "audit-004-uuid",
    "user_id": "e5f6g7h8-...",
    "action": "REPORT_CREATE",
    "entity_id": "rep-001-uuid",
    "table_name": "performance_reports",
    "details": {
      "interview_id": "int-001-uuid",
      "recommendation": "Recommended for Hire"
    },
    "created_at": "2025-10-28T14:36:05Z"
  },
  {
    "id": "audit-005-uuid",
    "user_id": "i9j0k1l2-...",
    "action": "COMMENT_CREATE",
    "entity_id": "com-001-uuid",
    "table_name": "comments",
    "details": {
      "interview_id": "int-001-uuid"
    },
    "created_at": "2025-10-28T15:00:00Z"
  },
  {
    "id": "audit-006-uuid",
    "user_id": "e5f6g7h8-...",
    "action": "USER_LOGOUT",
    "entity_id": "e5f6g7h8-...",
    "table_name": "auth.users",
    "details": {},
    "created_at": "2025-10-28T17:00:00Z"
  }
]
```

**Audit Action Distribution:**
- USER_LOGIN: ~15
- USER_LOGOUT: ~15
- INTERVIEW_CREATE: ~20
- INTERVIEW_FINALIZE: ~14
- REPORT_CREATE: ~14
- COMMENT_CREATE: ~10
- USER_REGISTER: ~6

---

### 10. **Screen Shares Table** (~2 records)

Screen sharing sessions for Live Share interviews:

```json
[
  {
    "id": "screen-001-uuid",
    "interview_id": "int-005-uuid",
    "recording_url": "e5f6g7h8-.../screen-shares/int-005-uuid-screen.webm",
    "started_at": "2025-11-01T10:05:00Z",
    "ended_at": "2025-11-01T10:32:00Z",
    "duration_seconds": 1620,
    "file_size_mb": 45.3,
    "created_at": "2025-11-01T10:32:30Z"
  },
  {
    "id": "screen-002-uuid",
    "interview_id": "int-018-uuid",
    "recording_url": "m3n4o5p6-.../screen-shares/int-018-uuid-screen.webm",
    "started_at": "2025-11-02T14:00:00Z",
    "ended_at": "2025-11-02T14:28:00Z",
    "duration_seconds": 1680,
    "file_size_mb": 52.1,
    "created_at": "2025-11-02T14:28:15Z"
  }
]
```

---

## SQL Migration File

See companion file: `seed_sample_data.sql`

The migration file includes:
1. **Data cleanup** - Remove existing sample data (if any)
2. **Phase 1** - Insert languages and users
3. **Phase 2** - Insert jobs
4. **Phase 3** - Insert interviews
5. **Phase 4** - Insert questions, answers, reports, comments
6. **Phase 5** - Insert audit logs and screen shares
7. **Verification queries** - Count and validate data

---

## Verification & Testing

### Post-Population Checks

**1. Record Counts:**
```sql
SELECT
  (SELECT COUNT(*) FROM languages) as languages_count,
  (SELECT COUNT(*) FROM users) as users_count,
  (SELECT COUNT(*) FROM jobs) as jobs_count,
  (SELECT COUNT(*) FROM interviews) as interviews_count,
  (SELECT COUNT(*) FROM interview_questions) as questions_count,
  (SELECT COUNT(*) FROM interview_answers) as answers_count,
  (SELECT COUNT(*) FROM performance_reports) as reports_count,
  (SELECT COUNT(*) FROM comments) as comments_count,
  (SELECT COUNT(*) FROM audit_logs) as audit_logs_count,
  (SELECT COUNT(*) FROM screen_shares) as screen_shares_count;
```

**Expected Results:**
- languages: 10
- users: 6
- jobs: 15
- interviews: 20
- interview_questions: ~120
- interview_answers: ~120
- performance_reports: 14
- comments: ~25
- audit_logs: ~60
- screen_shares: 2

**2. Foreign Key Integrity:**
```sql
-- Check interviews reference valid users
SELECT COUNT(*) FROM interviews i
WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.id = i.user_id);
-- Expected: 0

-- Check questions reference valid interviews
SELECT COUNT(*) FROM interview_questions q
WHERE NOT EXISTS (SELECT 1 FROM interviews i WHERE i.id = q.interview_id);
-- Expected: 0

-- Check answers reference valid questions
SELECT COUNT(*) FROM interview_answers a
WHERE NOT EXISTS (SELECT 1 FROM interview_questions q WHERE q.id = a.question_id);
-- Expected: 0
```

**3. Interview History Query:**
```sql
SELECT
  i.id,
  i.candidate_name,
  i.position,
  i.mode,
  i.status,
  i.overall_score,
  COUNT(DISTINCT q.id) as question_count,
  COUNT(DISTINCT a.id) as answer_count,
  COUNT(DISTINCT c.id) as comment_count
FROM interviews i
LEFT JOIN interview_questions q ON q.interview_id = i.id
LEFT JOIN interview_answers a ON a.interview_id = i.id
LEFT JOIN comments c ON c.interview_id = i.id
WHERE i.user_id = (SELECT id FROM users WHERE email = 'veerabathirankarthik@gmail.com')
GROUP BY i.id, i.candidate_name, i.position, i.mode, i.status, i.overall_score
ORDER BY i.created_at DESC;
```

**4. Performance Report Validation:**
```sql
SELECT
  pr.overall_score,
  pr.technical_score,
  pr.communication_score,
  pr.problem_solving_score,
  pr.recommendation,
  LENGTH(pr.feedback) as feedback_length
FROM performance_reports pr
WHERE pr.overall_score IS NOT NULL
ORDER BY pr.overall_score DESC;
```

**5. Malpractice Detection:**
```sql
SELECT
  i.id,
  i.candidate_name,
  i.position,
  i.overall_score,
  LENGTH(i.malpractice_report) as report_length
FROM interviews i
WHERE i.malpractice_report IS NOT NULL
  AND LENGTH(i.malpractice_report) > 0;
```

**6. Transcript Reconstruction Test:**
```sql
-- Get full Q&A for a specific interview
SELECT
  q.question_order,
  q.question_text,
  a.answer_text,
  a.duration_seconds
FROM interview_questions q
JOIN interview_answers a ON a.question_id = q.id
WHERE q.interview_id = 'int-001-uuid'
ORDER BY q.question_order;
```

**7. Comment Thread View:**
```sql
SELECT
  c.comment_text,
  u.name as commenter,
  c.is_internal,
  c.created_at
FROM comments c
JOIN users u ON u.userid = c.user_id
WHERE c.interview_id = 'int-001-uuid'
ORDER BY c.created_at;
```

**8. Audit Log Activity:**
```sql
SELECT
  action,
  COUNT(*) as count,
  MIN(created_at) as first_occurrence,
  MAX(created_at) as last_occurrence
FROM audit_logs
GROUP BY action
ORDER BY count DESC;
```

---

## Application Testing Scenarios

After data population, test these user flows:

### Scenario 1: Login and View History
1. Login as `veerabathirankarthik@gmail.com`
2. Navigate to History page
3. Should see ~12 interviews (various statuses)
4. Click "View Report" on completed interview
5. Should see full transcript, scores, and feedback

### Scenario 2: Interview Details
1. Select a completed interview with high score (92)
2. Verify:
   - Full Q&A transcript displays
   - Performance report shows detailed feedback
   - Scores are visible (technical, communication, problem-solving)
   - Team comments appear below

### Scenario 3: Malpractice Detection
1. Find interview with malpractice report
2. Verify malpractice details are displayed
3. Check that score is affected (typically lower)

### Scenario 4: Multiple User Perspectives
1. Login as different users (Sarah, Michael)
2. Each should see only their own interviews
3. Verify RLS policies are working

### Scenario 5: Job Listings
1. Navigate to Setup/New Interview
2. Job dropdown should show 15 job postings
3. Selecting a job should populate description

### Scenario 6: Language Selection
1. Setup screen should show 10 languages
2. Should be able to select any active language

---

## Data Characteristics Summary

### Realism Factors

**Interview Timing:**
- Created over last 30 days
- Business hours (9 AM - 5 PM)
- Duration: 20-40 minutes (realistic)

**Score Distribution:**
- Mean: ~75
- Range: 45-95
- Bell curve distribution
- ~30% high performers (85+)
- ~50% average (65-84)
- ~20% below average (<65)

**Malpractice Detection:**
- ~30% of interviews flagged
- Common issues:
  - Screen switching
  - Long pauses
  - Topic diversion
- Affects overall score (-10 to -20 points)

**Question Difficulty:**
- Easy: 3-5 questions
- Medium: 5-7 questions
- Hard: 7-8 questions

**Answer Quality:**
- Correlates with overall score
- High scores: 50-70 words per answer
- Medium: 30-50 words
- Low: 15-30 words

---

## Implementation Steps

### Pre-Execution Checklist

1. ✅ **Backup existing data** (if any)
   ```sql
   -- Export current data
   pg_dump -h [host] -U [user] -d [database] > backup_before_seed.sql
   ```

2. ✅ **Verify auth.users existence**
   - Ensure UUIDs in users table match actual auth users
   - Create auth users first if needed

3. ✅ **Check RLS policies**
   - Temporarily disable for seeding (or use service role key)
   ```sql
   ALTER TABLE users DISABLE ROW LEVEL SECURITY;
   -- ... disable for other tables
   ```

### Execution

1. **Run migration file:**
   ```bash
   psql -h [host] -U [user] -d [database] -f seed_sample_data.sql
   ```

   Or via Supabase Dashboard:
   - Go to SQL Editor
   - Paste contents of `seed_sample_data.sql`
   - Click "Run"

2. **Monitor execution:**
   - Watch for constraint violations
   - Check for duplicate key errors
   - Verify successful inserts

### Post-Execution

1. ✅ **Re-enable RLS** (if disabled)
   ```sql
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   -- ... enable for other tables
   ```

2. ✅ **Run verification queries** (see above)

3. ✅ **Test application features:**
   - Login
   - View history
   - View reports
   - Add comments
   - Check audit logs

---

## Maintenance & Updates

### Adding More Data

**New Interview:**
```sql
-- 1. Create interview
INSERT INTO interviews (...) VALUES (...);

-- 2. Add questions
INSERT INTO interview_questions (...) VALUES (...);

-- 3. Add answers
INSERT INTO interview_answers (...) VALUES (...);

-- 4. Create report (if completed)
INSERT INTO performance_reports (...) VALUES (...);

-- 5. Add audit logs
INSERT INTO audit_logs (...) VALUES (...);
```

### Modifying Existing Data

**Update interview status:**
```sql
UPDATE interviews
SET status = 'completed',
    ended_at = NOW(),
    overall_score = 85
WHERE id = 'int-004-uuid';
```

**Add team comment:**
```sql
INSERT INTO comments (interview_id, user_id, comment_text)
VALUES ('int-001-uuid', 'i9j0k1l2-...', 'Great technical depth!');
```

---

## Troubleshooting

### Common Issues

**1. Foreign Key Violation (user_id):**
```
ERROR: insert or update on table "interviews" violates foreign key constraint
```
**Solution:** Verify users.id exists before inserting interview
```sql
SELECT id FROM users WHERE userid = 'uuid-from-auth';
```

**2. Duplicate Key Error:**
```
ERROR: duplicate key value violates unique constraint
```
**Solution:** Clear existing data first or use different UUIDs

**3. RLS Policy Blocking Insert:**
```
ERROR: new row violates row-level security policy
```
**Solution:** Use service role key or temporarily disable RLS

**4. Date/Time Format Error:**
```
ERROR: invalid input syntax for type timestamp
```
**Solution:** Use ISO 8601 format: `2025-11-03T10:00:00Z`

---

## Security Considerations

### Sensitive Data

**What NOT to include in seed data:**
- ❌ Real user passwords (handled by Supabase Auth)
- ❌ Real email addresses (use fake/test emails)
- ❌ Real personal information
- ❌ Production API keys
- ❌ Real video/audio recordings

**Safe for seeding:**
- ✅ Sample interview transcripts
- ✅ Generic feedback text
- ✅ Placeholder recording URLs
- ✅ Test user profiles
- ✅ Fictional job descriptions

### RLS Testing

After seeding, verify users can only access their own data:

```sql
-- As user e5f6g7h8-... (Karthik)
SET request.jwt.claim.sub = 'e5f6g7h8-...';

-- Should only see Karthik's interviews
SELECT * FROM interviews;

-- Should NOT see other users' interviews
SELECT * FROM interviews WHERE user_id != (
  SELECT id FROM users WHERE userid = 'e5f6g7h8-...'
);
-- Expected: 0 rows (blocked by RLS)
```

---

## Appendix: UUID Generation

For consistency, use this pattern for UUIDs:

**Interviews:**
- `int-001-<random>` through `int-020-<random>`

**Questions:**
- `q-001-<random>` through `q-120-<random>`

**Answers:**
- `a-001-<random>` through `a-120-<random>`

**Reports:**
- `rep-001-<random>` through `rep-014-<random>`

**Comments:**
- `com-001-<random>` through `com-025-<random>`

**Audit Logs:**
- `audit-001-<random>` through `audit-060-<random>`

**Generate UUIDs:**
```sql
SELECT gen_random_uuid(); -- PostgreSQL
-- or
SELECT uuid_generate_v4(); -- With uuid-ossp extension
```

---

## Conclusion

This comprehensive population plan provides:
- ✅ Complete data for all 10 database tables
- ✅ Realistic scenarios covering all interview modes
- ✅ Proper foreign key relationships
- ✅ Malpractice detection examples
- ✅ Team collaboration data
- ✅ Full audit trail
- ✅ Verification and testing procedures

**Ready for implementation:** Execute `seed_sample_data.sql` to populate the database.

---

**Document Version:** 1.0
**Last Updated:** November 3, 2025
**Status:** Ready for Execution
