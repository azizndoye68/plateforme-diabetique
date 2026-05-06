// src/pages/AjouterDonneeJournee.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Form, Button, Card, Nav, Tab } from 'react-bootstrap';
import SidebarPatient from '../../components/SidebarPatient';
import AideModal from '../../components/AideModal';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircleFill } from 'react-bootstrap-icons';
import './AjouterDonneeJournee.css';

function AjouterDonneeJournee() {
  // États pour les 3 formulaires
  const [donneesGlycemie, setDonneesGlycemie] = useState({
    glycemie: '',
    moment: '',
    repas: '',
  });

  const [donneesPhysiques, setDonneesPhysiques] = useState({
    poids: '',
    tension: '',
  });

  const [journalBord, setJournalBord] = useState({
    repas: '',
    activitePhysique: '',
    symptomes: '',
    evenements: '',
  });

  const [activeTab, setActiveTab] = useState('glycemie');
  const [success, setSuccess] = useState({ show: false, type: '' });
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAide, setShowAide] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const navigate = useNavigate();
  const { patientId } = useParams();

  const now = new Date();
  const dateString = now.toLocaleDateString('fr-FR');
  const timeString = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  // Horloge en temps réel
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Récupération du patient
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        if (patientId) {
          const res = await api.get(`/api/patients/${patientId}`);
          setPatient(res.data);
        } else {
          const profileRes = await api.get('/api/auth/profile');
          const utilisateurId = profileRes.data.id;
          const patientRes = await api.get(`/api/patients/byUtilisateur/${utilisateurId}`);
          setPatient(patientRes.data);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du patient', error);
      }
    };
    fetchPatient();
  }, [patientId]);

  // Handlers pour glycémie
  const handleChangeGlycemie = (e) => {
    setDonneesGlycemie({ ...donneesGlycemie, [e.target.name]: e.target.value });
  };

  const handleSubmitGlycemie = async (e) => {
    e.preventDefault();
    if (!patient) return alert('Erreur : patient non identifié.');

    const payload = {
      ...donneesGlycemie,
      dateSuivi: new Date().toISOString(),
      patientId: patient.id,
    };

    try {
      setLoading(true);
      await api.post('/api/suivis', payload);
      setLoading(false);
      setSuccess({ show: true, type: 'glycemie' });
      setDonneesGlycemie({ glycemie: '', moment: '', repas: '' });
    } catch (error) {
      setLoading(false);
      alert("Erreur lors de l'enregistrement ❌");
      console.error('Erreur:', error);
    }
  };

  // Handlers pour données physiques
  const handleChangePhysique = (e) => {
    setDonneesPhysiques({ ...donneesPhysiques, [e.target.name]: e.target.value });
  };

  const handleSubmitPhysique = async (e) => {
    e.preventDefault();
    if (!patient) return alert('Erreur : patient non identifié.');

    const payload = {
      ...donneesPhysiques,
      patientId: patient.id,
    };

    try {
      setLoading(true);
      await api.post('/api/donnees-physiques', payload);
      setLoading(false);
      setSuccess({ show: true, type: 'physique' });
      setDonneesPhysiques({ poids: '', tension: '' });
    } catch (error) {
      setLoading(false);
      alert("Erreur lors de l'enregistrement ❌");
      console.error('Erreur:', error);
    }
  };

  // Handlers pour journal de bord
  const handleChangeJournal = (e) => {
    setJournalBord({ ...journalBord, [e.target.name]: e.target.value });
  };

  const handleSubmitJournal = async (e) => {
    e.preventDefault();
    if (!patient) return alert('Erreur : patient non identifié.');

    const payload = {
      ...journalBord,
      patientId: patient.id,
    };

    try {
      setLoading(true);
      await api.post('/api/journal-bord', payload);
      setLoading(false);
      setSuccess({ show: true, type: 'journal' });
      setJournalBord({ repas: '', activitePhysique: '', symptomes: '', evenements: '' });
    } catch (error) {
      setLoading(false);
      alert("Erreur lors de l'enregistrement ❌");
      console.error('Erreur:', error);
    }
  };

  const getSuccessMessage = () => {
    switch (success.type) {
      case 'glycemie':
        return 'Mesure de glycémie enregistrée avec succès !';
      case 'physique':
        return 'Données physiques enregistrées avec succès !';
      case 'journal':
        return 'Entrée du journal de bord enregistrée avec succès !';
      default:
        return 'Données enregistrées avec succès !';
    }
  };

  const SuccessScreen = () => (
    <Card className="success-card-modern">
      <Card.Body className="text-center p-5">
        <div className="success-icon mb-4">
          <CheckCircleFill size={80} />
        </div>
        <h3 className="fw-bold mb-3">{getSuccessMessage()}</h3>
        <p className="text-muted mb-4">
          Vos données ont été sauvegardées le {dateString} à {timeString}.
        </p>
        <div className="d-flex justify-content-center gap-3 flex-wrap">
          <Button 
            variant="outline-primary" 
            className="btn-action-outline"
            onClick={() => setSuccess({ show: false, type: '' })}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Ajouter d'autres données
          </Button>
          <Button
            variant="primary"
            className="btn-action"
            onClick={() => {
              if (patientId) {
                navigate(`/medecin/patient/${patientId}/dashboard`);
              } else {
                navigate('/dashboard-patient');
              }
            }}
          >
            <i className="bi bi-house-fill me-2"></i>
            Retour au tableau de bord
          </Button>
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <div className="ajouter-donnee-wrapper">
      <SidebarPatient 
        patient={patient} 
        isMedecin={!!patientId}
        onShowAide={() => setShowAide(true)}
      />

      <div className="ajouter-donnee-main-content">
        {/* En-tête moderne */}
        <div className="ajouter-donnee-header">
          <div className="header-content">
            <div className="welcome-section">
              <div className="greeting-text">
                <h1 className="display-6 fw-bold mb-0">
                  <i className="bi bi-clipboard-data-fill me-3"></i>
                  Ajouter des données
                </h1>
                <p className="text-muted mb-0">
                  {patient ? `Suivi de ${patient.prenom} ${patient.nom}` : 'Chargement...'}
                </p>
              </div>
              <div className="header-time">
                <div className="time-display">
                  {currentTime.toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>

            <div className="header-actions">
              <Button
                variant="light"
                className="action-header-btn"
                onClick={() => navigate(patientId ? `/medecin/patient/${patientId}/dashboard` : '/dashboard-patient')}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Retour
              </Button>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="ajouter-donnee-content">
          {!success.show ? (
            <Card className="form-tabs-card">
              <Card.Body className="p-0">
                <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                  {/* Navigation par onglets */}
                  <div className="tabs-header">
                    <Nav variant="pills" className="custom-tabs">
                      <Nav.Item>
                        <Nav.Link eventKey="glycemie" className="tab-link">
                          <div className="tab-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                            <i className="bi bi-droplet-half"></i>
                          </div>
                          <div className="tab-text">
                            <div className="tab-title">Glycémie</div>
                            <small>Mesure de glycémie</small>
                          </div>
                        </Nav.Link>
                      </Nav.Item>

                      <Nav.Item>
                        <Nav.Link eventKey="physique" className="tab-link">
                          <div className="tab-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                            <i className="bi bi-heart-pulse-fill"></i>
                          </div>
                          <div className="tab-text">
                            <div className="tab-title">Données physiques</div>
                            <small>Poids et tension</small>
                          </div>
                        </Nav.Link>
                      </Nav.Item>

                      <Nav.Item>
                        <Nav.Link eventKey="journal" className="tab-link">
                          <div className="tab-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                            <i className="bi bi-journal-text"></i>
                          </div>
                          <div className="tab-text">
                            <div className="tab-title">Journal de bord</div>
                            <small>Notes quotidiennes</small>
                          </div>
                        </Nav.Link>
                      </Nav.Item>
                    </Nav>
                  </div>

                  {/* Contenu des onglets */}
                  <div className="tabs-content p-4">
                    <Tab.Content>
                      {/* Formulaire Glycémie */}
                      <Tab.Pane eventKey="glycemie">
                        <div className="form-header mb-4">
                          <h5 className="fw-bold">
                            <i className="bi bi-droplet-half me-2 text-primary"></i>
                            Mesure de glycémie
                          </h5>
                          <p className="text-muted mb-0">
                            Enregistrez votre taux de glycémie
                          </p>
                        </div>

                        <Form onSubmit={handleSubmitGlycemie}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">
                              <i className="bi bi-graph-up me-2"></i>
                              Taux de glycémie (g/L)
                            </Form.Label>
                            <Form.Control
                              type="number"
                              step="0.01"
                              min="0.0"
                              max="5"
                              name="glycemie"
                              value={donneesGlycemie.glycemie}
                              onChange={handleChangeGlycemie}
                              required
                              placeholder="Ex: 1.20"
                              className="form-input"
                            />
                            <Form.Text className="text-muted">
                              Valeur normale: 0.70 - 1.80 g/L
                            </Form.Text>
                          </Form.Group>

                          <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">
                              <i className="bi bi-clock me-2"></i>
                              Moment de la prise
                            </Form.Label>
                            <Form.Select 
                              name="moment" 
                              value={donneesGlycemie.moment} 
                              onChange={handleChangeGlycemie} 
                              required
                              className="form-input"
                            >
                              <option value="">-- Sélectionner --</option>
                              <option value="avant_repas">Avant repas</option>
                              <option value="apres_repas">Après repas</option>
                            </Form.Select>
                          </Form.Group>

                          <Form.Group className="mb-4">
                            <Form.Label className="fw-semibold">
                              <i className="bi bi-cup-hot me-2"></i>
                              Type de repas
                            </Form.Label>
                            <Form.Select 
                              name="repas" 
                              value={donneesGlycemie.repas} 
                              onChange={handleChangeGlycemie}
                              className="form-input"
                            >
                              <option value="">-- Sélectionner --</option>
                              <option value="petit_dejeuner">Petit déjeuner</option>
                              <option value="dejeuner">Déjeuner</option>
                              <option value="diner">Dîner</option>
                              <option value="collation">Collation</option>
                            </Form.Select>
                          </Form.Group>

                          <Button 
                            variant="primary" 
                            type="submit" 
                            className="w-100 btn-submit" 
                            disabled={loading}
                          >
                            {loading ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Enregistrement...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-check-circle me-2"></i>
                                Enregistrer la glycémie
                              </>
                            )}
                          </Button>
                        </Form>
                      </Tab.Pane>

                      {/* Formulaire Données Physiques */}
                      <Tab.Pane eventKey="physique">
                        <div className="form-header mb-4">
                          <h5 className="fw-bold">
                            <i className="bi bi-heart-pulse-fill me-2" style={{ color: '#f5576c' }}></i>
                            Données physiques
                          </h5>
                          <p className="text-muted mb-0">
                            Enregistrez votre poids et tension artérielle
                          </p>
                        </div>

                        <Form onSubmit={handleSubmitPhysique}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">
                              <i className="bi bi-speedometer2 me-2"></i>
                              Poids (Kg)
                            </Form.Label>
                            <Form.Control
                              type="number"
                              step="0.1"
                              min="0"
                              max="300"
                              name="poids"
                              value={donneesPhysiques.poids}
                              onChange={handleChangePhysique}
                              placeholder="Ex: 75.5"
                              className="form-input"
                            />
                            <Form.Text className="text-muted">
                              Entrez votre poids en kilogrammes
                            </Form.Text>
                          </Form.Group>

                          <Form.Group className="mb-4">
                            <Form.Label className="fw-semibold">
                              <i className="bi bi-activity me-2"></i>
                              Tension artérielle
                            </Form.Label>
                            <Form.Control
                              type="text"
                              name="tension"
                              value={donneesPhysiques.tension}
                              onChange={handleChangePhysique}
                              placeholder="Ex: 12/8"
                              className="form-input"
                            />
                            <Form.Text className="text-muted">
                              Format: systolique/diastolique (ex: 12/8)
                            </Form.Text>
                          </Form.Group>

                          <Button 
                            variant="primary" 
                            type="submit" 
                            className="w-100 btn-submit" 
                            disabled={loading}
                          >
                            {loading ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Enregistrement...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-check-circle me-2"></i>
                                Enregistrer les données physiques
                              </>
                            )}
                          </Button>
                        </Form>
                      </Tab.Pane>

                      {/* Formulaire Journal de Bord */}
                      <Tab.Pane eventKey="journal">
                        <div className="form-header mb-4">
                          <h5 className="fw-bold">
                            <i className="bi bi-journal-text me-2" style={{ color: '#00f2fe' }}></i>
                            Journal de bord
                          </h5>
                          <p className="text-muted mb-0">
                            Notez vos activités et observations quotidiennes
                          </p>
                        </div>

                        <Form onSubmit={handleSubmitJournal}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">
                              <i className="bi bi-egg-fried me-2"></i>
                              Description du repas
                            </Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={3}
                              name="repas"
                              value={journalBord.repas}
                              onChange={handleChangeJournal}
                              placeholder="Décrivez ce que vous avez mangé..."
                              className="form-input"
                            />
                          </Form.Group>

                          <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">
                              <i className="bi bi-bicycle me-2"></i>
                              Activité physique
                            </Form.Label>
                            <Form.Select 
                              name="activitePhysique" 
                              value={journalBord.activitePhysique} 
                              onChange={handleChangeJournal}
                              className="form-input"
                            >
                              <option value="">-- Sélectionner --</option>
                              <option value="Aucune">Aucune</option>
                              <option value="Légère">Légère (marche)</option>
                              <option value="Modérée">Modérée (jogging, vélo)</option>
                              <option value="Intense">Intense (sport intensif)</option>
                            </Form.Select>
                          </Form.Group>

                          <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">
                              <i className="bi bi-thermometer-half me-2"></i>
                              Symptômes ressentis
                            </Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={2}
                              name="symptomes"
                              value={journalBord.symptomes}
                              onChange={handleChangeJournal}
                              placeholder="Ex: Hypoglycémie, vertige, fatigue..."
                              className="form-input"
                            />
                          </Form.Group>

                          <Form.Group className="mb-4">
                            <Form.Label className="fw-semibold">
                              <i className="bi bi-clipboard-pulse me-2"></i>
                              Événements de santé
                            </Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={2}
                              name="evenements"
                              value={journalBord.evenements}
                              onChange={handleChangeJournal}
                              placeholder="Ex: Stress, maladie, changement de traitement..."
                              className="form-input"
                            />
                          </Form.Group>

                          <Button 
                            variant="primary" 
                            type="submit" 
                            className="w-100 btn-submit" 
                            disabled={loading}
                          >
                            {loading ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Enregistrement...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-check-circle me-2"></i>
                                Enregistrer dans le journal
                              </>
                            )}
                          </Button>
                        </Form>
                      </Tab.Pane>
                    </Tab.Content>
                  </div>
                </Tab.Container>
              </Card.Body>
            </Card>
          ) : (
            <SuccessScreen />
          )}
        </div>
      </div>

      <AideModal show={showAide} onHide={() => setShowAide(false)} />
    </div>
  );
}

export default AjouterDonneeJournee;