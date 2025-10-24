import React from 'react';

const Logo: React.FC = () => (
  <div className="flex items-center gap-2" aria-label="JD Labs Logo">
    <div className="relative h-8 w-8">
      <div className="absolute -inset-1 bg-blue-500 rounded-full blur-md opacity-75"></div>
      <div className="relative flex items-center justify-center h-8 w-8 bg-blue-600 rounded-full border-2 border-slate-900">
        <span className="text-white font-bold text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>JD</span>
      </div>
    </div>
    <span className="text-xl font-bold tracking-wider text-white">LABS</span>
  </div>
);

export default Logo;
