import { createClient, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
import type { InterviewSettings, Interview, Job, Language, PerformanceReport, Comment, AuditLog, AuditAction } from '../../shared/types/types';
import { uploadInterviewAssets } from './uploadService';

// The Supabase client is initialized here and will be used across the service functions.
// Environment variables are injected by the build process (esbuild define) into process.env
const supabaseUrl = "https://ctsqmhhjacigvhmhndhh.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0c3FtaGhqYWNpZ3ZobWhuZGhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMTcyMTcsImV4cCI6MjA3MzY5MzIxN30.hNhSQ1qoMBOKtKz5IiwhLo8HmgSpkRZzlegCxobhTa0";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and anon key are required. Check your .env file configuration.");
}

// Debug: Log Supabase configuration (URL is public, key is redacted)
console.log('🔌 Initializing Supabase with URL:', supabaseUrl.substring(0, 50) + '...');
console.log('🔧 Supabase Config:', {
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: false,
  storageAvailable: typeof window !== 'undefined' && !!window.localStorage
});

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Disable automatic token refresh to prevent connection buildup
    autoRefreshToken: true,
    // Persist session in localStorage (but we'll manage it properly)
    persistSession: true,
    // Don't detect session in URL
    detectSessionInUrl: false,
    // Use localStorage for session storage
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
  global: {
    headers: {
      'X-Client-Info': 'jdlabs-interview-platform',
    },
  },
  db: {
    schema: 'public',
  },
  // Realtime configuration to prevent connection leaks
  realtime: {
    params: {
      eventsPerSecond: 2,
    },
  },
});

// Add event listener to log localStorage changes for debugging
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key?.includes('supabase.auth.token')) {
      console.log('📦 LocalStorage auth token changed:', {
        key: e.key,
        oldValue: e.oldValue ? 'EXISTS' : 'NULL',
        newValue: e.newValue ? 'EXISTS' : 'NULL'
      });
    }
  });

  // Log all unhandled errors
  window.addEventListener('error', (event) => {
    if (event.message?.toLowerCase().includes('supabase') ||
      event.message?.toLowerCase().includes('auth')) {
      console.error('🚨 [Global Error] Unhandled error related to Supabase:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    }
  });

  // Log all unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.message?.toLowerCase().includes('supabase') ||
      event.reason?.message?.toLowerCase().includes('auth')) {
      console.error('🚨 [Global Promise Rejection] Unhandled rejection related to Supabase:', {
        reason: event.reason,
        promise: event.promise
      });
    }
  });
}

// --- Resilience & Error Handling ---

/**
 * Logs Supabase API calls for debugging
 */
const logSupabaseCall = (operation: string, details: any) => {
  console.log(`📡 [Supabase API] ${operation}`, details);
};

const logSupabaseError = (operation: string, error: any) => {
  console.error(`❌ [Supabase API Error] ${operation}`, {
    message: error?.message || 'Unknown error',
    code: error?.code,
    details: error?.details,
    hint: error?.hint,
    status: error?.status
  });
};

/**
 * Adds timeout protection to API calls.
 * Prevents requests from hanging indefinitely.
 */
export const withTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number = 30000
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`API request timed out after ${timeoutMs}ms`)),
        timeoutMs
      )
    )
  ]);
};

/**
 * Adds retry logic with exponential backoff.
 * Handles transient network failures gracefully.
 */
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelayMs: number = 500
): Promise<T> => {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Don't retry on client errors (400, 401, 403, 404)
      if (error.status && error.status >= 400 && error.status < 500) {
        throw error;
      }

      if (attempt === maxRetries) {
        console.error(`Failed after ${maxRetries} retries:`, error);
        throw error;
      }

      // Exponential backoff: 500ms, 1s, 2s
      const delayMs = initialDelayMs * Math.pow(2, attempt - 1);
      console.warn(
        `⚠️ Attempt ${attempt}/${maxRetries} failed, retrying in ${delayMs}ms:`,
        error.message
      );

      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
};

// --- User & Auth ---

/**
 * Ensures a user profile exists in the public.users table.
 * Uses an atomic 'upsert' operation to prevent race conditions where a profile
 * might be created by a database trigger simultaneously.
 * @param user The authenticated user object from Supabase.
 */
export const ensureUserProfile = async (user: SupabaseUser): Promise<void> => {
  const { error } = await supabase.from('users').upsert(
    {
      userid: user.id, // The column to match on
      email: user.email,
      name: user.user_metadata?.name || user.email,
      // 'id' is the primary key and will be auto-generated on insert
    },
    { onConflict: 'userid' } // If a user with this `userid` exists, do nothing.
  );
  if (error) console.error("Error ensuring user profile:", error);
};

