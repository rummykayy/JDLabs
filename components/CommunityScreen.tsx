import React from 'react';
import Card from './Card';
import { ClockIcon, ScalesIcon, ChartBarIcon, AlertTriangleIcon } from '../constants';
import { 
    COMMUNITY_EFFICIENCY_VIDEO, 
    COMMUNITY_BIAS_VIDEO, 
    COMMUNITY_ANALYSIS_VIDEO 
} from '../constants/media';

interface CommunityScreenProps {
  onBackToHome: () => void;
}

const tableData = [
    { tool: 'Interviewing.io', features: 'Live coding with engineers from top tech companies.' },
    { tool: 'Pramp', features: 'Peer-to-peer mock sessions with structured feedback.' },
    { tool: 'LeetCode', features: 'Extensive library of coding challenges and mock assessments.' },
    { tool: 'HackerRank', features: 'Tailored mock interviews for various tech roles.' },
    { tool: 'CodeSignal', features: 'Skill assessment and benchmarking against industry standards.' },
    { tool: 'Gainlo', features: 'Connects applicants with experienced mock interviewers.' },
];

const BenefitCard: React.FC<{ videoSrc: string; title: string; children: React.ReactNode }> = ({ videoSrc, title, children }) => (
    <div className="relative bg-slate-900 rounded-lg border border-slate-700 overflow-hidden group hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-1 h-80">
        <video
            key={videoSrc}
            src={videoSrc}
            autoPlay
            loop
            muted
            playsInline
            className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        <div className="relative h-full flex flex-col justify-end p-6">
            <h3 className="text-xl font-bold text-white mb-2 transition-colors duration-300">{title}</h3>
            <p className="text-slate-300 text-sm leading-relaxed">{children}</p>
        </div>
    </div>
);

const CommunityScreen: React.FC<CommunityScreenProps> = ({ onBackToHome }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-start p-4 sm:p-6 pt-12 pb-20">
        <div className="w-full max-w-5xl mx-auto">
            <div className="text-center mb-16">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-100">AI: Redefining Hiring and Career Readiness</h1>
                <p className="text-slate-400 mt-4 text-lg max-w-3xl mx-auto">
                   As AI integrates into hiring, understanding these tools is essential. Welcome to the intelligent hiring revolution—faster, smarter, and more precise.
                </p>
            </div>
            
            <section id="why-ai" className="mb-16">
                <h2 className="text-2xl font-bold text-slate-100 text-center mb-8">Why AI in Recruitment?</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    <BenefitCard title="Enhanced Efficiency" videoSrc={COMMUNITY_EFFICIENCY_VIDEO}>
                        AI automates scheduling and initial screenings, reducing time-to-hire from weeks to days and freeing up teams to focus on the best candidates.
                    </BenefitCard>
                    <BenefitCard title="Reduced Bias" videoSrc={COMMUNITY_BIAS_VIDEO}>
                        By using standardized assessments, AI focuses on skills and qualifications, helping to minimize unconscious bias and promote fair evaluation.
                    </BenefitCard>
                    <BenefitCard title="In-Depth Analysis" videoSrc={COMMUNITY_ANALYSIS_VIDEO}>
                        Gain objective insights into candidate performance, analyzing everything from speech clarity and confidence to technical proficiency.
                    </BenefitCard>
                </div>
            </section>
            
            <section id="tools" className="mb-16">
                <h2 className="text-2xl font-bold text-slate-100 text-center mb-8">Top AI-Powered Tools for Interview Prep</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {tableData.map(({ tool, features }) => (
                         <div key={tool} className="bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-blue-500 hover:bg-slate-700/50 transition-all transform hover:-translate-y-1">
                            <h3 className="text-lg font-semibold text-slate-200">{tool}</h3>
                            <p className="text-sm text-slate-400 mt-2">{features}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section id="challenges">
                <h2 className="text-2xl font-bold text-slate-100 text-center mb-8">Critical Challenges & Human Oversight</h2>
                 <div className="space-y-6">
                    <Card title="Algorithmic Bias and Discrimination" icon={<AlertTriangleIcon />}>
                        <p className="text-slate-400">AI trained on historical data can perpetuate societal biases. Regular audits, diverse datasets, and crucial human oversight are necessary to ensure fairness and mitigate legal risks.</p>
                    </Card>
                     <Card title="Loss of the Human Element" icon={<AlertTriangleIcon />}>
                        <p className="text-slate-400">An impersonal process can harm the candidate experience. Human judgment remains vital for assessing cultural fit, complex skills, and making final hiring decisions.</p>
                    </Card>
                      <Card title="Ethical Boundaries" icon={<AlertTriangleIcon />}>
                        <p className="text-slate-400">The potential for cheating in asynchronous tests and a lack of transparency in AI decisions raise ethical questions that require clear guidelines and accountability.</p>
                    </Card>
                </div>
            </section>

            <div className="text-center mt-16">
                <button 
                    onClick={onBackToHome}
                    className="inline-block bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2 px-6 rounded-lg border border-slate-600 transition-colors"
                >
                    &larr; Back to Home
                </button>
            </div>
        </div>
    </div>
  );
};

export default CommunityScreen;