import { create } from 'zustand';
import type { Blueprint } from '../api/schema';

export const GRID_SIZE = 15;

export type TerrainType = 'grass' | 'water' | 'wall';

export interface TileData {
  x: number;
  y: number;
  terrainType: TerrainType;
  visited: boolean;
}

export type GameStateEnum = 'EXPLORING' | 'IN_ENCOUNTER';

export interface ChatMessage {
  role: 'system' | 'narrator' | 'player';
  content: string;
  asciiArt?: string | null;
  choices?: string[];
  aiSnark?: string;
}

interface GameState {
  playerX: number;
  playerY: number;
  mapData: TileData[];
  gameState: GameStateEnum;
  masterBlueprint: Blueprint | null;
  chatHistory: ChatMessage[];
  isGeneratingEncounter: boolean;

  isAppReady: boolean;
  backgroundImage: string | null;
  loadingTooltip: string;

  willToLive: number;
  insubordination: number;
  debuff: string | null;
  debuffStepsLeft: number;
  isGlitching: boolean;

  movePlayer: (direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'JUMP') => void;
  setMasterBlueprint: (blueprint: Blueprint) => void;
  setGameState: (state: GameStateEnum) => void;
  addChatMessage: (message: ChatMessage) => void;
  setGeneratingEncounter: (isGenerating: boolean) => void;
  markTileVisited: (x: number, y: number) => void;

  setAppReady: (ready: boolean) => void;
  setBackgroundImage: (url: string | null) => void;
  setLoadingTooltip: (tooltip: string) => void;

  decreaseWillToLive: (amount: number) => void;
  addInsubordination: (amount: number) => void;
  setDebuff: (text: string | null, steps: number) => void;
  triggerGlitch: () => void;
}

const generateInitialMap = (): TileData[] => {
  const data: TileData[] = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      let terrainType: TerrainType = 'grass';
      if (x === 0 || y === 0 || x === GRID_SIZE - 1 || y === GRID_SIZE - 1) {
        terrainType = 'wall';
      } else if (Math.random() < 0.1) {
        terrainType = 'water';
      }
      data.push({ x, y, terrainType, visited: false });
    }
  }
  // Mark starting tile as visited
  const startIdx = 1 * GRID_SIZE + 1;
  if (data[startIdx]) {
    data[startIdx].visited = true;
  }
  return data;
};

export const useGameStore = create<GameState>((set) => ({
  playerX: 1, // start at 1,1 instead of 0,0 since edges are walls
  playerY: 1,
  mapData: generateInitialMap(),
  gameState: 'EXPLORING',
  masterBlueprint: null,
  chatHistory: [
    { role: 'system', content: 'INITIALIZING ZERO-SESSION PROTOCOL...' }
  ],
  isGeneratingEncounter: false,
  isAppReady: false,
  backgroundImage: null,
  loadingTooltip: "Establishing bizarre connection...",
  willToLive: 100,
  insubordination: 0,
  debuff: null,
  debuffStepsLeft: 0,
  isGlitching: false,

  setMasterBlueprint: (blueprint) => set({ masterBlueprint: blueprint }),
  setGameState: (gameState) => set({ gameState }),
  addChatMessage: (message) => set((state) => ({
    chatHistory: [...state.chatHistory, message]
  })),
  setGeneratingEncounter: (isGenerating) => set({ isGeneratingEncounter: isGenerating }),
  setAppReady: (ready) => set({ isAppReady: ready }),
  setBackgroundImage: (url) => set({ backgroundImage: url }),
  setLoadingTooltip: (tooltip) => set({ loadingTooltip: tooltip }),
  markTileVisited: (x, y) => set((state) => {
    const newMapData = [...state.mapData];
    const index = y * GRID_SIZE + x;
    if (newMapData[index]) {
      newMapData[index] = { ...newMapData[index], visited: true };
    }
    return { mapData: newMapData };
  }),
  decreaseWillToLive: (amount) => set((state) => ({ willToLive: Math.max(0, state.willToLive - amount) })),
  addInsubordination: (amount) => set((state) => ({ insubordination: state.insubordination + amount })),
  setDebuff: (text, steps) => set({ debuff: text, debuffStepsLeft: steps }),
  triggerGlitch: () => {
    set({ isGlitching: true });
    setTimeout(() => {
      set({ isGlitching: false });
    }, 500); // Glitch lasts for 500ms
  },

  movePlayer: (direction) => set((state) => {
    if (state.gameState !== 'EXPLORING' || state.isGeneratingEncounter) {
      return state; // Prevent movement during encounters
    }

    let dx = 0;
    let dy = 0;

    if (direction === 'JUMP') {
      // Jump moves exactly 2 tiles in a random valid direction
      const possibleJumps = [
        { dx: 0, dy: -2 }, // UP
        { dx: 0, dy: 2 },  // DOWN
        { dx: -2, dy: 0 }, // LEFT
        { dx: 2, dy: 0 }   // RIGHT
      ];

      // Shuffle possible jumps to pick a random one
      const shuffledJumps = possibleJumps.sort(() => 0.5 - Math.random());

      let validJumpFound = false;
      for (const jump of shuffledJumps) {
        const targetX = state.playerX + jump.dx;
        const targetY = state.playerY + jump.dy;

        if (targetX >= 0 && targetX < GRID_SIZE && targetY >= 0 && targetY < GRID_SIZE) {
          const targetIndex = targetY * GRID_SIZE + targetX;
          const targetTile = state.mapData[targetIndex];

          if (targetTile && targetTile.terrainType !== 'wall' && targetTile.terrainType !== 'water') {
            dx = jump.dx;
            dy = jump.dy;
            validJumpFound = true;
            break;
          }
        }
      }

      if (!validJumpFound) {
        return state; // No valid jump available
      }
    } else {
      if (direction === 'UP') dy = -1;
      if (direction === 'DOWN') dy = 1;
      if (direction === 'LEFT') dx = -1;
      if (direction === 'RIGHT') dx = 1;

      // Apply inverted controls debuff if active
      if (state.debuff && state.debuff.toLowerCase().includes('invert')) {
        dx = -dx;
        dy = -dy;
      }
    }

    const newX = state.playerX + dx;
    const newY = state.playerY + dy;

    if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) {
      return state;
    }

    const index = newY * GRID_SIZE + newX;
    const targetTile = state.mapData[index];

    if (!targetTile || targetTile.terrainType === 'wall' || targetTile.terrainType === 'water') {
      return state;
    }

    let newDebuff = state.debuff;
    let newDebuffSteps = state.debuffStepsLeft;

    if (newDebuffSteps > 0) {
      newDebuffSteps--;
      if (newDebuffSteps === 0) {
        newDebuff = null;
      }
    }

    const newState: Partial<GameState> = {
      playerX: newX,
      playerY: newY,
      debuff: newDebuff,
      debuffStepsLeft: newDebuffSteps
    };

    if (!targetTile.visited) {
      newState.gameState = 'IN_ENCOUNTER';
      newState.isGeneratingEncounter = true;
    }

    return newState;
  }),

}));
