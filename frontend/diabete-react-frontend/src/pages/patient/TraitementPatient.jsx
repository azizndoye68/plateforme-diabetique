// src/pages/patient/TraitementPatient.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  Card,
  Form,
  Spinner,
  Badge,
} from "react-bootstrap";
import api from "../../services/api";
import SidebarPatient from "../../components/SidebarPatient";
import "./TraitementPatient.css";

function TraitementPatient() {

  const [patient, setPatient] = useState(null);
  const [dossier, setDossier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    traitement: "NON",
    antecedents: "",
    allergies: "",
    notesMedicales: "",
  });

  const [originalData, setOriginalData] = useState({ ...formData });
  // Dans le composant, ajoute :
  const { patientId } = useParams();

  // Remplace tout le useEffect fetchData par :
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let patientData;

        if (patientId) {
          // Vue médecin : on récupère directement le patient par son ID
          const patientRes = await api.get(`/api/patients/${patientId}`);
          patientData = patientRes.data;
        } else {
          // Vue patient : on passe par le profil connecté
          const profileRes = await api.get("/api/auth/profile");
          const patientRes = await api.get(
            `/api/patients/byUtilisateur/${profileRes.data.id}`,
          );
          patientData = patientRes.data;
        }

        setPatient(patientData);

        try {
          const dossierRes = await api.get(
            `/api/dossiers/patient/${patientData.id}`,
          );
          setDossier(dossierRes.data);
          const loaded = {
            traitement: dossierRes.data.traitement || "NON",
            antecedents: dossierRes.data.antecedents || "",
            allergies: dossierRes.data.allergies || "",
            notesMedicales: dossierRes.data.notesMedicales || "",
          };
          setFormData(loaded);
          setOriginalData(loaded);
        } catch {
          setDossier(null);
        }
      } catch (error) {
        console.error("Erreur chargement dossier médical", error);
        setErrorMsg("Impossible de charger le dossier médical.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [patientId]);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      if (dossier?.id) {
        await api.put(`/api/dossiers/${dossier.id}`, {
          ...formData,
          patientId: patient.id,
        });
      } else {
        const res = await api.post("/api/dossiers", {
          ...formData,
          patientId: patient.id,
        });
        setDossier(res.data);
      }
      setOriginalData({ ...formData });
      setEditMode(false);
      setSuccessMsg("Dossier médical mis à jour avec succès !");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (error) {
      console.error(error);
      setErrorMsg("Erreur lors de l'enregistrement. Veuillez réessayer.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({ ...originalData });
    setEditMode(false);
    setErrorMsg("");
  };

  if (loading) {
    return (
      <div className="tp-loading-wrapper">
        <SidebarPatient patient={null} isMedecin={!!patientId} />
        <div className="tp-loading-content">
          <Spinner animation="border" className="tp-spinner" />
          <p>Chargement du dossier médical...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tp-wrapper">
      <SidebarPatient patient={patient} isMedecin={!!patientId} />

      <div className="tp-main">
        <div className="tp-container">
          {/* Alertes */}
          {successMsg && (
            <div className="tp-alert tp-alert-success">
              <i className="bi bi-check-circle-fill me-2"></i>
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="tp-alert tp-alert-error">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {errorMsg}
            </div>
          )}

          {/* En-tête */}
          <div className="tp-header">
            <div className="tp-header-left">
              <div className="tp-header-icon">
                <i className="bi bi-prescription2"></i>
              </div>
              <div>
                <h2 className="tp-header-title">Mes informations médicales</h2>
                <p className="tp-header-subtitle">
                  <i className="bi bi-person-badge me-2"></i>
                  {patient?.prenom} {patient?.nom}
                  {patient?.typeDiabete && (
                    <Badge bg="info" className="ms-2 tp-type-badge">
                      {patient.typeDiabete}
                    </Badge>
                  )}
                </p>
              </div>
            </div>
            <div className="tp-header-actions">
              {!editMode ? (
                <button
                  className="tp-btn-edit"
                  onClick={() => setEditMode(true)}
                >
                  <i className="bi bi-pencil-fill me-2"></i>Modifier
                </button>
              ) : (
                <div className="d-flex gap-2 flex-wrap">
                  <button className="tp-btn-cancel" onClick={handleCancel}>
                    <i className="bi bi-x-lg me-2"></i>Annuler
                  </button>
                  <button
                    className="tp-btn-save"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-lg me-2"></i>Enregistrer
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Formulaire */}
          <Card className="tp-form-card mb-4">
            <Card.Body className="tp-card-body">
              <div className="tp-form-section-header">
                <div className="tp-section-icon">
                  <i className="bi bi-file-medical"></i>
                </div>
                <div>
                  <h5 className="tp-section-title">
                    Informations thérapeutiques
                  </h5>
                  <p className="tp-section-subtitle">
                    {editMode
                      ? "Modifiez vos informations médicales"
                      : "Consultez votre dossier médical"}
                  </p>
                </div>
              </div>

              {/* Traitement insuline */}
              <div className="tp-form-group">
                <label className="tp-label">
                  <i className="bi bi-capsule me-2"></i>
                  Traitement par insuline
                </label>
                {editMode ? (
                  <div className="tp-radio-group">
                    <div
                      className={`tp-radio-option ${formData.traitement === "OUI" ? "active" : ""}`}
                      onClick={() =>
                        setFormData({ ...formData, traitement: "OUI" })
                      }
                    >
                      <Form.Check
                        type="radio"
                        id="tp-oui"
                        name="traitement"
                        value="OUI"
                        checked={formData.traitement === "OUI"}
                        onChange={handleChange}
                        label={
                          <div className="tp-radio-label">
                            <i className="bi bi-check-circle"></i>
                            <span>Oui, sous insuline</span>
                          </div>
                        }
                      />
                    </div>
                    <div
                      className={`tp-radio-option ${formData.traitement === "NON" ? "active" : ""}`}
                      onClick={() =>
                        setFormData({ ...formData, traitement: "NON" })
                      }
                    >
                      <Form.Check
                        type="radio"
                        id="tp-non"
                        name="traitement"
                        value="NON"
                        checked={formData.traitement === "NON"}
                        onChange={handleChange}
                        label={
                          <div className="tp-radio-label">
                            <i className="bi bi-x-circle"></i>
                            <span>Non, pas d'insuline</span>
                          </div>
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <div
                    className={`tp-display-badge ${formData.traitement === "OUI" ? "oui" : "non"}`}
                  >
                    <i
                      className={`bi bi-${formData.traitement === "OUI" ? "check-circle-fill" : "x-circle-fill"} me-2`}
                    ></i>
                    {formData.traitement === "OUI"
                      ? "Sous insuline"
                      : "Pas d'insuline"}
                  </div>
                )}
              </div>

              {/* Antécédents */}
              <div className="tp-form-group">
                <label className="tp-label">
                  <i className="bi bi-clock-history me-2"></i>
                  Antécédents médicaux
                </label>
                {editMode ? (
                  <>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="antecedents"
                      value={formData.antecedents}
                      onChange={handleChange}
                      className="tp-input"
                      placeholder="Historique médical, maladies chroniques, chirurgies antérieures..."
                    />
                    <small className="tp-hint">
                      <i className="bi bi-info-circle me-1"></i>
                      Indiquez vos antécédents médicaux pertinents
                    </small>
                  </>
                ) : (
                  <div className="tp-display-text">
                    {formData.antecedents || (
                      <span className="tp-empty">
                        Aucun antécédent renseigné
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Allergies */}
              <div className="tp-form-group">
                <label className="tp-label">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Allergies connues
                </label>
                {editMode ? (
                  <>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="allergies"
                      value={formData.allergies}
                      onChange={handleChange}
                      className="tp-input"
                      placeholder="Allergies médicamenteuses, alimentaires ou autres..."
                    />
                    <small className="tp-hint">
                      <i className="bi bi-info-circle me-1"></i>
                      Listez toutes vos allergies connues
                    </small>
                  </>
                ) : (
                  <div className="tp-display-text">
                    {formData.allergies || (
                      <span className="tp-empty">
                        Aucune allergie renseignée
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Notes médicales */}
              <div className="tp-form-group">
                <label className="tp-label">
                  <i className="bi bi-journal-medical me-2"></i>
                  Notes médicales complémentaires
                </label>
                {editMode ? (
                  <>
                    <Form.Control
                      as="textarea"
                      rows={5}
                      name="notesMedicales"
                      value={formData.notesMedicales}
                      onChange={handleChange}
                      className="tp-input"
                      placeholder="Observations, recommandations, plan de traitement..."
                    />
                    <small className="tp-hint">
                      <i className="bi bi-info-circle me-1"></i>
                      Ajoutez vos observations personnelles
                    </small>
                  </>
                ) : (
                  <div className="tp-display-text">
                    {formData.notesMedicales || (
                      <span className="tp-empty">
                        Aucune note médicale renseignée
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Actions bas si edit mode */}
              {editMode && (
                <div className="tp-form-actions">
                  <button className="tp-btn-cancel" onClick={handleCancel}>
                    <i className="bi bi-x-lg me-2"></i>Annuler
                  </button>
                  <button
                    className="tp-btn-save"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-lg me-2"></i>Enregistrer les
                        modifications
                      </>
                    )}
                  </button>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Info cards */}
          <div className="tp-info-cards">
            <div className="tp-info-card">
              <div
                className="tp-info-icon"
                style={{
                  background:
                    "linear-gradient(135deg, #38ef7d 0%, #11998e 100%)",
                }}
              >
                <i className="bi bi-shield-check"></i>
              </div>
              <div className="tp-info-content">
                <h6>Données sécurisées</h6>
                <p>
                  Vos informations médicales sont cryptées et confidentielles
                </p>
              </div>
            </div>
            <div className="tp-info-card">
              <div
                className="tp-info-icon"
                style={{
                  background:
                    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                }}
              >
                <i className="bi bi-clock-history"></i>
              </div>
              <div className="tp-info-content">
                <h6>Historique complet</h6>
                <p>Toutes les modifications sont enregistrées et traçables</p>
              </div>
            </div>
            <div className="tp-info-card">
              <div
                className="tp-info-icon"
                style={{
                  background:
                    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
                }}
              >
                <i className="bi bi-person-check"></i>
              </div>
              <div className="tp-info-content">
                <h6>Partagé avec votre médecin</h6>
                <p>Votre médecin référent a accès à ces informations</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TraitementPatient;
