import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Navbar, Container, Nav } from "react-bootstrap";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaQuestionCircle,
  FaUser,
  FaUserMd,
} from "react-icons/fa";
import "./RegisterChoice.css";
import logoDiabete from "../images/logo-diabete.png";

function RegisterChoice() {
  const navigate = useNavigate();

  return (
    <div className="rc-page">
      <div className="rc-topbar">
        <div className="rc-topbar-inner">
          <div className="rc-topbar-left">
            <span>FR | SN</span>
            <span>
              <FaPhoneAlt /> +221 77 123 45 67
            </span>
            <span className="rc-divider">|</span>
            <span>Lun - Ven | 9h - 17h</span>
          </div>
          <span>
            <FaEnvelope /> contact@diabete-plateforme.sn
          </span>
        </div>
      </div>

      <Navbar expand="lg" className="rc-navbar">
        <Container fluid>
          <Navbar.Brand href="/" className="rc-brand">
            <img src={logoDiabete} alt="Logo" width="38" height="38" />
            <span>
              Suivi<span className="rc-highlight">Diabète</span> SN
            </span>
          </Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse>
            <Nav className="ms-auto d-flex align-items-center gap-3">
              <Nav.Link href="#aide">
                <FaQuestionCircle /> Aide
              </Nav.Link>
              <Button className="rc-btn-primary">INSCRIPTION</Button>
              <Button
                className="rc-btn-outline"
                onClick={() => navigate("/login")}
              >
                CONNEXION
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <div className="rc-content">
        <Container>
          <div className="rc-header">
            <span className="rc-badge">REJOIGNEZ-NOUS</span>
            <h1>
              Créez votre <span className="rc-highlight">compte</span>
            </h1>
            <p className="rc-sub">
              Choisissez le type de compte qui correspond à votre profil
            </p>
            <p className="rc-login-text">
              Vous avez déjà un compte ?{" "}
              <button
                className="rc-login-link"
                onClick={() => navigate("/login")}
              >
                Connectez-vous
              </button>
            </p>
          </div>

          <div className="rc-cards">
            <div
              className="rc-card rc-card--patient"
              onClick={() => navigate("/register/patient")}
            >
              <div className="rc-card-head rc-card-head--patient">
                <div className="rc-icon">
                  <FaUser />
                </div>
              </div>
              <div className="rc-card-body">
                <h3>Je suis patient(e)</h3>
                <p>
                  Suivez votre glycémie et gérez votre traitement en toute
                  simplicité
                </p>
                <ul>
                  <li>Suivi de glycémie personnalisé</li>
                  <li>Messagerie avec votre médecin</li>
                  <li>Statistiques et graphiques</li>
                </ul>
                <div className="rc-action rc-action--patient">Commencer →</div>
              </div>
            </div>

            <div
              className="rc-card rc-card--medecin"
              onClick={() => navigate("/register/medecin")}
            >
              <div className="rc-card-head rc-card-head--medecin">
                <div className="rc-icon">
                  <FaUserMd />
                </div>
              </div>
              <div className="rc-card-body">
                <h3>Je suis professionnel de santé</h3>
                <p>
                  Gérez vos patients et assurez un accompagnement médical
                  optimal
                </p>
                <ul>
                  <li>Gestion de patients</li>
                  <li>Tableau de bord médical</li>
                  <li>Outils de suivi avancés</li>
                </ul>
                <div className="rc-action rc-action--medecin">Commencer →</div>
              </div>
            </div>
          </div>

          <div className="rc-benefits">
            <h4>Pourquoi choisir SuiviDiabète ?</h4>
            <div className="rc-benefits-grid">
              {[
                {
                  icon: "bi bi-shield-check",
                  title: "Sécurisé",
                  text: "Vos données de santé sont protégées et cryptées",
                },
                {
                  icon: "bi bi-people",
                  title: "Collaboratif",
                  text: "Connexion directe entre patients et professionnels",
                },
                {
                  icon: "bi bi-graph-up-arrow",
                  title: "Efficace",
                  text: "Suivi en temps réel et analyses détaillées",
                },
              ].map((b) => (
                <div className="rc-benefit" key={b.title}>
                  <div className="rc-benefit-icon">
                    <i className={b.icon}></i>
                  </div>
                  <h6>{b.title}</h6>
                  <p>{b.text}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}

export default RegisterChoice;
