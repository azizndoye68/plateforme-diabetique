import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import App from './App';
import './responsive.css';
import './ui-polish.css';
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

// Le service worker n'est activé qu'en production. Il met en cache l'enveloppe
// statique de l'application, jamais les appels API contenant des données de santé.
if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${process.env.PUBLIC_URL}/service-worker.js`)
      .catch((error) => console.error('Enregistrement PWA impossible :', error));
  });
}