/**
 * Signs up a new user and creates their profile.
 * @param name The user's full name.
 * @param email The user's email.
 * @param password The user's password.
 * @returns An object with the user and session data, or an error.
 */
export const signUp = async (name: string, email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  // The handle_new_user trigger in Supabase should create the public.users record.
  if (!error && data.user) {
    await createAuditLog(data.user.id, 'USER_REGISTER', data.user.id, 'auth.users', {
      changes: {
        created: {
          email: data.user.email,
          name: name
        }
      },
      summary: `New user registered: ${name} (${data.user.email})`,
      registration_method: 'email_password'
    });
  }
  return { user: data.user, session: data.session, error };
};

/**
 * Signs in a user with email and password.
 * @param email The user's email.
 * @param password The user's password.
 * @returns An object with user and session data, or an error.
 */
export const signIn = async (email: string, password: string) => {
  console.log('🔑 [signIn] Starting sign-in process for:', email);
  console.log('🔑 [signIn] Current localStorage keys:', Object.keys(localStorage).filter(k => k.includes('supabase')));

  logSupabaseCall('auth.signInWithPassword', { email });

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error('❌ [signIn] Sign-in failed:', error.message);
    logSupabaseError('auth.signInWithPassword', error);
    return { user: null, session: null, error };
  }

  console.log('✅ [signIn] Sign-in successful:', {
    userId: data.user?.id,
    email: data.user?.email,
    hasSession: !!data.session,
    sessionExpiresAt: data.session?.expires_at
  });

  // Check if session is stored in localStorage
  const storedSession = localStorage.getItem('sb-ctsqmhhjacigvhmhndhh-auth-token');
  console.log('📦 [signIn] Session stored in localStorage:', storedSession ? 'YES' : 'NO');

  if (data.user) {
    // Ensure user profile exists (non-blocking, fire and forget)
    ensureUserProfile(data.user)
      .catch(profileError => console.error('⚠️ [signIn] Failed to ensure user profile:', profileError));

    // Non-blocking audit log: fire and forget to avoid slowing down login
    createAuditLog(data.user.id, 'USER_LOGIN', data.user.id, 'auth.users', {
      summary: `User logged in successfully`,
      login_method: 'email_password',
      timestamp: new Date().toISOString()
    })
      .catch(logError => console.error('⚠️ [signIn] Failed to create login audit log:', logError));
  }

  return { user: data.user, session: data.session, error };
};

/**
 * Initiates a sign-in with Google's OAuth provider.
 */
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
  });
  return { data, error };
};

/**
 * Signs out the current user.
 * Creates an audit log entry before signing out to capture the logout event.
 * Ensures the audit log is created before the session is destroyed.
 */
export const signOut = async (userId: string | undefined): Promise<void> => {
  console.log('🚪 [signOut] Starting logout process for user:', userId);
  console.log('🚪 [signOut] Current localStorage keys before logout:', Object.keys(localStorage).filter(k => k.includes('supabase')));

  // Create audit log BEFORE signing out, while we still have access to user data
  if (userId) {
    try {
      console.log('📝 [signOut] Creating audit log entry...');
      // Wait for audit log to be created before signing out
      await createAuditLog(userId, 'USER_LOGOUT', userId, 'auth.users', {
        summary: `User logged out successfully`,
        logout_scope: 'local',
        timestamp: new Date().toISOString()
      });
      console.log('✅ [signOut] Audit log created successfully');
    } catch (logError) {
      // Log the error but don't prevent sign-out
      console.error("⚠️ [signOut] Failed to create logout audit log:", logError);
    }
  }

  // Sign out with 'local' scope to clear the session from this device only
  console.log('🔓 [signOut] Calling supabase.auth.signOut()...');
  const { error } = await supabase.auth.signOut({ scope: 'local' });

  if (error) {
    console.error("❌ [signOut] Sign out error:", error);
    // Re-throw the error so the UI layer can catch it and display a toast
    throw error;
  }

  console.log('✅ [signOut] Sign out successful');
  console.log('🚪 [signOut] LocalStorage keys after logout:', Object.keys(localStorage).filter(k => k.includes('supabase')));

  // Check if session is actually removed from localStorage
  const storedSession = localStorage.getItem('sb-ctsqmhhjacigvhmhndhh-auth-token');
  console.log('📦 [signOut] Session still in localStorage:', storedSession ? 'YES (PROBLEM!)' : 'NO (GOOD)');
};


