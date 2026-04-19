import { useState } from 'react';
import { Link } from 'react-router-dom';
import './SoapScience.css';

const SoapScience = () => {
  const [goo, setGoo] = useState(5);
  const [ph, setPh] = useState(9.0);

  const getGooText = (val) => {
    if (val <= 3)
      return 'Rock Solid. This bar will last for months even if left in a puddle.';
    if (val <= 7)
      return 'Average. Standard lifespan, just keep it out of the direct shower stream.';
    return 'Melter. Very gooey! Use a draining soap dish or it will turn to absolute mush.';
  };

  const getPhText = (val) => {
    if (val < 8.0)
      return 'Syndet / Neutral. Acts like a modern body wash. Very gentle.';
    if (val <= 9.5)
      return 'Ideal Real Soap. Great balance of cleaning power and skin care.';
    return 'Stripping. Highly alkaline. Cleans heavily but may leave skin feeling tight and dry.';
  };

  return (
    <div className="science-wrapper">
      <nav className="nav-bar u-flex u-items-center u-justify-between">
        <div className="logo-text">Soap Science Glossary</div>
        <Link to="/" className="nav-link">
          ← Back to Search
        </Link>
      </nav>

      <div className="science-content">
        <header className="science-header">
          <h1>Understanding Your Matches</h1>
          <p>
            The chemistry behind why some soaps feel amazing and others leave
            you dry.
          </p>
        </header>

        <section className="science-card">
          <div className="card-header">
            <h2>The Goo Factor</h2>
          </div>
          <p>
            Different oils create different soap hardness. Coconut oil makes a
            hard bar, while olive oil makes a softer, &quot;gooier&quot; bar.
          </p>

          <div className="interactive-zone">
            <label>
              Test the Scale: <strong>{goo}/10</strong>
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={goo}
              onChange={(e) => setGoo(e.target.value)}
              className={`slider goo-${goo > 7 ? 'high' : 'low'}`}
            />
            <div className="result-box">
              <strong>Result:</strong> {getGooText(goo)}
            </div>
          </div>
        </section>

        <section className="science-card">
          <div className="card-header">
            <h2>pH Balance</h2>
          </div>
          <p>
            True soap is naturally alkaline (pH 8.5+). If you have Very Hard
            water, high pH soaps will react with minerals to create sticky soap
            scum.
          </p>

          <div className="interactive-zone">
            <label>
              Test the Scale: <strong>pH {ph}</strong>
            </label>
            <input
              type="range"
              min="7.0"
              max="11.0"
              step="0.5"
              value={ph}
              onChange={(e) => setPh(e.target.value)}
              className={`slider ph-${ph > 9.5 ? 'high' : 'low'}`}
            />
            <div className="result-box">
              <strong>Result:</strong> {getPhText(ph)}
            </div>
          </div>
        </section>

        <section className="science-card">
          <div className="card-header">
            <h2>The Water Hardness Trap</h2>
          </div>
          <div className="hardness-grid">
            <div className="hard-box">
              <h3>Soft Water</h3>
              <p>
                Almost any soap works well here. You will get rich, bubbly
                lather easily.
              </p>
            </div>
            <div className="hard-box danger">
              <h3>Very Hard Water</h3>
              <p>
                Minerals kill your lather and leave a film on your skin. Stick
                to synthetic detergents (Syndets) or liquid soaps.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SoapScience;
