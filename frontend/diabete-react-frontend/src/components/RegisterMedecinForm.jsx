import React, { useState } from 'react';
import api from '../services/api';
import { Container, Button, Form, Spinner } from 'react-bootstrap';
import { FaUserMd, FaArrowRight, FaArrowLeft, FaCheckCircle, FaUser, FaBriefcase, FaLock, FaEnvelope } from 'react-icons/fa';
import './RegisterMedecinForm.css';

function RegisterMedecinForm() {
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [utilisateurId, setUtilisateurId] = useState(null);
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', confirmPassword: '',
    role: 'MEDECIN', prenom: '', nom: '', telephone: '',
    dateNaissance: '', sexe: '', specialite: '', nomService: '',
    adresse: '', ville: '', region: '',
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
    else {
      const birthDate = new Date(formData.dateNaissance);
      const today = new Date();
      if (birthDate >= today) newErrors.dateNaissance = "Doit être dans le passé";
      else if (today.getFullYear() - birthDate.getFullYear() < 18) newErrors.dateNaissance = "Minimum 18 ans";
    }
    if (!formData.sexe) newErrors.sexe = "Sexe obligatoire";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    if (!formData.specialite.trim()) newErrors.specialite = "Spécialité obligatoire";
    if (!formData.nomService.trim()) newErrors.nomService = "Nom du service obligatoire";
    if (formData.adresse && formData.adresse.length > 255) newErrors.adresse = "Max 255 caractères";
    if (formData.ville && formData.ville.length > 100) newErrors.ville = "Max 100 caractères";
    if (formData.region && formData.region.length > 100) newErrors.region = "Max 100 caractères";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitAuth = async () => {
    if (!validateStep1()) { setMessage('error'); return; }
    try {
      setLoading(true); setMessage('');
      const authResponse = await api.post('/api/auth/register', {
        username: formData.username, email: formData.email,
        password: formData.password, role: formData.role,
      });
      const id = authResponse.data.id;
      if (!id) throw new Error('ID manquant');
      setUtilisateurId(id); setStep(2);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Erreur lors de la création du compte');
    } finally { setLoading(false); }
  };

  const handleStep2Next = () => {
    if (!validateStep2()) { setMessage('error'); return; }
    setMessage(''); setStep(3);
  };

  const submitMedecin = async () => {
    if (!validateStep3()) { setMessage('error'); return; }
    try {
      setLoading(true); setMessage('');
      await api.post('/api/medecins', {
        utilisateurId, prenom: formData.prenom, nom: formData.nom,
        telephone: formData.telephone, dateNaissance: formData.dateNaissance,
        sexe: formData.sexe, specialite: formData.specialite,
        nomService: formData.nomService, adresse: formData.adresse || null,
        ville: formData.ville || null, region: formData.region || null,
      });
      setStep(4);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Erreur lors de la création du profil');
    } finally { setLoading(false); }
  };

  const steps = [
    { label: 'Compte', icon: <FaLock /> },
    { label: 'Profil', icon: <FaUser /> },
    { label: 'Professionnel', icon: <FaBriefcase /> },
  ];

  return (
    <div className="med-wrapper">
      <Container className="med-container">
        <div className="med-card">

          {/* Header */}
          <div className="med-header">
            <div className="med-header-badge">
              <FaUserMd />
              <span>DiabèteConnect</span>
            </div>
            <h2 className="med-header-title">Inscription Médecin</h2>
            <p className="med-header-subtitle">Rejoignez notre plateforme de suivi diabète</p>
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
              <Form onSubmit={(e) => { e.preventDefault(); submitAuth(); }} noValidate>
                <div className="med-step-heading">
                  <FaLock className="med-step-icon" />
                  <h5>Créez votre compte</h5>
                </div>

                <Form.Group className="med-fg">
                  <Form.Label>Nom d'utilisateur <span className="med-req">*</span></Form.Label>
                  <div className="med-field-wrap">
                    <FaUser className="med-field-icon" />
                    <Form.Control type="text" name="username" placeholder="dr.dupont" value={formData.username} onChange={handleChange} isInvalid={!!errors.username} className="med-input" />
                  </div>
                  <Form.Control.Feedback type="invalid">{errors.username}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="med-fg">
                  <Form.Label>Adresse email <span className="med-req">*</span></Form.Label>
                  <div className="med-field-wrap">
                    <FaEnvelope className="med-field-icon" />
                    <Form.Control type="email" name="email" placeholder="exemple@hopital.sn" value={formData.email} onChange={handleChange} isInvalid={!!errors.email} className="med-input" />
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
                  <Button type="submit" className="med-btn-primary" disabled={loading}>
                    {loading ? <><Spinner animation="border" size="sm" /> Création...</> : <>Suivant <FaArrowRight /></>}
                  </Button>
                </div>
              </Form>
            )}

            {/* STEP 2 — Profil personnel */}
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

                <Form.Group className="med-fg">
                  <Form.Label>Sexe <span className="med-req">*</span></Form.Label>
                  <Form.Select name="sexe" value={formData.sexe} onChange={handleChange} isInvalid={!!errors.sexe} className="med-input med-input--bare">
                    <option value="">Sélectionnez...</option>
                    <option value="HOMME">Homme</option>
                    <option value="FEMME">Femme</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.sexe}</Form.Control.Feedback>
                </Form.Group>

                <div className="med-footer">
                  <Button className="med-btn-back" onClick={() => setStep(1)}><FaArrowLeft /> Retour</Button>
                  <Button type="submit" className="med-btn-primary">Suivant <FaArrowRight /></Button>
                </div>
              </Form>
            )}

            {/* STEP 3 — Infos professionnelles */}
            {step === 3 && (
              <Form onSubmit={(e) => { e.preventDefault(); submitMedecin(); }} noValidate>
                <div className="med-step-heading">
                  <FaBriefcase className="med-step-icon" />
                  <h5>Informations professionnelles</h5>
                </div>

                <div className="row g-3">
                  <div className="col-6">
                    <Form.Group className="med-fg">
                      <Form.Label>Spécialité <span className="med-req">*</span></Form.Label>
                      <Form.Select name="specialite" value={formData.specialite} onChange={handleChange} isInvalid={!!errors.specialite} className="med-input med-input--bare">
                        <option value="">Sélectionnez...</option>
                        <option value="Généraliste">Médecin Généraliste</option>
                        <option value="Diabétologue">Diabétologue</option>
                        <option value="Endocrinologue">Endocrinologue</option>
                        <option value="Cardiologue">Cardiologue</option>
                        <option value="Pédiatre">Pédiatre</option>
                        <option value="Gynécologue">Gynécologue</option>
                        <option value="Ophtalmologue">Ophtalmologue</option>
                        <option value="Néphrologue">Néphrologue</option>
                        <option value="Nutritionniste">Nutritionniste</option>
                        <option value="Infirmier">Infirmier</option>
                        <option value="Autre">Autre</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">{errors.specialite}</Form.Control.Feedback>
                    </Form.Group>
                  </div>
                  <div className="col-6">
                    <Form.Group className="med-fg">
                      <Form.Label>Nom du service <span className="med-req">*</span></Form.Label>
                      <Form.Control type="text" name="nomService" placeholder="Hôpital Principal" value={formData.nomService} onChange={handleChange} isInvalid={!!errors.nomService} className="med-input med-input--bare" />
                      <Form.Control.Feedback type="invalid">{errors.nomService}</Form.Control.Feedback>
                    </Form.Group>
                  </div>
                </div>

                <Form.Group className="med-fg">
                  <Form.Label>Adresse <span className="med-optional">(optionnel)</span></Form.Label>
                  <Form.Control type="text" name="adresse" placeholder="Avenue Cheikh Anta Diop" value={formData.adresse} onChange={handleChange} isInvalid={!!errors.adresse} className="med-input med-input--bare" />
                  <Form.Control.Feedback type="invalid">{errors.adresse}</Form.Control.Feedback>
                </Form.Group>

                <div className="row g-3">
                  <div className="col-6">
                    <Form.Group className="med-fg">
                      <Form.Label>Ville <span className="med-optional">(optionnel)</span></Form.Label>
                      <Form.Control type="text" name="ville" placeholder="Dakar" value={formData.ville} onChange={handleChange} isInvalid={!!errors.ville} className="med-input med-input--bare" />
                      <Form.Control.Feedback type="invalid">{errors.ville}</Form.Control.Feedback>
                    </Form.Group>
                  </div>
                  <div className="col-6">
                    <Form.Group className="med-fg">
                      <Form.Label>Région <span className="med-optional">(optionnel)</span></Form.Label>
                      <Form.Control type="text" name="region" placeholder="Dakar" value={formData.region} onChange={handleChange} isInvalid={!!errors.region} className="med-input med-input--bare" />
                      <Form.Control.Feedback type="invalid">{errors.region}</Form.Control.Feedback>
                    </Form.Group>
                  </div>
                </div>

                <div className="med-footer">
                  <Button className="med-btn-back" onClick={() => setStep(2)}><FaArrowLeft /> Retour</Button>
                  <Button type="submit" className="med-btn-primary" disabled={loading}>
                    {loading ? <><Spinner animation="border" size="sm" /> Envoi...</> : <>Soumettre <FaCheckCircle /></>}
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
                <h3 className="med-success-title">Demande envoyée !</h3>
                <p className="med-success-msg">
                  Votre demande est en attente de validation par l'administrateur.
                </p>
                <ul className="med-success-list">
                  <li>Votre profil sera examiné par notre équipe</li>
                  <li>Vous recevrez un email de confirmation</li>
                  <li>Une fois validé, vous pourrez vous connecter</li>
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

export default RegisterMedecinForm;