/**
 * Retrieves a user's public profile from the 'users' table.
 * @param userId The authentication ID of the user.
 * @returns The user profile object or null if not found.
 */
export const getUserProfile = async (userId: string) => {
  console.log('👤 [getUserProfile] Fetching profile for user:', userId);

  try {
    // Add timeout to prevent hanging (increased to 20s for slow connections)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('getUserProfile timeout after 20s')), 20000);
    });

    logSupabaseCall('users.select', { userId });

    const fetchPromise = supabase
      .from('users')
      .select('*')
      .eq('userid', userId)
      .single();

    const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

    if (error) {
      console.error('❌ [getUserProfile] Error fetching user profile:', error.message);
      console.error('❌ [getUserProfile] Error details:', {
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      logSupabaseError('users.select', error);
      return null;
    }

    if (!data) {
      console.warn('⚠️ [getUserProfile] No profile data returned for user:', userId);
      return null;
    }

    console.log('✅ [getUserProfile] Profile fetched successfully:', {
      userId: data.id,
      name: data.name,
      email: data.email
    });

    return data;
  } catch (error: any) {
    console.error('❌ [getUserProfile] Exception fetching profile:', error.message);
    return null;
  }
};

// --- Interviews ---
/**
 * Creates a new interview record.
 * Crucially, it first fetches the internal primary key from the `users` table
 * based on the `authUserId` to satisfy the foreign key constraint on `interviews.user_id`.
 * @param authUserId The user's authentication ID (from auth.uid()).
 * @param settings The settings for the interview.
 * @returns The newly created interview object or null on failure.
 */
export const createInterview = async (authUserId: string, settings: InterviewSettings): Promise<Interview | null> => {
  try {
    // Step 1: Fetch the user's internal profile ID (`id`) from the 'users' table
    // using their authentication ID (`userid` column).
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id')
      .eq('userid', authUserId)
      .single();

    if (profileError || !userProfile) {
      console.error(`Foreign key lookup failed: Could not find a user profile for auth user ID: ${authUserId}`, profileError);
      throw new Error(`Could not find a user profile for the current user.`);
    }

    // Step 2: Use the fetched internal primary key (`userProfile.id`) for the foreign key `user_id`
    // when inserting the new record into the 'interviews' table.
    const interviewData = {
      user_id: userProfile.id, // This now correctly references users.id
      candidate_name: settings.candidateName,
      position: settings.position,
      jobDescription: settings.jobDescription,
      mode: settings.mode,
      language: settings.language,
      model: settings.model,
      difficulty: settings.difficulty,
      status: 'lobby' as const,
    };

    const { data: newInterview, error: interviewError } = await supabase
      .from('interviews')
      .insert(interviewData)
      .select()
      .single();

    if (interviewError) {
      console.error('Database error creating interview:', interviewError);
      throw interviewError;
    }

    await createAuditLog(authUserId, 'INTERVIEW_CREATE', newInterview.id, 'interviews', {
      changes: {
        created: {
          position: newInterview.position,
          mode: newInterview.mode,
          difficulty: newInterview.difficulty,
          language: newInterview.language,
          candidate_name: newInterview.candidate_name
        }
      },
      summary: `Created interview for position: ${newInterview.position}`,
      interview_mode: newInterview.mode,
      interview_difficulty: newInterview.difficulty
    });

    return newInterview;
  } catch (error: any) {
    console.error('Error in createInterview function:', error.message);
    return null;
  }
};

/**
 * Finalizes an interview by uploading assets and updating the record.
 * @param params Object containing all necessary data to finalize.
 * @returns Object with success status and optional error message.
 */
