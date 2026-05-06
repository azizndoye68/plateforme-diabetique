import React, { useEffect, useState } from "react";
import { Row, Col, Card, Badge, Button, Nav, Tab } from "react-bootstrap";
import SidebarPatient from "../../components/SidebarPatient";
import AideModal from "../../components/AideModal";
import api from "../../services/api";
import "./CarnetGlycemie.css";
import { useParams, useNavigate } from "react-router-dom";

function CarnetGlycemie() {
  const [patient, setPatient] = useState(null);
  const [groupedByDate, setGroupedByDate] = useState({});
  const [donneesPhysiques, setDonneesPhysiques] = useState({});
  const [journalBord, setJournalBord] = useState({});
  const [showAide, setShowAide] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState("glycemie");

  const { patientId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let realPatientId;
        let patientData;

        if (patientId) {
          const patientRes = await api.get(`/api/patients/${patientId}`);
          patientData = patientRes.data;
          realPatientId = patientId;
        } else {
          const profileRes = await api.get("/api/auth/profile");
          const utilisateurId = profileRes.data.id;
          const patientRes = await api.get(
            `/api/patients/byUtilisateur/${utilisateurId}`,
          );
          patientData = patientRes.data;
          realPatientId = patientData.id;
        }

        setPatient(patientData);

        // Charger glycémies
        const resGly = await api.get(
          `/api/suivis/recentes?patientId=${realPatientId}`,
        );
        const dataGly = Array.isArray(resGly.data) ? resGly.data : [];
        const groupedGly = dataGly.reduce((acc, m) => {
          const date = new Date(m.dateSuivi).toLocaleDateString("fr-FR");
          if (!acc[date]) acc[date] = [];
          acc[date].push(m);
          return acc;
        }, {});
        Object.keys(groupedGly).forEach((date) => {
          groupedGly[date].sort(
            (a, b) => new Date(b.dateSuivi) - new Date(a.dateSuivi),
          );
        });
        setGroupedByDate(groupedGly);

        // Charger données physiques
        try {
          const resPhys = await api.get(
            `/api/donnees-physiques/patient/${realPatientId}`,
          );
          const dataPhys = Array.isArray(resPhys.data) ? resPhys.data : [];
          const groupedPhys = dataPhys.reduce((acc, m) => {
            const date = new Date(m.dateSuivi).toLocaleDateString("fr-FR");
            if (!acc[date]) acc[date] = [];
            acc[date].push(m);
            return acc;
          }, {});
          Object.keys(groupedPhys).forEach((date) => {
            groupedPhys[date].sort(
              (a, b) => new Date(b.dateSuivi) - new Date(a.dateSuivi),
            );
          });
          setDonneesPhysiques(groupedPhys);
        } catch (err) {
          console.log("Pas de données physiques");
        }

        // Charger journal de bord
        try {
          const resJournal = await api.get(
            `/api/journal-bord/patient/${realPatientId}`,
          );
          const dataJournal = Array.isArray(resJournal.data)
            ? resJournal.data
            : [];
          const groupedJournal = dataJournal.reduce((acc, m) => {
            const date = new Date(m.dateSuivi).toLocaleDateString("fr-FR");
            if (!acc[date]) acc[date] = [];
            acc[date].push(m);
            return acc;
          }, {});
          Object.keys(groupedJournal).forEach((date) => {
            groupedJournal[date].sort(
              (a, b) => new Date(b.dateSuivi) - new Date(a.dateSuivi),
            );
          });
          setJournalBord(groupedJournal);
        } catch (err) {
          console.log("Pas de journal de bord");
        }
      } catch (err) {
        console.error("Erreur lors du chargement du carnet :", err);
      }
    };

    fetchData();
  }, [patientId]);

  const getGlycemieStatus = (value) => {
    if (value < 0.7)
      return { text: "Faible", variant: "warning", bgClass: "status-low" };
    if (value >= 0.7 && value <= 1.2)
      return { text: "Normal", variant: "success", bgClass: "status-normal" };
    return { text: "Élevé", variant: "danger", bgClass: "status-high" };
  };

  const getMomentInfo = (moment, repas) => {
    const repasIcons = {
      petit_dejeuner: {
        icon: "bi-cup-hot-fill",
        color: "#ffc107",
        label: "Petit-déjeuner",
      },
      dejeuner: {
        icon: "bi-brightness-high-fill",
        color: "#17a2b8",
        label: "Déjeuner",
      },
      diner: { icon: "bi-moon-stars-fill", color: "#764ba2", label: "Dîner" },
      collation: { icon: "bi-cookie", color: "#fd7e14", label: "Collation" },
    };
    const info = repasIcons[repas] || {
      icon: "bi-circle-fill",
      color: "#6c757d",
      label: repas,
    };
    const momentText = moment === "avant_repas" ? "Avant" : "Après";
    return { ...info, momentText };
  };

  return (
    <div className="carnet-wrapper">
      <SidebarPatient
        onShowAide={() => setShowAide(true)}
        patient={patient}
        isMedecin={!!patientId}
      />

      <div className="carnet-main-content">
        <div className="carnet-header">
          <div className="header-content">
            <div className="welcome-section">
              <div className="greeting-text">
                <h1 className="display-6 fw-bold mb-0">
                  <i className="bi bi-journal-medical me-3"></i>
                  Carnet de Suivi
                </h1>
                <p className="text-muted mb-0">
                  {patient
                    ? `Suivi de ${patient.prenom} ${patient.nom}`
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
                onClick={() =>
                  navigate(
                    patientId
                      ? `/medecin/patient/${patientId}/ajouter-donnees`
                      : "/ajouter-donnees",
                  )
                }
              >
                <i className="bi bi-plus-circle me-2"></i>
                Nouvelle mesure
              </Button>
            </div>
          </div>
        </div>

        <div className="carnet-content">
          <Card className="tabs-card-carnet">
            <Card.Body className="p-0">
              <Tab.Container
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
              >
                <div className="tabs-header-carnet">
                  <Nav variant="pills" className="custom-tabs-carnet">
                    <Nav.Item>
                      <Nav.Link eventKey="glycemie" className="tab-link-carnet">
                        <div
                          className="tab-icon-carnet"
                          style={{
                            background:
                              "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          }}
                        >
                          <i className="bi bi-droplet-half"></i>
                        </div>
                        <div className="tab-text-carnet">
                          <div className="tab-title-carnet">Glycémie</div>
                          <small>Mesures de glycémie</small>
                        </div>
                      </Nav.Link>
                    </Nav.Item>

                    <Nav.Item>
                      <Nav.Link eventKey="journal" className="tab-link-carnet">
                        <div
                          className="tab-icon-carnet"
                          style={{
                            background:
                              "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                          }}
                        >
                          <i className="bi bi-journal-text"></i>
                        </div>
                        <div className="tab-text-carnet">
                          <div className="tab-title-carnet">
                            Journal de bord
                          </div>
                          <small>Notes quotidiennes</small>
                        </div>
                      </Nav.Link>
                    </Nav.Item>

                    <Nav.Item>
                      <Nav.Link eventKey="physique" className="tab-link-carnet">
                        <div
                          className="tab-icon-carnet"
                          style={{
                            background:
                              "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                          }}
                        >
                          <i className="bi bi-heart-pulse-fill"></i>
                        </div>
                        <div className="tab-text-carnet">
                          <div className="tab-title-carnet">
                            Données physiques
                          </div>
                          <small>Poids et tension</small>
                        </div>
                      </Nav.Link>
                    </Nav.Item>
                  </Nav>
                </div>

                <div className="tabs-content-carnet p-4">
                  <Tab.Content>
                    {/* Onglet Glycémie */}
                    <Tab.Pane eventKey="glycemie">
                      {Object.entries(groupedByDate).length === 0 ? (
                        <Card className="empty-state-card">
                          <Card.Body className="text-center p-5">
                            <div className="empty-icon mb-4">
                              <i className="bi bi-inbox"></i>
                            </div>
                            <h4 className="mb-3">Aucune mesure de glycémie</h4>
                            <p className="text-muted mb-4">
                              Commencez à suivre votre glycémie
                            </p>
                            <Button
                              variant="primary"
                              size="lg"
                              className="btn-action"
                              onClick={() =>
                                navigate(
                                  patientId
                                    ? `/medecin/patient/${patientId}/ajouter-donnees`
                                    : "/ajouter-donnees",
                                )
                              }
                            >
                              <i className="bi bi-plus-circle me-2"></i>
                              Ajouter une mesure
                            </Button>
                          </Card.Body>
                        </Card>
                      ) : (
                        <div className="timeline-container">
                          {Object.entries(groupedByDate)
                            .sort(([dateA], [dateB]) => {
                              const [dayA, monthA, yearA] = dateA.split("/");
                              const [dayB, monthB, yearB] = dateB.split("/");
                              return (
                                new Date(yearB, monthB - 1, dayB) -
                                new Date(yearA, monthA - 1, dayA)
                              );
                            })
                            .map(([date, mesures]) => (
                              <div key={date} className="date-group">
                                <div className="date-header">
                                  <div className="date-badge">
                                    <i className="bi bi-calendar-event me-2"></i>
                                    <span>{date}</span>
                                  </div>
                                  <div className="date-line"></div>
                                </div>

                                <div className="mesures-list">
                                  {mesures.map((m) => {
                                    const status = getGlycemieStatus(
                                      m.glycemie,
                                    );
                                    const momentInfo = getMomentInfo(
                                      m.moment,
                                      m.repas,
                                    );

                                    return (
                                      <Card
                                        className={`mesure-card ${status.bgClass}`}
                                        key={m.id}
                                      >
                                        <Card.Body>
                                          <Row className="align-items-center">
                                            <Col md={3}>
                                              <div className="mesure-time">
                                                <i className="bi bi-clock-fill me-2"></i>
                                                <strong>
                                                  {new Date(
                                                    m.dateSuivi,
                                                  ).toLocaleTimeString(
                                                    "fr-FR",
                                                    {
                                                      hour: "2-digit",
                                                      minute: "2-digit",
                                                    },
                                                  )}
                                                </strong>
                                              </div>
                                            </Col>

                                            <Col md={3}>
                                              <div className="mesure-repas">
                                                <i
                                                  className={`${momentInfo.icon} me-2`}
                                                  style={{
                                                    color: momentInfo.color,
                                                  }}
                                                ></i>
                                                <div>
                                                  <div className="repas-label">
                                                    {momentInfo.label}
                                                  </div>
                                                  <small className="text-muted">
                                                    {momentInfo.momentText}{" "}
                                                    repas
                                                  </small>
                                                </div>
                                              </div>
                                            </Col>

                                            <Col md={3}>
                                              <div className="mesure-value">
                                                <span className="value-number">
                                                  {m.glycemie}
                                                </span>
                                                <span className="value-unit">
                                                  g/L
                                                </span>
                                              </div>
                                            </Col>

                                            <Col md={3} className="text-end">
                                              <Badge
                                                bg={status.variant}
                                                className="status-badge"
                                              >
                                                <i className="bi bi-circle-fill me-1"></i>
                                                {status.text}
                                              </Badge>
                                            </Col>
                                          </Row>
                                        </Card.Body>
                                      </Card>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </Tab.Pane>

                    {/* Onglet Données Physiques */}
                    <Tab.Pane eventKey="physique">
                      {Object.entries(donneesPhysiques).length === 0 ? (
                        <Card className="empty-state-card">
                          <Card.Body className="text-center p-5">
                            <div className="empty-icon mb-4">
                              <i className="bi bi-heart-pulse"></i>
                            </div>
                            <h4 className="mb-3">Aucune donnée physique</h4>
                            <p className="text-muted mb-4">
                              Commencez à enregistrer vos données physiques
                            </p>
                            <Button
                              variant="primary"
                              size="lg"
                              className="btn-action"
                              onClick={() =>
                                navigate(
                                  patientId
                                    ? `/medecin/patient/${patientId}/ajouter-donnees`
                                    : "/ajouter-donnees",
                                )
                              }
                            >
                              <i className="bi bi-plus-circle me-2"></i>
                              Ajouter des données
                            </Button>
                          </Card.Body>
                        </Card>
                      ) : (
                        <div className="timeline-container">
                          {Object.entries(donneesPhysiques)
                            .sort(([dateA], [dateB]) => {
                              const [dayA, monthA, yearA] = dateA.split("/");
                              const [dayB, monthB, yearB] = dateB.split("/");
                              return (
                                new Date(yearB, monthB - 1, dayB) -
                                new Date(yearA, monthA - 1, dayA)
                              );
                            })
                            .map(([date, mesures]) => (
                              <div key={date} className="date-group">
                                <div className="date-header">
                                  <div className="date-badge">
                                    <i className="bi bi-calendar-event me-2"></i>
                                    <span>{date}</span>
                                  </div>
                                  <div className="date-line"></div>
                                </div>

                                <div className="mesures-list">
                                  {mesures.map((m) => (
                                    <Card className="mesure-card" key={m.id}>
                                      <Card.Body>
                                        <Row className="align-items-center">
                                          <Col md={3}>
                                            <div className="mesure-time">
                                              <i className="bi bi-clock-fill me-2"></i>
                                              <strong>
                                                {new Date(
                                                  m.dateSuivi,
                                                ).toLocaleTimeString("fr-FR", {
                                                  hour: "2-digit",
                                                  minute: "2-digit",
                                                })}
                                              </strong>
                                            </div>
                                          </Col>

                                          <Col md={4}>
                                            <div className="mesure-repas">
                                              <i
                                                className="bi bi-speedometer2 me-2"
                                                style={{ color: "#f093fb" }}
                                              ></i>
                                              <div>
                                                <div className="repas-label">
                                                  Poids
                                                </div>
                                                <strong>
                                                  {m.poids
                                                    ? `${m.poids} Kg`
                                                    : "--"}
                                                </strong>
                                              </div>
                                            </div>
                                          </Col>

                                          <Col md={5}>
                                            <div className="mesure-repas">
                                              <i
                                                className="bi bi-activity me-2"
                                                style={{ color: "#f5576c" }}
                                              ></i>
                                              <div>
                                                <div className="repas-label">
                                                  Tension
                                                </div>
                                                <strong>
                                                  {m.tension || "--"}
                                                </strong>
                                              </div>
                                            </div>
                                          </Col>
                                        </Row>
                                      </Card.Body>
                                    </Card>
                                  ))}
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </Tab.Pane>

                    {/* Onglet Journal de Bord */}
                    <Tab.Pane eventKey="journal">
                      {Object.entries(journalBord).length === 0 ? (
                        <Card className="empty-state-card">
                          <Card.Body className="text-center p-5">
                            <div className="empty-icon mb-4">
                              <i className="bi bi-journal-text"></i>
                            </div>
                            <h4 className="mb-3">
                              Aucune entrée dans le journal
                            </h4>
                            <p className="text-muted mb-4">
                              Commencez à noter vos observations quotidiennes
                            </p>
                            <Button
                              variant="primary"
                              size="lg"
                              className="btn-action"
                              onClick={() =>
                                navigate(
                                  patientId
                                    ? `/medecin/patient/${patientId}/ajouter-donnees`
                                    : "/ajouter-donnees",
                                )
                              }
                            >
                              <i className="bi bi-plus-circle me-2"></i>
                              Ajouter une entrée
                            </Button>
                          </Card.Body>
                        </Card>
                      ) : (
                        <div className="timeline-container">
                          {Object.entries(journalBord)
                            .sort(([dateA], [dateB]) => {
                              const [dayA, monthA, yearA] = dateA.split("/");
                              const [dayB, monthB, yearB] = dateB.split("/");
                              return (
                                new Date(yearB, monthB - 1, dayB) -
                                new Date(yearA, monthA - 1, dayA)
                              );
                            })
                            .map(([date, mesures]) => (
                              <div key={date} className="date-group">
                                <div className="date-header">
                                  <div className="date-badge">
                                    <i className="bi bi-calendar-event me-2"></i>
                                    <span>{date}</span>
                                  </div>
                                  <div className="date-line"></div>
                                </div>

                                <div className="mesures-list">
                                  {mesures.map((m) => (
                                    <Card
                                      className="mesure-card journal-card"
                                      key={m.id}
                                    >
                                      <Card.Body>
                                        <Row>
                                          <Col md={12} className="mb-3">
                                            <div className="mesure-time">
                                              <i className="bi bi-clock-fill me-2"></i>
                                              <strong>
                                                {new Date(
                                                  m.dateSuivi,
                                                ).toLocaleTimeString("fr-FR", {
                                                  hour: "2-digit",
                                                  minute: "2-digit",
                                                })}
                                              </strong>
                                            </div>
                                          </Col>

                                          <Col md={6} className="mb-2">
                                            <div className="journal-item">
                                              <i
                                                className="bi bi-egg-fried me-2"
                                                style={{ color: "#4facfe" }}
                                              ></i>
                                              <div>
                                                <small className="text-muted d-block">
                                                  Repas
                                                </small>
                                                <p className="mb-0">
                                                  {m.repas || "--"}
                                                </p>
                                              </div>
                                            </div>
                                          </Col>

                                          <Col md={6} className="mb-2">
                                            <div className="journal-item">
                                              <i
                                                className="bi bi-bicycle me-2"
                                                style={{ color: "#00f2fe" }}
                                              ></i>
                                              <div>
                                                <small className="text-muted d-block">
                                                  Activité
                                                </small>
                                                <p className="mb-0">
                                                  {m.activitePhysique || "--"}
                                                </p>
                                              </div>
                                            </div>
                                          </Col>

                                          <Col md={6}>
                                            <div className="journal-item">
                                              <i
                                                className="bi bi-thermometer-half me-2"
                                                style={{ color: "#ffc107" }}
                                              ></i>
                                              <div>
                                                <small className="text-muted d-block">
                                                  Symptômes
                                                </small>
                                                <p className="mb-0">
                                                  {m.symptomes || "--"}
                                                </p>
                                              </div>
                                            </div>
                                          </Col>

                                          <Col md={6}>
                                            <div className="journal-item">
                                              <i
                                                className="bi bi-clipboard-pulse me-2"
                                                style={{ color: "#f093fb" }}
                                              ></i>
                                              <div>
                                                <small className="text-muted d-block">
                                                  Événements
                                                </small>
                                                <p className="mb-0">
                                                  {m.evenements || "--"}
                                                </p>
                                              </div>
                                            </div>
                                          </Col>
                                        </Row>
                                      </Card.Body>
                                    </Card>
                                  ))}
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </Tab.Pane>
                  </Tab.Content>
                </div>
              </Tab.Container>
            </Card.Body>
          </Card>
        </div>
      </div>

      <AideModal show={showAide} onHide={() => setShowAide(false)} />
    </div>
  );
}

export default CarnetGlycemie;
