# ✅ Database Setup Complete - Old Database

## Overview

Configuration has been reverted to the **old/original database**, and all necessary setup scripts have been created. This guide will help you complete the storage bucket setup and fix the language loading issue.

---

## 🔄 What Was Done

### **1. Reverted to Old Database** ✅
- **[.env](.env:7-9)** - Reverted to old Supabase URL and keys
- **[supabaseService.ts](supabaseService.ts:7-8)** - Reverted hardcoded credentials
- **[.mcp.json](.mcp.json:5)** - Reverted MCP project reference

**Current Database:**
```
URL: https://ctsqmhhjacigvhmhndhh.supabase.co
Project ID: ctsqmhhjacigvhmhndhh
```

### **2. Fixed TypeScript Types** ✅
- **[types.ts:34](types.ts#L34)** - Fixed `Language.id` from `number` to `string` (UUID)
- **[types.ts:88](types.ts#L88)** - Added missing `interview_id` field to `InterviewAnswer`

### **3. Created Storage Setup Script** ✅
- **[setup-old-database-storage.sql](setup-old-database-storage.sql)** - Complete storage and RLS setup

---

## 🚀 **CRITICAL STEP: Apply Storage Setup**

This step **MUST** be completed to fix the language loading issue.

### **Step 1: Open SQL Editor** (2 minutes)

1. Go to your Supabase dashboard:
   ```
   https://supabase.com/dashboard/project/ctsqmhhjacigvhmhndhh/sql/new
   ```

2. Open the file: **[setup-old-database-storage.sql](setup-old-database-storage.sql)**

3. Copy **ENTIRE** contents (Ctrl+A, Ctrl+C)

4. Paste into SQL Editor

5. Click **"Run"** button

6. Wait for completion (2-5 seconds)

7. You should see success message in output

### **What This Does:**

✅ Creates 3 storage buckets:
- `interview-recordings` (50 MB) - For video/audio recordings
- `screen-recordings` (100 MB) - For screen shares
- `user-avatars` (2 MB) - For profile pictures

✅ Adds 12 storage RLS policies:
- Users can only access their own files
- Proper security for all buckets

✅ **FIXES LANGUAGE LOADING:**
- Adds RLS policy for public read access to languages
- Adds RLS policy for public read access to jobs

---

## 🧪 **Step 2: Test Everything**

After applying the SQL script:

```bash
# Rebuild application
npm run build

# Start server
npm start
```

Open http://localhost:3000 and verify:

### **Language Dropdown Test** ⭐
1. Go to setup screen
2. Check "Language" dropdown
3. **Should show 40 languages**
4. Select different languages to verify

### **Job Selection Test**
1. Check "Select Job" dropdown
2. Should show 29 jobs
3. Select different jobs to verify

### **Interview Creation Test**
1. Fill in all fields
2. Select language and job
3. Click "Start Interview"
4. **Should successfully create interview**

---

## 📊 Current Database Status

| Component | Status | Count/Details |
|-----------|--------|---------------|
| **Tables** | ✅ All exist | 16 tables |
| **Records** | ✅ Populated | ~321 records |
| **Languages** | ✅ Ready | 40 languages |
| **Jobs** | ✅ Ready | 29 jobs |
| **Interviews** | ✅ Ready | 31 interviews |
| **Storage Buckets** | ⏳ **NEED SETUP** | Run SQL script |
| **RLS Policies** | ⏳ **NEED SETUP** | Run SQL script |

---

## 🔧 Database Operations - All Fields Populated

The code now properly populates ALL database columns:

### **Interview Creation** ✅
```typescript
{
  user_id,              // ✅ Properly mapped from userid
  candidate_name,       // ✅ From settings
  position,             // ✅ From settings
  jobDescription,       // ✅ From settings
  mode,                 // ✅ From settings
  language,             // ✅ From settings
  model,                // ✅ From settings
  difficulty,           // ✅ From settings
  status: 'lobby',      // ✅ Default value
  created_at,           // ✅ Auto-generated
  updated_at            // ✅ Auto-generated
}
```

### **Interview Finalization** ✅
```typescript
{
  malpractice_report,   // ✅ From AI analysis
  video_url,            // ✅ From storage upload
  status: 'completed',  // ✅ Updated
  ended_at,             // ✅ Current timestamp
  duration_minutes,     // ✅ Calculated from started_at
  overall_score,        // ✅ From report data
  transcript,           // ✅ JSON transcript
  updated_at            // ✅ Current timestamp
}
```

### **Questions & Answers** ✅
```typescript
// Questions
{
  interview_id,         // ✅ Interview reference
  question_text,        // ✅ Question content
  question_order,       // ✅ Sequential order
  asked_at,             // ✅ Timestamp
  created_at            // ✅ Auto-generated
}

// Answers
{
  interview_id,         // ✅ Interview reference (FIXED)
  question_id,          // ✅ Question reference
  answer_text,          // ✅ Answer content
  duration_seconds,     // ✅ Answer duration
  created_at,           // ✅ Auto-generated
  updated_at            // ✅ Auto-generated
}
```

### **Performance Reports** ✅
```typescript
{
  interview_id,         // ✅ Interview reference
  interviewer_id,       // ✅ User internal ID
  candidate_id,         // ✅ User internal ID
  overall_score,        // ✅ From AI evaluation
  technical_score,      // ✅ From metrics
  communication_score,  // ✅ From metrics
  problem_solving_score,// ✅ From metrics
  feedback,             // ✅ Formatted text
  recommendation,       // ✅ Hire recommendation
  created_at            // ✅ Auto-generated
}
```

---

## 🎯 Root Cause - Language Loading Issue

### **Problem**
Language dropdown was empty on setup screen.

### **Root Cause**
1. **RLS enabled on `languages` table** but no policy for public access
2. Anonymous/unauthenticated users couldn't read languages
3. TypeScript type mismatch (`id: number` vs UUID string)

### **Solution**
The SQL script adds:
```sql
CREATE POLICY "Anyone can read active languages"
ON public.languages FOR SELECT
TO public
USING (is_active = true);
```

This allows:
- ✅ Anonymous users can read languages
- ✅ Authenticated users can read languages
- ✅ Only active languages are visible

---

## 📋 Verification Checklist

Before considering setup complete:

- [ ] Ran `setup-old-database-storage.sql` in SQL Editor
- [ ] Application builds successfully (`npm run build`)
- [ ] Application starts (`npm start`)
- [ ] Language dropdown shows 40 languages ⭐
- [ ] Can select different languages
- [ ] Job dropdown shows 29 jobs
- [ ] Can create test interview
- [ ] No browser console errors
- [ ] No TypeScript errors

---

## 🆘 Troubleshooting

### **Issue: Languages Still Not Loading**

**Check 1: RLS Policy Exists**
```sql
SELECT * FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'languages';
```

Expected: Should show policy "Anyone can read active languages"

**Check 2: Languages Exist**
```sql
SELECT COUNT(*) FROM languages WHERE is_active = true;
```

Expected: Should return 40

**Check 3: RLS Enabled**
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'languages';
```

Expected: `rowsecurity` should be `true`

**Solution:** Run the SQL script again if any check fails.

---

### **Issue: Cannot Upload Recordings**

**Check: Storage Buckets Exist**
```sql
SELECT id, name, public
FROM storage.buckets;
```

Expected: Should show:
- interview-recordings (public: false)
- screen-recordings (public: false)
- user-avatars (public: true)

**Solution:** Run the SQL script if buckets are missing.

---

### **Issue: Database Connection Error**

**Check: Environment Variables**
```bash
# In .env file
SUPABASE_URL=https://ctsqmhhjacigvhmhndhh.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...hNdhh...
```

**Check: Hardcoded Values**
```typescript
// In supabaseService.ts lines 7-8
const supabaseUrl = "https://ctsqmhhjacigvhmhndhh.supabase.co";
const supabaseAnonKey = "eyJhbGci...hNdhh...";
```

**Solution:** Ensure both match the old database credentials.

---

## 📁 Files Summary

### **Configuration Files**
| File | Status | Purpose |
|------|--------|---------|
| [.env](.env) | ✅ Reverted | Environment variables |
| [supabaseService.ts](supabaseService.ts) | ✅ Reverted | Database client |
| [.mcp.json](.mcp.json) | ✅ Reverted | MCP configuration |
| [types.ts](types.ts) | ✅ Fixed | TypeScript types |

### **Setup Scripts**
| File | Purpose |
|------|---------|
| **[setup-old-database-storage.sql](setup-old-database-storage.sql)** | ⭐ **RUN THIS** - Storage & RLS |

### **Documentation**
| File | Purpose |
|------|---------|
| [SETUP-COMPLETE-GUIDE.md](SETUP-COMPLETE-GUIDE.md) | This file - Setup guide |
| [DATABASE-SETUP-COMPLETE.md](DATABASE-SETUP-COMPLETE.md) | Migration guide (for reference) |
| [MIGRATION-GUIDE.md](MIGRATION-GUIDE.md) | Migration steps (for reference) |

---

## 🎉 Success Criteria

Setup is complete and successful when:

1. ✅ SQL script executed successfully
2. ✅ Application builds without errors
3. ✅ Application starts on port 3000
4. ✅ **Language dropdown shows 40 languages**
5. ✅ Job dropdown shows 29 jobs
6. ✅ Can create and complete interviews
7. ✅ Can upload interview recordings
8. ✅ No console errors

---

## 🚀 Quick Start Commands

```bash
# 1. Apply SQL setup (do this first in Supabase dashboard)
#    Open: https://supabase.com/dashboard/project/ctsqmhhjacigvhmhndhh/sql/new
#    Copy contents of: setup-old-database-storage.sql
#    Paste and click "Run"

# 2. Rebuild application
npm run build

# 3. Start application
npm start

# 4. Open in browser
# http://localhost:3000

# 5. Test language dropdown (should show 40 languages)
```

---

## 📞 Next Steps

1. **Apply SQL Script** - [setup-old-database-storage.sql](setup-old-database-storage.sql) ⭐
2. **Rebuild** - `npm run build`
3. **Test** - `npm start` and verify languages load
4. **Verify** - Check all items in verification checklist

**Estimated Time:** 5-10 minutes

---

**All files are ready. Just run the SQL script and test!** 🚀

---

## 💡 Additional Notes

- **TypeScript types** now match database schema exactly
- **All foreign key mappings** are correct (userid → user_id)
- **All table columns** are properly populated
- **Storage buckets** will be created by SQL script
- **RLS policies** ensure data security
- **Language loading** will work after SQL script runs

---

## 🔒 Security

Storage buckets use folder-based security:
```
/interview-recordings/{user_id}/{interview_id}.webm
/screen-recordings/{user_id}/{recording_id}.webm
/user-avatars/{user_id}/avatar.jpg
```

Users can only access files in their own folders.

---

**Ready to complete setup? Run the SQL script now!** ✨
