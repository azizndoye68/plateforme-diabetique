// src/components/NotificationDropdown.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./NotificationDropdown.css";

const TYPE_CONFIG = {
  HYPOGLYCEMIE:          { icon: "bi-arrow-down-circle-fill",    color: "#f59e0b", label: "Hypoglycémie" },
  HYPOGLYCEMIE_SEVERE:   { icon: "bi-exclamation-triangle-fill", color: "#ef4444", label: "Hypoglycémie sévère" },
  HYPERGLYCEMIE:         { icon: "bi-arrow-up-circle-fill",      color: "#f97316", label: "Hyperglycémie" },
  HYPERGLYCEMIE_SEVERE:  { icon: "bi-exclamation-octagon-fill",  color: "#dc2626", label: "Hyperglycémie sévère" },
  RAPPEL_MESURE:         { icon: "bi-clock-fill",                color: "#11998e", label: "Rappel mesure" },
  INACTIVITE_PATIENT:    { icon: "bi-person-x-fill",             color: "#8b5cf6", label: "Inactivité patient" },
  RENDEZ_VOUS_PLANIFIE:  { icon: "bi-calendar-plus-fill",        color: "#11998e", label: "RDV planifié" },
  RENDEZ_VOUS_CONFIRME:  { icon: "bi-calendar-check-fill",       color: "#10b981", label: "RDV confirmé" },
  RENDEZ_VOUS_ANNULE:    { icon: "bi-calendar-x-fill",           color: "#ef4444", label: "RDV annulé" },
  RENDEZ_VOUS_RAPPEL_J1: { icon: "bi-calendar-event-fill",       color: "#3b82f6", label: "Rappel RDV demain" },
  RENDEZ_VOUS_RAPPEL_H2: { icon: "bi-alarm-fill",                color: "#8b5cf6", label: "Rappel RDV dans 2h" },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "À l'instant";
  if (m < 60) return `Il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Il y a ${h}h`;
  const d = Math.floor(h / 24);
  return `Il y a ${d}j`;
}

export default function NotificationDropdown({
  patientId,
  role = "patient",
  notifications,
  unreadCount,
  loading,
  onOpen,
  onMarkAsRead,
  onMarkAllAsRead,
  navigateTo,
}) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const ref = useRef(null);
  const navigate = useNavigate();

  const targetPage = navigateTo || "/notifications";

  // Détecter mobile
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fermer si clic en dehors (desktop uniquement)
  useEffect(() => {
    if (isMobile) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isMobile]);

  // Bloquer le scroll body quand modal mobile ouvert
  useEffect(() => {
    if (isMobile && open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMobile, open]);

  const handleOpen = () => {
    setOpen((prev) => !prev);
    if (!open) onOpen?.();
  };

  const handleClose = () => setOpen(false);

  const handleNotifClick = (notif) => {
    if (notif.statut !== "LU") onMarkAsRead(notif.id);
    setOpen(false);
    navigate(targetPage);
  };

  const preview = notifications.slice(0, 5);
  const cfg = (type) =>
    TYPE_CONFIG[type] || { icon: "bi-bell-fill", color: "#6b7280", label: type };

  const dropdownContent = (
    <div className={`notif-dropdown ${isMobile ? "notif-dropdown--modal" : ""}`}>
      {/* Handle bar mobile */}
      {isMobile && <div className="notif-handle-bar" />}

      {/* Header */}
      <div className="notif-header">
        <div className="notif-header-left">
          {isMobile && (
            <div
              className="notif-header-icon"
              style={{
                background: "linear-gradient(135deg, #38ef7d 0%, #11998e 100%)",
              }}
            >
              <i className="bi bi-bell-fill" />
            </div>
          )}
          <div>
            <span className="notif-title">Notifications</span>
            {unreadCount > 0 && (
              <span className="notif-count-badge">{unreadCount} non lues</span>
            )}
          </div>
        </div>
        <div className="notif-header-actions">
          {unreadCount > 0 && (
            <button className="notif-mark-all" onClick={onMarkAllAsRead}>
              Tout lire
            </button>
          )}
          {isMobile && (
            <button className="notif-close-btn" onClick={handleClose}>
              <i className="bi bi-x-lg" />
            </button>
          )}
        </div>
      </div>

      {/* Liste */}
      <div className="notif-list">
        {loading && (
          <div className="notif-empty">
            <div className="notif-spinner" />
            <p>Chargement...</p>
          </div>
        )}

        {!loading && preview.length === 0 && (
          <div className="notif-empty">
            <i className="bi bi-bell-slash" style={{ fontSize: "2.5rem", opacity: 0.25 }} />
            <p>Aucune notification</p>
          </div>
        )}

        {!loading &&
          preview.map((notif) => {
            const c = cfg(notif.typeAlerte);
            const isUnread = notif.statut !== "LU";
            return (
              <div
                key={notif.id}
                className={`notif-item ${isUnread ? "notif-item--unread" : ""}`}
                onClick={() => handleNotifClick(notif)}
              >
                <div
                  className="notif-item-icon"
                  style={{ background: c.color + "18", color: c.color }}
                >
                  <i className={`bi ${c.icon}`} />
                </div>
                <div className="notif-item-body">
                  <div className="notif-item-label">{c.label}</div>
                  <div className="notif-item-msg">
                    {notif.message?.slice(0, 80)}
                    {notif.message?.length > 80 ? "…" : ""}
                  </div>
                  <div className="notif-item-time">{timeAgo(notif.dateEnvoi)}</div>
                </div>
                {isUnread && <span className="notif-dot" />}
              </div>
            );
          })}
      </div>

      {/* Footer */}
      <div className="notif-footer">
        <button
          className="notif-see-all"
          onClick={() => { setOpen(false); navigate(targetPage); }}
        >
          Voir toutes les notifications
          <i className="bi bi-arrow-right ms-1" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="notif-wrapper" ref={ref}>
      {/* Cloche */}
      <button className="notif-bell" onClick={handleOpen} title="Notifications">
        <i className="bi bi-bell-fill" />
        {unreadCount > 0 && (
          <span className="notif-badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Overlay mobile */}
      {isMobile && open && (
        <div className="notif-overlay" onClick={handleClose} />
      )}

      {/* Dropdown */}
      {open && dropdownContent}
    </div>
  );
}