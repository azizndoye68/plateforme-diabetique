// src/pages/NotificationsPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarPatient from "../../components/SidebarPatient";
import { useNotifications } from "../../hooks/useNotifications";
import api from "../../services/api";
import "./NotificationsPage.css";

const TYPE_CONFIG = {
  HYPOGLYCEMIE:          { icon: "bi-arrow-down-circle-fill", color: "#f59e0b", label: "Hypoglycémie",         bg: "#fef3c7" },
  HYPOGLYCEMIE_SEVERE:   { icon: "bi-exclamation-triangle-fill", color: "#ef4444", label: "Hypoglycémie sévère", bg: "#fee2e2" },
  HYPERGLYCEMIE:         { icon: "bi-arrow-up-circle-fill", color: "#f97316", label: "Hyperglycémie",          bg: "#ffedd5" },
  HYPERGLYCEMIE_SEVERE:  { icon: "bi-exclamation-octagon-fill", color: "#dc2626", label: "Hyperglycémie sévère", bg: "#fee2e2" },
  RAPPEL_MESURE:         { icon: "bi-clock-fill", color: "#11998e", label: "Rappel mesure",                    bg: "#d1fae5" },
  INACTIVITE_PATIENT:    { icon: "bi-person-x-fill", color: "#8b5cf6", label: "Inactivité patient",            bg: "#ede9fe" },
  RENDEZ_VOUS_PLANIFIE:  { icon: "bi-calendar-plus-fill", color: "#11998e", label: "RDV planifié",             bg: "#d1fae5" },
  RENDEZ_VOUS_CONFIRME:  { icon: "bi-calendar-check-fill", color: "#10b981", label: "RDV confirmé",            bg: "#d1fae5" },
  RENDEZ_VOUS_ANNULE:    { icon: "bi-calendar-x-fill", color: "#ef4444", label: "RDV annulé",                  bg: "#fee2e2" },
  RENDEZ_VOUS_RAPPEL_J1: { icon: "bi-calendar-event-fill", color: "#3b82f6", label: "Rappel RDV demain",       bg: "#dbeafe" },
  RENDEZ_VOUS_RAPPEL_H2: { icon: "bi-alarm-fill", color: "#8b5cf6", label: "Rappel RDV dans 2h",               bg: "#ede9fe" },
};

