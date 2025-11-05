
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
  