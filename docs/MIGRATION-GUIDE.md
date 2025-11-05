# Database Migration Guide

## Overview
This guide will help you migrate your JD Labs application from the old Supabase instance to the new one.

**Old Database:** `https://ctsqmhhjacigvhmhndhh.supabase.co`
**New Database:** `https://vwlfkdlabssnildaztvo.supabase.co`

---

## Migration Steps

### Step 1: Get Service Role Key from New Database

1. Go to your new Supabase project dashboard:
   ```
   https://supabase.com/dashboard/project/vwlfkdlabssnildaztvo/settings/api
   ```

2. Copy the **Service Role Key** (keep this secret!)

3. Open `.env` file and add it:
   ```
   NEW_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

---

### Step 2: Apply Database Schema

1. Open the Supabase SQL Editor for your new project:
   ```
   https://supabase.com/dashboard/project/vwlfkdlabssnildaztvo/sql/new
   ```

2. Open the file `schema-migration.sql` (will be created when you run the migration script)

3. Copy the entire SQL content and paste it into the SQL Editor

4. Click **"Run"** to execute the schema

5. Verify all tables are created by checking the Table Editor

---

### Step 3: Migrate Auth Users

Auth users must be migrated manually through the Supabase Dashboard:

1. Go to your OLD project's Authentication page:
   ```
   https://supabase.com/dashboard/project/ctsqmhhjacigvhmhndhh/auth/users
   ```

2. Export users (you can use the `auth-users-export.json` file created by the migration script)

3. Go to your NEW project's Authentication page:
   ```
   https://supabase.com/dashboard/project/vwlfkdlabssnildaztvo/auth/users
   ```

4. Import users one by one or use Supabase CLI:
   ```bash
   # Install Supabase CLI if not already installed
   npm install -g supabase

   # Login to Supabase
   supabase login

   # Link to your project
   supabase link --project-ref vwlfkdlabssnildaztvo

   # You may need to manually recreate users via Dashboard
   ```

**Important Notes:**
- User passwords cannot be exported/imported
- Users will need to use "Forgot Password" to reset their passwords
- Or you can send password reset emails to all users after migration

---

### Step 4: Run Data Migration Script

1. Make sure you've completed Steps 1-3 first

2. Install dependencies if needed:
   ```bash
   npm install @supabase/supabase-js dotenv
   ```

3. Run the migration script:
   ```bash
   node migrate-database.js
   ```

4. The script will:
   - Test connections to both databases
   - Export schema to `schema-migration.sql`
   - Export auth users to `auth-users-export.json`
   - Wait for you to apply the schema manually
   - Migrate all data tables in the correct order

5. Monitor the console output for any errors

---

### Step 5: Configure Storage Buckets

1. Go to your new project's Storage page:
   ```
   https://supabase.com/dashboard/project/vwlfkdlabssnildaztvo/storage/buckets
   ```

2. Create the `interview-recordings` bucket:
   - Click "Create bucket"
   - Name: `interview-recordings`
   - Public: No (keep private)
   - File size limit: 50 MB (or as needed)
   - Allowed MIME types: `video/webm, video/mp4, audio/*`

3. Set up RLS policies for the bucket:
   ```sql
   -- Allow authenticated users to upload their own recordings
   CREATE POLICY "Users can upload their own recordings"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'interview-recordings' AND auth.uid()::text = (storage.foldername(name))[1]);

   -- Allow users to read their own recordings
   CREATE POLICY "Users can read their own recordings"
   ON storage.objects FOR SELECT
   TO authenticated
   USING (bucket_id = 'interview-recordings' AND auth.uid()::text = (storage.foldername(name))[1]);
   ```

4. Migrate existing files (if any):
   - Download files from old bucket
   - Re-upload to new bucket (or use Supabase Storage API)

---

### Step 6: Update Configuration Files

The following files have already been updated:

✅ `.env` - Updated with new database credentials
✅ `supabaseService.ts` - Updated with new Supabase URL and keys

---

### Step 7: Verify Migration

1. **Check Database Connection:**
   ```bash
   npm start
   ```

2. **Verify Tables:**
   - Open new Supabase project Table Editor
   - Check that all tables exist and have data

3. **Test Core Features:**
   - User registration/login
   - Creating an interview
   - Viewing past interviews
   - Language selection (check if languages table is populated)

4. **Check the Application:**
   - Open http://localhost:3000
   - Try logging in with an existing user
   - Check if languages are loading in the setup screen
   - Create a test interview

---

### Step 8: Seed Essential Data

If languages or jobs tables are empty, run the seeding script:

```bash
npm run seed
```

Or manually insert languages via SQL Editor:

```sql
-- Insert common programming languages
INSERT INTO public.languages (name, code, is_active) VALUES
  ('JavaScript', 'javascript', true),
  ('Python', 'python', true),
  ('Java', 'java', true),
  ('TypeScript', 'typescript', true),
  ('C++', 'cpp', true),
  ('C#', 'csharp', true),
  ('Go', 'go', true),
  ('Rust', 'rust', true),
  ('PHP', 'php', true),
  ('Ruby', 'ruby', true)
ON CONFLICT (code) DO NOTHING;
```

---

## Post-Migration Checklist

- [ ] All tables created in new database
- [ ] Data migrated successfully
- [ ] Auth users recreated/imported
- [ ] Storage buckets configured
- [ ] RLS policies applied
- [ ] Application configuration files updated
- [ ] Application tested and working
- [ ] Languages loading correctly
- [ ] Jobs loading correctly
- [ ] User authentication working
- [ ] Interview creation/viewing working

---

## Rollback Plan

If something goes wrong, you can rollback:

1. Update `.env` back to old credentials:
   ```
   SUPABASE_URL=https://ctsqmhhjacigvhmhndhh.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0c3FtaGhqYWNpZ3ZobWhuZGhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMTcyMTcsImV4cCI6MjA3MzY5MzIxN30.hNhSQ1qoMBOKtKz5IiwhLo8HmgSpkRZzlegCxobhTa0
   ```

2. Update `supabaseService.ts` with old credentials

3. Restart the application

---

## Troubleshooting

### Languages Not Loading

If languages are not loading on the setup screen:

1. Check if languages table has data:
   ```sql
   SELECT * FROM public.languages WHERE is_active = true;
   ```

2. If empty, insert languages (see Step 8)

3. Check browser console for errors

4. Verify RLS policies allow reading languages

### Database Connection Issues

1. Verify credentials in `.env` and `supabaseService.ts` match

2. Check Supabase project is not paused

3. Check API keys are correct

4. Check network connectivity

### Migration Script Errors

1. Ensure both old and new databases are accessible

2. Check service role key is correct

3. Run migration script with verbose logging

4. Try migrating tables individually if batch migration fails

---

## Support

For issues during migration:
- Check Supabase documentation: https://supabase.com/docs
- Review application logs
- Check browser console for frontend errors
- Verify all environment variables are set correctly

---

## Files Created During Migration

- `schema-migration.sql` - Complete database schema
- `auth-users-export.json` - Exported auth users
- `.env.backup` - Backup of old credentials
- `migrate-database.js` - Migration script
- `MIGRATION-GUIDE.md` - This guide
