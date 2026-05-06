// src/pages/medecin/EquipesMedicales.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Container, Row, Col, Card, Button, Modal, Form, Badge, Spinner, Alert, Collapse } from "react-bootstrap";
import api from "../../services/api";
import TopbarMedecin from "../../components/TopbarMedecin";
import "./EquipesMedicales.css";

function EquipesMedicales() {
  const [medecin, setMedecin] = useState(null);
  const [equipes, setEquipes] = useState([]);
  const [allMedecins, setAllMedecins] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  
  // States pour les formulaires
  const [nomEquipe, setNomEquipe] = useState("");
  const [selectedEquipe, setSelectedEquipe] = useState(null);
  const [nouveauNom, setNouveauNom] = useState("");
  const [selectedMedecinToAdd, setSelectedMedecinToAdd] = useState("");
  const [expandedEquipes, setExpandedEquipes] = useState({});
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Récupération du profil médecin
  const loadMedecinProfile = useCallback(async () => {
    try {
      const profileRes = await api.get("/api/auth/profile");
      const user = profileRes.data;
      const medData = await api.get(`/api/medecins/byUtilisateur/${user.id}`);
      setMedecin(medData.data);
    } catch (error) {
      console.error("Erreur chargement profil médecin:", error);
    }
  }, []);

  // Récupération des équipes
  const loadEquipes = useCallback(async () => {
    if (!medecin?.id) return;

    try {
      const data = await api.get(`/api/equipes-medicales/medecin/${medecin.id}`);
      setEquipes(data.data || []);
    } catch (error) {
      console.error("Erreur chargement équipes:", error);
      setEquipes([]);
    }
  }, [medecin]);

  // Récupération de tous les médecins
  const loadAllMedecins = useCallback(async () => {
    try {
      const res = await api.get("/api/medecins");
      setAllMedecins(res.data || []);
    } catch (error) {
      console.error("Erreur chargement médecins:", error);
    }
  }, []);

  useEffect(() => {
    loadMedecinProfile();
  }, [loadMedecinProfile]);

  useEffect(() => {
    loadEquipes();
  }, [loadEquipes]);

  useEffect(() => {
    loadAllMedecins();
  }, [loadAllMedecins]);

  useEffect(() => {
    if (equipes.length > 0) {
      setLoading(false);
    }
  }, [equipes]);

  // Créer une équipe
  const handleCreateEquipe = async (e) => {
    e.preventDefault();
    
    if (!nomEquipe.trim()) {
      setError("Le nom de l'équipe est obligatoire");
      return;
    }
    
    try {
      await api.post(`/api/equipes-medicales?medecinId=${medecin.id}`, {
        nom: nomEquipe.trim()
      });
      
      setSuccess("Équipe créée avec succès !");
      setNomEquipe("");
      setShowCreateModal(false);
      await loadEquipes();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Erreur création équipe:", error);
      setError(error.response?.data?.message || "Erreur lors de la création de l'équipe");
    }
  };

  // Modifier le nom d'une équipe
  const handleEditEquipe = async (e) => {
    e.preventDefault();
    
    if (!nouveauNom.trim()) {
      setError("Le nom de l'équipe est obligatoire");
      return;
    }
    
    try {
      await api.put(
        `/api/equipes-medicales/${selectedEquipe.id}/nom?medecinProprietaireId=${medecin.id}&nouveauNom=${encodeURIComponent(nouveauNom.trim())}`
      );
      
      setSuccess("Équipe modifiée avec succès !");
      setShowEditModal(false);
      await loadEquipes();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Erreur modification équipe:", error);
      setError(error.response?.data?.message || "Erreur lors de la modification");
    }
  };

  // Ajouter un membre
  const handleAddMember = async (e) => {
    e.preventDefault();
    
    if (!selectedMedecinToAdd) {
      setError("Veuillez sélectionner un médecin");
      return;
    }
    
    try {
      await api.post(
        `/api/equipes-medicales/${selectedEquipe.id}/medecins/${selectedMedecinToAdd}?medecinProprietaireId=${medecin.id}`
      );
      
      setSuccess("Membre ajouté avec succès !");
      setSelectedMedecinToAdd("");
      setShowAddMemberModal(false);
      await loadEquipes();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Erreur ajout membre:", error);
      setError(error.response?.data?.message || "Erreur lors de l'ajout du membre");
    }
  };

  // Retirer un membre
  const handleRemoveMember = async (equipeId, medecinId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir retirer ce membre de l'équipe ?")) {
      return;
    }
    
    try {
      await api.delete(
        `/api/equipes-medicales/${equipeId}/medecins/${medecinId}?medecinProprietaireId=${medecin.id}`
      );
      
      setSuccess("Membre retiré avec succès !");
      await loadEquipes();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Erreur retrait membre:", error);
      setError(error.response?.data?.message || "Erreur lors du retrait du membre");
    }
  };

  // Supprimer une équipe
  const handleDeleteEquipe = async (equipeId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette équipe ? Cette action est irréversible.")) {
      return;
    }
    
    try {
      await api.delete(`/api/equipes-medicales/${equipeId}?medecinProprietaireId=${medecin.id}`);
      
      setSuccess("Équipe supprimée avec succès !");
      await loadEquipes();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Erreur suppression équipe:", error);
      setError(error.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  // Ouvrir le modal d'édition
  const openEditModal = (equipe) => {
    setSelectedEquipe(equipe);
    setNouveauNom(equipe.nom);
    setShowEditModal(true);
  };

  // Ouvrir le modal d'ajout de membre
  const openAddMemberModal = (equipe) => {
    setSelectedEquipe(equipe);
    setSelectedMedecinToAdd("");
    setShowAddMemberModal(true);
  };

  // Toggle expand équipe
  const toggleExpand = (equipeId) => {
    setExpandedEquipes(prev => ({
      ...prev,
      [equipeId]: !prev[equipeId]
    }));
  };

  // Obtenir les détails d'un médecin par ID
  const getMedecinById = (id) => {
    return allMedecins.find(m => m.id === id);
  };

  // Filtrer mes équipes et les autres
  const mesEquipes = equipes.filter(eq => eq.medecinProprietaireId === medecin?.id);
  const autresEquipes = equipes.filter(eq => eq.medecinProprietaireId !== medecin?.id);

  if (loading) {
    return (
      <div className="equipes-loading">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Chargement des équipes médicales...</p>
      </div>
    );
  }

  return (
    <div className="equipes-wrapper">
      <TopbarMedecin user={medecin} />

      <div className="equipes-main-content">
        <Container fluid>
          {/* Header */}
          <div className="equipes-header">
            <div>
              <h2 className="equipes-title">
                <i className="bi bi-people-fill me-3"></i>
                Équipes Médicales
              </h2>
              <p className="equipes-subtitle">
                Gérez vos équipes et collaborez avec d'autres médecins
              </p>
            </div>
            <Button 
              className="btn-create-equipe"
              onClick={() => setShowCreateModal(true)}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Créer une équipe
            </Button>
          </div>

          {/* Alerts */}
          {success && (
            <Alert variant="success" dismissible onClose={() => setSuccess("")} className="custom-alert">
              <i className="bi bi-check-circle-fill me-2"></i>
              {success}
            </Alert>
          )}
          
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError("")} className="custom-alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </Alert>
          )}

          {/* Mes équipes (propriétaire) */}
          <div className="section-container mb-5">
            <div className="section-header">
              <h4 className="section-title">
                <i className="bi bi-star-fill me-2"></i>
                Mes équipes ({mesEquipes.length})
              </h4>
              <p className="section-subtitle">Équipes dont vous êtes le propriétaire</p>
            </div>

            {mesEquipes.length > 0 ? (
              <Row className="g-4">
                {mesEquipes.map((equipe) => (
                  <Col lg={6} key={equipe.id}>
                    <Card className="equipe-card equipe-owner">
                      <Card.Body>
                        <div className="equipe-header-card">
                          <div className="equipe-icon">
                            <i className="bi bi-people"></i>
                          </div>
                          <Badge bg="primary" className="owner-badge">
                            <i className="bi bi-star-fill me-1"></i>
                            Propriétaire
                          </Badge>
                        </div>
                        
                        <h5 className="equipe-name">{equipe.nom}</h5>
                        
                        <div className="equipe-stats">
                          <div className="stat-item">
                            <i className="bi bi-person-check"></i>
                            <span>{equipe.medecinsIds?.length || 0} membre(s)</span>
                          </div>
                        </div>

                        <div className="equipe-actions">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => toggleExpand(equipe.id)}
                          >
                            <i className={`bi bi-chevron-${expandedEquipes[equipe.id] ? 'up' : 'down'} me-1`}></i>
                            {expandedEquipes[equipe.id] ? 'Masquer' : 'Voir'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            onClick={() => openAddMemberModal(equipe)}
                          >
                            <i className="bi bi-person-plus me-1"></i>
                            Ajouter
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-info"
                            onClick={() => openEditModal(equipe)}
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleDeleteEquipe(equipe.id)}
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </div>

                        <Collapse in={expandedEquipes[equipe.id]}>
                          <div className="team-details mt-3">
                            <h6 className="details-title">
                              <i className="bi bi-people me-2"></i>
                              Membres de l'équipe
                            </h6>
                            {equipe.medecinsIds && equipe.medecinsIds.length > 0 ? (
                              <div className="members-list">
                                {equipe.medecinsIds.map((membreId) => {
                                  const membre = getMedecinById(membreId);
                                  if (!membre) return null;
                                  
                                  return (
                                    <div key={membreId} className="member-item">
                                      <div className="member-avatar">
                                        {membre.prenom?.[0]}{membre.nom?.[0]}
                                      </div>
                                      <div className="member-info">
                                        <div className="member-name">
                                          Dr. {membre.prenom} {membre.nom}
                                          {membreId === equipe.medecinProprietaireId && (
                                            <Badge bg="warning" className="ms-2">
                                              <i className="bi bi-crown-fill"></i>
                                            </Badge>
                                          )}
                                        </div>
                                        <div className="member-details">
                                          <span>
                                            <i className="bi bi-briefcase me-1"></i>
                                            {membre.specialite || "Non spécifié"}
                                          </span>
                                          {membre.telephone && (
                                            <span>
                                              <i className="bi bi-telephone me-1"></i>
                                              {membre.telephone}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      {membreId !== equipe.medecinProprietaireId && (
                                        <Button
                                          size="sm"
                                          className="btn-remove-member"
                                          onClick={() => handleRemoveMember(equipe.id, membreId)}
                                        >
                                          <i className="bi bi-x-lg"></i>
                                        </Button>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="empty-members">
                                <i className="bi bi-inbox"></i>
                                <p>Aucun membre dans cette équipe</p>
                              </div>
                            )}
                          </div>
                        </Collapse>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <Card className="empty-state-card">
                <Card.Body className="text-center py-5">
                  <i className="bi bi-people" style={{ fontSize: "4rem", opacity: 0.3 }}></i>
                  <h5 className="mt-3 mb-2">Aucune équipe créée</h5>
                  <p className="text-muted mb-3">
                    Créez votre première équipe pour commencer à collaborer
                  </p>
                  <Button className="btn-empty-state" onClick={() => setShowCreateModal(true)}>
                    <i className="bi bi-plus-circle me-2"></i>
                    Créer une équipe
                  </Button>
                </Card.Body>
              </Card>
            )}
          </div>

          {/* Autres équipes (membre) */}
          {autresEquipes.length > 0 && (
            <div className="section-container">
              <div className="section-header">
                <h4 className="section-title">
                  <i className="bi bi-person-badge me-2"></i>
                  Équipes dont je suis membre ({autresEquipes.length})
                </h4>
                <p className="section-subtitle">Équipes auxquelles vous appartenez</p>
              </div>

              <Row className="g-4">
                {autresEquipes.map((equipe) => {
                  const proprietaire = getMedecinById(equipe.medecinProprietaireId);
                  
                  return (
                    <Col lg={6} key={equipe.id}>
                      <Card className="equipe-card equipe-member">
                        <Card.Body>
                          <div className="equipe-header-card">
                            <div className="equipe-icon">
                              <i className="bi bi-people"></i>
                            </div>
                            <Badge bg="secondary" className="member-badge">
                              Membre
                            </Badge>
                          </div>
                          
                          <h5 className="equipe-name">{equipe.nom}</h5>
                          
                          {proprietaire && (
                            <div className="team-owner mb-3">
                              <i className="bi bi-person-badge me-2"></i>
                              Propriétaire : Dr. {proprietaire.prenom} {proprietaire.nom}
                            </div>
                          )}
                          
                          <div className="equipe-stats">
                            <div className="stat-item">
                              <i className="bi bi-person-check"></i>
                              <span>{equipe.medecinsIds?.length || 0} membre(s)</span>
                            </div>
                          </div>

                          <div className="equipe-actions">
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => toggleExpand(equipe.id)}
                            >
                              <i className={`bi bi-chevron-${expandedEquipes[equipe.id] ? 'up' : 'down'} me-1`}></i>
                              {expandedEquipes[equipe.id] ? 'Masquer les détails' : 'Voir les détails'}
                            </Button>
                          </div>

                          <Collapse in={expandedEquipes[equipe.id]}>
                            <div className="team-details mt-3">
                              <h6 className="details-title">
                                <i className="bi bi-people me-2"></i>
                                Membres de l'équipe
                              </h6>
                              {equipe.medecinsIds && equipe.medecinsIds.length > 0 ? (
                                <div className="members-list">
                                  {equipe.medecinsIds.map((membreId) => {
                                    const membre = getMedecinById(membreId);
                                    if (!membre) return null;
                                    
                                    return (
                                      <div key={membreId} className="member-item">
                                        <div className="member-avatar">
                                          {membre.prenom?.[0]}{membre.nom?.[0]}
                                        </div>
                                        <div className="member-info">
                                          <div className="member-name">
                                            Dr. {membre.prenom} {membre.nom}
                                            {membreId === equipe.medecinProprietaireId && (
                                              <Badge bg="warning" className="ms-2">
                                                <i className="bi bi-crown-fill"></i>
                                              </Badge>
                                            )}
                                          </div>
                                          <div className="member-details">
                                            <span>
                                              <i className="bi bi-briefcase me-1"></i>
                                              {membre.specialite || "Non spécifié"}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="empty-members">
                                  <i className="bi bi-inbox"></i>
                                  <p>Aucun membre dans cette équipe</p>
                                </div>
                              )}
                            </div>
                          </Collapse>
                        </Card.Body>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            </div>
          )}
        </Container>
      </div>

      {/* Modal Créer Équipe */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-plus-circle me-2"></i>
            Créer une nouvelle équipe
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateEquipe}>
            <Form.Group className="mb-3">
              <Form.Label>Nom de l'équipe *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ex: Équipe Diabétologie Est"
                value={nomEquipe}
                onChange={(e) => setNomEquipe(e.target.value)}
                required
              />
            </Form.Group>
            
            <div className="d-flex gap-2 justify-content-end">
              <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                Annuler
              </Button>
              <Button type="submit" variant="primary">
                <i className="bi bi-check-lg me-2"></i>
                Créer l'équipe
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal Modifier Équipe */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-pencil-square me-2"></i>
            Modifier l'équipe
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEditEquipe}>
            <Form.Group className="mb-3">
              <Form.Label>Nom de l'équipe *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nouveau nom de l'équipe"
                value={nouveauNom}
                onChange={(e) => setNouveauNom(e.target.value)}
                required
              />
            </Form.Group>
            
            <div className="d-flex gap-2 justify-content-end">
              <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                Annuler
              </Button>
              <Button type="submit" variant="primary">
                <i className="bi bi-check-lg me-2"></i>
                Enregistrer
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal Ajouter Membre */}
      <Modal show={showAddMemberModal} onHide={() => setShowAddMemberModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-person-plus me-2"></i>
            Ajouter un membre
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddMember}>
            <Form.Group className="mb-3">
              <Form.Label>Sélectionner un médecin *</Form.Label>
              <Form.Select
                value={selectedMedecinToAdd}
                onChange={(e) => setSelectedMedecinToAdd(e.target.value)}
                required
              >
                <option value="">-- Choisir un médecin --</option>
                {allMedecins
                  .filter(m => 
                    m.id !== medecin?.id && 
                    !selectedEquipe?.medecinsIds?.includes(m.id)
                  )
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      Dr. {m.prenom} {m.nom} {m.specialite ? `- ${m.specialite}` : ""}
                    </option>
                  ))}
              </Form.Select>
            </Form.Group>
            
            <div className="d-flex gap-2 justify-content-end">
              <Button variant="secondary" onClick={() => setShowAddMemberModal(false)}>
                Annuler
              </Button>
              <Button type="submit" variant="primary">
                <i className="bi bi-check-lg me-2"></i>
                Ajouter
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default EquipesMedicales;