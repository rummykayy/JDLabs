import { GoogleGenAI, Chat, Type } from '@google/genai';
import type { ApiProvider, InterviewSettings, AiChatSession } from '../types';

// --- Perplexity API Types (for internal use) ---
interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// --- Standardized API Error Handling ---
const handleApiError = async (response: Response) => {
    const errorData = await response.json().catch(() => ({})); // Gracefully handle non-JSON responses
    const errorMessage = JSON.stringify({
        error: {
            code: response.status,
            message: errorData?.error?.message || response.statusText,
            status: errorData?.error?.type || 'API_ERROR'
        }
    });
    throw new Error(errorMessage);
};

const createCorsError = () => {
    const errorMessage = JSON.stringify({
        error: {
            code: 0,
            message: "Could not connect to the Perplexity API. This is often caused by a browser security policy (CORS) blocking the request. Direct client-side API calls can be restricted. Consider trying the Gemini provider.",
            status: 'NETWORK_OR_CORS_ERROR'
        }
    });
    return new Error(errorMessage);
};

const createModelMismatchError = (provider: ApiProvider, model: string) => {
    const message = provider === 'perplexity' 
        ? `Invalid model '${model}' for Perplexity provider. You cannot use a Gemini model with Perplexity. Please select a valid Perplexity model in the settings.`
        : `Invalid model '${model}' for Gemini provider. You cannot use a Perplexity model with Gemini. Please select a valid Gemini model in the settings.`;
        
    const errorMessage = JSON.stringify({
        error: {
            code: 400,
            message: message,
            status: 'INVALID_ARGUMENT'
        }
    });
    return new Error(errorMessage);
};


// --- Gemini Implementation ---
const createGeminiChatSession = (apiKey: string, model: string, systemInstruction: string): AiChatSession => {
    const ai = new GoogleGenAI({ apiKey });
    const chat: Chat = ai.chats.create({
        model,
        config: { systemInstruction },
    });
    return {
        sendMessage: async (message: string): Promise<string> => {
            const result = await chat.sendMessage({ message });
            return result.text;
        },
    };
};

