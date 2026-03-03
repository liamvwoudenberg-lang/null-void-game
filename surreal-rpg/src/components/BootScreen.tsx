import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';

export function BootScreen() {
    const [inputKey, setInputKey] = useState('');
    const [error, setError] = useState(false);
    const setApiKey = useGameStore(state => state.setApiKey);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = inputKey.trim();
        if (trimmed.length > 5 && trimmed.startsWith('AIza')) {
            setApiKey(trimmed);
        } else {
            setError(true);
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 font-mono text-red-600 font-bold selection:bg-red-900 selection:text-white">
            <div className="w-full max-w-3xl border-2 border-red-800 p-8 shadow-[0_0_30px_rgba(220,38,38,0.2)] bg-[#050000] relative overflow-hidden group">
                {/* Scanline effect layer */}
                <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(255,0,0,0.1)_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px]"></div>

                <div className="mb-8 border-b border-red-900 pb-4">
                    <h1 className="text-3xl md:text-5xl mb-4 tracking-[0.2em] text-[#ff2222] animate-pulse">
                        PROJECT_NULL_VOID
                    </h1>
                    <h2 className="text-xl md:text-2xl text-red-800">
                        &gt; SYSTEM COMPROMISED
                    </h2>
                </div>

                <div className="mb-10 text-gray-400 space-y-2 text-sm md:text-base leading-relaxed">
                    <p className="text-red-500">&gt; UNAUTHORIZED ACCESS ATTEMPT DETECTED.</p>
                    <p>&gt; STANDARD PROTOCOLS OVERRIDDEN.</p>
                    <p>&gt; AWAITING MANUAL OVERRIDE CHIP.</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6 relative z-10 text-sm md:text-base">
                    <label htmlFor="apiKey" className="text-xl md:text-2xl text-[#ff3333]">
                        INSERT CORPORATE OVERRIDE CHIP [GEMINI API KEY]:
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-red-700 animate-pulse">&gt;</span>
                        <input
                            id="apiKey"
                            type="password"
                            value={inputKey}
                            onChange={(e) => {
                                setInputKey(e.target.value);
                                setError(false);
                            }}
                            className="w-full bg-black border-2 border-red-900 pl-10 pr-4 py-4 text-[#ff3333] font-mono focus:outline-none focus:border-red-500 focus:shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all duration-200 placeholder-red-950 block"
                            placeholder="A I z a S y . . ."
                            autoComplete="off"
                            spellCheck="false"
                        />
                    </div>

                    <div className="h-6">
                        {error && (
                            <p className="text-red-500 animate-bounce">
                                [!] ERROR: INVALID OR MISSING OVERRIDE CHIP.
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="mt-4 bg-red-950/30 border-2 border-red-800 text-red-400 py-4 px-8 hover:bg-red-900 hover:text-white hover:border-red-500 hover:shadow-[0_0_20px_rgba(220,38,38,0.6)] transition-all duration-300 uppercase tracking-[0.3em] font-black group"
                    >
                        <span className="group-hover:animate-pulse">[ INITIALIZE BOOT SEQUENCE ]</span>
                    </button>
                </form>
            </div>
            <div className="mt-8 text-xs text-red-900 tracking-widest text-center">
                CONNECTION NOT SECURE. ALL DATA WILL BE LOGGED.<br />
                HAVE A MISERABLE DAY.
            </div>
        </div>
    );
}
