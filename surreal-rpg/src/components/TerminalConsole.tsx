import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import { TypewriterText } from './TypewriterText';
import './TerminalConsole.css';

export const TerminalConsole = () => {
    const chatHistory = useGameStore(state => state.chatHistory);
    const typingHistoryIndex = useGameStore(state => state.typingHistoryIndex);
    const isGlitching = useGameStore(state => state.isGlitching);
    const endOfMessagesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    return (
        <div className={`terminal-console ${isGlitching ? 'terminal-glitch' : ''}`}>
            <div className="terminal-header">MANDATORY ENGAGEMENT PROTOCOL</div>
            <div className="terminal-messages">
                {chatHistory.map((msg, idx) => {
                    if (idx > typingHistoryIndex) return null;

                    const isTypingThisMessage = idx === typingHistoryIndex;
                    const isLastMessage = idx === chatHistory.length - 1;
                    const isOldSystemMsg = msg.role === 'system' && !isLastMessage;

                    return (
                        <div key={idx} className={`message role-${msg.role} ${isOldSystemMsg ? 'old-log' : ''}`}>
                            <span className="prompt">
                                {msg.role === 'player' ? 'USR> ' : msg.role === 'narrator' ? 'SYS> ' : 'ERR> '}
                            </span>
                            <span className="content">
                                {isTypingThisMessage ? (
                                    <TypewriterText
                                        text={msg.content}
                                        speed={25}
                                        onComplete={() => useGameStore.getState().advanceTypingIndex()}
                                    />
                                ) : (
                                    msg.content
                                )}
                            </span>
                            {msg.asciiArt && (
                                <pre className="ascii-art">{msg.asciiArt}</pre>
                            )}
                            {msg.aiSnark && (
                                <div className="ai-snark">{msg.aiSnark}</div>
                            )}
                        </div>
                    );
                })}
                <div ref={endOfMessagesRef} />
            </div>
        </div>
    );
};
