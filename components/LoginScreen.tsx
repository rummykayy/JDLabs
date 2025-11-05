





import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Logo from './Logo';
// FIX: Remove unused imports (getUserProfile, User) and rely on onAuthStateChange.
import { signIn, signInWithGoogle } from '../supabaseService';
import { GoogleIcon } from '../constants';
import { useToast } from '../contexts/ToastContext';

// FIX: Remove onAuthSuccess from props.
interface LoginScreenProps {
  onSwitchToRegister: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔐 Starting sign-in process');
    setIsLoading(true);
    setError('');
    
    try {
      // Increased timeout to 60s to account for Supabase connection delays
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Sign-in timeout: Request took too long')), 60000);
      });

      console.log('📡 Calling supabaseService.signIn');
      const authPromise = signIn(email, password);

      // FIX: Wait for signIn to complete and check for errors
      const { user, session, error: signInError } = await Promise.race([authPromise, timeoutPromise]);

      if (signInError) {
        throw signInError;
      }

      if (!user || !session) {
        throw new Error('Sign-in failed: No user or session returned');
      }

      console.log('🎉 Sign-in API call successful, user:', user.email);
      showToast('Login successful! Redirecting...', 'success');

      // Wait a moment for auth state to propagate
      await new Promise(resolve => setTimeout(resolve, 500));
      navigate('/');

    } catch (error: any) {
      console.error('🚨 Sign-in error:', error);
      
      if (error.message?.includes('timeout')) {
        setError('Sign-in timed out. Please check your connection and try again.');
      } else if (error.message?.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please check your credentials.');
      } else if (error.message?.includes('Email not confirmed')) {
        setError('Please verify your email address before signing in.');
      } else if (error.message?.toLowerCase().includes('network')) {
        setError('Network error. Please check your internet connection.');
      } else {
        setError(error.message || 'Sign-in failed. Please try again.');
      }
    } finally {
      console.log('🔄 Clearing loading state');
      setIsLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    const { error } = await signInWithGoogle();
    if (error) {
        showToast(`Google Sign-In Error: ${error.message}`, 'error');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-slate-700">
        <div className="text-center mb-8">
            <div className="inline-block mb-4">
              <Logo />
            </div>
            <h2 className="text-3xl font-bold text-white">Login to Your Account</h2>
            <p className="text-slate-400 mt-2">Welcome back! Please enter your details.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="you@example.com"
              aria-label="Email Address"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
              aria-label="Password"
              disabled={isLoading}
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-400 shadow-[0_0_12px_rgba(37,99,235,0.4)] hover:shadow-[0_0_16px_rgba(59,130,246,0.6)] disabled:opacity-50 disabled:cursor-wait"
          >
            {isLoading && <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>}
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-slate-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-slate-800 text-slate-400">OR</span>
          </div>
        </div>
        
        <button onClick={handleGoogleSignIn} className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors">
            <GoogleIcon />
            <span className="text-slate-200 font-semibold">Sign in with Google</span>
        </button>

        <div className="text-center mt-6">
          <p className="text-slate-400 text-sm">
            Don't have an account?{' '}
            {/* FIX: Use the onSwitchToRegister prop for navigation. */}
            <Link
              to="/register"
              onClick={(e) => { e.preventDefault(); onSwitchToRegister(); }}
              className="text-blue-400 hover:text-blue-300 font-semibold underline transition-colors duration-200"
            >
              Register Now
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default LoginScreen;