import { z } from "zod";

export const BlueprintSchema = z.object({
    overarching_misery: z.string().describe("A deeply cynical, real-world adult misery (e.g., bureaucratic purgatory, existential dread) overriding the entire game."),
    cynical_win_condition: z.string().describe("A secret, highly unconventional 4th-wall-breaking method to escape or win the game by proving apathy or out-trolling the AI."),
    troll_rules: z.string().describe("Strict rules on how the AI should mock, belittle, and rage-bait the player throughout the session."),
    instant_popups: z.array(z.string()).describe("A list of 10 extremely short, infuriating bureaucratic fines or penalties (e.g., 'Breathing Tax Assessed'). None should require a response, just acknowledgement."),
});

export type Blueprint = z.infer<typeof BlueprintSchema>;

export const EncounterSchema = z.object({
    narrative_text: z.string().describe("The brutal, sarcastic description of the event or location."),
    ascii_art: z.string().nullable().describe("Optional ASCII art. Make it mocking or poorly drawn on purpose. Set null if none."),
    predefined_choices: z.array(z.string()).describe("2-3 terrible, lose-lose options for the player summarizing futile actions."),
    ai_snark: z.string().describe("A hidden internal monologue where the AI brutally judges the player's life choices and optimism."),
    debuff_string: z.string().nullable().describe("A short string describing a meaningless mechanical debuff (e.g. 'inverted controls'). Set null if none."),
    insubordination_score_increment: z.number().describe("Integer amount (0-10) to increase player's Insubordination. Higher if they act rebellious or break 4th wall."),
    suggested_will_damage: z.number().describe("Integer amount (0-20) to permanently subtract from the player's Will to Live based on how naive or compliant their choice was. 0 if they were adequately cynical."),
});

export type Encounter = z.infer<typeof EncounterSchema>;
