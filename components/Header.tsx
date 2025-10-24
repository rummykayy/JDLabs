import React, { useState, useRef, useEffect } from 'react';
import type { User, View } from '../types';
import { ShareIcon, EnvelopeIcon, DocumentDuplicateIcon } from '../constants';
import { useToast } from '../contexts/ToastContext';
import Logo from './Logo';

interface HeaderProps {
  currentUser: User | null;
  currentView: View;
  onNavigate: (view: View) => void;
  onLoginClick: () => void;
  onLogout: () => void;
}

const navItems: { name: string; view: View }[] = [
    { name: 'Community', view: 'community' },
    { name: 'Learn', view: 'learn' },
    { name: 'Features', view: 'features' },
    { name: 'Pricing', view: 'pricing' },
    { name: 'Contact', view: 'contact' },
];

const Header: React.FC<HeaderProps> = ({ currentUser, currentView, onNavigate, onLoginClick, onLogout }) => {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const shareRef = useRef<HTMLButtonElement>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (isMobileMenuOpen) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
    }
    return () => {
        document.body.style.overflow = 'auto';
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isShareOpen &&
        shareRef.current &&
        !shareRef.current.contains(event.target as Node) &&
        shareMenuRef.current &&
        !shareMenuRef.current.contains(event.target as Node)
      ) {
        setIsShareOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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
            <button onClick={() => onNavigate('setup')} className="flex-shrink-0">
              <Logo />
            </button>
          </div>

          <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-2">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => onNavigate(item.view)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === item.view
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.name}
              </button>
            ))}
            {currentUser && (
                <button
                    onClick={() => onNavigate('history')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        currentView === 'history'
                        ? 'bg-slate-700 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                >
                    History
                </button>
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
                <div className="relative">
                  <button
                    onClick={() => setIsShareOpen(!isShareOpen)}
                    ref={shareRef}
                    className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2 px-4 rounded-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-400 shadow-sm border border-cyan-500 text-sm"
                    aria-haspopup="true"
                    aria-expanded={isShareOpen}
                  >
                    <ShareIcon />
                    <span>Share</span>
                  </button>
                  {isShareOpen && (
                    <div
                      ref={shareMenuRef}
                      className="absolute right-0 mt-2 w-64 bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-[0_8px_16px_rgba(0,0,0,0.3)] border border-slate-700 overflow-hidden"
                    >
                      <div className="p-2">
                        <p className="text-sm text-slate-400 px-2 pt-1 pb-2">Share this page</p>
                        <a
                          href={`mailto:?subject=Check out this AI Interview Platform&body=I found this cool AI interview platform, check it out: https://jdlabs.dev`}
                          className="flex items-center gap-3 w-full text-left px-4 py-3 text-base text-slate-200 rounded-md hover:bg-blue-600 focus:bg-blue-600 focus:outline-none"
                        >
                          <EnvelopeIcon />
                          <span>Email a link</span>
                        </a>
                        <button
                          onClick={handleCopyLink}
                          className="flex items-center gap-3 w-full text-left px-4 py-3 text-base text-slate-200 rounded-md hover:bg-blue-600 focus:bg-blue-600 focus:outline-none"
                        >
                          <DocumentDuplicateIcon />
                          <span>Copy Link</span>
                        </button>
                        <div className="px-4 py-2 mt-1 border-t border-slate-700">
                          <input
                            type="text"
                            readOnly
                            value="https://jdlabs.dev"
                            className="w-full bg-slate-700 text-slate-300 text-sm rounded-md px-2 py-1 border border-slate-600"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onNavigate('register')}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-400 shadow-sm text-sm"
                >
                  Register
                </button>
                <button
                  onClick={onLoginClick}
                  className="bg-transparent hover:bg-slate-800 text-slate-200 font-medium py-2 px-4 rounded-md transition-colors border border-slate-600 text-sm"
                >
                  Login
                </button>
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

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900 md:hidden animate-fade-in">
            <div className="absolute top-0 right-0 p-4">
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-white" aria-label="Close menu">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
            </div>
            <div className="flex flex-col items-center justify-center h-full">
                <nav className="flex flex-col items-center gap-6">
                    {navItems.map((item) => (
                        <button key={item.name} onClick={() => { onNavigate(item.view); setIsMobileMenuOpen(false); }} className="text-2xl font-semibold text-slate-200 hover:text-blue-400 transition-colors">{item.name}</button>
                    ))}
                    {currentUser && (
                        <button onClick={() => { onNavigate('history'); setIsMobileMenuOpen(false); }} className="text-2xl font-semibold text-slate-200 hover:text-blue-400 transition-colors">History</button>
                    )}
                </nav>
                <div className="mt-12 pt-8 border-t border-slate-700 w-full max-w-xs flex flex-col items-center gap-4">
                    {currentUser ? (
                         <button onClick={() => { onLogout(); setIsMobileMenuOpen(false); }} className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium py-3 px-6 rounded-md transition-colors text-lg">Logout</button>
                    ) : (
                        <>
                            <button onClick={() => { onNavigate('register'); setIsMobileMenuOpen(false); }} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-6 rounded-md transition-all">Register</button>
                            <button onClick={() => { onLoginClick(); setIsMobileMenuOpen(false); }} className="w-full bg-transparent hover:bg-slate-800 text-slate-200 font-medium py-3 px-6 rounded-md transition-colors border border-slate-600">Login</button>
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
