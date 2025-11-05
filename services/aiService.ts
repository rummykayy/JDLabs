import { GoogleGenAI, Chat, Type } from '@google/genai';
import type { InterviewSettings, AiChatSession, InterviewQuestion, InterviewAnswer, FeedbackData } from '../types';

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

// --- Public Function for Question Generation ---
interface GenerateQuestionsParams {
    model: string;
    jobDescription: string;
    difficulty: string;
}

export const generateQuestions = async ({ model, jobDescription, difficulty }: GenerateQuestionsParams): Promise<string[]> => {
    const questionSchema = {
        type: Type.OBJECT,
        properties: {
            questions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
            },
        },
        required: ['questions'],
    };

    const prompt = `Based on the following job description and interview difficulty, generate 5 relevant interview questions.
    
    Job Description: "${jobDescription}"
    Difficulty: "${difficulty}"

    Return the questions as a JSON object with a single key "questions" containing an array of strings. Do not add any other text.`;

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: questionSchema,
        }
    });

    try {
        const result = JSON.parse(response.text);
        if (result.questions && Array.isArray(result.questions)) {
            return result.questions;
        }
        throw new Error("Invalid format for generated questions.");
    } catch (e) {
        console.error("Failed to parse AI-generated questions:", response.text, e);
        // Fallback to simpler parsing if strict JSON fails
        const lines = response.text.split('\n').filter(line => line.trim().match(/^\d+\./));
        if (lines.length > 0) return lines.map(line => line.replace(/^\d+\.\s*/, '').trim());
        throw new Error("Could not generate or parse interview questions.");
    }
};


// --- Public Function for Feedback Generation ---
interface GenerateFeedbackParams {
    model: string;
    questions: InterviewQuestion[];
    answers: InterviewAnswer[];
    settings: InterviewSettings;
    malpracticeReport: string | null;
}

const feedbackSchema = {
    type: Type.OBJECT,
    properties: {
        overallRating: { type: Type.NUMBER, description: 'An overall rating for the candidate from 1 (poor) to 10 (excellent), as a decimal.' },
        overallReasoning: { type: Type.STRING, description: 'A brief, one-sentence reasoning for the overall rating.' },
        recommendation: { type: Type.STRING, description: "A final hiring recommendation. Must be one of: 'Recommended for Hire', 'Needs Improvement', 'Not a Fit'." },
        metrics: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: 'Name of the skill being assessed (e.g., "Clarity & Communication", "Technical Depth", "Problem-Solving").' },
                    rating: { type: Type.NUMBER, description: 'A rating for this specific skill from 1 (poor) to 10 (excellent), as a decimal.' },
                    reasoning: { type: Type.STRING, description: 'A brief, one-sentence reasoning for this skill rating, based on specific answers.' },
                },
                required: ['name', 'rating', 'reasoning'],
            },
        },
        strengths: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'A list of 2-3 key strengths demonstrated by the candidate, citing evidence from their answers.',
        },
        areasForImprovement: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'A list of 2-3 specific, actionable areas for improvement, citing evidence from their answers.',
        },
    },
    required: ['overallRating', 'overallReasoning', 'recommendation', 'metrics', 'strengths', 'areasForImprovement'],
};


export const generateFeedback = async ({ model, questions, answers, settings, malpracticeReport }: GenerateFeedbackParams): Promise<FeedbackData> => {
    
    const qaPairs = questions.map(q => {
        const correspondingAnswer = answers.find(a => a.question_id === q.id);
        return `Question: ${q.question_text}\nAnswer: ${correspondingAnswer ? correspondingAnswer.answer_text : "(No answer provided)"}`;
    }).join('\n\n---\n\n');
    
    let prompt = `
You are an expert hiring manager. Your task is to evaluate a candidate based on an interview transcript containing structured Question and Answer pairs.

Role: "${settings.position}"
Job Description: "${settings.jobDescription}"
Difficulty: "${settings.difficulty}"

Analyze the provided Q&A pairs and generate a feedback report. The report must be in JSON format and strictly follow the provided schema. For the 'recommendation' field, you must choose one of these exact values: 'Recommended for Hire', 'Needs Improvement', or 'Not a Fit'. Base your reasoning and scores on specific evidence from the candidate's answers.
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

Interview Transcript:
---
${qaPairs}
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
