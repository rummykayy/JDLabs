import React, { useState, useEffect } from 'react';
import type { View, InterviewSettings, User, ModelSettings, Plan, InterviewHistoryItem, FeedbackData } from './types';

import SetupScreen from './components/SetupScreen';
import InterviewScreen from './components/InterviewScreen';
import PlaybackScreen from './components/PlaybackScreen';
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen';
import CommunityScreen from './components/CommunityScreen';
import LearnScreen from './components/LearnScreen';
import PricingScreen from './components/PricingScreen';
import FeaturesScreen from './components/FeaturesScreen';
import ContactScreen from './components/ContactScreen';
import PrivacyScreen from './components/PrivacyScreen';
import TermsScreen from './components/TermsScreen';
import CheckoutScreen from './components/CheckoutScreen';
import OrderSuccessScreen from './components/OrderSuccessScreen';
import HistoryScreen from './components/HistoryScreen';
import Header from './components/Header';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import { useToast } from './contexts/ToastContext';
import { addInterviewToHistory } from './services/historyService';
import { uploadInterviewAssets } from './services/uploadService';

const defaultModelSettings: ModelSettings = {
  chat: 'gemini-2.5-flash',
  audio: 'gemini-2.5-flash-native-audio-preview-09-2025',
  video: 'gemini-2.5-flash-native-audio-preview-09-2025',
  liveShare: 'gemini-2.5-flash-native-audio-preview-09-2025',
  evaluation: 'gemini-2.5-flash',
};

