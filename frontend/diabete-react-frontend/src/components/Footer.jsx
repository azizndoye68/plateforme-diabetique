// src/components/Footer.jsx
import React from "react";
import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin } from "lucide-react";
import logo from "../images/logo-diabete.png";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="container">
          <div className="footer-grid">
            {/* Logo et description */}
            <div className="footer-section footer-brand">
              <div className="footer-logo-wrapper">
                <div className="logo-container-footer">
                  <img src={logo} alt="SuiviDiabète SN" className="footer-logo" />
                </div>
                <h4 className="brand-name-footer">
                  Suivi<span className="brand-highlight-footer">Diabète</span> SN
                </h4>
              </div>
              <p className="footer-description">
                Plateforme moderne de télésuivi médical pour patients diabétiques.
                Un accompagnement personnalisé et accessible, partout au Sénégal.
              </p>
              <div className="footer-social-section">
                <h6 className="social-title">Suivez-nous</h6>
                <div className="social-icons">
                  <button className="social-btn" aria-label="Facebook">
                    <Facebook size={20} />
                  </button>
                  <button className="social-btn" aria-label="Twitter">
                    <Twitter size={20} />
                  </button>
                  <button className="social-btn" aria-label="LinkedIn">
                    <Linkedin size={20} />
                  </button>
                  <button className="social-btn" aria-label="Instagram">
                    <Instagram size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Liens rapides */}
            <div className="footer-section">
              <h5 className="footer-title">Liens rapides</h5>
              <ul className="footer-links">
                <li><button className="footer-link">Accueil</button></li>
                <li><button className="footer-link">Nos services</button></li>
                <li><button className="footer-link">Équipe médicale</button></li>
                <li><button className="footer-link">Éducation</button></li>
                <li><button className="footer-link">Ressources</button></li>
              </ul>
            </div>

            {/* Pour les patients */}
            <div className="footer-section">
              <h5 className="footer-title">Patients</h5>
              <ul className="footer-links">
                <li><button className="footer-link">Mon espace</button></li>
                <li><button className="footer-link">Suivi glycémie</button></li>
                <li><button className="footer-link">Rendez-vous</button></li>
                <li><button className="footer-link">Messagerie</button></li>
                <li><button className="footer-link">Aide & Support</button></li>
              </ul>
            </div>

            {/* Contact */}
            <div className="footer-section">
              <h5 className="footer-title">Contact</h5>
              <ul className="footer-contact">
                <li className="contact-item">
                  <MapPin size={18} />
                  <span>Dakar, Sénégal</span>
                </li>
                <li className="contact-item">
                  <Phone size={18} />
                  <span>+221 77 123 45 67</span>
                </li>
                <li className="contact-item">
                  <Mail size={18} />
                  <span>contact@diabete-plateforme.sn</span>
                </li>
              </ul>
              <div className="footer-hours">
                <h6 className="hours-title">Horaires</h6>
                <p className="hours-text">Lun - Ven: 9h - 17h</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer bas */}
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <p className="copyright">
              &copy; {new Date().getFullYear()} SuiviDiabète SN. Tous droits réservés.
            </p>
            <div className="footer-legal">
              <button className="legal-link">Confidentialité</button>
              <span className="separator">•</span>
              <button className="legal-link">Conditions d'utilisation</button>
              <span className="separator">•</span>
              <button className="legal-link">Mentions légales</button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;