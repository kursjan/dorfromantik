import React, { useMemo } from 'react';
import { CanvasView } from './canvas/components/CanvasView';
import { Session } from './models/Session';
import { User } from './models/User';
import { GameFactory } from './models/GameFactory';

function App() {
  const session = useMemo(() => {
    const user = new User('local-player');
    const game = GameFactory.createStandardGame();
    const s = new Session('local-session', user);
    s.startNewGame(game);
    return s;
  }, []);

  return (
    <main>
      <h1>Dorfromantik</h1>
      <CanvasView session={session} />
    </main>
  );
}

export default App;