export const finalizeInterview = async (params: {
  interviewId: string;
  userId: string;
  transcript: string | null;
  malpracticeReport: string | null;
  reportData: any;
  mediaBlob: Blob | null;
  qna: { question: string, answer: string }[];
}): Promise<{ success: boolean; error?: string }> => {
  const { interviewId, userId, transcript, malpracticeReport, reportData, mediaBlob, qna } = params;

  console.log('📊 [finalizeInterview] Starting interview finalization:', {
    interviewId,
    userId,
    hasTranscript: !!transcript,
    transcriptLength: transcript?.length || 0,
    hasMalpracticeReport: !!malpracticeReport,
    hasReportData: !!reportData,
    hasMediaBlob: !!mediaBlob,
    mediaBlobSize: mediaBlob?.size || 0,
    qnaCount: qna?.length || 0
  });

  try {
    let mediaPath: string | null = null;
    if (mediaBlob) {
      console.log('📤 [finalizeInterview] Uploading media blob to storage...');
      const filePath = `${userId}/recordings/${interviewId}.webm`;
      const { error: uploadError } = await supabase.storage
        .from('interview-recordings')
        .upload(filePath, mediaBlob, { upsert: true });

      if (uploadError) {
        console.error('❌ [finalizeInterview] Media upload failed:', uploadError);
        throw new Error(`Media upload failed: ${uploadError.message}`);
      }
      mediaPath = filePath;
      console.log('✅ [finalizeInterview] Media uploaded successfully:', filePath);
    } else {
      console.log('ℹ️ [finalizeInterview] No media blob to upload');
    }

    // Calculate interview duration from the difference between now and started_at
    // Fetch the interview's started_at time first
    const { data: interviewData, error: fetchError } = await supabase
      .from('interviews')
      .select('started_at')
      .eq('id', interviewId)
      .single();

    let durationMinutes = 0;
    if (!fetchError && interviewData?.started_at) {
      const startTime = new Date(interviewData.started_at).getTime();
      const endTime = new Date().getTime();
      durationMinutes = Math.round((endTime - startTime) / 60000); // Convert ms to minutes
    }

    // Update interview record with all necessary fields
    console.log('💾 [finalizeInterview] Updating interview record...');
    const { error: interviewUpdateError } = await supabase
      .from('interviews')
      .update({
        malpractice_report: malpracticeReport,
        video_url: mediaPath,
        status: 'completed',
        ended_at: new Date().toISOString(),
        duration_minutes: durationMinutes,
        overall_score: reportData?.overallRating || null,
        transcript: transcript || null, // Store as-is, no JSON parsing needed
      })
      .eq('id', interviewId);

    if (interviewUpdateError) {
      console.error('❌ [finalizeInterview] Failed to update interview:', interviewUpdateError);
      throw new Error(`Failed to update interview: ${interviewUpdateError.message}`);
    }
    console.log('✅ [finalizeInterview] Interview record updated successfully');

    // Insert Questions and Answers if they exist
    if (qna && qna.length > 0) {
      console.log(`📝 [finalizeInterview] Saving ${qna.length} Q&A pairs...`);

      // Insert questions with proper ordering
      const questionRecordsToInsert = qna.map((pair, index) => ({
        interview_id: interviewId,
        question_text: pair.question,
        question_order: index + 1, // Add ordering
        asked_at: new Date(new Date().getTime() - (qna.length - index - 1) * 60000).toISOString(), // Estimate times
      }));

      const { data: insertedQuestions, error: questionsError } = await supabase
        .from('interview_questions')
        .insert(questionRecordsToInsert)
        .select('id, question_text, question_order');

      if (questionsError) {
        console.error('❌ [finalizeInterview] Error saving interview questions:', questionsError.message);
        throw new Error(`Failed to save interview questions: ${questionsError.message}`);
      }

      console.log(`✅ [finalizeInterview] Saved ${insertedQuestions?.length || 0} questions`);

      if (insertedQuestions && insertedQuestions.length > 0) {
        // Map original QnA pairs to inserted questions and create answer records
        const answerRecordsToInsert = insertedQuestions.map(dbQuestion => {
          const originalPair = qna.find(p => p.question === dbQuestion.question_text);
          return {
            interview_id: interviewId,
            question_id: dbQuestion.id,
            answer_text: originalPair?.answer || '',
            duration_seconds: Math.round((originalPair?.answer?.length || 0) / 10), // Estimate duration from answer length
            created_at: new Date().toISOString(),
          };
        }).filter(a => a.question_id);

        if (answerRecordsToInsert.length > 0) {
          const { error: answersError } = await supabase
            .from('interview_answers')
            .insert(answerRecordsToInsert);

          if (answersError) {
            console.error('❌ [finalizeInterview] Error saving interview answers:', answersError.message);
            throw new Error(`Failed to save interview answers: ${answersError.message}`);
          }
          console.log(`✅ [finalizeInterview] Saved ${answerRecordsToInsert.length} answers`);
        }
      }
    } else {
      console.log('ℹ️ [finalizeInterview] No Q&A pairs to save');
    }

    // Create performance report if data exists
    if (reportData?.overallRating !== undefined && reportData !== null) {
      // Get user's internal ID for foreign key
      const { data: userProfile } = await supabase
        .from('users')
        .select('id')
        .eq('userid', userId)
        .single();

      if (userProfile) {
        // Format feedback with metrics details
        const metricsText = reportData.metrics?.map((m: any) => `${m.name}: ${m.rating}/10 - ${m.reasoning}`).join('\n') || '';
        const feedbackContent = `Overall Reasoning: ${reportData.overallReasoning}\n\nMetrics:\n${metricsText}\n\nStrengths:\n- ${reportData.strengths?.join('\n- ')}\n\nAreas for Improvement:\n- ${reportData.areasForImprovement?.join('\n- ')}`;

        // Map AI recommendation to database enum values
        const recommendationMap: { [key: string]: string } = {
          'Recommended for Hire': 'strongly_recommend',
          'Needs Improvement': 'neutral',
          'Not a Fit': 'not_recommend'
        };
        const dbRecommendation = recommendationMap[reportData.recommendation] || 'neutral';

        console.log('📊 [finalizeInterview] Mapping recommendation:', {
          aiRecommendation: reportData.recommendation,
          dbRecommendation: dbRecommendation
        });

        console.log('📈 [finalizeInterview] Creating performance report...');
        const { error: reportError } = await supabase
          .from('performance_reports')
          .insert({
            interview_id: interviewId,
            interviewer_id: userProfile.id,
            candidate_id: userProfile.id, // For now, same as interviewer
            overall_score: reportData.overallRating,
            recommendation: dbRecommendation,
            feedback: feedbackContent,
            technical_score: reportData.metrics?.find((m: any) => m.name.toLowerCase().includes('technical'))?.rating || null,
            communication_score: reportData.metrics?.find((m: any) => m.name.toLowerCase().includes('communication'))?.rating || null,
            problem_solving_score: reportData.metrics?.find((m: any) => m.name.toLowerCase().includes('problem'))?.rating || null,
            created_at: new Date().toISOString(),
          });
        if (reportError) {
          console.error("❌ [finalizeInterview] Error creating performance report:", reportError.message);
          // Don't throw - continue with the process as we have core interview data saved
        } else {
          console.log('✅ [finalizeInterview] Performance report created successfully');
        }
      }
    } else {
      console.log('ℹ️ [finalizeInterview] No performance report data to save');
    }

    await createAuditLog(userId, 'INTERVIEW_FINALIZE', interviewId, 'interviews', {
      changes: {
        updated: {
          status: 'completed',
          ended_at: new Date().toISOString(),
          duration_minutes: durationMinutes,
          overall_score: reportData?.overallRating || null,
          questions_answered: qna?.length || 0
        }
      },
      summary: `Finalized interview with ${qna?.length || 0} questions, score: ${reportData?.overallRating || 'N/A'}`,
      questionCount: qna?.length || 0,
      hasVideo: !!mediaPath,
      hasMalpractice: !!malpracticeReport,
      durationMinutes: durationMinutes,
      overallScore: reportData?.overallRating
    });

    console.log('🎉 [finalizeInterview] Interview finalization completed successfully!');
    return { success: true };
  } catch (error: any) {
    console.error('❌ [finalizeInterview] Error finalizing interview:', error);
    return { success: false, error: error.message };
  }
};


