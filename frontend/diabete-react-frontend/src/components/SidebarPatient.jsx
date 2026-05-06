// src/components/SidebarPatient.jsx
import React, { useState, useEffect } from "react";
import { Image } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import defaultAvatar from "../images/default-avatar.jpg";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./SidebarPatient.css";

function SidebarPatient({ onShowAide, patient, isMedecin = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // Auto-collapse sur petit écran
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 992) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    {
      icon: "bi-grid-fill",
      label: "Tableau de bord",
      onClick: () => {
        if (isMedecin && patient?.id) navigate(`/medecin/patient/${patient.id}/dashboard`);
        else navigate("/dashboard-patient");
      },
      path: isMedecin && patient?.id ? `/medecin/patient/${patient.id}/dashboard` : "/dashboard-patient",
    },
    {
      icon: "bi-journal-medical",
      label: "Carnet",
      onClick: () => {
        if (isMedecin && patient?.id) navigate(`/medecin/patient/${patient.id}/carnet`);
        else navigate("/carnet");
      },
      path: isMedecin && patient?.id ? `/medecin/patient/${patient.id}/carnet` : "/carnet",
    },
    {
      icon: "bi-graph-up-arrow",
      label: "Mes statistiques",
      onClick: () => {
        if (isMedecin && patient?.id) navigate(`/medecin/patient/${patient.id}/statistiques`);
        else navigate("/patient/statistiques");
      },
      path: isMedecin && patient?.id ? `/medecin/patient/${patient.id}/statistiques` : "/patient/statistiques",
    },
    {
      icon: "bi-heart-pulse-fill",
      label: "Mon suivi",
      onClick: () => {
        if (isMedecin && patient?.id) navigate(`/medecin/patient/${patient.id}/mon-suivi`);
        else navigate("/mon-suivi");
      },
      path: isMedecin && patient?.id ? `/medecin/patient/${patient.id}/mon-suivi` : "/mon-suivi",
    },
    ...(!isMedecin ? [
      {
        icon: "bi-chat-dots-fill",
        label: "Équipe soignante",
        onClick: () => navigate("/patient/messagerie"),
        path: "/patient/messagerie",
      },
      {
        icon: "bi-book-fill",
        label: "Éducation partagée",
        onClick: () => navigate("/patient/education"),
        path: "/patient/education",
      },
    ] : []),
  ];

  const medecinItems = isMedecin && patient ? [
    {
      icon: "bi-clipboard2-pulse-fill",
      label: "Informations",
      onClick: () => navigate(`/medecin/patient/${patient.id}/traitements`),
      path: `/medecin/patient/${patient.id}/traitements`,
    },
    {
      icon: "bi-person-lines-fill",
      label: "Consultations",
      onClick: () => navigate(`/medecin/patient/${patient.id}/consultations`),
      path: `/medecin/patient/${patient.id}/consultations`,
    },
    {
      icon: "bi-calendar-check-fill",
      label: "Rendez-vous",
      onClick: () => navigate(`/medecin/patient/${patient.id}/rendez-vous`),
      path: `/medecin/patient/${patient.id}/rendez-vous`,
    },
    {
      icon: "bi-lightbulb-fill",
      label: "Conseils",
      onClick: () => navigate(`/medecin/patient/${patient.id}/conseils`),
      path: `/medecin/patient/${patient.id}/conseils`,
    },
  ] : [];

  return (
    <div className={`sp-sidebar ${collapsed ? "sp-collapsed" : ""}`}>

      {/* ── Logo ── */}
      <div
        className="sp-logo"
        onClick={() => navigate(isMedecin ? "/dashboard-medecin" : "/dashboard-patient")}
      >
        <div className="sp-logo-icon">
          <Image src={require("../images/logo-diabete.png")} alt="Logo" width="36" height="36" />
        </div>
        {!collapsed && (
          <span className="sp-logo-text">
            Suivi<span className="sp-logo-accent">Diabète</span> SN
          </span>
        )}
      </div>

      {/* ── Toggle button ── */}
      <button className="sp-toggle" onClick={() => setCollapsed((c) => !c)} title={collapsed ? "Agrandir" : "Réduire"}>
        <i className={`bi ${collapsed ? "bi-chevron-right" : "bi-chevron-left"}`}></i>
      </button>

      {/* ── Profil ── */}
      <div
        className="sp-profile"
        onClick={() => !isMedecin && navigate("/patient/profil")}
        title={patient ? `${patient.prenom} ${patient.nom}` : ""}
      >
        <div className="sp-avatar-wrap">
          <Image src={defaultAvatar} roundedCircle className="sp-avatar" />
          <span className="sp-status-dot"></span>
        </div>
        {!collapsed && patient && (
          <div className="sp-profile-info">
            <div className="sp-profile-name">{patient.prenom} {patient.nom}</div>
            <div className="sp-profile-role">{isMedecin ? "Vue médecin" : "Patient"}</div>
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="sp-nav">
        <ul className="sp-menu">
          {menuItems.map((item) => (
            <li
              key={item.path}
              className={`sp-item ${isActive(item.path) ? "sp-item--active" : ""}`}
              onClick={item.onClick}
              title={collapsed ? item.label : ""}
            >
              <i className={`bi ${item.icon} sp-icon`}></i>
              {!collapsed && <span className="sp-label">{item.label}</span>}
              {collapsed && <span className="sp-tooltip">{item.label}</span>}
            </li>
          ))}

          {/* Section médecin */}
          {medecinItems.length > 0 && (
            <>
              <div className="sp-divider"></div>
              {medecinItems.map((item) => (
                <li
                  key={item.path}
                  className={`sp-item ${isActive(item.path) ? "sp-item--active" : ""}`}
                  onClick={item.onClick}
                  title={collapsed ? item.label : ""}
                >
                  <i className={`bi ${item.icon} sp-icon`}></i>
                  {!collapsed && <span className="sp-label">{item.label}</span>}
                  {collapsed && <span className="sp-tooltip">{item.label}</span>}
                </li>
              ))}
            </>
          )}
        </ul>
      </nav>

      {/* ── Footer ── */}
      {!isMedecin && (
        <div className="sp-footer">
          <div
            className="sp-item"
            onClick={onShowAide}
            title={collapsed ? "Aide" : ""}
          >
            <i className="bi bi-question-circle-fill sp-icon"></i>
            {!collapsed && <span className="sp-label">Aide</span>}
            {collapsed && <span className="sp-tooltip">Aide</span>}
          </div>
          <div
            className="sp-item sp-item--logout"
            onClick={handleLogout}
            title={collapsed ? "Déconnexion" : ""}
          >
            <i className="bi bi-box-arrow-right sp-icon"></i>
            {!collapsed && <span className="sp-label">Déconnexion</span>}
            {collapsed && <span className="sp-tooltip">Déconnexion</span>}
          </div>
        </div>
      )}
    </div>
  );
}

export default SidebarPatient;