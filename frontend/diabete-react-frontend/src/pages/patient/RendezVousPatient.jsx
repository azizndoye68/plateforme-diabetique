// src/pages/patient/RendezVousPatient.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import SidebarPatient from "../../components/SidebarPatient";
import "./RendezVousPatient.css";

const STATUT_CONFIG = {
  PLANIFIE:  { label: "Planifié",  color: "#3b82f6", bg: "#eff6ff", icon: "bi-clock-fill" },
  CONFIRME:  { label: "Confirmé",  color: "#10b981", bg: "#f0fdf4", icon: "bi-check-circle-fill" },
  ANNULE:    { label: "Annulé",    color: "#ef4444", bg: "#fef2f2", icon: "bi-x-circle-fill" },
  TERMINE:   { label: "Terminé",   color: "#6b7280", bg: "#f9fafb", icon: "bi-check-all" },
};

export default function RendezVousPatient() {
  const [patient, setPatient] = useState(null);
  const [rendezVous, setRendezVous] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [filter, setFilter] = useState("TOUS");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const { patientId } = useParams();

  useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      let patientData;

      if (patientId) {
        // Vue médecin
        const patientRes = await api.get(`/api/patients/${patientId}`);
        patientData = patientRes.data;
      } else {
        // Vue patient
        const profileRes = await api.get("/api/auth/profile");
        const patientRes = await api.get(`/api/patients/byUtilisateur/${profileRes.data.id}`);
        patientData = patientRes.data;
      }

      setPatient(patientData);

      const rdvRes = await api.get(`/api/rendezvous/patient/${patientData.id}`);
      const sorted = rdvRes.data.sort((a, b) => new Date(b.dateRdv) - new Date(a.dateRdv));
      setRendezVous(sorted);

    } catch (err) {
      console.error("Erreur chargement rendez-vous :", err);
      setErrorMsg("Impossible de charger vos rendez-vous.");
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, [patientId]);

  const handleStatut = async (rdvId, statut) => {
    setActionLoading(rdvId + statut);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      await api.patch(`/api/rendezvous/${rdvId}/statut?statut=${statut}`);
      setRendezVous(prev =>
        prev.map(r => r.id === rdvId ? { ...r, statut } : r)
      );
      setSuccessMsg(
        statut === "CONFIRME"
          ? "Rendez-vous confirmé avec succès !"
          : "Rendez-vous annulé."
      );
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setErrorMsg("Erreur lors de la mise à jour du statut.");
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", {
      weekday: "long", day: "2-digit", month: "long", year: "numeric"
    });
  };

  const formatHeure = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  const isUpcoming = (dateStr) => new Date(dateStr) > new Date();

  const filtered = filter === "TOUS"
    ? rendezVous
    : rendezVous.filter(r => r.statut === filter);

  const counts = {
    TOUS: rendezVous.length,
    PLANIFIE: rendezVous.filter(r => r.statut === "PLANIFIE").length,
    CONFIRME: rendezVous.filter(r => r.statut === "CONFIRME").length,
    ANNULE: rendezVous.filter(r => r.statut === "ANNULE").length,
    TERMINE: rendezVous.filter(r => r.statut === "TERMINE").length,
  };

  const prochainRdv = rendezVous
    .filter(r => r.statut !== "ANNULE" && r.statut !== "TERMINE" && isUpcoming(r.dateRdv))
    .sort((a, b) => new Date(a.dateRdv) - new Date(b.dateRdv))[0];

  return (
    <div className="rvp-wrapper">
      <SidebarPatient patient={patient} isMedecin={!!patientId} />

      <div className="rvp-main">
        <div className="rvp-container">

          {/* Alertes */}
          {successMsg && (
            <div className="rvp-alert rvp-alert-success">
              <i className="bi bi-check-circle-fill me-2"></i>{successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="rvp-alert rvp-alert-error">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>{errorMsg}
            </div>
          )}

          {/* Header */}
          <div className="rvp-header">
            <div className="rvp-header-left">
              <div className="rvp-header-icon">
                <i className="bi bi-calendar2-heart-fill"></i>
              </div>
              <div>
                <div className="rvp-header-tag">GESTION</div>
                <h1 className="rvp-header-title">Mes rendez-vous</h1>
                <p className="rvp-header-sub">
                  {patient ? `${patient.prenom} ${patient.nom}` : "Chargement..."}
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="rvp-loading">
              <div className="rvp-spinner"></div>
              <p>Chargement de vos rendez-vous...</p>
            </div>
          ) : (
            <>
              {/* Prochain RDV banner */}
              {prochainRdv && (
                <div className="rvp-next-rdv">
                  <div className="rvp-next-icon">
                    <i className="bi bi-calendar-event-fill"></i>
                  </div>
                  <div className="rvp-next-body">
                    <span className="rvp-next-label">Prochain rendez-vous</span>
                    <span className="rvp-next-date">
                      {formatDate(prochainRdv.dateRdv)} à {formatHeure(prochainRdv.dateRdv)}
                    </span>
                    {prochainRdv.motif && (
                      <span className="rvp-next-motif">
                        <i className="bi bi-chat-text me-1"></i>{prochainRdv.motif}
                      </span>
                    )}
                  </div>
                  <div className={`rvp-next-statut`} style={{
                    color: STATUT_CONFIG[prochainRdv.statut]?.color,
                    background: STATUT_CONFIG[prochainRdv.statut]?.bg,
                  }}>
                    <i className={`bi ${STATUT_CONFIG[prochainRdv.statut]?.icon} me-1`}></i>
                    {STATUT_CONFIG[prochainRdv.statut]?.label}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="rvp-stats">
                <div className="rvp-stat">
                  <span className="rvp-stat-num">{counts.TOUS}</span>
                  <span className="rvp-stat-label">Total</span>
                </div>
                <div className="rvp-stat">
                  <span className="rvp-stat-num" style={{ color: "#3b82f6" }}>{counts.PLANIFIE}</span>
                  <span className="rvp-stat-label">Planifiés</span>
                </div>
                <div className="rvp-stat">
                  <span className="rvp-stat-num" style={{ color: "#10b981" }}>{counts.CONFIRME}</span>
                  <span className="rvp-stat-label">Confirmés</span>
                </div>
                <div className="rvp-stat">
                  <span className="rvp-stat-num" style={{ color: "#ef4444" }}>{counts.ANNULE}</span>
                  <span className="rvp-stat-label">Annulés</span>
                </div>
                <div className="rvp-stat">
                  <span className="rvp-stat-num" style={{ color: "#6b7280" }}>{counts.TERMINE}</span>
                  <span className="rvp-stat-label">Terminés</span>
                </div>
              </div>

              {/* Filtres */}
              <div className="rvp-filters">
                {["TOUS", "PLANIFIE", "CONFIRME", "ANNULE", "TERMINE"].map(f => (
                  <button
                    key={f}
                    className={`rvp-filter-btn ${filter === f ? "active" : ""}`}
                    onClick={() => setFilter(f)}
                    style={filter === f && f !== "TOUS" ? {
                      background: STATUT_CONFIG[f]?.bg,
                      color: STATUT_CONFIG[f]?.color,
                      borderColor: STATUT_CONFIG[f]?.color,
                    } : {}}
                  >
                    {f === "TOUS" ? "Tous" : STATUT_CONFIG[f]?.label}
                    <span className="rvp-filter-count">{counts[f]}</span>
                  </button>
                ))}
              </div>

              {/* Liste rendez-vous */}
              {filtered.length === 0 ? (
                <div className="rvp-empty">
                  <i className="bi bi-calendar-x"></i>
                  <h5>Aucun rendez-vous</h5>
                  <p>Aucun rendez-vous dans cette catégorie.</p>
                </div>
              ) : (
                <div className="rvp-list">
                  {filtered.map(rdv => {
                    const config = STATUT_CONFIG[rdv.statut] || STATUT_CONFIG.PLANIFIE;
                    const upcoming = isUpcoming(rdv.dateRdv);
                    const canAct = upcoming && (rdv.statut === "PLANIFIE" || rdv.statut === "CONFIRME");

                    return (
                      <div key={rdv.id} className={`rvp-card ${!upcoming ? "past" : ""}`}>
                        {/* Barre latérale colorée */}
                        <div className="rvp-card-bar" style={{ background: config.color }}></div>

                        <div className="rvp-card-body">
                          {/* Date bloc */}
                          <div className="rvp-card-date-bloc">
                            <div className="rvp-card-day">
                              {new Date(rdv.dateRdv).toLocaleDateString("fr-FR", { day: "2-digit" })}
                            </div>
                            <div className="rvp-card-month">
                              {new Date(rdv.dateRdv).toLocaleDateString("fr-FR", { month: "short" })}
                            </div>
                            <div className="rvp-card-year">
                              {new Date(rdv.dateRdv).getFullYear()}
                            </div>
                          </div>

                          {/* Contenu */}
                          <div className="rvp-card-content">
                            <div className="rvp-card-top">
                              <div className="rvp-card-heure">
                                <i className="bi bi-clock me-1"></i>
                                {formatHeure(rdv.dateRdv)}
                              </div>
                              <span className="rvp-card-statut" style={{ color: config.color, background: config.bg }}>
                                <i className={`bi ${config.icon} me-1`}></i>
                                {config.label}
                              </span>
                            </div>

                            <div className="rvp-card-info">
                              <div className="rvp-card-row">
                                <i className="bi bi-person-badge-fill me-2" style={{ color: "#11998e" }}></i>
                                <span>
                                  {rdv.medecinPrenom
                                    ? `Dr ${rdv.medecinPrenom} ${rdv.medecinNom}`
                                    : rdv.medecinId
                                    ? `Médecin #${rdv.medecinId}`
                                    : "Médecin non assigné"}
                                </span>
                              </div>
                              {rdv.motif && (
                                <div className="rvp-card-row">
                                  <i className="bi bi-chat-text-fill me-2" style={{ color: "#6366f1" }}></i>
                                  <span>{rdv.motif}</span>
                                </div>
                              )}
                              <div className="rvp-card-row">
                                <i className="bi bi-calendar3 me-2" style={{ color: "#f59e0b" }}></i>
                                <span>{formatDate(rdv.dateRdv)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          {canAct && (
                            <div className="rvp-card-actions">
                              {rdv.statut === "PLANIFIE" && (
                                <button
                                  className="rvp-btn-confirm"
                                  onClick={() => handleStatut(rdv.id, "CONFIRME")}
                                  disabled={actionLoading === rdv.id + "CONFIRME"}
                                >
                                  {actionLoading === rdv.id + "CONFIRME" ? (
                                    <span className="rvp-btn-spinner"></span>
                                  ) : (
                                    <i className="bi bi-check-lg me-1"></i>
                                  )}
                                  Confirmer
                                </button>
                              )}
                              <button
                                className="rvp-btn-cancel"
                                onClick={() => handleStatut(rdv.id, "ANNULE")}
                                disabled={actionLoading === rdv.id + "ANNULE"}
                              >
                                {actionLoading === rdv.id + "ANNULE" ? (
                                  <span className="rvp-btn-spinner"></span>
                                ) : (
                                  <i className="bi bi-x-lg me-1"></i>
                                )}
                                Annuler
                              </button>
                            </div>
                          )}

                          {!upcoming && (
                            <div className="rvp-card-past-label">
                              <i className="bi bi-archive me-1"></i>Passé
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}