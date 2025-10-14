import React, { useState, useEffect, useCallback } from 'react';
import type { User } from '../types';
import { AtSymbolIcon, LockClosedIcon, UserIcon, GoogleIcon } from '../constants';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  onRegisterSuccess: (user: User) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess, onRegisterSuccess }) => {
  const [view, setView] = useState<'login' | 'register'>('login');
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState('');

  // Reset state when view changes or modal closes
  useEffect(() => {
    if (!isOpen) {
        setTimeout(() => {
            // Reset all fields when modal closes
            setLoginEmail('');
            setLoginPassword('');
            setLoginError('');
            setRegName('');
            setRegEmail('');
            setRegPassword('');
            setRegError('');
            setView('login'); // Reset to login view
        }, 300); // Delay reset to allow for closing animation
    }
  }, [isOpen]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError("Please enter both email and password.");
      return;
    }
    setLoginError('');
    onLoginSuccess({ name: loginEmail.split('@')[0], email: loginEmail });
    onClose();
  };
  
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setRegError("Please fill in all fields.");
      return;
    }
    setRegError('');
    onRegisterSuccess({ name: regName, email: regEmail });
    onClose();
  };

  const decodeJwtResponse = (token: string): User | null => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const decoded: { name: string; email: string; } = JSON.parse(jsonPayload);
      return { name: decoded.name, email: decoded.email };
    } catch (e) {
      console.error("Error decoding JWT", e);
      setLoginError("Failed to process Google Sign-In. Please try again.");
      return null;
    }
  };

  const handleCredentialResponse = useCallback((response: any) => {
    const user = decodeJwtResponse(response.credential);
    if (user) {
      onLoginSuccess(user);
      onClose();
    }
  }, [onLoginSuccess, onClose]);

  useEffect(() => {
    // Render the Google button when the modal becomes visible and is in the login view
    if (isOpen && view === 'login' && (window as any).google?.accounts?.id) {
        try {
            (window as any).google.accounts.id.initialize({
                client_id: '1000733137889-98d8hcjl234lqf6l8eg8tb4g0jf3i661.apps.googleusercontent.com',
                callback: handleCredentialResponse
            });

            const googleSignInButton = document.getElementById('google-signin-button-modal');
            if (googleSignInButton) {
                (window as any).google.accounts.id.renderButton(
                    googleSignInButton,
                    { theme: "outline", size: "large", type: 'standard', text: 'signin_with', width: '300' }
                );
            }
        } catch (error) {
            console.error("Google Sign-In initialization error:", error);
            setLoginError("Could not initialize Google Sign-In.");
        }
    }
  }, [isOpen, view, handleCredentialResponse]);
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog" onClick={onClose}>
        <div className="relative bg-slate-800 border border-slate-700 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <button onClick={onClose} className="absolute top-2 right-2 p-2 rounded-full text-slate-500 hover:bg-slate-700 hover:text-slate-300 transition-colors z-10" aria-label="Close modal">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            {view === 'login' ? (
                <div className="p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-slate-100">Login to Your Account</h1>
                        <p className="text-slate-400 mt-2">Welcome back! Please enter your details.</p>
                    </div>
                    <form onSubmit={handleLoginSubmit} className="space-y-6">
                        <div>
                          <label htmlFor="modal-email" className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><AtSymbolIcon /></div>
                            <input type="email" id="modal-email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 pl-10 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="you@example.com" autoComplete="email" />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="modal-password" className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><LockClosedIcon /></div>
                            <input type="password" id="modal-password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 pl-10 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" autoComplete="current-password" />
                          </div>
                        </div>
                        {loginError && <p className="text-red-500 text-sm text-center">{loginError}</p>}
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-400 shadow-[0_0_12px_rgba(37,99,235,0.4)] hover:shadow-[0_0_16px_rgba(59,130,246,0.6)]">Sign In</button>
                    </form>
                    <div className="my-6 flex items-center">
                        <hr className="flex-1 border-slate-600" />
                        <span className="mx-4 text-slate-400 text-sm">OR</span>
                        <hr className="flex-1 border-slate-600" />
                    </div>
                    <div id="google-signin-button-modal" className="flex justify-center"></div>
                    <p className="text-center text-sm text-slate-400 mt-6">
                        Don't have an account?{' '}
                        <button onClick={() => setView('register')} className="font-medium text-blue-400 hover:text-blue-300">Register now</button>
                    </p>
                </div>
            ) : (
                <div className="p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-slate-100">Create a New Account</h1>
                        <p className="text-slate-400 mt-2">Join the AI Interview Platform today.</p>
                    </div>
                    <form onSubmit={handleRegisterSubmit} className="space-y-6">
                        <div>
                          <label htmlFor="modal-reg-name" className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><UserIcon /></div>
                            <input type="text" id="modal-reg-name" value={regName} onChange={(e) => setRegName(e.target.value)} className="w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 pl-10 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Your Name" autoComplete="name" />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="modal-reg-email" className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><AtSymbolIcon /></div>
                            <input type="email" id="modal-reg-email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} className="w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 pl-10 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="you@example.com" autoComplete="email" />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="modal-reg-password" className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><LockClosedIcon /></div>
                            <input type="password" id="modal-reg-password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} className="w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 pl-10 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" autoComplete="new-password" />
                          </div>
                        </div>
                        {regError && <p className="text-red-500 text-sm text-center">{regError}</p>}
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-400 shadow-[0_0_12px_rgba(37,99,235,0.4)] hover:shadow-[0_0_16px_rgba(59,130,246,0.6)]">Create Account</button>
                    </form>
                    <p className="text-center text-sm text-slate-400 mt-6">
                        Already have an account?{' '}
                        <button onClick={() => setView('login')} className="font-medium text-blue-400 hover:text-blue-300">Login here</button>
                    </p>
                </div>
            )}
        </div>
    </div>
  );
};

export default AuthModal;
