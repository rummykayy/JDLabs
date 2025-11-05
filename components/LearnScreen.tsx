import React from 'react';
import Card from './Card';
import { BookOpenIcon, AcademicCapIcon, LightbulbIcon } from '../constants';

interface LearnScreenProps {
  onBackToHome: () => void;
}

const competencies = [
    {
        type: 'Sales & Behavioral',
        skills: 'Communication, Persuasion, Objection Handling, and Resilience. AI can analyze speech clarity, confidence, and tone.'
    },
    {
        type: 'Non-Technical/Soft Skills',
        skills: 'Teamwork, conscientiousness, and adaptability are assessed using psychometric evaluations and real-world simulations.'
    }
];

const techQuestions = [
    "“Have you used AI tools like ChatGPT in your work?”",
    "“What are your thoughts on AI in your industry?”",
    "“Tell me about a time you had to learn a new digital tool quickly.”",
    "“How do you stay informed about new technology?”",
];

const prepStrategies = [
    "Experiment Proactively: Use tools like ChatGPT for personal projects to build familiarity.",
    "Stay Informed: Read industry blogs and follow AI analysts on LinkedIn.",
    "Be Transparent: If you lack experience, express your dedication to learning.",
    "Focus on Soft Skills: Adaptability and problem-solving are highly valued."
];


const LearnScreen: React.FC<LearnScreenProps> = ({ onBackToHome }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-start p-4 sm:p-6 pt-12">
        <div className="w-full max-w-5xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-100">Learn Center: Mastering the AI-Driven Career</h1>
                <p className="text-slate-400 mt-4 text-lg max-w-3xl mx-auto">
                    Your guide to thriving in the modern job market. Here are the skills and strategies to succeed in AI-powered interviews.
                </p>
            </div>
            
            <section className="mb-12">
                 <Card title="AI Mock Interview Practice: The Modern Advantage" icon={<BookOpenIcon />}>
                    <div className="text-slate-400 space-y-3">
                        <p>AI platforms provide an experience that is real-time, interactive, and adaptive, generating role-specific questions dynamically.</p>
                        <ul className="list-disc list-inside space-y-1 pl-2">
                            <li><strong className="text-slate-300">Adaptive Learning:</strong> The system adjusts question complexity based on your skill level.</li>
                            <li><strong className="text-slate-300">Communication Analysis:</strong> Get feedback on your confidence, tone, fluency, and clarity.</li>
                            <li><strong className="text-slate-300">Performance Tracking:</strong> Receive step-by-step feedback to enhance your responses over time.</li>
                        </ul>
                    </div>
                </Card>
            </section>
            
            <section className="mb-12">
                <h2 className="text-2xl font-bold text-slate-100 text-center mb-8">Key Competencies to Develop</h2>
                <div className="grid md:grid-cols-2 gap-8">
                    {competencies.map(comp => (
                        <Card key={comp.type} title={comp.type} icon={<AcademicCapIcon />}>
                            <p className="text-slate-400">{comp.skills}</p>
                        </Card>
                    ))}
                </div>
            </section>
            
            <section className="mb-12">
                 <Card title="Preparing for AI Questions in Non-Tech Roles" icon={<LightbulbIcon />}>
                    <p className="text-slate-400 mb-4">Digital literacy is now a core expectation. Be ready to discuss your relationship with technology and AI.</p>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                           <h4 className="font-semibold text-slate-200 mb-2">Common Questions:</h4>
                           <ul className="list-disc list-inside space-y-1 text-slate-400 text-sm">
                               {techQuestions.map((q, i) => <li key={i}>{q}</li>)}
                           </ul>
                        </div>
                        <div>
                           <h4 className="font-semibold text-slate-200 mb-2">Preparation Strategies:</h4>
                            <ul className="list-disc list-inside space-y-1 text-slate-400 text-sm">
                                {prepStrategies.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                        </div>
                    </div>
                </Card>
            </section>

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

export default LearnScreen;