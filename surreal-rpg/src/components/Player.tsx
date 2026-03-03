import { useGameStore } from '../store/useGameStore';
import playerIcon from './player icon.png';

export const Player = () => {
    const playerX = useGameStore((state) => state.playerX);
    const playerY = useGameStore((state) => state.playerY);
    // GRID_SIZE is 15
    const GRID_SIZE = 15;

    return (
        <img
            src={playerIcon}
            alt="Player"
            className="player"
            style={{
                position: 'absolute',
                width: `${100 / GRID_SIZE}%`,
                height: `${100 / GRID_SIZE}%`,
                left: `${(playerX / GRID_SIZE) * 100}%`,
                top: `${(playerY / GRID_SIZE) * 100}%`,
                transition: 'all 0.1s ease-out',
                zIndex: 10,
                filter: 'drop-shadow(0 0 10px rgba(255, 100, 0, 1)) drop-shadow(0 0 5px rgba(255, 0, 0, 1))'
            }}
        />
    );
};
