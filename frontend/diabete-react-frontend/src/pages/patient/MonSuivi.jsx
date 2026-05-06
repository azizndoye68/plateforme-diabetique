import React, { useEffect, useState } from "react";
import { Card, Row, Col, Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import SidebarPatient from "../../components/SidebarPatient";
import AideModal from "../../components/AideModal";
import api from "../../services/api";
import "./MonSuivi.css";

function MonSuivi() {
  const [patient, setPatient] = useState(null);
  const [showAide, setShowAide] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();
  const { patientId } = useParams();

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
          const patientRes = await api.get(
            `/api/patients/byUtilisateur/${utilisateurId}`,
          );
          patientData = patientRes.data;
        }

        setPatient(patientData);
      } catch (err) {
        console.error("Erreur récupération patient :", err);
      }
    };

    fetchPatient();
  }, [patientId]);

  // Définir les items du suivi avec icônes Bootstrap
  const suiviItems = patient
    ? [
        {
          title: "Mes conseils",
          icon: "bi bi-lightbulb-fill",
          gradient: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
          description: "Consulter vos recommandations personnalisées",
          path: patientId
            ? `/medecin/patient/${patientId}/mesconseils`
            : `/patient/mesconseils`,
        },
        {
          title: "Rendez-vous",
          icon: "bi-calendar-check",
          gradient: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
          description: "Gérer vos consultations médicales",
          path: patientId
            ? `/medecin/patient/${patientId}/rendez-vous`
            : `/patient/rendez-vous`,
        },
        {
          title: "Rappels glycémie",
          icon: "bi-alarm-fill",
          gradient: "linear-gradient(135deg, #af3a5d 0%, #c0751e 100%)",
          description: "Configurez vos rappels quotidiens de mesure",
          path: patientId
            ? `/medecin/patient/${patientId}/rappels-glycemie`
            : `/patient/rappels-glycemie`,
        },
        {
          title: "Codes couleurs",
          icon: "bi-palette-fill",
          gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          description: "Comprendre et interpréter les indicateurs",
          path: patientId
            ? `/medecin/patient/${patientId}/codes-couleurs`
            : `/codes-couleurs`,
        },
        {
          title: "Traitement",
          icon: "bi-capsule-pill",
          gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          description: "Gérer votre médication quotidienne",
          path: patientId
            ? `/medecin/patient/${patientId}/traitement`
            : `/patient/traitement`,
        },
        {
          title: "Dossier médical",
          icon: "bi-folder2-open",
          gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
          description: "Accéder à votre historique de santé",
          path: patientId
            ? `/medecin/patient/${patientId}/dossier`
            : `/patient/${patient.id}/dossier`,
        },
      ]
    : [];

  return (
    <div className="mon-suivi-wrapper">
      <SidebarPatient
        patient={patient}
        isMedecin={!!patientId}
        onShowAide={() => setShowAide(true)}
      />

      <div className="mon-suivi-main-content">
        {/* En-tête moderne */}
        <div className="mon-suivi-header">
          <div className="header-content">
            <div className="welcome-section">
              <div className="greeting-text">
                <h1 className="display-6 fw-bold mb-0">
                  <i className="bi bi-activity me-3"></i>
                  Mon Suivi Médical
                </h1>
                <p className="text-muted mb-0">
                  {patient
                    ? `Espace de suivi de ${patient.prenom} ${patient.nom}`
                    : "Chargement..."}
                </p>
              </div>
              <div className="header-time">
                <div className="time-display">
                  {currentTime.toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>

            <div className="header-actions">
              <Button
                variant="light"
                className="action-header-btn"
                onClick={() => navigate(patientId ? `/medecin/patient/${patientId}/dashboard` : '/dashboard-patient')}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Retour
              </Button>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="mon-suivi-content">
          {/* Section d'introduction */}
          <Card className="intro-card mb-4">
            <Card.Body className="p-0">
              <Row className="align-items-center">
                <Col md={8}>
                  <h5 className="mb-1">
                    <i className="bi bi-info-circle-fill text-primary me-2"></i>
                    Accédez rapidement à vos outils de suivi
                  </h5>
                  <p className="text-muted mb-0">
                    Gérez votre santé avec nos différents modules de suivi.
                    Chaque section vous aide à mieux comprendre et contrôler
                    votre diabète.
                  </p>
                </Col>
                <Col md={4} className="text-end">
                  <div className="stats-mini">
                    <div className="stat-item">
                      <i className="bi bi-check-circle-fill text-success"></i>
                      <span className="ms-2">
                        <strong>{suiviItems.length}</strong> outils disponibles
                      </span>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Grille des cartes de suivi */}
          <Row className="g-4">
            {suiviItems.map((item, idx) => (
              <Col md={6} lg={4} key={idx}>
                <Card
                  className="suivi-card-modern"
                  onClick={() => navigate(item.path)}
                >
                  <Card.Body className="p-4">
                    <div
                      className="suivi-icon-container"
                      style={{ background: item.gradient }}
                    >
                      <i className={`bi ${item.icon}`}></i>
                    </div>
                    <h5 className="suivi-card-title mt-1 mb-1">{item.title}</h5>
                    <p className="suivi-card-description text-muted mb-1">
                      {item.description}
                    </p>
                    <div className="suivi-card-footer">
                      <span className="access-link">
                        Accéder
                        <i className="bi bi-arrow-right ms-2"></i>
                      </span>
                    </div>
                  </Card.Body>
                  <div
                    className="card-hover-effect"
                    style={{ background: item.gradient }}
                  ></div>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Section d'aide rapide */}
          <Card className="help-card mt-4">
            <Card.Body className="p-4">
              <Row className="align-items-center">
                <Col md={9}>
                  <h5 className="mb-2">
                    <i
                      className="bi bi-question-circle-fill me-2"
                      style={{ color: "#667eea" }}
                    ></i>
                    Besoin d'aide ?
                  </h5>
                  <p className="text-muted mb-0">
                    Consultez notre guide d'utilisation ou contactez votre
                    équipe médicale pour toute question.
                  </p>
                </Col>
                <Col md={3} className="text-end">
                  <button
                    className="btn btn-outline-primary btn-help"
                    onClick={() => setShowAide(true)}
                  >
                    <i className="bi bi-book me-2"></i>
                    Guide d'aide
                  </button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </div>
      </div>

      <AideModal show={showAide} onHide={() => setShowAide(false)} />
    </div>
  );
}

export default MonSuivi;
