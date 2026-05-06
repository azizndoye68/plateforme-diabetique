// src/pages/medecin/EducationMedecin.jsx
import React, { useEffect, useState } from "react";
import {
  getContenus,
  createContenu,
  deleteContenu,
} from "../../services/patientService";
import SidebarAdmin from "../../components/SidebarAdmin";
import AideModal from "../../components/AideModal";
import api from "../../services/api";
import "./Education.css";

const TYPE_CONFIG = {
  PDF:     { icon: "bi-file-earmark-pdf-fill",  color: "#ef4444", bg: "rgba(239,68,68,.1)",   label: "PDF"     },
  VIDEO:   { icon: "bi-play-circle-fill",        color: "#0ea5e9", bg: "rgba(14,165,233,.1)",  label: "Vidéo"   },
  ARTICLE: { icon: "bi-newspaper",               color: "#11998e", bg: "rgba(17,153,142,.1)",  label: "Article" },
};

function TypeBadge({ type }) {
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.ARTICLE;
  return (
    <span className="em-badge" style={{ color: cfg.color, background: cfg.bg }}>
      <i className={`bi ${cfg.icon}`}></i> {cfg.label}
    </span>
  );
}

function ContenuCard({ contenu, onDelete, index }) {
  const cfg = TYPE_CONFIG[contenu.type] || TYPE_CONFIG.ARTICLE;
  return (
    <div className="em-contenu-card em-fade-in" style={{ animationDelay: `${index * 60}ms` }}>
      <div className="em-contenu-card__icon" style={{ background: cfg.bg, color: cfg.color }}>
        <i className={`bi ${cfg.icon}`}></i>
      </div>
      <div className="em-contenu-card__body">
        <div className="em-contenu-card__title">{contenu.titre}</div>
        <div className="em-contenu-card__meta">
          <TypeBadge type={contenu.type} />
          {contenu.datePublication && (
            <span className="em-contenu-card__date">
              <i className="bi bi-calendar3"></i>
              {contenu.datePublication}
            </span>
          )}
        </div>
      </div>
      <div className="em-contenu-card__actions">
        <a href={contenu.url} target="_blank" rel="noreferrer"
          className="em-btn em-btn--outline" title="Ouvrir">
          <i className="bi bi-box-arrow-up-right"></i> Ouvrir
        </a>
        <button className="em-btn em-btn--danger" onClick={() => onDelete(contenu.id)} title="Supprimer">
          <i className="bi bi-trash3"></i>
        </button>
      </div>
    </div>
  );
}

