-- ============================================================================
-- JD Labs - Storage Buckets and RLS Policies Setup
-- FOR OLD DATABASE: https://ctsqmhhjacigvhmhndhh.supabase.co
-- ============================================================================
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ctsqmhhjacigvhmhndhh/sql/new
-- ============================================================================

-- ============================================================================
-- PART 1: STORAGE BUCKETS SETUP
-- ============================================================================

-- Create interview-recordings bucket for video/audio files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'interview-recordings',
  'interview-recordings',
  false, -- Private bucket
  52428800, -- 50 MB limit
  ARRAY['video/webm', 'video/mp4', 'audio/webm', 'audio/mp3', 'audio/wav', 'audio/mpeg']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['video/webm', 'video/mp4', 'audio/webm', 'audio/mp3', 'audio/wav', 'audio/mpeg'];

-- Create screen-recordings bucket for screen share recordings
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'screen-recordings',
  'screen-recordings',
  false, -- Private bucket
  104857600, -- 100 MB limit
  ARRAY['video/webm', 'video/mp4']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY['video/webm', 'video/mp4'];

-- Create user-avatars bucket for profile pictures
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-avatars',
  'user-avatars',
  true, -- Public bucket (avatars can be public)
  2097152, -- 2 MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 2097152,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- ============================================================================
-- PART 2: STORAGE RLS POLICIES
-- ============================================================================

-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can upload own interview recordings" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own interview recordings" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own interview recordings" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own interview recordings" ON storage.objects;

DROP POLICY IF EXISTS "Users can upload own screen recordings" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own screen recordings" ON storage.objects;

DROP POLICY IF EXISTS "Anyone can read avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;

-- ============================================================================
-- Interview Recordings Bucket Policies
-- ============================================================================

-- Policy: Users can upload their own interview recordings
CREATE POLICY "Users can upload own interview recordings"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'interview-recordings'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can read their own interview recordings
CREATE POLICY "Users can read own interview recordings"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'interview-recordings'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update their own interview recordings
CREATE POLICY "Users can update own interview recordings"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'interview-recordings'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own interview recordings
CREATE POLICY "Users can delete own interview recordings"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'interview-recordings'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================================================
-- Screen Recordings Bucket Policies
-- ============================================================================

-- Policy: Users can upload their own screen recordings
CREATE POLICY "Users can upload own screen recordings"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'screen-recordings'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can read their own screen recordings
CREATE POLICY "Users can read own screen recordings"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'screen-recordings'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================================================
-- User Avatars Bucket Policies
-- ============================================================================

-- Policy: Anyone can read avatars (public bucket)
CREATE POLICY "Anyone can read avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'user-avatars');

-- Policy: Authenticated users can upload their own avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update their own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'user-avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================================================
-- PART 3: TABLE RLS POLICIES (CRITICAL FOR LANGUAGE LOADING)
-- ============================================================================

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can read active languages" ON public.languages;
DROP POLICY IF EXISTS "Anyone can read active jobs" ON public.jobs;

-- ============================================================================
-- Languages Table RLS Fix (THIS FIXES THE LANGUAGE LOADING ISSUE)
-- ============================================================================

-- Enable RLS on languages table
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone (including anonymous users) can read active languages
CREATE POLICY "Anyone can read active languages"
ON public.languages FOR SELECT
TO public
USING (is_active = true);

-- ============================================================================
-- Jobs Table RLS Fix
-- ============================================================================

-- Enable RLS on jobs table
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active jobs
CREATE POLICY "Anyone can read active jobs"
ON public.jobs FOR SELECT
TO public
USING (is_active = true);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Run these to verify setup:

-- Check storage buckets
SELECT id, name, public, file_size_limit FROM storage.buckets;

-- Check storage policies
SELECT schemaname, tablename, policyname, roles
FROM pg_policies
WHERE schemaname = 'storage'
ORDER BY tablename, policyname;

-- Check languages are accessible
SELECT COUNT(*) as active_languages FROM public.languages WHERE is_active = true;

-- Check jobs are accessible
SELECT COUNT(*) as active_jobs FROM public.jobs WHERE is_active = true;

-- Check table RLS status
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('languages', 'jobs')
ORDER BY tablename;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Storage buckets and RLS policies have been set up successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Created:';
  RAISE NOTICE '  - interview-recordings bucket (50 MB)';
  RAISE NOTICE '  - screen-recordings bucket (100 MB)';
  RAISE NOTICE '  - user-avatars bucket (2 MB)';
  RAISE NOTICE '';
  RAISE NOTICE '  - Storage RLS policies (12 policies)';
  RAISE NOTICE '  - Table RLS policies for languages and jobs';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Rebuild application: npm run build';
  RAISE NOTICE '  2. Start application: npm start';
  RAISE NOTICE '  3. Test language dropdown on setup screen';
  RAISE NOTICE '  4. Test creating an interview';
END $$;

-- ============================================================================
-- END OF SETUP SCRIPT
-- ============================================================================