// --- Data Fetching ---

export const getInterviewsForUser = async (authUserId: string): Promise<Interview[]> => {
  // First, get the user's internal ID from their auth UUID
  const { data: userProfile } = await supabase
    .from('users')
    .select('id')
    .eq('userid', authUserId)
    .single();

  if (!userProfile) {
    console.error("User profile not found for auth ID:", authUserId);
    return [];
  }

  // Now fetch interviews using the internal user ID
  const { data, error } = await supabase
    .from('interviews')
    .select('*')
    .eq('user_id', userProfile.id)
    .order('created_at', { ascending: false });
  if (error) console.error("Error fetching user's interviews:", error);
  return data || [];
};

export const getReportForInterview = async (interviewId: string): Promise<PerformanceReport | null> => {
  const { data, error } = await supabase
    .from('performance_reports')
    .select('*')
    .eq('interview_id', interviewId)
    .maybeSingle(); // Use maybeSingle to avoid errors when no report exists
  if (error) console.error("Error fetching report for interview:", error);
  return data;
};

export const getCommentsForInterview = async (interviewId: string): Promise<Comment[]> => {
  const { data, error } = await supabase
    .from('comments')
    .select('*, users(name)') // Join with users table to get the commenter's name
    .eq('interview_id', interviewId)
    .order('created_at', { ascending: true });
  if (error) console.error("Error fetching comments:", error);
  return data || [];
};

