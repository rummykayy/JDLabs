import React, { useState } from 'react';
import { UserIcon, AtSymbolIcon, PencilIcon } from '../constants';

interface ContactScreenProps {
  onBackToHome: () => void;
}

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

const ContactScreen: React.FC<ContactScreenProps> = ({ onBackToHome }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };
  
  const validate = (): FormErrors => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required.';
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email address is invalid.';
    }
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required.';
    if (!formData.message.trim()) newErrors.message = 'Message is required.';
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      // Simulate API call
      setTimeout(() => {
        setIsSubmitting(false);
        setIsSubmitted(true);
      }, 1500);
    }
  };

  const handleReset = () => {
    setFormData({ name: '', email: '', subject: '', message: '' });
    setIsSubmitted(false);
  };

  if (isSubmitted) {
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
            <h1 className="text-3xl font-bold text-slate-100">Thank You!</h1>
            <p className="text-slate-400 mt-3 mb-8">Your message has been sent successfully. Our team will get back to you shortly.</p>
            <button
              onClick={handleReset}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-400 shadow-[0_0_12px_rgba(37,99,235,0.4)] hover:shadow-[0_0_16px_rgba(59,130,246,0.6)]"
            >
              Send Another Message
            </button>
        </div>
        <div className="text-center mt-8">
            <button 
                onClick={onBackToHome}
                className="text-slate-400 hover:text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
                &larr; Back to Home
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-4 sm:p-6 pt-12">
      <div className="w-full max-w-3xl mx-auto">
        <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-100">Contact Us</h1>
            <p className="text-slate-400 mt-4 text-lg">
                We'd love to hear from you. Fill out the form below and we'll get back to you as soon as possible.
            </p>
        </div>

        <div className="bg-slate-800 p-8 rounded-lg border border-slate-700">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <UserIcon />
                  </div>
                  <input
                    type="text" id="name" value={formData.name} onChange={handleChange}
                    className={`w-full bg-slate-700/50 border rounded-md py-2.5 pl-10 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 ${errors.name ? 'border-red-500 ring-red-500' : 'border-slate-600 focus:ring-blue-500 focus:border-blue-500'}`}
                    placeholder="Your Name"
                  />
                </div>
                {errors.name && <p className="mt-2 text-sm text-red-400">{errors.name}</p>}
              </div>
               <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <AtSymbolIcon />
                  </div>
                  <input
                    type="email" id="email" value={formData.email} onChange={handleChange}
                    className={`w-full bg-slate-700/50 border rounded-md py-2.5 pl-10 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 ${errors.email ? 'border-red-500 ring-red-500' : 'border-slate-600 focus:ring-blue-500 focus:border-blue-500'}`}
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && <p className="mt-2 text-sm text-red-400">{errors.email}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-slate-300 mb-2">
                Subject
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <PencilIcon />
                </div>
                <input
                  type="text" id="subject" value={formData.subject} onChange={handleChange}
                  className={`w-full bg-slate-700/50 border rounded-md py-2.5 pl-10 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 ${errors.subject ? 'border-red-500 ring-red-500' : 'border-slate-600 focus:ring-blue-500 focus:border-blue-500'}`}
                  placeholder="How can we help?"
                />
              </div>
              {errors.subject && <p className="mt-2 text-sm text-red-400">{errors.subject}</p>}
            </div>
            
             <div>
              <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">
                Message
              </label>
              <div className="relative">
                <textarea
                  id="message" value={formData.message} onChange={handleChange}
                  rows={5}
                  className={`w-full bg-slate-700/50 border rounded-md py-2.5 px-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 ${errors.message ? 'border-red-500 ring-red-500' : 'border-slate-600 focus:ring-blue-500 focus:border-blue-500'}`}
                  placeholder="Your message..."
                />
              </div>
              {errors.message && <p className="mt-2 text-sm text-red-400">{errors.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-400 shadow-[0_0_12px_rgba(37,99,235,0.4)] hover:shadow-[0_0_16px_rgba(59,130,246,0.6)] disabled:bg-slate-600 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {isSubmitting && <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>}
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>

        <div className="text-center mt-8">
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

export default ContactScreen;
