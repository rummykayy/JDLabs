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
    malpracticeReport: string | null;
}

const feedbackSchema = {
    type: Type.OBJECT,
    properties: {
        overallRating: { type: Type.INTEGER, description: 'An overall rating for the candidate from 1 (poor) to 10 (excellent).' },
        overallReasoning: { type: Type.STRING, description: 'A brief, one-sentence reasoning for the overall rating.' },
        recommendation: { type: Type.STRING, description: "A final hiring recommendation. Must be one of: 'Recommended for Hire', 'Needs Improvement', 'Not a Fit'." },
        metrics: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: 'Name of the skill being assessed (e.g., "Clarity & Communication", "Technical Depth", "Problem-Solving").' },
                    rating: { type: Type.INTEGER, description: 'A rating for this specific skill from 1 (poor) to 10 (excellent).' },
                    reasoning: { type: Type.STRING, description: 'A brief, one-sentence reasoning for this skill rating.' },
                },
                required: ['name', 'rating', 'reasoning'],
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
    required: ['overallRating', 'overallReasoning', 'recommendation', 'metrics', 'strengths', 'areasForImprovement'],
};


export const generateFeedback = async ({ model, transcript, settings, malpracticeReport }: GenerateFeedbackParams): Promise<any> => {
    let prompt = `
You are an expert hiring manager. Your task is to evaluate a candidate based on an interview transcript.

Role: "${settings.position}"
Difficulty: "${settings.difficulty}"

Analyze the provided transcript and generate a feedback report. The report must be in JSON format and strictly follow the provided schema. For the 'recommendation' field, you must choose one of these exact values: 'Recommended for Hire', 'Needs Improvement', or 'Not a Fit'.
`;

    if (malpracticeReport) {
        prompt += `
Additionally, consider the following malpractice report logged during the session. These events may indicate a lack of focus or preparation. Factor these into your evaluation, particularly for metrics like 'Professionalism' or 'Engagement', and mention them in the 'Areas for Improvement' if relevant.

--- MALPRACTICE REPORT ---
${malpracticeReport}
---
`;
    }

    prompt += `
Do not add any commentary or text outside of the JSON object.

Transcript:
---
${transcript}
---
`;
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: feedbackSchema,
        }
    });
    
    const text = response.text?.trim();
    if (!text) {
        const blockReason = response.candidates?.[0]?.finishReason;
        const safetyRatings = response.candidates?.[0]?.safetyRatings;
        let errorMessage = "The AI's response was empty.";
        if (blockReason) {
            errorMessage = `The AI's response was blocked. Reason: ${blockReason}.`;
            if (safetyRatings) {
                 errorMessage += ` Safety ratings: ${JSON.stringify(safetyRatings)}`;
            }
        }
        console.error(errorMessage, { blockReason, safetyRatings });
        throw new Error(errorMessage);
    }
    
    try {
        return JSON.parse(text);
    } catch (e) {
        console.error("Failed to parse AI feedback JSON:", text, e);
        throw new Error("The AI returned an invalid JSON format. Please try again.");
    }
};