import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import './TerminalConsole.css';

export const TerminalConsole = () => {
    const chatHistory = useGameStore(state => state.chatHistory);
    const isGlitching = useGameStore(state => state.isGlitching);
    const endOfMessagesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    return (
        <div className={`terminal-console ${isGlitching ? 'terminal-glitch' : ''}`}>
            <div className="terminal-header">MANDATORY ENGAGEMENT PROTOCOL v1.0.4</div>
            <div className="terminal-messages">
                {chatHistory.map((msg, idx) => (
                    <div key={idx} className={`message role-${msg.role}`}>
                        <span className="prompt">
                            {msg.role === 'player' ? 'USR> ' : msg.role === 'narrator' ? 'SYS> ' : 'ERR> '}
                        </span>
                        <span className="content">{msg.content}</span>
                        {msg.asciiArt && (
                            <pre className="ascii-art">{msg.asciiArt}</pre>
                        )}
                        {msg.choices && msg.choices.length > 0 ? (
                            <div className="predefined-choices">
                                {msg.choices.map((choice, cidx) => (
                                    <div key={cidx} className="choice-text">[{cidx + 1}] {choice}</div>
                                ))}
                            </div>
                        ) : null}
                        {msg.aiSnark && (
                            <div className="ai-snark">{msg.aiSnark}</div>
                        )}
                    </div>
                ))}
                <div ref={endOfMessagesRef} />
            </div>
        </div>
    );
};
