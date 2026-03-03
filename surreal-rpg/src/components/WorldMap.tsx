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
                gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
                border: '2px solid #33ff33', // toxic green border around map
                boxShadow: '0 0 15px rgba(51, 255, 51, 0.2)'
            }}
        >
            {mapData.map((tile) => (
                <Tile key={`${tile.x}-${tile.y}`} x={tile.x} y={tile.y} terrainType={tile.terrainType} visited={tile.visited} />
            ))}
        </div>
    );
});
