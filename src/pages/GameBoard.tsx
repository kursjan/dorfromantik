import React from 'react';
import { CanvasView } from '../canvas/components/CanvasView';
import { useSession } from '../context/SessionContext';

export const GameBoard: React.FC = () => {
  const { session } = useSession();

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
      <CanvasView session={session} />
    </main>
  );
};
