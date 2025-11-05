/**
 * Database Migration Script
 * Migrates schema and data from old Supabase instance to new one
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Old database credentials
const OLD_SUPABASE_URL = 'https://ctsqmhhjacigvhmhndhh.supabase.co';
const OLD_SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0c3FtaGhqYWNpZ3ZobWhuZGhoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODExNzIxNywiZXhwIjoyMDczNjkzMjE3fQ.exYYA74_Hf0YuRAKzoyvCENLKxLYahbJJiXJbq75Dmg';

// New database credentials
const NEW_SUPABASE_URL = 'https://vwlfkdlabssnildaztvo.supabase.co';
const NEW_SUPABASE_SERVICE_KEY = process.env.NEW_SUPABASE_SERVICE_ROLE_KEY || '';

if (!NEW_SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: NEW_SUPABASE_SERVICE_ROLE_KEY is not set in environment');
  console.log('Please get the service role key from your new Supabase project dashboard:');
  console.log('https://supabase.com/dashboard/project/vwlfkdlabssnildaztvo/settings/api');
  process.exit(1);
}

// Create clients
const oldSupabase = createClient(OLD_SUPABASE_URL, OLD_SUPABASE_SERVICE_KEY);
const newSupabase = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_SERVICE_KEY);

console.log('🚀 Starting Database Migration...\n');

// Tables to migrate in order (respecting foreign key dependencies)
const TABLES_TO_MIGRATE = [
  'users',
  'profiles',
  'jobs',
  'languages',
  'settings',
  'interviews',
  'interview_questions',
  'interview_answers',
  'interview_assessments',
  'performance_reports',
  'comments',
  'messages',
  'screen_shares',
  'audit_logs',
  'payments',
  'usage'
];

/**
 * Test connection to both databases
 */
async function testConnections() {
  console.log('🔌 Testing database connections...');

  try {
    const { data: oldData, error: oldError } = await oldSupabase.from('users').select('count');
    if (oldError) throw new Error(`Old DB: ${oldError.message}`);
    console.log('  ✅ Old database connected');

    const { data: newData, error: newError } = await newSupabase.from('users').select('count');
    // It's okay if table doesn't exist yet in new DB
    console.log('  ✅ New database connected');

    return true;
  } catch (error) {
    console.error('  ❌ Connection test failed:', error.message);
    return false;
  }
}

/**
 * Apply schema from old database to new database
 */
