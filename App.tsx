import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import Header from './components/Header';
import SetupScreen from './components/SetupScreen';
import InterviewScreen from './components/InterviewScreen';
import PlaybackScreen from './components/PlaybackScreen';
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen';
import CommunityScreen from './components/CommunityScreen';
import LearnScreen from './components/LearnScreen';
import PricingScreen from './components/PricingScreen';
import ContactScreen from './components/ContactScreen';
import PrivacyScreen from './components/PrivacyScreen';
import TermsScreen from './components/TermsScreen';
import CheckoutScreen from './components/CheckoutScreen';
import OrderSuccessScreen from './components/OrderSuccessScreen';
import Footer from './components/Footer';
import ApiKeySetupScreen from './components/ApiKeySetupScreen';
import type { InterviewSettings, User, View, ModelSettings, ApiProvider, Plan } from './types';
import { InterviewMode } from './types';
import { useToast } from './contexts/ToastContext';

const pathToView = (path: string): View => {
  // Normalize path: remove trailing slash for non-root paths
  const cleanPath = path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
  switch (cleanPath) {
    case '/community': return 'community';
    case '/learn': return 'learn';
    case '/pricing': return 'pricing';
    case '/contact': return 'contact';
    case '/privacy': return 'privacy';
    case '/terms': return 'terms';
    case '/login': return 'login';
    case '/register': return 'register';
    case '/checkout': return 'checkout';
    case '/order-success': return 'orderSuccess';
    case '/': 
    default: 
      return 'setup';
  }
};

const viewToPath = (view: View): string => {
  if (view === 'setup') return '/';
  if (view === 'orderSuccess') return '/order-success';
  return `/${view}`;
}

const getApiKeyFromEnv = (): string | null => {
    try {
        if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
            return process.env.API_KEY;
        }
    } catch (e) {
        console.warn("Could not read API_KEY from process.env", e);
    }
    return null;
};


