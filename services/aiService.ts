import { GoogleGenAI, Chat, Type } from '@google/genai';
import type { InterviewSettings, AiChatSession } from '../types';

// --- Gemini Implementation ---
const createGeminiChatSession = (model: string, systemInstruction: string): AiChatSession => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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

// --- Public Factory Function for Chat ---
interface CreateChatSessionParams {
    model: string;
    systemInstruction: string;
}

export const createChatSession = ({ model, systemInstruction }: CreateChatSessionParams): AiChatSession => {
    return createGeminiChatSession(model, systemInstruction);
};

// --- Public Function for URL Text Extraction ---
interface ExtractTextFromUrlParams {
    model: string;
    url: string;
}

export const extractTextFromUrl = async ({ model, url }: ExtractTextFromUrlParams): Promise<string> => {
    const prompt = `Please extract the full, clean text of the main job description from the following URL. Respond with only the job description text, with no introductory or concluding phrases like "Here is the job description". URL: ${url}`;
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({ model, contents: prompt });
    return response.text.trim();
};


// --- Public Function for Feedback Generation ---
interface GenerateFeedbackParams {
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


export const generateFeedback = async ({ model, transcript, settings }: GenerateFeedbackParams): Promise<any> => {
    const basePrompt = `Analyze the interview transcript for a candidate applying for the "${settings.position}" role. The interview was conducted at a '${settings.difficulty}' difficulty level. Provide a detailed, graphical-friendly analysis based on this difficulty. Transcript:\n---\n${transcript}\n---`;
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: model,
        contents: basePrompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: feedbackSchema,
        }
    });
    return JSON.parse(response.text.trim());
};