async function applySchema() {
  console.log('\n📋 Applying database schema...');

  // Create schema migration SQL
  const schemaSql = `
    -- Enable UUID extension
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- Create custom types
    DO $$ BEGIN
      CREATE TYPE interview_status AS ENUM ('lobby', 'in_progress', 'completed', 'cancelled');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      CREATE TYPE question_section AS ENUM ('salutation', 'introduction', 'core', 'soft_skills', 'conclusion', 'sell_job');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      CREATE TYPE message_sender AS ENUM ('ai', 'user');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      CREATE TYPE plans AS ENUM ('free', 'plus', 'pro');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      CREATE TYPE interview_type AS ENUM ('chat', 'audio', 'video', 'live');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    -- Create users table
    CREATE TABLE IF NOT EXISTS public.users (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT DEFAULT '',
      name TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now(),
      userid UUID UNIQUE NOT NULL,
      role TEXT NOT NULL DEFAULT '',
      plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise'))
    );

    -- Create profiles table
    CREATE TABLE IF NOT EXISTS public.profiles (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID UNIQUE REFERENCES public.users(id),
      avatar_url TEXT,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now(),
      resume TEXT,
      role TEXT DEFAULT '',
      federation_provider TEXT,
      skills JSON,
      user_type TEXT DEFAULT '',
      name TEXT
    );

    -- Create jobs table
    CREATE TABLE IF NOT EXISTS public.jobs (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      company_name TEXT,
      location TEXT,
      employment_type TEXT,
      salary_range TEXT,
      requirements TEXT,
      created_by UUID,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now(),
      is_active BOOLEAN DEFAULT true
    );

    -- Create languages table
    CREATE TABLE IF NOT EXISTS public.languages (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      code TEXT UNIQUE NOT NULL,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    -- Create settings table
    CREATE TABLE IF NOT EXISTS public.settings (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      key TEXT UNIQUE,
      value JSONB,
      updated_at TIMESTAMPTZ DEFAULT now(),
      user_id UUID REFERENCES public.users(id)
    );

    -- Create interviews table
    CREATE TABLE IF NOT EXISTS public.interviews (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      candidate_name TEXT NOT NULL,
      position TEXT NOT NULL,
      status interview_status DEFAULT 'lobby',
      started_at TIMESTAMPTZ,
      ended_at TIMESTAMPTZ,
      duration_minutes INTEGER,
      overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now(),
      video_url TEXT,
      malpractice_report TEXT,
      difficulty TEXT,
      jobDescription TEXT,
      language TEXT,
      mode TEXT,
      model TEXT,
      user_id UUID REFERENCES public.users(id),
      transcript JSON
    );

    -- Create interview_questions table
    CREATE TABLE IF NOT EXISTS public.interview_questions (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      interview_id UUID REFERENCES public.interviews(id),
      question_text TEXT NOT NULL,
      question_order INTEGER NOT NULL,
      asked_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT now(),
      question_section question_section
    );

    -- Create interview_answers table
    CREATE TABLE IF NOT EXISTS public.interview_answers (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      interview_id UUID REFERENCES public.interviews(id) NOT NULL,
      question_id UUID REFERENCES public.interview_questions(id) NOT NULL,
      answer_text TEXT,
      answer_audio_url TEXT,
      answer_video_url TEXT,
      duration_seconds INTEGER,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    -- Create messages table
    CREATE TABLE IF NOT EXISTS public.messages (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      interview_id UUID REFERENCES public.interviews(id),
      sender message_sender NOT NULL,
      content TEXT NOT NULL,
      is_question BOOLEAN DEFAULT false,
      timestamp TIMESTAMPTZ DEFAULT now(),
      created_at TIMESTAMPTZ DEFAULT now()
    );

    -- Create interview_assessments table
    CREATE TABLE IF NOT EXISTS public.interview_assessments (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      interview_id UUID REFERENCES public.interviews(id),
      category TEXT NOT NULL,
      score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
      level TEXT NOT NULL,
      feedback TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    -- Create performance_reports table
    CREATE TABLE IF NOT EXISTS public.performance_reports (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      interview_id UUID REFERENCES public.interviews(id) NOT NULL,
      candidate_id UUID REFERENCES public.users(id) NOT NULL,
      interviewer_id UUID REFERENCES public.users(id),
      overall_score NUMERIC CHECK (overall_score >= 0 AND overall_score <= 10),
      technical_score NUMERIC,
      communication_score NUMERIC,
      problem_solving_score NUMERIC,
      feedback TEXT,
      recommendation TEXT CHECK (recommendation IN ('strongly_recommend', 'recommend', 'neutral', 'not_recommend', 'strongly_not_recommend')),
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    -- Create comments table
    CREATE TABLE IF NOT EXISTS public.comments (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      interview_id UUID REFERENCES public.interviews(id) NOT NULL,
      user_id UUID REFERENCES public.users(id) NOT NULL,
      comment_text TEXT,
      is_internal BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    -- Create screen_shares table
    CREATE TABLE IF NOT EXISTS public.screen_shares (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      interview_id UUID REFERENCES public.interviews(id) NOT NULL,
      recording_url TEXT,
      started_at TIMESTAMPTZ DEFAULT now(),
      ended_at TIMESTAMPTZ,
      duration_seconds INTEGER,
      file_size_mb NUMERIC,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    -- Create audit_logs table
    CREATE TABLE IF NOT EXISTS public.audit_logs (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID,
      entity TEXT,
      entity_id UUID,
      action TEXT,
      details JSONB,
      created_at TIMESTAMPTZ DEFAULT now(),
      table_name TEXT
    );

    -- Create payments table
    CREATE TABLE IF NOT EXISTS public.payments (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES public.users(id),
      plan plans,
      mode_of_payment TEXT,
      invoice_id TEXT,
      amount NUMERIC,
      status TEXT,
      period_start TIMESTAMPTZ,
      period_end TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT now(),
      vendor_invoice_id TEXT,
      vendor_name TEXT,
      vendor_status TEXT,
      vendor_charges NUMERIC
    );

    -- Create usage table
    CREATE TABLE IF NOT EXISTS public.usage (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES public.users(id) NOT NULL,
      plan plans,
      mode interview_type,
      count INTEGER,
      recorded_at TIMESTAMPTZ DEFAULT now()
    );

    -- Create update_updated_at_column function
    CREATE OR REPLACE FUNCTION public.update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

    -- Create triggers for updated_at
    DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
    CREATE TRIGGER update_users_updated_at
      BEFORE UPDATE ON public.users
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

    DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
    CREATE TRIGGER update_profiles_updated_at
      BEFORE UPDATE ON public.profiles
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

    DROP TRIGGER IF EXISTS update_interviews_updated_at ON public.interviews;
    CREATE TRIGGER update_interviews_updated_at
      BEFORE UPDATE ON public.interviews
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

    DROP TRIGGER IF EXISTS update_comments_updated_at ON public.comments;
    CREATE TRIGGER update_comments_updated_at
      BEFORE UPDATE ON public.comments
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

    DROP TRIGGER IF EXISTS update_performance_reports_updated_at ON public.performance_reports;
    CREATE TRIGGER update_performance_reports_updated_at
      BEFORE UPDATE ON public.performance_reports
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

    -- Create handle_new_user function and trigger
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO public.usage (user_id) VALUES (NEW.id);
      INSERT INTO public.profiles (user_id) VALUES (NEW.id);
      INSERT INTO public.payments (user_id) VALUES (NEW.id);
      INSERT INTO public.audit_logs (user_id, entity) VALUES (NEW.id, 'user');
      INSERT INTO public.settings (key, value) VALUES ('user_' || NEW.id::text, jsonb_build_object('user_id', NEW.id));
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    DROP TRIGGER IF EXISTS on_auth_user_created ON public.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON public.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

    -- Enable RLS
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.interview_questions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.interview_assessments ENABLE ROW LEVEL SECURITY;
  `;

  try {
    // Note: Supabase doesn't allow running DDL via the client API
    // You'll need to run this manually in the SQL editor
    console.log('  ⚠️  Schema must be applied manually via SQL Editor');
    console.log('  📝 SQL file will be saved to: schema-migration.sql');

    return schemaSql;
  } catch (error) {
    console.error('  ❌ Schema application failed:', error.message);
    throw error;
  }
}

