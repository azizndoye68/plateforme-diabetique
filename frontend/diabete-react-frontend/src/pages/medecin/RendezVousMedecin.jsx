// src/pages/RendezVousMedecin.jsx
import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Form, Button, Table, Spinner, Badge, Modal } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import SidebarPatient from "../../components/SidebarPatient";
import "./RendezVousMedecin.css";

function RendezVousMedecin() {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [rendezVous, setRendezVous] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPatient, setLoadingPatient] = useState(true);
  const [medecinId, setMedecinId] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRdv, setSelectedRdv] = useState(null);

  const [formData, setFormData] = useState({
    dateRendezVous: "",
    heureRendezVous: "",
    motif: "",
    statut: "PLANIFIE", // ✅ Corrigé : PLANIFIE au lieu de EN_ATTENTE
  });

  const [editFormData, setEditFormData] = useState({
    dateRendezVous: "",
    heureRendezVous: "",
    motif: "",
    statut: "",
  });

  // 🔹 Récupération des données
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingPatient(true);

        const profileRes = await api.get("/api/auth/profile");
        const utilisateurId = profileRes.data.id;

        const medRes = await api.get(`/api/medecins/byUtilisateur/${utilisateurId}`);
        if (!medRes.data || !medRes.data.id) {
          throw new Error("Médecin introuvable pour l'utilisateur connecté !");
        }
        setMedecinId(medRes.data.id);

        if (!patientId) throw new Error("Patient ID manquant dans l'URL !");
        const resPatient = await api.get(`/api/patients/${patientId}`);
        setPatient(resPatient.data);

        const resRdv = await api.get(`/api/rendezvous/patient/${patientId}`);
        const sortedRdv = resRdv.data.sort(
          (a, b) => new Date(b.dateRdv) - new Date(a.dateRdv) // ✅ Corrigé : dateRdv
        );
        setRendezVous(sortedRdv);

      } catch (error) {
        console.error("Erreur récupération données", error);
        alert(error.message || "Impossible de récupérer les données.");
      } finally {
        setLoadingPatient(false);
      }
    };

    fetchData();
  }, [patientId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!patientId || !medecinId) {
      return alert("Impossible d'enregistrer : patient ou médecin non défini");
    }

    try {
      setLoading(true);

      const dateTime = `${formData.dateRendezVous}T${formData.heureRendezVous}:00`;

      // ✅ Corrigé : envoi avec les bons noms de champs
      await api.post("/api/rendezvous", {
        patientId: parseInt(patientId),
        medecinId: medecinId,
        dateRdv: dateTime, // ✅ Corrigé : dateRdv au lieu de dateRendezVous
        motif: formData.motif,
        statut: formData.statut,
      });

      setSuccess(true);
      setFormData({
        dateRendezVous: "",
        heureRendezVous: "",
        motif: "",
        statut: "PLANIFIE", // ✅ Corrigé
      });

      // Rafraîchir la liste
      const resRdv = await api.get(`/api/rendezvous/patient/${patientId}`);
      const sortedRdv = resRdv.data.sort(
        (a, b) => new Date(b.dateRdv) - new Date(a.dateRdv) // ✅ Corrigé
      );
      setRendezVous(sortedRdv);

      setTimeout(() => setSuccess(false), 3000);

    } catch (error) {
      console.error("Erreur lors de l'enregistrement :", error);
      alert("Erreur lors de l'enregistrement ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleEditRdv = (rdv) => {
    const dateObj = new Date(rdv.dateRdv); // ✅ Corrigé
    const date = dateObj.toISOString().split('T')[0];
    const time = dateObj.toTimeString().slice(0, 5);

    setSelectedRdv(rdv);
    setEditFormData({
      dateRendezVous: date,
      heureRendezVous: time,
      motif: rdv.motif,
      statut: rdv.statut,
    });
    setShowEditModal(true);
  };

  const handleUpdateRdv = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const dateTime = `${editFormData.dateRendezVous}T${editFormData.heureRendezVous}:00`;

      // ✅ Corrigé
      await api.put(`/api/rendezvous/${selectedRdv.id}`, {
        patientId: parseInt(patientId),
        medecinId: medecinId,
        dateRdv: dateTime, // ✅ Corrigé
        motif: editFormData.motif,
        statut: editFormData.statut,
      });

      setShowEditModal(false);
      setSelectedRdv(null);

      // Rafraîchir la liste
      const resRdv = await api.get(`/api/rendezvous/patient/${patientId}`);
      const sortedRdv = resRdv.data.sort(
        (a, b) => new Date(b.dateRdv) - new Date(a.dateRdv) // ✅ Corrigé
      );
      setRendezVous(sortedRdv);

      alert("Rendez-vous mis à jour avec succès ✅");

    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
      alert("Erreur lors de la mise à jour ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRdv = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce rendez-vous ?")) {
      return;
    }

    try {
      await api.delete(`/api/rendezvous/${id}`);
      
      // Rafraîchir la liste
      const resRdv = await api.get(`/api/rendezvous/patient/${patientId}`);
      const sortedRdv = resRdv.data.sort(
        (a, b) => new Date(b.dateRdv) - new Date(a.dateRdv) // ✅ Corrigé
      );
      setRendezVous(sortedRdv);

      alert("Rendez-vous supprimé avec succès ✅");

    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      alert("Erreur lors de la suppression ❌");
    }
  };

  // ✅ Fonction corrigée avec les bonnes valeurs d'enum
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

  if (loadingPatient) {
    return (
      <div className="rdv-loading">
        <div className="loading-content">
          <Spinner animation="border" variant="primary" className="loading-spinner" />
          <p className="loading-text">Chargement des rendez-vous...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Container fluid className="p-0">
        <Row className="g-0 rdv-row">
          <Col xs={12} md={3} className="sidebar-col p-0">
            <SidebarPatient patient={patient} isMedecin={true} />
          </Col>

          <Col xs={12} md={9} className="main-col rdv-medecin-page">
            <div className="rdv-container">
              {/* En-tête */}
              <div className="rdv-header">
                <div className="header-content">
                  <div className="header-icon">
                    <i className="bi bi-calendar-check"></i>
                  </div>
                  <div className="header-info">
                    <h2 className="header-title">Gestion des Rendez-vous</h2>
                    <p className="header-subtitle">
                      <i className="bi bi-person-badge me-2"></i>
                      {patient?.prenom} {patient?.nom}
                      {patient?.typeDiabete && (
                        <Badge bg="info" className="ms-2 type-badge">
                          {patient.typeDiabete}
                        </Badge>
                      )}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline-secondary"
                  className="btn-retour"
                  onClick={() => navigate(`/medecin/patient/${patientId}/dashboard`)}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Retour
                </Button>
              </div>

              {/* Alert succès */}
              {success && (
                <div className="success-alert-rdv">
                  <div className="alert-content">
                    <i className="bi bi-check-circle-fill alert-icon"></i>
                    <div className="alert-text">
                      <strong>Rendez-vous créé avec succès !</strong>
                      <div className="text-muted small">
                        Le patient sera notifié de ce nouveau rendez-vous.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Formulaire */}
              <Card className="rdv-form-card">
                <Card.Body className="card-body-custom">
                  <div className="form-section-header">
                    <div className="section-icon">
                      <i className="bi bi-calendar-plus"></i>
                    </div>
                    <div>
                      <h5 className="section-title">Nouveau rendez-vous</h5>
                      <p className="section-subtitle">
                        Planifiez un rendez-vous avec votre patient
                      </p>
                    </div>
                  </div>

                  <Form onSubmit={handleSubmit}>
                    <Row>
                      <Col md={6}>
                        <div className="form-group-custom">
                          <Form.Label className="form-label-custom">
                            <i className="bi bi-calendar3 me-2"></i>
                            Date du rendez-vous
                            <span className="text-danger ms-1">*</span>
                          </Form.Label>
                          <Form.Control
                            type="date"
                            name="dateRendezVous"
                            value={formData.dateRendezVous}
                            onChange={handleChange}
                            className="form-control-custom"
                            min={new Date().toISOString().split('T')[0]}
                            required
                          />
                        </div>
                      </Col>

                      <Col md={6}>
                        <div className="form-group-custom">
                          <Form.Label className="form-label-custom">
                            <i className="bi bi-clock me-2"></i>
                            Heure du rendez-vous
                            <span className="text-danger ms-1">*</span>
                          </Form.Label>
                          <Form.Control
                            type="time"
                            name="heureRendezVous"
                            value={formData.heureRendezVous}
                            onChange={handleChange}
                            className="form-control-custom"
                            required
                          />
                        </div>
                      </Col>
                    </Row>

                    <div className="form-group-custom">
                      <Form.Label className="form-label-custom">
                        <i className="bi bi-file-text me-2"></i>
                        Motif du rendez-vous
                        <span className="text-danger ms-1">*</span>
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="motif"
                        value={formData.motif}
                        onChange={handleChange}
                        className="form-control-custom"
                        placeholder="Ex: Consultation de suivi, ajustement du traitement, bilan glycémique..."
                        required
                      />
                    </div>

                    <div className="form-group-custom">
                      <Form.Label className="form-label-custom">
                        <i className="bi bi-info-circle me-2"></i>
                        Statut
                      </Form.Label>
                      <Form.Select
                        name="statut"
                        value={formData.statut}
                        onChange={handleChange}
                        className="form-control-custom"
                      >
                        <option value="PLANIFIE">Planifié</option>
                        <option value="CONFIRME">Confirmé</option>
                      </Form.Select>
                    </div>

                    <div className="form-actions">
                      <Button type="submit" className="btn-save" disabled={loading}>
                        {loading ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              className="me-2"
                            />
                            Enregistrement en cours...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-check-lg me-2"></i>
                            Créer le rendez-vous
                          </>
                        )}
                      </Button>

                      <Button
                        variant="outline-secondary"
                        className="btn-cancel"
                        onClick={() => navigate(`/medecin/patient/${patientId}/dashboard`)}
                        disabled={loading}
                      >
                        <i className="bi bi-x-lg me-2"></i>
                        Annuler
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>

              {/* Historique */}
              <Card className="history-card">
                <Card.Body className="card-body-custom">
                  <div className="history-header">
                    <div>
                      <h5 className="history-title">
                        <i className="bi bi-clock-history me-2"></i>
                        Historique des rendez-vous
                      </h5>
                      <p className="history-subtitle">
                        {rendezVous.length} rendez-vous enregistré(s)
                      </p>
                    </div>
                  </div>

                  <div className="table-responsive">
                    <Table hover className="rdv-table">
                      <thead>
                        <tr>
                          <th>Date & Heure</th>
                          <th>Motif</th>
                          <th>Statut</th>
                          <th className="text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rendezVous.length > 0 ? (
                          rendezVous.map((rdv) => (
                            <tr key={rdv.id}>
                              <td>
                                <div className="date-cell">
                                  <i className="bi bi-calendar3 me-2"></i>
                                  {/* ✅ Corrigé : dateRdv */}
                                  {new Date(rdv.dateRdv).toLocaleDateString("fr-FR")}
                                  <br />
                                  <small className="text-muted">
                                    <i className="bi bi-clock me-1"></i>
                                    {new Date(rdv.dateRdv).toLocaleTimeString("fr-FR", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </small>
                                </div>
                              </td>
                              <td className="motif-cell">{rdv.motif || "-"}</td>
                              <td>{getStatutBadge(rdv.statut)}</td>
                              <td>
                                <div className="action-buttons">
                                  <Button
                                    size="sm"
                                    className="btn-edit"
                                    onClick={() => handleEditRdv(rdv)}
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="btn-delete"
                                    onClick={() => handleDeleteRdv(rdv.id)}
                                  >
                                    <i className="bi bi-trash"></i>
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="text-center empty-state">
                              <i className="bi bi-calendar-x" style={{ fontSize: "2rem", opacity: 0.3 }}></i>
                              <p className="mt-2 mb-0">Aucun rendez-vous enregistré.</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Modal Modification */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-pencil-square me-2"></i>
            Modifier le rendez-vous
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpdateRdv}>
            <Row>
              <Col md={6}>
                <div className="form-group-custom">
                  <Form.Label className="form-label-custom">
                    <i className="bi bi-calendar3 me-2"></i>
                    Date du rendez-vous
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="dateRendezVous"
                    value={editFormData.dateRendezVous}
                    onChange={handleEditChange}
                    className="form-control-custom"
                    required
                  />
                </div>
              </Col>

              <Col md={6}>
                <div className="form-group-custom">
                  <Form.Label className="form-label-custom">
                    <i className="bi bi-clock me-2"></i>
                    Heure du rendez-vous
                  </Form.Label>
                  <Form.Control
                    type="time"
                    name="heureRendezVous"
                    value={editFormData.heureRendezVous}
                    onChange={handleEditChange}
                    className="form-control-custom"
                    required
                  />
                </div>
              </Col>
            </Row>

            <div className="form-group-custom">
              <Form.Label className="form-label-custom">
                <i className="bi bi-file-text me-2"></i>
                Motif du rendez-vous
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="motif"
                value={editFormData.motif}
                onChange={handleEditChange}
                className="form-control-custom"
                required
              />
            </div>

            <div className="form-group-custom">
              <Form.Label className="form-label-custom">
                <i className="bi bi-info-circle me-2"></i>
                Statut
              </Form.Label>
              {/* ✅ Corrigé : valeurs de l'enum */}
              <Form.Select
                name="statut"
                value={editFormData.statut}
                onChange={handleEditChange}
                className="form-control-custom"
              >
                <option value="PLANIFIE">Planifié</option>
                <option value="CONFIRME">Confirmé</option>
                <option value="ANNULE">Annulé</option>
                <option value="TERMINE">Terminé</option>
              </Form.Select>
            </div>

            <div className="modal-actions">
              <Button type="submit" className="btn-save" disabled={loading}>
                <i className="bi bi-check-lg me-2"></i>
                Enregistrer les modifications
              </Button>
              <Button
                variant="outline-secondary"
                onClick={() => setShowEditModal(false)}
                disabled={loading}
              >
                <i className="bi bi-x-lg me-2"></i>
                Annuler
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default RendezVousMedecin;