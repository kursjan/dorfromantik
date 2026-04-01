import React, { useRef, useEffect, useLayoutEffect, useState } from 'react';
import { CanvasView } from '../canvas/components/CanvasView';
import { useUser, useActiveGame } from '../context/SessionContext';
import { useFirestoreService } from '../services/hooks/useServices';
import { GameAutosaver } from '../canvas/services/GameAutosaver';
import { SaveStatusIndicator, type SaveStatus } from '../canvas/components/SaveStatusIndicator';
import './GameBoard.css';

const SAVE_DEBOUNCE_MS = import.meta.env.MODE === 'test' ? 10 : 2000;
const STATUS_CLEAR_TIMEOUT_MS = 1000;

export const GameBoard: React.FC = () => {
  // Context & services
  const { user } = useUser();
  const { activeGame, setActiveGame } = useActiveGame();
  const firestoreService = useFirestoreService();

  // UI state
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  // Mutable refs
  const autosaverRef = useRef<GameAutosaver | null>(null);
  const statusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeGameRef = useRef(activeGame);

  // Synchronization effects
  useLayoutEffect(() => {
    // Drive autosave from state transitions while keeping the latest snapshot
    // available to imperative timers (debounce + forceSave) via ref.
    const previousGame = activeGameRef.current;
    autosaverRef.current?.handleGameChanged(previousGame, activeGame);
    activeGameRef.current = activeGame;
  }, [activeGame]);

  // Lifecycle effects
  useEffect(() => {
    autosaverRef.current = new GameAutosaver({
      firestoreService,
      getUserId: () => user.id,
      // `GameAutosaver` is created without depending on `activeGame` (deps exclude it),
      // so we always read the latest immutable snapshot through `activeGameRef`.
      getActiveGame: () => activeGameRef.current,
      debounceMs: SAVE_DEBOUNCE_MS,
      onSaveStart: () => {
        // Clear previous status immediately when a new save starts
        if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
        setSaveStatus('idle');
      },
      onSaveSuccess: () => {
        setSaveStatus('saved');
        statusTimerRef.current = setTimeout(() => {
          setSaveStatus('idle');
        }, STATUS_CLEAR_TIMEOUT_MS);
      },
      onSaveError: () => {
        setSaveStatus('error');
      },
    });

    return () => {
      autosaverRef.current?.forceSaveAndDispose();
      autosaverRef.current = null;
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    };
  }, [firestoreService, user.id]);

  // Render guards
  if (!activeGame) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>No active game session</h2>
        <p>Please return to the main menu to start a new game.</p>
      </div>
    );
  }

  // Render
  return (
    <main className="game-board">
      <CanvasView activeGame={activeGame} setActiveGame={setActiveGame} />
      <SaveStatusIndicator status={saveStatus} />
    </main>
  );
};
