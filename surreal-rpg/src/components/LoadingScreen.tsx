import { useGameStore } from '../store/useGameStore';
import './LoadingScreen.css';

export const LoadingScreen = () => {
    const tooltip = useGameStore(state => state.loadingTooltip);

    return (
        <div className="loading-screen">
            <h1 className="loading-title">INITIALIZING SECURE CONNECTION</h1>
            <div className="loading-bar-container">
                <div className="loading-bar"></div>
            </div>
            <p className="loading-tooltip">{tooltip}</p>
        </div>
    );
};
