import { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import './ActionInput.css';

interface ActionInputProps {
    onActionSubmit: (action: string) => void;
}

export const ActionInput = ({ onActionSubmit }: ActionInputProps) => {
    const gameState = useGameStore(state => state.gameState);
    const movePlayer = useGameStore(state => state.movePlayer);
    const chatHistory = useGameStore(state => state.chatHistory);
    const isGeneratingEncounter = useGameStore(state => state.isGeneratingEncounter);
    const decreaseWillToLive = useGameStore(state => state.decreaseWillToLive);

    const [inputText, setInputText] = useState('');

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!inputText.trim() || isGeneratingEncounter || gameState !== 'IN_ENCOUNTER') return;

        onActionSubmit(inputText.trim());
        setInputText('');
    };

    const handleChoiceClick = (choice: string) => {
        if (isGeneratingEncounter || gameState !== 'IN_ENCOUNTER') return;
        decreaseWillToLive(10); // Compliance Penalty
        onActionSubmit(choice);
    };

    // Find the latest message with predefined choices, if any
    const latestMessageWithChoices = [...chatHistory].reverse().find(msg => msg.choices && msg.choices.length > 0);
    const availableChoices = gameState === 'IN_ENCOUNTER' && latestMessageWithChoices?.choices
        ? latestMessageWithChoices.choices
        : [];

    return (
        <div className="action-input-container">
            {gameState === 'EXPLORING' ? (
                <div className="d-pad">
                    <div className="d-pad-row row-top">
                        <button onClick={() => movePlayer('UP')} disabled={isGeneratingEncounter}>▲</button>
                    </div>
                    <div className="d-pad-row row-middle">
                        <button onClick={() => movePlayer('LEFT')} disabled={isGeneratingEncounter}>◀</button>
                        <button className="jump-btn" onClick={() => movePlayer('JUMP')} disabled={isGeneratingEncounter}>JUMP</button>
                        <button onClick={() => movePlayer('RIGHT')} disabled={isGeneratingEncounter}>▶</button>
                    </div>
                    <div className="d-pad-row row-bottom">
                        <button onClick={() => movePlayer('DOWN')} disabled={isGeneratingEncounter}>▼</button>
                    </div>
                    <div className="exploring-status">
                        MANDATORY RELOCATION REQUIRED...
                    </div>
                </div>
            ) : (
                <div className="encounter-actions">
                    {availableChoices.length > 0 && (
                        <div className="predefined-buttons">
                            {availableChoices.map((choice, idx) => (
                                <button
                                    key={idx}
                                    className="choice-btn"
                                    onClick={() => handleChoiceClick(choice)}
                                    disabled={isGeneratingEncounter}
                                >
                                    [{idx + 1}] {choice}
                                </button>
                            ))}
                        </div>
                    )}

                    <form className="free-text-form" onSubmit={handleSubmit}>
                        <span className="prompt-char">&gt;</span>
                        <input
                            type="text"
                            className="terminal-input"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder={isGeneratingEncounter ? "PROCESSING BUREAUCRACY..." : "Submit futile response..."}
                            disabled={isGeneratingEncounter}
                            autoFocus
                        />
                        <button type="submit" disabled={isGeneratingEncounter || !inputText.trim()} className="submit-action-btn">
                            SUBMIT
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};
