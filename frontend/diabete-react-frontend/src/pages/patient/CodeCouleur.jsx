// src/pages/CodeCouleur.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Row, Col, Button } from "react-bootstrap";
import SidebarPatient from "../../components/SidebarPatient";
import AideModal from "../../components/AideModal";
import api from "../../services/api";
import ColorRange from "./ColorRange";
import "./CodeCouleur.css";

export default function CodeCouleur() {
  const [patient, setPatient] = useState(null);
  const [showAide, setShowAide] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { patientId } = useParams();
  const navigate = useNavigate();

  // Horloge en temps réel
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        let patientData;

        if (patientId) {
          const patientRes = await api.get(`/api/patients/${patientId}`);
          patientData = patientRes.data;
        } else {
          const profileRes = await api.get("/api/auth/profile");
          const utilisateurId = profileRes.data.id;
          const patientRes = await api.get(`/api/patients/byUtilisateur/${utilisateurId}`);
          patientData = patientRes.data;
        }

        setPatient(patientData);
      } catch (err) {
        console.error("Erreur récupération patient :", err);
      }
    };

    fetchPatient();
  }, [patientId]);

  // Définition des seuils comme sur MyDiabby
  const seuilsGlycemie = {
    hypo: "≤0,69 g/L",
    normal: "0,70 - 1,80 g/L",
    eleve: "1,81 - 2,50 g/L",
    hyper: ">2,50 g/L",
  };

  const glycemieCategories = [
    {
      title: "Glycémies à jeun (avant petit-déjeuner)",
      icon: "bi-sunrise-fill",
      color: "#ffc107",
      description: "Mesurez votre glycémie le matin avant votre premier repas",
      thresholds: seuilsGlycemie
    },
    {
      title: "Glycémies avant repas",
      icon: "bi-clock-fill",
      color: "#17a2b8",
      description: "Contrôlez votre glycémie avant le déjeuner et le dîner",
      thresholds: seuilsGlycemie
    },
    {
      title: "Glycémies après repas",
      icon: "bi-check-circle-fill",
      color: "#28a745",
      description: "Vérifiez votre glycémie 2 heures après les repas",
      thresholds: seuilsGlycemie
    }
  ];

  return (
    <div className="code-couleur-wrapper">
      <SidebarPatient 
        patient={patient} 
        isMedecin={!!patientId}
        onShowAide={() => setShowAide(true)}
      />

      <div className="code-couleur-main-content">
        {/* En-tête moderne */}
        <div className="code-couleur-header">
          <div className="header-content">
            <div className="welcome-section">
              <div className="greeting-text">
                <h1 className="display-6 fw-bold mb-0">
                  <i className="bi bi-palette-fill me-3"></i>
                  Codes Couleurs
                </h1>
                <p className="text-muted mb-0">
                  {patient 
                    ? `Guide d'interprétation pour ${patient.prenom} ${patient.nom}` 
                    : 'Chargement...'}
                </p>
              </div>
              <div className="header-time">
                <div className="time-display">
                  {currentTime.toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>

            <div className="header-actions">
              <Button
                variant="light"
                className="action-header-btn"
                onClick={() => navigate(patientId ? `/medecin/patient/${patientId}/mon-suivi` : '/mon-suivi')}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Retour
              </Button>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="code-couleur-content">
          {patient ? (
            <>
              {/* Carte d'information */}
              <Card className="info-card mb-4">
                <Card.Body className="p-4">
                  <Row className="align-items-center">
                    <Col md={1} className="text-center">
                      <i className="bi bi-info-circle-fill info-icon"></i>
                    </Col>
                    <Col md={11}>
                      <h5 className="mb-2">Comment interpréter vos résultats ?</h5>
                      <p className="text-muted mb-0">
                        Les codes couleurs ci-dessous vous aident à identifier rapidement 
                        si votre glycémie est dans la plage normale ou nécessite une attention particulière. 
                        Chaque couleur correspond à un niveau de glycémie spécifique.
                      </p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Légende des couleurs */}
              <Card className="legend-card mb-4">
                <Card.Body className="p-4">
                  <h5 className="mb-4">
                    <i className="bi bi-palette me-2"></i>
                    Légende des couleurs
                  </h5>
                  <Row className="g-3">
                    <Col md={3} sm={6}>
                      <div className="legend-item legend-hypo">
                        <div className="legend-color"></div>
                        <div className="legend-info">
                          <strong>Hypoglycémie</strong>
                          <p className="mb-0 small">≤0,69 g/L</p>
                        </div>
                      </div>
                    </Col>
                    <Col md={3} sm={6}>
                      <div className="legend-item legend-normal">
                        <div className="legend-color"></div>
                        <div className="legend-info">
                          <strong>Normal</strong>
                          <p className="mb-0 small">0,70 - 1,80 g/L</p>
                        </div>
                      </div>
                    </Col>
                    <Col md={3} sm={6}>
                      <div className="legend-item legend-eleve">
                        <div className="legend-color"></div>
                        <div className="legend-info">
                          <strong>Élevé</strong>
                          <p className="mb-0 small">1,81 - 2,50 g/L</p>
                        </div>
                      </div>
                    </Col>
                    <Col md={3} sm={6}>
                      <div className="legend-item legend-hyper">
                        <div className="legend-color"></div>
                        <div className="legend-info">
                          <strong>Hyperglycémie</strong>
                          <p className="mb-0 small">2,50 g/L</p>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Sections de glycémie */}
              <div className="glycemie-sections">
                {glycemieCategories.map((category, index) => (
                  <Card className="section-card mb-4" key={index}>
                    <Card.Body className="p-4">
                      <div className="section-header mb-4">
                        <div className="section-icon" style={{ background: `linear-gradient(135deg, ${category.color} 0%, ${category.color}dd 100%)` }}>
                          <i className={`bi ${category.icon}`}></i>
                        </div>
                        <div className="section-text">
                          <h5 className="mb-1">{category.title}</h5>
                          <p className="text-muted mb-0 small">{category.description}</p>
                        </div>
                      </div>
                      <ColorRange
                        thresholds={category.thresholds}
                      />
                    </Card.Body>
                  </Card>
                ))}
              </div>

              {/* Conseils importants */}
              <Card className="tips-card">
                <Card.Body className="p-4">
                  <h5 className="mb-4">
                    <i className="bi bi-lightbulb-fill me-2 text-warning"></i>
                    Conseils importants
                  </h5>
                  <Row className="g-3">
                    <Col md={6}>
                      <div className="tip-item">
                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                        <span>Mesurez votre glycémie aux moments recommandés par votre médecin</span>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="tip-item">
                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                        <span>Notez vos mesures régulièrement dans votre carnet</span>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="tip-item">
                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                        <span>En cas d'hypoglycémie, resucrez-vous immédiatement</span>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="tip-item">
                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                        <span>Contactez votre médecin si les valeurs sont anormales</span>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </>
          ) : (
            <Card className="loading-card">
              <Card.Body className="text-center p-5">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
                <p className="text-muted">Chargement des informations patient...</p>
              </Card.Body>
            </Card>
          )}
        </div>
      </div>

      <AideModal show={showAide} onHide={() => setShowAide(false)} />
    </div>
  );
}