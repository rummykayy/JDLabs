# Database Migration Summary

## Migration Preparation Completed ✅

All necessary files and scripts have been created to migrate your JD Labs application from the old Supabase database to the new one.

---

## What Has Been Done

### 1. Configuration Files Updated ✅

All application configuration files have been updated with new database credentials:

#### Updated Files:
- **[.env](.env)** - New Supabase URL and anon key configured
- **[supabaseService.ts](supabaseService.ts)** - Hardcoded credentials updated to new database
- **[.mcp.json](.mcp.json)** - MCP server configuration updated with new project reference

#### Backup Created:
- **[.env.backup](.env.backup)** - Backup of old credentials for reference/rollback

---

### 2. Migration Scripts Created ✅

#### [migrate-database.js](migrate-database.js)
A comprehensive Node.js script that will:
- Test connections to both old and new databases
- Export complete database schema with all tables, types, functions, and triggers
- Export auth users list for reference
- Migrate all data tables in correct order (respecting foreign key dependencies)
- Handle batch processing with error recovery
- Provide detailed progress reporting

**Tables to be migrated:**
1. `users` (4 records)
2. `profiles` (4 records)
3. `jobs` (29 records)
4. `languages` (40 records)
5. `settings` (4 records)
6. `interviews` (30 records)
7. `interview_questions` (82 records)
8. `interview_answers` (79 records)
9. `interview_assessments` (0 records)
10. `performance_reports` (0 records)
11. `comments` (0 records)
12. `messages` (0 records)
13. `screen_shares` (0 records)
14. `audit_logs` (45 records)
15. `payments` (4 records)
16. `usage` (4 records)

**Total Records to Migrate: ~321 records**

---

### 3. Documentation Created ✅

#### [MIGRATION-GUIDE.md](MIGRATION-GUIDE.md)
Comprehensive step-by-step guide covering:
- Getting service role key from new database
- Applying database schema via SQL Editor
- Migrating auth users (5 users)
- Running the migration script
- Configuring storage buckets
- Verification steps
- Troubleshooting common issues
- Rollback procedures

---

## Database Schema Overview

### Tables (16 total)
- Core tables: users, profiles, interviews
- Related tables: interview_questions, interview_answers, interview_assessments
- Reference tables: jobs, languages
- Supporting tables: comments, messages, screen_shares, audit_logs
- Subscription tables: payments, usage, settings

### Functions (3 total)
1. `handle_new_user()` - Trigger function for new user setup
2. `update_updated_at_column()` - Timestamp update trigger
3. `process_interview_end()` - Complex interview finalization logic

### Custom Types (5 total)
- `interview_status` - ENUM for interview states
- `question_section` - ENUM for question categories
- `message_sender` - ENUM for message types
- `plans` - ENUM for subscription plans
- `interview_type` - ENUM for interview modes

### Storage Bucket
- `interview-recordings` - For video/audio recordings

---

## Next Steps (Action Required)

### Step 1: Get Service Role Key 🔑
**Action Required:** You need to get the service role key from your new Supabase project.

1. Go to: https://supabase.com/dashboard/project/vwlfkdlabssnildaztvo/settings/api
2. Copy the "service_role" key (keep it secret!)
3. Add it to your `.env` file:
   ```
   NEW_SUPABASE_SERVICE_ROLE_KEY=your_key_here
   ```

---

### Step 2: Run Migration Script 🚀

Once you have the service role key:

```bash
# Make sure you're in the project directory
cd "c:\Users\karthik\Downloads\JD Labs\JDLabs-main"

# Install dependencies if needed
npm install @supabase/supabase-js dotenv

# Run the migration script
node migrate-database.js
```

The script will:
1. Test connections to both databases
2. Create `schema-migration.sql` file
3. Create `auth-users-export.json` file
4. Wait for you to apply the schema in SQL Editor
5. Migrate all data tables
6. Show migration summary

---

### Step 3: Apply Schema in SQL Editor 📋

The migration script will create a file called `schema-migration.sql`. You need to:

1. Open Supabase SQL Editor: https://supabase.com/dashboard/project/vwlfkdlabssnildaztvo/sql/new
2. Copy the contents of `schema-migration.sql`
3. Paste into SQL Editor
4. Click "Run"
5. Verify all tables are created

