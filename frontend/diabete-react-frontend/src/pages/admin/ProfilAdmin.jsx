// src/pages/admin/ProfilAdmin.jsx
import React, { useEffect, useState } from "react";
import { Row, Col, Form } from "react-bootstrap";
import SidebarAdmin from "../../components/SidebarAdmin";
import AideModal from "../../components/AideModal";
import api from "../../services/api";
import "./ProfilAdmin.css";

function ProfilAdmin() {
  const [admin, setAdmin] = useState(null);
  const [showAide, setShowAide] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

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

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await api.get("/api/auth/profile");
        setAdmin(res.data);
      } catch (err) {
        console.error("Erreur chargement profil:", err);
        setErrorMsg("Impossible de charger le profil.");
      } finally {
        setLoading(false);
      }
    };
    fetchAdmin();
  }, []);

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    setErrorMsg("");
  };

  const toggleShow = (field) => {
    setShowPassword({ ...showPassword, [field]: !showPassword[field] });
  };

  const handleSavePassword = async () => {
    setSuccessMsg("");
    setErrorMsg("");

    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setErrorMsg("Veuillez remplir tous les champs.");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMsg("Le nouveau mot de passe et sa confirmation ne correspondent pas.");
      return;
    }
    if (passwordData.newPassword.length < 5) {
      setErrorMsg("Le nouveau mot de passe doit contenir au moins 5 caractères.");
      return;
    }

    setSaving(true);
    try {
      await api.put("/api/auth/update-password", {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setSuccessMsg("Mot de passe mis à jour avec succès !");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      const msg = err?.response?.data?.message || "Ancien mot de passe incorrect.";
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  const getInitiales = () => {
    if (!admin) return "A";
    return (admin.username?.[0] || "A").toUpperCase();
  };

  const getPasswordStrength = (pwd) => {
    if (!pwd) return null;
    if (pwd.length < 5)  return { level: "Faible",    color: "#ef4444", width: "25%"  };
    if (pwd.length < 8)  return { level: "Moyen",     color: "#f59e0b", width: "55%"  };
    if (pwd.length < 12) return { level: "Fort",      color: "#10b981", width: "80%"  };
    return                      { level: "Très fort", color: "#11998e", width: "100%" };
  };

  const strength = getPasswordStrength(passwordData.newPassword);

  if (loading) {
    return (
      <div className="pa-wrapper">
        <SidebarAdmin admin={admin} onShowAide={() => setShowAide(true)} />
        <div className="pa-content">
          <div className="pa-state pa-state--loading">
            <div className="pa-spinner"></div>
            <p>Chargement du profil…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pa-wrapper">
      <SidebarAdmin admin={admin} onShowAide={() => setShowAide(true)} />

      <div className="pa-content">
        <div className="pa-page">

          {/* ── TOPBAR ── */}
          <div className="pa-topbar pa-fade-in">
            <div>
              <p className="pa-topbar-eyebrow">
                <i className="bi bi-person-gear me-2"></i>Gestion du compte
              </p>
              <h1 className="pa-topbar-title">Mon profil</h1>
            </div>
            <div className="pa-topbar-badge">
              <i className="bi bi-shield-fill-check me-2"></i>
              Administrateur système
            </div>
          </div>

          {/* ── ALERTES ── */}
          {successMsg && (
            <div className="pa-alert pa-alert--success pa-fade-in">
              <i className="bi bi-check-circle-fill me-2"></i>{successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="pa-alert pa-alert--error pa-fade-in">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>{errorMsg}
            </div>
          )}

          {/* ── LAYOUT 2 COLONNES ── */}
          <div className="pa-layout">

            {/* ── GAUCHE : carte identité ── */}
            <div className="pa-card pa-card--identity pa-fade-in" style={{ animationDelay: "60ms" }}>

              <div className="pa-identity-header">
                <div className="pa-avatar-ring">
                  <div className="pa-avatar">{getInitiales()}</div>
                </div>
                <div className="pa-online-dot"></div>
              </div>

              <div className="pa-identity-body">
                <h4 className="pa-identity-name">{admin?.username}</h4>
                <p className="pa-identity-role">Administrateur système</p>
                <span className="pa-identity-badge">
                  <i className="bi bi-patch-check-fill me-1"></i>Accès complet
                </span>

                <div className="pa-info-list">
                  <div className="pa-info-row">
                    <div className="pa-info-icon"><i className="bi bi-envelope-fill"></i></div>
                    <div>
                      <span className="pa-info-label">Email</span>
                      <span className="pa-info-value">{admin?.email}</span>
                    </div>
                  </div>
                  <div className="pa-info-row">
                    <div className="pa-info-icon"><i className="bi bi-person-badge-fill"></i></div>
                    <div>
                      <span className="pa-info-label">Rôle</span>
                      <span className="pa-info-value">ADMINISTRATEUR</span>
                    </div>
                  </div>
                  <div className="pa-info-row">
                    <div className="pa-info-icon"><i className="bi bi-check-circle-fill"></i></div>
                    <div>
                      <span className="pa-info-label">Statut</span>
                      <span className="pa-info-value pa-info-value--approved">
                        {admin?.statut || "APPROVED"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Readonly block */}
              <div className="pa-readonly-block">
                <div className="pa-readonly-head">
                  <i className="bi bi-lock-fill me-2"></i>Informations non modifiables
                </div>
                <p className="pa-readonly-note">
                  Ces données sont gérées par le système. Contactez le support pour toute modification.
                </p>
                <div className="pa-readonly-list">
                  {[
                    { lbl: "Nom d'utilisateur", val: admin?.username },
                    { lbl: "Email",             val: admin?.email    },
                    { lbl: "Rôle",              val: "ADMINISTRATEUR"},
                  ].map((item, i) => (
                    <div key={i} className="pa-readonly-item">
                      <span className="pa-readonly-label">{item.lbl}</span>
                      <span className="pa-readonly-value">{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── DROITE ── */}
            <div className="pa-right-col">

              {/* Infos compte (lecture seule) */}
              <div className="pa-card pa-fade-in" style={{ animationDelay: "120ms" }}>
                <div className="pa-card__head">
                  <div className="pa-card__title-row">
                    <div className="pa-card__icon-sm" style={{ background: "linear-gradient(135deg,#11998e,#38ef7d)" }}>
                      <i className="bi bi-person-fill"></i>
                    </div>
                    <h6 className="pa-card__title">Informations du compte</h6>
                  </div>
                </div>
                <div className="pa-card__body">
                  <Row className="g-3">
                    <Col md={6}>
                      <div className="pa-field">
                        <label className="pa-label">Nom d'utilisateur</label>
                        <div className="pa-display-value">
                          <i className="bi bi-person me-2"></i>{admin?.username || "--"}
                        </div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="pa-field">
                        <label className="pa-label">Adresse email</label>
                        <div className="pa-display-value">
                          <i className="bi bi-envelope me-2"></i>{admin?.email || "--"}
                        </div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="pa-field">
                        <label className="pa-label">Rôle</label>
                        <div className="pa-display-value">
                          <i className="bi bi-shield-fill me-2"></i>Administrateur
                        </div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="pa-field">
                        <label className="pa-label">Statut</label>
                        <div className="pa-display-value">
                          <i className="bi bi-check-circle-fill me-2" style={{ color: "#11998e" }}></i>
                          Compte actif
                        </div>
                      </div>
                    </Col>
                  </Row>
                  <div className="pa-info-note mt-3">
                    <i className="bi bi-info-circle me-2"></i>
                    Ces informations sont en lecture seule. Contactez le support pour toute modification.
                  </div>
                </div>
              </div>

              {/* Mot de passe */}
              <div className="pa-card pa-fade-in" style={{ animationDelay: "200ms" }}>
                <div className="pa-card__head">
                  <div className="pa-card__title-row">
                    <div className="pa-card__icon-sm" style={{ background: "linear-gradient(135deg,#11998e,#38ef7d)" }}>
                      <i className="bi bi-key-fill"></i>
                    </div>
                    <h6 className="pa-card__title">Changer le mot de passe</h6>
                  </div>
                </div>
                <div className="pa-card__body">
                  <Row className="g-3">

                    <Col md={12}>
                      <div className="pa-field">
                        <label className="pa-label">
                          <i className="bi bi-lock me-1"></i>Mot de passe actuel
                        </label>
                        <div className="pa-pwd-wrapper">
                          <Form.Control
                            type={showPassword.old ? "text" : "password"}
                            name="oldPassword"
                            value={passwordData.oldPassword}
                            onChange={handlePasswordChange}
                            className="pa-input"
                            placeholder="Entrez votre mot de passe actuel"
                          />
                          <button type="button" className="pa-pwd-toggle" onClick={() => toggleShow("old")}>
                            <i className={`bi bi-eye${showPassword.old ? "-slash" : ""}`}></i>
                          </button>
                        </div>
                      </div>
                    </Col>

                    <Col md={6}>
                      <div className="pa-field">
                        <label className="pa-label">
                          <i className="bi bi-lock-fill me-1"></i>Nouveau mot de passe
                        </label>
                        <div className="pa-pwd-wrapper">
                          <Form.Control
                            type={showPassword.new ? "text" : "password"}
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            className="pa-input"
                            placeholder="Minimum 5 caractères"
                          />
                          <button type="button" className="pa-pwd-toggle" onClick={() => toggleShow("new")}>
                            <i className={`bi bi-eye${showPassword.new ? "-slash" : ""}`}></i>
                          </button>
                        </div>
                        {passwordData.newPassword && strength && (
                          <div className="pa-strength mt-2">
                            <div className="pa-strength__bar">
                              <div className="pa-strength__fill"
                                style={{ width: strength.width, background: strength.color }}>
                              </div>
                            </div>
                            <span className="pa-strength__label" style={{ color: strength.color }}>
                              {strength.level}
                            </span>
                          </div>
                        )}
                      </div>
                    </Col>

                    <Col md={6}>
                      <div className="pa-field">
                        <label className="pa-label">
                          <i className="bi bi-lock-fill me-1"></i>Confirmer le mot de passe
                        </label>
                        <div className="pa-pwd-wrapper">
                          <Form.Control
                            type={showPassword.confirm ? "text" : "password"}
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            className={`pa-input${
                              passwordData.confirmPassword
                                ? passwordData.newPassword !== passwordData.confirmPassword
                                  ? " pa-input--error"
                                  : " pa-input--success"
                                : ""
                            }`}
                            placeholder="Répétez le nouveau mot de passe"
                          />
                          <button type="button" className="pa-pwd-toggle" onClick={() => toggleShow("confirm")}>
                            <i className={`bi bi-eye${showPassword.confirm ? "-slash" : ""}`}></i>
                          </button>
                        </div>
                        {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                          <small className="pa-field-msg pa-field-msg--error">
                            <i className="bi bi-x-circle me-1"></i>Les mots de passe ne correspondent pas
                          </small>
                        )}
                        {passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword && (
                          <small className="pa-field-msg pa-field-msg--success">
                            <i className="bi bi-check-circle me-1"></i>Les mots de passe correspondent
                          </small>
                        )}
                      </div>
                    </Col>
                  </Row>

                  <div className="pa-security-tip mt-3">
                    <i className="bi bi-lightbulb-fill me-2"></i>
                    Utilisez au moins 8 caractères, mélangez lettres, chiffres et symboles pour un mot de passe sécurisé.
                  </div>

                  <div className="pa-card__actions mt-4">
                    <button
                      className="pa-btn pa-btn--ghost"
                      onClick={() => {
                        setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
                        setErrorMsg("");
                        setSuccessMsg("");
                      }}
                    >
                      <i className="bi bi-x-lg me-2"></i>Réinitialiser
                    </button>
                    <button className="pa-btn pa-btn--primary" onClick={handleSavePassword} disabled={saving}>
                      {saving
                        ? <><span className="spinner-border spinner-border-sm me-2"></span>Enregistrement…</>
                        : <><i className="bi bi-key-fill me-2"></i>Mettre à jour le mot de passe</>
                      }
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <AideModal show={showAide} onHide={() => setShowAide(false)} />
    </div>
  );
}

export default ProfilAdmin;