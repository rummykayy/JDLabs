import React from 'react';
import { PLANS } from '../constants';
import type { Plan, User, View } from '../types';

interface PricingCardProps {
  plan: Plan;
  onSelect: (plan: Plan) => void;
  isCurrentPlan: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({ plan, onSelect, isCurrentPlan }) => (
  <div className={`bg-slate-800 p-8 rounded-lg border-2 flex flex-col h-full ${plan.popular ? 'border-blue-500' : 'border-slate-700'}`}>
    {plan.popular && (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
        Most Popular
      </div>
    )}
    <h3 className="text-2xl font-bold text-slate-100">{plan.name}</h3>
    <p className="text-slate-400 mt-2">{plan.description}</p>
    <div className="my-6">
      <span className="text-5xl font-bold text-white">₹{plan.price}</span>
      <span className="text-slate-400">/mo</span>
    </div>
    <ul className="space-y-3 text-slate-300 flex-grow">
      {plan.features.map((feature, index) => (
        <li key={index} className="flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>{feature}</span>
        </li>
      ))}
    </ul>
    <button
      onClick={() => onSelect(plan)}
      disabled={isCurrentPlan}
      className={`w-full mt-8 font-bold py-3 px-4 rounded-lg transition-colors text-lg ${
        isCurrentPlan
          ? 'bg-slate-700 cursor-not-allowed text-slate-400'
          : plan.ctaClass
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isCurrentPlan ? 'Current Plan' : plan.cta}
    </button>
  </div>
);


interface PricingScreenProps {
  onBackToHome: () => void;
  onSelectPlan: (plan: Plan) => void;
  currentUser: User | null;
  onNavigate: (view: View) => void;
}

const PricingScreen: React.FC<PricingScreenProps> = ({ onBackToHome, onSelectPlan, currentUser }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-start p-4 sm:p-6 pt-12 pb-20">
      <div className="w-full max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-100">Find the Right Plan for You</h1>
          <p className="text-slate-400 mt-4 text-lg max-w-2xl mx-auto">
            Choose the plan that fits your needs and unlock the full potential of AI-powered interviews.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          {PLANS.map((plan) => (
            <div key={plan.name} className="relative">
              <PricingCard
                plan={plan}
                onSelect={onSelectPlan}
                isCurrentPlan={currentUser?.plan === plan.name}
              />
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
            <button 
                onClick={onBackToHome}
                className="text-slate-400 hover:text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
                &larr; Back to Home
            </button>
        </div>
      </div>
    </div>
  );
};

export default PricingScreen;