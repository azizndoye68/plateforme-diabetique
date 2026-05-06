// src/pages/admin/AdminStatistiquesPage.jsx
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import SidebarAdmin from "../../components/SidebarAdmin";
import AideModal from "../../components/AideModal";
import "./AdminStatistiquesPage.css";

function AdminStatistiquesPage() {
  const [admin, setAdmin]       = useState(null);
  const [showAide, setShowAide] = useState(false);

  // Données brutes
  const [patients, setPatients]   = useState([]);
  const [medecins, setMedecins]   = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [attente, setAttente]     = useState([]);
  const [suivis, setSuivis]       = useState([]);
  const [donneesPhys, setDonneesPhys] = useState([]);
  const [journaux, setJournaux]   = useState([]);
  const [loading, setLoading]     = useState(true);

  // Export
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const profileRes = await api.get("/api/auth/profile");
        setAdmin(profileRes.data);

        const [pRes, mRes, aRes, sRes] = await Promise.all([
          api.get("/api/patients"),
          api.get("/api/medecins"),
          api.get("/api/auth/users/pending/all"),
          api.get("/api/suivis"),
        ]);

        const patientsData = pRes.data || [];
        const medecinsData = mRes.data || [];
        const attenteData  = aRes.data;
        const suivisData   = sRes.data || [];

        setPatients(patientsData);
        setMedecins(medecinsData);
        setAttente(Array.isArray(attenteData) ? attenteData : attenteData?.content || []);
        setSuivis(suivisData);

        // Données physiques — on agrège pour tous les patients
        let allPhys = [];
        let allJournaux = [];
        await Promise.all(
          patientsData.slice(0, 20).map(async (p) => {
            try {
              const phRes = await api.get(`/api/donnees-physiques/patient/${p.id}`);
              allPhys = allPhys.concat(phRes.data || []);
            } catch {}
            try {
              const jRes = await api.get(`/api/journal-bord/patient/${p.id}`);
              allJournaux = allJournaux.concat(jRes.data || []);
            } catch {}
          })
        );
        setDonneesPhys(allPhys);
        setJournaux(allJournaux);
      } catch (err) {
        console.error("Erreur chargement statistiques", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // ── Calculs statistiques ──
  const totalUtilisateurs   = patients.length + medecins.length;
  const patientsAvecMedecin = patients.filter(p => p.medecinId).length;
  const patientsSansMedecin = patients.length - patientsAvecMedecin;
  const tauxOccupation      = medecins.length > 0 ? (patients.length / medecins.length).toFixed(1) : 0;

  // Glycémie
  const glycemiesNormales  = suivis.filter(s => s.glycemie >= 0.7 && s.glycemie <= 1.2).length;
  const glycemiesElevees   = suivis.filter(s => s.glycemie > 1.2).length;
  const glycemiesFaibles   = suivis.filter(s => s.glycemie < 0.7).length;
  const glycemieMoyenne    = suivis.length > 0
    ? (suivis.reduce((acc, s) => acc + s.glycemie, 0) / suivis.length).toFixed(2)
    : "--";

  // Type de diabète
  const typesCount = patients.reduce((acc, p) => {
    const t = p.typeDiabete || "Inconnu";
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});

  // Répartition par sexe
  const sexeCount = patients.reduce((acc, p) => {
    const s = p.sexe || "Inconnu";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  // Spécialités médecins
  const specialitesCount = medecins.reduce((acc, m) => {
    const s = m.specialite || "Non renseignée";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  // Poids moyen
  const poidsValides = donneesPhys.filter(d => d.poids && d.poids > 0);
  const poidsMoyen   = poidsValides.length > 0
    ? (poidsValides.reduce((acc, d) => acc + d.poids, 0) / poidsValides.length).toFixed(1)
    : "--";

  // ── Export CSV générique ──
  const exportCSV = (filename, headers, rows) => {
    const lines = [headers.join(";"), ...rows.map(r => r.join(";"))];
    const blob  = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url   = URL.createObjectURL(blob);
    const a     = document.createElement("a");
    a.href      = url;
    a.download  = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPatients = () => {
    exportCSV(
      "patients.csv",
      ["ID", "Prénom", "Nom", "Sexe", "Type Diabète", "Ville", "Médecin Rattaché"],
      patients.map(p => [
        p.id, p.prenom, p.nom, p.sexe || "--",
        p.typeDiabete || "--", p.ville || "--",
        p.medecinId ? "Oui" : "Non"
      ])
    );
  };

  const exportMedecins = () => {
    exportCSV(
      "medecins.csv",
      ["ID", "Prénom", "Nom", "Spécialité", "Service", "Ville", "N° Professionnel"],
      medecins.map(m => [
        m.id, m.prenom, m.nom, m.specialite || "--",
        m.nomService || "--", m.ville || "--",
        m.numeroProfessionnel || "--"
      ])
    );
  };

  const exportGlycemies = () => {
    exportCSV(
      "glycemies.csv",
      ["ID", "Patient ID", "Glycémie (g/L)", "Moment", "Repas", "Date"],
      suivis.map(s => [
        s.id, s.patientId, s.glycemie,
        s.moment || "--", s.repas || "--",
        s.dateSuivi ? new Date(s.dateSuivi).toLocaleString("fr-FR") : "--"
      ])
    );
  };

  const exportDonneesPhysiques = () => {
    exportCSV(
      "donnees_physiques.csv",
      ["ID", "Patient ID", "Poids (kg)", "Tension", "Date"],
      donneesPhys.map(d => [
        d.id, d.patientId, d.poids || "--",
        d.tension || "--",
        d.dateSuivi ? new Date(d.dateSuivi).toLocaleString("fr-FR") : "--"
      ])
    );
  };

  const exportJournaux = () => {
    exportCSV(
      "journaux_bord.csv",
      ["ID", "Patient ID", "Repas", "Activité", "Symptômes", "Événements", "Date"],
      journaux.map(j => [
        j.id, j.patientId, j.repas || "--",
        j.activitePhysique || "--", j.symptomes || "--",
        j.evenements || "--",
        j.dateSuivi ? new Date(j.dateSuivi).toLocaleString("fr-FR") : "--"
      ])
    );
  };

  const exportTout = async () => {
    setExportLoading(true);
    await new Promise(r => setTimeout(r, 300));
    exportPatients();
    await new Promise(r => setTimeout(r, 200));
    exportMedecins();
    await new Promise(r => setTimeout(r, 200));
    exportGlycemies();
    await new Promise(r => setTimeout(r, 200));
    exportDonneesPhysiques();
    await new Promise(r => setTimeout(r, 200));
    exportJournaux();
    setExportLoading(false);
  };

  // ── Barre de progression ──
  const Bar = ({ value, max, color }) => {
    const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
    return (
      <div className="as-bar-track">
        <div className="as-bar-fill" style={{ width: `${pct}%`, background: color }}></div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="as-wrapper">
        <SidebarAdmin admin={admin} onShowAide={() => setShowAide(true)} />
        <div className="as-content">
          <div className="as-loading">
            <div className="as-spinner"></div>
            <p>Chargement des statistiques...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="as-wrapper">
      <SidebarAdmin admin={admin} onShowAide={() => setShowAide(true)} />

      <div className="as-content">
        <div className="as-container">

          {/* ── TOPBAR ── */}
          <div className="as-topbar">
            <div className="as-topbar-left">
              <p className="as-topbar-date">
                <i className="bi bi-bar-chart-line-fill me-2"></i>Gestion des données
              </p>
              <h1 className="as-topbar-title">Statistiques et Exportation</h1>
            </div>
            <button
              className="as-btn-export-all"
              onClick={exportTout}
              disabled={exportLoading}
            >
              {exportLoading
                ? <><span className="spinner-border spinner-border-sm me-2"></span>Export en cours...</>
                : <><i className="bi bi-download me-2"></i>Tout exporter (CSV)</>
              }
            </button>
          </div>

          {/* ── KPI GRID ── */}
          <div className="as-kpi-grid">
            {[
              { label: "Total patients",     value: patients.length,       icon: "bi-people-fill",       accent: "#10b981", bg: "#ecfdf5", desc: `${patientsAvecMedecin} rattachés` },
              { label: "Médecins actifs",    value: medecins.length,       icon: "bi-person-badge-fill", accent: "#6366f1", bg: "#eef2ff", desc: `${tauxOccupation} patients / médecin` },
              { label: "Mesures glycémie",   value: suivis.length,         icon: "bi-droplet-fill",      accent: "#0ea5e9", bg: "#f0f9ff", desc: `Moy. ${glycemieMoyenne} g/L` },
              { label: "Données physiques",  value: donneesPhys.length,    icon: "bi-heart-pulse-fill",  accent: "#f093fb", bg: "#fdf4ff", desc: `Poids moyen ${poidsMoyen} kg` },
              { label: "Entrées journal",    value: journaux.length,       icon: "bi-journal-text",      accent: "#f59e0b", bg: "#fffbeb", desc: "Notes patients" },
              { label: "Utilisateurs total", value: totalUtilisateurs,     icon: "bi-person-check-fill", accent: "#64748b", bg: "#f8fafc", desc: "Médecins + Patients" },
            ].map((kpi, i) => (
              <div
                key={i}
                className="as-kpi"
                style={{ "--accent": kpi.accent, "--bg": kpi.bg, animationDelay: `${i * 60}ms` }}
              >
                <div className="as-kpi-icon"><i className={`bi ${kpi.icon}`}></i></div>
                <div className="as-kpi-body">
                  <div className="as-kpi-val">{kpi.value}</div>
                  <div className="as-kpi-lbl">{kpi.label}</div>
                  <div className="as-kpi-desc">{kpi.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ── ROW 2 ── */}
          <div className="as-row2">

            {/* Glycémie */}
            <div className="as-panel">
              <div className="as-panel-head">
                <div className="as-panel-icon" style={{ background: "#f0f9ff", color: "#0ea5e9" }}>
                  <i className="bi bi-droplet-fill"></i>
                </div>
                <div>
                  <div className="as-panel-title">Analyse des glycémies</div>
                  <div className="as-panel-sub">{suivis.length} mesures enregistrées</div>
                </div>
                <button className="as-btn-export" onClick={exportGlycemies}>
                  <i className="bi bi-download me-1"></i>CSV
                </button>
              </div>
              <div className="as-panel-body">
                <div className="as-stat-big">
                  <span style={{ color: "#0ea5e9" }}>{glycemieMoyenne}</span>
                  <span className="as-stat-unit">g/L moyenne</span>
                </div>
                {[
                  { label: "Normales (0.7 – 1.2 g/L)", value: glycemiesNormales, color: "#10b981" },
                  { label: "Élevées (> 1.2 g/L)",      value: glycemiesElevees,  color: "#ef4444" },
                  { label: "Faibles (< 0.7 g/L)",      value: glycemiesFaibles,  color: "#f59e0b" },
                ].map((item, i) => (
                  <div className="as-stat-row" key={i}>
                    <div className="as-stat-row-head">
                      <span className="as-stat-lbl">{item.label}</span>
                      <span className="as-stat-val" style={{ color: item.color }}>{item.value}</span>
                    </div>
                    <Bar value={item.value} max={suivis.length} color={item.color} />
                  </div>
                ))}
              </div>
            </div>

            {/* Patients */}
            <div className="as-panel">
              <div className="as-panel-head">
                <div className="as-panel-icon" style={{ background: "#ecfdf5", color: "#10b981" }}>
                  <i className="bi bi-people-fill"></i>
                </div>
                <div>
                  <div className="as-panel-title">Analyse des patients</div>
                  <div className="as-panel-sub">{patients.length} patients enregistrés</div>
                </div>
                <button className="as-btn-export" onClick={exportPatients}>
                  <i className="bi bi-download me-1"></i>CSV
                </button>
              </div>
              <div className="as-panel-body">
                {/* Rattachement */}
                <div className="as-section-title">Rattachement médecin</div>
                {[
                  { label: "Rattachés",     value: patientsAvecMedecin, color: "#10b981" },
                  { label: "Sans médecin",  value: patientsSansMedecin, color: "#f59e0b" },
                ].map((item, i) => (
                  <div className="as-stat-row" key={i}>
                    <div className="as-stat-row-head">
                      <span className="as-stat-lbl">{item.label}</span>
                      <span className="as-stat-val" style={{ color: item.color }}>
                        {item.value} <span className="as-pct">({patients.length > 0 ? Math.round((item.value/patients.length)*100) : 0}%)</span>
                      </span>
                    </div>
                    <Bar value={item.value} max={patients.length} color={item.color} />
                  </div>
                ))}

                {/* Sexe */}
                <div className="as-section-title" style={{ marginTop: "1rem" }}>Répartition par sexe</div>
                {Object.entries(sexeCount).map(([sexe, count], i) => (
                  <div className="as-stat-row" key={i}>
                    <div className="as-stat-row-head">
                      <span className="as-stat-lbl">{sexe}</span>
                      <span className="as-stat-val" style={{ color: "#6366f1" }}>{count}</span>
                    </div>
                    <Bar value={count} max={patients.length} color="#6366f1" />
                  </div>
                ))}
              </div>
            </div>

            {/* Types de diabète */}
            <div className="as-panel">
              <div className="as-panel-head">
                <div className="as-panel-icon" style={{ background: "#eef2ff", color: "#6366f1" }}>
                  <i className="bi bi-clipboard2-pulse-fill"></i>
                </div>
                <div>
                  <div className="as-panel-title">Types de diabète</div>
                  <div className="as-panel-sub">Répartition des diagnostics</div>
                </div>
              </div>
              <div className="as-panel-body">
                {Object.entries(typesCount).length === 0 ? (
                  <div className="as-empty">Aucune donnée</div>
                ) : (
                  Object.entries(typesCount)
                    .sort((a, b) => b[1] - a[1])
                    .map(([type, count], i) => {
                      const colors = ["#6366f1", "#10b981", "#f59e0b", "#0ea5e9", "#a855f7"];
                      const color = colors[i % colors.length];
                      return (
                        <div className="as-stat-row" key={i}>
                          <div className="as-stat-row-head">
                            <div className="as-type-label">
                              <span className="as-type-dot" style={{ background: color }}></span>
                              <span className="as-stat-lbl">{type}</span>
                            </div>
                            <span className="as-stat-val" style={{ color }}>
                              {count} <span className="as-pct">({patients.length > 0 ? Math.round((count/patients.length)*100) : 0}%)</span>
                            </span>
                          </div>
                          <Bar value={count} max={patients.length} color={color} />
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          </div>

          {/* ── ROW 3 ── */}
          <div className="as-row3">

            {/* Spécialités médecins */}
            <div className="as-panel">
              <div className="as-panel-head">
                <div className="as-panel-icon" style={{ background: "#eef2ff", color: "#6366f1" }}>
                  <i className="bi bi-person-badge-fill"></i>
                </div>
                <div>
                  <div className="as-panel-title">Spécialités médicales</div>
                  <div className="as-panel-sub">{medecins.length} médecins actifs</div>
                </div>
                <button className="as-btn-export" onClick={exportMedecins}>
                  <i className="bi bi-download me-1"></i>CSV
                </button>
              </div>
              <div className="as-panel-body">
                {Object.entries(specialitesCount).length === 0 ? (
                  <div className="as-empty">Aucune donnée</div>
                ) : (
                  Object.entries(specialitesCount)
                    .sort((a, b) => b[1] - a[1])
                    .map(([spe, count], i) => {
                      const colors = ["#6366f1", "#10b981", "#f59e0b", "#0ea5e9", "#a855f7", "#f093fb"];
                      const color = colors[i % colors.length];
                      return (
                        <div className="as-stat-row" key={i}>
                          <div className="as-stat-row-head">
                            <div className="as-type-label">
                              <span className="as-type-dot" style={{ background: color }}></span>
                              <span className="as-stat-lbl">{spe}</span>
                            </div>
                            <span className="as-stat-val" style={{ color }}>{count}</span>
                          </div>
                          <Bar value={count} max={medecins.length} color={color} />
                        </div>
                      );
                    })
                )}
              </div>
            </div>

            {/* Données physiques */}
            <div className="as-panel">
              <div className="as-panel-head">
                <div className="as-panel-icon" style={{ background: "#fdf4ff", color: "#a855f7" }}>
                  <i className="bi bi-heart-pulse-fill"></i>
                </div>
                <div>
                  <div className="as-panel-title">Données physiques</div>
                  <div className="as-panel-sub">{donneesPhys.length} entrées enregistrées</div>
                </div>
                <button className="as-btn-export" onClick={exportDonneesPhysiques}>
                  <i className="bi bi-download me-1"></i>CSV
                </button>
              </div>
              <div className="as-panel-body">
                <div className="as-phys-grid">
                  <div className="as-phys-card">
                    <div className="as-phys-icon" style={{ background: "#fdf4ff", color: "#a855f7" }}>
                      <i className="bi bi-speedometer2"></i>
                    </div>
                    <div className="as-phys-val">{poidsMoyen} <span>kg</span></div>
                    <div className="as-phys-lbl">Poids moyen</div>
                    <div className="as-phys-note">{poidsValides.length} mesures</div>
                  </div>
                  <div className="as-phys-card">
                    <div className="as-phys-icon" style={{ background: "#fdf4ff", color: "#f093fb" }}>
                      <i className="bi bi-activity"></i>
                    </div>
                    <div className="as-phys-val">{donneesPhys.filter(d => d.tension).length} <span>entrées</span></div>
                    <div className="as-phys-lbl">Tensions enregistrées</div>
                    <div className="as-phys-note">sur {donneesPhys.length} total</div>
                  </div>
                  <div className="as-phys-card">
                    <div className="as-phys-icon" style={{ background: "#ecfdf5", color: "#10b981" }}>
                      <i className="bi bi-journal-text"></i>
                    </div>
                    <div className="as-phys-val">{journaux.length} <span>entrées</span></div>
                    <div className="as-phys-lbl">Journal de bord</div>
                    <div className="as-phys-note">
                      <button className="as-link" onClick={exportJournaux}>
                        <i className="bi bi-download me-1"></i>Exporter
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Résumé global exportation */}
            <div className="as-panel">
              <div className="as-panel-head">
                <div className="as-panel-icon" style={{ background: "#f0f9ff", color: "#0ea5e9" }}>
                  <i className="bi bi-cloud-download-fill"></i>
                </div>
                <div>
                  <div className="as-panel-title">Exportation des données</div>
                  <div className="as-panel-sub">Sauvegarde en format CSV</div>
                </div>
              </div>
              <div className="as-panel-body">
                <div className="as-export-list">
                  {[
                    { label: "Patients",          count: patients.length,    icon: "bi-people-fill",       color: "#10b981", fn: exportPatients },
                    { label: "Médecins",           count: medecins.length,    icon: "bi-person-badge-fill", color: "#6366f1", fn: exportMedecins },
                    { label: "Mesures glycémie",   count: suivis.length,      icon: "bi-droplet-fill",      color: "#0ea5e9", fn: exportGlycemies },
                    { label: "Données physiques",  count: donneesPhys.length, icon: "bi-heart-pulse-fill",  color: "#a855f7", fn: exportDonneesPhysiques },
                    { label: "Journal de bord",    count: journaux.length,    icon: "bi-journal-text",      color: "#f59e0b", fn: exportJournaux },
                  ].map((item, i) => (
                    <div className="as-export-item" key={i}>
                      <div className="as-export-ico" style={{ background: item.color + "18", color: item.color }}>
                        <i className={`bi ${item.icon}`}></i>
                      </div>
                      <div className="as-export-info">
                        <div className="as-export-lbl">{item.label}</div>
                        <div className="as-export-count">{item.count} enregistrement{item.count > 1 ? "s" : ""}</div>
                      </div>
                      <button className="as-btn-dl" onClick={item.fn} style={{ "--ec": item.color }}>
                        <i className="bi bi-download"></i>
                      </button>
                    </div>
                  ))}
                </div>

                <button className="as-btn-export-all-full" onClick={exportTout} disabled={exportLoading}>
                  {exportLoading
                    ? <><span className="spinner-border spinner-border-sm me-2"></span>Export...</>
                    : <><i className="bi bi-cloud-download-fill me-2"></i>Tout exporter</>
                  }
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      <AideModal show={showAide} onHide={() => setShowAide(false)} />
    </div>
  );
}

export default AdminStatistiquesPage;