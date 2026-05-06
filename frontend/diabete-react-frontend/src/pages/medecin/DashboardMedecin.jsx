// src/pages/medecin/DashboardMedecin.jsx
import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import TopbarMedecin from "../../components/TopbarMedecin";
import PatientsTable from "./PatientsTable";
import api from "../../services/api";
import "./DashboardMedecin.css";

function DashboardMedecin() {
  const [medecin, setMedecin] = useState(null);

  useEffect(() => {
    const fetchMedecin = async () => {
      try {
        const profileRes = await api.get("/api/auth/profile");
        const medRes = await api.get(`/api/medecins/byUtilisateur/${profileRes.data.id}`);
        setMedecin(medRes.data);
      } catch (error) {
        console.error("Erreur lors de la récupération du profil médecin :", error);
      }
    };

    fetchMedecin();
  }, []);

  return (
    <div className="dashboard-medecin-wrapper">
      <TopbarMedecin user={medecin} />

      <div className="dashboard-medecin-main-content">
        <div className="dashboard-medecin-content">
          <Container fluid>
            <Row>
              <Col>
                <PatientsTable medecinId={medecin?.id} />
              </Col>
            </Row>
          </Container>
        </div>
      </div>
    </div>
  );
}

export default DashboardMedecin;