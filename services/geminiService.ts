
import { GoogleGenAI } from "@google/genai";
import { Availability, Weekend } from '../types';

// This is a placeholder for the API key.
// In a real production environment, this should be handled securely.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Using a placeholder. Gemini calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const findCommonFreeWeekends = async (
  availability: Availability,
  users: string[],
  weekends: Weekend[]
): Promise<string[]> => {
  const model = 'gemini-3-flash-preview';

  const weekendMap = weekends.reduce((acc, w) => {
    acc[w.id] = w.display;
    return acc;
  }, {} as Record<string, string>);

  const prompt = `
    You are an intelligent availability coordinator. Based on the following JSON data representing weekend availability for a group of friends, identify all the weekends where every single person is marked as "Free".
    The list of all friends is: ${JSON.stringify(users)}.
    The availability data is: ${JSON.stringify(availability)}.
    The mapping from weekend ID to display string is: ${JSON.stringify(weekendMap)}.
    
    Your task is to return a JSON array of display strings for the weekends where everyone is "Free".
    For example, if everyone is free for the weekend with id "2024-7-20", you should return its display string "Sat, Jul 20 - Sun, Jul 21".
    
    Return ONLY a valid JSON array of strings. Do not include any other text, explanations, or markdown formatting. If no such weekends exist, return an empty array [].
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    
    const textResponse = response.text?.trim();

    if (!textResponse) {
      console.error("Gemini returned an empty response.");
      return [];
    }

    // Clean the response in case Gemini wraps it in markdown
    const cleanedJsonString = textResponse.replace(/^```json\s*|```\s*$/g, '');

    const result = JSON.parse(cleanedJsonString);

    if (Array.isArray(result) && result.every(item => typeof item === 'string')) {
      return result;
    } else {
      console.error("Parsed response is not an array of strings:", result);
      return [];
    }

  } catch (error) {
    console.error("Error calling Gemini API or parsing response:", error);
    throw new Error("Failed to process availability with Gemini.");
  }
};
