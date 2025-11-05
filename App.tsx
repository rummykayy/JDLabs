

import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { supabase, finalizeInterview, createInterview, getUserProfile, signOut } from './supabaseService';
import type { User, View, InterviewSettings, Plan, FeedbackData } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import SetupScreen from './components/SetupScreen';
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen';
import InterviewScreen from './components/InterviewScreen';
import PlaybackScreen from './components/PlaybackScreen';
import HistoryScreen from './components/HistoryScreen';
import CommunityScreen from './components/CommunityScreen';
import LearnScreen from './components/LearnScreen';
import FeaturesScreen from './components/FeaturesScreen';
import PricingScreen from './components/PricingScreen';
import CheckoutScreen from './components/CheckoutScreen';
import OrderSuccessScreen from './components/OrderSuccessScreen';
import ContactScreen from './components/ContactScreen';
import PrivacyScreen from './components/PrivacyScreen';
import TermsScreen from './components/TermsScreen';
import { useToast } from './contexts/ToastContext';

// Hardcoded model settings as they are consistent across the app
const modelSettings = {
  chat: 'gemini-2.5-flash',
  audio: 'gemini-2.5-flash-native-audio-preview-09-2025',
  video: 'gemini-2.5-flash-native-audio-preview-09-2025',
  liveShare: 'gemini-2.5-flash-native-audio-preview-09-2025',
  evaluation: 'gemini-2.5-pro',
  questionGeneration: 'gemini-2.5-flash',
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeInterviewId, setActiveInterviewId] = useState<string | null>(null);
  const [interviewSettings, setInterviewSettings] = useState<InterviewSettings | null>(null);
  const [interviewResult, setInterviewResult] = useState<{ interviewId: string, mediaBlob: Blob | null, fullTranscript: string | null, malpracticeReport: string | null, qna: { question: string, answer: string }[] } | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  // This useEffect handles the Supabase authentication state changes.
  // It correctly sets up the listener and provides a cleanup function.
  // It also checks for an existing session when the app first loads.
  useEffect(() => {
    console.log('🚀 [App] Initializing authentication...');

    // Check for existing session on mount
    const checkSession = async () => {
      console.log('🔍 [App] Checking for existing session...');
      console.log('🔍 [App] LocalStorage keys:', Object.keys(localStorage).filter(k => k.includes('supabase')));

      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        console.log('✅ [App] Existing session found:', {
          userId: session.user.id,
          email: session.user.email,
          expiresAt: session.expires_at
        });

        const profile = await getUserProfile(session.user.id);

        if (profile) {
          console.log('✅ [App] Setting current user from existing session');
          setCurrentUser({
            id: session.user.id,
            email: session.user.email!,
            name: profile?.name || session.user.email!,
          });
        } else {
          console.warn('⚠️ [App] Profile not found for user, using email as name');
          setCurrentUser({
            id: session.user.id,
            email: session.user.email!,
            name: session.user.email!,
          });
        }
      } else {
        console.log('ℹ️ [App] No existing session found - user is logged out');
      }
    };

    checkSession();

    // Listen for auth state changes
    console.log('👂 [App] Setting up auth state change listener...');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 [App] Auth state changed:', {
        event,
        userId: session?.user?.id,
        email: session?.user?.email,
        hasSession: !!session
      });

      if (session?.user) {
        console.log('🔄 [App] User signed in, fetching profile...');
        const profile = await getUserProfile(session.user.id);

        if (profile) {
          console.log('✅ [App] Setting current user after auth state change');
          setCurrentUser({
            id: session.user.id,
            email: session.user.email!,
            name: profile?.name || session.user.email!,
          });
        } else {
          console.warn('⚠️ [App] Profile not found for user, using email as name');
          setCurrentUser({
            id: session.user.id,
            email: session.user.email!,
            name: session.user.email!,
          });
        }
      } else {
        console.log('🔄 [App] User signed out, clearing current user');
        setCurrentUser(null);
      }
    });

    console.log('✅ [App] Auth listener setup complete');

    // The cleanup function is returned to unsubscribe from the listener on component unmount.
    return () => {
      console.log('🛑 [App] Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, []);

  const handleStartInterview = useCallback(async (settings: InterviewSettings) => {
    if (!currentUser) {
      showToast('Please log in to start an interview.', 'info');
      navigate('/login');
      return;
    }
    showToast('Initializing your interview...', 'info');
    const interview = await createInterview(currentUser.id, settings);
    if (interview) {
      setInterviewSettings(settings);
      setActiveInterviewId(interview.id);
      navigate('/interview');
    } else {
      showToast('Could not start the interview. Please try again.', 'error');
    }
  }, [currentUser, navigate, showToast]);

  const handleEndInterview = useCallback((result: { interviewId: string; mediaBlob: Blob | null; fullTranscript: string | null; malpracticeReport: string | null; qna: { question: string, answer: string }[] }) => {
    setInterviewResult(result);
    navigate('/review');
  }, [navigate]);

  const handleFinishReview = useCallback(async (interviewId: string, feedback: FeedbackData | null, mediaBlob: Blob | null, fullTranscript: string | null, malpracticeReport: string | null) => {
    if (!currentUser || !interviewResult) return;
    showToast('Saving your interview results...', 'info');
    const { success, error } = await finalizeInterview({
      interviewId,
      userId: currentUser.id,
      transcript: fullTranscript,
      malpracticeReport,
      reportData: feedback,
      mediaBlob,
      qna: interviewResult.qna,
    });
    if (success) {
      showToast('Interview saved successfully!', 'success');
    } else {
      showToast(`Error saving interview: ${error}`, 'error');
    }
    // Reset state and navigate to history
    setActiveInterviewId(null);
    setInterviewSettings(null);
    setInterviewResult(null);
    navigate('/history');
  }, [currentUser, interviewResult, navigate, showToast]);

  const handleLogout = useCallback(async () => {
    console.log('🚪 [App.handleLogout] Starting logout...');
    console.log('🚪 [App.handleLogout] Current user:', currentUser?.email);

    try {
        const userId = currentUser?.id;
        console.log('🚪 [App.handleLogout] Calling signOut with userId:', userId);

        await signOut(userId);

        console.log('✅ [App.handleLogout] signOut completed successfully');

        // Manually clear the user state for an immediate UI update.
        // The onAuthStateChange listener will also fire, but this prevents a delay in the UI reflecting the change.
        console.log('🔄 [App.handleLogout] Clearing currentUser state');
        setCurrentUser(null);

        console.log('🔄 [App.handleLogout] Navigating to home page');
        navigate('/');

        showToast('You have been logged out.', 'info');
        console.log('✅ [App.handleLogout] Logout complete');
    } catch (error: any) {
        console.error('❌ [App.handleLogout] Logout failed:', error);
        showToast(`Logout failed: ${error.message}`, 'error');
    }
  }, [currentUser, navigate, showToast]);
  
  const handleSelectPlan = useCallback((plan: Plan) => {
    if (plan.price > 0) {
      setSelectedPlan(plan);
      navigate('/checkout');
    } else {
      showToast("The Free plan is selected by default.", "info");
    }
  }, [navigate, showToast]);
  
  const handleConfirmPurchase = useCallback(async () => {
    if (currentUser && selectedPlan) {
      // NOTE: User plan update logic has been removed from the backend.
      // This function now only handles the navigation flow.
      navigate('/success');
    }
  }, [currentUser, selectedPlan, navigate]);

  // Prevent accessing interview/review pages directly without an active session
  useEffect(() => {
    if (location.pathname === '/interview' && !activeInterviewId) {
      navigate('/');
    }
    if (location.pathname === '/review' && !interviewResult) {
      navigate('/');
    }
  }, [location.pathname, activeInterviewId, interviewResult, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <Header currentUser={currentUser} onLogout={handleLogout} />
      <main className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<SetupScreen onStartInterview={handleStartInterview} modelSettings={modelSettings} currentUser={currentUser} onLoginRequired={() => navigate('/login')} />} />
          <Route path="/login" element={<LoginScreen onSwitchToRegister={() => navigate('/register')} />} />
          <Route path="/register" element={<RegisterScreen onSwitchToLogin={() => navigate('/login')} onBackToSetup={() => navigate('/')}/>} />
          <Route path="/community" element={<CommunityScreen onBackToHome={() => navigate('/')} />} />
          <Route path="/learn" element={<LearnScreen onBackToHome={() => navigate('/')} />} />
          <Route path="/features" element={<FeaturesScreen onBackToHome={() => navigate('/')} />} />
          <Route path="/pricing" element={<PricingScreen onBackToHome={() => navigate('/')} onSelectPlan={handleSelectPlan} currentUser={currentUser} onNavigate={(view) => navigate(`/${view}`)} />} />
          <Route path="/contact" element={<ContactScreen onBackToHome={() => navigate('/')} />} />
          <Route path="/privacy" element={<PrivacyScreen onBackToHome={() => navigate('/')} />} />
          <Route path="/terms" element={<TermsScreen onBackToHome={() => navigate('/')} />} />
          <Route path="/checkout" element={<CheckoutScreen plan={selectedPlan} currentUser={currentUser} onConfirmPurchase={handleConfirmPurchase} onBack={() => navigate('/pricing')} />} />
          <Route path="/success" element={<OrderSuccessScreen onBackToHome={() => navigate('/')} />} />
          <Route path="/history" element={<HistoryScreen currentUser={currentUser} onBackToHome={() => navigate('/')} />} />
          
          {activeInterviewId && interviewSettings && (
            <Route path="/interview" element={<InterviewScreen interviewId={activeInterviewId} settings={interviewSettings} modelSettings={modelSettings} onEndInterview={handleEndInterview} />} />
          )}

          {interviewResult && interviewSettings && (
            <Route path="/review" element={<PlaybackScreen {...interviewResult} settings={interviewSettings} onFinishReview={handleFinishReview} modelSettings={modelSettings} mode={interviewSettings.mode} />} />
          )}

        </Routes>
      </main>
      <Footer onNavigate={(view) => navigate(`/${view}`)} />
    </div>
  );
};

export default App;