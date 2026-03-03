import { useGameStore } from '../store/useGameStore';
import playerIcon from './player icon.png';

export const Player = () => {
    const playerX = useGameStore((state) => state.playerX);
    const playerY = useGameStore((state) => state.playerY);

    return (
        <img
            src={playerIcon}
            alt="Player"
            className="player"
            style={{
                position: 'absolute',
                width: '32px',
                height: '32px',
                left: `${playerX * 32}px`,
                top: `${playerY * 32}px`,
                transition: 'all 0.1s ease-out',
                zIndex: 10,
            }}
        />
    );
};