export const addComment = async (comment: Omit<Comment, 'id' | 'created_at' | 'updated_at'>): Promise<Comment | null> => {
  console.log('💬 [addComment] Adding comment for user_id:', comment.user_id);

  // The user_id passed in is the auth userid, but the foreign key expects the internal users.id
  // Look up the internal ID
  const { data: userProfile } = await supabase
    .from('users')
    .select('id')
    .eq('userid', comment.user_id)
    .single();

  if (!userProfile) {
    console.error('❌ [addComment] User not found in users table for userid:', comment.user_id);
    return null;
  }

  console.log('✅ [addComment] Mapped userid to internal id:', {
    authUserId: comment.user_id,
    internalUserId: userProfile.id
  });

  // Use the internal ID for the foreign key
  const commentWithInternalId = {
    ...comment,
    user_id: userProfile.id
  };

  const { data, error } = await supabase
    .from('comments')
    .insert(commentWithInternalId)
    .select()
    .single();

  if (error) {
    console.error("❌ [addComment] Error adding comment:", error);
    return null;
  }

  console.log('✅ [addComment] Comment added successfully');
  return data;
};

export const getRecordingDownloadUrl = async (mediaPath: string): Promise<string | null> => {
  const { data, error } = await supabase.storage
    .from('interview-recordings')
    .createSignedUrl(mediaPath, 3600); // URL valid for 1 hour
  if (error) {
    console.error("Error creating signed URL for recording:", error);
    return null;
  }
  return data.signedUrl;
};


export const getJobs = async (): Promise<Job[]> => {
  const { data, error } = await supabase.from('jobs').select('*');
  if (error) console.error("Error fetching jobs:", error);
  return data || [];
};

export const getLanguages = async (): Promise<Language[]> => {
  const { data, error } = await supabase.from('languages').select('*').eq('is_active', true);
  if (error) console.error("Error fetching languages:", error);
  return data || [];
};


// --- Database-related queries for interview review ---

export const getQuestionsForInterview = async (interviewId: string) => {
  const { data, error } = await supabase.from('interview_questions').select('*').eq('interview_id', interviewId);
  if (error) throw error;
  return data || [];
};

export const getAnswersForInterview = async (questionIds: string[]) => {
  const { data, error } = await supabase.from('interview_answers').select('*').in('question_id', questionIds);
  if (error) throw error;
  return data || [];
};

// --- Auditing ---

/**
 * Creates an audit log entry with user name and detailed change information
 * @param userId The auth user ID performing the action
 * @param action The action being performed (e.g., 'USER_LOGIN', 'INTERVIEW_CREATE')
 * @param entityId The ID of the entity being acted upon
 * @param tableName The table name where the action occurred
 * @param details Object containing detailed change information (what changed, old/new values, etc.)
 */
export const createAuditLog = async (userId: string, action: AuditAction | string, entityId: string, tableName?: string, details?: object) => {
  try {
    // Fetch user's name from the users table for the entity column
    let userName = 'Unknown User';
    try {
      const { data: userProfile } = await supabase
        .from('users')
        .select('name, email')
        .eq('userid', userId)
        .single();

      if (userProfile) {
        userName = userProfile.name || userProfile.email || 'Unknown User';
      }
    } catch (userError) {
      console.warn('Could not fetch user name for audit log, using default');
    }

    // Create comprehensive details object with change information
    const auditDetails = {
      ...details,
      action_type: action,
      table: tableName,
      timestamp: new Date().toISOString(),
      user_info: {
        user_id: userId,
        user_name: userName
      }
    };

    // Insert audit log with user name in entity column
    const log: Omit<AuditLog, 'id' | 'created_at'> = {
      user_id: userId,
      entity: userName, // Store user's name in entity column
      entity_id: entityId,
      action: action,
      table_name: tableName,
      details: auditDetails // Store detailed change information
    };

    const { error } = await supabase.from('audit_logs').insert(log);
    if (error) {
      console.error(`Failed to create audit log for action ${action}:`, error);
    }
  } catch (error: any) {
    console.error('Error in createAuditLog:', error.message);
  }
};

// --- Debugging & Verification ---

/**
 * A utility function for debugging. Checks if a specific hardcoded user
 * exists in the public.users table and alerts the result.
 * This is now exported so it can be used by the Header component.
 */