/**
 * Migrate data from one table
 */
async function migrateTable(tableName) {
  console.log(`\n📦 Migrating table: ${tableName}...`);

  try {
    // Fetch all data from old database
    const { data: oldData, error: fetchError } = await oldSupabase
      .from(tableName)
      .select('*');

    if (fetchError) {
      throw new Error(`Fetch error: ${fetchError.message}`);
    }

    if (!oldData || oldData.length === 0) {
      console.log(`  ℹ️  No data found in ${tableName}`);
      return { success: true, count: 0 };
    }

    console.log(`  📊 Found ${oldData.length} records`);

    // Insert data into new database in batches
    const BATCH_SIZE = 100;
    let successCount = 0;

    for (let i = 0; i < oldData.length; i += BATCH_SIZE) {
      const batch = oldData.slice(i, i + BATCH_SIZE);

      const { error: insertError } = await newSupabase
        .from(tableName)
        .insert(batch);

      if (insertError) {
        console.error(`  ⚠️  Batch insert error (records ${i}-${i + batch.length}):`, insertError.message);
        // Try inserting records one by one
        for (const record of batch) {
          const { error: singleError } = await newSupabase
            .from(tableName)
            .insert([record]);

          if (!singleError) {
            successCount++;
          } else {
            console.error(`    ❌ Failed to insert record:`, singleError.message);
          }
        }
      } else {
        successCount += batch.length;
      }

      console.log(`  ✅ Migrated ${successCount}/${oldData.length} records`);
    }

    return { success: true, count: successCount };
  } catch (error) {
    console.error(`  ❌ Migration failed for ${tableName}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Export auth users data
 */
async function exportAuthUsers() {
  console.log('\n👥 Exporting auth.users data...');
  console.log('  ⚠️  Auth users must be migrated manually via Supabase Dashboard');
  console.log('  📖 Follow: https://supabase.com/docs/guides/platform/migrating-and-upgrading-projects');

  // Export user list for reference
  const { data: authUsers, error } = await oldSupabase.auth.admin.listUsers();

  if (error) {
    console.error('  ❌ Failed to export auth users:', error.message);
    return null;
  }

  console.log(`  📊 Found ${authUsers.users.length} auth users`);
  return authUsers.users;
}

/**
 * Main migration function
 */
async function main() {
  try {
    // Step 1: Test connections
    const connected = await testConnections();
    if (!connected) {
      console.error('\n❌ Migration aborted due to connection issues');
      process.exit(1);
    }

    // Step 2: Apply schema
    const schemaSql = await applySchema();

    // Save schema to file
    const fs = await import('fs');
    fs.writeFileSync(
      'c:\\Users\\karthik\\Downloads\\JD Labs\\JDLabs-main\\schema-migration.sql',
      schemaSql,
      'utf8'
    );
    console.log('  ✅ Schema SQL saved to schema-migration.sql');
    console.log('\n⚠️  IMPORTANT: Please run the schema-migration.sql file in your new Supabase SQL Editor first!');
    console.log('Then press Enter to continue with data migration...');

    // Wait for user confirmation
    await new Promise(resolve => {
      process.stdin.once('data', resolve);
    });

    // Step 3: Export auth users
    const authUsers = await exportAuthUsers();
    if (authUsers) {
      fs.writeFileSync(
        'c:\\Users\\karthik\\Downloads\\JD Labs\\JDLabs-main\\auth-users-export.json',
        JSON.stringify(authUsers, null, 2),
        'utf8'
      );
      console.log('  ✅ Auth users exported to auth-users-export.json');
    }

    // Step 4: Migrate data tables
    console.log('\n\n🔄 Starting data migration...');
    const results = {};

    for (const table of TABLES_TO_MIGRATE) {
      const result = await migrateTable(table);
      results[table] = result;
    }

    // Step 5: Summary
    console.log('\n\n' + '='.repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(60));

    let totalRecords = 0;
    let failedTables = [];

    for (const [table, result] of Object.entries(results)) {
      if (result.success) {
        console.log(`✅ ${table.padEnd(30)} ${result.count} records`);
        totalRecords += result.count;
      } else {
        console.log(`❌ ${table.padEnd(30)} FAILED: ${result.error}`);
        failedTables.push(table);
      }
    }

    console.log('='.repeat(60));
    console.log(`Total records migrated: ${totalRecords}`);

    if (failedTables.length > 0) {
      console.log(`\n⚠️  Failed tables: ${failedTables.join(', ')}`);
    }

    console.log('\n✅ Migration completed!');
    console.log('\n📝 Next steps:');
    console.log('  1. Update your .env file with new database credentials');
    console.log('  2. Manually migrate auth.users via Supabase Dashboard');
    console.log('  3. Test your application with the new database');
    console.log('  4. Update any hardcoded references to old database');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
main();
