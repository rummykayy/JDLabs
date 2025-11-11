import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import type { User } from '../../shared/types/types';
import { ShareIcon, EnvelopeIcon, DocumentDuplicateIcon } from '../constants/constants';
import { useToast } from '../contexts/ToastContext';
import Logo from './Logo';
import { verifyUserRecord } from '../services/supabaseService';

interface HeaderProps {
  currentUser: User | null;
  onLogout: () => void;
}

const navItems = [
  { name: 'Community', path: '/community' },
  { name: 'Learn', path: '/learn' },
  { name: 'Features', path: '/features' },
  { name: 'Pricing', path: '/pricing' },
  { name: 'Contact', path: '/contact' },
];

const Header: React.FC<HeaderProps> = ({ currentUser, onLogout }) => {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const shareRef = useRef<HTMLButtonElement>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-2 rounded-md text-sm font-medium transition-colors ${isActive
      ? 'bg-slate-700 text-white'
      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`;

  useEffect(() => {
    if (isMobileMenuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isShareOpen &&
        shareRef.current && !shareRef.current.contains(event.target as Node) &&
        shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)
      ) {
        setIsShareOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isShareOpen]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://jdlabs.dev').then(() => {
      showToast('Link copied to clipboard!', 'success');
      setIsShareOpen(false);
    });
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-slate-900/70 backdrop-blur-md border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          <div className="flex items-center">
            <NavLink to="/" className="flex-shrink-0">
              <Logo />
            </NavLink>
          </div>

          <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-2">
            {navItems.map((item) => (
              <NavLink key={item.name} to={item.path} className={navLinkClasses}>
                {item.name}
              </NavLink>
            ))}
            {currentUser && (
              <NavLink to="/history" className={navLinkClasses}>
                History
              </NavLink>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-4">
                <span className="text-slate-300 hidden sm:inline">Welcome, {currentUser.name}</span>
                <button
                  onClick={onLogout}
                  className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium py-2 px-4 rounded-md transition-colors text-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <NavLink
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-400 shadow-sm text-sm"
                >
                  Register
                </NavLink>
                <NavLink
                  to="/login"
                  className="bg-transparent hover:bg-slate-800 text-slate-200 font-medium py-2 px-4 rounded-md transition-colors border border-slate-600 text-sm"
                >
                  Login
                </NavLink>
              </div>
            )}

            <div className="md:hidden">
              <button onClick={() => setIsMobileMenuOpen(true)} className="text-slate-300 hover:text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900 md:hidden animate-fade-in">
          <div className="absolute top-0 right-0 p-4">
            <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-white" aria-label="Close menu">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="flex flex-col items-center justify-center h-full">
            <nav className="flex flex-col items-center gap-6">
              {navItems.map((item) => (
                <NavLink to={item.path} key={item.name} onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-semibold text-slate-200 hover:text-blue-400 transition-colors">{item.name}</NavLink>
              ))}
              {currentUser && (
                <NavLink to="/history" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-semibold text-slate-200 hover:text-blue-400 transition-colors">History</NavLink>
              )}
            </nav>
            <div className="mt-12 pt-8 border-t border-slate-700 w-full max-w-xs flex flex-col items-center gap-4">
              {currentUser ? (
                <button onClick={() => { onLogout(); setIsMobileMenuOpen(false); }} className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium py-3 px-6 rounded-md transition-colors text-lg">Logout</button>
              ) : (
                <>
                  <NavLink to="/register" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-6 rounded-md transition-all">Register</NavLink>
                  <NavLink to="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center bg-transparent hover:bg-slate-800 text-slate-200 font-medium py-3 px-6 rounded-md transition-colors border border-slate-600">Login</NavLink>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;