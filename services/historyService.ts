import type { InterviewHistoryItem } from '../types';

const MAX_HISTORY_ITEMS = 50;

const getHistoryKey = (email: string) => `interviewHistory_${email}`;

/**
 * Retrieves the interview history for a given user from local storage.
 * @param email The email of the user.
 * @returns An array of interview history items, or an empty array if none found or on error.
 */
export const getInterviewHistory = (email: string): InterviewHistoryItem[] => {
  if (!email) return [];
  try {
    const historyJson = localStorage.getItem(getHistoryKey(email));
    return historyJson ? JSON.parse(historyJson) : [];
  } catch (error) {
    console.error("Failed to parse interview history from localStorage", error);
    // In case of parsing error, return empty to prevent app crash
    return [];
  }
};

/**
 * Adds a new interview record to the user's history in local storage.
 * The history is capped at a maximum number of items.
 * @param email The email of the user.
 * @param newItem The new interview history item to add.
 */
export const addInterviewToHistory = (email: string, newItem: InterviewHistoryItem): void => {
  if (!email) return;
  const history = getInterviewHistory(email);
  // Add the new item to the beginning and slice to maintain the max limit
  const updatedHistory = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);
  try {
    localStorage.setItem(getHistoryKey(email), JSON.stringify(updatedHistory));
  } catch (error)
    {
    console.error("Failed to save interview history to localStorage", error);
  }
};
