// src/pages/admin/AdminPatientsPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import DataTable from "react-data-table-component";
import { Badge, Form, Button, Modal } from "react-bootstrap";
import api from "../../services/api";
import SidebarAdmin from "../../components/SidebarAdmin";
import AideModal from "../../components/AideModal";
import "./AdminPatientsPage.css";

function AdminPatientsPage() {
  const [admin, setAdmin] = useState(null);
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAide, setShowAide] = useState(false);

  // ── Modal suppression ──
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Modal modification ──
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    prenom: "",
    nom: "",
    telephone: "",
    adresse: "",
    ville: "",
    region: "",
    typeDiabete: "",
    sexe: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState(null);

  // ── Chargement ──
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const profileRes = await api.get("/api/auth/profile");
        setAdmin(profileRes.data);

        const patientsRes = await api.get("/api/patients");
        const data = patientsRes.data || [];

        const enriched = await Promise.all(
          data.map(async (p) => {
            let email = "--";
            try {
              const emailRes = await api.get(
                `/api/auth/users/${p.utilisateurId}/email`,
              );
              email = emailRes.data || "--";
            } catch {}
            return { ...p, email };
          }),
        );

        setPatients(enriched);
      } catch (err) {
        console.error("Erreur chargement patients admin", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── Filtre ──
  const filteredPatients = useMemo(() => {
    if (!search) return patients;
    const q = search.toLowerCase();
    return patients.filter(
      (p) =>
        p.nom?.toLowerCase().includes(q) ||
        p.prenom?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        p.ville?.toLowerCase().includes(q),
    );
  }, [patients, search]);

  // ── Suppression ──
  const openDeleteModal = (patient) => {
    setPatientToDelete(patient);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!patientToDelete) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/api/patients/${patientToDelete.id}`);
      try {
        await api.delete(`/api/auth/users/${patientToDelete.utilisateurId}`);
      } catch {}
      setPatients((prev) => prev.filter((p) => p.id !== patientToDelete.id));
      setShowDeleteModal(false);
      setPatientToDelete(null);
    } catch (err) {
      console.error("Erreur suppression patient", err);
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Modification ──
  const openEditModal = (patient) => {
    setPatientToEdit(patient);
    setEditData({
      prenom: patient.prenom || "",
      nom: patient.nom || "",
      telephone: patient.telephone || "",
      adresse: patient.adresse || "",
      ville: patient.ville || "",
      region: patient.region || "",
      typeDiabete: patient.typeDiabete || "",
      sexe: patient.sexe || "",
    });
    setShowEditModal(true);
  };

  const handleEdit = async () => {
    if (!patientToEdit) return;
    setEditLoading(true);
    try {
      const res = await api.put(`/api/patients/${patientToEdit.id}`, {
        ...editData,
        utilisateurId: patientToEdit.utilisateurId,
        dateNaissance: patientToEdit.dateNaissance,
        numeroDossier: patientToEdit.numeroDossier,
        medecinId: patientToEdit.medecinId,
      });
      setPatients((prev) =>
        prev.map((p) =>
          p.id === patientToEdit.id ? { ...p, ...res.data, email: p.email } : p,
        ),
      );
      setShowEditModal(false);
      setPatientToEdit(null);
    } catch (err) {
      console.error("Erreur modification patient", err);
    } finally {
      setEditLoading(false);
    }
  };

  // ── Colonnes ──
  const columns = [
    {
      name: "Prénom",
      selector: (r) => r.prenom,
      sortable: true,
      minWidth: "130px",
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
      minWidth: "130px",
      cell: (r) => (
        <div className="ap-cell">
          <i className="bi bi-person"></i>
          <strong>{r.nom}</strong>
        </div>
      ),
    },
    {
      name: "Email",
      selector: (r) => r.email,
      minWidth: "210px",
      cell: (r) => (
        <span className="ap-email">
          <i className="bi bi-envelope me-1"></i>
          {r.email}
        </span>
      ),
    },
    {
      name: "Type de diabète",
      minWidth: "150px",
      cell: (r) => (
        <Badge
          className="ap-badge"
          style={{
            background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
          }}
        >
          {r.typeDiabete || "--"}
        </Badge>
      ),
    },

    {
      name: "Actions",
      minWidth: "180px",
      cell: (r) => (
        <div className="ap-actions">
          <button
            className="ap-btn-edit"
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(r);
            }}
          >
            <i className="bi bi-pencil-fill me-1"></i>
          </button>
          <button
            className="ap-btn-delete"
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

  return (
    <div className="ap-wrapper">
      <SidebarAdmin admin={admin} onShowAide={() => setShowAide(true)} />

      <div className="ap-content">
        <div className="ap-container">
          {/* ── Hero ── */}
          <div className="ap-hero">
            <div className="ap-hero-orb ap-hero-orb--1"></div>
            <div className="ap-hero-orb ap-hero-orb--2"></div>
            <div className="ap-hero-inner">
              <div>
                <div className="ap-hero-badge">
                  <i className="bi bi-people-fill me-2"></i>Gestion des patients
                </div>
                <h1 className="ap-hero-title">Liste des patients</h1>
                <p className="ap-hero-sub">
                  {patients.length} patient{patients.length > 1 ? "s" : ""}{" "}
                  enregistré{patients.length > 1 ? "s" : ""} sur la plateforme
                </p>
              </div>
              <div className="ap-hero-stat">
                <div className="ap-hero-stat-value">{patients.length}</div>
                <div className="ap-hero-stat-label">Total patients</div>
              </div>
            </div>
          </div>

          {/* ── Table card ── */}
          <div className="ap-table-card">
            <div className="ap-table-card-body">
              {/* Barre d'actions */}
              <div className="ap-actions-bar">
                <div className="ap-actions-left">
                  <Badge className="ap-count-badge">
                    <i className="bi bi-people-fill me-2"></i>
                    {filteredPatients.length} patient
                    {filteredPatients.length > 1 ? "s" : ""}
                  </Badge>
                </div>
                <div className="ap-actions-right">
                  <Form.Control
                    placeholder="Rechercher un patient..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="ap-search-input"
                  />
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
                customStyles={customStyles}
                noDataComponent={
                  <div className="ap-no-data">
                    <i className="bi bi-inbox"></i>
                    <p>Aucun patient trouvé</p>
                  </div>
                }
                expandableRows
                expandOnRowClicked={false}
                expandableRowsComponent={({ data: r }) => (
                  <div className="ap-expanded">
                    <div className="ap-expanded-item">
                      <i className="bi bi-telephone-fill"></i>
                      <span>
                        <strong>Téléphone :</strong> {r.telephone || "--"}
                      </span>
                    </div>
                    <div className="ap-expanded-item">
                      <i className="bi bi-house-fill"></i>
                      <span>
                        <strong>Adresse :</strong> {r.adresse || "--"}
                      </span>
                    </div>
                    <div className="ap-expanded-item">
                      <i className="bi bi-geo-alt-fill"></i>
                      <span>
                        <strong>Ville :</strong> {r.ville || "--"}
                      </span>
                    </div>
                    <div className="ap-expanded-item">
                      <i className="bi bi-map-fill"></i>
                      <span>
                        <strong>Région :</strong> {r.region || "--"}
                      </span>
                    </div>
                    <div className="ap-expanded-item">
                      <i className="bi bi-calendar-check-fill"></i>
                      <span>
                        <strong>Date d'inscription :</strong>{" "}
                        {r.dateEnregistrement || "--"}
                      </span>
                    </div>
                    <div className="ap-expanded-item">
                      <i className="bi bi-person-badge-fill"></i>
                      <span>
                        <strong>N° Dossier :</strong> {r.numeroDossier || "--"}
                      </span>
                    </div>
                    <div className="ap-expanded-item">
                      <i className="bi bi-person-badge-fill"></i>
                      <span>
                        <strong>Médecin référent :</strong>
                      </span>
                      {r.medecinId ? (
                        <Badge
                          className="ap-badge"
                          style={{
                            background:
                              "linear-gradient(135deg, #428484 0%, #0f0f0f 100%)",
                          }}
                        >
                          <i className="bi bi-check-circle me-1"></i>Rattaché
                        </Badge>
                      ) : (
                        <Badge
                          className="ap-badge"
                          style={{
                            background:
                              "linear-gradient(135deg, #868e96 0%, #495057 100%)",
                          }}
                        >
                          <i className="bi bi-x-circle me-1"></i>Non rattaché
                        </Badge>
                      )}
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
        className="ap-modal"
      >
        <Modal.Header
          closeButton
          className="ap-modal-header ap-modal-header--danger"
        >
          <Modal.Title className="text-white">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            Confirmer la suppression
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="ap-modal-body">
          {patientToDelete && (
            <div className="ap-delete-confirm">
              <div className="ap-delete-icon">
                <i className="bi bi-person-x-fill"></i>
              </div>
              <p className="ap-delete-text">
                Vous êtes sur le point de supprimer définitivement le patient
              </p>
              <div className="ap-delete-name">
                {patientToDelete.prenom} {patientToDelete.nom}
              </div>
              <p className="ap-delete-warning">
                <i className="bi bi-info-circle me-1"></i>
                Cette action supprimera également le compte utilisateur associé.
                Elle est irréversible.
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="ap-modal-footer">
          <Button
            className="ap-btn-cancel"
            onClick={() => setShowDeleteModal(false)}
          >
            Annuler
          </Button>
          <Button
            className="ap-btn-confirm-delete"
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
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Modal modification ── */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        size="lg"
        centered
        className="ap-modal"
      >
        <Modal.Header
          closeButton
          className="ap-modal-header ap-modal-header--edit"
        >
          <Modal.Title className="text-white">
            <i className="bi bi-pencil-fill me-2"></i>
            Modifier le patient — {patientToEdit?.prenom} {patientToEdit?.nom}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="ap-modal-body">
          <div className="ap-edit-grid">
            {[
              { label: "Prénom", key: "prenom", type: "text" },
              { label: "Nom", key: "nom", type: "text" },
              { label: "Téléphone", key: "telephone", type: "text" },
              { label: "Adresse", key: "adresse", type: "text" },
              { label: "Ville", key: "ville", type: "text" },
              { label: "Région", key: "region", type: "text" },
            ].map(({ label, key, type }) => (
              <div className="ap-form-group" key={key}>
                <label className="ap-form-label">{label}</label>
                <input
                  type={type}
                  className="ap-form-input"
                  value={editData[key]}
                  onChange={(e) =>
                    setEditData((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                />
              </div>
            ))}

            <div className="ap-form-group">
              <label className="ap-form-label">Type de diabète</label>
              <select
                className="ap-form-input"
                value={editData.typeDiabete}
                onChange={(e) =>
                  setEditData((prev) => ({
                    ...prev,
                    typeDiabete: e.target.value,
                  }))
                }
              >
                <option value="">-- Choisir --</option>
                <option value="TYPE_1">Type 1</option>
                <option value="TYPE_2">Type 2</option>
                <option value="GESTATIONNEL">Gestationnel</option>
                <option value="AUTRE">Autre</option>
              </select>
            </div>

            <div className="ap-form-group">
              <label className="ap-form-label">Sexe</label>
              <select
                className="ap-form-input"
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
        <Modal.Footer className="ap-modal-footer">
          <Button
            className="ap-btn-cancel"
            onClick={() => setShowEditModal(false)}
          >
            Annuler
          </Button>
          <Button
            className="ap-btn-confirm-edit"
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
          </Button>
        </Modal.Footer>
      </Modal>

      <AideModal show={showAide} onHide={() => setShowAide(false)} />
    </div>
  );
}

export default AdminPatientsPage;
