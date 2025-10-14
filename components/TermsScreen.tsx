import React from 'react';

interface TermsScreenProps {
  onBackToHome: () => void;
}

const TermsScreen: React.FC<TermsScreenProps> = ({ onBackToHome }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-start p-4 sm:p-6 pt-12">
        <div className="w-full max-w-4xl mx-auto">
            <div className="text-center mb-10">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-100">Terms and Conditions</h1>
                <p className="text-slate-400 mt-4 text-lg">Last Updated: October 26, 2023</p>
            </div>
            
            <article className="prose prose-invert prose-lg max-w-none text-slate-300 prose-headings:text-slate-100 prose-strong:text-slate-200 prose-a:text-blue-400">
                <h2 className="text-2xl font-bold text-slate-100 mt-8 mb-4">1. Acceptance of Terms</h2>
                <p>By accessing and using the AI Interview Platform ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>

                <h2 className="text-2xl font-bold text-slate-100 mt-8 mb-4">2. Description of Service</h2>
                <p>The Service is an AI-powered platform that allows users to conduct mock interviews. The Service uses third-party generative AI models to ask questions and provide feedback based on user responses and provided job descriptions.</p>

                <h2 className="text-2xl font-bold text-slate-100 mt-8 mb-4">3. User Accounts</h2>
                <p>You may be required to register for an account to access certain features. You are responsible for safeguarding your account information and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.</p>

                <h2 className="text-2xl font-bold text-slate-100 mt-8 mb-4">4. User Conduct</h2>
                <p>You agree not to use the Service for any unlawful purpose or in any way that interrupts, damages, or impairs the service. You are solely responsible for the content you create, including video/audio recordings and transcripts.</p>

                <h2 className="text-2xl font-bold text-slate-100 mt-8 mb-4">5. API Key Usage</h2>
                <p>The Service requires you to provide your own API key from third-party AI providers (e.g., Google Gemini). You are responsible for any costs associated with the use of your API key. You acknowledge that providing your API key in a client-side application has security risks and agree to use this feature for development and testing purposes at your own risk. We are not liable for any unauthorized use or charges to your API key.</p>

                <h2 className="text-2xl font-bold text-slate-100 mt-8 mb-4">6. Intellectual Property</h2>
                <p>The Service and its original content, features, and functionality are and will remain the exclusive property of JD Labs and its licensors. You retain all rights to the content you create during your interviews. By using the Service, you grant us a limited license to process your content solely for the purpose of providing the Service's features to you.</p>

                <h2 className="text-2xl font-bold text-slate-100 mt-8 mb-4">7. Disclaimers</h2>
                <p>The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The AI-generated feedback is for informational and educational purposes only and should not be considered professional career advice. We do not guarantee the accuracy, completeness, or usefulness of any information on the Service and neither adopt nor endorse, nor are we responsible for, the accuracy or reliability of any opinion, advice, or statement made.</p>

                <h2 className="text-2xl font-bold text-slate-100 mt-8 mb-4">8. Limitation of Liability</h2>
                <p>In no event shall JD Labs, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>

                <h2 className="text-2xl font-bold text-slate-100 mt-8 mb-4">9. Changes to Terms</h2>
                <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms and Conditions on this page.</p>

                 <h2 className="text-2xl font-bold text-slate-100 mt-8 mb-4">10. Contact Us</h2>
                <p>If you have any questions about these Terms, please contact us through our Contact page.</p>
            </article>

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

export default TermsScreen;