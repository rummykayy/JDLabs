import type { InterviewSettings, User, FeedbackData } from '../types';

// This service MOCKS an upload of interview assets by saving them to local storage.
// It uses a key that mimics the real Google Cloud Storage URL format requested by the user.
// This provides persistence for the demo without needing a backend or exposing credentials on the client.

export const uploadInterviewAssets = async (
    recordingMediaUrl: string | null, // The local blob URL for the recording
    summaryData: FeedbackData | null,
    user: User,
    settings: InterviewSettings
): Promise<{ recordingUrl: string | null, summaryUrl: string | null }> => {

    const timestamp = new Date().getTime();
    const safePosition = settings.position.replace(/[^a-zA-Z0-9]/g, '_');
    const baseFilename = `${user.email}_${timestamp}_${safePosition}`;

    let summaryUrl: string | null = null;

    if (summaryData) {
        // The "URL" is the user-requested GCS path, which we use as a unique key for local storage.
        const summaryFilename = `${baseFilename}.json`;
        summaryUrl = `https://storage.googleapis.com/jdlabs_images/Interviews/Summary/${summaryFilename}`;
        
        try {
            const summaryJsonString = JSON.stringify(summaryData, null, 2);
            localStorage.setItem(summaryUrl, summaryJsonString);
        } catch (error) {
            console.error("Failed to save summary to localStorage", error);
            summaryUrl = null; // Don't return a URL if saving failed
        }
    }
    
    // We just pass through the local blob URL for the recording.
    // The App component is responsible for revoking it later.
    return { recordingUrl: recordingMediaUrl, summaryUrl };
};

/**
 * MOCKS fetching an interview summary from local storage using the GCS-like URL as a key.
 * In a real app, this would fetch from a real cloud URL.
 * @param url The local storage key (formatted as a GCS URL)
 * @returns The parsed FeedbackData object or null if not found/error.
 */
export const fetchInterviewSummary = (url: string | null): FeedbackData | null => {
    // Check if the URL matches the expected format for our localStorage mock.
    const expectedPrefix = 'https://storage.googleapis.com/jdlabs_images/Interviews/Summary/';
    if (!url || !url.startsWith(expectedPrefix)) {
        return null;
    }
    try {
        // Use the full URL as the key to retrieve the data from localStorage.
        const summaryJson = localStorage.getItem(url);
        return summaryJson ? JSON.parse(summaryJson) : null;
    } catch (error) {
        console.error(`Failed to fetch or parse summary from localStorage for key: ${url}`, error);
        return null;
    }
};