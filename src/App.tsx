import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainMenu from './pages/MainMenu';
import { GameBoard } from './pages/GameBoard';
import { SessionProvider } from './context/SessionProvider';
import { ServiceProvider } from './services/ServiceProvider';

function App() {
  return (
    <ServiceProvider>
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
