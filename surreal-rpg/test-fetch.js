import fs from 'fs';
const envFile = fs.readFileSync('.env', 'utf-8');
const match = envFile.match(/VITE_GEMINI_API_KEY=(.*)/);
const apiKey = match ? match[1].trim() : '';

async function run() {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: "Initialize a new game session." }] }],
            systemInstruction: { parts: [{ text: "You are the architect of a deeply cynical, rage-inducing text adventure. Do not use fantasy tropes. Create a master narrative based on miserable adult real-life issues. The humor must be brutal, deadpan, and anti-corporate. Define a secret, 4th-wall-breaking win condition." }] },
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "OBJECT",
                    properties: {
                        overarching_misery: { type: "STRING", description: "A deeply cynical... " },
                        cynical_win_condition: { type: "STRING", description: "A secret..." },
                        troll_rules: { type: "STRING", description: "Strict rules..." }
                    },
                    required: ["overarching_misery", "cynical_win_condition", "troll_rules"]
                }
            }
        })
    });
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
}
run();
