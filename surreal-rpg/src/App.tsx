import { useEffect, useRef } from 'react';
import { BootScreen } from './components/BootScreen';
import { WorldMap } from './components/WorldMap';
import { Player } from './components/Player';
import { useKeyboardInput } from './hooks/useKeyboardInput';
import { useGameStore } from './store/useGameStore';
import { TerminalConsole } from './components/TerminalConsole';
import { ActionInput } from './components/ActionInput';
import { LoadingScreen } from './components/LoadingScreen';
import { StatsHUD } from './components/StatsHUD';
import { IntroScreen } from './components/IntroScreen';
import { generateMasterStory, handlePlayerAction, generateBackgroundImage, generateRagebaitTooltip } from './api/geminiClient';
import './App.css';
import soundTrack from './components/KingOfPoopsMaster.wav';

function App() {
  useKeyboardInput(); // Global D-pad keyboard listener

  const playerX = useGameStore(state => state.playerX);
  const playerY = useGameStore(state => state.playerY);
  const mapData = useGameStore(state => state.mapData);
  const gameState = useGameStore(state => state.gameState);
  const masterBlueprint = useGameStore(state => state.masterBlueprint);
  const insubordination = useGameStore(state => state.insubordination);
  const apiKey = useGameStore(state => state.apiKey);

  const isAppReady = useGameStore(state => state.isAppReady);
  const backgroundImage = useGameStore(state => state.backgroundImage);
  const isIntroFinished = useGameStore(state => state.isIntroFinished);

  const setMasterBlueprint = useGameStore(state => state.setMasterBlueprint);
  const setGameState = useGameStore(state => state.setGameState);
  const addChatMessage = useGameStore(state => state.addChatMessage);
  const setGeneratingEncounter = useGameStore(state => state.setGeneratingEncounter);
  const markTileVisited = useGameStore(state => state.markTileVisited);
  const setAppReady = useGameStore(state => state.setAppReady);
  const setBackgroundImage = useGameStore(state => state.setBackgroundImage);
  const setLoadingTooltip = useGameStore(state => state.setLoadingTooltip);
  const processEncounterResult = useGameStore(state => state.processEncounterResult);
  const hasInitializedGame = useRef(false);

  // Zero-Session Initialization
  useEffect(() => {
    if (hasInitializedGame.current || !apiKey) return;
    hasInitializedGame.current = true;

    const initGame = async () => {
      setGeneratingEncounter(true);
      let tooltipInterval: ReturnType<typeof setInterval> | null = null;
      let isTooltipActive = true;
      try {
        setLoadingTooltip("Synthesizing existence...");
        console.log("[INIT] Generating master story...");
        const blueprint = await generateMasterStory();
        console.log("[INIT] Master story generated:", blueprint);
        setMasterBlueprint(blueprint);

        // Start Rage-bait tooltips every 3 seconds while assets load
        tooltipInterval = setInterval(async () => {
          if (!isTooltipActive) return;
          try {
            const tip = await generateRagebaitTooltip(blueprint);
            if (isTooltipActive) setLoadingTooltip(tip);
          } catch (e) {
            console.error("[INIT] Tooltip generation failed", e);
          }
        }, 10000);

        // Run background image and first encounter concurrently
        console.log("[INIT] Generating background and initial encounter...");
        const [bgImage, encounter] = await Promise.all([
          generateBackgroundImage(blueprint).catch(e => { console.error("[INIT] BG Gen Failed:", e); return null; }),
          handlePlayerAction(null, { x: playerX, y: playerY }, blueprint, insubordination).catch(e => {
            console.error("[INIT] Encounter Gen Failed (inner):", e);
            // We append details to error before throwing to help identify cause on UI
            throw new Error(`Encounter generation failed: ${e instanceof Error ? e.message : 'Unknown'}`);
          })
        ]);
        console.log("[INIT] Background and encounter generated successfully.");

        if (bgImage) setBackgroundImage(bgImage);

        addChatMessage({
          role: 'system',
          content: `ZERO-SESSION INITIALIZED.

OBJECTIVE SECURED: ${blueprint.cynical_win_condition}

>>> SURVIVAL PROTOCOL LOADED <<<
- Use the D-PAD to navigate.
- When trapped, use the text prompt to [attack], [flee], or [use items].
- Monitor your HP critically. Death is a bureaucratic nightmare.`
        });

        addChatMessage({
          role: 'narrator',
          content: encounter.narrative_text,
          asciiArt: encounter.ascii_art,
          choices: encounter.predefined_choices,
          aiSnark: encounter.ai_snark
        });

        markTileVisited(playerX, playerY);

        processEncounterResult(encounter);

        setGameState('EXPLORING');
        addChatMessage({ role: 'system', content: 'MOVEMENT UNLOCKED.' });

        setAppReady(true);
        console.log("[INIT] App is ready.");
      } catch (e: unknown) {
        console.error("[INIT ERROR CRITICAL]", e);
        const hasResponse = e && typeof e === 'object' && 'response' in e;
        if (hasResponse) console.error("Response data:", (e as { response: unknown }).response);

        if (e instanceof Error && e.name === 'ZodError') {
          console.error("Zod Validation Error Details:", e);
          setLoadingTooltip(`CRITICAL ERROR: Schema mismatch. The AI returned invalid JSON structure.`);
        } else {
          setLoadingTooltip(`CRITICAL ERROR: ${e instanceof Error ? e.message : "Unknown error"}. Reload to retry.`);
        }
      } finally {
        isTooltipActive = false; // Prevent pending tooltips from overwriting our error message
        if (tooltipInterval) clearInterval(tooltipInterval);
        setGeneratingEncounter(false);
      }
    };

    initGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  // Tile Movement Effect
  useEffect(() => {
    if (!masterBlueprint || !isAppReady || !isIntroFinished) return;

    const currentTileIdx = playerY * 15 + playerX;
    const currentTile = mapData[currentTileIdx];

    if (!currentTile || currentTile.visited) return; // visited or invalid

    // Lock movement for new tile
    const triggerEncounter = async () => {
      setGameState('IN_ENCOUNTER');
      setGeneratingEncounter(true);
      markTileVisited(playerX, playerY);

      // Roll for 20/30/50 Encounter Logic
      const roll = Math.random();

      if (roll < 0.20) {
        // 20% - Empty Corridor
        addChatMessage({
          role: 'narrator',
          content: 'Nothing here but empty corporate void and buzzing fluorescent lights.'
        });
        setGameState('EXPLORING');
        addChatMessage({ role: 'system', content: 'MOVEMENT UNLOCKED.' });
        setGeneratingEncounter(false);
        return;
      } else if (roll < 0.50) {
        // 30% - Instant Popup (Bureaucratic Fine / Absurdity)
        const popups = masterBlueprint.instant_popups || ['Unspecified Protocol Violation.'];
        const randomPopup = popups[Math.floor(Math.random() * popups.length)];

        addChatMessage({
          role: 'narrator',
          content: `[AUTOMATED CITATION]\n${randomPopup}`,
          choices: ['Acknowledge and Accept Penalty'] // This will trigger a fast-resolve in ActionInput
        });

        // Wait for player to click acknowledge
        setGeneratingEncounter(false);
        return;
      }

      // 50% - Deep Encounter
      try {
        const encounter = await handlePlayerAction(null, { x: playerX, y: playerY }, masterBlueprint, insubordination);

        addChatMessage({
          role: 'narrator',
          content: encounter.narrative_text,
          asciiArt: encounter.ascii_art,
          choices: encounter.predefined_choices,
          aiSnark: encounter.ai_snark
        });

        // First turn of an encounter doesn't resolve automatically, but waits for input.
        // The one-and-done rule applies to the player's response.
      } catch (e) {
        console.error("Encounter logic failed", e);
        addChatMessage({ role: 'system', content: 'ENCOUNTER RESOLUTION FAILED. TRY AGAIN.' });
        setGameState('EXPLORING'); // fail-safe
      } finally {
        setGeneratingEncounter(false);
      }
    };

    triggerEncounter();
  }, [playerX, playerY, mapData, masterBlueprint, gameState, isAppReady, isIntroFinished, setGameState, setGeneratingEncounter, addChatMessage, markTileVisited, insubordination]);

  const layoutStyle = backgroundImage ? {
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  } : {};

  return (
    <>
      <audio src={soundTrack} autoPlay loop />
      {!apiKey ? (
        <BootScreen />
      ) : !isAppReady ? (
        <LoadingScreen />
      ) : !isIntroFinished ? (
        <IntroScreen />
      ) : (
        <div className="app-layout" style={layoutStyle}>
          <div className="game-section" style={backgroundImage ? { backgroundColor: 'rgba(17, 17, 17, 0.7)', backdropFilter: 'blur(4px)' } : {}}>
            <div className="game-container">
              <div className="map-label">SECTOR 7-G / SURVEILLANCE FEED</div>
              <WorldMap />
              <Player />
            </div>
            <StatsHUD />
          </div>

          <div className="terminal-section" style={backgroundImage ? { backgroundColor: 'rgba(12, 12, 12, 0.9)' } : {}}>
            <TerminalConsole />
            <ActionInput />
          </div>
        </div>
      )}
    </>
  );
}

export default App;
