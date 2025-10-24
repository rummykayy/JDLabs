import React from 'react';

const MediaContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative group aspect-video bg-slate-900 rounded-lg overflow-hidden border-2 border-slate-700 transition-all duration-300 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/20">
      {children}
      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all duration-300 pointer-events-none"></div>
    </div>
  );
};

export default MediaContainer;