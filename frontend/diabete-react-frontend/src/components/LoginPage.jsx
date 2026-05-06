import React, { useState } from "react";
import api from "../services/api";
import {
  Nav,
  Navbar,
  Form,
  Button,
  Container,
  Alert,
  Card,
} from "react-bootstrap";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaQuestionCircle,
  FaLock,
  FaEnvelope as FaEmailIcon,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import logoDiabete from "../images/logo-diabete.png";
import "./LoginForm.css";

function LoginForm() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Validation de l'email
  const validateEmail = (email) => {
    if (!email || email.trim() === "") {
      return "L'email est obligatoire";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Format email invalide";
    }
    return "";
  };

  // Validation du mot de passe
  const validatePassword = (password) => {
    if (!password || password.trim() === "") {
      return "Le mot de passe est obligatoire";
    }
    if (password.length < 5) {
      return "Le mot de passe doit contenir au moins 5 caractères";
    }
    return "";
  };

  // Validation du formulaire complet
  const validateForm = () => {
    const emailError = validateEmail(credentials.email);
    const passwordError = validatePassword(credentials.password);

    setErrors({
      email: emailError,
      password: passwordError,
    });

    return !emailError && !passwordError;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Mettre à jour les credentials
    const newCredentials = { ...credentials, [name]: value };
    setCredentials(newCredentials);

    // Marquer le champ comme touché
    setTouched((prev) => ({ ...prev, [name]: true }));

    // Validation en temps réel avec la nouvelle valeur
    if (name === "email") {
      const emailError = validateEmail(value);
      setErrors((prev) => ({ ...prev, email: emailError }));
    } else if (name === "password") {
      const passwordError = validatePassword(value);
      setErrors((prev) => ({ ...prev, password: passwordError }));
    }

    // Nettoyer le message d'erreur général
    if (message) {
      setMessage("");
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    // Re-valider au blur
    if (name === "email") {
      setErrors((prev) => ({
        ...prev,
        email: validateEmail(credentials.email),
      }));
    } else if (name === "password") {
      setErrors((prev) => ({
        ...prev,
        password: validatePassword(credentials.password),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Marquer tous les champs comme touchés
    setTouched({
      email: true,
      password: true,
    });

    // Valider le formulaire
    if (!validateForm()) {
      setMessage("Veuillez corriger les erreurs dans le formulaire");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await api.post("/api/auth/login", credentials);
      console.log("Connexion réussie", response.data);

      // ✅ CORRECTION
      const { accessToken, refreshToken, userId, role } = response.data;

      localStorage.setItem("token", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("utilisateurId", userId);
      localStorage.setItem("role", role);

      setMessage("Connexion réussie ✅");

      setTimeout(() => {
        if (role === "PATIENT") {
          navigate("/dashboard-patient");
        } else if (role === "MEDECIN") {
          navigate("/dashboard-medecin");
        } else if (role === "ADMIN") {
          navigate("/dashboard-admin");
        } else {
          navigate("/");
        }
      }, 1000);
    } catch (error) {
      console.error("Erreur de connexion complète:", error);

      // Gérer les différents types d'erreurs
      if (error.response) {
        const { status, data } = error.response;
        const errorMessage = data?.error || data?.message || "";
        const isAuthError =
          errorMessage.toLowerCase().includes("incorrect") ||
          errorMessage.toLowerCase().includes("invalide") ||
          errorMessage.toLowerCase().includes("erronées") ||
          errorMessage.toLowerCase().includes("identifications") ||
          errorMessage.toLowerCase().includes("password") ||
          errorMessage.toLowerCase().includes("mot de passe") ||
          errorMessage.toLowerCase().includes("credentials");

        if (
          status === 401 ||
          status === 403 ||
          (status === 500 && isAuthError)
        ) {
          // Erreur d'authentification : email ou mot de passe incorrect
          setErrors({
            email: "Identifiants incorrects",
            password: "Identifiants incorrects",
          });
          setMessage(errorMessage || "Email ou mot de passe incorrect ❌");
        } else if (status === 400) {
          // Erreurs de validation du backend
          if (data.errors && Array.isArray(data.errors)) {
            const backendErrors = {};
            data.errors.forEach((err) => {
              if (err.field === "email") backendErrors.email = err.message;
              if (err.field === "password")
                backendErrors.password = err.message;
            });
            setErrors((prevErrors) => ({ ...prevErrors, ...backendErrors }));
            setMessage("Veuillez corriger les erreurs dans le formulaire ❌");
          } else {
            setMessage(errorMessage || "Données de connexion invalides ❌");
          }
        } else if (status === 404) {
          setErrors({
            email: "Aucun compte associé à cet email",
            password: "",
          });
          setMessage("Aucun compte trouvé avec cet email ❌");
        } else if (status === 500) {
          setMessage("Erreur serveur. Veuillez réessayer plus tard ❌");
        } else {
          setMessage(
            (errorMessage || "Une erreur est survenue. Veuillez réessayer") +
              " ❌",
          );
        }
      } else if (error.request) {
        setMessage(
          "Impossible de se connecter au serveur. Vérifiez votre connexion internet ❌",
        );
      } else {
        setMessage("Une erreur inattendue est survenue ❌");
      }

      setLoading(false);
    }
  };

  // Calculer si le formulaire est valide pour activer/désactiver le bouton
  const isFormValid = !!(
    credentials.email &&
    credentials.password &&
    !validateEmail(credentials.email) &&
    !validatePassword(credentials.password)
  );

  // Debug - À supprimer après test
  console.log("Debug Login:", {
    email: credentials.email,
    password: credentials.password,
    emailError: validateEmail(credentials.email),
    passwordError: validatePassword(credentials.password),
    isFormValid,
    loading,
  });

  return (
    <div className="login-page">
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
              <Button className="btn-connexion active">CONNEXION</Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Contenu principal */}
      <div className="login-content">
        <Container>
          <div className="login-wrapper">
            {/* Colonne gauche - Informations */}
            <div className="login-info">
              <div className="info-content">
                <h1 className="info-title">
                  Bienvenue sur{" "}
                  <span className="gradient-text-green">SuiviDiabète</span>
                </h1>
                <p className="info-description">
                  Connectez-vous pour accéder à votre espace personnel et gérer
                  votre suivi médical en toute simplicité.
                </p>

                <div className="info-features">
                  <div className="feature-item">
                    <div className="feature-icon">
                      <i className="bi bi-shield-check"></i>
                    </div>
                    <div>
                      <h6 className="feature-title">Sécurisé</h6>
                      <p className="feature-text">Vos données sont protégées</p>
                    </div>
                  </div>

                  <div className="feature-item">
                    <div className="feature-icon">
                      <i className="bi bi-clock-history"></i>
                    </div>
                    <div>
                      <h6 className="feature-title">Disponible 24/7</h6>
                      <p className="feature-text">Accès à tout moment</p>
                    </div>
                  </div>

                  <div className="feature-item">
                    <div className="feature-icon">
                      <i className="bi bi-heart-pulse"></i>
                    </div>
                    <div>
                      <h6 className="feature-title">Suivi personnalisé</h6>
                      <p className="feature-text">Accompagnement dédié</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne droite - Formulaire */}
            <div className="login-form-wrapper">
              <Card className="login-card">
                <div className="login-card-header">
                  <div className="login-icon">
                    <i className="bi bi-person-circle"></i>
                  </div>
                  <h3 className="login-title">Connexion</h3>
                  <p className="login-subtitle">
                    Accédez à votre espace personnel
                  </p>
                </div>

                {message && (
                  <Alert
                    variant={message.includes("réussie") ? "success" : "danger"}
                    className="login-alert"
                    dismissible
                    onClose={() => setMessage("")}
                  >
                    <div className="d-flex align-items-center">
                      <i
                        className={`bi ${message.includes("réussie") ? "bi-check-circle-fill" : "bi-exclamation-triangle-fill"} me-2`}
                      ></i>
                      {message}
                    </div>
                  </Alert>
                )}

                <Form onSubmit={handleSubmit} className="login-form" noValidate>
                  <Form.Group className="mb-4">
                    <Form.Label className="form-label-custom">
                      Adresse email <span className="text-danger">*</span>
                    </Form.Label>
                    <div className="input-with-icon">
                      <FaEmailIcon className="input-icon" />
                      <Form.Control
                        type="email"
                        name="email"
                        placeholder="votre@email.com"
                        value={credentials.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`form-control-custom ${errors.email && touched.email ? "is-invalid" : ""} ${!errors.email && touched.email && credentials.email ? "is-valid" : ""}`}
                        required
                      />
                      {errors.email && touched.email && (
                        <div className="invalid-feedback d-block">
                          <i className="bi bi-exclamation-circle me-1"></i>
                          {errors.email}
                        </div>
                      )}
                      {!errors.email && touched.email && credentials.email && (
                        <div className="valid-feedback d-block">
                          <i className="bi bi-check-circle me-1"></i>
                          Email valide
                        </div>
                      )}
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="form-label-custom">
                      Mot de passe <span className="text-danger">*</span>
                    </Form.Label>
                    <div className="input-with-icon">
                      <FaLock className="input-icon" />
                      <Form.Control
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        value={credentials.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`form-control-custom ${errors.password && touched.password ? "is-invalid" : ""} ${!errors.password && touched.password && credentials.password ? "is-valid" : ""}`}
                        required
                      />
                      {errors.password && touched.password && (
                        <div className="invalid-feedback d-block">
                          <i className="bi bi-exclamation-circle me-1"></i>
                          {errors.password}
                        </div>
                      )}
                      {!errors.password &&
                        touched.password &&
                        credentials.password && (
                          <div className="valid-feedback d-block">
                            <i className="bi bi-check-circle me-1"></i>
                            Mot de passe valide
                          </div>
                        )}
                    </div>
                  </Form.Group>

                  <div className="form-options">
                    <Form.Check
                      type="checkbox"
                      id="remember-me"
                      label="Se souvenir de moi"
                      className="remember-check"
                    />
                    <button type="button" className="forgot-password">
                      Mot de passe oublié ?
                    </button>
                  </div>

                  <Button
                    type="submit"
                    className="btn-login"
                    disabled={loading || !isFormValid}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Connexion en cours...
                      </>
                    ) : (
                      <>
                        Se connecter
                        <i className="bi bi-arrow-right ms-2"></i>
                      </>
                    )}
                  </Button>
                </Form>

                <div className="login-footer">
                  <p className="signup-text">
                    Pas encore de compte ?{" "}
                    <button
                      onClick={() => navigate("/register/choice")}
                      className="signup-link"
                    >
                      Inscrivez-vous
                    </button>
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}

export default LoginForm;
