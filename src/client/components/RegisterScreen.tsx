import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AtSymbolIcon, LockClosedIcon, UserIcon } from '../constants/constants';
import Logo from './Logo';
import { signUp } from '../services/supabaseService';
import { useToast } from '../contexts/ToastContext';

// FIX: Remove unused onAuthSuccess prop.
interface RegisterScreenProps {
  onSwitchToLogin: () => void;
  onBackToSetup: () => void;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ onSwitchToLogin, onBackToSetup }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    setError('');
    setIsLoading(true);

    const { error: signUpError } = await signUp(name, email, password);

    setIsLoading(false);
    if (signUpError) {
        setError(signUpError.message);
    } else {
        showToast('Registration successful! Please check your email to verify your account.', 'success');
        navigate('/login'); // Redirect to login after successful sign up
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <div className="inline-block mb-4">
              <Logo />
            </div>
            <h1 className="text-3xl font-bold text-slate-100">Create a New Account</h1>
            <p className="text-slate-400 mt-2">Join the AI Interview Platform today.</p>
        </div>

        <div className="bg-slate-800 p-8 rounded-lg border border-slate-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <UserIcon />
                </div>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 pl-10 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Your Name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <AtSymbolIcon />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 pl-10 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
               <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <LockClosedIcon />
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 pl-10 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>
            </div>
            
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-400 shadow-[0_0_12px_rgba(37,99,235,0.4)] hover:shadow-[0_0_16px_rgba(59,130,246,0.6)] disabled:opacity-50 disabled:cursor-wait"
            >
              {isLoading && <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>}
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Already have an account?{' '}
            {/* FIX: Use the onSwitchToLogin prop for navigation. */}
            <Link to="/login" onClick={(e) => { e.preventDefault(); onSwitchToLogin(); }} className="font-medium text-blue-400 hover:text-blue-300">
              Login here
            </Link>
          </p>
        </div>
         <div className="text-center mt-6">
             {/* FIX: Use the onBackToSetup prop for navigation. */}
            <Link to="/" onClick={(e) => { e.preventDefault(); onBackToSetup(); }} className="text-sm text-slate-400 hover:text-slate-200">
              &larr; Back to Interview Setup
            </Link>
          </div>
      </div>
    </div>
  );
};

export default RegisterScreen;