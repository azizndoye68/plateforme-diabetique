// src/pages/TraitementMedecin.jsx
import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
  Alert,
  Badge,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import SidebarPatient from "../../components/SidebarPatient";
import "./TraitementMedecin.css";

function TraitementMedecin() {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [dossier, setDossier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    traitement: "NON",
    antecedents: "",
    allergies: "",
    notesMedicales: "",
  });

  // 🔹 Chargement patient + dossier médical
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Patient
        const resPatient = await api.get(`/api/patients/${patientId}`);
        setPatient(resPatient.data);

        // Dossier médical
        try {
          const resDossier = await api.get(
            `/api/dossiers/patient/${patientId}`
          );
          setDossier(resDossier.data);
          setFormData({
            traitement: resDossier.data.traitement || "NON",
            antecedents: resDossier.data.antecedents || "",
            allergies: resDossier.data.allergies || "",
            notesMedicales: resDossier.data.notesMedicales || "",
          });
        } catch {
          setDossier(null);
        }
      } catch (error) {
        console.error("Erreur chargement dossier médical", error);
        alert("Impossible de charger le dossier médical");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [patientId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (dossier?.id) {
        await api.put(`/api/dossiers/${dossier.id}`, {
          ...formData,
          patientId,
        });
      } else {
        const res = await api.post("/api/dossiers", { ...formData, patientId });
        setDossier(res.data);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3500);
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'enregistrement du dossier ❌");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="traitement-loading">
        <div className="loading-content">
          <Spinner animation="border" variant="primary" className="loading-spinner" />
          <p className="loading-text">Chargement du dossier médical...</p>
        </div>
      </div>
    );
  }

  return (
    <Container fluid className="p-0">
      <Row className="g-0 traitement-row">
        {/* Sidebar */}
        <Col xs={12} md={3} className="sidebar-col p-0">
          <SidebarPatient patient={patient} isMedecin />
        </Col>

        {/* Contenu principal */}
        <Col xs={12} md={9} className="main-col traitement-medecin-page">
          <div className="traitement-container">
            {/* En-tête */}
            <div className="traitement-header">
              <div className="header-content">
                <div className="header-icon">
                  <i className="bi bi-prescription2"></i>
                </div>
                <div className="header-info">
                  <h2 className="header-title">Dossier Médical et Traitement</h2>
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
              <Alert variant="success" className="success-alert">
                <div className="alert-content">
                  <i className="bi bi-check-circle-fill alert-icon"></i>
                  <div className="alert-text">
                    <strong>Dossier médical mis à jour</strong>
                    <div className="text-muted small">
                      Les informations thérapeutiques ont été enregistrées avec succès.
                    </div>
                  </div>
                </div>
              </Alert>
            )}

            {/* Formulaire principal */}
            <Card className="traitement-form-card">
              <Card.Body className="card-body-custom">
                <div className="form-section-header">
                  <div className="section-icon">
                    <i className="bi bi-file-medical"></i>
                  </div>
                  <div>
                    <h5 className="section-title">
                      {dossier ? "Modification du traitement" : "Création du dossier médical"}
                    </h5>
                    <p className="section-subtitle">
                      Renseignez les informations thérapeutiques du patient
                    </p>
                  </div>
                </div>

                <Form onSubmit={handleSubmit}>
                  {/* Sous insuline */}
                  <div className="form-group-custom">
                    <Form.Label className="form-label-custom">
                      <i className="bi bi-capsule me-2"></i>
                      Traitement par insuline
                      <span className="text-danger ms-1">*</span>
                    </Form.Label>
                    <div className="radio-group">
                      <div 
                        className={`radio-option ${formData.traitement === "OUI" ? "active" : ""}`}
                        onClick={() => setFormData({ ...formData, traitement: "OUI" })}
                      >
                        <Form.Check
                          type="radio"
                          id="traitement-oui"
                          name="traitement"
                          value="OUI"
                          checked={formData.traitement === "OUI"}
                          onChange={handleChange}
                          label={
                            <div className="radio-label">
                              <i className="bi bi-check-circle"></i>
                              <span>Oui, sous insuline</span>
                            </div>
                          }
                        />
                      </div>
                      <div 
                        className={`radio-option ${formData.traitement === "NON" ? "active" : ""}`}
                        onClick={() => setFormData({ ...formData, traitement: "NON" })}
                      >
                        <Form.Check
                          type="radio"
                          id="traitement-non"
                          name="traitement"
                          value="NON"
                          checked={formData.traitement === "NON"}
                          onChange={handleChange}
                          label={
                            <div className="radio-label">
                              <i className="bi bi-x-circle"></i>
                              <span>Non, pas d'insuline</span>
                            </div>
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Antécédents */}
                  <div className="form-group-custom">
                    <Form.Label className="form-label-custom">
                      <i className="bi bi-clock-history me-2"></i>
                      Antécédents médicaux
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="antecedents"
                      value={formData.antecedents}
                      onChange={handleChange}
                      className="form-control-custom"
                      placeholder="Historique médical, maladies chroniques, chirurgies antérieures..."
                    />
                    <small className="form-text-muted">
                      <i className="bi bi-info-circle me-1"></i>
                      Indiquez les antécédents médicaux pertinents
                    </small>
                  </div>

                  {/* Allergies */}
                  <div className="form-group-custom">
                    <Form.Label className="form-label-custom">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      Allergies connues
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="allergies"
                      value={formData.allergies}
                      onChange={handleChange}
                      className="form-control-custom"
                      placeholder="Allergies médicamenteuses, alimentaires ou autres..."
                    />
                    <small className="form-text-muted">
                      <i className="bi bi-info-circle me-1"></i>
                      Listez toutes les allergies identifiées
                    </small>
                  </div>

                  {/* Notes médicales */}
                  <div className="form-group-custom">
                    <Form.Label className="form-label-custom">
                      <i className="bi bi-journal-medical me-2"></i>
                      Notes médicales complémentaires
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={5}
                      name="notesMedicales"
                      value={formData.notesMedicales}
                      onChange={handleChange}
                      className="form-control-custom"
                      placeholder="Observations, recommandations, plan de traitement..."
                    />
                    <small className="form-text-muted">
                      <i className="bi bi-info-circle me-1"></i>
                      Ajoutez vos observations et recommandations pour le suivi
                    </small>
                  </div>

                  {/* Boutons d'action */}
                  <div className="form-actions">
                    <Button 
                      type="submit" 
                      className="btn-save"
                      disabled={saving}
                    >
                      {saving ? (
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
                          {dossier ? "Mettre à jour le traitement" : "Enregistrer le dossier"}
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline-secondary"
                      className="btn-cancel"
                      onClick={() => navigate(`/medecin/patient/${patientId}/dashboard`)}
                      disabled={saving}
                    >
                      <i className="bi bi-x-lg me-2"></i>
                      Annuler
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>

            {/* Info card */}
            <div className="info-cards-row">
              <div className="info-card">
                <div className="info-card-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <i className="bi bi-shield-check"></i>
                </div>
                <div className="info-card-content">
                  <h6>Données sécurisées</h6>
                  <p>Les informations médicales sont cryptées et confidentielles</p>
                </div>
              </div>

              <div className="info-card">
                <div className="info-card-icon" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
                  <i className="bi bi-clock-history"></i>
                </div>
                <div className="info-card-content">
                  <h6>Historique complet</h6>
                  <p>Toutes les modifications sont enregistrées et traçables</p>
                </div>
              </div>

              <div className="info-card">
                <div className="info-card-icon" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
                  <i className="bi bi-bell"></i>
                </div>
                <div className="info-card-content">
                  <h6>Notifications</h6>
                  <p>Le patient sera informé des mises à jour importantes</p>
                </div>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default TraitementMedecin;