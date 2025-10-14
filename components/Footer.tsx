import React from 'react';
import type { View } from '../types';

interface FooterProps {
    onNavigate: (view: View) => void;
}

const Footer = React.forwardRef<HTMLElement, FooterProps>(({ onNavigate }, ref) => {
    const currentYear = new Date().getFullYear();

    return (
        <footer ref={ref} className="w-full bg-slate-900 border-t border-slate-700 py-6 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-slate-400">
                    &copy; {currentYear} JD Labs. All rights reserved.
                </p>
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => onNavigate('terms')} 
                        className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
                    >
                        Terms & Conditions
                    </button>
                    <button 
                        onClick={() => onNavigate('privacy')}
                        className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
                    >
                        Privacy Policy
                    </button>
                </div>
            </div>
        </footer>
    );
});

export default Footer;