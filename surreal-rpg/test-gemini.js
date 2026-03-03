import { generateMasterStory } from './src/api/geminiClient.js';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
    try {
        console.log("Calling generateMasterStory...");
        const result = await generateMasterStory();
        console.log("Result:", result);
    } catch (e) {
        console.error("Error:", e);
    }
}

run();
