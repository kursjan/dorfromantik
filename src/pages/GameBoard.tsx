import React, { useMemo } from 'react';
import { CanvasView } from '../canvas/components/CanvasView';
import { Session } from '../models/Session';
import { User } from '../models/User';
import { Game } from '../models/Game';

export const GameBoard: React.FC = () => {
  const session = useMemo(() => {
    const user = new User('local-player');
    const game = Game.createStandard();
    const s = new Session('local-session', user);
    s.startNewGame(game);
    return s;
  }, []);

  return (
    <main>
      <CanvasView session={session} />
    </main>
  );
};
