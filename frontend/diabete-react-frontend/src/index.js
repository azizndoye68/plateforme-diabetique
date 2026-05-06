import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Tu peux soit supprimer ceci
// reportWebVitals();

// Ou laisser comme ça pour mesurer les performances si tu le souhaites
reportWebVitals(console.log);
