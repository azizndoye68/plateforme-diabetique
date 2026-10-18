import React, { useEffect, useState } from "react";
import "./PwaInstallPrompt.css";

const DISMISSED_KEY = "pwa-install-hint-dismissed";

function isRunningStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function isAppleMobile() {
  return /iPhone|iPad|iPod/i.test(window.navigator.userAgent)
    || (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);
}

export default function PwaInstallPrompt() {
  const [installEvent, setInstallEvent] = useState(null);
  const [installed, setInstalled] = useState(isRunningStandalone());
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem(DISMISSED_KEY) === "1");
  const [isIOS] = useState(isAppleMobile());

  useEffect(() => {
    const captureInstallPrompt = (event) => {
      event.preventDefault();
      setInstallEvent(event);
    };
    const markInstalled = () => {
      setInstalled(true);
      setInstallEvent(null);
    };

    window.addEventListener("beforeinstallprompt", captureInstallPrompt);
    window.addEventListener("appinstalled", markInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", captureInstallPrompt);
      window.removeEventListener("appinstalled", markInstalled);
    };
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(DISMISSED_KEY, "1");
    setDismissed(true);
  };

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  };

  if (installed || dismissed || (!installEvent && !isIOS)) return null;

  return (
    <aside className="pwa-install-prompt" aria-label="Installer Suivi Diabète SN">
      <div className="pwa-install-icon" aria-hidden="true"><i className="bi bi-heart-pulse-fill" /></div>
      <div className="pwa-install-copy">
        <strong>Suivi Diabète SN</strong>
        {installEvent ? (
          <span>Installe la plateforme pour la retrouver depuis ton écran d’accueil.</span>
        ) : (
          <span>Dans Safari, touche Partager puis « Sur l’écran d’accueil ».</span>
        )}
      </div>
      {installEvent && <button type="button" className="pwa-install-action" onClick={install}>Installer</button>}
      <button type="button" className="pwa-install-dismiss" aria-label="Fermer" onClick={dismiss}>×</button>
    </aside>
  );
}