---

### Step 4: Migrate Auth Users 👥

You have 5 auth users to migrate:

**Option A: Manual Recreation (Recommended)**
1. Go to new project Auth page: https://supabase.com/dashboard/project/vwlfkdlabssnildaztvo/auth/users
2. Create each user manually with "Add User" button
3. Send password reset emails to all users

**Option B: Use auth-users-export.json**
- The file contains user metadata for reference
- Password hashes cannot be migrated (security feature)
- Users will need to reset passwords

---

### Step 5: Test the Application 🧪

After migration:

```bash
# Rebuild the application
npm run build

# Start the server
npm start
```

Open http://localhost:3000 and verify:
- ✅ Languages are loading in setup screen
- ✅ User can register/login
- ✅ Can create new interview
- ✅ Can view past interviews
- ✅ Data displays correctly

---

## Files Created

| File | Purpose |
|------|---------|
| `migrate-database.js` | Main migration script |
| `MIGRATION-GUIDE.md` | Detailed step-by-step instructions |
| `MIGRATION-SUMMARY.md` | This file - overview of changes |
| `.env.backup` | Backup of old credentials |
| `schema-migration.sql` | Will be created by script - database schema |
| `auth-users-export.json` | Will be created by script - auth users export |

---

## Configuration Changes Summary

### Old Configuration
```
SUPABASE_URL=https://ctsqmhhjacigvhmhndhh.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...hNdhh...
```

### New Configuration
```
SUPABASE_URL=https://vwlfkdlabssnildaztvo.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...dHZvIi...
```

---

## Known Issues & Solutions

### Issue: Languages Not Loading
**Cause:** Languages table empty in new database
**Solution:** Migration script will copy all 40 languages from old database

### Issue: Auth Users Need Passwords
**Cause:** Password hashes cannot be exported for security
**Solution:** Users must reset passwords after migration

### Issue: Video Recordings Not Accessible
**Cause:** Storage bucket needs to be configured
**Solution:** Follow Step 5 in MIGRATION-GUIDE.md to set up storage

---

## Rollback Plan

If something goes wrong:

1. **Update `.env`:**
   ```bash
   # Copy from .env.backup
   SUPABASE_URL=https://ctsqmhhjacigvhmhndhh.supabase.co
   SUPABASE_ANON_KEY=eyJhbGci...old_key...
   ```

2. **Update `supabaseService.ts`:**
   Revert lines 7-8 to old credentials

3. **Update `.mcp.json`:**
   Change project_ref back to `ctsqmhhjacigvhmhndhh`

4. **Restart application:**
   ```bash
   npm run build
   npm start
   ```

---

## Support & Troubleshooting

If you encounter issues:

1. **Check the logs** - Both migration script and application logs
2. **Review MIGRATION-GUIDE.md** - Detailed troubleshooting section
3. **Verify credentials** - Ensure all keys are correct
4. **Check Supabase dashboard** - Verify project is active and not paused

---

## Timeline

**Preparation:** ✅ Complete
**Next:** Run migration script (15-30 minutes)
**Total Estimated Time:** 1-2 hours including testing

---

## Security Notes

⚠️ **Important Security Reminders:**
- Service role keys bypass Row Level Security - keep them secret!
- Never commit service role keys to Git
- The old database credentials are backed up in `.env.backup`
- Consider rotating API keys after migration is complete

---

## Success Criteria

Migration is successful when:
- ✅ All tables exist in new database
- ✅ All ~321 records migrated
- ✅ Auth users recreated (5 users)
- ✅ Application connects to new database
- ✅ Languages load correctly (40 languages)
- ✅ Users can login and use features
- ✅ No console errors
- ✅ Interviews can be created and viewed

---

## Contact & Resources

- **Supabase Documentation:** https://supabase.com/docs
- **Project Dashboard (New):** https://supabase.com/dashboard/project/vwlfkdlabssnildaztvo
- **Project Dashboard (Old):** https://supabase.com/dashboard/project/ctsqmhhjacigvhmhndhh

---

**Ready to proceed? Follow the steps in MIGRATION-GUIDE.md to complete the migration!** 🚀
