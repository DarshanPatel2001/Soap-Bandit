import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ArtisanPage from './pages/ArtisanPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Path for the main Hub / Wikipedia of Bar Soap */}
          <Route path="/" element={<LandingPage />} />

          {/* Path for the Small Soapmaker submission portal] */}
          <Route path="/submit" element={<ArtisanPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
