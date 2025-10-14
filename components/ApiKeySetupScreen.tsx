import React, { useState } from 'react';
import type { ModelSettings, ApiProvider } from '../types';

interface ApiKeySetupScreenProps {
  onSetupComplete: (provider: ApiProvider, apiKey: string, models: ModelSettings) => void;
}

const WarningIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

interface ModelConfigurationProps {
    settings: ModelSettings;
    onChange: (mode: keyof ModelSettings, value: string) => void;
}

const ModelConfiguration: React.FC<ModelConfigurationProps> = ({ settings, onChange }) => {
    const configItems: { key: keyof ModelSettings; label: string; description: string }[] = [
        { key: 'chat', label: 'Chat Interview', description: 'Model for text-based Q&A.' },
        { key: 'audio', label: 'Audio Interview', description: 'Model for voice-based Q&A.' },
        { key: 'video', label: 'Video Interview', description: 'Model for generating questions in a video call.' },
        { key: 'liveShare', label: 'Live Share / Coding', description: 'Model for coding challenges and screen sharing sessions.' },
        { key: 'evaluation', label: 'Evaluation / Scoring', description: 'Model for post-interview analysis and feedback.' },
    ];

    return (
        <div className="mt-8 bg-slate-800 p-6 rounded-lg border border-slate-700">
            <h3 className="text-xl font-bold text-slate-100 mb-4">AI Model Configuration</h3>
            <div className="space-y-4">
                {configItems.map(item => (
                    <div key={item.key}>
                        <label htmlFor={`model-${item.key}`} className="block text-sm font-medium text-slate-300">
                            {item.label}
                        </label>
                        <p className="text-xs text-slate-500 mb-2">{item.description}</p>
                        <input
                            type="text"
                            id={`model-${item.key}`}
                            value={settings[item.key]}
                            onChange={(e) => onChange(item.key, e.target.value)}
                            className="w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 px-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                        />
                    </div>
                ))}
            </div>
             <p className="text-xs text-slate-500 mt-4">
                Tip: Free tier API keys have daily quotas that are specific to each model. If you encounter a "quota exceeded" error, try switching to a different model to continue working.
            </p>
        </div>
    );
};


const ApiKeySetupScreen: React.FC<ApiKeySetupScreenProps> = ({ onSetupComplete }) => {
  const [provider, setProvider] = useState<ApiProvider>('gemini');
  const [key, setKey] = useState('');
  
  const geminiModels: ModelSettings = {
      chat: 'gemini-2.5-flash',
      audio: 'gemini-2.5-flash-native-audio-preview-09-2025',
      video: 'gemini-2.5-flash-native-audio-preview-09-2025',
      liveShare: 'gemini-2.5-flash-native-audio-preview-09-2025',
      evaluation: 'gemini-2.5-flash',
  };

  const perplexityModels: ModelSettings = {
      chat: 'llama-3-sonar-small-32k-online',
      audio: 'llama-3-sonar-small-32k-online',
      video: 'llama-3-sonar-small-32k-online',
      liveShare: 'llama-3-sonar-large-32k-online',
      evaluation: 'llama-3-sonar-large-32k-online',
  };

  const [modelSettings, setModelSettings] = useState<ModelSettings>(geminiModels);

  const handleProviderChange = (newProvider: ApiProvider) => {
    setProvider(newProvider);
    setModelSettings(newProvider === 'gemini' ? geminiModels : perplexityModels);
  };
  
  const handleModelChange = (mode: keyof ModelSettings, value: string) => {
    setModelSettings(prev => ({ ...prev, [mode]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) {
      onSetupComplete(provider, key.trim(), modelSettings);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-gray-200 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-slate-100">Developer API Key & Setup</h1>
            <p className="text-slate-400 mt-2">Please select your AI provider, provide an API key, and configure your models to continue.</p>
        </div>

        <div className="bg-yellow-900/30 border-2 border-yellow-500/50 rounded-lg p-6 flex items-start gap-4 mb-6" role="alert">
            <div className="flex-shrink-0">
                <WarningIcon />
            </div>
            <div>
                <h3 className="text-xl font-bold text-yellow-300">Security Warning</h3>
                <p className="text-yellow-300/90 mt-2">
                    This method is for **temporary development and testing only**.
                    Pasting your API key here makes it accessible in your browser, which is insecure.
                </p>
                <p className="text-yellow-300/90 mt-2">
                    In a production environment, never expose your API key on the client-side. Use environment variables on a secure backend server instead.
                </p>
            </div>
        </div>

        <div className="bg-slate-800 p-8 rounded-lg border border-slate-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">AI Provider</label>
              <div className="flex rounded-md border border-slate-600 overflow-hidden">
                <button
                  type="button"
                  onClick={() => handleProviderChange('gemini')}
                  className={`flex-1 p-2 font-semibold transition-colors ${provider === 'gemini' ? 'bg-blue-600 text-white' : 'bg-slate-700/50 hover:bg-slate-700'}`}
                >
                  Google Gemini
                </button>
                <button
                  type="button"
                  onClick={() => handleProviderChange('perplexity')}
                  className={`flex-1 p-2 font-semibold transition-colors ${provider === 'perplexity' ? 'bg-blue-600 text-white' : 'bg-slate-700/50 hover:bg-slate-700'}`}
                >
                  Perplexity
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-slate-300 mb-2">
                {provider === 'gemini' ? 'Gemini API Key' : 'Perplexity API Key'}
              </label>
              <input
                type="password"
                id="apiKey"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 px-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your API key..."
                autoComplete="off"
              />
            </div>

            <button
              type="submit"
              disabled={!key.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
            >
              Save and Continue
            </button>
          </form>
        </div>
        <ModelConfiguration settings={modelSettings} onChange={handleModelChange} />
      </div>
    </div>
  );
};

export default ApiKeySetupScreen;