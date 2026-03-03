import { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { TypewriterText } from './TypewriterText';

export function IntroScreen() {
    const masterBlueprint = useGameStore(state => state.masterBlueprint);
    const setIntroFinished = useGameStore(state => state.setIntroFinished);

    // Fallback text if something goes wrong
    const introText = masterBlueprint?.intro_text || "You wake up tired. The paperwork is endless. Everything is awful.";

    const [isTypingDone, setIsTypingDone] = useState(false);

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 font-mono text-[#00ff41] selection:bg-[#00ff41] selection:text-black">
            <div className="w-full max-w-4xl border border-[#00ff41]/50 p-8 shadow-[0_0_20px_rgba(0,255,65,0.1)] bg-[#050505] relative overflow-hidden group">
                {/* CRT Scanline effect layer */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(0,255,65,0.1)_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px]"></div>

                <div className="mb-8 border-b border-[#00ff41]/30 pb-4">
                    <h1 className="text-2xl md:text-3xl mb-2 tracking-[0.2em] opacity-80">
                        PERSONNEL FILE FOUND
                    </h1>
                    <h2 className="text-sm md:text-base opacity-60">
                        &gt; DECRYPTING SUBJECT DOSSIER...
                    </h2>
                </div>

                <div className="text-base md:text-lg leading-relaxed whitespace-pre-wrap mb-[100px] min-h-[50vh]">
                    <TypewriterText
                        text={introText}
                        speed={25} // approx 40 chars per second, meaning 1000 chars take ~25s to type out, average reading speed.
                        onComplete={() => setIsTypingDone(true)}
                    />
                    {!isTypingDone && <span className="animate-pulse ml-1">_</span>}
                </div>

                {isTypingDone && (
                    <div className="absolute bottom-8 left-0 right-0 flex justify-center animate-fade-in">
                        <button
                            onClick={() => setIntroFinished(true)}
                            autoFocus
                            className="bg-[#003311] border border-[#00ff41] text-[#00ff41] py-3 px-8 hover:bg-[#00ff41] hover:text-black hover:shadow-[0_0_15px_rgba(0,255,65,0.8)] transition-all duration-300 uppercase tracking-[0.2em] font-bold group inline-flex items-center gap-2"
                        >
                            <span>[ ACKNOWLEDGE MISERY ]</span>
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity"> &gt;</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
