// src/pages/Conseils.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Modal } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import SidebarPatient from "../../components/SidebarPatient";
import "./Conseils.css";

const TYPE_ICONS = {
  TEXTE: "bi-chat-left-text-fill",
  VIDEO: "bi-play-circle-fill",
  PDF: "bi-file-earmark-pdf-fill",
};
const TYPE_LABELS = { TEXTE: "Texte", VIDEO: "Vidéo", PDF: "PDF" };

function Conseils() {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [conseils, setConseils] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [medecinId, setMedecinId] = useState(null);
  const [success, setSuccess] = useState(false);
  const [filterType, setFilterType] = useState("TOUS");
  const [showDetail, setShowDetail] = useState(false);
  const [selectedConseil, setSelectedConseil] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfFileName, setPdfFileName] = useState("");

  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    typeConseil: "TEXTE",
    lienVideo: "",
  });

  const loadConseils = useCallback(async () => {
    const res = await api.get(`/api/conseils/patient/${patientId}`);
    const sorted = res.data.sort(
      (a, b) => new Date(b.dateCreation) - new Date(a.dateCreation),
    );
    setConseils(sorted);
  }, [patientId]);

  // ── Chargement ──
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingPage(true);

        const profileRes = await api.get("/api/auth/profile");
        const medRes = await api.get(
          `/api/medecins/byUtilisateur/${profileRes.data.id}`,
        );

        if (!medRes.data?.id) throw new Error("Médecin introuvable.");
        setMedecinId(medRes.data.id);

        if (!patientId) throw new Error("Patient ID manquant !");
        const patRes = await api.get(`/api/patients/${patientId}`);
        setPatient(patRes.data);

        await loadConseils();
      } catch (err) {
        console.error("Erreur chargement :", err);
      } finally {
        setLoadingPage(false);
      }
    };

    fetchData();
  }, [patientId, loadConseils]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "typeConseil") {
      setPdfFile(null);
      setPdfFileName("");
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        lienVideo: "",
        description: "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPdfFile(file);
      setPdfFileName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientId || !medecinId) return;
    try {
      setLoading(true);
      if (formData.typeConseil === "PDF") {
        if (!pdfFile) return;
        const data = new FormData();
        const blob = new Blob(
          [JSON.stringify({ ...formData, patientId: Number(patientId) })],
          { type: "application/json" },
        );
        data.append("conseil", blob);
        data.append("fichier", pdfFile);
        await api.post("/api/conseils/pdf", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/api/conseils", {
          ...formData,
          patientId: Number(patientId),
        });
      }
      setSuccess(true);
      setFormData({
        titre: "",
        description: "",
        typeConseil: "TEXTE",
        lienVideo: "",
      });
      setPdfFile(null);
      setPdfFileName("");
      await loadConseils();
    } catch (err) {
      console.error("Erreur :", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce conseil définitivement ?")) return;
    try {
      await api.delete(`/api/conseils/${id}`);
      await loadConseils();
    } catch {}
  };

  const filteredConseils =
    filterType === "TOUS"
      ? conseils
      : conseils.filter((c) => c.typeConseil === filterType);

  const typeClass = (t) => t?.toLowerCase();

  if (loadingPage) {
    return (
      <div className="co-loading">
        <div className="co-loading-content">
          <div className="co-spinner"></div>
          <p className="co-loading-text">Chargement des conseils...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="co-page">
      <SidebarPatient patient={patient} isMedecin={true} />

      <div className="co-main">
        <div className="co-inner">
          {/* ── TOPBAR ── */}
          <div className="co-topbar">
            <div className="co-topbar-left">
              <div className="co-topbar-icon">
                <i className="bi bi-lightbulb-fill"></i>
              </div>
              <div>
                <h1 className="co-topbar-title">Conseils personnalisés</h1>
                <p className="co-topbar-sub">
                  <i className="bi bi-person-badge"></i>
                  {patient?.prenom} {patient?.nom}
                  {patient?.typeDiabete && (
                    <span className="co-type-badge">{patient.typeDiabete}</span>
                  )}
                </p>
              </div>
            </div>
            <button
              className="co-btn-back"
              onClick={() =>
                navigate(`/medecin/patient/${patientId}/dashboard`)
              }
            >
              <i className="bi bi-arrow-left"></i> Retour
            </button>
          </div>

          {/* ── FORMULAIRE / SUCCÈS ── */}
          {!success ? (
            <div className="co-panel" style={{ animationDelay: "0.05s" }}>
              <div className="co-panel-head">
                <div className="co-panel-icon">
                  <i className="bi bi-send-fill"></i>
                </div>
                <div>
                  <div className="co-panel-title">Nouveau conseil</div>
                  <div className="co-panel-sub">
                    Envoyez un conseil personnalisé (texte, vidéo ou PDF)
                  </div>
                </div>
              </div>
              <div className="co-panel-body">
                {/* Sélecteur de type */}
                <div className="co-type-selector">
                  {["TEXTE", "VIDEO", "PDF"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      className={`co-type-btn ${formData.typeConseil === type ? `co-active-${type.toLowerCase()}` : ""}`}
                      onClick={() =>
                        handleChange({
                          target: { name: "typeConseil", value: type },
                        })
                      }
                    >
                      <i className={`bi ${TYPE_ICONS[type]}`}></i>
                      {TYPE_LABELS[type]}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSubmit}>
                  {/* Titre */}
                  <div className="co-form-group">
                    <label className="co-form-label">
                      <i className="bi bi-fonts"></i> Titre{" "}
                      <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="titre"
                      value={formData.titre}
                      onChange={handleChange}
                      className="co-form-input"
                      placeholder="Ex: Alimentation équilibrée pour diabétique..."
                      required
                    />
                  </div>

                  {/* TEXTE */}
                  {formData.typeConseil === "TEXTE" && (
                    <div className="co-form-group">
                      <label className="co-form-label">
                        <i className="bi bi-chat-left-text"></i> Contenu{" "}
                        <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="co-form-textarea"
                        placeholder="Rédigez votre conseil personnalisé..."
                        required
                      />
                    </div>
                  )}

                  {/* VIDEO */}
                  {formData.typeConseil === "VIDEO" && (
                    <div className="co-form-group">
                      <label className="co-form-label">
                        <i className="bi bi-link-45deg"></i> Lien vidéo{" "}
                        <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <input
                        type="url"
                        name="lienVideo"
                        value={formData.lienVideo}
                        onChange={handleChange}
                        className="co-form-input"
                        placeholder="https://www.youtube.com/watch?v=..."
                        required
                      />
                      <div className="co-form-hint">
                        <i className="bi bi-info-circle"></i> YouTube, Vimeo ou
                        tout autre lien vidéo
                      </div>
                    </div>
                  )}

                  {/* PDF */}
                  {formData.typeConseil === "PDF" && (
                    <div className="co-form-group">
                      <label className="co-form-label">
                        <i className="bi bi-file-earmark-pdf"></i> Fichier PDF{" "}
                        <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <div className="co-pdf-zone">
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={handlePdfChange}
                          className="co-pdf-input"
                          id="co-pdf-upload"
                          required
                        />
                        <label htmlFor="co-pdf-upload" className="co-pdf-label">
                          {pdfFileName ? (
                            <>
                              <i className="bi bi-file-earmark-check-fill selected"></i>
                              <span className="co-pdf-name">{pdfFileName}</span>
                              <span className="co-pdf-change">
                                Cliquez pour changer
                              </span>
                            </>
                          ) : (
                            <>
                              <i className="bi bi-cloud-arrow-up"></i>
                              <span className="co-pdf-placeholder">
                                Glissez votre PDF ou{" "}
                                <strong>cliquez pour parcourir</strong>
                              </span>
                              <span className="co-pdf-limit">
                                Taille maximale : 10 Mo
                              </span>
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Description optionnelle VIDEO/PDF */}
                  {(formData.typeConseil === "VIDEO" ||
                    formData.typeConseil === "PDF") && (
                    <div className="co-form-group">
                      <label className="co-form-label">
                        <i className="bi bi-chat-left-dots"></i> Description
                        (optionnelle)
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="co-form-textarea"
                        placeholder="Ajoutez des instructions complémentaires..."
                      />
                    </div>
                  )}

                  <div className="co-form-actions">
                    <button
                      type="submit"
                      className="co-btn-submit"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Envoi...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-send me-2"></i>Envoyer le conseil
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      className="co-btn-cancel"
                      onClick={() =>
                        navigate(`/medecin/patient/${patientId}/dashboard`)
                      }
                      disabled={loading}
                    >
                      <i className="bi bi-x-lg"></i> Annuler
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="co-success">
              <div className="co-success-icon">
                <i className="bi bi-patch-check-fill"></i>
              </div>
              <div className="co-success-title">
                Conseil envoyé avec succès !
              </div>
              <p className="co-success-text">
                Le conseil est maintenant visible pour le patient.
              </p>
              <div className="co-success-actions">
                <button
                  className="co-success-btn-primary"
                  onClick={() => setSuccess(false)}
                >
                  <i className="bi bi-plus-circle"></i> Ajouter un autre
                </button>
                <button
                  className="co-success-btn-secondary"
                  onClick={() =>
                    navigate(`/medecin/patient/${patientId}/dashboard`)
                  }
                >
                  <i className="bi bi-house"></i> Retour au dossier
                </button>
              </div>
            </div>
          )}

          {/* ── LISTE DES CONSEILS ── */}
          <div className="co-panel" style={{ animationDelay: "0.1s" }}>
            <div className="co-panel-head">
              <div
                className="co-panel-icon"
                style={{
                  background: "linear-gradient(135deg, #667eea, #764ba2)",
                }}
              >
                <i className="bi bi-collection"></i>
              </div>
              <div>
                <div className="co-panel-title">Conseils du patient</div>
                <div className="co-history-count">
                  {conseils.length} conseil{conseils.length > 1 ? "s" : ""}{" "}
                  enregistré{conseils.length > 1 ? "s" : ""}
                </div>
              </div>
            </div>
            <div className="co-panel-body">
              {/* Filtres + header */}
              <div className="co-history-head">
                <div></div>
                <div className="co-filters">
                  {["TOUS", "TEXTE", "VIDEO", "PDF"].map((f) => (
                    <button
                      key={f}
                      className={`co-filter-btn ${filterType === f ? "co-filter-active" : ""}`}
                      onClick={() => setFilterType(f)}
                    >
                      {f !== "TOUS" && (
                        <i className={`bi ${TYPE_ICONS[f]}`}></i>
                      )}
                      {f === "TOUS" ? "Tous" : TYPE_LABELS[f]}
                    </button>
                  ))}
                </div>
              </div>

              {filteredConseils.length > 0 ? (
                <div className="co-grid">
                  {filteredConseils.map((c) => (
                    <div
                      key={c.id}
                      className={`co-card co-card--${typeClass(c.typeConseil)}`}
                    >
                      <div className="co-card-top">
                        <div
                          className={`co-card-type-icon co-card-type-icon--${typeClass(c.typeConseil)}`}
                        >
                          <i className={`bi ${TYPE_ICONS[c.typeConseil]}`}></i>
                        </div>
                        <span
                          className={`co-card-badge co-card-badge--${typeClass(c.typeConseil)}`}
                        >
                          {TYPE_LABELS[c.typeConseil]}
                        </span>
                      </div>

                      <h6 className="co-card-title">{c.titre}</h6>

                      {c.description && (
                        <p className="co-card-desc">{c.description}</p>
                      )}

                      {c.typeConseil === "VIDEO" && c.lienVideo && (
                        <a
                          href={c.lienVideo}
                          target="_blank"
                          rel="noreferrer"
                          className="co-card-link co-card-link--video"
                        >
                          <i className="bi bi-play-circle"></i> Voir la vidéo
                        </a>
                      )}

                      {c.typeConseil === "PDF" && c.urlPdf && (
                        <a
                          href={`${c.urlPdf}#toolbar=1&view=FitH`}
                          target="_blank"
                          rel="noreferrer"
                          className="co-card-link co-card-link--pdf"
                          type="application/pdf"
                          F
                        >
                          <i className="bi bi-eye"></i>{" "}
                          {c.nomFichierPdf || "Voir le PDF"}
                        </a>
                      )}

                      <div className="co-card-footer">
                        <span className="co-card-date">
                          <i className="bi bi-calendar3"></i>
                          {new Date(c.dateCreation).toLocaleDateString("fr-FR")}
                        </span>
                        <div className="co-card-actions">
                          <button
                            className="co-btn-view"
                            onClick={() => {
                              setSelectedConseil(c);
                              setShowDetail(true);
                            }}
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          <button
                            className="co-btn-del"
                            onClick={() => handleDelete(c.id)}
                          >
                            <i className="bi bi-trash3"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="co-empty">
                  <i className="bi bi-lightbulb"></i>
                  <p>
                    {filterType === "TOUS"
                      ? "Aucun conseil enregistré pour ce patient."
                      : `Aucun conseil de type "${TYPE_LABELS[filterType]}" trouvé.`}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL DÉTAIL ── */}
      <Modal
        show={showDetail}
        onHide={() => setShowDetail(false)}
        size="lg"
        centered
        className="co-modal"
      >
        <Modal.Body className="co-modal-body p-0">
          {selectedConseil && (
            <>
              <div className="co-modal-head">
                <div
                  className={`co-modal-type-icon co-modal-type-icon--${typeClass(selectedConseil.typeConseil)}`}
                >
                  <i
                    className={`bi ${TYPE_ICONS[selectedConseil.typeConseil]}`}
                  ></i>
                </div>
                <div>
                  <span
                    className={`co-card-badge co-card-badge--${typeClass(selectedConseil.typeConseil)}`}
                  >
                    {TYPE_LABELS[selectedConseil.typeConseil]}
                  </span>
                  <div className="co-modal-title">{selectedConseil.titre}</div>
                  <p className="co-modal-date">
                    <i className="bi bi-calendar3"></i>
                    {new Date(selectedConseil.dateCreation).toLocaleDateString(
                      "fr-FR",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}
                  </p>
                </div>
              </div>

              <div className="co-modal-divider"></div>

              {selectedConseil.description && (
                <div className="co-modal-section">
                  <div className="co-modal-section-title">
                    <i className="bi bi-chat-left-text"></i> Description
                  </div>
                  <p className="co-modal-content">
                    {selectedConseil.description}
                  </p>
                </div>
              )}

              {selectedConseil.typeConseil === "VIDEO" &&
                selectedConseil.lienVideo && (
                  <div className="co-modal-section">
                    <div className="co-modal-section-title">
                      <i className="bi bi-play-circle"></i> Lien vidéo
                    </div>
                    <a
                      href={selectedConseil.lienVideo}
                      target="_blank"
                      rel="noreferrer"
                      className="co-card-link co-card-link--video"
                    >
                      <i className="bi bi-box-arrow-up-right"></i> Ouvrir la
                      vidéo
                    </a>
                  </div>
                )}

              {selectedConseil.typeConseil === "PDF" &&
                selectedConseil.urlPdf && (
                  <div className="co-modal-section">
                    <div className="co-modal-section-title">
                      <i className="bi bi-file-earmark-pdf"></i> Document PDF
                    </div>
                    <a
                      href={`${selectedConseil.urlPdf}#toolbar=1&view=FitH`}
                      target="_blank"
                      rel="noreferrer"
                      className="co-card-link co-card-link--pdf"
                      type="application/pdf"
                    >
                      <i className="bi bi-download"></i>{" "}
                      {selectedConseil.nomFichierPdf || "Voir le PDF"}
                    </a>
                  </div>
                )}

              <div className="co-modal-footer">
                <button
                  className="co-modal-btn-del"
                  onClick={() => {
                    handleDelete(selectedConseil.id);
                    setShowDetail(false);
                  }}
                >
                  <i className="bi bi-trash3"></i> Supprimer
                </button>
                <button
                  className="co-modal-btn-close"
                  onClick={() => setShowDetail(false)}
                >
                  <i className="bi bi-x-lg"></i> Fermer
                </button>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default Conseils;
