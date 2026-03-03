import { useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';

export const useKeyboardInput = () => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const state = useGameStore.getState();

            if (state.isGeneratingEncounter || state.gameState !== 'EXPLORING') return;

            // Only care about active game window if needed, but simple global is fine for now
            // Predefined keys to string mappings
            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    state.movePlayer('UP');
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    state.movePlayer('DOWN');
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    state.movePlayer('LEFT');
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    state.movePlayer('RIGHT');
                    break;
                case ' ':
                case 'Shift':
                case 'Enter':
                    state.movePlayer('JUMP');
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);
};

