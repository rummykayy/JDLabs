import * as React from 'react';
import type { Plan, User } from '../types';
import { LockClosedIcon, UserIcon, SimpleCheckIcon } from '../constants';
import { useToast } from '../contexts/ToastContext';

// Declare Razorpay on the window object for TypeScript
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface CheckoutFormProps {
  plan: Plan;
  currentUser: User | null;
  onConfirmPurchase: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ plan, currentUser, onConfirmPurchase }) => {
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [name, setName] = React.useState(currentUser?.name || '');
    const { showToast } = useToast();

    const handlePayment = () => {
        setIsProcessing(true);
        
        if (!window.Razorpay) {
            showToast("Payment gateway failed to load. Please check your network.", 'error');
            setIsProcessing(false);
            return;
        }
        
        const options = {
            key: 'rzp_test_1DP5mmOlF5G5ag', // Public Razorpay Test Key
            amount: plan.price * 100, // Amount in paise
            currency: 'INR',
            name: 'AI Interview Platform',
            description: `Purchase - ${plan.name} Plan`,
            handler: (response: any) => {
                console.log('Razorpay Payment Success:', response);
                setIsProcessing(false);
                // Simulate backend confirmation before calling onConfirmPurchase
                setTimeout(() => {
                    onConfirmPurchase();
                }, 500);
            },
            modal: {
                ondismiss: () => {
                    console.log('Checkout form closed');
                    setIsProcessing(false);
                }
            },
            prefill: {
                name: name,
                email: currentUser?.email || '',
            },
            theme: {
                color: '#2563eb' // A blue color that matches the site
            }
        };

        try {
            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
                console.error('Razorpay Payment Failed:', response);
                let errorMessage = 'An unknown error occurred.';
                // The response object contains an 'error' object with details.
                if (response && response.error) {
                    // 'description' is the most user-friendly message.
                    if (response.error.description) {
                        errorMessage = response.error.description;
                    } 
                    // 'reason' is a machine-readable code, but we can format it for the user.
                    else if (response.error.reason) {
                        errorMessage = `Reason: ${response.error.reason.replace(/_/g, ' ')}`;
                    }
                }
                showToast(`Payment failed: ${errorMessage}`, 'error');
                setIsProcessing(false);
            });
            rzp.open();
        } catch(err) {
            console.error("Error initializing Razorpay:", err);
            showToast("Could not initialize payment gateway. Please try again.", 'error');
            setIsProcessing(false);
        }
    };

    return (
        <div className="bg-slate-800 p-8 rounded-lg border border-slate-700">
            <h2 className="text-xl font-semibold mb-6">Payment Details</h2>
            <div className="space-y-6">
                <div>
                    <label htmlFor="cardName" className="block text-sm font-medium text-slate-300 mb-2">Name</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><UserIcon /></div>
                        <input 
                            type="text" 
                            id="cardName" 
                            className="w-full bg-slate-700/50 border border-slate-600 rounded-md py-2.5 pl-10 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe" 
                            required 
                        />
                    </div>
                </div>
                 <div>
                    <p className="text-sm text-slate-400">You will be redirected to Razorpay's secure checkout page to enter your payment details.</p>
                 </div>

                <div className="pt-2">
                    <button onClick={handlePayment} disabled={isProcessing} className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg text-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-400 shadow-[0_0_12px_rgba(37,99,235,0.4)] hover:shadow-[0_0_16px_rgba(59,130,246,0.6)] disabled:bg-slate-600 disabled:cursor-not-allowed disabled:shadow-none">
                        {isProcessing && <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>}
                        <LockClosedIcon />
                        {isProcessing ? 'Processing...' : `Pay ₹${plan.price}`}
                    </button>
                </div>
            </div>
        </div>
    );
};

interface CheckoutScreenProps {
  plan: Plan | null;
  currentUser: User | null;
  onConfirmPurchase: () => void;
  onBack: () => void;
}

const CheckoutScreen: React.FC<CheckoutScreenProps> = ({ plan: selectedPlan, currentUser, onConfirmPurchase, onBack }) => {

    if (!selectedPlan) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <h2 className="text-2xl font-bold text-slate-100">No Plan Selected</h2>
                <p className="text-slate-400 mt-2">Please go back to the pricing page to select a plan.</p>
                <button onClick={onBack} className="mt-6 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-400 shadow-[0_0_12px_rgba(37,99,235,0.4)] hover:shadow-[0_0_16px_rgba(59,130,246,0.6)]">
                    &larr; Back to Pricing
                </button>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col items-center justify-start p-4 sm:p-6 pt-12">
            <div className="w-full max-w-5xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-100">Secure Checkout</h1>
                    <p className="text-slate-400 mt-4 text-lg">You're upgrading to the <span className="text-blue-400 font-semibold">{selectedPlan.name}</span> plan. Complete your payment below.</p>
                </div>

                <div className="grid lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3">
                        <CheckoutForm plan={selectedPlan} currentUser={currentUser} onConfirmPurchase={onConfirmPurchase} />
                    </div>

                    <div className="lg:col-span-2">
                         <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 sticky top-24">
                            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">{selectedPlan.name} Plan</span>
                                    <span className="font-semibold">₹{selectedPlan.price}</span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                    <span>Taxes & Fees</span>
                                    <span className="font-semibold">₹0.00</span>
                                </div>
                                 <hr className="border-slate-600 !my-4" />
                                 <div className="flex justify-between font-bold text-lg">
                                    <span>Total Due Today</span>
                                    <span>₹{selectedPlan.price}</span>
                                </div>
                            </div>
                            <ul className="mt-6 space-y-2 text-sm">
                                {selectedPlan.features.map((feature, index) => (
                                    <li key={index} className="flex items-center gap-2 text-slate-400">
                                        <div className="w-5 h-5 text-blue-400"><SimpleCheckIcon /></div>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                         </div>
                    </div>
                </div>

                <div className="text-center mt-8">
                    <button onClick={onBack} className="text-sm text-slate-400 hover:text-slate-200">&larr; Back to Pricing</button>
                </div>
            </div>
        </div>
    );
};

export default CheckoutScreen;