const CANAL_LABEL = { EMAIL: "Email", SMS: "SMS", PUSH: "Push" };

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [patientId, setPatientId] = useState(null);
  const [filter, setFilter] = useState("TOUTES"); // TOUTES | NON_LUES | LUES
  const [typeFilter, setTypeFilter] = useState("TOUS");
  const [expanded, setExpanded] = useState(null);

  // Récupérer le patientId depuis le profil
  useEffect(() => {
    const load = async () => {
      try {
        const profileRes = await api.get("/api/auth/profile");
        const utilisateurId = profileRes.data.id;
        const patientRes = await api.get(`/api/patients/byUtilisateur/${utilisateurId}`);
        setPatientId(patientRes.data.id);
      } catch (err) {
        console.error("Erreur chargement profil:", err);
      }
    };
    load();
  }, []);

  const { notifications, loading, unreadCount, fetchNotifications, markAsRead, markAllAsRead } =
    useNotifications(patientId, "patient");

  useEffect(() => {
    if (patientId) fetchNotifications();
  }, [patientId, fetchNotifications]);

  // Filtrage
  const filtered = notifications.filter((n) => {
    const statutOk =
      filter === "TOUTES" ||
      (filter === "NON_LUES" && n.statut !== "LU") ||
      (filter === "LUES" && n.statut === "LU");
    const typeOk = typeFilter === "TOUS" || n.typeAlerte === typeFilter;
    return statutOk && typeOk;
  });

  const cfg = (type) =>
    TYPE_CONFIG[type] || { icon: "bi-bell-fill", color: "#6b7280", label: type, bg: "#f3f4f6" };

  const uniqueTypes = [...new Set(notifications.map((n) => n.typeAlerte))];

  return (
    <div className="notif-page-wrapper">
      <SidebarPatient patient={null} />

      <div className="notif-page-content">
        {/* Header */}
        <div className="notif-page-header">
          <div className="notif-page-header-left">
            <button className="notif-back-btn" onClick={() => navigate(-1)}>
              <i className="bi bi-arrow-left" />
            </button>
            <div>
              <h1 className="notif-page-title">
                <i className="bi bi-bell-fill me-2" />
                Notifications
              </h1>
              <p className="notif-page-subtitle">
                {unreadCount > 0
                  ? `${unreadCount} notification${unreadCount > 1 ? "s" : ""} non lue${unreadCount > 1 ? "s" : ""}`
                  : "Tout est à jour"}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button className="notif-mark-all-btn" onClick={markAllAsRead}>
              <i className="bi bi-check2-all me-2" />
              Tout marquer comme lu
            </button>
          )}
        </div>

        {/* Filtres */}
        <div className="notif-filters">
          <div className="notif-filter-group">
            {["TOUTES", "NON_LUES", "LUES"].map((f) => (
              <button
                key={f}
                className={`notif-filter-btn ${filter === f ? "active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f === "TOUTES" ? "Toutes" : f === "NON_LUES" ? "Non lues" : "Lues"}
                {f === "NON_LUES" && unreadCount > 0 && (
                  <span className="notif-filter-count">{unreadCount}</span>
                )}
              </button>
            ))}
          </div>

          <select
            className="notif-type-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="TOUS">Tous les types</option>
            {uniqueTypes.map((t) => (
              <option key={t} value={t}>{cfg(t).label}</option>
            ))}
          </select>
        </div>

        {/* Contenu */}
        <div className="notif-page-list">
          {loading && (
            <div className="notif-page-loading">
              <div className="notif-page-spinner" />
              <p>Chargement de vos notifications...</p>
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="notif-page-empty">
              <i className="bi bi-bell-slash" />
              <h5>Aucune notification</h5>
              <p>
                {filter === "NON_LUES"
                  ? "Vous avez lu toutes vos notifications."
                  : "Vous n'avez pas encore de notifications."}
              </p>
            </div>
          )}

          {!loading &&
            filtered.map((notif) => {
              const c = cfg(notif.typeAlerte);
              const isUnread = notif.statut !== "LU";
              const isExpanded = expanded === notif.id;

              return (
                <div
                  key={notif.id}
                  className={`notif-card ${isUnread ? "notif-card--unread" : ""}`}
                >
                  <div
                    className="notif-card-main"
                    onClick={() => {
                      setExpanded(isExpanded ? null : notif.id);
                      if (isUnread) markAsRead(notif.id);
                    }}
                  >
                    {/* Icône type */}
                    <div
                      className="notif-card-icon"
                      style={{ background: c.bg, color: c.color }}
                    >
                      <i className={`bi ${c.icon}`} />
                    </div>

                    {/* Corps */}
                    <div className="notif-card-body">
                      <div className="notif-card-top">
                        <span className="notif-card-type" style={{ color: c.color }}>
                          {c.label}
                        </span>
                        <div className="notif-card-meta">
                          <span className="notif-card-canal">
                            <i className="bi bi-send me-1" />
                            {CANAL_LABEL[notif.canal] || notif.canal}
                          </span>
                          <span className="notif-card-date">
                            {formatDate(notif.dateEnvoi)}
                          </span>
                        </div>
                      </div>
                      <p className="notif-card-preview">
                        {isExpanded
                          ? notif.message
                          : `${notif.message?.slice(0, 120)}${notif.message?.length > 120 ? "…" : ""}`}
                      </p>
                      {notif.dateLecture && (
                        <p className="notif-card-read-date">
                          <i className="bi bi-eye me-1" />
                          Lu le {formatDate(notif.dateLecture)}
                        </p>
                      )}
                    </div>

                    {/* Indicateurs droite */}
                    <div className="notif-card-right">
                      {isUnread && <span className="notif-card-dot" />}
                      <i className={`bi bi-chevron-${isExpanded ? "up" : "down"} notif-card-chevron`} />
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}