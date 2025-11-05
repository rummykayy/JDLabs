import React from 'react';

const FeatureCard: React.FC<{ 
    icon: React.ReactNode; 
    title: string; 
    children: React.ReactNode; 
    media: React.ReactNode;
    reverseLayout?: boolean;
}> = ({ icon, title, children, media, reverseLayout = false }) => {
    const layoutClasses = `flex flex-col ${reverseLayout ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 lg:gap-12 items-center`;
    
    return (
        <div className={layoutClasses}>
            <div className="w-full md:w-1/2 flex-shrink-0">
                {media}
            </div>
            <div className="w-full md:w-1/2">
                <div className="flex items-center gap-4 mb-4">
                    <div className="flex-shrink-0 h-12 w-12 bg-slate-800 text-blue-400 rounded-lg flex items-center justify-center border border-slate-700">{icon}</div>
                    <h3 className="text-2xl lg:text-3xl font-bold text-slate-100">{title}</h3>
                </div>
                <div className="text-slate-400 space-y-3 text-base lg:text-lg leading-relaxed">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default FeatureCard;
