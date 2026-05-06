// src/components/SidebarAdmin.jsx
import React, { useState, useEffect } from "react";
import { Image } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import defaultAvatar from "../images/default-avatar.jpg";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./SidebarAdmin.css";

const MENU_ITEMS = [
  { icon: "bi-speedometer2",      label: "Tableau de bord",      path: "/dashboard-admin" },
  { icon: "bi-people-fill",       label: "Patients",             path: "/admin/patients" },
  { icon: "bi-person-badge-fill", label: "Médecins",             path: "/admin/medecins" },
  { icon: "bi-hourglass-split",   label: "Médecins en attente",  path: "/admin/attente" },
  { icon: "bi-bar-chart-line-fill", label: "Statistiques",       path: "/admin/statistiques" },
  { icon: "bi-mortarboard-fill",  label: "Éducation",            path: "/admin/education" },
];

function SidebarAdmin({ admin, onShowAide }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => setCollapsed(window.innerWidth < 992);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className={`sa-sidebar ${collapsed ? "sa-collapsed" : ""}`}>

      {/* ── Logo ── */}
      <div className="sa-logo" onClick={() => navigate("/dashboard-admin")}>
        <div className="sa-logo-icon">
          <Image src={require("../images/logo-diabete.png")} alt="Logo" width="36" height="36" />
        </div>
        {!collapsed && (
          <span className="sa-logo-text">
            Suivi<span className="sa-logo-accent">Diabète</span> SN
          </span>
        )}
      </div>

      {/* ── Toggle ── */}
      <button
        className="sa-toggle"
        onClick={() => setCollapsed((c) => !c)}
        title={collapsed ? "Agrandir" : "Réduire"}
      >
        <i className={`bi ${collapsed ? "bi-chevron-right" : "bi-chevron-left"}`}></i>
      </button>

      {/* ── Profil ── */}
      <div
        className="sa-profile"
        onClick={() => navigate("/admin/profil")}
        title={admin?.username || ""}
      >
        <div className="sa-avatar-wrap">
          <Image src={defaultAvatar} roundedCircle className="sa-avatar" />
          <span className="sa-status-dot"></span>
        </div>
        {!collapsed && admin && (
          <div className="sa-profile-info">
            <div className="sa-profile-name">{admin.username}</div>
            <div className="sa-profile-role">Administrateur</div>
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="sa-nav">
        <ul className="sa-menu">
          {MENU_ITEMS.map((item) => (
            <li
              key={item.path}
              className={`sa-item ${isActive(item.path) ? "sa-item--active" : ""}`}
              onClick={() => navigate(item.path)}
              title={collapsed ? item.label : ""}
            >
              <i className={`bi ${item.icon} sa-icon`}></i>
              {!collapsed && <span className="sa-label">{item.label}</span>}
              {collapsed  && <span className="sa-tooltip">{item.label}</span>}
            </li>
          ))}
        </ul>
      </nav>

      {/* ── Footer ── */}
      <div className="sa-footer">
        <div
          className="sa-item"
          onClick={onShowAide}
          title={collapsed ? "Aide" : ""}
        >
          <i className="bi bi-question-circle-fill sa-icon"></i>
          {!collapsed && <span className="sa-label">Aide</span>}
          {collapsed  && <span className="sa-tooltip">Aide</span>}
        </div>
        <div
          className="sa-item sa-item--logout"
          onClick={handleLogout}
          title={collapsed ? "Déconnexion" : ""}
        >
          <i className="bi bi-box-arrow-right sa-icon"></i>
          {!collapsed && <span className="sa-label">Déconnexion</span>}
          {collapsed  && <span className="sa-tooltip">Déconnexion</span>}
        </div>
      </div>
    </div>
  );
}

export default SidebarAdmin;