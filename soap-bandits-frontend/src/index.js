import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App'; // 1. Import App instead of LandingPage
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* 2. Render App to enable the Router and Technical Review paths */}
    <App />
  </React.StrictMode>
);

reportWebVitals();
