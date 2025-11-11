import React, { useState, useEffect } from 'react';
import type { User } from '../../shared/types/types';
import { AtSymbolIcon, LockClosedIcon, UserIcon, GoogleIcon } from '../constants/constants';
import Logo from './Logo';
import { signIn, signUp, signInWithGoogle } from '../services/supabaseService';
import { useToast } from '../contexts/ToastContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [view, setView] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  
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
            setLoginEmail(''); setLoginPassword(''); setLoginError('');
            setRegName(''); setRegEmail(''); setRegPassword(''); setRegError('');
            setView('login');
        }, 300);
    }
  }, [isOpen]);

  // FIX: Replace the faulty signIn call with a robust try-catch block.
  // The `signIn` service function throws an error on failure, which must be caught.
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);
    try {
      await signIn(loginEmail, loginPassword);
      // On success, the global onAuthStateChange listener will handle updating the user state and closing the modal.
      showToast('Login successful!', 'success');
    } catch (error: any) {
      setLoginError(error.message || 'An unexpected error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setIsLoading(true);
    const { error } = await signUp(regName, regEmail, regPassword);
    setIsLoading(false);
    if (error) {
      setRegError(error.message);
    } else {
      showToast('Registration successful! Please check your email to verify your account.', 'success');
      setView('login'); // Switch to login view after successful registration
    }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      setLoginError(error.message);
    }
    // On success, the page will redirect and onAuthStateChange will handle the rest.
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog" onClick={onClose}>
        <div className="relative bg-slate-800 border border-slate-700 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <button onClick={onClose} className="absolute top-2 right-2 p-2 rounded-full text-slate-500 hover:bg-slate-700 hover:text-slate-300 transition-colors z-10" aria-label="Close modal">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            {view === 'login' ? (
                <div className="p-8">
                    <div className="text-center mb-6">
                        <div className="inline-block mb-4"><Logo /></div>
                        <h1 className="text-2xl font-bold text-slate-100">Login to Your Account</h1>
                        <p className="text-slate-400 mt-2">Welcome back!</p>
                    </div>
                    <form onSubmit={handleLoginSubmit} className="space-y-6">
                        <div>
                          <label htmlFor="modal-email" className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><AtSymbolIcon /></div>
                            <input type="email" id="modal-email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} disabled={isLoading} className="w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 pl-10 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="you@example.com" autoComplete="email" />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="modal-password" className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><LockClosedIcon /></div>
                            <input type="password" id="modal-password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} disabled={isLoading} className="w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 pl-10 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" autoComplete="current-password" />
                          </div>
                        </div>
                        {loginError && <p className="text-red-500 text-sm text-center">{loginError}</p>}
                        <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-400 shadow-[0_0_12px_rgba(37,99,235,0.4)] hover:shadow-[0_0_16px_rgba(59,130,246,0.6)] disabled:opacity-50 disabled:cursor-wait">
                           {isLoading && <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>}
                           {isLoading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>
                    <div className="my-6 flex items-center">
                        <hr className="flex-1 border-slate-600" />
                        <span className="mx-4 text-slate-400 text-sm">OR</span>
                        <hr className="flex-1 border-slate-600" />
                    </div>
                    <button onClick={handleGoogleSignIn} className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors">
                        <GoogleIcon />
                        <span className="text-slate-200 font-semibold">Sign in with Google</span>
                    </button>
                    <p className="text-center text-sm text-slate-400 mt-6">
                        Don't have an account?{' '}
                        <button onClick={() => setView('register')} className="font-medium text-blue-400 hover:text-blue-300">Register now</button>
                    </p>
                </div>
            ) : (
                <div className="p-8">
                    <div className="text-center mb-6">
                        <div className="inline-block mb-4"><Logo /></div>
                        <h1 className="text-2xl font-bold text-slate-100">Create a New Account</h1>
                        <p className="text-slate-400 mt-2">Join today.</p>
                    </div>
                    <form onSubmit={handleRegisterSubmit} className="space-y-6">
                        <div>
                          <label htmlFor="modal-reg-name" className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><UserIcon /></div>
                            <input type="text" id="modal-reg-name" value={regName} onChange={(e) => setRegName(e.target.value)} disabled={isLoading} className="w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 pl-10 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Your Name" autoComplete="name" />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="modal-reg-email" className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><AtSymbolIcon /></div>
                            <input type="email" id="modal-reg-email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} disabled={isLoading} className="w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 pl-10 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="you@example.com" autoComplete="email" />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="modal-reg-password" className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><LockClosedIcon /></div>
                            <input type="password" id="modal-reg-password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} disabled={isLoading} className="w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 pl-10 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" autoComplete="new-password" />
                          </div>
                        </div>
                        {regError && <p className="text-red-500 text-sm text-center">{regError}</p>}
                        <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-400 shadow-[0_0_12px_rgba(37,99,235,0.4)] hover:shadow-[0_0_16px_rgba(59,130,246,0.6)] disabled:opacity-50 disabled:cursor-wait">
                            {isLoading && <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>}
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                        </button>
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