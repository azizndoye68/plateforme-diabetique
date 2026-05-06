// src/pages/patient/EducationPatient.jsx
import React, { useEffect, useState } from "react";
import { Card, Row, Col, Button, Spinner } from "react-bootstrap";
import { useParams } from "react-router-dom";
import SidebarPatient from "../../components/SidebarPatient";
import AideModal from "../../components/AideModal";
import { getContenus } from "../../services/patientService";
import api from "../../services/api";
import "./EducationPatient.css";

export default function EducationPatient() {
  const { patientId } = useParams();

  const [contenus, setContenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [showAide, setShowAide] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedType, setSelectedType] = useState("ALL");

  // Horloge en temps réel
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Charger les contenus
  useEffect(() => {
    const loadContenus = async () => {
      try {
        const data = await getContenus();
        setContenus(data);
      } catch (e) {
        console.error("Erreur chargement contenus :", e);
      } finally {
        setLoading(false);
      }
    };
    loadContenus();
  }, []);

  // Charger le patient pour la sidebar
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        let patientData;

        if (patientId) {
          const patientRes = await api.get(`/api/patients/${patientId}`);
          patientData = patientRes.data;
        } else {
          const profileRes = await api.get("/api/auth/profile");
          const userData = profileRes.data;
          const patientRes = await api.get(
            `/api/patients/byUtilisateur/${userData.id}`,
          );
          patientData = patientRes.data;
        }

        setPatient(patientData);
      } catch (e) {
        console.error("Erreur récupération patient :", e);
      }
    };

    fetchPatient();
  }, [patientId]);

  const getThumbnail = (c) => {
    if (c.type === "VIDEO") {
      const videoId = c.url.split("v=")[1]?.split("&")[0];
      return videoId
        ? `https://img.youtube.com/vi/${videoId}/0.jpg`
        : "/images/video-placeholder.png";
    } else if (c.type === "PDF") {
      return "/images/pdf-thumbnail.png";
    } else if (c.type === "ARTICLE") {
      return "/images/article-thumbnail.png";
    } else {
      return "/images/default-placeholder.png";
    }
  };

  const getTypeConfig = (type) => {
    const configs = {
      VIDEO: {
        icon: "bi-play-circle-fill",
        gradient: "linear-gradient(135deg, #38ef7d 0%, #11998e 100%)",
        color: "#38ef7d",
      },
      PDF: {
        icon: "bi-file-pdf-fill",
        gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        color: "#f5576c",
      },
      ARTICLE: {
        icon: "bi-newspaper",
        gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        color: "#4facfe",
      },
    };
    return configs[type] || configs.ARTICLE;
  };

  // Filtrer les contenus par type
  const filteredContenus =
    selectedType === "ALL"
      ? contenus
      : contenus.filter((c) => c.type === selectedType);

  // Compter les contenus par type
  const countByType = {
    ALL: contenus.length,
    VIDEO: contenus.filter((c) => c.type === "VIDEO").length,
    PDF: contenus.filter((c) => c.type === "PDF").length,
    ARTICLE: contenus.filter((c) => c.type === "ARTICLE").length,
  };

  return (
    <div className="education-wrapper">
      <SidebarPatient
        patient={patient}
        isMedecin={!!patientId}
        onShowAide={() => setShowAide(true)}
      />

      <div className="education-main-content">
        {/* En-tête moderne */}
        <div className="education-header">
          <div className="header-content">
            <div className="welcome-section">
              <div className="greeting-text">
                <h1 className="display-6 fw-bold mb-0">
                  <i className="bi bi-book-fill me-3"></i>
                  Éducation et Sensibilisation
                </h1>
                <p className="text-muted mb-0">
                  Apprenez à mieux gérer votre diabète grâce à ces contenus
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
          </div>
        </div>

        {/* Contenu principal */}
        <div className="education-content">
          {/* Statistiques rapides */}
          <Row className="g-3 mb-4">
            <Col md={3} sm={6}>
              <Card className="stat-card-mini">
                <Card.Body className="p-3">
                  <div className="d-flex align-items-center">
                    <div
                      className="mini-icon"
                      style={{
                        background:
                          "linear-gradient(135deg, #38ef7d 0%, #11998e 100%)",
                      }}
                    >
                      <i className="bi bi-collection-fill"></i>
                    </div>
                    <div className="ms-3">
                      <p className="text-muted mb-0 small">Total contenus</p>
                      <h4 className="mb-0">{contenus.length}</h4>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6}>
              <Card className="stat-card-mini">
                <Card.Body className="p-3">
                  <div className="d-flex align-items-center">
                    <div
                      className="mini-icon"
                      style={{
                        background:
                          "linear-gradient(135deg, #38ef7d 0%, #11998e 100%)",
                      }}
                    >
                      <i className="bi bi-play-circle-fill"></i>
                    </div>
                    <div className="ms-3">
                      <p className="text-muted mb-0 small">Vidéos</p>
                      <h4 className="mb-0">{countByType.VIDEO}</h4>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6}>
              <Card className="stat-card-mini">
                <Card.Body className="p-3">
                  <div className="d-flex align-items-center">
                    <div
                      className="mini-icon"
                      style={{
                        background:
                          "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                      }}
                    >
                      <i className="bi bi-file-pdf-fill"></i>
                    </div>
                    <div className="ms-3">
                      <p className="text-muted mb-0 small">PDF</p>
                      <h4 className="mb-0">{countByType.PDF}</h4>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6}>
              <Card className="stat-card-mini">
                <Card.Body className="p-3">
                  <div className="d-flex align-items-center">
                    <div
                      className="mini-icon"
                      style={{
                        background:
                          "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                      }}
                    >
                      <i className="bi bi-newspaper"></i>
                    </div>
                    <div className="ms-3">
                      <p className="text-muted mb-0 small">Articles</p>
                      <h4 className="mb-0">{countByType.ARTICLE}</h4>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Filtres */}
          <Card className="filter-card mb-4">
            <Card.Body className="p-3">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-funnel-fill text-muted"></i>
                  <span className="fw-bold">Filtrer par type :</span>
                </div>
                <div className="filter-buttons">
                  <Button
                    variant={
                      selectedType === "ALL" ? "primary" : "outline-secondary"
                    }
                    size="sm"
                    className="filter-btn me-2"
                    onClick={() => setSelectedType("ALL")}
                  >
                    <i className="bi bi-grid-fill me-1"></i>
                    Tous ({countByType.ALL})
                  </Button>
                  <Button
                    variant={
                      selectedType === "VIDEO" ? "primary" : "outline-secondary"
                    }
                    size="sm"
                    className="filter-btn me-2"
                    onClick={() => setSelectedType("VIDEO")}
                  >
                    <i className="bi bi-play-circle-fill me-1"></i>
                    Vidéos ({countByType.VIDEO})
                  </Button>
                  <Button
                    variant={
                      selectedType === "PDF" ? "primary" : "outline-secondary"
                    }
                    size="sm"
                    className="filter-btn me-2"
                    onClick={() => setSelectedType("PDF")}
                  >
                    <i className="bi bi-file-pdf-fill me-1"></i>
                    PDF ({countByType.PDF})
                  </Button>
                  <Button
                    variant={
                      selectedType === "ARTICLE"
                        ? "primary"
                        : "outline-secondary"
                    }
                    size="sm"
                    className="filter-btn"
                    onClick={() => setSelectedType("ARTICLE")}
                  >
                    <i className="bi bi-newspaper me-1"></i>
                    Articles ({countByType.ARTICLE})
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Contenu */}
          {loading ? (
            <Card className="loading-card">
              <Card.Body className="text-center p-5">
                <Spinner
                  animation="border"
                  variant="primary"
                  className="mb-3"
                />
                <p className="text-muted">
                  Chargement des contenus éducatifs...
                </p>
              </Card.Body>
            </Card>
          ) : filteredContenus.length === 0 ? (
            <Card className="empty-state-card">
              <Card.Body className="text-center p-5">
                <div className="empty-icon mb-4">
                  <i className="bi bi-inbox"></i>
                </div>
                <h4 className="mb-3">Aucun contenu disponible</h4>
                <p className="text-muted mb-0">
                  {selectedType === "ALL"
                    ? "Aucun contenu éducatif n'est disponible pour le moment"
                    : `Aucun contenu de type ${selectedType.toLowerCase()} n'est disponible`}
                </p>
              </Card.Body>
            </Card>
          ) : (
            <Row className="g-4">
              {filteredContenus.map((c) => {
                const typeConfig = getTypeConfig(c.type);
                return (
                  <Col lg={4} md={6} sm={12} key={c.id}>
                    <Card className="content-card-modern h-100">
                      {/* Thumbnail */}
                      <div className="card-thumbnail-wrapper">
                        <img
                          src={getThumbnail(c)}
                          alt={c.titre}
                          className="card-thumbnail-image"
                        />
                        {c.type === "VIDEO" && (
                          <div className="video-play-overlay">
                            <i className="bi bi-play-circle-fill"></i>
                          </div>
                        )}
                        <div
                          className="type-badge-overlay"
                          style={{ background: typeConfig.gradient }}
                        >
                          <i className={`bi ${typeConfig.icon} me-2`}></i>
                          {c.type}
                        </div>
                      </div>

                      <Card.Body className="p-4">
                        <h5 className="content-title mb-3">{c.titre}</h5>

                        <div className="content-meta mb-3">
                          <div className="meta-item">
                            <i className="bi bi-calendar-event me-2"></i>
                            <small className="text-muted">
                              {new Date(c.datePublication).toLocaleDateString(
                                "fr-FR",
                                {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                },
                              )}
                            </small>
                          </div>
                        </div>

                        <Button
                          href={c.url}
                          target="_blank"
                          rel="noreferrer"
                          className="w-100 btn-consult"
                          style={{ background: typeConfig.gradient }}
                        >
                          <i className={`bi ${typeConfig.icon} me-2`}></i>
                          Consulter le contenu
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}
        </div>
      </div>

      <AideModal show={showAide} onHide={() => setShowAide(false)} />
    </div>
  );
}
