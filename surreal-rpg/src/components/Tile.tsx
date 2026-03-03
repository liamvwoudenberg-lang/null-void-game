import React from 'react';

interface TileProps {
    x: number;
    y: number;
    terrainType: string;
}

const getTerrainColor = (type: string) => {
    switch (type) {
        case 'grass': return '#2b2b2b';
        case 'water': return '#1a1a1a';
        case 'wall': return '#333333';
        default: return '#0d0d0d';
    }
};

const TileComponent: React.FC<TileProps> = ({ terrainType }) => {
    return (
        <div
            className="tile"
            style={{
                width: '32px',
                height: '32px',
                backgroundColor: getTerrainColor(terrainType),
                boxSizing: 'border-box',
                border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
        />
    );
};

export const Tile = React.memo(TileComponent, (prevProps, nextProps) => {
    return (
        prevProps.x === nextProps.x &&
        prevProps.y === nextProps.y &&
        prevProps.terrainType === nextProps.terrainType
    );
});
