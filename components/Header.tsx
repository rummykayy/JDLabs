import React, { useState, useRef, useEffect } from 'react';
import type { User, View } from '../types';
import { ShareIcon, EnvelopeIcon, DocumentDuplicateIcon } from '../constants';
import { useToast } from '../contexts/ToastContext';

interface HeaderProps {
  currentUser: User | null;
  currentView: View;
  onNavigate: (view: View) => void;
  onLoginClick: () => void;
  onLogout: () => void;
}

const Logo = () => (
  <div className="flex items-center gap-2">
    <svg viewBox="0 0 40 40" className="h-8 w-8">
      <circle cx="20" cy="20" r="20" fill="#2563EB" />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold" fontFamily="Inter, sans-serif" dy=".1em">
        JD
      </text>
    </svg>
    <span className="text-xl font-bold tracking-wider text-white">LABS</span>
  </div>
);


const navItems: { name: string; view: View }[] = [
    { name: 'Community', view: 'community' },
    { name: 'Learn', view: 'learn' },
    { name: 'Pricing', view: 'pricing' },
    { name: 'Contact', view: 'contact' },
];

const Header: React.FC<HeaderProps> = ({ currentUser, currentView, onNavigate, onLoginClick, onLogout }) => {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const shareRef = useRef<HTMLButtonElement>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

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
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <button onClick={() => onNavigate('setup')} className="flex-shrink-0">
              <Logo />
            </button>
            <nav className="hidden md:flex md:items-center md:gap-1">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => onNavigate(item.view)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === item.view
                      ? 'text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </nav>
          </div>

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
              <button className="text-slate-300 hover:text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;