// src/pages/admin/AdminAttentePage.jsx
import React, { useEffect, useState, useMemo } from "react";
import DataTable from "react-data-table-component";
import { Badge, Form, Modal } from "react-bootstrap";
import api from "../../services/api";
import SidebarAdmin from "../../components/SidebarAdmin";
import AideModal from "../../components/AideModal";
import "./AdminAttentePage.css";

function AdminAttentePage() {
  const [admin, setAdmin] = useState(null);
  const [medecins, setMedecins] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAide, setShowAide] = useState(false);

  // ── Modal confirmation ──
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState(null); // "approve" | "reject"
  const [medecinCible, setMedecinCible] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // ── Chargement ──
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const profileRes = await api.get("/api/auth/profile");
        setAdmin(profileRes.data);

        const attenteRes = await api.get("/api/auth/users/pending/all");
        const pendingUsers = attenteRes.data?.content || attenteRes.data || [];

        const enriched = await Promise.all(
          pendingUsers.map(async (user) => {
            let medecinInfo = null;
            try {
              const medRes = await api.get(
                `/api/medecins/byUtilisateur/${user.id}`,
              );
              medecinInfo = medRes.data;
            } catch {}
            return {
              ...user,
              medecinInfo,
              prenom: medecinInfo?.prenom || "--",
              nom: medecinInfo?.nom || "--",
              telephone: medecinInfo?.telephone || "--",
              specialite: medecinInfo?.specialite || "--",
              nomService: medecinInfo?.nomService || "--",
              ville: medecinInfo?.ville || "--",
              numeroProfessionnel: medecinInfo?.numeroProfessionnel || "--",
              dateInscription: medecinInfo?.dateEnregistrement || null,
            };
          }),
        );

        setMedecins(enriched);
      } catch (err) {
        console.error("Erreur chargement médecins en attente", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── Filtre ──
  const filteredMedecins = useMemo(() => {
    if (!search) return medecins;
    const q = search.toLowerCase();
    return medecins.filter(
      (m) =>
        m.nom?.toLowerCase().includes(q) ||
        m.prenom?.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q) ||
        m.specialite?.toLowerCase().includes(q) ||
        m.ville?.toLowerCase().includes(q),
    );
  }, [medecins, search]);

  // ── Ouvrir modal ──
  const openModal = (medecin, action) => {
    setMedecinCible(medecin);
    setModalAction(action);
    setShowModal(true);
  };

  // ── Confirmer action ──
  const handleConfirm = async () => {
    if (!medecinCible || !modalAction) return;
    setActionLoading(true);
    try {
      if (modalAction === "approve") {
        await api.put(`/api/auth/approve/${medecinCible.id}`);
      } else {
        await api.put(`/api/auth/reject/${medecinCible.id}`);
      }
      setMedecins((prev) => prev.filter((m) => m.id !== medecinCible.id));
      setShowModal(false);
      setMedecinCible(null);
    } catch (err) {
      console.error("Erreur action validation", err);
    } finally {
      setActionLoading(false);
    }
  };

  // ── Format date ──
  const formatDate = (d) => {
    if (!d) return "--";
    return new Date(d).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // ── Colonnes ──
  const columns = [
    {
      name: "Prénom",
      selector: (r) => r.prenom,
      sortable: true,
      minWidth: "120px",
      cell: (r) => (
        <div className="ap-cell">
          <i className="bi bi-person-circle"></i>
          <strong>{r.prenom}</strong>
        </div>
      ),
    },
    {
      name: "Nom",
      selector: (r) => r.nom,
      sortable: true,
      minWidth: "120px",
      cell: (r) => (
        <div className="ap-cell">
          <i className="bi bi-person"></i>
          <strong>{r.nom}</strong>
        </div>
      ),
    },
    {
      name: "Email",
      minWidth: "200px",
      cell: (r) => (
        <span className="aa-email">
          <i className="bi bi-envelope me-1"></i>
          {r.email}
        </span>
      ),
    },

    {
      name: "Spécialité",
      minWidth: "140px",
      cell: (r) => (
        <Badge
          className="aa-badge"
          style={{
            background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
          }}
        >
          {r.specialite}
        </Badge>
      ),
    },

    {
      name: "Actions",
      minWidth: "200px",
      cell: (r) => (
        <div className="aa-actions">
          <button
            className="aa-btn-approve"
            onClick={(e) => {
              e.stopPropagation();
              openModal(r, "approve");
            }}
          >
            <i className="bi bi-check-circle-fill me-1"></i>Approuver
          </button>
          <button
            className="aa-btn-reject"
            onClick={(e) => {
              e.stopPropagation();
              openModal(r, "reject");
            }}
          >
            <i className="bi bi-x-circle-fill me-1"></i>Rejeter
          </button>
        </div>
      ),
    },
  ];
  const customStyles = {
    table: { style: { backgroundColor: "white", borderRadius: "16px" } },
    headRow: {
      style: {
        background: "linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%)",
        borderBottom: "2px solid #e9ecef",
        fontSize: "12px",
        fontWeight: "700",
        color: "#2d3748",
        minHeight: "48px",
        borderTopLeftRadius: "16px",
        borderTopRightRadius: "16px",
      },
    },
    headCells: { style: { paddingLeft: "12px", paddingRight: "12px" } },
    cells: { style: { paddingLeft: "12px", paddingRight: "12px" } },
    rows: {
      style: {
        minHeight: "52px",
        fontSize: "12px",
        "&:hover": {
          backgroundColor: "#f8f9ff",
          cursor: "pointer",
          transform: "scale(1.002)",
          boxShadow: "0 2px 8px rgba(17, 153, 142, 0.08)",
        },
        transition: "all 0.2s ease",
      },
    },
    pagination: {
      style: {
        borderTop: "2px solid #e9ecef",
        minHeight: "52px",
        fontSize: "12px",
        borderBottomLeftRadius: "16px",
        borderBottomRightRadius: "16px",
      },
    },
  };
  const isApprove = modalAction === "approve";

  return (
    <div className="aa-wrapper">
      <SidebarAdmin admin={admin} onShowAide={() => setShowAide(true)} />

      <div className="aa-content">
        <div className="aa-container">
          {/* ── Hero ── */}
          <div className="aa-hero">
            <div className="aa-hero-orb aa-hero-orb--1"></div>
            <div className="aa-hero-orb aa-hero-orb--2"></div>
            <div className="aa-hero-inner">
              <div>
                <div className="aa-hero-badge">
                  <i className="bi bi-hourglass-split me-2"></i>Validation des
                  comptes
                </div>
                <h1 className="aa-hero-title">Médecins en attente</h1>
                <p className="aa-hero-sub">
                  {medecins.length > 0
                    ? `${medecins.length} demande${medecins.length > 1 ? "s" : ""} en attente de validation`
                    : "Aucune demande en attente — tout est traité ✓"}
                </p>
              </div>
              <div className="aa-hero-stat">
                {medecins.length > 0 ? (
                  <>
                    <div className="aa-hero-stat-value">{medecins.length}</div>
                    <div className="aa-hero-stat-label">En attente</div>
                  </>
                ) : (
                  <>
                    <div className="aa-hero-stat-check">
                      <i className="bi bi-check-lg"></i>
                    </div>
                    <div className="aa-hero-stat-label">À jour</div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ── Alerte si demandes ── */}
          {medecins.length > 0 && (
            <div className="aa-alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              <span>
                <strong>
                  {medecins.length} médecin{medecins.length > 1 ? "s" : ""}
                </strong>{" "}
                attendent votre validation pour accéder à la plateforme.
              </span>
            </div>
          )}

          {/* ── Table card ── */}
          <div className="aa-table-card">
            <div className="aa-table-card-body">
              {/* Barre d'actions */}
              <div className="aa-actions-bar">
                <div className="aa-actions-left">
                  <Badge className="aa-count-badge">
                    <i className="bi bi-hourglass-split me-2"></i>
                    {filteredMedecins.length} demande
                    {filteredMedecins.length > 1 ? "s" : ""}
                  </Badge>
                </div>
                <div className="aa-actions-right">
                  <Form.Control
                    placeholder="Rechercher..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="aa-search-input"
                  />
                </div>
              </div>

              {/* Table */}
              <DataTable
                columns={columns}
                data={filteredMedecins}
                progressPending={loading}
                pagination
                paginationPerPage={10}
                paginationRowsPerPageOptions={[5, 10, 15, 20]}
                highlightOnHover
                responsive
                striped
                customStyles={customStyles}
                noDataComponent={
                  <div className="aa-no-data">
                    <div className="aa-no-data-icon">
                      <i className="bi bi-check-circle-fill"></i>
                    </div>
                    <p className="aa-no-data-title">
                      Aucune demande en attente
                    </p>
                    <p className="aa-no-data-sub">
                      Tous les médecins ont été traités
                    </p>
                  </div>
                }
                expandableRows
                expandOnRowClicked={false}
                expandableRowsComponent={({ data: r }) => (
                  <div className="aa-expanded">
                    <div className="aa-expanded-item">
                      <i className="bi bi-hospital"></i>
                      <span>
                        <strong>Service :</strong> {r.nomService}
                      </span>
                    </div>
                    <div className="aa-expanded-item">
                      <i className="bi bi-telephone-fill"></i>
                      <span>
                        <strong>Téléphone :</strong> {r.telephone}
                      </span>
                    </div>
                    <div className="aa-expanded-item">
                      <i className="bi bi-geo-alt-fill"></i>
                      <span>
                        <strong>Ville :</strong> {r.ville}
                      </span>
                    </div>
                    <div className="aa-expanded-item">
                      <i className="bi bi-card-text"></i>
                      <span>
                        <strong>N° Professionnel :</strong>
                      </span>
                      <Badge
                        className="aa-badge"
                        style={{
                          background:
                            "linear-gradient(135deg, #38ef7d 0%, #11998e 100%)",
                        }}
                      >
                        {r.numeroProfessionnel}
                      </Badge>
                    </div>

                    <div className="aa-expanded-item">
                      <i className="bi bi-calendar3"></i>
                      <span>
                        <strong>Date d'inscription :</strong>{" "}
                        {formatDate(r.dateInscription)}
                      </span>
                    </div>
                  </div>
                )}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal confirmation ── */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        className="aa-modal"
      >
        <Modal.Header
          closeButton
          className={`aa-modal-header ${isApprove ? "aa-modal-header--approve" : "aa-modal-header--reject"}`}
        >
          <Modal.Title className="text-white">
            <i
              className={`bi ${isApprove ? "bi-check-circle-fill" : "bi-x-circle-fill"} me-2`}
            ></i>
            {isApprove ? "Approuver le médecin" : "Rejeter le médecin"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="aa-modal-body">
          {medecinCible && (
            <div className="aa-confirm-content">
              <div
                className={`aa-confirm-icon ${isApprove ? "aa-confirm-icon--approve" : "aa-confirm-icon--reject"}`}
              >
                <i
                  className={`bi ${isApprove ? "bi-person-check-fill" : "bi-person-x-fill"}`}
                ></i>
              </div>

              <p className="aa-confirm-question">
                {isApprove
                  ? "Vous êtes sur le point d'approuver le compte de"
                  : "Vous êtes sur le point de rejeter la demande de"}
              </p>

              <div className="aa-confirm-name">
                Dr. {medecinCible.prenom} {medecinCible.nom}
              </div>

              <div className="aa-confirm-details">
                <div className="aa-confirm-detail-item">
                  <i className="bi bi-envelope me-2"></i>
                  {medecinCible.email}
                </div>
                {medecinCible.specialite !== "--" && (
                  <div className="aa-confirm-detail-item">
                    <i className="bi bi-hospital me-2"></i>
                    {medecinCible.specialite}
                  </div>
                )}
                {medecinCible.numeroProfessionnel !== "--" && (
                  <div className="aa-confirm-detail-item">
                    <i className="bi bi-card-text me-2"></i>
                    {medecinCible.numeroProfessionnel}
                  </div>
                )}
              </div>

              <p
                className={`aa-confirm-info ${isApprove ? "aa-confirm-info--approve" : "aa-confirm-info--reject"}`}
              >
                <i className="bi bi-info-circle me-1"></i>
                {isApprove
                  ? "Le médecin pourra se connecter et accéder à la plateforme immédiatement."
                  : "Le médecin sera notifié du rejet et ne pourra pas accéder à la plateforme."}
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="aa-modal-footer">
          <button className="aa-btn-cancel" onClick={() => setShowModal(false)}>
            Annuler
          </button>
          <button
            className={
              isApprove ? "aa-btn-confirm-approve" : "aa-btn-confirm-reject"
            }
            onClick={handleConfirm}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                En cours...
              </>
            ) : isApprove ? (
              <>
                <i className="bi bi-check-circle-fill me-2"></i>Confirmer
                l'approbation
              </>
            ) : (
              <>
                <i className="bi bi-x-circle-fill me-2"></i>Confirmer le rejet
              </>
            )}
          </button>
        </Modal.Footer>
      </Modal>

      <AideModal show={showAide} onHide={() => setShowAide(false)} />
    </div>
  );
}

export default AdminAttentePage;