export const verifyUserRecord = async () => {
  const targetEmail = 'veerabathirankarthik@gmail.com';
  try {
    const { data, error } = await supabase
      .from('users')
      .select('userid, name, email')
      .eq('email', targetEmail)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // "single row not found"
        alert(`User with email "${targetEmail}" was NOT found in the public.users table.`);
      } else {
        throw error;
      }
    } else if (data) {
      alert(`SUCCESS: User record found!\n\nEmail: ${data.email}\nName: ${data.name}\nUserID: ${data.userid}`);
    }
  } catch (error: any) {
    console.error('Error during user verification:', error);
    alert(`An error occurred while verifying the user: ${error.message}`);
  }
};

// ============================================================================
// EXTENDED CRUD OPERATIONS
// ============================================================================

// --- User Profile Management ---

/**
 * Updates user profile information (name, email, plan, etc.)
 * @param userId The auth user ID (userid column)
 * @param updates Object containing fields to update
 * @returns Updated user profile or null on error
 */
export const updateUserProfile = async (
  userId: string,
  updates: { name?: string; email?: string; plan?: string }
) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('userid', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }

    await createAuditLog(userId, 'USER_PROFILE_UPDATE', userId, 'users', {
      changes: {
        updated: updates
      },
      summary: `Updated profile: ${Object.keys(updates).join(', ')}`,
      fields_changed: Object.keys(updates)
    });
    return data;
  } catch (error: any) {
    console.error('Failed to update user profile:', error.message);
    return null;
  }
};

/**
 * Gets user's current subscription plan
 * @param userId The auth user ID
 * @returns User's plan information
 */
export const getUserPlan = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('plan, created_at')
      .eq('userid', userId)
      .single();

    if (error) throw error;
    return data?.plan || 'free'; // Default to free plan
  } catch (error) {
    console.error('Error fetching user plan:', error);
    return 'free';
  }
};

/**
 * Updates user's subscription plan
 * @param userId The auth user ID
 * @param plan The plan name ('free', 'pro', 'enterprise')
 * @returns Success boolean
 */
export const updateUserPlan = async (userId: string, plan: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        plan,
        updated_at: new Date().toISOString()
      })
      .eq('userid', userId);

    if (error) throw error;

    await createAuditLog(userId, 'USER_PLAN_CHANGE', userId, 'users', {
      changes: {
        updated: {
          plan: plan
        }
      },
      summary: `Changed subscription plan to: ${plan}`,
      new_plan: plan
    });
    return true;
  } catch (error) {
    console.error('Error updating user plan:', error);
    return false;
  }
};

// --- Comment Management (UPDATE/DELETE) ---

/**
 * Updates an existing comment
 * @param commentId The comment ID to update
 * @param commentText The new comment text
 * @param userId The user making the update (for authorization check)
 * @returns Updated comment or null
 */
export const updateComment = async (
  commentId: string,
  commentText: string,
  userId: string
): Promise<Comment | null> => {
  try {
    // Get user's internal ID
    const { data: userProfile } = await supabase
      .from('users')
      .select('id')
      .eq('userid', userId)
      .single();

    if (!userProfile) return null;

    // RLS will ensure user can only update their own comments
    const { data, error } = await supabase
      .from('comments')
      .update({
        comment_text: commentText,
        updated_at: new Date().toISOString(),
      })
      .eq('id', commentId)
      .eq('user_id', userProfile.id) // Ensure user owns this comment
      .select()
      .single();

    if (error) {
      console.error('Error updating comment:', error);
      throw error;
    }

    return data;
  } catch (error: any) {
    console.error('Failed to update comment:', error.message);
    return null;
  }
};

/**
 * Deletes a comment
 * @param commentId The comment ID to delete
 * @param userId The user attempting deletion (for authorization)
 * @returns Success boolean
 */
export const deleteComment = async (
  commentId: string,
  userId: string
): Promise<boolean> => {
  try {
    // Get user's internal ID
    const { data: userProfile } = await supabase
      .from('users')
      .select('id')
      .eq('userid', userId)
      .single();

    if (!userProfile) return false;

    // RLS will ensure user can only delete their own comments
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', userProfile.id);

    if (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }

    return true;
  } catch (error: any) {
    console.error('Failed to delete comment:', error.message);
    return false;
  }
};

// --- Interview Scheduling ---

/**
 * Schedules an interview for a future time
 * @param authUserId The user's authentication ID
 * @param settings Interview settings including scheduledTime
 * @returns Created interview with scheduled status
 */
