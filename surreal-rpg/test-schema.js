import { GoogleGenAI, Type } from "@google/genai";
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf-8');
const match = envFile.match(/VITE_GEMINI_API_KEY=(.*)/);
const apiKey = match ? match[1].trim() : '';

const ai = new GoogleGenAI({ apiKey });

async function run() {
    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            overarching_misery: { type: Type.STRING, description: "A deeply cynical..." },
            cynical_win_condition: { type: Type.STRING, description: "A secret..." },
            troll_rules: { type: Type.STRING, description: "Strict rules..." }
        },
        required: ["overarching_misery", "cynical_win_condition", "troll_rules"]
    };

    try {
        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Initialize a new game session.",
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                systemInstruction: "You are the architect of a deeply cynical, rage-inducing text adventure. Create a master narrative. You MUST use valid JSON."
            }
        });
        console.log(result.text);
    } catch (e) {
        console.error(e);
    }
}
run();
