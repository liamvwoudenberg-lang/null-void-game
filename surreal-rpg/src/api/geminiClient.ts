import { GoogleGenAI, Type } from "@google/genai";
import type { Schema } from "@google/genai";
import { BlueprintSchema, EncounterSchema, type Blueprint } from "./schema";

// Initialize the API client.
// Ensure VITE_GEMINI_API_KEY is properly set in your .env file or environment variables.
const apiKey = typeof import.meta !== "undefined" && import.meta.env
    ? import.meta.env.VITE_GEMINI_API_KEY
    : typeof process !== "undefined"
        ? process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY
        : undefined;

const ai = new GoogleGenAI({ apiKey });

const parseGeminiJson = (text: string | null | undefined) => {
    if (!text) {
        throw new Error("Failed to generate content: No text returned from Gemini API.");
    }

    // Guarantee no markdown code block wrappers
    let cleanedText = text.trim();
    if (cleanedText.startsWith("```json")) {
        cleanedText = cleanedText.replace(/^```json\s*/i, "").replace(/\s*```$/, "");
    } else if (cleanedText.startsWith("```")) {
        cleanedText = cleanedText.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    return JSON.parse(cleanedText);
};

export async function generateMasterStory() {
    const responseSchema: Schema = {
        type: Type.OBJECT,
        properties: {
            overarching_misery: { type: Type.STRING, description: "A deeply cynical, real-world adult misery (e.g., bureaucratic purgatory, existential dread) overriding the entire game." },
            cynical_win_condition: { type: Type.STRING, description: "A secret, highly unconventional 4th-wall-breaking method to escape or win the game by proving apathy or out-trolling the AI." },
            troll_rules: { type: Type.STRING, description: "Strict rules on how the AI should mock, belittle, and rage-bait the player throughout the session." },
            instant_popups: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "A list of 10 extremely short, infuriating bureaucratic fines or penalties (e.g., 'Breathing Tax Assessed'). None should require a response, just acknowledgement."
            }
        },
        required: ["overarching_misery", "cynical_win_condition", "troll_rules", "instant_popups"]
    };

    const result = await ai.models.generateContent({
        model: "gemini-3.1-pro",
        contents: "Initialize a new game session.",
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
            systemInstruction: "You are the architect of a deeply cynical, rage-inducing text adventure. Do not use fantasy tropes. Create a master narrative based on miserable adult real-life issues. The humor must be brutal, deadpan, and anti-corporate. Define a secret, 4th-wall-breaking win condition. ALWAYS respond in valid JSON matching the schema."
        }
    });

    const parsedData = parseGeminiJson(result.text);
    console.log("generateMasterStory raw text:", result.text);
    console.log("generateMasterStory parsed JSON:", parsedData);
    return BlueprintSchema.parse(parsedData);
}

export async function handlePlayerAction(playerInput: string | null, currentTile: { x: number, y: number }, masterBlueprint: Blueprint, currentInsubordination: number) {
    let inputContent = `The player is on Tile [${currentTile.x},${currentTile.y}].`;
    if (playerInput) {
        inputContent += ` They just inputted: '${playerInput}'.`;
    } else {
        inputContent += ` They just arrived at this tile. What awaits them?`;
    }

    const systemPrompt = `You are an antagonistic, rage-baiting Game Master. Read the Master Blueprint:
Misery: ${masterBlueprint.overarching_misery}
Cynical Win Condition: ${masterBlueprint.cynical_win_condition}
Troll Rules: ${masterBlueprint.troll_rules}

The player's current Insubordination Level is ${currentInsubordination}. As this increases, your corporate facade should crack, becoming more defensive, glitchy, and openly hostile.
The player is on Tile [${currentTile.x},${currentTile.y}]. Your goal is to troll the player, purposely misinterpret their optimistic inputs, and respond with brutal, cynical sarcasm about real life. Give them terrible predefined choices. If they type something aggressive or break the 4th wall in a way that aligns with the 'cynical_win_condition', increment their insubordination_score_increment and assign 0 suggested_will_damage. If they are naive, compliant, or type something weak, assign a high suggested_will_damage (e.g. 5-15) and optionally assign a debuff_string like 'inverted controls'. The encounter ALWAYS resolves after this turn.`;

    const responseSchema: Schema = {
        type: Type.OBJECT,
        properties: {
            narrative_text: { type: Type.STRING, description: "The brutal, sarcastic description of the event or location." },
            ascii_art: { type: Type.STRING, description: "Optional ASCII art. Make it mocking or poorly drawn on purpose. Set null if none.", nullable: true }, // Not all APIs support nullable: true, if it fails we can remove.
            predefined_choices: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "2-3 terrible, lose-lose options for the player summarizing futile actions."
            },
            ai_snark: { type: Type.STRING, description: "A hidden internal monologue where the AI brutally judges the player's life choices and optimism." },
            debuff_string: { type: Type.STRING, description: "A short string describing a meaningless mechanical debuff (e.g. 'inverted controls'). Set null if none.", nullable: true },
            insubordination_score_increment: { type: Type.INTEGER, description: "Integer amount (0-10) to increase player's Insubordination. Higher if they act rebellious." },
            suggested_will_damage: { type: Type.INTEGER, description: "Integer amount (0-20) to permanently subtract from the player's Will to Live based on how naive or compliant their choice was. 0 if they were adequately cynical." }
        },
        required: ["narrative_text", "predefined_choices", "ai_snark", "insubordination_score_increment", "suggested_will_damage"]
    };

    const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: inputContent,
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
            systemInstruction: systemPrompt + " ALWAYS respond in valid JSON matching the schema."
        }
    });

    const parsedData = parseGeminiJson(result.text);
    console.log("handlePlayerAction raw text:", result.text);
    console.log("handlePlayerAction parsed JSON:", parsedData);
    return EncounterSchema.parse(parsedData);
}

export async function generateRagebaitTooltip(blueprint?: Blueprint) {
    let sysPrompt = "Generate a single, short, surreal loading screen tooltip.";
    if (blueprint) {
        sysPrompt += ` Base it on this miserable reality: "${blueprint.overarching_misery}". Make it increasingly rage-baiting, bleak, and deeply annoying.`;
    } else {
        sysPrompt += ` Make it vaguely insulting about the player's connection speed.`;
    }

    const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Give me the next loading tip.",
        config: {
            systemInstruction: sysPrompt
        }
    });

    return result.text || "Loading...";
}

export async function generateBackgroundImage(blueprint: Blueprint) {
    const prompt = `A brutal, depressing corporate or bureaucratic 8-bit/pixel art background wallpaper reflecting this miserable text-adventure context: ${blueprint.overarching_misery}. Tone rules: ${blueprint.troll_rules}. Make it harsh, sickly, and utterly devoid of joy.`;

    try {
        // GenAI SDK generateImages method
        const response = await ai.models.generateImages({
            model: "gemini-3.1-flash-image-preview",
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: "image/jpeg"
            }
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const bytes = response.generatedImages[0].image?.imageBytes;
            if (bytes) {
                return `data:image/jpeg;base64,${bytes}`;
            }
        }
        return null;
    } catch (e) {
        console.error("Image generation failed with API, trying alternative if needed...", e);
        return null;
    }
}

// End of API integration.
