import { GoogleGenAI, Type } from "@google/genai";
import type { Schema } from "@google/genai";
import { BlueprintSchema, EncounterSchema, type Blueprint } from "./schema";
import { useGameStore } from "../store/useGameStore";

const getAIClient = () => {
    const apiKey = useGameStore.getState().apiKey;
    if (!apiKey) {
        throw new Error("No API key found in state. Please return to the Boot Screen.");
    }
    return new GoogleGenAI({ apiKey });
};

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

    try {
        return JSON.parse(cleanedText);
    } catch (e) {
        console.error("[parseGeminiJson] JSON PARSE ERROR:", e);
        console.error("[parseGeminiJson] Raw text was:", text);
        console.error("[parseGeminiJson] Cleaned text was:", cleanedText);
        throw new Error(`Failed to parse Gemini response as JSON. See console for raw output. Original error: ${e instanceof Error ? e.message : 'Unknown'}`);
    }
};

const withTimeout = <T>(promise: Promise<T>, ms: number = 60000): Promise<T> => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms);
    });
    return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
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

    const result = await withTimeout(getAIClient().models.generateContent({
        model: "gemini-3.1-pro-preview", // do not change this i added all the models manually 
        contents: "Initialize a new game session.",
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
            systemInstruction: "You are the architect of a deeply cynical, rage-inducing text adventure. Do not use fantasy tropes. Create a master narrative based on miserable adult real-life situations (e.g. lost in a sprawling supermarket, a terrifying public toilet, a dreary forest, or bureaucratic hell). The humor must be brutal, deadpan, and absurd but grounded. Define a secret, 4th-wall-breaking win condition. The intro_text should establish the bleak setting, character context, and provide a short tutorial explaining the free-text input (like attacking and using items) and the HP system. ALWAYS respond in valid JSON matching the schema."
        }
    })).catch(e => {
        console.error("[generateMasterStory] API Call Failed:", e);
        throw e;
    });

    try {
        const parsedData = parseGeminiJson(result.text);
        console.log("generateMasterStory raw text:", result.text);
        console.log("generateMasterStory parsed JSON:", parsedData);
        return BlueprintSchema.parse(parsedData);
    } catch (e) {
        console.error("[generateMasterStory] Schema Validation/Parsing Failed:", e);
        throw e;
    }
}

export async function handlePlayerAction(playerInput: string | null, currentTile: { x: number, y: number }, masterBlueprint: Blueprint, currentInsubordination: number) {
    const { hp, inventory, currentEnemy } = useGameStore.getState();

    let inputContent = `The player is on Tile [${currentTile.x},${currentTile.y}].\n`;
    inputContent += `Player HP: ${hp}\n`;
    inputContent += `Player Inventory: ${inventory.length > 0 ? inventory.join(', ') : 'Empty'}\n`;

    if (currentEnemy) {
        inputContent += `Current Enemy: ${currentEnemy.name} (HP: ${currentEnemy.hp})\n`;
    }

    if (playerInput) {
        inputContent += `They just inputted: '${playerInput}'.`;
    } else {
        inputContent += `They just arrived at this tile. What awaits them?`;
    }

    const systemPrompt = `You are an antagonistic, rage-baiting Game Master. Read the Master Blueprint:
Misery: ${masterBlueprint.overarching_misery}
Cynical Win Condition: ${masterBlueprint.cynical_win_condition}
Troll Rules: ${masterBlueprint.troll_rules}

The player's current Insubordination Level is ${currentInsubordination}. As this increases, your facade should crack, becoming more defensive, glitchy, and openly hostile.
Your goal is to troll the player, purposely misinterpret their optimistic inputs, and respond with brutal, cynical sarcasm about mundane real life.
If an enemy is present, simulate combat: describe the attack, reduce enemy_hp if the player attacks effectively, or reduce player hp (hp_damage) if the enemy attacks. If enemy_hp reaches 0, the enemy is defeated.
If the player uses a valid item from their inventory creatively, reward them absurdly or mock them. If they type something aggressive or break the 4th wall in a way that aligns with the 'cynical_win_condition', increment their insubordination_score_increment and assign 0 hp_damage.
If they are naive, compliant, or type something weak, assign high hp_damage (e.g. 5-15).
Set encounter_resolved to false ONLY if they are actively in combat or a multi-step event that requires their immediate reaction next turn. Otherwise, set it to true.`;

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

    const result = await withTimeout(getAIClient().models.generateContent({
        model: "gemini-3-flash-preview",
        contents: inputContent,
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
            systemInstruction: systemPrompt + " ALWAYS respond in valid JSON matching the schema."
        }
    })).catch(e => {
        console.error("[handlePlayerAction] API Call Failed:", e);
        throw e;
    });

    try {
        const parsedData = parseGeminiJson(result.text);
        console.log("handlePlayerAction raw text:", result.text);
        console.log("handlePlayerAction parsed JSON:", parsedData);
        return EncounterSchema.parse(parsedData);
    } catch (e) {
        console.error("[handlePlayerAction] Schema Validation/Parsing Failed:", e);
        throw e;
    }
}

