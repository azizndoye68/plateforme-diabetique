// src/components/AideModal.jsx
import React from 'react';
import { Modal, Button, Row, Col, Card } from 'react-bootstrap';
import './AideModal.css';

function AideModal({ show, onHide }) {
  const helpResources = [
    {
      icon: 'bi-book-fill',
      title: 'Documentation',
      description: 'Guide complet d\'utilisation',
      gradient: 'linear-gradient(135deg, #38ef7d 0%, #11998e 100%)',
      link: 'https://help.suividiabete.sn/',
      linkText: 'Accéder au guide'
    },
    {
      icon: 'bi-telephone-fill',
      title: 'Par téléphone',
      description: 'Contactez notre support',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      info: '+221 77 123 45 67',
      action: 'tel:+221771234567'
    },
    {
      icon: 'bi-envelope-fill',
      title: 'Par email',
      description: 'Envoyez-nous un message',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      info: 'contact@diabete-platforme.sn',
      action: 'mailto:contact@diabete-platforme.sn'
    },
    {
      icon: 'bi-chat-dots-fill',
      title: 'Chat en direct',
      description: 'Assistance instantanée',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      info: 'Disponible 24/7',
      action: '#'
    }
  ];

  const faqItems = [
    {
      question: 'Comment ajouter une mesure de glycémie ?',
      answer: 'Cliquez sur "Ajouter une mesure" depuis votre tableau de bord.'
    },
    {
      question: 'Comment consulter mon historique ?',
      answer: 'Accédez à la section "Carnet" dans le menu principal.'
    },
    {
      question: 'Comment contacter mon médecin ?',
      answer: 'Utilisez la messagerie dans "Équipe soignante".'
    }
  ];

  return (
    <Modal show={show} onHide={onHide} centered size="md" className="aide-modal">
      <Modal.Header 
        closeButton 
        className="aide-modal-header"
        style={{ 
          background: 'linear-gradient(135deg, #38ef7d 0%, #11998e 100%)',
          color: 'white',
          border: 'none'
        }}
      >
        <Modal.Title className="d-flex align-items-center">
          <i className="bi bi-question-circle-fill me-3" style={{ fontSize: '1.8rem' }}></i>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Besoin d'aide ?</div>
            <small style={{ fontSize: '0.9rem', opacity: 0.9 }}>
              Nous sommes là pour vous accompagner
            </small>
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="aide-modal-body p-4">
        {/* Section: Ressources d'aide */}
        <div className="mb-4">
          <h5 className="mb-3 fw-bold text-dark">
            <i className="bi bi-info-circle-fill me-2 text-primary"></i>
            Ressources disponibles
          </h5>
          <Row className="g-3">
            {helpResources.map((resource, index) => (
              <Col md={6} key={index}>
                <Card 
                  className="help-resource-card h-100"
                  onClick={() => {
                    if (resource.link) {
                      window.open(resource.link, '_blank');
                    } else if (resource.action && resource.action !== '#') {
                      window.location.href = resource.action;
                    }
                  }}
                  style={{ cursor: resource.action !== '#' ? 'pointer' : 'default' }}
                >
                  <Card.Body className="p-3">
                    <div className="d-flex align-items-start">
                      <div 
                        className="resource-icon"
                        style={{ background: resource.gradient }}
                      >
                        <i className={`bi ${resource.icon}`}></i>
                      </div>
                      <div className="ms-3 flex-grow-1">
                        <h6 className="mb-1 fw-bold">{resource.title}</h6>
                        <p className="text-muted small mb-2">{resource.description}</p>
                        {resource.info && (
                          <div className="resource-info">
                            <strong className="text-primary">{resource.info}</strong>
                          </div>
                        )}
                        {resource.linkText && (
                          <div className="resource-link">
                            <span className="text-primary">
                              {resource.linkText}
                              <i className="bi bi-arrow-right ms-2"></i>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Section: FAQ */}
        <div className="mb-3">
          <h5 className="mb-3 fw-bold text-dark">
            <i className="bi bi-question-octagon-fill me-2 text-warning"></i>
            Questions fréquentes
          </h5>
          <div className="faq-container">
            {faqItems.map((item, index) => (
              <div key={index} className="faq-item">
                <div className="faq-question">
                  <i className="bi bi-chevron-right me-2 text-primary"></i>
                  {item.question}
                </div>
                <div className="faq-answer">
                  {item.answer}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section: Horaires */}
        <Card className="info-card mb-3">
          <Card.Body className="p-3">
            <Row className="align-items-center">
              <Col md={1} className="text-center">
                <i className="bi bi-clock-fill text-info" style={{ fontSize: '2rem' }}></i>
              </Col>
              <Col md={11}>
                <h6 className="mb-1 fw-bold">Horaires de disponibilité</h6>
                <p className="text-muted mb-0 small">
                  <strong>Support téléphonique :</strong> Lundi - Vendredi, 8h00 - 18h00 (GMT)
                  <br />
                  <strong>Email & Chat :</strong> Disponible 24/7
                </p>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Section: Conseil */}
        <Card className="tip-card">
          <Card.Body className="p-3">
            <div className="d-flex align-items-start">
              <i className="bi bi-lightbulb-fill text-warning me-3" style={{ fontSize: '1.5rem' }}></i>
              <div>
                <h6 className="mb-1 fw-bold">Astuce</h6>
                <p className="mb-0 small text-muted">
                  Pour une réponse plus rapide, consultez d'abord notre documentation en ligne 
                  qui contient des tutoriels vidéo et des guides pas à pas.
                </p>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Modal.Body>

      <Modal.Footer className="aide-modal-footer border-top" style={{ background: '#f8f9fa' }}>
        <Button 
          variant="primary" 
          onClick={onHide}
          className="btn-close-modal"
          style={{
            background: 'linear-gradient(135deg, #38ef7d 0%, #11998e 100%)',
            border: 'none',
            padding: '0.6rem 2rem',
            borderRadius: '10px',
            fontWeight: '600'
          }}
        >
          <i className="bi bi-x-circle me-2"></i>
          Fermer
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default AideModal;