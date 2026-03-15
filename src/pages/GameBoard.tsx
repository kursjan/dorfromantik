import React, { useRef, useCallback, useEffect } from 'react';
import { CanvasView } from '../canvas/components/CanvasView';
import { useSession } from '../context/SessionContext';
import { useFirestoreService } from '../services/hooks/useServices';

const SAVE_DEBOUNCE_MS = 2000;

export const GameBoard: React.FC = () => {
  const { session } = useSession();
  const firestoreService = useFirestoreService();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const game = session.activeGame;
      if (!game) return;
      firestoreService.saveGameState(session.user.id, game).catch((err) =>
        console.error('Failed to save game state', err)
      );
    }, SAVE_DEBOUNCE_MS);
  }, [session, firestoreService]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

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
