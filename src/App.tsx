import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainMenu from './pages/MainMenu';
import { GameBoard } from './pages/GameBoard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/game" element={<GameBoard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
