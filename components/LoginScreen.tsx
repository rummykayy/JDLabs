import React, { useState, useEffect, useCallback } from 'react';
import type { User } from '../types';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
  onSwitchToRegister: () => void;
  onBackToSetup: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onSwitchToRegister, onBackToSetup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulated login logic
    if (email && password) {
      setError('');
      onLoginSuccess({ name: email.split('@')[0], email, interviewCount: 0, plan: 'Free' });
    } else {
      setError('Please enter both email and password.');
    }
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
      setError("Failed to process Google Sign-In. Please try again.");
      return null;
    }
  };

  const handleCredentialResponse = useCallback((response: any) => {
    const user = decodeJwtResponse(response.credential);
    if (user) {
      onLoginSuccess(user);
    }
  }, [onLoginSuccess]);

  useEffect(() => {
    if ((window as any).google?.accounts?.id) {
        try {
            (window as any).google.accounts.id.initialize({
                client_id: '1000733137889-98d8hcjl234lqf6l8eg8tb4g0jf3i661.apps.googleusercontent.com',
                callback: handleCredentialResponse
            });

            const googleSignInButton = document.getElementById('google-signin-button-login');
            if (googleSignInButton) {
                (window as any).google.accounts.id.renderButton(
                    googleSignInButton,
                    { theme: "outline", size: "large", type: 'standard', text: 'signin_with', width: '336' } // width matches form width
                );
            }
        } catch (error) {
            console.error("Google Sign-In initialization error:", error);
            setError("Could not initialize Google Sign-In.");
        }
    }
  }, [handleCredentialResponse]);

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-slate-700">
        <h2 className="text-3xl font-bold text-white mb-2 text-center">Login to Your Account</h2>
        <p className="text-slate-400 mb-8 text-center">Welcome back! Please enter your details.</p>

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
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-400 shadow-[0_0_12px_rgba(37,99,235,0.4)] hover:shadow-[0_0_16px_rgba(59,130,246,0.6)]"
          >
            Sign In
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
        
        <div id="google-signin-button-login" className="flex justify-center"></div>

        <div className="text-center mt-6">
          <p className="text-slate-400 text-sm">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-blue-400 hover:text-blue-300 font-semibold underline transition-colors duration-200"
            >
              Register Now
            </button>
          </p>
        </div>

        <div className="text-center mt-8">
            <button
            onClick={onBackToSetup}
            className="text-slate-400 hover:text-white transition-colors duration-200 text-sm"
            >
            ← Back to Interview Setup
            </button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;