import { useEffect } from 'react';
import { WorldMap } from './components/WorldMap';
import { Player } from './components/Player';
import { useKeyboardInput } from './hooks/useKeyboardInput';
import { useGameStore } from './store/useGameStore';
import { TerminalConsole } from './components/TerminalConsole';
import { ActionInput } from './components/ActionInput';
import { LoadingScreen } from './components/LoadingScreen';
import { StatsHUD } from './components/StatsHUD';
import { generateMasterStory, handlePlayerAction, generateBackgroundImage, generateRagebaitTooltip } from './api/geminiClient';
import './App.css';
import soundTrack from './components/KingOfPoopsMaster.wav';

let hasInitializedGame = false;

function App() {
  useKeyboardInput(); // Global D-pad keyboard listener

  const playerX = useGameStore(state => state.playerX);
  const playerY = useGameStore(state => state.playerY);
  const mapData = useGameStore(state => state.mapData);
  const gameState = useGameStore(state => state.gameState);
  const masterBlueprint = useGameStore(state => state.masterBlueprint);
  const insubordination = useGameStore(state => state.insubordination);

  const isAppReady = useGameStore(state => state.isAppReady);
  const backgroundImage = useGameStore(state => state.backgroundImage);

  const setMasterBlueprint = useGameStore(state => state.setMasterBlueprint);
  const setGameState = useGameStore(state => state.setGameState);
  const addChatMessage = useGameStore(state => state.addChatMessage);
  const setGeneratingEncounter = useGameStore(state => state.setGeneratingEncounter);
  const markTileVisited = useGameStore(state => state.markTileVisited);
  const setAppReady = useGameStore(state => state.setAppReady);
  const setBackgroundImage = useGameStore(state => state.setBackgroundImage);
  const setLoadingTooltip = useGameStore(state => state.setLoadingTooltip);
  const setDebuff = useGameStore(state => state.setDebuff);
  const addInsubordination = useGameStore(state => state.addInsubordination);
  const triggerGlitch = useGameStore(state => state.triggerGlitch);

  // Zero-Session Initialization
  useEffect(() => {
    if (hasInitializedGame) return;
    hasInitializedGame = true;

    const initGame = async () => {
      setGeneratingEncounter(true);
      let tooltipInterval: ReturnType<typeof setInterval> | null = null;
      try {
        setLoadingTooltip("Synthesizing existence...");
        console.log("[INIT] Generating master story...");
        const blueprint = await generateMasterStory();
        console.log("[INIT] Master story generated:", blueprint);
        setMasterBlueprint(blueprint);

        // Start Rage-bait tooltips every 3 seconds while assets load
        tooltipInterval = setInterval(async () => {
          const tip = await generateRagebaitTooltip(blueprint);
          setLoadingTooltip(tip);
        }, 3000);

        // Run background image and first encounter concurrently
        console.log("[INIT] Generating background and initial encounter...");
        const [bgImage, encounter] = await Promise.all([
          generateBackgroundImage(blueprint).catch(e => { console.error("[INIT] BG Gen Failed:", e); return null; }),
          handlePlayerAction(null, { x: playerX, y: playerY }, blueprint, insubordination).catch(e => { console.error("[INIT] Encounter Gen Failed:", e); throw e; })
        ]);
        console.log("[INIT] Background and encounter generated successfully.");

        if (bgImage) setBackgroundImage(bgImage);

        addChatMessage({
          role: 'system',
          content: `ZERO-SESSION INITIALIZED.\n\nOBJECTIVE SECURED: ${blueprint.cynical_win_condition}`
        });

        addChatMessage({
          role: 'narrator',
          content: encounter.narrative_text,
          asciiArt: encounter.ascii_art,
          choices: encounter.predefined_choices,
          aiSnark: encounter.ai_snark
        });

        markTileVisited(playerX, playerY);

        if (encounter.insubordination_score_increment > 0) {
          addInsubordination(encounter.insubordination_score_increment);
          triggerGlitch();
        }

        if (encounter.suggested_will_damage > 0) {
          decreaseWillToLive(encounter.suggested_will_damage);
          addChatMessage({ role: 'system', content: `WILL TO LIVE SEVERED: -${encounter.suggested_will_damage}` });
        }

        if (encounter.debuff_string) {
          setDebuff(encounter.debuff_string, 5); // Debuffs last for 5 steps defaults
          addChatMessage({ role: 'system', content: `DEBUFF APPLIED: ${encounter.debuff_string.toUpperCase()}` });
        }

        setGameState('EXPLORING');
        addChatMessage({ role: 'system', content: 'MOVEMENT UNLOCKED.' });

        setAppReady(true);
        console.log("[INIT] App is ready.");
      } catch (e: any) {
        console.error("[INIT ERROR CRITICAL]", e);
        if (e && e.response) console.error("Response data:", e.response);
        setLoadingTooltip(`CRITICAL ERROR: ${e?.message || "Unknown error"}. Check console.`);
      } finally {
        if (tooltipInterval) clearInterval(tooltipInterval);
        setGeneratingEncounter(false);
      }
    };

    initGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tile Movement Effect
  useEffect(() => {
    if (!masterBlueprint || gameState !== 'EXPLORING' || !isAppReady) return;

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
        // 30% - Instant Popup (Bureaucratic Fine)
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
        setGeneratingEncounter(false);
      } catch (e) {
        console.error("Encounter logic failed", e);
        addChatMessage({ role: 'system', content: 'ENCOUNTER RESOLUTION FAILED. TRY AGAIN.' });
        setGameState('EXPLORING'); // fail-safe
        setGeneratingEncounter(false);
      }
    };

    triggerEncounter();
  }, [playerX, playerY, mapData, masterBlueprint, gameState, isAppReady, setGameState, setGeneratingEncounter, addChatMessage, markTileVisited, insubordination, addInsubordination, triggerGlitch, setDebuff]);

  const handleActionSubmit = async (action: string) => {
    if (!masterBlueprint) return;

    addChatMessage({ role: 'player', content: action });

    // Handle Instant Popup Acknowledgement Fast-Path
    if (action === 'Acknowledge and Accept Penalty') {
      decreaseWillToLive(5);
      addChatMessage({ role: 'system', content: 'WILL TO LIVE SEVERED: -5\nMOVEMENT UNLOCKED.' });
      setGameState('EXPLORING');
      return;
    }

    setGeneratingEncounter(true);

    try {
      const encounterResult = await handlePlayerAction(action, { x: playerX, y: playerY }, masterBlueprint, insubordination);

      addChatMessage({
        role: 'narrator',
        content: encounterResult.narrative_text,
        asciiArt: encounterResult.ascii_art,
        aiSnark: encounterResult.ai_snark
      });

      if (encounterResult.insubordination_score_increment > 0) {
        addInsubordination(encounterResult.insubordination_score_increment);
        triggerGlitch();
      }

      if (encounterResult.suggested_will_damage > 0) {
        decreaseWillToLive(encounterResult.suggested_will_damage);
        addChatMessage({ role: 'system', content: `WILL TO LIVE SEVERED: -${encounterResult.suggested_will_damage}` });
      }

      if (encounterResult.debuff_string) {
        setDebuff(encounterResult.debuff_string, 5); // Default to 5 steps
        addChatMessage({ role: 'system', content: `DEBUFF APPLIED: ${encounterResult.debuff_string.toUpperCase()}` });
      }

      // One-and-done rule:
      setGameState('EXPLORING');
      addChatMessage({ role: 'system', content: 'MOVEMENT UNLOCKED.' });

    } catch (e) {
      console.error("Action logic failed", e);
      addChatMessage({ role: 'system', content: 'ACTION PROCESSING ERROR. TRY AGAIN.' });
      setGameState('EXPLORING'); // Fail-safe unlock
    } finally {
      setGeneratingEncounter(false);
    }
  };

  const layoutStyle = backgroundImage ? {
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  } : {};

  return (
    <>
      <audio src={soundTrack} autoPlay loop />
      {!isAppReady ? (
        <LoadingScreen />
      ) : (
        <div className="app-layout" style={layoutStyle}>
          <div className="game-section" style={backgroundImage ? { backgroundColor: 'rgba(17, 17, 17, 0.7)', backdropFilter: 'blur(4px)' } : {}}>
            <div className="game-container">
              <WorldMap />
              <Player />
            </div>
            <StatsHUD />
          </div>

          <div className="terminal-section" style={backgroundImage ? { backgroundColor: 'rgba(12, 12, 12, 0.9)' } : {}}>
            <TerminalConsole />
            <ActionInput onActionSubmit={handleActionSubmit} />
          </div>
        </div>
      )}
    </>
  );
}

export default App;
