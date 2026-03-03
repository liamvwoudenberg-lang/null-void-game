import { useGameStore } from '../store/useGameStore';
import './StatsHUD.css';

export const StatsHUD = () => {
    const hp = useGameStore(state => state.hp);
    const inventory = useGameStore(state => state.inventory);
    const insubordination = useGameStore(state => state.insubordination);
    const debuff = useGameStore(state => state.debuff);
    const debuffStepsLeft = useGameStore(state => state.debuffStepsLeft);

    return (
        <div className="stats-hud">
            <div className="stat-row">
                <span className="stat-label">HP:</span>
                <div className="stat-bar-container">
                    <div
                        className={`stat-bar will-to-live-bar ${hp < 30 ? 'critical' : ''}`}
                        style={{ width: `${Math.max(0, Math.min(100, hp))}%` }}
                    />
                </div>
                <span className="stat-value">{hp}/100</span>
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

            <div className="inventory-section">
                <span className="stat-label mt-4 block">INVENTORY:</span>
                {inventory.length === 0 ? (
                    <div className="text-[#555] text-sm tracking-widest">[ EMPTY: YOU OWN NOTHING ]</div>
                ) : (
                    <ul className="text-[#00ff41] text-sm mt-2 ml-4 list-disc space-y-1">
                        {inventory.map((item, idx) => (
                            <li key={idx} className="uppercase tracking-wider">{item}</li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};
