// src/pages/patient/ProfilPatient.jsx
import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Form } from "react-bootstrap";
import SidebarPatient from "../../components/SidebarPatient";
import api from "../../services/api";
import "./ProfilPatient.css";

function ProfilPatient() {
  const [patient, setPatient] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // ── Mot de passe ──
  const [savingPwd, setSavingPwd] = useState(false);
  const [successPwd, setSuccessPwd] = useState("");
  const [errorPwd, setErrorPwd] = useState("");
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    adresse: "",
    ville: "",
    region: "",
  });

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const profileRes = await api.get("/api/auth/profile");
        const patientRes = await api.get(`/api/patients/byUtilisateur/${profileRes.data.id}`);
        const data = patientRes.data;
        setPatient(data);
        setFormData({
          nom: data.nom || "",
          prenom: data.prenom || "",
          telephone: data.telephone || "",
          adresse: data.adresse || "",
          ville: data.ville || "",
          region: data.region || "",
        });
      } catch (err) {
        console.error("Erreur chargement profil patient:", err);
        setErrorMsg("Impossible de charger le profil.");
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      await api.put(`/api/patients/${patient.id}`, {
        ...formData,
        dateNaissance: patient.dateNaissance,
        sexe: patient.sexe,
        typeDiabete: patient.typeDiabete,
        utilisateurId: patient.utilisateurId,
      });
      setPatient({ ...patient, ...formData });
      setEditMode(false);
      setSuccessMsg("Profil mis à jour avec succès !");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error("Erreur mise à jour:", err);
      setErrorMsg("Erreur lors de la mise à jour. Vérifiez vos informations.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      nom: patient.nom || "",
      prenom: patient.prenom || "",
      telephone: patient.telephone || "",
      adresse: patient.adresse || "",
      ville: patient.ville || "",
      region: patient.region || "",
    });
    setEditMode(false);
    setErrorMsg("");
  };

  // ── Mot de passe ──
  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    setErrorPwd("");
  };

  const toggleShow = (field) => {
    setShowPassword({ ...showPassword, [field]: !showPassword[field] });
  };

  const handleSavePassword = async () => {
    setSuccessPwd("");
    setErrorPwd("");

    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setErrorPwd("Veuillez remplir tous les champs.");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorPwd("Le nouveau mot de passe et sa confirmation ne correspondent pas.");
      return;
    }
    if (passwordData.newPassword.length < 5) {
      setErrorPwd("Le nouveau mot de passe doit contenir au moins 5 caractères.");
      return;
    }

    setSavingPwd(true);
    try {
      await api.put("/api/auth/update-password", {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setSuccessPwd("Mot de passe mis à jour avec succès !");
      setTimeout(() => setSuccessPwd(""), 4000);
    } catch (err) {
      const msg = err?.response?.data?.message || "Ancien mot de passe incorrect.";
      setErrorPwd(msg);
    } finally {
      setSavingPwd(false);
    }
  };

  const getInitiales = () => {
    if (!patient) return "?";
    return `${patient.prenom?.[0] || ""}${patient.nom?.[0] || ""}`.toUpperCase();
  };

  const formatTypeDiabete = (type) => {
    if (!type) return "--";
    return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const getPasswordStrength = (pwd) => {
    if (!pwd) return null;
    if (pwd.length < 5)  return { level: "Faible",    color: "#ef4444", width: "25%"  };
    if (pwd.length < 8)  return { level: "Moyen",     color: "#f59e0b", width: "55%"  };
    if (pwd.length < 12) return { level: "Fort",      color: "#20c997", width: "80%"  };
    return                      { level: "Très fort", color: "#11998e", width: "100%" };
  };

  const strength = getPasswordStrength(passwordData.newPassword);

  if (loading) {
    return (
      <div className="profil-patient-wrapper">
        <SidebarPatient patient={patient} />
        <div className="profil-patient-loading">
          <div className="spinner-border" role="status" />
          <p>Chargement du profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profil-patient-wrapper">
      <SidebarPatient patient={patient} />

      <div className="profil-patient-content">
        <Container fluid className="px-4">

          {/* Alertes profil */}
          {successMsg && (
            <div className="profil-pat-alert success">
              <i className="bi bi-check-circle-fill me-2"></i>{successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="profil-pat-alert error">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>{errorMsg}
            </div>
          )}

          <Row className="g-4">

            {/* ===== COLONNE GAUCHE ===== */}
            <Col xl={4} lg={5}>

              {/* Carte identité */}
              <Card className="profil-pat-identity-card mb-4">
                <div className="profil-pat-identity-header">
                  <div className="profil-pat-avatar">{getInitiales()}</div>
                  <div className="profil-pat-online"></div>
                </div>
                <Card.Body className="profil-pat-identity-body">
                  <h4 className="profil-pat-fullname">
                    {patient?.prenom} {patient?.nom}
                  </h4>
                  <p className="profil-pat-type">
                    {formatTypeDiabete(patient?.typeDiabete)}
                  </p>
                  <span className="profil-pat-badge">
                    <i className="bi bi-heart-pulse-fill me-1"></i>
                    Patient suivi
                  </span>

                  <div className="profil-pat-fixed-info mt-4">
                    <div className="profil-pat-info-row">
                      <div className="profil-pat-info-icon">
                        <i className="bi bi-folder2-fill"></i>
                      </div>
                      <div>
                        <span className="profil-pat-info-label">N° Dossier</span>
                        <span className="profil-pat-info-value">{patient?.numeroDossier}</span>
                      </div>
                    </div>

                    <div className="profil-pat-info-row">
                      <div className="profil-pat-info-icon">
                        <i className="bi bi-gender-ambiguous"></i>
                      </div>
                      <div>
                        <span className="profil-pat-info-label">Sexe</span>
                        <span className="profil-pat-info-value">
                          {patient?.sexe === "MASCULIN" ? "Masculin"
                            : patient?.sexe === "FEMININ" ? "Féminin"
                            : patient?.sexe || "--"}
                        </span>
                      </div>
                    </div>

                    <div className="profil-pat-info-row">
                      <div className="profil-pat-info-icon">
                        <i className="bi bi-calendar3"></i>
                      </div>
                      <div>
                        <span className="profil-pat-info-label">Date de naissance</span>
                        <span className="profil-pat-info-value">
                          {patient?.dateNaissance
                            ? new Date(patient.dateNaissance).toLocaleDateString("fr-FR", {
                                day: "2-digit", month: "long", year: "numeric",
                              })
                            : "--"}
                        </span>
                      </div>
                    </div>

                    <div className="profil-pat-info-row">
                      <div className="profil-pat-info-icon">
                        <i className="bi bi-droplet-half"></i>
                      </div>
                      <div>
                        <span className="profil-pat-info-label">Type de diabète</span>
                        <span className="profil-pat-info-value">
                          {formatTypeDiabete(patient?.typeDiabete)}
                        </span>
                      </div>
                    </div>

                    <div className="profil-pat-info-row">
                      <div className="profil-pat-info-icon">
                        <i className="bi bi-calendar-check"></i>
                      </div>
                      <div>
                        <span className="profil-pat-info-label">Inscrit le</span>
                        <span className="profil-pat-info-value">
                          {patient?.dateEnregistrement
                            ? new Date(patient.dateEnregistrement).toLocaleDateString("fr-FR", {
                                day: "2-digit", month: "long", year: "numeric",
                              })
                            : "--"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              {/* Carte infos non modifiables */}
              <Card className="profil-pat-readonly-card">
                <Card.Body className="p-4">
                  <h6 className="profil-pat-section-title">
                    <i className="bi bi-lock-fill me-2"></i>
                    Informations non modifiables
                  </h6>
                  <p className="profil-pat-readonly-note">
                    Ces informations sont gérées par votre équipe médicale.
                    Contactez votre médecin pour toute modification.
                  </p>
                  <div className="profil-pat-readonly-list">
                    <div className="profil-pat-readonly-item">
                      <span className="profil-pat-readonly-label">N° Dossier</span>
                      <span className="profil-pat-readonly-value">{patient?.numeroDossier}</span>
                    </div>
                    <div className="profil-pat-readonly-item">
                      <span className="profil-pat-readonly-label">Date de naissance</span>
                      <span className="profil-pat-readonly-value">
                        {patient?.dateNaissance
                          ? new Date(patient.dateNaissance).toLocaleDateString("fr-FR")
                          : "--"}
                      </span>
                    </div>
                    <div className="profil-pat-readonly-item">
                      <span className="profil-pat-readonly-label">Sexe</span>
                      <span className="profil-pat-readonly-value">{patient?.sexe || "--"}</span>
                    </div>
                    <div className="profil-pat-readonly-item">
                      <span className="profil-pat-readonly-label">Type de diabète</span>
                      <span className="profil-pat-readonly-value">
                        {formatTypeDiabete(patient?.typeDiabete)}
                      </span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* ===== COLONNE DROITE ===== */}
            <Col xl={8} lg={7}>

              {/* En-tête */}
              <div className="profil-pat-form-header mb-4">
                <div>
                  <h4 className="profil-pat-form-title">Mes informations personnelles</h4>
                  <p className="profil-pat-form-subtitle">
                    Consultez et mettez à jour vos coordonnées
                  </p>
                </div>
                {!editMode ? (
                  <button className="btn-edit-pat" onClick={() => setEditMode(true)}>
                    <i className="bi bi-pencil-fill me-2"></i>Modifier
                  </button>
                ) : (
                  <div className="d-flex gap-2 flex-wrap">
                    <button className="btn-cancel-pat" onClick={handleCancel}>
                      <i className="bi bi-x-lg me-2"></i>Annuler
                    </button>
                    <button className="btn-save-pat" onClick={handleSave} disabled={saving}>
                      {saving
                        ? <><span className="spinner-border spinner-border-sm me-2"></span>Enregistrement...</>
                        : <><i className="bi bi-check-lg me-2"></i>Enregistrer</>
                      }
                    </button>
                  </div>
                )}
              </div>

              {/* Bloc identité */}
              <Card className="profil-pat-form-card mb-4">
                <Card.Body className="p-4">
                  <h6 className="profil-pat-section-title mb-4">
                    <i className="bi bi-person-fill me-2"></i>Identité
                  </h6>
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="profil-pat-label">Prénom</Form.Label>
                        {editMode ? (
                          <Form.Control
                            name="prenom"
                            value={formData.prenom}
                            onChange={handleChange}
                            className="profil-pat-input"
                            placeholder="Votre prénom"
                          />
                        ) : (
                          <div className="profil-pat-display">{patient?.prenom || "--"}</div>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="profil-pat-label">Nom</Form.Label>
                        {editMode ? (
                          <Form.Control
                            name="nom"
                            value={formData.nom}
                            onChange={handleChange}
                            className="profil-pat-input"
                            placeholder="Votre nom"
                          />
                        ) : (
                          <div className="profil-pat-display">{patient?.nom || "--"}</div>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="profil-pat-label">Téléphone</Form.Label>
                        {editMode ? (
                          <Form.Control
                            name="telephone"
                            value={formData.telephone}
                            onChange={handleChange}
                            className="profil-pat-input"
                            placeholder="+221 77 000 00 00"
                          />
                        ) : (
                          <div className="profil-pat-display">
                            <i className="bi bi-telephone me-2 text-success"></i>
                            {patient?.telephone || "--"}
                          </div>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Bloc localisation */}
              <Card className="profil-pat-form-card mb-4">
                <Card.Body className="p-4">
                  <h6 className="profil-pat-section-title mb-4">
                    <i className="bi bi-geo-alt-fill me-2"></i>Localisation
                  </h6>
                  <Row className="g-3">
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label className="profil-pat-label">Adresse</Form.Label>
                        {editMode ? (
                          <Form.Control
                            name="adresse"
                            value={formData.adresse}
                            onChange={handleChange}
                            className="profil-pat-input"
                            placeholder="Votre adresse"
                          />
                        ) : (
                          <div className="profil-pat-display">
                            <i className="bi bi-house me-2 text-success"></i>
                            {patient?.adresse || "--"}
                          </div>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="profil-pat-label">Ville</Form.Label>
                        {editMode ? (
                          <Form.Control
                            name="ville"
                            value={formData.ville}
                            onChange={handleChange}
                            className="profil-pat-input"
                            placeholder="Ex: Dakar"
                          />
                        ) : (
                          <div className="profil-pat-display">{patient?.ville || "--"}</div>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="profil-pat-label">Région</Form.Label>
                        {editMode ? (
                          <Form.Control
                            name="region"
                            value={formData.region}
                            onChange={handleChange}
                            className="profil-pat-input"
                            placeholder="Ex: Dakar"
                          />
                        ) : (
                          <div className="profil-pat-display">{patient?.region || "--"}</div>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  {editMode && (
                    <div className="profil-pat-form-actions mt-4">
                      <button className="btn-cancel-pat" onClick={handleCancel}>
                        <i className="bi bi-x-lg me-2"></i>Annuler
                      </button>
                      <button className="btn-save-pat" onClick={handleSave} disabled={saving}>
                        {saving
                          ? <><span className="spinner-border spinner-border-sm me-2"></span>Enregistrement...</>
                          : <><i className="bi bi-check-lg me-2"></i>Enregistrer les modifications</>
                        }
                      </button>
                    </div>
                  )}
                </Card.Body>
              </Card>

              {/* ===== BLOC MOT DE PASSE ===== */}
              <Card className="profil-pat-form-card profil-pat-pwd-card">
                <Card.Body className="p-4">
                  <h6 className="profil-pat-section-title mb-4">
                    <i className="bi bi-key-fill me-2"></i>Changer le mot de passe
                  </h6>

                  {/* Alertes mot de passe */}
                  {successPwd && (
                    <div className="profil-pat-alert success mb-3">
                      <i className="bi bi-check-circle-fill me-2"></i>{successPwd}
                    </div>
                  )}
                  {errorPwd && (
                    <div className="profil-pat-alert error mb-3">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>{errorPwd}
                    </div>
                  )}

                  <Row className="g-3">

                    {/* Ancien mot de passe */}
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label className="profil-pat-label">
                          <i className="bi bi-lock me-1"></i>Mot de passe actuel
                        </Form.Label>
                        <div className="profil-pat-pwd-wrapper">
                          <Form.Control
                            type={showPassword.old ? "text" : "password"}
                            name="oldPassword"
                            value={passwordData.oldPassword}
                            onChange={handlePasswordChange}
                            className="profil-pat-input profil-pat-input-pwd"
                            placeholder="Entrez votre mot de passe actuel"
                          />
                          <button type="button" className="profil-pat-pwd-toggle" onClick={() => toggleShow("old")}>
                            <i className={`bi bi-eye${showPassword.old ? "-slash" : ""}`}></i>
                          </button>
                        </div>
                      </Form.Group>
                    </Col>

                    {/* Nouveau mot de passe */}
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="profil-pat-label">
                          <i className="bi bi-lock-fill me-1"></i>Nouveau mot de passe
                        </Form.Label>
                        <div className="profil-pat-pwd-wrapper">
                          <Form.Control
                            type={showPassword.new ? "text" : "password"}
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            className="profil-pat-input profil-pat-input-pwd"
                            placeholder="Minimum 5 caractères"
                          />
                          <button type="button" className="profil-pat-pwd-toggle" onClick={() => toggleShow("new")}>
                            <i className={`bi bi-eye${showPassword.new ? "-slash" : ""}`}></i>
                          </button>
                        </div>
                        {passwordData.newPassword && strength && (
                          <div className="profil-pat-strength mt-2">
                            <div className="profil-pat-strength-bar">
                              <div className="profil-pat-strength-fill"
                                style={{ width: strength.width, background: strength.color }}>
                              </div>
                            </div>
                            <span className="profil-pat-strength-label" style={{ color: strength.color }}>
                              {strength.level}
                            </span>
                          </div>
                        )}
                      </Form.Group>
                    </Col>

                    {/* Confirmation */}
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="profil-pat-label">
                          <i className="bi bi-lock-fill me-1"></i>Confirmer le mot de passe
                        </Form.Label>
                        <div className="profil-pat-pwd-wrapper">
                          <Form.Control
                            type={showPassword.confirm ? "text" : "password"}
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            className={`profil-pat-input profil-pat-input-pwd${
                              passwordData.confirmPassword
                                ? passwordData.newPassword !== passwordData.confirmPassword
                                  ? " profil-pat-input-error"
                                  : " profil-pat-input-success"
                                : ""
                            }`}
                            placeholder="Répétez le nouveau mot de passe"
                          />
                          <button type="button" className="profil-pat-pwd-toggle" onClick={() => toggleShow("confirm")}>
                            <i className={`bi bi-eye${showPassword.confirm ? "-slash" : ""}`}></i>
                          </button>
                        </div>
                        {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                          <small className="profil-pat-field-msg profil-pat-field-msg--error">
                            <i className="bi bi-x-circle me-1"></i>Les mots de passe ne correspondent pas
                          </small>
                        )}
                        {passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword && (
                          <small className="profil-pat-field-msg profil-pat-field-msg--success">
                            <i className="bi bi-check-circle me-1"></i>Les mots de passe correspondent
                          </small>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Conseil sécurité */}
                  <div className="profil-pat-security-tip mt-3">
                    <i className="bi bi-lightbulb-fill me-2"></i>
                    Utilisez au moins 8 caractères, mélangez lettres, chiffres et symboles pour un mot de passe sécurisé.
                  </div>

                  {/* Actions */}
                  <div className="profil-pat-form-actions mt-4">
                    <button
                      className="btn-cancel-pat"
                      onClick={() => {
                        setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
                        setErrorPwd("");
                        setSuccessPwd("");
                      }}
                    >
                      <i className="bi bi-x-lg me-2"></i>Réinitialiser
                    </button>
                    <button className="btn-save-pat" onClick={handleSavePassword} disabled={savingPwd}>
                      {savingPwd
                        ? <><span className="spinner-border spinner-border-sm me-2"></span>Enregistrement...</>
                        : <><i className="bi bi-key-fill me-2"></i>Mettre à jour le mot de passe</>
                      }
                    </button>
                  </div>
                </Card.Body>
              </Card>

            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
}

export default ProfilPatient;