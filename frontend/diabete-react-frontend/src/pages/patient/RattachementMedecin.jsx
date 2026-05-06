// src/pages/patient/RattachementMedecin.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './RattachementMedecin.css';

function RattachementMedecin() {
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [codeSuivi, setCodeSuivi] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Vérifier si le patient est déjà rattaché
  useEffect(() => {
    const checkPatientStatus = async () => {
      try {
        setChecking(true);
        const profileRes = await api.get('/api/auth/profile');
        const userData = profileRes.data;

        const patientRes = await api.get(`/api/patients/byUtilisateur/${userData.id}`);
        const patientData = patientRes.data;
        
        setPatient(patientData);

        // Si déjà rattaché, rediriger vers le chat
        if (patientData.medecinId) {
          navigate('/patient/messagerie', { replace: true });
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du statut:', error);
        setError('Impossible de récupérer vos informations');
      } finally {
        setChecking(false);
      }
    };

    checkPatientStatus();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!codeSuivi.trim()) {
      setError('Veuillez saisir le code de suivi');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.patch(
        `/api/patients/${patient.id}/rattacher-medecin?numeroProfessionnelMedecin=${codeSuivi.trim()}`
      );

      console.log('Rattachement réussi:', response.data);
      setSuccess('Rattachement réussi ! Redirection vers votre espace de discussion...');

      // Rediriger vers le chat après 2 secondes avec replace pour éviter de revenir en arrière
      setTimeout(() => {
        navigate('/patient/messagerie', { replace: true });
      }, 2000);

    } catch (error) {
      console.error('Erreur rattachement:', error);
      
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 404) {
          setError('Code de suivi invalide. Veuillez vérifier le code fourni par votre médecin.');
        } else if (status === 400) {
          setError(data.message || 'Le code de suivi est incorrect ou invalide.');
        } else {
          setError('Une erreur est survenue. Veuillez réessayer.');
        }
      } else {
        setError('Impossible de se connecter au serveur. Vérifiez votre connexion internet.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    // Rediriger vers le dashboard patient au lieu de history.back()
    navigate('/dashboard-patient', { replace: true });
  };

  const handleChange = (e) => {
    const value = e.target.value.toUpperCase().trim();
    setCodeSuivi(value);
    
    // Effacer les erreurs quand l'utilisateur modifie le code
    if (error) {
      setError('');
    }
  };

  if (checking) {
    return (
      <div className="rattachement-container">
        <div className="d-flex justify-content-center align-items-center h-100">
          <div className="text-center">
            <Spinner animation="border" variant="primary" className="mb-3" />
            <p className="text-muted">Vérification de votre profil...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rattachement-container">
      <Container className="h-100 d-flex align-items-center justify-content-center">
        <Row className="w-100 justify-content-center">
          <Col lg={6} md={8}>
            <Card className="rattachement-card">
              {/* Header */}
              <div className="rattachement-header">
                <div className="header-back-btn">
                  <Button 
                    variant="link" 
                    className="btn-back-dashboard"
                    onClick={handleGoBack}
                    disabled={loading || success}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Retour au tableau de bord
                  </Button>
                </div>
                <div className="header-icon">
                  <i className="bi bi-person-plus-fill"></i>
                </div>
                <h3 className="header-title">Rejoignez votre équipe soignante</h3>
                <p className="header-subtitle">
                  Entrez le code de suivi fourni par votre médecin pour accéder à votre espace de discussion
                </p>
              </div>

              <Card.Body className="p-4">
                {/* Alerts */}
                {error && (
                  <Alert variant="danger" dismissible onClose={() => setError('')} className="custom-alert">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      {error}
                    </div>
                  </Alert>
                )}

                {success && (
                  <Alert variant="success" className="custom-alert">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-check-circle-fill me-2"></i>
                      {success}
                    </div>
                  </Alert>
                )}

                {/* Informations patient */}
                {patient && (
                  <div className="patient-info mb-4">
                    <div className="patient-avatar">
                      {patient.prenom?.[0]}{patient.nom?.[0]}
                    </div>
                    <div>
                      <h6 className="mb-1">{patient.prenom} {patient.nom}</h6>
                      <small className="text-muted">
                        <i className="bi bi-envelope me-1"></i>
                        Compte créé avec succès
                      </small>
                    </div>
                  </div>
                )}

                {/* Instructions */}
                <div className="instructions-box mb-4">
                  <h6 className="instructions-title">
                    <i className="bi bi-info-circle me-2"></i>
                    Comment obtenir votre code de suivi ?
                  </h6>
                  <ul className="instructions-list">
                    <li>Demandez votre code à votre médecin traitant</li>
                    <li>Le code se présente sous la forme : <strong>MED25XXX</strong></li>
                    <li>Saisissez-le ci-dessous pour accéder à votre espace</li>
                  </ul>
                </div>

                {/* Formulaire */}
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4">
                    <Form.Label className="form-label-custom">
                      <i className="bi bi-key-fill me-2"></i>
                      Code de suivi médical
                      <span className="text-danger ms-1">*</span>
                    </Form.Label>
                    <div className="code-input-wrapper">
                      <i className="bi bi-shield-lock input-icon"></i>
                      <Form.Control
                        type="text"
                        placeholder="Ex: MED25A1F"
                        value={codeSuivi}
                        onChange={handleChange}
                        className="code-input"
                        maxLength={20}
                        required
                        disabled={loading || success}
                      />
                    </div>
                    <Form.Text className="text-muted">
                      <i className="bi bi-lightbulb me-1"></i>
                      Respectez les majuscules et minuscules
                    </Form.Text>
                  </Form.Group>

                  <div className="d-grid gap-2">
                    <Button
                      type="submit"
                      className="btn-rattacher"
                      disabled={loading || !codeSuivi.trim() || success}
                    >
                      {loading ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            className="me-2"
                          />
                          Vérification en cours...
                        </>
                      ) : success ? (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Rattaché avec succès
                        </>
                      ) : (
                        <>
                          <i className="bi bi-link-45deg me-2"></i>
                          Se rattacher à mon médecin
                        </>
                      )}
                    </Button>
                  </div>
                </Form>

                {/* Aide supplémentaire */}
                <div className="help-section mt-4">
                  <Card className="help-card">
                    <Card.Body className="p-3">
                      <h6 className="help-title">
                        <i className="bi bi-question-circle me-2"></i>
                        Besoin d'aide ?
                      </h6>
                      <p className="help-text mb-2">
                        Si vous n'avez pas encore de code de suivi, contactez :
                      </p>
                      <div className="contact-info">
                        <div className="contact-item">
                          <i className="bi bi-telephone-fill"></i>
                          <span>+221 77 123 45 67</span>
                        </div>
                        <div className="contact-item">
                          <i className="bi bi-envelope-fill"></i>
                          <span>support@suividiabete.sn</span>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              </Card.Body>

              {/* Footer */}
              <div className="rattachement-footer">
                <small className="text-muted">
                  <i className="bi bi-shield-check me-1"></i>
                  Connexion sécurisée • Vos données sont protégées
                </small>
              </div>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default RattachementMedecin;