export const scheduleInterview = async (
  authUserId: string,
  settings: InterviewSettings & { scheduledTime: string }
): Promise<Interview | null> => {
  try {
    // Get user's internal ID
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id')
      .eq('userid', authUserId)
      .single();

    if (profileError || !userProfile) {
      throw new Error('Could not find user profile');
    }

    // Create interview with scheduled status
    const interviewData = {
      user_id: userProfile.id,
      candidate_name: settings.candidateName,
      position: settings.position,
      jobDescription: settings.jobDescription,
      mode: settings.mode,
      language: settings.language,
      model: settings.model,
      difficulty: settings.difficulty,
      status: 'scheduled' as const,
      started_at: settings.scheduledTime, // Store scheduled time in started_at
    };

    const { data: newInterview, error: interviewError } = await supabase
      .from('interviews')
      .insert(interviewData)
      .select()
      .single();

    if (interviewError) throw interviewError;

    await createAuditLog(
      authUserId,
      'INTERVIEW_SCHEDULE',
      newInterview.id,
      'interviews',
      {
        changes: {
          created: {
            scheduled_time: settings.scheduledTime,
            position: settings.position,
            status: 'scheduled'
          }
        },
        summary: `Scheduled interview for ${settings.position} at ${settings.scheduledTime}`,
        scheduledTime: settings.scheduledTime,
        position: settings.position
      }
    );

    return newInterview;
  } catch (error: any) {
    console.error('Error scheduling interview:', error.message);
    return null;
  }
};

/**
 * Gets all scheduled interviews for a user
 * @param userId The auth user ID
 * @returns Array of scheduled interviews
 */
export const getScheduledInterviews = async (userId: string): Promise<Interview[]> => {
  try {
    // First get user's internal ID
    const { data: userProfile } = await supabase
      .from('users')
      .select('id')
      .eq('userid', userId)
      .single();

    if (!userProfile) return [];

    const { data, error } = await supabase
      .from('interviews')
      .select('*')
      .eq('user_id', userProfile.id)
      .eq('status', 'scheduled')
      .order('started_at', { ascending: true }); // Order by scheduled time

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching scheduled interviews:', error);
    return [];
  }
};

/**
 * Updates interview status (e.g., from scheduled to in_progress)
 * @param interviewId Interview ID
 * @param status New status
 * @returns Success boolean
 */
export const updateInterviewStatus = async (
  interviewId: string,
  status: 'lobby' | 'in_progress' | 'completed' | 'cancelled' | 'scheduled'
): Promise<boolean> => {
  try {
    const updates: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    // If starting interview, set started_at
    if (status === 'in_progress' && !updates.started_at) {
      updates.started_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('interviews')
      .update(updates)
      .eq('id', interviewId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating interview status:', error);
    return false;
  }
};

/**
 * Cancels a scheduled interview
 * @param interviewId Interview ID to cancel
 * @param userId User requesting cancellation
 * @returns Success boolean
 */
export const cancelInterview = async (
  interviewId: string,
  userId: string
): Promise<boolean> => {
  try {
    const success = await updateInterviewStatus(interviewId, 'cancelled');

    if (success) {
      await createAuditLog(
        userId,
        'INTERVIEW_CANCEL',
        interviewId,
        'interviews',
        {
          changes: {
            updated: {
              status: 'cancelled'
            }
          },
          summary: `Cancelled interview`,
          previous_status: 'scheduled'
        }
      );
    }

    return success;
  } catch (error) {
    console.error('Error cancelling interview:', error);
    return false;
  }
};

// --- Interview Deletion (Soft Delete Pattern) ---

/**
 * Soft deletes an interview and all related data
 * @param interviewId Interview ID to delete
 * @param userId User requesting deletion (for authorization)
 * @returns Success boolean
 */
export const deleteInterview = async (
  interviewId: string,
  userId: string
): Promise<boolean> => {
  try {
    // For now, we'll mark as cancelled instead of hard delete
    // In production, you'd add a deleted_at column
    const success = await updateInterviewStatus(interviewId, 'cancelled');

    if (success) {
      await createAuditLog(
        userId,
        'DATA_DELETE',
        interviewId,
        'interviews',
        {
          changes: {
            updated: {
              status: 'cancelled',
              deleted: true
            }
          },
          summary: `Soft deleted interview`,
          type: 'soft_delete',
          deletion_method: 'status_change_to_cancelled'
        }
      );
    }

    return success;
  } catch (error) {
    console.error('Error deleting interview:', error);
    return false;
  }
};
