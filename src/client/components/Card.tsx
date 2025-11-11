import React from 'react';

interface CardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, icon, children, className }) => {
  return (
    <div className={`bg-slate-800 p-6 rounded-lg border border-slate-700 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="text-blue-400">{icon}</div>
        <h2 className="text-lg font-semibold text-slate-200">{title}</h2>
      </div>
      <div>{children}</div>
    </div>
  );
};

export default Card;
