import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainMenu } from './pages/MainMenu';
import { GameBoard } from './pages/GameBoard';
import { SessionProvider } from './context/SessionProvider';
import { ServiceProvider } from './services/ServiceProvider';
import type { IAuthService } from './services/auth/IAuthService';
import type { IFirestoreService } from './services/firestore/IFirestoreService';

export interface AppProps {
  /** Optional service overrides (e.g. for tests with in-memory implementations). */
  authService?: IAuthService;
  firestoreService?: IFirestoreService;
}

function App({ authService, firestoreService }: AppProps = {}) {
  return (
    <ServiceProvider authService={authService} firestoreService={firestoreService}>
      <SessionProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainMenu />} />
            <Route path="/game" element={<GameBoard />} />
          </Routes>
        </BrowserRouter>
      </SessionProvider>
    </ServiceProvider>
  );
}

export default App;
