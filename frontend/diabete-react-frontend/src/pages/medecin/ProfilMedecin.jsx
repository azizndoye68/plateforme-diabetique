// src/pages/medecin/ProfilMedecin.jsx
import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Form, Badge } from "react-bootstrap";
import TopbarMedecin from "../../components/TopbarMedecin";
import api from "../../services/api";
import "./ProfilMedecin.css";

function ProfilMedecin() {
  const [medecin, setMedecin] = useState(null);
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
    specialite: "",
    nomService: "",
    adresse: "",
    ville: "",
    region: "",
  });

  useEffect(() => {
    const fetchMedecin = async () => {
      try {
        const profileRes = await api.get("/api/auth/profile");
        const medRes = await api.get(`/api/medecins/byUtilisateur/${profileRes.data.id}`);
        const data = medRes.data;
        setMedecin(data);
        setFormData({
          nom: data.nom || "",
          prenom: data.prenom || "",
          telephone: data.telephone || "",
          specialite: data.specialite || "",
          nomService: data.nomService || "",
          adresse: data.adresse || "",
          ville: data.ville || "",
          region: data.region || "",
        });
      } catch (err) {
        console.error("Erreur chargement profil:", err);
        setErrorMsg("Impossible de charger le profil.");
      } finally {
        setLoading(false);
      }
    };
    fetchMedecin();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      await api.put(`/api/medecins/${medecin.id}`, formData);
      setMedecin({ ...medecin, ...formData });
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
      nom: medecin.nom || "",
      prenom: medecin.prenom || "",
      telephone: medecin.telephone || "",
      specialite: medecin.specialite || "",
      nomService: medecin.nomService || "",
      adresse: medecin.adresse || "",
      ville: medecin.ville || "",
      region: medecin.region || "",
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
    if (!medecin) return "?";
    return `${medecin.prenom?.[0] || ""}${medecin.nom?.[0] || ""}`.toUpperCase();
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
      <div className="profil-medecin-wrapper">
        <TopbarMedecin user={medecin} />
        <div className="profil-loading">
          <div className="spinner-border text-success" role="status" />
          <p>Chargement du profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profil-medecin-wrapper">
      <TopbarMedecin user={medecin} />

      <div className="profil-medecin-content">
        <Container fluid className="px-4">

          {/* Messages profil */}
          {successMsg && (
            <div className="profil-alert profil-alert-success">
              <i className="bi bi-check-circle-fill me-2"></i>{successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="profil-alert profil-alert-error">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>{errorMsg}
            </div>
          )}

          <Row className="g-4">

            {/* ===== COLONNE GAUCHE : carte identité ===== */}
            <Col xl={4} lg={5}>

              {/* Carte avatar + infos fixes */}
              <Card className="profil-identity-card mb-4">
                <div className="profil-identity-header">
                  <div className="profil-avatar-circle">
                    {getInitiales()}
                  </div>
                  <div className="profil-identity-online"></div>
                </div>
                <Card.Body className="profil-identity-body">
                  <h4 className="profil-fullname">
                    Dr. {medecin?.prenom} {medecin?.nom}
                  </h4>
                  <p className="profil-specialite">
                    {medecin?.specialite || "Médecin généraliste"}
                  </p>
                  <Badge className="profil-status-badge">
                    <i className="bi bi-patch-check-fill me-1"></i>
                    Professionnel vérifié
                  </Badge>

                  <div className="profil-fixed-info mt-4">
                    <div className="profil-info-row">
                      <div className="profil-info-icon">
                        <i className="bi bi-shield-fill"></i>
                      </div>
                      <div>
                        <span className="profil-info-label">N° Professionnel</span>
                        <span className="profil-info-value">{medecin?.numeroProfessionnel}</span>
                      </div>
                    </div>

                    <div className="profil-info-row">
                      <div className="profil-info-icon">
                        <i className="bi bi-gender-ambiguous"></i>
                      </div>
                      <div>
                        <span className="profil-info-label">Sexe</span>
                        <span className="profil-info-value">
                          {medecin?.sexe === "MASCULIN" ? "Masculin" : medecin?.sexe === "FEMININ" ? "Féminin" : medecin?.sexe || "--"}
                        </span>
                      </div>
                    </div>

                    <div className="profil-info-row">
                      <div className="profil-info-icon">
                        <i className="bi bi-calendar3"></i>
                      </div>
                      <div>
                        <span className="profil-info-label">Date de naissance</span>
                        <span className="profil-info-value">
                          {medecin?.dateNaissance
                            ? new Date(medecin.dateNaissance).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
                            : "--"}
                        </span>
                      </div>
                    </div>

                    <div className="profil-info-row">
                      <div className="profil-info-icon">
                        <i className="bi bi-calendar-check"></i>
                      </div>
                      <div>
                        <span className="profil-info-label">Membre depuis</span>
                        <span className="profil-info-value">
                          {medecin?.dateEnregistrement
                            ? new Date(medecin.dateEnregistrement).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
                            : "--"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              {/* Info non modifiable */}
              <Card className="profil-readonly-card">
                <Card.Body className="p-4">
                  <h6 className="profil-section-title">
                    <i className="bi bi-lock-fill me-2"></i>
                    Informations non modifiables
                  </h6>
                  <p className="profil-readonly-note">
                    Ces informations sont gérées par l'administration de la plateforme.
                    Pour toute modification, contactez le support.
                  </p>
                  <div className="profil-readonly-list">
                    <div className="profil-readonly-item">
                      <span className="profil-readonly-label">Numéro professionnel</span>
                      <span className="profil-readonly-value">{medecin?.numeroProfessionnel}</span>
                    </div>
                    <div className="profil-readonly-item">
                      <span className="profil-readonly-label">Date de naissance</span>
                      <span className="profil-readonly-value">
                        {medecin?.dateNaissance
                          ? new Date(medecin.dateNaissance).toLocaleDateString("fr-FR")
                          : "--"}
                      </span>
                    </div>
                    <div className="profil-readonly-item">
                      <span className="profil-readonly-label">Sexe</span>
                      <span className="profil-readonly-value">{medecin?.sexe || "--"}</span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* ===== COLONNE DROITE : formulaire ===== */}
            <Col xl={8} lg={7}>

              {/* En-tête section */}
              <div className="profil-form-header mb-4">
                <div>
                  <h4 className="profil-form-title">Informations professionnelles</h4>
                  <p className="profil-form-subtitle">
                    Gérez et mettez à jour vos informations de profil
                  </p>
                </div>
                {!editMode ? (
                  <button className="btn-edit-profil" onClick={() => setEditMode(true)}>
                    <i className="bi bi-pencil-fill me-2"></i>
                    Modifier
                  </button>
                ) : (
                  <div className="d-flex gap-2">
                    <button className="btn-cancel-profil" onClick={handleCancel}>
                      <i className="bi bi-x-lg me-2"></i>
                      Annuler
                    </button>
                    <button className="btn-save-profil" onClick={handleSave} disabled={saving}>
                      {saving
                        ? <><span className="spinner-border spinner-border-sm me-2"></span>Enregistrement...</>
                        : <><i className="bi bi-check-lg me-2"></i>Enregistrer</>
                      }
                    </button>
                  </div>
                )}
              </div>

              {/* Bloc identité */}
              <Card className="profil-form-card mb-4">
                <Card.Body className="p-4">
                  <h6 className="profil-section-title mb-4">
                    <i className="bi bi-person-fill me-2"></i>
                    Identité
                  </h6>
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="profil-label">Prénom</Form.Label>
                        {editMode ? (
                          <Form.Control
                            name="prenom"
                            value={formData.prenom}
                            onChange={handleChange}
                            className="profil-input"
                            placeholder="Votre prénom"
                          />
                        ) : (
                          <div className="profil-display-value">{medecin?.prenom || "--"}</div>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="profil-label">Nom</Form.Label>
                        {editMode ? (
                          <Form.Control
                            name="nom"
                            value={formData.nom}
                            onChange={handleChange}
                            className="profil-input"
                            placeholder="Votre nom"
                          />
                        ) : (
                          <div className="profil-display-value">{medecin?.nom || "--"}</div>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="profil-label">Téléphone</Form.Label>
                        {editMode ? (
                          <Form.Control
                            name="telephone"
                            value={formData.telephone}
                            onChange={handleChange}
                            className="profil-input"
                            placeholder="+221 77 000 00 00"
                          />
                        ) : (
                          <div className="profil-display-value">
                            <i className="bi bi-telephone me-2 text-success"></i>
                            {medecin?.telephone || "--"}
                          </div>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Bloc professionnel */}
              <Card className="profil-form-card mb-4">
                <Card.Body className="p-4">
                  <h6 className="profil-section-title mb-4">
                    <i className="bi bi-briefcase-fill me-2"></i>
                    Informations professionnelles
                  </h6>
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="profil-label">Spécialité</Form.Label>
                        {editMode ? (
                          <Form.Control
                            name="specialite"
                            value={formData.specialite}
                            onChange={handleChange}
                            className="profil-input"
                            placeholder="Ex: Endocrinologie"
                          />
                        ) : (
                          <div className="profil-display-value">{medecin?.specialite || "--"}</div>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="profil-label">Service / Unité</Form.Label>
                        {editMode ? (
                          <Form.Control
                            name="nomService"
                            value={formData.nomService}
                            onChange={handleChange}
                            className="profil-input"
                            placeholder="Ex: Service de diabétologie"
                          />
                        ) : (
                          <div className="profil-display-value">{medecin?.nomService || "--"}</div>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Bloc localisation */}
              <Card className="profil-form-card mb-4">
                <Card.Body className="p-4">
                  <h6 className="profil-section-title mb-4">
                    <i className="bi bi-geo-alt-fill me-2"></i>
                    Localisation
                  </h6>
                  <Row className="g-3">
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label className="profil-label">Adresse</Form.Label>
                        {editMode ? (
                          <Form.Control
                            name="adresse"
                            value={formData.adresse}
                            onChange={handleChange}
                            className="profil-input"
                            placeholder="Votre adresse"
                          />
                        ) : (
                          <div className="profil-display-value">
                            <i className="bi bi-house me-2 text-success"></i>
                            {medecin?.adresse || "--"}
                          </div>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="profil-label">Ville</Form.Label>
                        {editMode ? (
                          <Form.Control
                            name="ville"
                            value={formData.ville}
                            onChange={handleChange}
                            className="profil-input"
                            placeholder="Ex: Dakar"
                          />
                        ) : (
                          <div className="profil-display-value">{medecin?.ville || "--"}</div>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="profil-label">Région</Form.Label>
                        {editMode ? (
                          <Form.Control
                            name="region"
                            value={formData.region}
                            onChange={handleChange}
                            className="profil-input"
                            placeholder="Ex: Dakar"
                          />
                        ) : (
                          <div className="profil-display-value">{medecin?.region || "--"}</div>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  {editMode && (
                    <div className="profil-form-actions mt-4">
                      <button className="btn-cancel-profil" onClick={handleCancel}>
                        <i className="bi bi-x-lg me-2"></i>Annuler
                      </button>
                      <button className="btn-save-profil" onClick={handleSave} disabled={saving}>
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
              <Card className="profil-form-card profil-pwd-card">
                <Card.Body className="p-4">
                  <h6 className="profil-section-title mb-4">
                    <i className="bi bi-key-fill me-2"></i>
                    Changer le mot de passe
                  </h6>

                  {/* Alertes mot de passe */}
                  {successPwd && (
                    <div className="profil-alert profil-alert-success mb-3">
                      <i className="bi bi-check-circle-fill me-2"></i>{successPwd}
                    </div>
                  )}
                  {errorPwd && (
                    <div className="profil-alert profil-alert-error mb-3">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>{errorPwd}
                    </div>
                  )}

                  <Row className="g-3">

                    {/* Ancien mot de passe */}
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label className="profil-label">
                          <i className="bi bi-lock me-1"></i>Mot de passe actuel
                        </Form.Label>
                        <div className="profil-pwd-wrapper">
                          <Form.Control
                            type={showPassword.old ? "text" : "password"}
                            name="oldPassword"
                            value={passwordData.oldPassword}
                            onChange={handlePasswordChange}
                            className="profil-input profil-input-pwd"
                            placeholder="Entrez votre mot de passe actuel"
                          />
                          <button type="button" className="profil-pwd-toggle" onClick={() => toggleShow("old")}>
                            <i className={`bi bi-eye${showPassword.old ? "-slash" : ""}`}></i>
                          </button>
                        </div>
                      </Form.Group>
                    </Col>

                    {/* Nouveau mot de passe */}
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="profil-label">
                          <i className="bi bi-lock-fill me-1"></i>Nouveau mot de passe
                        </Form.Label>
                        <div className="profil-pwd-wrapper">
                          <Form.Control
                            type={showPassword.new ? "text" : "password"}
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            className="profil-input profil-input-pwd"
                            placeholder="Minimum 5 caractères"
                          />
                          <button type="button" className="profil-pwd-toggle" onClick={() => toggleShow("new")}>
                            <i className={`bi bi-eye${showPassword.new ? "-slash" : ""}`}></i>
                          </button>
                        </div>
                        {passwordData.newPassword && strength && (
                          <div className="profil-pwd-strength mt-2">
                            <div className="profil-pwd-strength-bar">
                              <div className="profil-pwd-strength-fill"
                                style={{ width: strength.width, background: strength.color }}>
                              </div>
                            </div>
                            <span className="profil-pwd-strength-label" style={{ color: strength.color }}>
                              {strength.level}
                            </span>
                          </div>
                        )}
                      </Form.Group>
                    </Col>

                    {/* Confirmation */}
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="profil-label">
                          <i className="bi bi-lock-fill me-1"></i>Confirmer le mot de passe
                        </Form.Label>
                        <div className="profil-pwd-wrapper">
                          <Form.Control
                            type={showPassword.confirm ? "text" : "password"}
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            className={`profil-input profil-input-pwd${
                              passwordData.confirmPassword
                                ? passwordData.newPassword !== passwordData.confirmPassword
                                  ? " profil-input-pwd-error"
                                  : " profil-input-pwd-success"
                                : ""
                            }`}
                            placeholder="Répétez le nouveau mot de passe"
                          />
                          <button type="button" className="profil-pwd-toggle" onClick={() => toggleShow("confirm")}>
                            <i className={`bi bi-eye${showPassword.confirm ? "-slash" : ""}`}></i>
                          </button>
                        </div>
                        {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                          <small className="profil-pwd-field-msg profil-pwd-field-msg--error">
                            <i className="bi bi-x-circle me-1"></i>Les mots de passe ne correspondent pas
                          </small>
                        )}
                        {passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword && (
                          <small className="profil-pwd-field-msg profil-pwd-field-msg--success">
                            <i className="bi bi-check-circle me-1"></i>Les mots de passe correspondent
                          </small>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Conseil sécurité */}
                  <div className="profil-security-tip mt-3">
                    <i className="bi bi-lightbulb-fill me-2"></i>
                    Utilisez au moins 8 caractères, mélangez lettres, chiffres et symboles pour un mot de passe sécurisé.
                  </div>

                  {/* Actions */}
                  <div className="profil-form-actions mt-4">
                    <button
                      className="btn-cancel-profil"
                      onClick={() => {
                        setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
                        setErrorPwd("");
                        setSuccessPwd("");
                      }}
                    >
                      <i className="bi bi-x-lg me-2"></i>Réinitialiser
                    </button>
                    <button className="btn-save-profil" onClick={handleSavePassword} disabled={savingPwd}>
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

export default ProfilMedecin;