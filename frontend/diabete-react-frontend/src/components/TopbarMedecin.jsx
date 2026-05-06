// src/components/TopbarMedecin.jsx
import React from "react";
import { Navbar, Nav, Image, Dropdown } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaChartLine,
  FaEnvelope,
  FaUser,
  FaUsers,
  FaCalendarAlt,
  FaSignOutAlt,
} from "react-icons/fa";
import defaultAvatar from "../images/default-avatar.jpg";
import "./TopbarMedecin.css";
import NotificationDropdown from "./NotificationDropdown"; // 🆕
import { useNotifications } from "../hooks/useNotifications"; // 🆕

function TopbarMedecin({ user }) {
  const navigate = useNavigate();
  const location = useLocation();

  // 🆕 Hook notifications branché sur medecinId
  const {
    notifications,
    unreadCount,
    loading: notifLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications(user?.id, "medecin");

  const navItems = [
    { path: "/dashboard-medecin", label: "Mes patients", icon: <FaUsers /> },
    { path: "/medecin/messagerie", label: "Messagerie", icon: <FaEnvelope />, badge: 3 },
    { path: "/medecin/statistiques", label: "Statistiques", icon: <FaChartLine /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <Navbar className="topbar-medecin" expand="lg">
      <div className="topbar-container">
        {/* Logo */}
        <Navbar.Brand
          className="topbar-brand"
          onClick={() => navigate("/dashboard-medecin")}
        >
          <div className="logo-wrapper">
            <Image
              src={require("../images/logo-diabete.png")}
              width={40}
              height={40}
            />
          </div>
          <span className="brand-name">
            Suivi<span className="brand-highlight">Diabète</span> SN
          </span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="topbar-nav" className="topbar-toggle" />

        <Navbar.Collapse id="topbar-nav">
          {/* Navigation */}
          <Nav className="topbar-nav mx-auto">
            {navItems.map((item, idx) => (
              <Nav.Link
                key={idx}
                onClick={() => navigate(item.path)}
                className={`topbar-nav-link ${
                  location.pathname === item.path ? "active" : ""
                }`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {item.badge && (
                  <span className="nav-badge">{item.badge}</span>
                )}
              </Nav.Link>
            ))}
          </Nav>

          {/* Actions à droite */}
          <div className="topbar-actions">
            {/* 🆕 Cloche dynamique */}
            <div className="notification-wrapper">
              <NotificationDropdown
                patientId={user?.id}
                role="medecin"
                notifications={notifications}
                unreadCount={unreadCount}
                loading={notifLoading}
                onOpen={fetchNotifications}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
                navigateTo="/medecin/notifications" // 🆕 page dédiée médecin
              />
            </div>

            {/* Profil avec dropdown */}
            <Dropdown align="end" className="profile-dropdown">
              <Dropdown.Toggle as="div" className="profile-toggle">
                <div className="profile-info">
                  <div className="profile-text">
                    <span className="profile-name">
                      Dr. {user?.prenom || "Médecin"} {user?.nom || ""}
                    </span>
                    <span className="profile-role">Médecin</span>
                  </div>
                  <div className="profile-avatar-wrapper">
                    <Image
                      src={defaultAvatar}
                      roundedCircle
                      width={45}
                      height={45}
                      className="profile-avatar"
                    />
                    <span className="status-indicator"></span>
                  </div>
                </div>
              </Dropdown.Toggle>

              <Dropdown.Menu className="profile-menu">
                <div className="profile-menu-header">
                  <Image src={defaultAvatar} roundedCircle width={50} height={50} />
                  <div className="ms-3">
                    <div className="fw-bold">
                      Dr. {user?.prenom} {user?.nom}
                    </div>
                    <small className="text-muted">{user?.email}</small>
                  </div>
                </div>

                <Dropdown.Divider />

                <Dropdown.Item
                  onClick={() => navigate("/medecin/profil")}
                  className="profile-menu-item"
                >
                  <FaUser className="menu-icon" />
                  <span>Mon compte</span>
                </Dropdown.Item>

                <Dropdown.Item
                  onClick={() => navigate("/medecin/equipes-medicales")}
                  className="profile-menu-item"
                >
                  <FaUsers className="menu-icon" />
                  <span>Mes équipes</span>
                </Dropdown.Item>

                <Dropdown.Item
                  onClick={() => navigate("/medecin/liste-rendezvous")}
                  className="profile-menu-item"
                >
                  <FaCalendarAlt className="menu-icon" />
                  <span>Rendez-vous</span>
                </Dropdown.Item>

                <Dropdown.Divider />

                <Dropdown.Item
                  onClick={handleLogout}
                  className="profile-menu-item logout-item"
                >
                  <FaSignOutAlt className="menu-icon" />
                  <span>Déconnexion</span>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Navbar.Collapse>
      </div>
    </Navbar>
  );
}

export default TopbarMedecin;