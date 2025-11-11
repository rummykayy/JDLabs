import { SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
import type { InterviewSettings, Interview, Job, Language, PerformanceReport, Comment, AuditAction } from './types';
export declare const supabase: SupabaseClient;
/**
 * Adds timeout protection to API calls.
 * Prevents requests from hanging indefinitely.
 */
export declare const withTimeout: <T>(promise: Promise<T>, timeoutMs?: number) => Promise<T>;
/**
 * Adds retry logic with exponential backoff.
 * Handles transient network failures gracefully.
 */
export declare const withRetry: <T>(fn: () => Promise<T>, maxRetries?: number, initialDelayMs?: number) => Promise<T>;
/**
 * Ensures a user profile exists in the public.users table.
 * Uses an atomic 'upsert' operation to prevent race conditions where a profile
 * might be created by a database trigger simultaneously.
 * @param user The authenticated user object from Supabase.
 */
export declare const ensureUserProfile: (user: SupabaseUser) => Promise<void>;
/**
 * Signs up a new user and creates their profile.
 * @param name The user's full name.
 * @param email The user's email.
 * @param password The user's password.
 * @returns An object with the user and session data, or an error.
 */
export declare const signUp: (name: string, email: string, password: string) => Promise<{
    user: SupabaseUser | null;
    session: import("@supabase/auth-js").Session | null;
    error: import("@supabase/auth-js").AuthError | null;
}>;
/**
 * Signs in a user with email and password.
 * @param email The user's email.
 * @param password The user's password.
 * @returns An object with user and session data, or an error.
 */
export declare const signIn: (email: string, password: string) => Promise<{
    user: null;
    session: null;
    error: import("@supabase/auth-js").AuthError;
} | {
    user: SupabaseUser;
    session: import("@supabase/auth-js").Session;
    error: null;
}>;
/**
 * Initiates a sign-in with Google's OAuth provider.
 */
export declare const signInWithGoogle: () => Promise<{
    data: {
        provider: import("@supabase/auth-js").Provider;
        url: string;
    } | {
        provider: import("@supabase/auth-js").Provider;
        url: null;
    };
    error: import("@supabase/auth-js").AuthError | null;
}>;
/**
 * Signs out the current user.
 * Creates an audit log entry before signing out to capture the logout event.
 * Ensures the audit log is created before the session is destroyed.
 */
export declare const signOut: (userId: string | undefined) => Promise<void>;
/**
 * Retrieves a user's public profile from the 'users' table.
 * @param userId The authentication ID of the user.
 * @returns The user profile object or null if not found.
 */
export declare const getUserProfile: (userId: string) => Promise<any>;
/**
 * Creates a new interview record.
 * Crucially, it first fetches the internal primary key from the `users` table
 * based on the `authUserId` to satisfy the foreign key constraint on `interviews.user_id`.
 * @param authUserId The user's authentication ID (from auth.uid()).
 * @param settings The settings for the interview.
 * @returns The newly created interview object or null on failure.
 */
export declare const createInterview: (authUserId: string, settings: InterviewSettings) => Promise<Interview | null>;
/**
 * Finalizes an interview by uploading assets and updating the record.
 * @param params Object containing all necessary data to finalize.
 * @returns Object with success status and optional error message.
 */
export declare const finalizeInterview: (params: {
    interviewId: string;
    userId: string;
    transcript: string | null;
    malpracticeReport: string | null;
    reportData: any;
    mediaBlob: Blob | null;
    qna: {
        question: string;
        answer: string;
    }[];
}) => Promise<{
    success: boolean;
    error?: string;
}>;
export declare const getInterviewsForUser: (authUserId: string) => Promise<Interview[]>;
export declare const getReportForInterview: (interviewId: string) => Promise<PerformanceReport | null>;
export declare const getCommentsForInterview: (interviewId: string) => Promise<Comment[]>;
export declare const addComment: (comment: Omit<Comment, "id" | "created_at" | "updated_at">) => Promise<Comment | null>;
export declare const getRecordingDownloadUrl: (mediaPath: string) => Promise<string | null>;
export declare const getJobs: () => Promise<Job[]>;
export declare const getLanguages: () => Promise<Language[]>;
export declare const getQuestionsForInterview: (interviewId: string) => Promise<any[]>;
export declare const getAnswersForInterview: (questionIds: string[]) => Promise<any[]>;
/**
 * Creates an audit log entry with user name and detailed change information
 * @param userId The auth user ID performing the action
 * @param action The action being performed (e.g., 'USER_LOGIN', 'INTERVIEW_CREATE')
 * @param entityId The ID of the entity being acted upon
 * @param tableName The table name where the action occurred
 * @param details Object containing detailed change information (what changed, old/new values, etc.)
 */
export declare const createAuditLog: (userId: string, action: AuditAction | string, entityId: string, tableName?: string, details?: object) => Promise<void>;
/**
 * A utility function for debugging. Checks if a specific hardcoded user
 * exists in the public.users table and alerts the result.
 * This is now exported so it can be used by the Header component.
 */
export declare const verifyUserRecord: () => Promise<void>;
/**
 * Updates user profile information (name, email, plan, etc.)
 * @param userId The auth user ID (userid column)
 * @param updates Object containing fields to update
 * @returns Updated user profile or null on error
 */
export declare const updateUserProfile: (userId: string, updates: {
    name?: string;
    email?: string;
    plan?: string;
}) => Promise<any>;
/**
 * Gets user's current subscription plan
 * @param userId The auth user ID
 * @returns User's plan information
 */
export declare const getUserPlan: (userId: string) => Promise<any>;
/**
 * Updates user's subscription plan
 * @param userId The auth user ID
 * @param plan The plan name ('free', 'pro', 'enterprise')
 * @returns Success boolean
 */
export declare const updateUserPlan: (userId: string, plan: string) => Promise<boolean>;
/**
 * Updates an existing comment
 * @param commentId The comment ID to update
 * @param commentText The new comment text
 * @param userId The user making the update (for authorization check)
 * @returns Updated comment or null
 */
export declare const updateComment: (commentId: string, commentText: string, userId: string) => Promise<Comment | null>;
/**
 * Deletes a comment
 * @param commentId The comment ID to delete
 * @param userId The user attempting deletion (for authorization)
 * @returns Success boolean
 */
export declare const deleteComment: (commentId: string, userId: string) => Promise<boolean>;
/**
 * Schedules an interview for a future time
 * @param authUserId The user's authentication ID
 * @param settings Interview settings including scheduledTime
 * @returns Created interview with scheduled status
 */
export declare const scheduleInterview: (authUserId: string, settings: InterviewSettings & {
    scheduledTime: string;
}) => Promise<Interview | null>;
/**
 * Gets all scheduled interviews for a user
 * @param userId The auth user ID
 * @returns Array of scheduled interviews
 */
export declare const getScheduledInterviews: (userId: string) => Promise<Interview[]>;
/**
 * Updates interview status (e.g., from scheduled to in_progress)
 * @param interviewId Interview ID
 * @param status New status
 * @returns Success boolean
 */
export declare const updateInterviewStatus: (interviewId: string, status: "lobby" | "in_progress" | "completed" | "cancelled" | "scheduled") => Promise<boolean>;
/**
 * Cancels a scheduled interview
 * @param interviewId Interview ID to cancel
 * @param userId User requesting cancellation
 * @returns Success boolean
 */
export declare const cancelInterview: (interviewId: string, userId: string) => Promise<boolean>;
/**
 * Soft deletes an interview and all related data
 * @param interviewId Interview ID to delete
 * @param userId User requesting deletion (for authorization)
 * @returns Success boolean
 */
export declare const deleteInterview: (interviewId: string, userId: string) => Promise<boolean>;
//# sourceMappingURL=supabaseService.d.ts.map