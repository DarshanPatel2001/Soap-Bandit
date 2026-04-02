import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ArtisanPage from './pages/ArtisanPage';
import HomePage from './pages/HomePage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* THE LANDING PAGE (or Homepage, entry point for all users) */}
          <Route path="/" element={<HomePage />} />

          {/* THE SEARCH HUB */}
          <Route path="/search" element={<LandingPage />} />

          {/* THE ARTISAN PORTAL */}
          <Route path="/submit" element={<ArtisanPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
