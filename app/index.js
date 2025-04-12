import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';
import reportWebVitals from './utils/reportWebVitals';

// Sélectionne l'élément "root"
const root = ReactDOM.createRoot(document.getElementById('root'));

// Rend l'application
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
