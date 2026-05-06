import React, { useEffect, useState } from "react";
import { ListGroup, Badge } from "react-bootstrap";
import api from "../../services/api";

function AlerteSection({ medecinId }) {
  const [alertes, setAlertes] = useState([]);

  useEffect(() => {
    const fetchAlertes = async () => {
      try {
        const res = await api.get(`/medecin/alertes?medecinId=${medecinId}`);
        setAlertes(res.data);
      } catch (error) {
        console.error("Erreur chargement alertes :", error);
      }
    };
    fetchAlertes();
  }, [medecinId]);

  return (
    <div className="p-3 bg-white rounded shadow-sm">
      <h5>Alertes récentes</h5>
      <ListGroup variant="flush">
        {alertes.length > 0 ? (
          alertes.map((a, i) => (
            <ListGroup.Item key={i}>
              <strong>{a.patientNom}</strong> — {a.message}
              <Badge bg="danger" className="ms-2">Urgent</Badge>
            </ListGroup.Item>
          ))
        ) : (
          <p className="text-muted">Aucune alerte</p>
        )}
      </ListGroup>
    </div>
  );
}

export default AlerteSection;