function App() {
  const [apiProvider, setApiProvider] = useState<ApiProvider>('gemini');
  const [apiKey, setApiKey] = useState<string | null>(getApiKeyFromEnv());
  const [modelSettings, setModelSettings] = useState<ModelSettings>({
      chat: 'gemini-2.5-flash',
      audio: 'gemini-2.5-flash-native-audio-preview-09-2025',
      video: 'gemini-2.5-flash-native-audio-preview-09-2025',
      liveShare: 'gemini-2.5-flash-native-audio-preview-09-2025',
      evaluation: 'gemini-2.5-flash',
  });
  const [interviewSettings, setInterviewSettings] = useState<InterviewSettings | null>(null);
  const [recordedMediaUrl, setRecordedMediaUrl] = useState<string | null>(null);
  const [transcriptContent, setTranscriptContent] = useState<string | null>(null);
  const [interviewModeForPlayback, setInterviewModeForPlayback] = useState<InterviewMode | null>(null);
  const [playbackSettings, setPlaybackSettings] = useState<InterviewSettings | null>(null);
  const [currentView, setCurrentView] = useState<View>(() => pathToView(window.location.pathname));
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [planToPurchase, setPlanToPurchase] = useState<Plan | null>(null);
  const footerRef = useRef<HTMLElement>(null);
  const [footerHeight, setFooterHeight] = useState(0);
  const { showToast } = useToast();

  // Effect to handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setCurrentView(pathToView(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useLayoutEffect(() => {
    const updateFooterHeight = () => {
      if (footerRef.current) {
        setFooterHeight(footerRef.current.offsetHeight);
      }
    };

    updateFooterHeight();
    const resizeObserver = new ResizeObserver(updateFooterHeight);
    if (footerRef.current) {
        resizeObserver.observe(footerRef.current);
    }
    
    return () => {
        if (footerRef.current) {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            resizeObserver.unobserve(footerRef.current);
        }
    };
  }, []);

  const handleNavigation = (view: View) => {
    const path = viewToPath(view);
    if (window.location.pathname !== path) {
      try {
        window.history.pushState({ view }, '', path);
      } catch (error) {
        console.warn("Could not push state to history (this is expected in sandboxed environments):", error);
      }
    }
    setCurrentView(view);
  };

  const handleStartInterview = (settings: InterviewSettings) => {
    setRecordedMediaUrl(null);
    setTranscriptContent(null);
    setInterviewModeForPlayback(null);
    setPlaybackSettings(null);
    setInterviewSettings(settings);
  };
  
  const handleEndInterview = (result: { mediaUrl: string | null; transcriptContent: string | null }) => {
    setInterviewModeForPlayback(interviewSettings?.mode ?? null);
    setPlaybackSettings(interviewSettings);
    setRecordedMediaUrl(result.mediaUrl);
    setTranscriptContent(result.transcriptContent);
    if (currentUser) {
      setCurrentUser(prevUser => prevUser ? { ...prevUser, interviewCount: (prevUser.interviewCount || 0) + 1 } : null);
    }
    setInterviewSettings(null);
  };

  const handleFinishReview = () => {
    if (recordedMediaUrl) {
      URL.revokeObjectURL(recordedMediaUrl);
    }
    setRecordedMediaUrl(null);
    setTranscriptContent(null);
    setInterviewModeForPlayback(null);
    setPlaybackSettings(null);
    handleNavigation('setup');
  };

  const handleLogin = (user: User) => {
    setCurrentUser({ ...user, interviewCount: user.interviewCount || 0, plan: user.plan || 'Free' });
    handleNavigation('setup');
  };

  const handleRegister = (user: User) => {
    setCurrentUser({ ...user, interviewCount: 0, plan: 'Free' });
    handleNavigation('setup');
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleSelectPlan = (plan: Plan) => {
    if (!currentUser) {
      // Redirect to login/register if not logged in, but remember the plan
      setPlanToPurchase(plan);
      handleNavigation('login'); // Or show auth modal
    } else {
      setPlanToPurchase(plan);
      handleNavigation('checkout');
    }
  };

  const handlePurchaseSuccess = () => {
    if (currentUser && planToPurchase) {
      // In a real app, this would be updated after a successful payment API call
      setCurrentUser(prev => prev ? { ...prev, plan: planToPurchase.name } : null);
      setPlanToPurchase(null);
      handleNavigation('orderSuccess');
    }
  };

  const handleSetupComplete = (provider: ApiProvider, key: string, models: ModelSettings) => {
    setApiProvider(provider);
    setApiKey(key);
    setModelSettings(models);
    showToast('Configuration saved successfully!', 'success');
  };
  
  if (!apiKey) {
    return <ApiKeySetupScreen onSetupComplete={handleSetupComplete} />;
  }

  const renderContent = () => {
    if (interviewSettings) {
      return <InterviewScreen settings={interviewSettings} onEndInterview={handleEndInterview} apiKey={apiKey} apiProvider={apiProvider} />;
    }
    
    if ((recordedMediaUrl || transcriptContent) && interviewModeForPlayback && playbackSettings) {
      return <PlaybackScreen mediaUrl={recordedMediaUrl} transcriptContent={transcriptContent} mode={interviewModeForPlayback} settings={playbackSettings} onFinishReview={handleFinishReview} apiKey={apiKey} modelSettings={modelSettings} apiProvider={apiProvider} />;
    }

    const handleBackToSetup = () => handleNavigation('setup');

    switch (currentView) {
      case 'login': return <LoginScreen onLoginSuccess={handleLogin} onSwitchToRegister={() => handleNavigation('register')} onBackToSetup={handleBackToSetup} />;
      case 'register': return <RegisterScreen onRegisterSuccess={handleRegister} onSwitchToLogin={() => handleNavigation('login')} onBackToSetup={handleBackToSetup} />;
      case 'community': return <CommunityScreen onBackToHome={() => handleNavigation('setup')} />;
      case 'learn': return <LearnScreen onBackToHome={() => handleNavigation('setup')} />;
      case 'pricing': return <PricingScreen onBackToHome={() => handleNavigation('setup')} onSelectPlan={handleSelectPlan} onNavigate={handleNavigation} currentUser={currentUser} />;
      case 'contact': return <ContactScreen onBackToHome={() => handleNavigation('setup')} />;
      case 'privacy': return <PrivacyScreen onBackToHome={() => handleNavigation('setup')} />;
      case 'terms': return <TermsScreen onBackToHome={() => handleNavigation('setup')} />;
      case 'checkout': return <CheckoutScreen plan={planToPurchase} currentUser={currentUser} onConfirmPurchase={handlePurchaseSuccess} onBack={() => handleNavigation('pricing')} />;
      case 'orderSuccess': return <OrderSuccessScreen onBackToHome={() => handleNavigation('setup')} />;
      case 'setup':
      default:
        return <SetupScreen onStartInterview={handleStartInterview} currentUser={currentUser} modelSettings={modelSettings} apiKey={apiKey} apiProvider={apiProvider} onNavigate={handleNavigation} onLogin={handleLogin} onRegister={handleRegister} />;
    }
  };


  return (
    <div className="min-h-screen text-gray-200 flex flex-col">
      <Header currentUser={currentUser} currentView={currentView} onNavigate={handleNavigation} onLoginClick={() => handleNavigation('login')} onLogout={handleLogout} />
      <main className="flex-1 flex flex-col">
        {renderContent()}
      </main>
      <Footer onNavigate={handleNavigation} ref={footerRef} />
    </div>
  );
}

export default App;
