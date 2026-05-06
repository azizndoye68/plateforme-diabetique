import React, { useState } from 'react';
import api from '../services/api';
import { Container, Button, Form, Spinner } from 'react-bootstrap';
import { FaUser, FaArrowRight, FaArrowLeft, FaCheckCircle, FaLock, FaEnvelope, FaHeartbeat, FaMapMarkerAlt, FaUserMd } from 'react-icons/fa';
import './RegisterPatientForm.css'; // ← partage le même CSS

function RegisterPatientForm() {
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', confirmPassword: '',
    role: 'PATIENT', prenom: '', nom: '', telephone: '',
    dateNaissance: '', sexe: '', typeDiabete: '',
    adresse: '', ville: '', region: '', numeroProfessionnelMedecin: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = "Nom d'utilisateur obligatoire";
    else if (formData.username.length < 3 || formData.username.length > 50) newErrors.username = "Entre 3 et 50 caractères";
    if (!formData.email.trim()) newErrors.email = "Email obligatoire";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Format email invalide";
    if (!formData.password) newErrors.password = "Mot de passe obligatoire";
    else if (formData.password.length < 5) newErrors.password = "Au moins 5 caractères";
    if (!formData.confirmPassword) newErrors.confirmPassword = "Confirmation obligatoire";
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.prenom.trim()) newErrors.prenom = "Prénom obligatoire";
    else if (formData.prenom.length < 2 || formData.prenom.length > 50) newErrors.prenom = "Entre 2 et 50 caractères";
    if (!formData.nom.trim()) newErrors.nom = "Nom obligatoire";
    else if (formData.nom.length < 2 || formData.nom.length > 50) newErrors.nom = "Entre 2 et 50 caractères";
    if (!formData.telephone.trim()) newErrors.telephone = "Téléphone obligatoire";
    else if (!/^[0-9]{9,15}$/.test(formData.telephone)) newErrors.telephone = "9 à 15 chiffres";
    if (!formData.dateNaissance) newErrors.dateNaissance = "Date de naissance obligatoire";
    else if (new Date(formData.dateNaissance) >= new Date()) newErrors.dateNaissance = "Doit être dans le passé";
    if (!formData.sexe) newErrors.sexe = "Sexe obligatoire";
    if (!formData.typeDiabete) newErrors.typeDiabete = "Type de diabète obligatoire";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    if (formData.adresse && formData.adresse.length > 255) newErrors.adresse = "Max 255 caractères";
    if (formData.ville && formData.ville.length > 100) newErrors.ville = "Max 100 caractères";
    if (formData.region && formData.region.length > 100) newErrors.region = "Max 100 caractères";
    if (formData.numeroProfessionnelMedecin) {
      if (formData.numeroProfessionnelMedecin.length < 3 || formData.numeroProfessionnelMedecin.length > 50)
        newErrors.numeroProfessionnelMedecin = "Entre 3 et 50 caractères";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStep1Next = () => {
    if (!validateStep1()) { setMessage('error'); return; }
    setMessage(''); setStep(2);
  };

  const handleStep2Next = () => {
    if (!validateStep2()) { setMessage('error'); return; }
    setMessage(''); setStep(3);
  };

  const handleFinalSubmit = async () => {
    if (!validateStep3()) { setMessage('error'); return; }
    setLoading(true); setMessage('');
    try {
      const authResponse = await api.post('/api/auth/register', {
        username: formData.username, email: formData.email,
        password: formData.password, role: formData.role,
      });
      const utilisateurId = authResponse.data.id;
      await api.post('/api/patients', {
        utilisateurId, prenom: formData.prenom, nom: formData.nom,
        telephone: formData.telephone, dateNaissance: formData.dateNaissance,
        sexe: formData.sexe, typeDiabete: formData.typeDiabete,
        adresse: formData.adresse || null, ville: formData.ville || null,
        region: formData.region || null,
        numeroProfessionnelMedecin: formData.numeroProfessionnelMedecin || null,
      });
      setStep(4);
    } catch (error) {
      setMessage(error.response?.data?.message || "Erreur lors de l'inscription");
    } finally { setLoading(false); }
  };

  const steps = [
    { label: 'Compte', icon: <FaLock /> },
    { label: 'Profil', icon: <FaUser /> },
    { label: 'Localisation', icon: <FaMapMarkerAlt /> },
  ];

  return (
    <div className="med-wrapper">
      <Container className="med-container">
        <div className="med-card">

          {/* Header */}
          <div className="med-header">
            <div className="med-header-badge">
              <FaHeartbeat />
              <span>DiabèteConnect</span>
            </div>
            <h2 className="med-header-title">Inscription Patient</h2>
            <p className="med-header-subtitle">Créez votre espace de suivi personnalisé</p>
          </div>

          {/* Stepper */}
          {step <= 3 && (
            <div className="med-stepper-section">
              <div className="med-stepper">
                {steps.map((s, i) => {
                  const num = i + 1;
                  const isActive = step === num;
                  const isDone = step > num;
                  return (
                    <React.Fragment key={num}>
                      <div className={`med-stepper-item ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}>
                        <div className="med-stepper-circle">
                          {isDone ? <FaCheckCircle /> : s.icon}
                        </div>
                        <span className="med-stepper-label">{s.label}</span>
                      </div>
                      {i < steps.length - 1 && (
                        <div className={`med-stepper-connector ${isDone ? 'done' : ''}`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
              <div className="med-stepper-track">
                <div className="med-stepper-fill" style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }} />
              </div>
            </div>
          )}

          {/* Alert */}
          {message && message !== 'error' && (
            <div className="med-alert" onClick={() => setMessage('')}>⚠️ {message}</div>
          )}
          {message === 'error' && (
            <div className="med-alert" onClick={() => setMessage('')}>⚠️ Veuillez corriger les erreurs avant de continuer</div>
          )}

          {/* Body */}
          <div className="med-body">

            {/* STEP 1 — Compte */}
            {step === 1 && (
              <Form onSubmit={(e) => { e.preventDefault(); handleStep1Next(); }} noValidate>
                <div className="med-step-heading">
                  <FaLock className="med-step-icon" />
                  <h5>Créez votre compte</h5>
                </div>

                <Form.Group className="med-fg">
                  <Form.Label>Nom d'utilisateur <span className="med-req">*</span></Form.Label>
                  <div className="med-field-wrap">
                    <FaUser className="med-field-icon" />
                    <Form.Control type="text" name="username" placeholder="johndoe" value={formData.username} onChange={handleChange} isInvalid={!!errors.username} className="med-input" />
                  </div>
                  <Form.Control.Feedback type="invalid">{errors.username}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="med-fg">
                  <Form.Label>Adresse email <span className="med-req">*</span></Form.Label>
                  <div className="med-field-wrap">
                    <FaEnvelope className="med-field-icon" />
                    <Form.Control type="email" name="email" placeholder="exemple@email.com" value={formData.email} onChange={handleChange} isInvalid={!!errors.email} className="med-input" />
                  </div>
                  <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                </Form.Group>

                <div className="row g-3">
                  <div className="col-6">
                    <Form.Group className="med-fg">
                      <Form.Label>Mot de passe <span className="med-req">*</span></Form.Label>
                      <div className="med-field-wrap">
                        <FaLock className="med-field-icon" />
                        <Form.Control type="password" name="password" placeholder="••••••" value={formData.password} onChange={handleChange} isInvalid={!!errors.password} className="med-input" />
                      </div>
                      <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
                    </Form.Group>
                  </div>
                  <div className="col-6">
                    <Form.Group className="med-fg">
                      <Form.Label>Confirmation <span className="med-req">*</span></Form.Label>
                      <div className="med-field-wrap">
                        <FaLock className="med-field-icon" />
                        <Form.Control type="password" name="confirmPassword" placeholder="••••••" value={formData.confirmPassword} onChange={handleChange} isInvalid={!!errors.confirmPassword} className="med-input" />
                      </div>
                      <Form.Control.Feedback type="invalid">{errors.confirmPassword}</Form.Control.Feedback>
                    </Form.Group>
                  </div>
                </div>

                <div className="med-footer med-footer--end">
                  <Button type="submit" className="med-btn-primary">
                    Suivant <FaArrowRight />
                  </Button>
                </div>
              </Form>
            )}

            {/* STEP 2 — Profil + Médical */}
            {step === 2 && (
              <Form onSubmit={(e) => { e.preventDefault(); handleStep2Next(); }} noValidate>
                <div className="med-step-heading">
                  <FaUser className="med-step-icon" />
                  <h5>Informations personnelles</h5>
                </div>

                <div className="row g-3">
                  <div className="col-6">
                    <Form.Group className="med-fg">
                      <Form.Label>Prénom <span className="med-req">*</span></Form.Label>
                      <Form.Control type="text" name="prenom" placeholder="Jean" value={formData.prenom} onChange={handleChange} isInvalid={!!errors.prenom} className="med-input med-input--bare" />
                      <Form.Control.Feedback type="invalid">{errors.prenom}</Form.Control.Feedback>
                    </Form.Group>
                  </div>
                  <div className="col-6">
                    <Form.Group className="med-fg">
                      <Form.Label>Nom <span className="med-req">*</span></Form.Label>
                      <Form.Control type="text" name="nom" placeholder="Dupont" value={formData.nom} onChange={handleChange} isInvalid={!!errors.nom} className="med-input med-input--bare" />
                      <Form.Control.Feedback type="invalid">{errors.nom}</Form.Control.Feedback>
                    </Form.Group>
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-6">
                    <Form.Group className="med-fg">
                      <Form.Label>Téléphone <span className="med-req">*</span></Form.Label>
                      <Form.Control type="tel" name="telephone" placeholder="771234567" value={formData.telephone} onChange={handleChange} isInvalid={!!errors.telephone} className="med-input med-input--bare" />
                      <Form.Control.Feedback type="invalid">{errors.telephone}</Form.Control.Feedback>
                    </Form.Group>
                  </div>
                  <div className="col-6">
                    <Form.Group className="med-fg">
                      <Form.Label>Date de naissance <span className="med-req">*</span></Form.Label>
                      <Form.Control type="date" name="dateNaissance" value={formData.dateNaissance} onChange={handleChange} isInvalid={!!errors.dateNaissance} className="med-input med-input--bare" />
                      <Form.Control.Feedback type="invalid">{errors.dateNaissance}</Form.Control.Feedback>
                    </Form.Group>
                  </div>
                </div>

                <div className="med-step-heading" style={{ marginTop: '0.75rem' }}>
                  <FaHeartbeat className="med-step-icon" />
                  <h5>Informations médicales</h5>
                </div>

                <div className="row g-3">
                  <div className="col-6">
                    <Form.Group className="med-fg">
                      <Form.Label>Sexe <span className="med-req">*</span></Form.Label>
                      <Form.Select name="sexe" value={formData.sexe} onChange={handleChange} isInvalid={!!errors.sexe} className="med-input med-input--bare">
                        <option value="">Sélectionnez...</option>
                        <option value="HOMME">Homme</option>
                        <option value="FEMME">Femme</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">{errors.sexe}</Form.Control.Feedback>
                    </Form.Group>
                  </div>
                  <div className="col-6">
                    <Form.Group className="med-fg">
                      <Form.Label>Type de diabète <span className="med-req">*</span></Form.Label>
                      <Form.Select name="typeDiabete" value={formData.typeDiabete} onChange={handleChange} isInvalid={!!errors.typeDiabete} className="med-input med-input--bare">
                        <option value="">Sélectionnez...</option>
                        <option value="TYPE1">Type 1</option>
                        <option value="TYPE2">Type 2</option>
                        <option value="GESTATIONNEL">Gestationnel</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">{errors.typeDiabete}</Form.Control.Feedback>
                    </Form.Group>
                  </div>
                </div>

                <div className="med-footer">
                  <Button className="med-btn-back" onClick={() => setStep(1)}><FaArrowLeft /> Retour</Button>
                  <Button type="submit" className="med-btn-primary">Suivant <FaArrowRight /></Button>
                </div>
              </Form>
            )}

            {/* STEP 3 — Localisation + Médecin */}
            {step === 3 && (
              <Form onSubmit={(e) => { e.preventDefault(); handleFinalSubmit(); }} noValidate>
                <div className="med-step-heading">
                  <FaMapMarkerAlt className="med-step-icon" />
                  <h5>Localisation <span className="med-optional">(optionnel)</span></h5>
                </div>

                <Form.Group className="med-fg">
                  <Form.Label>Adresse</Form.Label>
                  <Form.Control type="text" name="adresse" placeholder="Avenue Cheikh Anta Diop" value={formData.adresse} onChange={handleChange} isInvalid={!!errors.adresse} className="med-input med-input--bare" />
                  <Form.Control.Feedback type="invalid">{errors.adresse}</Form.Control.Feedback>
                </Form.Group>

                <div className="row g-3">
                  <div className="col-6">
                    <Form.Group className="med-fg">
                      <Form.Label>Ville</Form.Label>
                      <Form.Control type="text" name="ville" placeholder="Dakar" value={formData.ville} onChange={handleChange} isInvalid={!!errors.ville} className="med-input med-input--bare" />
                      <Form.Control.Feedback type="invalid">{errors.ville}</Form.Control.Feedback>
                    </Form.Group>
                  </div>
                  <div className="col-6">
                    <Form.Group className="med-fg">
                      <Form.Label>Région</Form.Label>
                      <Form.Control type="text" name="region" placeholder="Dakar" value={formData.region} onChange={handleChange} isInvalid={!!errors.region} className="med-input med-input--bare" />
                      <Form.Control.Feedback type="invalid">{errors.region}</Form.Control.Feedback>
                    </Form.Group>
                  </div>
                </div>

                <div className="med-step-heading" style={{ marginTop: '0.75rem' }}>
                  <FaUserMd className="med-step-icon" />
                  <h5>Rattachement médecin <span className="med-optional">(optionnel)</span></h5>
                </div>

                <Form.Group className="med-fg">
                  <Form.Label>Numéro professionnel du médecin</Form.Label>
                  <Form.Control type="text" name="numeroProfessionnelMedecin" placeholder="Ex : MED25A1F" value={formData.numeroProfessionnelMedecin} onChange={handleChange} isInvalid={!!errors.numeroProfessionnelMedecin} className="med-input med-input--bare" />
                  <Form.Control.Feedback type="invalid">{errors.numeroProfessionnelMedecin}</Form.Control.Feedback>
                  <p className="med-hint">Demandez ce code à votre médecin pour être automatiquement suivi.</p>
                </Form.Group>

                <div className="med-footer">
                  <Button className="med-btn-back" onClick={() => setStep(2)}><FaArrowLeft /> Retour</Button>
                  <Button type="submit" className="med-btn-primary" disabled={loading}>
                    {loading ? <><Spinner animation="border" size="sm" /> Inscription...</> : <>S'inscrire <FaCheckCircle /></>}
                  </Button>
                </div>
              </Form>
            )}

            {/* STEP 4 — Succès */}
            {step === 4 && (
              <div className="med-success">
                <div className="med-success-ring">
                  <div className="med-success-icon">
                    <FaCheckCircle />
                  </div>
                </div>
                <h3 className="med-success-title">Bienvenue !</h3>
                <p className="med-success-msg">
                  Votre compte patient a été créé avec succès. Vous pouvez maintenant vous connecter et commencer votre suivi.
                </p>
                <ul className="med-success-list">
                  <li>Connectez-vous avec vos identifiants</li>
                  <li>Complétez votre profil si nécessaire</li>
                  <li>Enregistrez vos premières mesures</li>
                  <li>Suivez vos statistiques en temps réel</li>
                </ul>
                <Button className="med-btn-primary med-btn-login" onClick={() => window.location.href = '/login'}>
                  Se connecter <FaArrowRight />
                </Button>
              </div>
            )}

          </div>
        </div>
      </Container>
    </div>
  );
}

export default RegisterPatientForm;