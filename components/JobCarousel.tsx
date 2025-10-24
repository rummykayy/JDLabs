import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Job } from '../types';

const JobCard: React.FC<{ job: Job; onPractice: () => void; }> = ({ job, onPractice }) => (
    <div className="bg-slate-800/80 backdrop-blur-sm p-4 rounded-lg border border-slate-700 flex flex-col h-full hover:border-blue-500 transition-all duration-300 group transform hover:-translate-y-1">
        <div className="flex flex-wrap gap-1.5 mb-3">
            {job.skills.slice(0, 3).map(skill => (
                <span key={skill} className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">{skill}</span>
            ))}
            {job.skills.length > 3 && (
                <span className="text-xs bg-slate-600 text-slate-400 px-2 py-0.5 rounded">+{job.skills.length - 3} more</span>
            )}
        </div>
        <div className="flex-grow">
            <h3 className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors">{job.title}</h3>
            <p className="text-sm text-slate-400 mt-1">{job.company} &middot; {job.location}</p>
        </div>
        <div className="mt-4 flex items-center justify-between">
            <span className="text-sm font-semibold text-green-400">{job.salary}</span>
            <button onClick={onPractice} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-1 px-3 rounded text-xs transition-colors shadow-sm">
                Start Interview
            </button>
        </div>
    </div>
);

const JobCarousel: React.FC<{ 
    jobs: Job[]; 
    onLoadJd: (job: Job) => void;
    onPractice: (job: Job) => void;
}> = ({ jobs, onLoadJd, onPractice }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [itemsToShow, setItemsToShow] = useState(3);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const updateItemsToShow = useCallback(() => {
        if (window.innerWidth >= 1024) setItemsToShow(3);
        else if (window.innerWidth >= 768) setItemsToShow(2);
        else setItemsToShow(1);
    }, []);

    useEffect(() => {
        updateItemsToShow();
        window.addEventListener('resize', updateItemsToShow);
        return () => window.removeEventListener('resize', updateItemsToShow);
    }, [updateItemsToShow]);

    const maxIndex = jobs.length > itemsToShow ? jobs.length - itemsToShow : 0;

    const resetTimeout = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };

    useEffect(() => {
        resetTimeout();
        timeoutRef.current = setTimeout(() => {
            setCurrentIndex(prevIndex => (prevIndex >= maxIndex ? 0 : prevIndex + 1));
        }, 5000);
        return () => resetTimeout();
    }, [currentIndex, maxIndex]);

    const goPrev = () => {
        setCurrentIndex(prevIndex => (prevIndex <= 0 ? maxIndex : prevIndex - 1));
    };

    const goNext = () => {
        setCurrentIndex(prevIndex => (prevIndex >= maxIndex ? 0 : prevIndex + 1));
    };

    return (
        <div 
            className="relative w-full group"
            onMouseEnter={resetTimeout}
            onMouseLeave={() => {
                timeoutRef.current = setTimeout(() => {
                    goNext();
                }, 5000);
            }}
        >
            <div className="overflow-hidden" ref={containerRef}>
                <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${(currentIndex * 100) / itemsToShow}%)` }}
                >
                    {jobs.map((job, index) => (
                        <div key={index} className="p-2" style={{ flex: `0 0 ${100 / itemsToShow}%` }}>
                            <JobCard job={job} onPractice={() => onPractice(job)} />
                        </div>
                    ))}
                </div>
            </div>

            <button 
                onClick={goPrev} 
                className="absolute top-1/2 -left-4 -translate-y-1/2 bg-slate-700/50 hover:bg-slate-600 rounded-full p-2 z-10 transition-opacity opacity-0 group-hover:opacity-100"
                aria-label="Previous Job"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button 
                onClick={goNext} 
                className="absolute top-1/2 -right-4 -translate-y-1/2 bg-slate-700/50 hover:bg-slate-600 rounded-full p-2 z-10 transition-opacity opacity-0 group-hover:opacity-100"
                aria-label="Next Job"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
        </div>
    );
};

export default JobCarousel;