export default function EducationMedecin() {
  const [admin, setAdmin]           = useState(null);
  const [showAide, setShowAide]     = useState(false);
  const [contenus, setContenus]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch]         = useState("");
  const [filterType, setFilterType] = useState("TOUS");
  const [form, setForm]             = useState({ titre: "", type: "PDF", url: "" });
  const [formError, setFormError]   = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const loadContenus = async () => {
    try {
      setLoading(true);
      const data = await getContenus();
      setContenus(data);
    } catch (err) {
      console.error("Erreur chargement contenus", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const res = await api.get("/api/auth/profile");
        setAdmin(res.data);
      } catch {}
      loadContenus();
    };
    init();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.titre.trim() || !form.url.trim()) {
      setFormError("Le titre et le lien sont obligatoires.");
      return;
    }
    try {
      setSubmitting(true);
      await createContenu(form);
      setForm({ titre: "", type: "PDF", url: "" });
      setSuccessMsg("Contenu ajouté avec succès !");
      setTimeout(() => setSuccessMsg(""), 3000);
      loadContenus();
    } catch (err) {
      setFormError("Erreur lors de la création. Vérifiez les données.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce contenu ?")) return;
    try {
      await deleteContenu(id);
      loadContenus();
    } catch {}
  };

  const filtered = contenus.filter((c) => {
    const matchType   = filterType === "TOUS" || c.type === filterType;
    const matchSearch = c.titre.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const nbPDF     = contenus.filter(c => c.type === "PDF").length;
  const nbVideo   = contenus.filter(c => c.type === "VIDEO").length;
  const nbArticle = contenus.filter(c => c.type === "ARTICLE").length;

  return (
    <div className="em-wrapper">
      <SidebarAdmin admin={admin} onShowAide={() => setShowAide(true)} />

      <div className="em-content">
        <div className="em-page">

          {/* ── TOPBAR ── */}
          <div className="em-topbar em-fade-in">
            <div>
              <p className="em-topbar-date">
                <i className="bi bi-mortarboard-fill me-2"></i>Gestion des ressources
              </p>
              <h1 className="em-topbar-title">Contenus éducatifs</h1>
            </div>
            <div className="em-hero-stats">
              {[
                { val: contenus.length, lbl: "Total",    color: "#0f172a" },
                { val: nbPDF,           lbl: "PDFs",     color: "#ef4444" },
                { val: nbVideo,         lbl: "Vidéos",   color: "#0ea5e9" },
                { val: nbArticle,       lbl: "Articles", color: "#11998e" },
              ].map((s, i) => (
                <div key={i} className="em-hero-stat">
                  <span className="em-hero-stat-val" style={{ color: s.color }}>{s.val}</span>
                  <span className="em-hero-stat-lbl">{s.lbl}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── LAYOUT 2 COLONNES ── */}
          <div className="em-layout">

            {/* ── FORMULAIRE ── */}
            <div className="em-card em-fade-in" style={{ animationDelay: "80ms" }}>
              <div className="em-card__head">
                <div className="em-card__title-row">
                  <div className="em-card__icon-sm" style={{ background: "linear-gradient(135deg,#11998e,#38ef7d)" }}>
                    <i className="bi bi-plus-lg"></i>
                  </div>
                  <h6 className="em-card__title">Ajouter un contenu</h6>
                </div>
              </div>
              <div className="em-card__body">
                <form onSubmit={handleSubmit} className="em-form">

                  <div className="em-form__field">
                    <label className="em-form__label">
                      <i className="bi bi-fonts me-1"></i>Titre
                    </label>
                    <input className="em-form__input" type="text" name="titre"
                      placeholder="Ex : Guide alimentation diabétique"
                      value={form.titre} onChange={handleChange} required />
                  </div>

                  <div className="em-form__row">
                    <div className="em-form__field">
                      <label className="em-form__label">
                        <i className="bi bi-tag me-1"></i>Type
                      </label>
                      <select className="em-form__select" name="type"
                        value={form.type} onChange={handleChange}>
                        <option value="PDF">📄 PDF</option>
                        <option value="VIDEO">🎬 Vidéo</option>
                        <option value="ARTICLE">📰 Article</option>
                      </select>
                    </div>

                    <div className="em-form__field" style={{ flex: 2 }}>
                      <label className="em-form__label">
                        <i className="bi bi-link-45deg me-1"></i>URL du contenu
                      </label>
                      <input className="em-form__input" type="url" name="url"
                        placeholder="https://..." value={form.url}
                        onChange={handleChange} required />
                    </div>
                  </div>

                  {formError && (
                    <div className="em-form__error">
                      <i className="bi bi-exclamation-circle me-1"></i>{formError}
                    </div>
                  )}

                  {successMsg && (
                    <div className="em-form__success">
                      <i className="bi bi-check-circle me-1"></i>{successMsg}
                    </div>
                  )}

                  <button type="submit" className="em-btn em-btn--primary" disabled={submitting}>
                    {submitting
                      ? <><i className="bi bi-hourglass-split me-2"></i>Enregistrement…</>
                      : <><i className="bi bi-cloud-upload me-2"></i>Enregistrer le contenu</>
                    }
                  </button>
                </form>
              </div>
            </div>

            {/* ── LISTE ── */}
            <div className="em-card em-fade-in" style={{ animationDelay: "160ms" }}>
              <div className="em-card__head">
                <div className="em-card__title-row">
                  <div className="em-card__icon-sm" style={{ background: "linear-gradient(135deg,#667eea,#764ba2)" }}>
                    <i className="bi bi-collection-fill"></i>
                  </div>
                  <h6 className="em-card__title">
                    Bibliothèque
                    <span className="em-count-badge">{contenus.length}</span>
                  </h6>
                </div>
              </div>

              <div className="em-toolbar">
                <div className="em-search">
                  <i className="bi bi-search em-search__icon"></i>
                  <input className="em-search__input" type="text"
                    placeholder="Rechercher un contenu…"
                    value={search} onChange={e => setSearch(e.target.value)} />
                  {search && (
                    <button className="em-search__clear" onClick={() => setSearch("")}>
                      <i className="bi bi-x"></i>
                    </button>
                  )}
                </div>
                <div className="em-filters">
                  {["TOUS", "PDF", "VIDEO", "ARTICLE"].map(t => (
                    <button key={t}
                      className={`em-filter-btn${filterType === t ? " em-filter-btn--active" : ""}`}
                      onClick={() => setFilterType(t)}>
                      {t === "TOUS" ? "Tous" : t === "VIDEO" ? "Vidéo" : t.charAt(0) + t.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="em-card__body em-card__body--list">
                {loading ? (
                  <div className="em-state em-state--loading">
                    <div className="em-spinner"></div>
                    <p>Chargement des contenus…</p>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="em-state em-state--empty">
                    <i className="bi bi-inbox em-state__icon"></i>
                    <p>
                      {search || filterType !== "TOUS"
                        ? "Aucun contenu ne correspond à votre recherche."
                        : "Aucun contenu éducatif disponible pour l'instant."}
                    </p>
                    {(search || filterType !== "TOUS") && (
                      <button className="em-btn em-btn--outline-sm"
                        onClick={() => { setSearch(""); setFilterType("TOUS"); }}>
                        Réinitialiser les filtres
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="em-list">
                    {filtered.map((c, i) => (
                      <ContenuCard key={c.id} contenu={c} onDelete={handleDelete} index={i} />
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      <AideModal show={showAide} onHide={() => setShowAide(false)} />
    </div>
  );
}