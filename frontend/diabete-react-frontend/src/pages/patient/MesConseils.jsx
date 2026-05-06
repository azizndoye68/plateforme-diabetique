// src/pages/patient/MesConseils.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import SidebarPatient from "../../components/SidebarPatient";
import "./MesConseils.css";

const TYPE_ICONS  = { TEXTE: "bi-chat-left-text-fill", VIDEO: "bi-play-circle-fill", PDF: "bi-file-earmark-pdf-fill" };
const TYPE_LABELS = { TEXTE: "Texte", VIDEO: "Vidéo", PDF: "PDF" };
const TYPE_COLORS = {
  TEXTE: { accent: "#667eea", bg: "#f0f0ff" },
  VIDEO: { accent: "#f5576c", bg: "#fff0f3" },
  PDF:   { accent: "#4facfe", bg: "#f0f8ff" },
};

export default function MesConseils() {
  const { patientId } = useParams();

  const [patient, setPatient]   = useState(null);
  const [conseils, setConseils] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("TOUS");
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let patientData;

        if (patientId) {
          const res = await api.get(`/api/patients/${patientId}`);
          patientData = res.data;
        } else {
          const profileRes = await api.get("/api/auth/profile");
          const res = await api.get(`/api/patients/byUtilisateur/${profileRes.data.id}`);
          patientData = res.data;
        }

        setPatient(patientData);

        const conseilsRes = await api.get(`/api/conseils/patient/${patientData.id}`);
        const sorted = (conseilsRes.data || []).sort(
          (a, b) => new Date(b.dateCreation) - new Date(a.dateCreation)
        );
        setConseils(sorted);
      } catch (err) {
        console.error("Erreur chargement conseils :", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [patientId]);

  const filtered = filter === "TOUS"
    ? conseils
    : conseils.filter(c => c.typeConseil === filter);

  const counts = {
    TOUS:  conseils.length,
    TEXTE: conseils.filter(c => c.typeConseil === "TEXTE").length,
    VIDEO: conseils.filter(c => c.typeConseil === "VIDEO").length,
    PDF:   conseils.filter(c => c.typeConseil === "PDF").length,
  };

  const dernierConseil = conseils[0];

  const openDetail = (c) => { setSelected(c); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setSelected(null); };

  return (
    <div className="mc-wrapper">
      <SidebarPatient patient={patient} isMedecin={!!patientId} />

      <div className="mc-main">
        <div className="mc-container">

          {/* ── HEADER ── */}
          <div className="mc-header">
            <div className="mc-header-left">
              <div className="mc-header-icon">
                <i className="bi bi-lightbulb-fill"></i>
              </div>
              <div>
                <div className="mc-header-tag">SUIVI MÉDICAL</div>
                <h1 className="mc-header-title">Mes conseils</h1>
                <p className="mc-header-sub">
                  {patient ? `${patient.prenom} ${patient.nom}` : "Chargement..."}
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="mc-loading">
              <div className="mc-spinner"></div>
              <p>Chargement de vos conseils...</p>
            </div>
          ) : (
            <>
              {/* ── DERNIER CONSEIL BANNER ── */}
              {dernierConseil && (
                <div
                  className="mc-banner"
                  style={{ "--accent": TYPE_COLORS[dernierConseil.typeConseil]?.accent }}
                  onClick={() => openDetail(dernierConseil)}
                >
                  <div className="mc-banner-icon">
                    <i className={`bi ${TYPE_ICONS[dernierConseil.typeConseil]}`}></i>
                  </div>
                  <div className="mc-banner-body">
                    <span className="mc-banner-label">Dernier conseil reçu</span>
                    <span className="mc-banner-title">{dernierConseil.titre}</span>
                    <span className="mc-banner-date">
                      <i className="bi bi-calendar3 me-1"></i>
                      {new Date(dernierConseil.dateCreation).toLocaleDateString("fr-FR", {
                        day: "2-digit", month: "long", year: "numeric"
                      })}
                    </span>
                  </div>
                  <div className="mc-banner-badge">
                    <i className={`bi ${TYPE_ICONS[dernierConseil.typeConseil]} me-1`}></i>
                    {TYPE_LABELS[dernierConseil.typeConseil]}
                  </div>
                  <i className="bi bi-arrow-right mc-banner-arrow"></i>
                </div>
              )}

              {/* ── STATS ── */}
              <div className="mc-stats">
                <div className="mc-stat">
                  <span className="mc-stat-num">{counts.TOUS}</span>
                  <span className="mc-stat-label">Total</span>
                </div>
                <div className="mc-stat">
                  <span className="mc-stat-num" style={{ color: "#667eea" }}>{counts.TEXTE}</span>
                  <span className="mc-stat-label">Textes</span>
                </div>
                <div className="mc-stat">
                  <span className="mc-stat-num" style={{ color: "#f5576c" }}>{counts.VIDEO}</span>
                  <span className="mc-stat-label">Vidéos</span>
                </div>
                <div className="mc-stat">
                  <span className="mc-stat-num" style={{ color: "#4facfe" }}>{counts.PDF}</span>
                  <span className="mc-stat-label">PDFs</span>
                </div>
              </div>

              {/* ── FILTRES ── */}
              <div className="mc-filters">
                {[
                  { key: "TOUS",  label: "Tous" },
                  { key: "TEXTE", label: "Texte",  icon: TYPE_ICONS.TEXTE, accent: TYPE_COLORS.TEXTE.accent },
                  { key: "VIDEO", label: "Vidéo",  icon: TYPE_ICONS.VIDEO, accent: TYPE_COLORS.VIDEO.accent },
                  { key: "PDF",   label: "PDF",    icon: TYPE_ICONS.PDF,   accent: TYPE_COLORS.PDF.accent },
                ].map(f => (
                  <button
                    key={f.key}
                    className={`mc-filter-btn ${filter === f.key ? "mc-filter-active" : ""}`}
                    onClick={() => setFilter(f.key)}
                    style={filter === f.key && f.accent ? { borderColor: f.accent, color: f.accent } : {}}
                  >
                    {f.icon && <i className={`bi ${f.icon}`}></i>}
                    {f.label}
                    <span className="mc-filter-count">{counts[f.key]}</span>
                  </button>
                ))}
              </div>

              {/* ── LISTE ── */}
              {filtered.length === 0 ? (
                <div className="mc-empty">
                  <i className="bi bi-lightbulb"></i>
                  <h5>Aucun conseil</h5>
                  <p>
                    {filter === "TOUS"
                      ? "Votre médecin n'a pas encore envoyé de conseils."
                      : `Aucun conseil de type "${TYPE_LABELS[filter]}" trouvé.`}
                  </p>
                </div>
              ) : (
                <div className="mc-list">
                  {filtered.map(c => {
                    const tc = TYPE_COLORS[c.typeConseil] || TYPE_COLORS.TEXTE;
                    return (
                      <div key={c.id} className="mc-card" onClick={() => openDetail(c)}>
                        {/* Barre latérale */}
                        <div className="mc-card-bar" style={{ background: tc.accent }}></div>

                        <div className="mc-card-body">
                          {/* Icône type */}
                          <div className="mc-card-icon" style={{ background: tc.bg, color: tc.accent }}>
                            <i className={`bi ${TYPE_ICONS[c.typeConseil]}`}></i>
                          </div>

                          {/* Contenu */}
                          <div className="mc-card-content">
                            <div className="mc-card-top">
                              <span className="mc-card-badge"
                                style={{ background: tc.bg, color: tc.accent }}>
                                {TYPE_LABELS[c.typeConseil]}
                              </span>
                              <span className="mc-card-date">
                                <i className="bi bi-calendar3 me-1"></i>
                                {new Date(c.dateCreation).toLocaleDateString("fr-FR")}
                              </span>
                            </div>
                            <h6 className="mc-card-title">{c.titre}</h6>
                            {c.description && (
                              <p className="mc-card-desc">{c.description}</p>
                            )}
                            {c.typeConseil === "VIDEO" && c.lienVideo && (
                              <span className="mc-card-link-hint">
                                <i className="bi bi-play-circle me-1"></i>Voir la vidéo
                              </span>
                            )}
                            {c.typeConseil === "PDF" && c.urlPdf && (
                              <span className="mc-card-link-hint">
                                <i className="bi bi-download me-1"></i>
                                {c.nomFichierPdf || "Télécharger le PDF"}
                              </span>
                            )}
                          </div>

                          {/* Flèche */}
                          <i className="bi bi-chevron-right mc-card-arrow"
                            style={{ color: tc.accent }}></i>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── MODAL DÉTAIL ── */}
      {showModal && selected && (
        <div className="mc-modal-overlay" onClick={closeModal}>
          <div className="mc-modal" onClick={e => e.stopPropagation()}>
            {(() => {
              const tc = TYPE_COLORS[selected.typeConseil] || TYPE_COLORS.TEXTE;
              return (
                <>
                  <div className="mc-modal-head" style={{ background: `linear-gradient(135deg, ${tc.accent}22, ${tc.bg})` }}>
                    <div className="mc-modal-type-icon" style={{ background: tc.accent }}>
                      <i className={`bi ${TYPE_ICONS[selected.typeConseil]}`}></i>
                    </div>
                    <div className="mc-modal-info">
                      <span className="mc-modal-badge" style={{ background: tc.bg, color: tc.accent }}>
                        {TYPE_LABELS[selected.typeConseil]}
                      </span>
                      <div className="mc-modal-title">{selected.titre}</div>
                      <div className="mc-modal-date">
                        <i className="bi bi-calendar3 me-1"></i>
                        {new Date(selected.dateCreation).toLocaleDateString("fr-FR", {
                          weekday: "long", day: "2-digit", month: "long", year: "numeric"
                        })}
                      </div>
                    </div>
                    <button className="mc-modal-close" onClick={closeModal}>
                      <i className="bi bi-x-lg"></i>
                    </button>
                  </div>

                  <div className="mc-modal-divider" style={{ background: `linear-gradient(90deg, ${tc.accent}, transparent)` }}></div>

                  <div className="mc-modal-body">
                    {selected.description && (
                      <div className="mc-modal-section">
                        <div className="mc-modal-section-title">
                          <i className="bi bi-chat-left-text"></i> Description
                        </div>
                        <p className="mc-modal-content">{selected.description}</p>
                      </div>
                    )}

                    {selected.typeConseil === "VIDEO" && selected.lienVideo && (
                      <div className="mc-modal-section">
                        <div className="mc-modal-section-title">
                          <i className="bi bi-play-circle"></i> Vidéo
                        </div>
                        <a href={selected.lienVideo} target="_blank" rel="noreferrer"
                          className="mc-modal-link" style={{ "--lc": tc.accent }}>
                          <i className="bi bi-box-arrow-up-right"></i>
                          Ouvrir la vidéo
                        </a>
                      </div>
                    )}

                    {selected.typeConseil === "PDF" && selected.urlPdf && (
                      <div className="mc-modal-section">
                        <div className="mc-modal-section-title">
                          <i className="bi bi-file-earmark-pdf"></i> Document
                        </div>
                        <a href={selected.urlPdf} target="_blank" rel="noreferrer"
                          className="mc-modal-link" style={{ "--lc": tc.accent }}>
                          <i className="bi bi-download"></i>
                          {selected.nomFichierPdf || "Télécharger le PDF"}
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="mc-modal-footer">
                    <button className="mc-modal-btn-close" onClick={closeModal}>
                      <i className="bi bi-x-lg me-2"></i>Fermer
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}