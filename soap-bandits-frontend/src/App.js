import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/SearchPage';
import ArtisanPage from './pages/ArtisanPage';
import HomePage from './pages/HomePage';
import InfoPage from './pages/InfoPage';
// NEW: Import the Soap Science page!
import SoapScience from './pages/SoapScience';
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

          {/* PRODUCT INFO PAGE */}
          <Route path="/product" element={<InfoPage />} />

          {/* NEW: SOAP SCIENCE GLOSSARY */}
          <Route path="/science" element={<SoapScience />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
