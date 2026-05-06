// src/components/HomePage.jsx
import React, { useEffect } from "react";
import {
  Button,
  Navbar,
  Container,
  Nav,
  Row,
  Col,
  Card,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaPhoneAlt, FaEnvelope, FaQuestionCircle } from "react-icons/fa";
import suiviGlycemie from "../images/Suivi_Glycemie.png";
import logoDiabete from "../images/logo-diabete.png";
import Footer from "./Footer.jsx";

// Images type diabète
import diabeteType1 from "../images/diabete-type1.png";
import diabeteType2 from "../images/diabete-type2.png";
import diabeteGest from "../images/diabete-gest.png";

import AOS from "aos";
import "aos/dist/aos.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./HomePage.css";

function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  return (
    <div>
      {/* Top bar */}
      <div className="top-bar">
        <div className="top-bar-content container-fluid">
          <div className="top-bar-left">
            <span>FR | SN</span>
            <div className="d-flex align-items-center gap-2">
              <FaPhoneAlt style={{ fontSize: "0.85rem" }} />
              <span>+221 77 123 45 67</span>
            </div>
            <span className="top-bar-divider">|</span>
            <span style={{ opacity: 0.9 }}>Lun - Ven | 9h - 17h</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <FaEnvelope style={{ fontSize: "0.85rem" }} />
            <span>contact@diabete-plateforme.sn</span>
          </div>
        </div>
      </div>

      {/* Navbar */}
      <Navbar expand="lg" className="navbar-custom">
        <Container fluid>
          <Navbar.Brand href="/" className="d-flex align-items-center">
            <div className="logo-container">
              <img
                src={logoDiabete}
                alt="Logo Diabète"
                width="45"
                height="45"
              />
            </div>
            <span className="brand-text">SuiviDiabète SN</span>
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="navbar-nav" />
          <Navbar.Collapse id="navbar-nav">
            <Nav className="ms-auto d-flex align-items-center gap-3">
              <Nav.Link href="#aide" className="nav-link-help">
                <FaQuestionCircle /> Aide
              </Nav.Link>
              <Button
                className="btn-inscription"
                onClick={() => navigate("/register/choice")}
              >
                INSCRIPTION
              </Button>
              <Button
                className="btn-connexion"
                onClick={() => navigate("/login")}
              >
                CONNEXION
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Hero Section */}
      <div className="hero-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-5 mb-lg-0" data-aos="fade-right">
              <div className="hero-badge">PLATEFORME DE TÉLÉSUIVI</div>

              <h1 className="hero-title">
                Gérez votre diabète en toute{" "}
                <span className="gradient-text">sérénité</span>
              </h1>

              <p className="hero-description">
                La solution numérique de télésuivi médical pensée pour le
                Sénégal. Connectez-vous facilement avec votre équipe médicale
                pour un accompagnement personnalisé, où que vous soyez.
              </p>

              <div className="d-flex gap-3 flex-wrap mb-4">
                <Button
                  size="lg"
                  className="btn-cta-primary"
                  onClick={() => navigate("/register/choice")}
                >
                  Commencer maintenant
                  <i className="bi bi-arrow-right ms-2"></i>
                </Button>

                <Button
                  size="lg"
                  className="btn-cta-secondary"
                  onClick={() => navigate("/login")}
                >
                  En savoir plus
                </Button>
              </div>

              {/* Mini stats */}
              <Row className="hero-stats g-4">
                <Col xs={4}>
                  <div className="stat-item">
                    <h3 className="stat-number">24/7</h3>
                    <p className="stat-label">Disponibilité</p>
                  </div>
                </Col>
                <Col xs={4}>
                  <div className="stat-item">
                    <h3 className="stat-number">1000+</h3>
                    <p className="stat-label">Patients actifs</p>
                  </div>
                </Col>
                <Col xs={4}>
                  <div className="stat-item">
                    <h3 className="stat-number">98%</h3>
                    <p className="stat-label">Satisfaction</p>
                  </div>
                </Col>
              </Row>
            </Col>

            <Col lg={6} data-aos="fade-left">
              <div className="hero-image">
                <img
                  src={suiviGlycemie}
                  alt="Suivi Glycémie"
                  className="img-fluid"
                />
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Section Types de diabète */}
      <section className="types-section">
        <Container>
          <div data-aos="fade-up">
            <div className="section-badge">COMPRENDRE LE DIABÈTE</div>
            <h2 className="section-title">Les différents types de diabète</h2>
            <p className="section-description">
              Découvrez les caractéristiques de chaque type pour mieux
              comprendre votre condition
            </p>
          </div>
          <Row className="g-4">
            {/* Type 1 */}
            <Col md={4} data-aos="fade-up" data-aos-delay="100">
              <Card className="type-card type-1">
                <div className="type-card-header bg-purple">
                  <img src={diabeteType1} alt="Type 1" />
                </div>
                <Card.Body className="type-card-body">
                  <h5 className="type-card-title">Diabète de type 1</h5>
                  <p className="type-card-text">
                    Maladie auto-immune, souvent détectée chez l'enfant ou le
                    jeune adulte. Le corps ne produit pas d'insuline.
                  </p>
                </Card.Body>
              </Card>
            </Col>

            {/* Type 2 */}
            <Col md={4} data-aos="fade-up" data-aos-delay="200">
              <Card className="type-card type-2">
                <div className="type-card-header bg-yellow">
                  <img src={diabeteType2} alt="Type 2" />
                </div>
                <Card.Body className="type-card-body">
                  <h5 className="type-card-title">Diabète de type 2</h5>
                  <p className="type-card-text">
                    Résistance à l'insuline ou production insuffisante, souvent
                    lié au mode de vie et détecté chez l'adulte.
                  </p>
                </Card.Body>
              </Card>
            </Col>

            {/* Diabète gestationnel */}
            <Col md={4} data-aos="fade-up" data-aos-delay="300">
              <Card className="type-card type-3">
                <div className="type-card-header bg-blue">
                  <img src={diabeteGest} alt="Gestationnel" />
                </div>
                <Card.Body className="type-card-body">
                  <h5 className="type-card-title">Diabète gestationnel</h5>
                  <p className="type-card-text">
                    Survient pendant la grossesse. Une surveillance régulière
                    est essentielle pour la mère et l'enfant.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      <Footer />
    </div>
  );
}

export default HomePage;
