import React from 'react';

interface OrderSuccessScreenProps {
  onBackToHome: () => void;
}

const OrderSuccessScreen: React.FC<OrderSuccessScreenProps> = ({ onBackToHome }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
        <div className="bg-slate-800 p-10 rounded-lg border border-slate-700 max-w-lg w-full">
            <div className="flex justify-center mb-6">
                <div className="h-20 w-20 bg-green-500/10 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            </div>
            <h1 className="text-3xl font-bold text-slate-100">Purchase Successful!</h1>
            <p className="text-slate-400 mt-3 mb-8">
                Your plan has been upgraded. You can now access all the features of your new plan.
            </p>
            <button
              onClick={onBackToHome}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg text-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-400 shadow-[0_0_12px_rgba(37,99,235,0.4)] hover:shadow-[0_0_16px_rgba(59,130,246,0.6)]"
            >
              Go to Dashboard
            </button>
        </div>
    </div>
  );
};

export default OrderSuccessScreen;
