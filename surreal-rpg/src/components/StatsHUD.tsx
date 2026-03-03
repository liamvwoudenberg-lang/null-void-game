import { useGameStore } from '../store/useGameStore';
import './StatsHUD.css';

export const StatsHUD = () => {
    const willToLive = useGameStore(state => state.willToLive);
    const insubordination = useGameStore(state => state.insubordination);
    const debuff = useGameStore(state => state.debuff);
    const debuffStepsLeft = useGameStore(state => state.debuffStepsLeft);

    return (
        <div className="stats-hud">
            <div className="stat-row">
                <span className="stat-label">WILL TO LIVE:</span>
                <div className="stat-bar-container">
                    <div
                        className={`stat-bar will-to-live-bar ${willToLive < 30 ? 'critical' : ''}`}
                        style={{ width: `${Math.max(0, Math.min(100, willToLive))}%` }}
                    />
                </div>
                <span className="stat-value">{willToLive}%</span>
            </div>

            <div className="stat-row">
                <span className="stat-label">INSUBORDINATION:</span>
                <span className="stat-value warning">{insubordination}</span>
            </div>

            {debuff && (
                <div className="debuff-alert">
                    <span className="debuff-warning-icon">⚠️</span>
                    <span className="debuff-text">ACTIVE PENALTY: {debuff.toUpperCase()}</span>
                    <span className="debuff-duration">({debuffStepsLeft} STEPS REMAINING)</span>
                </div>
            )}
        </div>
    );
};