const App: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const [modelSettings, setModelSettings] = useState<ModelSettings>(defaultModelSettings);

  const [currentView, setCurrentView] = useState<View>('setup');
  const [interviewSettings, setInterviewSettings] = useState<InterviewSettings | null>(null);
  const [interviewResult, setInterviewResult] = useState<{ mediaUrl: string | null; transcriptContent: string | null } | null>(null);
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { showToast } = useToast();

  // --- EFFECT HOOKS ---
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  // --- HANDLER FUNCTIONS ---
  const handleStartInterview = (settings: InterviewSettings) => {
    setInterviewSettings(settings);
    setInterviewResult(null); // Clear previous results
  };

  const handleEndInterview = (result: { mediaUrl: string | null; transcriptContent: string | null }) => {
    setInterviewResult(result);
  };
  
  const handleFinishReview = async (feedbackData: FeedbackData | null) => {
    if (currentUser && interviewSettings && interviewResult) {
        // Use the new service to "upload" assets and get back URLs
        const { recordingUrl, summaryUrl } = await uploadInterviewAssets(
            interviewResult.mediaUrl,
            feedbackData,
            currentUser,
            interviewSettings
        );

        const historyItem: InterviewHistoryItem = {
            id: new Date().toISOString() + Math.random(),
            date: new Date().toISOString(),
            settings: interviewSettings,
            transcriptContent: interviewResult.transcriptContent,
            recordingUrl: recordingUrl,
            summaryUrl: summaryUrl,
        };
        addInterviewToHistory(currentUser.email, historyItem);
        showToast("Interview saved to your history!", "success");
    }
      
    // Cleanup local blob URL if it's a blob URL
    if (interviewResult?.mediaUrl && interviewResult.mediaUrl.startsWith('blob:')) {
      URL.revokeObjectURL(interviewResult.mediaUrl);
    }
    setInterviewResult(null);
    setInterviewSettings(null);
    setCurrentView('setup');
  };
  
  const handleNavigate = (view: View) => {
    setCurrentView(view);
  };
  
  const handleLoginSuccess = (user: User) => {
    const userWithDefaults = { interviewCount: 0, plan: 'Free' as const, ...user };
    setCurrentUser(userWithDefaults);
    localStorage.setItem('currentUser', JSON.stringify(userWithDefaults));
    setCurrentView('setup');
    setIsAuthModalOpen(false);
    showToast(`Welcome back, ${user.name}!`, 'success');
  };

  const handleRegisterSuccess = (user: User) => {
    const userWithDefaults = { interviewCount: 0, plan: 'Free' as const, ...user };
    setCurrentUser(userWithDefaults);
    localStorage.setItem('currentUser', JSON.stringify(userWithDefaults));
    setCurrentView('setup');
    setIsAuthModalOpen(false);
    showToast(`Welcome, ${user.name}! Your account has been created.`, 'success');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setCurrentView('setup');
    showToast('You have been logged out.', 'info');
  };
  
  const handleSelectPlan = (plan: Plan) => {
      if (!currentUser) {
          setIsAuthModalOpen(true);
          return;
      }
      if (plan.price === 0) {
        const updatedUser = { ...currentUser, plan: 'Free' as const };
        setCurrentUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        showToast('You are now on the Free plan!', 'success');
      } else {
        setSelectedPlan(plan);
        setCurrentView('checkout');
      }
  };
  
  const handleConfirmPurchase = () => {
    if (currentUser && selectedPlan) {
      const updatedUser = { ...currentUser, plan: selectedPlan.name };
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setCurrentView('orderSuccess');
      showToast(`Successfully upgraded to the ${selectedPlan.name} plan!`, 'success');
    }
  };
  
  const renderContent = () => {
    if (interviewResult && interviewSettings) {
      return (
        <PlaybackScreen
          mediaUrl={interviewResult.mediaUrl}
          transcriptContent={interviewResult.transcriptContent}
          mode={interviewSettings.mode}
          settings={interviewSettings}
          onFinishReview={handleFinishReview}
          modelSettings={modelSettings}
        />
      );
    }

    if (interviewSettings) {
      return <InterviewScreen settings={interviewSettings} onEndInterview={handleEndInterview} />;
    }
    
    switch (currentView) {
      case 'setup':
        return <SetupScreen onStartInterview={handleStartInterview} modelSettings={modelSettings} currentUser={currentUser} onLoginRequired={() => setIsAuthModalOpen(true)} />;
      case 'login':
        return <LoginScreen onLoginSuccess={handleLoginSuccess} onSwitchToRegister={() => setCurrentView('register')} onBackToSetup={() => setCurrentView('setup')} />;
      case 'register':
        return <RegisterScreen onRegisterSuccess={handleRegisterSuccess} onSwitchToLogin={() => setCurrentView('login')} onBackToSetup={() => setCurrentView('setup')} />;
      case 'community':
        return <CommunityScreen onBackToHome={() => setCurrentView('setup')} />;
      case 'learn':
        return <LearnScreen onBackToHome={() => setCurrentView('setup')} />;
      case 'features':
        return <FeaturesScreen onBackToHome={() => setCurrentView('setup')} />;
      case 'pricing':
        return <PricingScreen onBackToHome={() => setCurrentView('setup')} onSelectPlan={handleSelectPlan} currentUser={currentUser} onNavigate={handleNavigate} />;
      case 'contact':
        return <ContactScreen onBackToHome={() => setCurrentView('setup')} />;
      case 'privacy':
        return <PrivacyScreen onBackToHome={() => setCurrentView('setup')} />;
      case 'terms':
        return <TermsScreen onBackToHome={() => setCurrentView('setup')} />;
      case 'checkout':
        return <CheckoutScreen plan={selectedPlan} currentUser={currentUser} onConfirmPurchase={handleConfirmPurchase} onBack={() => setCurrentView('pricing')} />;
      case 'orderSuccess':
        return <OrderSuccessScreen onBackToHome={() => setCurrentView('setup')} />;
      case 'history':
        return <HistoryScreen currentUser={currentUser} onBackToHome={() => setCurrentView('setup')} />;
      default:
        return <SetupScreen onStartInterview={handleStartInterview} modelSettings={modelSettings} currentUser={currentUser} onLoginRequired={() => setIsAuthModalOpen(true)} />;
    }
  };

  const showHeaderFooter = !interviewSettings || !!interviewResult;

  return (
    <div className="bg-slate-900 text-slate-200 min-h-screen flex flex-col">
      {showHeaderFooter && <Header currentUser={currentUser} currentView={currentView} onNavigate={handleNavigate} onLoginClick={() => setIsAuthModalOpen(true)} onLogout={handleLogout} />}
      <main className="flex-1 flex flex-col">
          {renderContent()}
      </main>
      {showHeaderFooter && <Footer onNavigate={handleNavigate} />}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        onRegisterSuccess={handleRegisterSuccess}
      />
    </div>
  );
};

export default App;