// --- Perplexity Implementation ---
const createPerplexityChatSession = (apiKey: string, model: string, systemInstruction: string): AiChatSession => {
    const history: PerplexityMessage[] = [];
    const API_URL = 'https://api.perplexity.ai/chat/completions';

    return {
        sendMessage: async (message: string): Promise<string> => {
            history.push({ role: 'user', content: message });

            const messages: PerplexityMessage[] = [
                { role: 'system', content: systemInstruction },
                ...history
            ];
            
            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`,
                    },
                    body: JSON.stringify({
                        model: model,
                        messages: messages,
                    }),
                });

                if (!response.ok) {
                    await handleApiError(response);
                }

                const data = await response.json();
                const assistantResponse = data.choices[0]?.message?.content;
                if (!assistantResponse) {
                    throw new Error("Invalid response structure from Perplexity API.");
                }

                history.push({ role: 'assistant', content: assistantResponse });
                return assistantResponse;
            } catch (error) {
                if (error instanceof TypeError && error.message === 'Failed to fetch') {
                    throw createCorsError();
                }
                throw error; // Re-throw other errors
            }
        },
    };
};

// --- Public Factory Function for Chat ---
interface CreateChatSessionParams {
    provider: ApiProvider;
    apiKey: string;
    model: string;
    systemInstruction: string;
}

export const createChatSession = ({ provider, apiKey, model, systemInstruction }: CreateChatSessionParams): AiChatSession => {
    switch (provider) {
        case 'gemini':
             if (!model.startsWith('gemini-')) {
                throw createModelMismatchError(provider, model);
            }
            return createGeminiChatSession(apiKey, model, systemInstruction);
        case 'perplexity':
            if (model.startsWith('gemini-')) {
                throw createModelMismatchError(provider, model);
            }
            return createPerplexityChatSession(apiKey, model, systemInstruction);
        default:
            throw new Error(`Unsupported API provider: ${provider}`);
    }
};

// --- Public Function for URL Text Extraction ---
interface ExtractTextFromUrlParams {
    provider: ApiProvider;
    apiKey: string;
    model: string;
    url: string;
}

export const extractTextFromUrl = async ({ provider, apiKey, model, url }: ExtractTextFromUrlParams): Promise<string> => {
    const prompt = `Please extract the full, clean text of the main job description from the following URL. Respond with only the job description text, with no introductory or concluding phrases like "Here is the job description". URL: ${url}`;

    if (provider === 'gemini') {
        if (!model.startsWith('gemini-')) {
            throw createModelMismatchError(provider, model);
        }
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({ model, contents: prompt });
        return response.text.trim();
    }

    if (provider === 'perplexity') {
        if (model.startsWith('gemini-')) {
            throw createModelMismatchError(provider, model);
        }
        const API_URL = 'https://api.perplexity.ai/chat/completions';
        
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: 'system', content: 'You are an expert web scraper. You extract specific text from URLs and return only that text.' },
                        { role: 'user', content: prompt }
                    ],
                }),
            });
            
            if (!response.ok) {
               await handleApiError(response);
            }

            const data = await response.json();
            const content = data.choices[0]?.message?.content;
            if (!content) {
                throw new Error("Invalid response structure from Perplexity API for URL extraction.");
            }
            return content.trim();
        } catch (error) {
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                throw createCorsError();
            }
            throw error; // Re-throw other errors
        }
    }
    
    throw new Error(`Unsupported API provider for URL extraction: ${provider}`);
};


// --- Public Function for Feedback Generation ---
interface GenerateFeedbackParams {
    provider: ApiProvider;
    apiKey: string;
    model: string;
    transcript: string;
    settings: InterviewSettings;
}

const feedbackSchema = {
    type: Type.OBJECT,
    properties: {
        overallRating: { type: Type.INTEGER, description: 'An overall rating for the candidate from 1 to 10.' },
        overallReasoning: { type: Type.STRING, description: 'A brief, one-sentence reasoning for the overall rating.' },
        recommendation: { type: Type.STRING, description: "A final hiring recommendation. Must be one of: 'Recommended for Hire', 'Needs Improvement', 'Not a Fit'." },
        metrics: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: 'Name of the skill being assessed (e.g., "Clarity & Communication", "Technical Depth", "Problem-Solving").' },
                    rating: { type: Type.INTEGER, description: 'A rating for this specific skill from 1 to 10.' },
                    reasoning: { type: Type.STRING, description: 'A brief, one-sentence reasoning for this skill rating.' },
                },
            },
        },
        strengths: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'A list of 2-3 key strengths demonstrated by the candidate.',
        },
        areasForImprovement: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'A list of 2-3 specific, actionable areas for improvement.',
        },
    },
};


export const generateFeedback = async ({ provider, apiKey, model, transcript, settings }: GenerateFeedbackParams): Promise<any> => {
    const basePrompt = `Analyze the interview transcript for a candidate applying for the "${settings.position}" role. Provide a detailed, graphical-friendly analysis. Transcript:\n---\n${transcript}\n---`;

    if (provider === 'gemini') {
        if (!model.startsWith('gemini-')) {
            throw createModelMismatchError(provider, model);
        }
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: model,
            contents: basePrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: feedbackSchema,
            }
        });
        return JSON.parse(response.text.trim());
    }

    if (provider === 'perplexity') {
        if (model.startsWith('gemini-')) {
            throw createModelMismatchError(provider, model);
        }
        const API_URL = 'https://api.perplexity.ai/chat/completions';
        const systemInstruction = `You are an expert hiring manager. Your task is to provide a detailed analysis of an interview transcript. You must respond ONLY with a valid JSON object. Do not include any text before or after the JSON. The JSON structure must be as follows:
{
  "overallRating": "integer (1-10)",
  "overallReasoning": "string",
  "recommendation": "'Recommended for Hire' | 'Needs Improvement' | 'Not a Fit'",
  "metrics": [{ "name": "string", "rating": "integer (1-10)", "reasoning": "string" }],
  "strengths": ["string"],
  "areasForImprovement": ["string"]
}`;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: 'system', content: systemInstruction },
                        { role: 'user', content: basePrompt }
                    ],
                }),
            });
            
            if (!response.ok) {
               await handleApiError(response);
            }

            const data = await response.json();
            const content = data.choices[0]?.message?.content;
            if (!content) {
                throw new Error("Invalid response structure from Perplexity API for feedback.");
            }
            return JSON.parse(content);
        } catch (error) {
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                throw createCorsError();
            }
            throw error; // Re-throw other errors
        }
    }

    throw new Error(`Unsupported API provider for feedback: ${provider}`);
};