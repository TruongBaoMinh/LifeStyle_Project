import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
});

export const testOpenAIConnection = async () => {
    try {
        const res = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: "Hello, are you working?" }
            ]
        });
        console.log("OpenAI Response:", res.choices[0].message.content);
        return res.choices[0].message.content;
    } catch (error) {
        console.error("OpenAI Error:", error);
        throw error;
    }
};

// Import prompt parts
import roleText from './prompts/role.txt?raw';
import guidelinesText from './prompts/guidelines.txt?raw';

export const generatePrompt = async (stepContext: string, currentInput: string = "") => {
    try {
        const systemMessage = `${roleText}\n\n${guidelinesText}`;
        
        let userMessage = `Create a creative prompt for: ${stepContext}.`;
        if (currentInput) {
            userMessage += ` refine and enhance this idea: "${currentInput}"`;
        }

        const res = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemMessage },
                { role: "user", content: userMessage }
            ]
        });
        return res.choices[0].message.content || "";
    } catch (error) {
        console.error("OpenAI Prompt Gen Error:", error);
        throw error;
    }
};