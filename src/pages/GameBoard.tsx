import React, { useRef, useCallback, useEffect, useState } from 'react';
import { CanvasView } from '../canvas/components/CanvasView';
import { useUser, useActiveGame } from '../context/SessionContext';
import { useFirestoreService } from '../services/hooks/useServices';
import { GameAutosaver } from '../canvas/services/GameAutosaver';
import { SaveStatusIndicator, type SaveStatus } from '../canvas/components/SaveStatusIndicator';
import './GameBoard.css';

const SAVE_DEBOUNCE_MS = import.meta.env.MODE === 'test' ? 10 : 2000;
const STATUS_CLEAR_TIMEOUT_MS = 1000;

export const GameBoard: React.FC = () => {
  // 1. Context & Services
  const { user } = useUser();
  const { activeGame, setActiveGame } = useActiveGame();
  const firestoreService = useFirestoreService();

  // 2. Component State
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  // 3. Mutable Refs
  const autosaverRef = useRef<GameAutosaver | null>(null);
  const statusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 4. Callbacks
  const debouncedSave = useCallback(() => {
    autosaverRef.current?.handleTilePlaced();
  }, []);

  useEffect(() => {
    autosaverRef.current = new GameAutosaver({
      firestoreService,
      getUserId: () => user.id,
      getActiveGame: () => activeGame,
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
  }, [firestoreService, user, activeGame]);

  if (!activeGame) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>No active game session</h2>
        <p>Please return to the main menu to start a new game.</p>
      </div>
    );
  }

  return (
    <main className="game-board">
      <CanvasView
        activeGame={activeGame}
        setActiveGame={setActiveGame}
        onTilePlaced={debouncedSave}
      />
      <SaveStatusIndicator status={saveStatus} />
    </main>
  );
};