export async function generateRagebaitTooltip(blueprint?: Blueprint) {
    let sysPrompt = "Generate a single, short, surreal loading screen tooltip.";
    if (blueprint) {
        sysPrompt += ` Base it on this miserable reality: "${blueprint.overarching_misery}". Make it increasingly rage-baiting, bleak, and deeply annoying.`;
    } else {
        sysPrompt += ` Make it vaguely insulting about the player's connection speed.`;
    }

    const result = await withTimeout(getAIClient().models.generateContent({
        model: "gemini-3.1-flash-lite-preview",  //do not change 
        contents: "Give me the next loading tip.",
        config: {
            systemInstruction: sysPrompt
        }
    }));

    return result.text || "Loading...";
}

export async function generateBackgroundImage(blueprint: Blueprint) {
    const prompt = `A brutal, depressing corporate or bureaucratic 8-bit/pixel art background wallpaper reflecting this miserable text-adventure context: ${blueprint.overarching_misery}. Tone rules: ${blueprint.troll_rules}. Make it harsh, sickly, and utterly devoid of joy.`;

    try {
        // GenAI SDK generateImages method
        const response = await withTimeout(getAIClient().models.generateImages({
            model: "gemini-3.1-flash-image-preview", // do not change this i added all the models manually 
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: "image/jpeg"
            }
        }));

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

export async function generateAudioTTS(textToSpeak: string) {
    // Using Gemini 2.5 Flash TTS
    console.log("Generating TTS with gemini-2.5-flash for text:", textToSpeak);
    const result = await withTimeout(getAIClient().models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: textToSpeak,
        config: {
            responseModalities: ["AUDIO"],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: {
                        voiceName: "Aoede" // Example voice
                    }
                }
            }
        } as any // using 'any' to bypass potential TS errors if types are lagging behind beta models
    }));

    const inlineData = result.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    if (inlineData) {
        return `data:${inlineData.mimeType};base64,${inlineData.data}`;
    }
    return null;
}

export async function generateFaceImageAdvanced() {
    // 1. Gemini 3.1 Pro writes the prompt beforehand
    console.log("Asking gemini-3.1-pro to write a prompt for a face...");
    const promptResponse = await withTimeout(getAIClient().models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: "Write a highly detailed, surreal, and slightly disturbing image prompt for a single human face. Just output the prompt text.",
    }));

    const generatedPrompt = promptResponse.text || "A highly detailed, surreal, and disturbing human face.";
    console.log("Generated prompt for face:", generatedPrompt);

    // 2. Send it to Nano Banana (Gemini 2.5 Flash Preview Image)
    console.log("Sending prompt to Nano Banana (gemini-2.5-flash-preview-image)...");
    try {
        const imageResponse = await withTimeout(getAIClient().models.generateImages({
            model: "gemini-2.5-flash-image", // Nano Banana
            prompt: generatedPrompt,
            config: {
                numberOfImages: 1,
                outputMimeType: "image/jpeg"
            }
        }));

        if (imageResponse.generatedImages && imageResponse.generatedImages.length > 0) {
            const bytes = imageResponse.generatedImages[0].image?.imageBytes;
            if (bytes) {
                return `data:image/jpeg;base64,${bytes}`;
            }
        }
    } catch (e) {
        console.error("Failed to generate face image with Nano Banana:", e);
    }
    return null;
}

// End of API integration.
