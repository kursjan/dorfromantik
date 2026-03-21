import React, { useRef, useCallback, useEffect, useState } from 'react';
import { CanvasView } from '../canvas/components/CanvasView';
import { useSession } from '../context/SessionContext';
import { useFirestoreService } from '../services/hooks/useServices';
import { GameAutosaver } from '../canvas/services/GameAutosaver';
import { SaveStatusIndicator, type SaveStatus } from '../components/SaveStatusIndicator';
import './GameBoard.css';

const SAVE_DEBOUNCE_MS = 2000;
const STATUS_CLEAR_TIMEOUT_MS = 1000;

export const GameBoard: React.FC = () => {
  const { session } = useSession();
  const firestoreService = useFirestoreService();
  const autosaverRef = useRef<GameAutosaver | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const statusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedSave = useCallback(() => {
    autosaverRef.current?.handleTilePlaced();
  }, []);

  useEffect(() => {
    autosaverRef.current = new GameAutosaver({
      firestoreService,
      getUserId: () => session.user.id,
      getActiveGame: () => session.activeGame,
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
  }, [firestoreService, session]);

  if (!session.activeGame) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>No active game session</h2>
        <p>Please return to the main menu to start a new game.</p>
      </div>
    );
  }

  return (
    <main className="game-board">
      <CanvasView session={session} onTilePlaced={debouncedSave} />
      <SaveStatusIndicator status={saveStatus} />
    </main>
  );
};
