import { useState, useEffect } from 'react';

interface TypewriterTextProps {
    text: string;
    speed?: number; // ms per character
    onComplete?: () => void;
}

export const TypewriterText = ({ text, speed = 25, onComplete }: TypewriterTextProps) => {
    const [displayedText, setDisplayedText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [prevText, setPrevText] = useState(text);

    if (text !== prevText) {
        setPrevText(text);
        setDisplayedText('');
        setCurrentIndex(0);
    }

    useEffect(() => {
        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                setDisplayedText(prev => prev + text[currentIndex]);
                setCurrentIndex(prev => prev + 1);
            }, speed);

            return () => clearTimeout(timeout);
        } else if (onComplete && currentIndex === text.length) {
            // Use setTimeout to avoid synchronous state updates during render
            const timeout = setTimeout(() => {
                onComplete();
            }, 0);
            return () => clearTimeout(timeout);
        }
    }, [currentIndex, text, speed, onComplete]);

    return <span>{displayedText}</span>;
};
