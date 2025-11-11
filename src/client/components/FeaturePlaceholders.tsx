import React from 'react';

// --- Chat Placeholder ---
export const ChatInterviewPlaceholder = () => (
  <div className="w-full h-full p-4 flex flex-col gap-2 overflow-hidden">
      <div className="p-2 rounded-lg bg-slate-700 self-start max-w-[70%] animate-fade-in-chat" style={{ animationDelay: '0.5s' }}>
          <p className="text-xs text-slate-300">Tell me about a challenging project you've worked on.</p>
      </div>
      <div className="p-2 rounded-lg bg-blue-600 self-end max-w-[70%] animate-fade-in-chat" style={{ animationDelay: '2s' }}>
          <p className="text-xs text-white">Sure! In my previous role, I was tasked with...</p>
      </div>
      <div className="p-2 rounded-lg bg-slate-700 self-start max-w-[70%] animate-fade-in-chat" style={{ animationDelay: '3.5s' }}>
          <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
          </div>
      </div>
      <style>{`
          @keyframes fade-in-chat {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-chat {
              animation: fade-in-chat 0.5s ease-out forwards;
              opacity: 0;
          }
      `}</style>
  </div>
);