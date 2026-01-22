// Import prompt parts
import roleText from './prompts/role.txt?raw';
import guidelinesText from './prompts/guidelines.txt?raw';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_MODEL = 'gemini-2.0-flash-exp'; // You can change to gemini-1.5-pro or other models

interface GeminiContent {
  parts: Array<{ text: string }>;
}

interface GeminiRequest {
  contents: GeminiContent[];
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
}

/**
 * Call Gemini API with text generation
 */
const callGeminiAPI = async (contents: GeminiContent[], apiKey: string): Promise<string> => {
  const url = `${GEMINI_API_BASE}/models/${GEMINI_MODEL}:generateContent`;
  
  const requestBody: GeminiRequest = {
    contents
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'x-goog-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error:', errorText);
      throw new Error(`Gemini API failed: ${response.status} ${response.statusText}`);
    }

    const data: GeminiResponse = await response.json();
    
    // Extract text from response
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('No text generated from Gemini API');
    }

    return text;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
};

/**
 * Test Gemini API connection
 */
export const testGeminiConnection = async (apiKey: string) => {
  try {
    const contents: GeminiContent[] = [
      {
        parts: [
          { text: "Hello, are you working?" }
        ]
      }
    ];

    const response = await callGeminiAPI(contents, apiKey);
    console.log("Gemini Response:", response);
    return response;
  } catch (error) {
    console.error("Gemini Connection Error:", error);
    throw error;
  }
};

/**
 * Generate creative prompt using Gemini API
 */
export const generatePrompt = async (
  stepContext: string, 
  currentInput: string = "", 
  apiKey: string
): Promise<string> => {
  try {
    const systemMessage = `${roleText}\n\n${guidelinesText}`;
    
    let userMessage = `Create a creative prompt for: ${stepContext}.`;
    if (currentInput) {
      userMessage += ` refine and enhance this idea: "${currentInput}"`;
    }

    // Gemini doesn't have separate system/user roles like OpenAI
    // We combine them into a single prompt
    const combinedPrompt = `${systemMessage}\n\n${userMessage}`;

    const contents: GeminiContent[] = [
      {
        parts: [
          { text: combinedPrompt }
        ]
      }
    ];

    const response = await callGeminiAPI(contents, apiKey);
    return response;
  } catch (error) {
    console.error("Gemini Prompt Gen Error:", error);
    return "This is a dummy prompt for testing (Gemini Error). Context: " + stepContext;
  }
};
