import React, { useEffect, useState, useMemo } from "react";
import DataTable from "react-data-table-component";
import {
  Badge,
  Form,
  Card,
  Button,
  Modal,
  ListGroup,
  Row,
  Col,
} from "react-bootstrap";
import { Bell, MessageSquare, AlertTriangle, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./PatientsTable.css";

function PatientsTable({ medecinId, onStatsUpdate }) {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [filterReferent, setFilterReferent] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({
    patientNom: "",
    type: "",
    notifications: [],
  });

  useEffect(() => {
    if (!medecinId) return;

    const fetchPatients = async () => {
      setLoading(true);
      try {
        // =====================================================
        // 1. Récupérer tous les patients visibles pour ce médecin
        // (ses propres patients + patients du propriétaire si membre)
        // =====================================================
        const res = await api.get(
          `/api/patients/medecin/${medecinId}/visibles`,
        );
        const data = res.data || [];

        const enriched = await Promise.all(
          data.map(async (p) => {
            let derniereGlycemie = null;
            let medecinPrenom = null;
            let medecinNom = null;
            let traitement = null;
            let allergies = null;
            let countAlertes = 0;
            let countInactivite = 0;
            let countMessages = 0;
            let notifications = [];

            // =====================================================
            // 2. Dernière glycémie
            // =====================================================
            try {
              const mesureRes = await api.get(
                `/api/suivis/last?patientId=${p.id}`,
              );
              derniereGlycemie = mesureRes.data?.glycemie ?? null;
            } catch {}

            // =====================================================
            // 3. Dossier médical
            // =====================================================
            try {
              const dossierRes = await api.get(`/api/dossiers/patient/${p.id}`);
              traitement = dossierRes.data?.traitement ?? null;
              allergies = dossierRes.data?.allergies ?? null;
            } catch {}

            // =====================================================
            // 4. Infos du médecin référent du patient
            // =====================================================
            if (p.medecinId) {
              try {
                const medRes = await api.get(`/api/medecins/${p.medecinId}`);
                medecinPrenom = medRes.data?.prenom ?? null;
                medecinNom = medRes.data?.nom ?? null;
              } catch {}
            }

            // =====================================================
            // 5. Notifications
            // On utilise le medecinId du PATIENT (son référent)
            // car les alertes sont enregistrées avec le medecinId
            // du référent, pas du médecin connecté.
            //
            // Exemple :
            //   - Médecin B (membre) voit les patients de A (propriétaire)
            //   - Les alertes du patient X (référent = A) sont enregistrées
            //     avec medecinId = A
            //   - On appelle donc /medecin/A/patient/X ✅
            //
            //   - Pour ses propres patients (référent = B) :
            //   - On appelle /medecin/B/patient/Y ✅
            // =====================================================
            try {
              const medecinReferentId = p.medecinId;

              if (!medecinReferentId) {
                console.warn(
                  `Patient ${p.id} n'a pas de médecin référent, notifications ignorées`,
                );
              } else {
                const notifRes = await api.get(
                  `/api/notification-history/medecin/${medecinReferentId}/patient/${p.id}`,
                );
                const allNotifications = notifRes.data || [];

                notifications = allNotifications.sort(
                  (a, b) => new Date(b.dateEnvoi) - new Date(a.dateEnvoi),
                );

                notifications
                  .filter((notif) => notif.statut !== "LU")
                  .forEach((notif) => {
                    if (
                      notif.typeAlerte === "HYPOGLYCEMIE_SEVERE" ||
                      notif.typeAlerte === "HYPERGLYCEMIE_SEVERE"
                    ) {
                      countAlertes++;
                    } else if (notif.typeAlerte === "INACTIVITE_PATIENT") {
                      countInactivite++;
                    }
                  });
              }
            } catch (err) {
              console.error(
                `Erreur récupération notifications patient ${p.id}:`,
                err,
              );
            }

            return {
              ...p,
              derniereGlycemie,
              medecinPrenom,
              medecinNom,
              traitement,
              allergies,
              // Patient direct si son référent est le médecin connecté
              // Patient d'équipe si son référent est un autre médecin (propriétaire)
              source: p.medecinId === medecinId ? "DIRECT" : "EQUIPE",
              countAlertes,
              countInactivite,
              countMessages,
              notifications,
            };
          }),
        );

        setPatients(enriched);

        if (onStatsUpdate) {
          const totalAlertes = enriched.reduce(
            (sum, p) => sum + p.countAlertes,
            0,
          );
          const totalInactifs = enriched.reduce(
            (sum, p) => sum + p.countInactivite,
            0,
          );
          onStatsUpdate({
            alertesActives: totalAlertes,
            inactifs: totalInactifs,
          });
        }
      } catch (err) {
        console.error("Erreur chargement patients", err);
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [medecinId, onStatsUpdate]);

  // =====================================================
  // Marquer des notifications comme lues
  // =====================================================
  const markNotificationsAsRead = async (notifications) => {
    try {
      await Promise.all(
        notifications
          .filter((n) => n.statut !== "LU")
          .map((n) => api.put(`/api/notification-history/${n.id}/read`)),
      );
    } catch (err) {
      console.error("Erreur mise à jour notifications", err);
    }
  };

  // =====================================================
  // Afficher le modal de notifications
  // =====================================================
  const handleShowNotifications = async (patient, type) => {
    let filteredNotifications = [];
    let titre = "";

    const allNotifs = patient.notifications;

    if (type === "alerte") {
      filteredNotifications = allNotifs.filter(
        (n) =>
          n.typeAlerte === "HYPOGLYCEMIE_SEVERE" ||
          n.typeAlerte === "HYPERGLYCEMIE_SEVERE",
      );
      titre = "Alertes critiques";
    } else if (type === "inactivite") {
      filteredNotifications = allNotifs.filter(
        (n) => n.typeAlerte === "INACTIVITE_PATIENT",
      );
      titre = "Inactivité patient";
    } else if (type === "message") {
      filteredNotifications = [];
      titre = "Messages du patient";
    }

    await markNotificationsAsRead(filteredNotifications);

    setPatients((prev) =>
      prev.map((p) =>
        p.id === patient.id
          ? {
              ...p,
              notifications: p.notifications.map((n) =>
                filteredNotifications.some((fn) => fn.id === n.id)
                  ? { ...n, statut: "LU" }
                  : n,
              ),
              countAlertes: type === "alerte" ? 0 : p.countAlertes,
              countInactivite: type === "inactivite" ? 0 : p.countInactivite,
              countMessages: type === "message" ? 0 : p.countMessages,
            }
          : p,
      ),
    );

    setModalData({
      patientNom: `${patient.prenom} ${patient.nom}`,
      type: titre,
      notifications: filteredNotifications,
    });

    setShowModal(true);
  };

  // =====================================================
  // Filtrage
  // =====================================================
  const filteredPatients = useMemo(() => {
    let data = [...patients];

    if (search) {
      data = data.filter(
        (p) =>
          p.nom?.toLowerCase().includes(search.toLowerCase()) ||
          p.prenom?.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (filterReferent) {
      data = data.filter((p) => p.source === "DIRECT");
    }

    return data;
  }, [patients, search, filterReferent]);

  // =====================================================
  // Colonnes DataTable
  // =====================================================
  const columns = [
    {
      name: "Prénom",
      selector: (r) => r.prenom,
      sortable: true,
      minWidth: "130px",
      cell: (r) => (
        <div className="patient-name-cell">
          <i className="bi bi-person-circle me-2 text-primary"></i>
          <strong>{r.prenom}</strong>
        </div>
      ),
    },
    {
      name: "Nom",
      selector: (r) => r.nom,
      sortable: true,
      minWidth: "130px",
      cell: (r) => <strong>{r.nom}</strong>,
    },
    {
      name: "Type de diabète",
      selector: (r) => r.typeDiabete,
      minWidth: "140px",
      cell: (r) => (
        <Badge
          bg="info"
          className="badge-modern"
          style={{
            background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
          }}
        >
          {r.typeDiabete}
        </Badge>
      ),
    },
    {
      name: "Allergies",
      cell: (r) => (
        <span className="text-muted small">{r.allergies || "Aucune"}</span>
      ),
      minWidth: "120px",
    },
    {
      name: "Sous insuline",
      cell: (r) => {
        const traitement = r.traitement?.toString().trim().toUpperCase();
        const isInsuline = traitement === "OUI";
        return (
          <Badge
            bg={isInsuline ? "success" : "secondary"}
            className="badge-modern"
            style={
              isInsuline
                ? {
                    background:
                      "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                  }
                : {}
            }
          >
            <i
              className={`bi ${isInsuline ? "bi-check-circle" : "bi-x-circle"} me-1`}
            ></i>
            {isInsuline ? "Oui" : "Non"}
          </Badge>
        );
      },
      minWidth: "140px",
    },
    {
      name: "Dernière mesure",
      cell: (r) => {
        if (r.derniereGlycemie === null)
          return (
            <Badge bg="secondary" className="badge-modern">
              --
            </Badge>
          );

        let gradient = "";
        let icon = "";
        if (r.derniereGlycemie < 0.7) {
          gradient = "linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)";
          icon = "arrow-down-circle-fill";
        } else if (r.derniereGlycemie <= 1.2) {
          gradient = "linear-gradient(135deg, #51cf66 0%, #37b24d 100%)";
          icon = "check-circle-fill";
        } else if (r.derniereGlycemie <= 1.4) {
          gradient = "linear-gradient(135deg, #ffd43b 0%, #fab005 100%)";
          icon = "exclamation-circle-fill";
        } else {
          gradient = "linear-gradient(135deg, #ff8787 0%, #ff6b6b 100%)";
          icon = "arrow-up-circle-fill";
        }

        return (
          <Badge
            className="badge-modern glycemie-badge"
            style={{ background: gradient }}
          >
            <i className={`bi bi-${icon} me-1`}></i>
            {r.derniereGlycemie} g/L
          </Badge>
        );
      },
      minWidth: "150px",
    },
    {
      name: "Notifications",
      cell: (r) => (
        <div className="notifications-cell">
          {/* Alertes critiques */}
          <div
            className="notif-icon-wrapper"
            onClick={(e) => {
              e.stopPropagation();
              handleShowNotifications(r, "alerte");
            }}
            title="Alertes critiques"
          >
            <AlertTriangle
              size={22}
              className={r.countAlertes > 0 ? "icon-active" : "icon-inactive"}
            />
            {r.countAlertes > 0 && (
              <Badge bg="danger" pill className="notif-badge">
                {r.countAlertes}
              </Badge>
            )}
          </div>

          {/* Inactivité */}
          <div
            className="notif-icon-wrapper"
            onClick={(e) => {
              e.stopPropagation();
              handleShowNotifications(r, "inactivite");
            }}
            title="Inactivité patient"
          >
            <Bell
              size={22}
              className={
                r.countInactivite > 0
                  ? "icon-active icon-warning"
                  : "icon-inactive"
              }
            />
            {r.countInactivite > 0 && (
              <Badge
                bg="warning"
                pill
                className="notif-badge notif-badge-warning"
              >
                {r.countInactivite}
              </Badge>
            )}
          </div>

          {/* Messages */}
          <div
            className="notif-icon-wrapper"
            onClick={(e) => {
              e.stopPropagation();
              handleShowNotifications(r, "message");
            }}
            title="Messages du patient"
          >
            <MessageSquare
              size={22}
              className={
                r.countMessages > 0
                  ? "icon-active icon-primary"
                  : "icon-inactive"
              }
            />
            {r.countMessages > 0 && (
              <Badge
                bg="primary"
                pill
                className="notif-badge notif-badge-primary"
              >
                {r.countMessages}
              </Badge>
            )}
          </div>
        </div>
      ),
      minWidth: "180px",
    },
  ];

  // =====================================================
  // Styles DataTable
  // =====================================================
  const customStyles = {
    table: {
      style: { backgroundColor: "white", borderRadius: "16px" },
    },
    headRow: {
      style: {
        background: "linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%)",
        borderBottom: "2px solid #e9ecef",
        fontSize: "14px",
        fontWeight: "700",
        color: "#2d3748",
        minHeight: "60px",
        borderTopLeftRadius: "16px",
        borderTopRightRadius: "16px",
      },
    },
    headCells: {
      style: { paddingLeft: "20px", paddingRight: "20px" },
    },
    cells: {
      style: { paddingLeft: "20px", paddingRight: "20px" },
    },
    rows: {
      style: {
        minHeight: "65px",
        fontSize: "14px",
        "&:hover": {
          backgroundColor: "#f8f9ff",
          cursor: "pointer",
          transform: "scale(1.005)",
          boxShadow: "0 2px 8px rgba(102, 126, 234, 0.1)",
        },
        transition: "all 0.2s ease",
      },
    },
    pagination: {
      style: {
        borderTop: "2px solid #e9ecef",
        minHeight: "60px",
        borderBottomLeftRadius: "16px",
        borderBottomRightRadius: "16px",
      },
    },
  };

  // =====================================================
  // Utilitaires
  // =====================================================
  const formatDate = (dateString) => {
    if (!dateString) return "--";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getBadgeType = (typeAlerte) => {
    switch (typeAlerte) {
      case "HYPOGLYCEMIE_SEVERE":
      case "HYPERGLYCEMIE_SEVERE":
        return {
          bg: "danger",
          gradient: "linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)",
        };
      case "INACTIVITE_PATIENT":
        return {
          bg: "warning",
          gradient: "linear-gradient(135deg, #ffd43b 0%, #fab005 100%)",
        };
      default:
        return {
          bg: "secondary",
          gradient: "linear-gradient(135deg, #868e96 0%, #495057 100%)",
        };
    }
  };

  // =====================================================
  // Rendu
  // =====================================================
  return (
    <>
      <Card className="patients-table-card">
        <Card.Body className="p-4">
          {/* Barre d'actions */}
          <div className="table-actions-bar">
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <Form.Check
                type="switch"
                label="Afficher uniquement mes patients"
                checked={filterReferent}
                onChange={(e) => setFilterReferent(e.target.checked)}
                className="filter-switch"
              />
              <Badge bg="light" text="dark" className="count-badge">
                <i className="bi bi-people-fill me-2"></i>
                {filteredPatients.length} patient
                {filteredPatients.length > 1 ? "s" : ""}
              </Badge>
            </div>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <Form.Control
                placeholder="Rechercher un patient..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
              <Button
                variant="primary"
                className="btn-add-patient"
                onClick={() => navigate("/register/patient")}
              >
                <Plus size={18} className="me-2" />
                Nouveau patient
              </Button>
            </div>
          </div>

          {/* Table */}
          <DataTable
            columns={columns}
            data={filteredPatients}
            progressPending={loading}
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[5, 10, 15, 20, 30]}
            highlightOnHover
            pointerOnHover
            responsive
            striped
            expandableRows
            expandOnRowClicked={false}
            onRowClicked={(row) =>
              navigate(`/medecin/patient/${row.id}/dashboard`)
            }
            expandableRowsComponent={({ data }) => (
              <Card className="expanded-row-card">
                <Card.Body className="p-4">
                  <Row>
                    <Col md={6}>
                      <div className="info-item">
                        <i className="bi bi-telephone-fill me-2 text-primary"></i>
                        <span>
                          <strong>Téléphone : </strong>{" "}
                          {data.telephone || "--"}
                        </span>
                      </div>
                      <div className="info-item">
                        <i className="bi bi-house-fill me-2 text-primary"></i>
                        <span>
                          <strong>Adresse : </strong> {data.adresse || "--"}
                        </span>
                      </div>
                      <div className="info-item">
                        <i className="bi bi-geo-alt-fill me-2 text-primary"></i>
                        <span>
                          <strong>Ville : </strong> {data.ville || "--"}
                        </span>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="info-item">
                        <i className="bi bi-map-fill me-2 text-primary"></i>
                        <span>
                          <strong>Région : </strong> {data.region || "--"}
                        </span>
                      </div>
                      <div className="info-item">
                        <i className="bi bi-calendar-check-fill me-2 text-primary"></i>
                        <span>
                          <strong>Date d'inscription : </strong>{" "}
                          {data.dateEnregistrement || "--"}
                        </span>
                      </div>
                      <div className="info-item">
                        <i className="bi bi-person-badge-fill me-2 text-primary"></i>
                        <span>
                          <strong>Médecin référent : </strong>{" "}
                          {data.medecinPrenom
                            ? `Dr. ${data.medecinPrenom} ${data.medecinNom}`
                            : "Non référencé"}
                        </span>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            )}
            customStyles={customStyles}
            noDataComponent={
              <div className="no-data-state p-5">
                <i
                  className="bi bi-inbox"
                  style={{ fontSize: "4rem", color: "#e9ecef" }}
                ></i>
                <p className="text-muted mt-3 mb-0">Aucun patient trouvé</p>
              </div>
            }
          />
        </Card.Body>
      </Card>

      {/* Modal notifications */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
        className="notifications-modal"
      >
        <Modal.Header
          closeButton
          className="modal-header-custom"
          style={{
            background: "linear-gradient(135deg, #38ef7d 0%, #11998e 100%)",
          }}
        >
          <Modal.Title className="text-white">
            <i className="bi bi-bell-fill me-2"></i>
            {modalData.type} — {modalData.patientNom}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="modal-body-custom">
          {modalData.notifications.length === 0 ? (
            <div className="no-notifications-state">
              <i
                className="bi bi-check-circle"
                style={{ fontSize: "4rem", color: "#51cf66" }}
              ></i>
              <p className="text-muted mt-3 mb-0">
                Aucune notification pour ce patient
              </p>
            </div>
          ) : (
            <ListGroup variant="flush">
              {modalData.notifications.map((notif, idx) => {
                const badgeConfig = getBadgeType(notif.typeAlerte);
                return (
                  <ListGroup.Item key={idx} className="notification-item">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <Badge
                        className="badge-modern"
                        style={{ background: badgeConfig.gradient }}
                      >
                        {notif.typeAlerte?.replace(/_/g, " ")}
                      </Badge>
                      <small className="text-muted">
                        <i className="bi bi-clock me-1"></i>
                        {formatDate(notif.dateEnvoi)}
                      </small>
                    </div>
                    <p className="mb-2 notification-message">{notif.message}</p>
                    <div className="d-flex gap-2">
                      <Badge bg="light" text="dark">
                        <i className="bi bi-envelope me-1"></i>
                        {notif.canal}
                      </Badge>
                      <Badge
                        bg={notif.statut === "ENVOYE" ? "success" : "secondary"}
                      >
                        {notif.statut === "ENVOYE" ? "Non lu" : "Lu"}
                      </Badge>
                    </div>
                  </ListGroup.Item>
                );
              })}
            </ListGroup>
          )}
        </Modal.Body>

        <Modal.Footer className="modal-footer-custom">
          <Button
            variant="primary"
            onClick={() => setShowModal(false)}
            className="btn-close-modal"
          >
            <i className="bi bi-x-circle me-2"></i>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default PatientsTable;