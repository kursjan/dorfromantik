import React, { useRef, useCallback, useEffect } from 'react';
import { CanvasView } from '../canvas/components/CanvasView';
import { useSession } from '../context/SessionContext';
import { useFirestoreService } from '../services/hooks/useServices';
import { GameAutosaver } from '../canvas/services/GameAutosaver';

const SAVE_DEBOUNCE_MS = 2000;

export const GameBoard: React.FC = () => {
  const { session } = useSession();
  const firestoreService = useFirestoreService();
  const autosaverRef = useRef<GameAutosaver | null>(null);

  const debouncedSave = useCallback(() => {
    autosaverRef.current?.handleTilePlaced();
  }, []);

  useEffect(() => {
    autosaverRef.current = new GameAutosaver({
      firestoreService,
      getUserId: () => session.user.id,
      getActiveGame: () => session.activeGame,
      debounceMs: SAVE_DEBOUNCE_MS,
    });

    return () => {
      autosaverRef.current?.dispose();
      autosaverRef.current = null;
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
    <main>
      <CanvasView session={session} onTilePlaced={debouncedSave} />
    </main>
  );
};
