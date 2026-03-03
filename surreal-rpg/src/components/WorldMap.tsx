import React from 'react';
import { useGameStore, GRID_SIZE } from '../store/useGameStore';
import { Tile } from './Tile';

export const WorldMap = React.memo(() => {
    // Read mapData from our global state. 
    // This will only re-render if the entire mapData array is replaced, which we don't do during normal gameplay.
    const mapData = useGameStore((state) => state.mapData);

    return (
        <div
            className="world-map"
            style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${GRID_SIZE}, 32px)`,
                gridTemplateRows: `repeat(${GRID_SIZE}, 32px)`,
                width: `${GRID_SIZE * 32}px`,
                height: `${GRID_SIZE * 32}px`,
                position: 'absolute', // Positioned absolutely underneath the player
                top: 0,
                left: 0,
            }}
        >
            {mapData.map((tile) => (
                <Tile key={`${tile.x}-${tile.y}`} x={tile.x} y={tile.y} terrainType={tile.terrainType} />
            ))}
        </div>
    );
});
