import React from 'react';

interface TileProps {
    x: number;
    y: number;
    terrainType: string;
    visited: boolean;
}

const getTerrainColor = (type: string) => {
    switch (type) {
        case 'grass': return '#2b2b2b';
        case 'water': return '#1a1a1a';
        case 'wall': return '#333333';
        default: return '#0d0d0d';
    }
};

const TileComponent: React.FC<TileProps> = ({ terrainType, visited }) => {
    return (
        <div
            className="tile"
            style={{
                width: '100%',
                height: '100%',
                backgroundColor: visited ? getTerrainColor(terrainType) : '#000000',
                boxSizing: 'border-box',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                transition: 'background-color 0.3s ease'
            }}
        />
    );
};

export const Tile = React.memo(TileComponent, (prevProps, nextProps) => {
    return (
        prevProps.x === nextProps.x &&
        prevProps.y === nextProps.y &&
        prevProps.terrainType === nextProps.terrainType &&
        prevProps.visited === nextProps.visited
    );
});
