import React from 'react';

interface PrivacyScreenProps {
  onBackToHome: () => void;
}

const PrivacyScreen: React.FC<PrivacyScreenProps> = ({ onBackToHome }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-start p-4 sm:p-6 pt-12">
        <div className="w-full max-w-4xl mx-auto">
            <div className="text-center mb-10">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-100">Privacy Policy</h1>
                <p className="text-slate-400 mt-4 text-lg">Last Updated: October 26, 2023</p>
            </div>
            
            <article className="prose prose-invert prose-lg max-w-none text-slate-300 prose-headings:text-slate-100 prose-strong:text-slate-200 prose-a:text-blue-400">
                <p>Your privacy is important to us. It is JD Labs' policy to respect your privacy regarding any information we may collect from you across our application, AI Interview Platform.</p>

                <h2 className="text-2xl font-bold text-slate-100 mt-8 mb-4">1. Information We Collect</h2>
                <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3">Personal Information</h3>
                <p>When you register for an account, we may ask for personal information, such as your name and email address.</p>
                
                <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3">Interview Data</h3>
                <p>When you use our service to conduct an interview, we collect the data you provide, which may include:</p>
                <ul className="list-disc list-inside space-y-2 mb-4 pl-4">
                    <li>Video and audio recordings of your interview sessions.</li>
                    <li>Transcripts of the interview conversation.</li>
                    <li>Text responses you type in chat interviews.</li>
                    <li>Job descriptions or URLs you provide for context.</li>
                </ul>

                <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3">API Keys</h3>
                <p>This application requires you to provide your own API key for third-party AI services (e.g., Google Gemini). We do not store your API key on our servers. The key is stored locally in your browser's memory for the duration of your session and is used to make direct calls to the AI provider's API from your browser.</p>

                <h2 className="text-2xl font-bold text-slate-100 mt-8 mb-4">2. How We Use Your Information</h2>
                <p>We use the information we collect in various ways, including to:</p>
                 <ul className="list-disc list-inside space-y-2 mb-4 pl-4">
                    <li>Provide, operate, and maintain our application.</li>
                    <li>Process your interview data to generate AI-powered feedback and analysis.</li>
                    <li>Improve, personalize, and expand our application.</li>
                    <li>Communicate with you, either directly or through one of our partners, for customer service, to provide you with updates and other information relating to the app.</li>
                </ul>

                <h2 className="text-2xl font-bold text-slate-100 mt-8 mb-4">3. Data Sharing and Disclosure</h2>
                <p>Your interview data (transcripts, recordings) is sent to third-party AI providers (like Google) to generate questions and feedback. Their use of your data is governed by their respective privacy policies. We do not share your personal information with third parties for marketing purposes.</p>

                <h2 className="text-2xl font-bold text-slate-100 mt-8 mb-4">4. Data Security</h2>
                <p>The security of your data is important to us. All interview recordings are processed locally in your browser and are not uploaded to our servers. The resulting media files (audio/video) and transcripts are stored temporarily in your browser's memory and are available for you to review and download. They are discarded when you finish the review or close the browser tab. Please be aware that no method of electronic storage is 100% secure.</p>

                <h2 className="text-2xl font-bold text-slate-100 mt-8 mb-4">5. Children's Privacy</h2>
                <p>Our service is not intended for use by children under the age of 13. We do not knowingly collect personally identifiable information from children under 13.</p>

                <h2 className="text-2xl font-bold text-slate-100 mt-8 mb-4">6. Changes to This Privacy Policy</h2>
                <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.</p>

                <h2 className="text-2xl font-bold text-slate-100 mt-8 mb-4">7. Contact Us</h2>
                <p>If you have any questions about this Privacy Policy, please contact us through the Contact page.</p>
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

export default PrivacyScreen;