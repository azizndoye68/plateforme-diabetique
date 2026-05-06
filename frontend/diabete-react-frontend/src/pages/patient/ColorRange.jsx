// src/components/ColorRange.jsx
import React, { useState } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import "./ColorRange.css";

export default function ColorRange({ thresholds }) {
  const [activeZone, setActiveZone] = useState(null);

  if (!thresholds) return null;

  const { hypo, normal, eleve, hyper } = thresholds;

  const zones = [
    {
      id: 'hypo',
      label: 'Hypoglycémie',
      value: hypo,
      color: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
      icon: 'bi-arrow-down-circle-fill',
      iconColor: '#ff6b6b',
      description: 'Taux de sucre trop bas - Resucrez-vous immédiatement',
      action: 'Action requise : Prenez 15g de sucre rapide'
    },
    {
      id: 'normal',
      label: 'Normal',
      value: normal,
      color: 'linear-gradient(135deg, #51cf66 0%, #37b24d 100%)',
      icon: 'bi-check-circle-fill',
      iconColor: '#51cf66',
      description: 'Taux de sucre dans la zone cible',
      action: 'Excellent ! Continuez ainsi'
    },
    {
      id: 'eleve',
      label: 'Élevé',
      value: eleve,
      color: 'linear-gradient(135deg, #ffd43b 0%, #fab005 100%)',
      icon: 'bi-exclamation-circle-fill',
      iconColor: '#ffd43b',
      description: 'Taux de sucre légèrement élevé',
      action: 'Surveillez et hydratez-vous'
    },
    {
      id: 'hyper',
      label: 'Hyperglycémie',
      value: hyper,
      color: 'linear-gradient(135deg, #ff8787 0%, #ff6b6b 100%)',
      icon: 'bi-arrow-up-circle-fill',
      iconColor: '#ff8787',
      description: 'Taux de sucre trop élevé',
      action: 'Consultez votre médecin si persistant'
    }
  ];

  return (
    <div className="color-range-modern">
      {/* Barre colorée interactive */}
      <div className="color-bar-container">
        <div className="color-bar">
          {zones.map((zone, index) => (
            <OverlayTrigger
              key={zone.id}
              placement="top"
              overlay={
                <Tooltip id={`tooltip-${zone.id}`} className="custom-tooltip">
                  <strong>{zone.label}</strong>
                  <div className="mt-1">{zone.value}</div>
                </Tooltip>
              }
            >
              <div
                className={`color-segment ${activeZone === zone.id ? 'active' : ''}`}
                style={{ background: zone.color }}
                onMouseEnter={() => setActiveZone(zone.id)}
                onMouseLeave={() => setActiveZone(null)}
              >
                {activeZone === zone.id && (
                  <div className="segment-pulse"></div>
                )}
              </div>
            </OverlayTrigger>
          ))}
        </div>

        {/* Indicateurs de valeurs */}
        <div className="value-indicators">
          {zones.map((zone) => (
            <div 
              key={zone.id} 
              className={`value-indicator ${activeZone === zone.id ? 'highlight' : ''}`}
            >
              <span className="value-text">{zone.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cartes d'information détaillées */}
      <div className="zones-info-grid">
        {zones.map((zone) => (
          <div
            key={zone.id}
            className={`zone-info-card ${activeZone === zone.id ? 'active' : ''}`}
            onMouseEnter={() => setActiveZone(zone.id)}
            onMouseLeave={() => setActiveZone(null)}
          >
            <div className="zone-card-header">
              <div 
                className="zone-icon" 
                style={{ background: zone.color }}
              >
                <i className={`bi ${zone.icon}`}></i>
              </div>
              <div className="zone-title">
                <h6>{zone.label}</h6>
                <span className="zone-value">{zone.value}</span>
              </div>
            </div>
            <div className="zone-card-body">
              <p className="zone-description">
                <i className={`bi bi-info-circle me-2`} style={{ color: zone.iconColor }}></i>
                {zone.description}
              </p>
              <div className="zone-action">
                <i className="bi bi-lightbulb-fill me-2 text-warning"></i>
                <small>{zone.action}</small>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}