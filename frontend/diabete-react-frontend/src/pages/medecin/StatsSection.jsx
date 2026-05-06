import React, { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import api from "../../services/api";

function StatsSection({ medecinId }) {
  const [stats, setStats] = useState({});

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get(`/medecin/stats?medecinId=${medecinId}`);
        setStats(res.data);
      } catch (error) {
        console.error("Erreur chargement stats :", error);
      }
    };
    fetchStats();
  }, [medecinId]);

  return (
    <div className="p-3 bg-white rounded shadow-sm">
      <h5>Statistiques globales</h5>
      <Card className="mt-3 p-3 shadow-sm">
        <p>Glycémie moyenne : <strong>{stats.glycemieMoyenne || "--"} mg/dL</strong></p>
        <p>Observance moyenne : <strong>{stats.observance || "--"} %</strong></p>
        <p>Nombre de patients suivis : <strong>{stats.totalPatients || "--"}</strong></p>
      </Card>
    </div>
  );
}

export default StatsSection;
