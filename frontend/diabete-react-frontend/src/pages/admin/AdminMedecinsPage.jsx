// src/pages/admin/AdminMedecinsPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import DataTable from "react-data-table-component";
import { Badge, Form, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import SidebarAdmin from "../../components/SidebarAdmin";
import AideModal from "../../components/AideModal";
import "./AdminMedecinsPage.css";

function AdminMedecinsPage() {
  const [admin, setAdmin] = useState(null);
  const [medecins, setMedecins] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAide, setShowAide] = useState(false);
  const navigate = useNavigate();

  // ── Modal suppression ──
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [medecinToDelete, setMedecinToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Modal modification ──
  const [showEditModal, setShowEditModal] = useState(false);
  const [medecinToEdit, setMedecinToEdit] = useState(null);
  const [editData, setEditData] = useState({
    prenom: "",
    nom: "",
    telephone: "",
    specialite: "",
    nomService: "",
    adresse: "",
    ville: "",
    region: "",
    sexe: "",
  });
  const [editLoading, setEditLoading] = useState(false);

  // ── Chargement ──
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const profileRes = await api.get("/api/auth/profile");
        setAdmin(profileRes.data);

        const medecinsRes = await api.get("/api/medecins");
        const data = medecinsRes.data || [];

        const enriched = await Promise.all(
          data.map(async (m) => {
            let email = "--";
            let statut = "--";
            try {
              const userRes = await api.get(
                `/api/auth/users/${m.utilisateurId}`,
              );
              email = userRes.data?.email || "--";
              statut = userRes.data?.statut || "--";
            } catch {}
            return { ...m, email, statut };
          }),
        );

        setMedecins(enriched);
      } catch (err) {
        console.error("Erreur chargement médecins admin", err);
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
        m.ville?.toLowerCase().includes(q) ||
        m.numeroProfessionnel?.toLowerCase().includes(q),
    );
  }, [medecins, search]);

  // ── Suppression ──
  const openDeleteModal = (medecin) => {
    setMedecinToDelete(medecin);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!medecinToDelete) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/api/medecins/${medecinToDelete.id}`);
      try {
        await api.delete(`/api/auth/users/${medecinToDelete.utilisateurId}`);
      } catch {}
      setMedecins((prev) => prev.filter((m) => m.id !== medecinToDelete.id));
      setShowDeleteModal(false);
      setMedecinToDelete(null);
    } catch (err) {
      console.error("Erreur suppression médecin", err);
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Modification ──
  const openEditModal = (medecin) => {
    setMedecinToEdit(medecin);
    setEditData({
      prenom: medecin.prenom || "",
      nom: medecin.nom || "",
      telephone: medecin.telephone || "",
      specialite: medecin.specialite || "",
      nomService: medecin.nomService || "",
      adresse: medecin.adresse || "",
      ville: medecin.ville || "",
      region: medecin.region || "",
      sexe: medecin.sexe || "",
    });
    setShowEditModal(true);
  };

  const handleEdit = async () => {
    if (!medecinToEdit) return;
    setEditLoading(true);
    try {
      const res = await api.put(`/api/medecins/${medecinToEdit.id}`, {
        ...editData,
        utilisateurId: medecinToEdit.utilisateurId,
        dateNaissance: medecinToEdit.dateNaissance,
        numeroProfessionnel: medecinToEdit.numeroProfessionnel,
      });
      setMedecins((prev) =>
        prev.map((m) =>
          m.id === medecinToEdit.id
            ? { ...m, ...res.data, email: m.email, statut: m.statut }
            : m,
        ),
      );
      setShowEditModal(false);
      setMedecinToEdit(null);
    } catch (err) {
      console.error("Erreur modification médecin", err);
    } finally {
      setEditLoading(false);
    }
  };

  // ── Badge statut ──
  const statutBadge = (statut) => {
    const map = {
      APPROVED: {
        gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
        label: "Approuvé",
      },
      PENDING: {
        gradient: "linear-gradient(135deg, #ffd43b 0%, #fab005 100%)",
        label: "En attente",
      },
      REJECTED: {
        gradient: "linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)",
        label: "Rejeté",
      },
    };
    const cfg = map[statut] || {
      gradient: "linear-gradient(135deg, #868e96 0%, #495057 100%)",
      label: statut,
    };
    return (
      <Badge className="am-badge" style={{ background: cfg.gradient }}>
        {cfg.label}
      </Badge>
    );
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
        <span className="am-email">
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
          className="am-badge"
          style={{
            background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
          }}
        >
          {r.specialite || "--"}
        </Badge>
      ),
    },

    {
      name: "Actions",
      minWidth: "180px",
      cell: (r) => (
        <div className="am-actions">
          <button
            className="am-btn-edit"
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(r);
            }}
          >
            <i className="bi bi-pencil-fill me-1"></i>
          </button>
          <button
            className="am-btn-delete"
            onClick={(e) => {
              e.stopPropagation();
              openDeleteModal(r);
            }}
          >
            <i className="bi bi-trash-fill me-1"></i>
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
  // ── Compteurs statuts ──
  const nbApprouves = medecins.filter((m) => m.statut === "APPROVED").length;
  const nbEnAttente = medecins.filter((m) => m.statut === "PENDING").length;
  const nbRejetes = medecins.filter((m) => m.statut === "REJECTED").length;

  return (
    <div className="am-wrapper">
      <SidebarAdmin admin={admin} onShowAide={() => setShowAide(true)} />

      <div className="am-content">
        <div className="am-container">
          {/* ── Hero ── */}
          <div className="am-hero">
            <div className="am-hero-orb am-hero-orb--1"></div>
            <div className="am-hero-orb am-hero-orb--2"></div>
            <div className="am-hero-inner">
              <div>
                <div className="am-hero-badge">
                  <i className="bi bi-person-badge-fill me-2"></i>Gestion des
                  médecins
                </div>
                <h1 className="am-hero-title">Liste des médecins</h1>
                <p className="am-hero-sub">
                  {medecins.length} médecin{medecins.length > 1 ? "s" : ""}{" "}
                  enregistré{medecins.length > 1 ? "s" : ""} sur la plateforme
                </p>
              </div>
              <div className="am-hero-stats">
                <div className="am-hero-stat">
                  <div className="am-hero-stat-value">{nbApprouves}</div>
                  <div className="am-hero-stat-label">Approuvés</div>
                </div>
                <div className="am-hero-stat-divider"></div>
                <div className="am-hero-stat">
                  <div className="am-hero-stat-value am-hero-stat-value--warning">
                    {nbEnAttente}
                  </div>
                  <div className="am-hero-stat-label">En attente</div>
                </div>
                <div className="am-hero-stat-divider"></div>
                <div className="am-hero-stat">
                  <div className="am-hero-stat-value am-hero-stat-value--danger">
                    {nbRejetes}
                  </div>
                  <div className="am-hero-stat-label">Rejetés</div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Table card ── */}
          <div className="am-table-card">
            <div className="am-table-card-body">
              {/* Barre d'actions */}
              <div className="am-actions-bar">
                <div className="am-actions-left">
                  <Badge className="am-count-badge">
                    <i className="bi bi-person-badge-fill me-2"></i>
                    {filteredMedecins.length} médecin
                    {filteredMedecins.length > 1 ? "s" : ""}
                  </Badge>
                </div>
                <div className="am-actions-right">
                  <Form.Control
                    placeholder="Rechercher un médecin..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="am-search-input"
                  />
                  <button
                    className="am-btn-attente"
                    onClick={() => navigate("/admin/attente")}
                  >
                    <i className="bi bi-hourglass-split me-2"></i>
                    En attente
                    {nbEnAttente > 0 && (
                      <span className="am-btn-badge">{nbEnAttente}</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Table */}
              <DataTable
                columns={columns}
                data={filteredMedecins}
                progressPending={loading}
                pagination
                paginationPerPage={10}
                paginationRowsPerPageOptions={[5, 10, 15, 20, 30]}
                highlightOnHover
                pointerOnHover
                responsive
                striped
                customStyles={customStyles}
                noDataComponent={
                  <div className="am-no-data">
                    <i className="bi bi-inbox"></i>
                    <p>Aucun médecin trouvé</p>
                  </div>
                }
                expandableRows
                expandOnRowClicked={false}
                expandableRowsComponent={({ data: r }) => (
                  <div className="am-expanded">
                    <div className="am-expanded-item">
                      <i className="bi bi-telephone-fill"></i>
                      <span>
                        <strong>Téléphone :</strong> {r.telephone || "--"}
                      </span>
                    </div>
                    <div className="am-expanded-item">
                      <i className="bi bi-hospital"></i>
                      <span>
                        <strong>Service :</strong> {r.nomService || "--"}
                      </span>
                    </div>
                    <div className="am-expanded-item">
                      <i className="bi bi-geo-alt-fill"></i>
                      <span>
                        <strong>Ville :</strong> {r.ville || "--"}
                      </span>
                    </div>
                    <div className="am-expanded-item">
                      <i className="bi bi-map-fill"></i>
                      <span>
                        <strong>Région :</strong> {r.region || "--"}
                      </span>
                    </div>
                    <div className="am-expanded-item">
                      <i className="bi bi-house-fill"></i>
                      <span>
                        <strong>Adresse :</strong> {r.adresse || "--"}
                      </span>
                    </div>
                    <div className="am-expanded-item">
                      <i className="bi bi-calendar-check-fill"></i>
                      <span>
                        <strong>Date d'inscription :</strong>{" "}
                        {r.dateEnregistrement || "--"}
                      </span>
                    </div>
                    <div className="am-expanded-item">
                      <i className="bi bi-card-text"></i>
                      <span>
                        <strong>N° Professionnel :</strong>
                      </span>
                      <Badge
                        className="am-badge"
                        style={{
                          background:
                            "linear-gradient(135deg, #38ef7d 0%, #11998e 100%)",
                        }}
                      >
                        {r.numeroProfessionnel || "--"}
                      </Badge>
                    </div>

                    <div className="am-expanded-item">
                      <i className="bi bi-shield-check"></i>
                      <span>
                        <strong>Statut :</strong>
                      </span>
                      {statutBadge(r.statut)}
                    </div>
                  </div>
                )}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal suppression ── */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
        className="am-modal"
      >
        <Modal.Header
          closeButton
          className="am-modal-header am-modal-header--danger"
        >
          <Modal.Title className="text-white">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            Confirmer la suppression
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="am-modal-body">
          {medecinToDelete && (
            <div className="am-delete-confirm">
              <div className="am-delete-icon">
                <i className="bi bi-person-x-fill"></i>
              </div>
              <p className="am-delete-text">
                Vous êtes sur le point de supprimer définitivement le médecin
              </p>
              <div className="am-delete-name">
                Dr. {medecinToDelete.prenom} {medecinToDelete.nom}
              </div>
              <div className="am-delete-info">
                <span>
                  <i className="bi bi-card-text me-1"></i>
                  {medecinToDelete.numeroProfessionnel}
                </span>
                <span>
                  <i className="bi bi-hospital me-1"></i>
                  {medecinToDelete.specialite || "Non renseigné"}
                </span>
              </div>
              <p className="am-delete-warning">
                <i className="bi bi-info-circle me-1"></i>
                Cette action supprimera également le compte utilisateur associé.
                Elle est irréversible.
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="am-modal-footer">
          <button
            className="am-btn-cancel"
            onClick={() => setShowDeleteModal(false)}
          >
            Annuler
          </button>
          <button
            className="am-btn-confirm-delete"
            onClick={handleDelete}
            disabled={deleteLoading}
          >
            {deleteLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Suppression...
              </>
            ) : (
              <>
                <i className="bi bi-trash-fill me-2"></i>Supprimer
                définitivement
              </>
            )}
          </button>
        </Modal.Footer>
      </Modal>

      {/* ── Modal modification ── */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        size="lg"
        centered
        className="am-modal"
      >
        <Modal.Header
          closeButton
          className="am-modal-header am-modal-header--edit"
        >
          <Modal.Title className="text-white">
            <i className="bi bi-pencil-fill me-2"></i>
            Modifier — Dr. {medecinToEdit?.prenom} {medecinToEdit?.nom}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="am-modal-body">
          <div className="am-edit-grid">
            {[
              { label: "Prénom", key: "prenom", type: "text" },
              { label: "Nom", key: "nom", type: "text" },
              { label: "Téléphone", key: "telephone", type: "text" },
              { label: "Spécialité", key: "specialite", type: "text" },
              { label: "Service", key: "nomService", type: "text" },
              { label: "Adresse", key: "adresse", type: "text" },
              { label: "Ville", key: "ville", type: "text" },
              { label: "Région", key: "region", type: "text" },
            ].map(({ label, key, type }) => (
              <div className="am-form-group" key={key}>
                <label className="am-form-label">{label}</label>
                <input
                  type={type}
                  className="am-form-input"
                  value={editData[key]}
                  onChange={(e) =>
                    setEditData((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                />
              </div>
            ))}
            <div className="am-form-group">
              <label className="am-form-label">Sexe</label>
              <select
                className="am-form-input"
                value={editData.sexe}
                onChange={(e) =>
                  setEditData((prev) => ({ ...prev, sexe: e.target.value }))
                }
              >
                <option value="">-- Choisir --</option>
                <option value="MASCULIN">Masculin</option>
                <option value="FEMININ">Féminin</option>
              </select>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="am-modal-footer">
          <button
            className="am-btn-cancel"
            onClick={() => setShowEditModal(false)}
          >
            Annuler
          </button>
          <button
            className="am-btn-confirm-edit"
            onClick={handleEdit}
            disabled={editLoading}
          >
            {editLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Enregistrement...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle-fill me-2"></i>Enregistrer
              </>
            )}
          </button>
        </Modal.Footer>
      </Modal>

      <AideModal show={showAide} onHide={() => setShowAide(false)} />
    </div>
  );
}

export default AdminMedecinsPage;
