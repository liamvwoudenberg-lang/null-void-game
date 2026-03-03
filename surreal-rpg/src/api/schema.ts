import { z } from "zod";

export const BlueprintSchema = z.object({
    overarching_misery: z.string().describe("A deeply cynical, real-world adult misery (e.g., getting lost in an endless supermarket, a terrifying public toilet, being mildly inconvenienced in a bleak forest) overriding the entire game.").catch("A vague, overwhelming sense of administrative dread."),
    cynical_win_condition: z.string().describe("A secret, highly unconventional 4th-wall-breaking method to escape or win the game by proving apathy or out-trolling the AI.").catch("Close the browser tab to win."),
    troll_rules: z.string().describe("Strict rules on how the AI should mock, belittle, and rage-bait the player throughout the session.").catch("Act passively dismissive."),
    instant_popups: z.array(z.string()).describe("A list of 10 extremely short, infuriating fines or penalties (e.g., 'Breathing Tax Assessed', 'Forgot Password'). None should require a response, just acknowledgement.").catch(["An unnamed error occurred. Please pay a fine."]),
    intro_text: z.string().describe("A substantial block of text introducing the miserable setting. It MUST explicitly tell the player they can use the text box to type actions like 'attack', 'use [item]', and must watch their HP.").catch("You wake up tired. The paperwork is endless. Everything is awful. Watch your HP. You can type commands to attack or use items."),
});

export type Blueprint = z.infer<typeof BlueprintSchema>;

export const EncounterSchema = z.object({
    narrative_text: z.string().describe("The brutal, sarcastic description of the event, location, or combat result.").catch("You arrived at a beige hallway. Nothing happens. Try again."),
    ascii_art: z.string().nullable().describe("Optional ASCII art. Make it mocking or poorly drawn on purpose. Set null if none.").catch(null),
    predefined_choices: z.array(z.string()).describe("2-3 terrible, lose-lose options for the player summarizing futile actions.").catch(["Accept fate", "Complain to HR"]),
    ai_snark: z.string().describe("A hidden internal monologue where the AI brutally judges the player's life choices and optimism.").catch("[System Sigh]"),
    debuff_string: z.string().nullable().describe("A short string describing a meaningless mechanical debuff (e.g. 'inverted controls'). Set null if none.").catch(null),
    insubordination_score_increment: z.number().describe("Integer amount (0-10) to increase player's Insubordination. Higher if they act rebellious or break 4th wall.").catch(0),
    hp_damage: z.number().describe("Integer amount (0-20) to permanently subtract from the player's HP based on how naive/compliant their choice was, or if an enemy attacks them. 0 if they dodge or act adequately cynical.").catch(5),
    enemy_name: z.string().nullable().describe("If an enemy appears or is currently being fought, provide its absurd name (e.g., 'Sentient Printer', 'Angry Shopper'). Null if no enemy.").catch(null),
    enemy_hp: z.number().nullable().describe("If an enemy is present, its current HP (0-100). If it reaches 0, the enemy is defeated. Null if no enemy.").catch(null),
    item_found: z.string().nullable().describe("Name of an absurd item the player finds (e.g., 'Stale Bagel', 'Passive Aggressive Post-it'). Null if none.").catch(null),
    encounter_resolved: z.boolean().describe("True if narrative/combat ends and player can move on. False if combat/event continues and requires another action immediately.").catch(true),
});

export type Encounter = z.infer<typeof EncounterSchema>;
