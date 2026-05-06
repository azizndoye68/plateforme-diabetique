// src/pages/Consultations.jsx
import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Form, Button, Table, Spinner, Badge, Modal } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import SidebarPatient from "../../components/SidebarPatient";
import "./ConsultationsMedecin.css";

function Consultations() {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [medecin, setMedecin] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPatient, setLoadingPatient] = useState(true);
  const [medecinId, setMedecinId] = useState(null);
  const [success, setSuccess] = useState(false);
  const [lastConsultDate, setLastConsultDate] = useState(null);
  const [showOrdonnance, setShowOrdonnance] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState(null);

  const [formData, setFormData] = useState({
    motif: "",
    diagnostic: "",
    prescription: "",
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
        setMedecin(medRes.data);

        if (!patientId) throw new Error("Patient ID manquant dans l'URL !");
        const resPatient = await api.get(`/api/patients/${patientId}`);
        setPatient(resPatient.data);

        const resConsult = await api.get(`/api/consultations/patient/${patientId}`);
        const sortedConsults = resConsult.data.sort(
          (a, b) => new Date(b.dateConsultation) - new Date(a.dateConsultation)
        );
        setConsultations(sortedConsults);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!patientId || !medecinId) {
      return alert("Impossible d'enregistrer : patient ou médecin non défini");
    }

    try {
      setLoading(true);

      const res = await api.post("/api/consultations", {
        ...formData,
        patientId: patientId,
        medecinId: medecinId,
      });

      setLastConsultDate(new Date(res.data.dateConsultation));
      setSuccess(true);

      setFormData({ motif: "", diagnostic: "", prescription: "" });

      const resConsult = await api.get(`/api/consultations/patient/${patientId}`);
      const sortedConsults = resConsult.data.sort(
        (a, b) => new Date(b.dateConsultation) - new Date(a.dateConsultation)
      );
      setConsultations(sortedConsults);

    } catch (error) {
      console.error("Erreur lors de l'enregistrement :", error);
      alert("Erreur lors de l'enregistrement ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateOrdonnance = (consultation) => {
    setSelectedConsultation(consultation);
    setShowOrdonnance(true);
  };

  const printOrdonnance = () => {
    const printContents = document.getElementById('ordonnance-print').innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  if (loadingPatient) {
    return (
      <div className="consultation-loading">
        <div className="loading-content">
          <Spinner animation="border" variant="primary" className="loading-spinner" />
          <p className="loading-text">Chargement des consultations...</p>
        </div>
      </div>
    );
  }

  const SuccessScreen = () => (
    <Card className="success-card-consultation">
      <Card.Body className="text-center p-5">
        <div className="success-icon-wrapper">
          <i className="bi bi-check-circle-fill"></i>
        </div>
        <h4 className="success-title">Consultation enregistrée avec succès !</h4>
        <p className="success-text">
          La consultation a été ajoutée le{" "}
          <strong>{lastConsultDate?.toLocaleDateString("fr-FR")}</strong> à{" "}
          <strong>{lastConsultDate?.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</strong>
        </p>
        <div className="success-actions">
          <Button className="btn-success-action primary" onClick={() => setSuccess(false)}>
            <i className="bi bi-plus-circle me-2"></i>
            Ajouter une autre consultation
          </Button>
          <Button
            className="btn-success-action secondary"
            onClick={() => navigate(`/medecin/patient/${patientId}/dashboard`)}
          >
            <i className="bi bi-house me-2"></i>
            Retour au dossier patient
          </Button>
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <>
      <Container fluid className="p-0">
        <Row className="g-0 consultation-row">
          <Col xs={12} md={3} className="sidebar-col p-0">
            <SidebarPatient patient={patient} isMedecin={true} />
          </Col>

          <Col xs={12} md={9} className="main-col consultations-medecin-page">
            <div className="consultation-container">
              {/* En-tête */}
              <div className="consultation-header">
                <div className="header-content">
                  <div className="header-icon">
                    <i className="bi bi-clipboard2-pulse"></i>
                  </div>
                  <div className="header-info">
                    <h2 className="header-title">Consultations Médicales</h2>
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

              {/* Formulaire ou succès */}
              {!success ? (
                <Card className="consultation-form-card">
                  <Card.Body className="card-body-custom">
                    <div className="form-section-header">
                      <div className="section-icon">
                        <i className="bi bi-file-earmark-medical"></i>
                      </div>
                      <div>
                        <h5 className="section-title">Nouvelle consultation</h5>
                        <p className="section-subtitle">
                          Enregistrez les détails de la consultation médicale
                        </p>
                      </div>
                    </div>

                    <Form onSubmit={handleSubmit}>
                      <div className="form-group-custom">
                        <Form.Label className="form-label-custom">
                          <i className="bi bi-file-text me-2"></i>
                          Motif de la consultation
                          <span className="text-danger ms-1">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="motif"
                          value={formData.motif}
                          onChange={handleChange}
                          className="form-control-custom"
                          placeholder="Ex: Suivi diabète, contrôle glycémie, bilan de santé..."
                          required
                        />
                      </div>

                      <div className="form-group-custom">
                        <Form.Label className="form-label-custom">
                          <i className="bi bi-clipboard-check me-2"></i>
                          Diagnostic
                          <span className="text-danger ms-1">*</span>
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={4}
                          name="diagnostic"
                          value={formData.diagnostic}
                          onChange={handleChange}
                          className="form-control-custom"
                          placeholder="Observations cliniques, résultats d'examens, conclusions..."
                          required
                        />
                      </div>

                      <div className="form-group-custom">
                        <Form.Label className="form-label-custom">
                          <i className="bi bi-prescription2 me-2"></i>
                          Prescription / Recommandations
                          <span className="text-danger ms-1">*</span>
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={4}
                          name="prescription"
                          value={formData.prescription}
                          onChange={handleChange}
                          className="form-control-custom"
                          placeholder="Médicaments prescrits, posologie, conseils hygiéno-diététiques..."
                          required
                        />
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
                              Enregistrer la consultation
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
              ) : (
                <SuccessScreen />
              )}

              {/* Historique */}
              <Card className="history-card">
                <Card.Body className="card-body-custom">
                  <div className="history-header">
                    <div>
                      <h5 className="history-title">
                        <i className="bi bi-clock-history me-2"></i>
                        Historique des consultations
                      </h5>
                      <p className="history-subtitle">
                        {consultations.length} consultation(s) enregistrée(s)
                      </p>
                    </div>
                  </div>

                  <div className="table-responsive">
                    <Table hover className="consultation-table">
                      <thead>
                        <tr>
                          <th>Date & Heure</th>
                          <th>Motif</th>
                          <th>Diagnostic</th>
                          <th>Prescription</th>
                          <th className="text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {consultations.length > 0 ? (
                          consultations.map((c) => (
                            <tr key={c.id}>
                              <td>
                                <div className="date-cell">
                                  <i className="bi bi-calendar3 me-2"></i>
                                  {new Date(c.dateConsultation).toLocaleDateString("fr-FR")}
                                  <br />
                                  <small className="text-muted">
                                    {new Date(c.dateConsultation).toLocaleTimeString("fr-FR", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </small>
                                </div>
                              </td>
                              <td>
                                <span className="motif-badge">{c.motif || "-"}</span>
                              </td>
                              <td className="diagnostic-cell">{c.diagnostic || "-"}</td>
                              <td className="prescription-cell">{c.prescription || "-"}</td>
                              <td className="text-center">
                                <Button
                                  size="sm"
                                  className="btn-ordonnance"
                                  onClick={() => handleGenerateOrdonnance(c)}
                                >
                                  <i className="bi bi-file-earmark-text me-1"></i>
                                  Ordonnance
                                </Button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="text-center empty-state">
                              <i className="bi bi-inbox" style={{ fontSize: "2rem", opacity: 0.3 }}></i>
                              <p className="mt-2 mb-0">Aucune consultation enregistrée.</p>
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

      {/* Modal Ordonnance */}
      <Modal show={showOrdonnance} onHide={() => setShowOrdonnance(false)} size="lg" className="ordonnance-modal">
        <Modal.Body className="p-0">
          <div className="ordonnance-container" id="ordonnance-print">
            <div className="ordonnance-header-print">
              <div className="ordonnance-logo">
                <i className="bi bi-hospital"></i>
              </div>
              <div className="ordonnance-medecin-info">
                <h4>Dr. {medecin?.prenom} {medecin?.nom}</h4>
                <p>{medecin?.specialite || "Médecin généraliste"}</p>
                {medecin?.telephone && <p><i className="bi bi-telephone"></i> {medecin.telephone}</p>}
                {medecin?.adresse && <p><i className="bi bi-geo-alt"></i> {medecin.adresse}</p>}
              </div>
            </div>

            <div className="ordonnance-divider"></div>

            <div className="ordonnance-patient-info">
              <h5>Informations Patient</h5>
              <Row>
                <Col md={6}>
                  <p><strong>Nom complet :</strong> {patient?.prenom} {patient?.nom}</p>
                  <p><strong>Date de naissance :</strong> {patient?.dateNaissance ? new Date(patient.dateNaissance).toLocaleDateString("fr-FR") : "-"}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Type de diabète :</strong> {patient?.typeDiabete || "-"}</p>
                  <p><strong>Date :</strong> {selectedConsultation ? new Date(selectedConsultation.dateConsultation).toLocaleDateString("fr-FR") : "-"}</p>
                </Col>
              </Row>
            </div>

            <div className="ordonnance-content">
              <div className="ordonnance-section">
                <h6><i className="bi bi-prescription2 me-2"></i>Ordonnance Médicale</h6>
                <div className="prescription-box">
                  {selectedConsultation?.prescription}
                </div>
              </div>
            </div>

            <div className="ordonnance-footer">
              <div className="signature-section">
                <p className="mb-1">Fait le {new Date().toLocaleDateString("fr-FR")}</p>
                <p className="signature-line">Signature et cachet du médecin</p>
              </div>
            </div>
          </div>

          <div className="ordonnance-actions no-print">
            <Button className="btn-print" onClick={printOrdonnance}>
              <i className="bi bi-printer me-2"></i>
              Imprimer l'ordonnance
            </Button>
            <Button variant="outline-secondary" onClick={() => setShowOrdonnance(false)}>
              <i className="bi bi-x-lg me-2"></i>
              Fermer
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default Consultations;