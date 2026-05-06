// src/pages/medecin/ListeRendezVousMedecin.jsx
import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Badge, Spinner, Form, Table, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import TopbarMedecin from "../../components/TopbarMedecin";
import "./ListeRendezVousMedecin.css";

function ListeRendezVousMedecin() {
  const navigate = useNavigate();
  const [medecin, setMedecin] = useState(null);
  const [rendezVous, setRendezVous] = useState([]);
  const [filteredRdv, setFilteredRdv] = useState([]);
  const [patients, setPatients] = useState({});
  const [loading, setLoading] = useState(true);
  const [filterStatut, setFilterStatut] = useState("TOUS");
  const [filterDate, setFilterDate] = useState("TOUS");
  const [searchTerm, setSearchTerm] = useState("");

  const [stats, setStats] = useState({
    total: 0,
    planifies: 0,
    confirmes: 0,
    aujourdhui: 0,
  });

  // Récupération des données
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Récupérer le médecin connecté
        const profileRes = await api.get("/api/auth/profile");
        const utilisateurId = profileRes.data.id;

        const medRes = await api.get(`/api/medecins/byUtilisateur/${utilisateurId}`);
        const medecinData = medRes.data;
        setMedecin(medecinData);

        // 2. Récupérer les rendez-vous du médecin
        const rdvRes = await api.get(`/api/rendezvous/medecin/${medecinData.id}`);
        const rdvData = rdvRes.data;

        // Trier par date décroissante
        const sortedRdv = rdvData.sort((a, b) => new Date(b.dateRdv) - new Date(a.dateRdv));
        setRendezVous(sortedRdv);
        setFilteredRdv(sortedRdv);

        // 3. Récupérer les infos patients
        const patientIds = [...new Set(rdvData.map(rdv => rdv.patientId))];
        const patientsData = {};
        
        await Promise.all(
          patientIds.map(async (id) => {
            try {
              const res = await api.get(`/api/patients/${id}`);
              patientsData[id] = res.data;
            } catch (err) {
              console.error(`Erreur patient ${id}:`, err);
              patientsData[id] = { prenom: "Inconnu", nom: "" };
            }
          })
        );
        setPatients(patientsData);

        // 4. Calculer les stats
        calculateStats(sortedRdv);

      } catch (error) {
        console.error("Erreur récupération données:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calcul des statistiques
  const calculateStats = (rdvList) => {
    const today = new Date().toDateString();
    
    setStats({
      total: rdvList.length,
      planifies: rdvList.filter(r => r.statut === "PLANIFIE").length,
      confirmes: rdvList.filter(r => r.statut === "CONFIRME").length,
      aujourdhui: rdvList.filter(r => 
        new Date(r.dateRdv).toDateString() === today
      ).length,
    });
  };

  // Filtrage des rendez-vous
  useEffect(() => {
    let filtered = [...rendezVous];

    // Filtre par statut
    if (filterStatut !== "TOUS") {
      filtered = filtered.filter(rdv => rdv.statut === filterStatut);
    }

    // Filtre par date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (filterDate === "AUJOURDHUI") {
      filtered = filtered.filter(rdv => {
        const rdvDate = new Date(rdv.dateRdv);
        rdvDate.setHours(0, 0, 0, 0);
        return rdvDate.getTime() === today.getTime();
      });
    } else if (filterDate === "SEMAINE") {
      const weekEnd = new Date(today);
      weekEnd.setDate(today.getDate() + 7);
      filtered = filtered.filter(rdv => {
        const rdvDate = new Date(rdv.dateRdv);
        return rdvDate >= today && rdvDate <= weekEnd;
      });
    } else if (filterDate === "MOIS") {
      const monthEnd = new Date(today);
      monthEnd.setMonth(today.getMonth() + 1);
      filtered = filtered.filter(rdv => {
        const rdvDate = new Date(rdv.dateRdv);
        return rdvDate >= today && rdvDate <= monthEnd;
      });
    }

    // Recherche par patient
    if (searchTerm) {
      filtered = filtered.filter(rdv => {
        const patient = patients[rdv.patientId];
        if (!patient) return false;
        const fullName = `${patient.prenom} ${patient.nom}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase());
      });
    }

    setFilteredRdv(filtered);
  }, [filterStatut, filterDate, searchTerm, rendezVous, patients]);

  // Badge statut
  const getStatutBadge = (statut) => {
    const badges = {
      PLANIFIE: { bg: "warning", text: "Planifié", icon: "clock" },
      CONFIRME: { bg: "info", text: "Confirmé", icon: "check-circle" },
      ANNULE: { bg: "danger", text: "Annulé", icon: "x-circle" },
      TERMINE: { bg: "success", text: "Terminé", icon: "check-circle-fill" },
    };

    const badge = badges[statut] || badges.PLANIFIE;
    return (
      <Badge bg={badge.bg} className="statut-badge">
        <i className={`bi bi-${badge.icon} me-1`}></i>
        {badge.text}
      </Badge>
    );
  };

  // Mise à jour rapide du statut
  const handleQuickStatusUpdate = async (rdvId, newStatut) => {
    try {
      await api.patch(`/api/rendezvous/${rdvId}/statut?statut=${newStatut}`);
      
      // Rafraîchir la liste
      const rdvRes = await api.get(`/api/rendezvous/medecin/${medecin.id}`);
      const sortedRdv = rdvRes.data.sort((a, b) => new Date(b.dateRdv) - new Date(a.dateRdv));
      setRendezVous(sortedRdv);
      setFilteredRdv(sortedRdv);
      calculateStats(sortedRdv);
    } catch (error) {
      console.error("Erreur mise à jour statut:", error);
      alert("Erreur lors de la mise à jour du statut");
    }
  };

  // Navigation vers le dashboard patient
  const handleViewPatient = (patientId) => {
    navigate(`/medecin/patient/${patientId}/dashboard`);
  };

  if (loading) {
    return (
      <div className="liste-rdv-loading">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Chargement des rendez-vous...</p>
      </div>
    );
  }

  return (
    <div className="liste-rdv-wrapper">
      <TopbarMedecin user={medecin} />

      <div className="liste-rdv-main-content">
        <Container fluid>
          {/* En-tête */}
          <div className="liste-rdv-header">
            <div>
              <h2 className="liste-rdv-title">
                <i className="bi bi-calendar-check me-3"></i>
                Mes Rendez-vous
              </h2>
              <p className="liste-rdv-subtitle">
                Gérez et suivez tous vos rendez-vous patients
              </p>
            </div>
          </div>

          {/* Statistiques */}
          <Row className="g-4 mb-4">
            <Col xl={3} md={6}>
              <Card className="stat-card-rdv">
                <Card.Body>
                  <div className="stat-content">
                    <div className="stat-icon" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
                      <i className="bi bi-calendar2-week"></i>
                    </div>
                    <div>
                      <p className="stat-label">Total rendez-vous</p>
                      <h3 className="stat-value">{stats.total}</h3>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col xl={3} md={6}>
              <Card className="stat-card-rdv">
                <Card.Body>
                  <div className="stat-content">
                    <div className="stat-icon" style={{ background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" }}>
                      <i className="bi bi-clock-history"></i>
                    </div>
                    <div>
                      <p className="stat-label">Planifiés</p>
                      <h3 className="stat-value">{stats.planifies}</h3>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col xl={3} md={6}>
              <Card className="stat-card-rdv">
                <Card.Body>
                  <div className="stat-content">
                    <div className="stat-icon" style={{ background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" }}>
                      <i className="bi bi-check-circle"></i>
                    </div>
                    <div>
                      <p className="stat-label">Confirmés</p>
                      <h3 className="stat-value">{stats.confirmes}</h3>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col xl={3} md={6}>
              <Card className="stat-card-rdv">
                <Card.Body>
                  <div className="stat-content">
                    <div className="stat-icon" style={{ background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" }}>
                      <i className="bi bi-calendar-day"></i>
                    </div>
                    <div>
                      <p className="stat-label">Aujourd'hui</p>
                      <h3 className="stat-value">{stats.aujourdhui}</h3>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Filtres */}
          <Card className="filter-card mb-4">
            <Card.Body>
              <Row className="align-items-center">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="filter-label">
                      <i className="bi bi-search me-2"></i>
                      Rechercher un patient
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Nom ou prénom du patient..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="filter-input"
                    />
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="filter-label">
                      <i className="bi bi-funnel me-2"></i>
                      Filtrer par statut
                    </Form.Label>
                    <Form.Select
                      value={filterStatut}
                      onChange={(e) => setFilterStatut(e.target.value)}
                      className="filter-input"
                    >
                      <option value="TOUS">Tous les statuts</option>
                      <option value="PLANIFIE">Planifiés</option>
                      <option value="CONFIRME">Confirmés</option>
                      <option value="TERMINE">Terminés</option>
                      <option value="ANNULE">Annulés</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="filter-label">
                      <i className="bi bi-calendar3 me-2"></i>
                      Filtrer par période
                    </Form.Label>
                    <Form.Select
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      className="filter-input"
                    >
                      <option value="TOUS">Toutes les dates</option>
                      <option value="AUJOURDHUI">Aujourd'hui</option>
                      <option value="SEMAINE">Cette semaine</option>
                      <option value="MOIS">Ce mois</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Table des rendez-vous */}
          <Card className="rdv-table-card">
            <Card.Body>
              <div className="table-header mb-4">
                <h5 className="table-title">
                  <i className="bi bi-list-ul me-2"></i>
                  Liste des rendez-vous ({filteredRdv.length})
                </h5>
              </div>

              <div className="table-responsive">
                <Table hover className="rdv-table">
                  <thead>
                    <tr>
                      <th>Date & Heure</th>
                      <th>Patient</th>
                      <th>Motif</th>
                      <th>Statut</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRdv.length > 0 ? (
                      filteredRdv.map((rdv) => {
                        const patient = patients[rdv.patientId] || {};
                        const rdvDate = new Date(rdv.dateRdv);
                        const isToday = rdvDate.toDateString() === new Date().toDateString();
                        const isPast = rdvDate < new Date();

                        return (
                          <tr key={rdv.id} className={isToday ? "rdv-today" : ""}>
                            <td>
                              <div className="date-cell">
                                <div className="date-info">
                                  <i className="bi bi-calendar3 me-2"></i>
                                  <strong>{rdvDate.toLocaleDateString("fr-FR", {
                                    weekday: "short",
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric"
                                  })}</strong>
                                </div>
                                <div className="time-info">
                                  <i className="bi bi-clock me-2"></i>
                                  {rdvDate.toLocaleTimeString("fr-FR", {
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  })}
                                </div>
                                {isToday && (
                                  <Badge bg="primary" className="mt-1">
                                    Aujourd'hui
                                  </Badge>
                                )}
                              </div>
                            </td>

                            <td>
                              <div className="patient-cell">
                                <div className="patient-avatar">
                                  {patient.prenom?.[0]}{patient.nom?.[0]}
                                </div>
                                <div>
                                  <div className="patient-name">
                                    {patient.prenom} {patient.nom}
                                  </div>
                                  {patient.typeDiabete && (
                                    <Badge bg="secondary" className="type-badge-small">
                                      {patient.typeDiabete}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="motif-cell">
                              {rdv.motif || "-"}
                            </td>

                            <td>
                              <div className="statut-actions">
                                {getStatutBadge(rdv.statut)}
                                {!isPast && rdv.statut === "PLANIFIE" && (
                                  <Button
                                    size="sm"
                                    variant="outline-info"
                                    className="btn-quick-action"
                                    onClick={() => handleQuickStatusUpdate(rdv.id, "CONFIRME")}
                                  >
                                    <i className="bi bi-check2"></i>
                                  </Button>
                                )}
                              </div>
                            </td>

                            <td>
                              <div className="action-buttons">
                                <Button
                                  size="sm"
                                  className="btn-view"
                                  onClick={() => handleViewPatient(rdv.patientId)}
                                  title="Voir le patient"
                                >
                                  <i className="bi bi-eye"></i>
                                </Button>
                                <Button
                                  size="sm"
                                  className="btn-edit"
                                  onClick={() => navigate(`/medecin/patient/${rdv.patientId}/rendez-vous`)}
                                  title="Gérer les rendez-vous"
                                >
                                  <i className="bi bi-pencil"></i>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center empty-state">
                          <i className="bi bi-calendar-x" style={{ fontSize: "3rem", opacity: 0.3 }}></i>
                          <p className="mt-3 mb-0">Aucun rendez-vous trouvé</p>
                          <p className="text-muted small">
                            Essayez de modifier vos filtres de recherche
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Container>
      </div>
    </div>
  );
}

export default ListeRendezVousMedecin;