import { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import './ActionInput.css';

export const ActionInput = () => {
    const gameState = useGameStore(state => state.gameState);
    const movePlayer = useGameStore(state => state.movePlayer);
    const chatHistory = useGameStore(state => state.chatHistory);
    const isGeneratingEncounter = useGameStore(state => state.isGeneratingEncounter);
    const typingHistoryIndex = useGameStore(state => state.typingHistoryIndex);
    const decreaseWillToLive = useGameStore(state => state.decreaseWillToLive);
    const submitAction = useGameStore(state => state.submitAction);

    const [inputText, setInputText] = useState('');
    const [showOptions, setShowOptions] = useState(false);

    // Derived disabled state
    const isTyping = typingHistoryIndex < chatHistory.length;
    const isDisabled = isGeneratingEncounter || isTyping;

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!inputText.trim() || isDisabled || gameState !== 'IN_ENCOUNTER') return;

        submitAction(inputText.trim());
        setInputText('');
        setShowOptions(false);
    };

    const handleChoiceClick = (choice: string) => {
        if (isDisabled || gameState !== 'IN_ENCOUNTER') return;
        decreaseWillToLive(10); // Compliance Penalty
        submitAction(choice);
        setShowOptions(false);
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
                        <button onClick={() => movePlayer('UP')} disabled={isDisabled}>▲</button>
                    </div>
                    <div className="d-pad-row row-middle">
                        <button onClick={() => movePlayer('LEFT')} disabled={isDisabled}>◀</button>
                        <button className="jump-btn" onClick={() => movePlayer('JUMP')} disabled={isDisabled}>JUMP</button>
                        <button onClick={() => movePlayer('RIGHT')} disabled={isDisabled}>▶</button>
                    </div>
                    <div className="d-pad-row row-bottom">
                        <button onClick={() => movePlayer('DOWN')} disabled={isDisabled}>▼</button>
                    </div>
                    <div className="exploring-status">
                        MANDATORY RELOCATION REQUIRED...
                    </div>
                </div>
            ) : (
                <div className="encounter-actions">
                    {!isDisabled && (
                        <div className="reaction-popup pop-in-animation">
                            <div className="reaction-header">AWAITING YOUR REACTION_</div>
                            {availableChoices.length > 0 && (
                                <div className="predefined-buttons">
                                    {!showOptions ? (
                                        <button
                                            className="choice-btn help-btn"
                                            onClick={() => setShowOptions(true)}
                                            disabled={isDisabled}
                                        >
                                            [?] please i dont know what to even say
                                        </button>
                                    ) : (
                                        availableChoices.map((choice, idx) => (
                                            <button
                                                key={idx}
                                                className="choice-btn"
                                                onClick={() => handleChoiceClick(choice)}
                                                disabled={isDisabled}
                                            >
                                                [{idx + 1}] {choice}
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}

                            <form className="free-text-form" onSubmit={handleSubmit}>
                                <span className="prompt-char">&gt;</span>
                                <input
                                    type="text"
                                    className="terminal-input"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={(e) => e.stopPropagation()}
                                    placeholder="Submit futile response..."
                                    disabled={isDisabled}
                                    autoFocus
                                />
                                <button type="submit" disabled={isDisabled || !inputText.trim()} className="submit-action-btn">
                                    SUBMIT
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
