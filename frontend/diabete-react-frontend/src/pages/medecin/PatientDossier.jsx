// src/pages/PatientDossier.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import "./PatientDossier.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function PatientDossier() {
  const { id, patientId } = useParams();
  const realPatientId = patientId || id;
  const dossierRef = useRef(null);

  const [patient, setPatient] = useState(null);
  const [suivis, setSuivis] = useState([]);
  const [dossier, setDossier] = useState(null);
  const [exporting, setExporting] = useState(false);

  const exportPDF = async () => {
    setExporting(true);
    const element = dossierRef.current;
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save(`Dossier_${patient.prenom}_${patient.nom}.pdf`);
    setExporting(false);
  };

  useEffect(() => {
    if (!realPatientId) return;
    const fetchPatient = async () => {
      try {
        const res = await api.get(`/api/patients/${realPatientId}`);
        const patientData = res.data;
        let medecinPrenom = null;
        let medecinNom = null;
        if (patientData.medecinId) {
          try {
            const med = await api.get(`/api/medecins/${patientData.medecinId}`);
            medecinPrenom = med.data?.prenom ?? null;
            medecinNom = med.data?.nom ?? null;
          } catch (e) {}
        }
        setPatient({ ...patientData, medecinPrenom, medecinNom });
        const suivisRes = await api.get(`/api/suivis/recentes?patientId=${realPatientId}`);
        setSuivis(suivisRes.data);
        try {
          const dossierRes = await api.get(`/api/dossiers/patient/${realPatientId}`);
          setDossier(dossierRes.data);
        } catch (e) {
          setDossier(null);
        }
      } catch (err) {
        console.error("Erreur chargement dossier patient :", err);
      }
    };
    fetchPatient();
  }, [realPatientId]);

  if (!patient) return (
    <div className="pd-loading">
      <div className="pd-loading-spinner"></div>
      <p>Chargement du dossier médical...</p>
    </div>
  );

  const formatMoment = (moment) => {
    if (!moment) return "—";
    return moment.replace("_", " ").replace("avant", "Avant").replace("apres", "Après").replace("repas", " repas");
  };

  const formatRepas = (repas) => {
    if (!repas) return "—";
    return repas.charAt(0).toUpperCase() + repas.slice(1);
  };

  const getGlycemieStatus = (value) => {
    if (value < 0.7) return { label: "Hypoglycémie", color: "#ef4444", bg: "#fef2f2" };
    if (value <= 1.8) return { label: "Normal", color: "#10b981", bg: "#f0fdf4" };
    if (value <= 2.5) return { label: "Élevé", color: "#f59e0b", bg: "#fffbeb" };
    return { label: "Hyperglycémie", color: "#ef4444", bg: "#fef2f2" };
  };

  const chartData = suivis.map((s) => ({
    date: s.dateSuivi.split("T")[0],
    glycemie: s.glycemie,
  }));

  const avgGlycemie = suivis.length
    ? (suivis.reduce((a, b) => a + b.glycemie, 0) / suivis.length).toFixed(2)
    : null;

  const minGlycemie = suivis.length ? Math.min(...suivis.map(s => s.glycemie)).toFixed(2) : null;
  const maxGlycemie = suivis.length ? Math.max(...suivis.map(s => s.glycemie)).toFixed(2) : null;
  const inRange = suivis.length
    ? Math.round((suivis.filter(s => s.glycemie >= 0.7 && s.glycemie <= 1.8).length / suivis.length) * 100)
    : null;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const val = payload[0].value;
      const status = getGlycemieStatus(val);
      return (
        <div style={{ background: "white", border: `2px solid ${status.color}`, borderRadius: "10px", padding: "10px 14px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
          <p style={{ margin: 0, fontWeight: 700, color: "#1e293b" }}>{label}</p>
          <p style={{ margin: "4px 0 0", color: status.color, fontWeight: 600 }}>{val} g/L — {status.label}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="pd-wrapper">
      {/* Header */}
      <div className="pd-header">
        <div className="pd-header-left">
          <div className="pd-header-icon">
            <i className="bi bi-file-medical-fill"></i>
          </div>
          <div>
            <div className="pd-header-tag">DOSSIER MÉDICAL</div>
            <h1 className="pd-header-title">
              {patient.prenom} {patient.nom}
            </h1>
            <div className="pd-header-meta">
              <span><i className="bi bi-card-text me-1"></i>N° {patient.numeroDossier || "—"}</span>
              <span className="pd-dot">•</span>
              <span><i className="bi bi-droplet-fill me-1" style={{color: "#10b981"}}></i>{patient.typeDiabete || "—"}</span>
              <span className="pd-dot">•</span>
              <span><i className="bi bi-person-check me-1"></i>
                {patient.medecinPrenom ? `Dr ${patient.medecinPrenom} ${patient.medecinNom}` : "Médecin non assigné"}
              </span>
            </div>
          </div>
        </div>
        <button className={`pd-export-btn ${exporting ? "loading" : ""}`} onClick={exportPDF} disabled={exporting}>
          {exporting ? (
            <><span className="pd-btn-spinner"></span>Exportation...</>
          ) : (
            <><i className="bi bi-file-earmark-pdf-fill me-2"></i>Télécharger PDF</>
          )}
        </button>
      </div>

      <div ref={dossierRef} className="pd-content">

        {/* Stats glycémiques rapides */}
        {suivis.length > 0 && (
          <div className="pd-stats-grid">
            <div className="pd-stat-card">
              <div className="pd-stat-icon" style={{ background: "linear-gradient(135deg, #38ef7d, #11998e)" }}>
                <i className="bi bi-activity"></i>
              </div>
              <div className="pd-stat-body">
                <span className="pd-stat-label">Glycémie moyenne</span>
                <span className="pd-stat-value">{avgGlycemie} <small>g/L</small></span>
              </div>
            </div>
            <div className="pd-stat-card">
              <div className="pd-stat-icon" style={{ background: "linear-gradient(135deg, #4facfe, #00f2fe)" }}>
                <i className="bi bi-arrow-down-circle-fill"></i>
              </div>
              <div className="pd-stat-body">
                <span className="pd-stat-label">Valeur minimale</span>
                <span className="pd-stat-value">{minGlycemie} <small>g/L</small></span>
              </div>
            </div>
            <div className="pd-stat-card">
              <div className="pd-stat-icon" style={{ background: "linear-gradient(135deg, #fa709a, #fee140)" }}>
                <i className="bi bi-arrow-up-circle-fill"></i>
              </div>
              <div className="pd-stat-body">
                <span className="pd-stat-label">Valeur maximale</span>
                <span className="pd-stat-value">{maxGlycemie} <small>g/L</small></span>
              </div>
            </div>
            <div className="pd-stat-card">
              <div className="pd-stat-icon" style={{ background: "linear-gradient(135deg, #a18cd1, #fbc2eb)" }}>
                <i className="bi bi-bullseye"></i>
              </div>
              <div className="pd-stat-body">
                <span className="pd-stat-label">Dans la cible</span>
                <span className="pd-stat-value">{inRange} <small>%</small></span>
              </div>
            </div>
          </div>
        )}

        <div className="pd-grid">
          {/* Colonne gauche */}
          <div className="pd-col-left">

            {/* Informations personnelles */}
            <div className="pd-card">
              <div className="pd-card-header">
                <div className="pd-card-header-icon" style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}>
                  <i className="bi bi-person-fill"></i>
                </div>
                <h3 className="pd-card-title">Informations personnelles</h3>
              </div>
              <div className="pd-info-grid">
                <div className="pd-info-item">
                  <span className="pd-info-label">Nom complet</span>
                  <span className="pd-info-value">{patient.prenom} {patient.nom}</span>
                </div>
                <div className="pd-info-item">
                  <span className="pd-info-label">Date de naissance</span>
                  <span className="pd-info-value">{patient.dateNaissance || "—"}</span>
                </div>
                <div className="pd-info-item">
                  <span className="pd-info-label">Sexe</span>
                  <span className="pd-info-value">{patient.sexe || "—"}</span>
                </div>
                <div className="pd-info-item">
                  <span className="pd-info-label">Téléphone</span>
                  <span className="pd-info-value">{patient.telephone || "—"}</span>
                </div>
                <div className="pd-info-item">
                  <span className="pd-info-label">Adresse</span>
                  <span className="pd-info-value">{patient.adresse || "—"}</span>
                </div>
                <div className="pd-info-item">
                  <span className="pd-info-label">Ville / Région</span>
                  <span className="pd-info-value">{patient.ville || "—"} / {patient.region || "—"}</span>
                </div>
                <div className="pd-info-item">
                  <span className="pd-info-label">N° de dossier</span>
                  <span className="pd-info-value pd-dossier-num">{patient.numeroDossier || "—"}</span>
                </div>
                <div className="pd-info-item">
                  <span className="pd-info-label">Date d'inscription</span>
                  <span className="pd-info-value">{patient.dateEnregistrement || "—"}</span>
                </div>
              </div>
            </div>

            {/* Informations médicales */}
            <div className="pd-card">
              <div className="pd-card-header">
                <div className="pd-card-header-icon" style={{ background: "linear-gradient(135deg, #11998e, #38ef7d)" }}>
                  <i className="bi bi-heart-pulse-fill"></i>
                </div>
                <h3 className="pd-card-title">Informations médicales</h3>
              </div>
              <div className="pd-info-grid">
                <div className="pd-info-item">
                  <span className="pd-info-label">Type de diabète</span>
                  <span className="pd-info-value">
                    <span className="pd-badge-type">{patient.typeDiabete || "—"}</span>
                  </span>
                </div>
                <div className="pd-info-item">
                  <span className="pd-info-label">Médecin référent</span>
                  <span className="pd-info-value">
                    {patient.medecinPrenom
                      ? <span className="pd-medecin-tag"><i className="bi bi-person-badge-fill me-1"></i>Dr {patient.medecinPrenom} {patient.medecinNom}</span>
                      : "—"}
                  </span>
                </div>
                <div className="pd-info-item pd-info-full">
                  <span className="pd-info-label">Traitement par insuline</span>
                  <span className="pd-info-value">
                    {dossier?.traitement === "OUI"
                      ? <span className="pd-badge-oui"><i className="bi bi-check-circle-fill me-1"></i>Sous insuline</span>
                      : <span className="pd-badge-non"><i className="bi bi-x-circle-fill me-1"></i>Pas d'insuline</span>
                    }
                  </span>
                </div>
                <div className="pd-info-item pd-info-full">
                  <span className="pd-info-label">Antécédents médicaux</span>
                  <span className="pd-info-value pd-info-text">
                    {dossier?.antecedents || <span className="pd-empty-inline">Aucun antécédent renseigné</span>}
                  </span>
                </div>
                <div className="pd-info-item pd-info-full">
                  <span className="pd-info-label">Allergies connues</span>
                  <span className="pd-info-value pd-info-text">
                    {dossier?.allergies || <span className="pd-empty-inline">Aucune allergie renseignée</span>}
                  </span>
                </div>
                <div className="pd-info-item pd-info-full">
                  <span className="pd-info-label">Notes médicales complémentaires</span>
                  <span className="pd-info-value pd-info-text">
                    {dossier?.notesMedicales || <span className="pd-empty-inline">Aucune note médicale renseignée</span>}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne droite */}
          <div className="pd-col-right">

            {/* Graphique */}
            <div className="pd-card">
              <div className="pd-card-header">
                <div className="pd-card-header-icon" style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
                  <i className="bi bi-graph-up-arrow"></i>
                </div>
                <h3 className="pd-card-title">Courbe glycémique</h3>
              </div>

              {/* Légende couleurs */}
              <div className="pd-legend">
                <div className="pd-legend-item"><span style={{ background: "#ef4444" }}></span>Hypoglycémie ≤0,69</div>
                <div className="pd-legend-item"><span style={{ background: "#10b981" }}></span>Normal 0,70–1,80</div>
                <div className="pd-legend-item"><span style={{ background: "#f59e0b" }}></span>Élevé 1,81–2,50</div>
                <div className="pd-legend-item"><span style={{ background: "#ef4444" }}></span>Hyper &gt;2,50</div>
              </div>

              {suivis.length === 0 ? (
                <div className="pd-empty">
                  <i className="bi bi-graph-up"></i>
                  <p>Aucune mesure enregistrée</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#64748b" }} domain={[0, 3.5]} />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={0.7} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1.5} />
                    <ReferenceLine y={1.8} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={1.5} />
                    <ReferenceLine y={2.5} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1.5} />
                    <Line
                      type="monotone"
                      dataKey="glycemie"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={{ fill: "#10b981", r: 4, strokeWidth: 2, stroke: "white" }}
                      activeDot={{ r: 6, fill: "#10b981", stroke: "white", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Tableau suivi */}
            <div className="pd-card">
              <div className="pd-card-header">
                <div className="pd-card-header-icon" style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)" }}>
                  <i className="bi bi-table"></i>
                </div>
                <h3 className="pd-card-title">Historique des mesures</h3>
              </div>

              {suivis.length === 0 ? (
                <div className="pd-empty">
                  <i className="bi bi-clipboard-x"></i>
                  <p>Aucune mesure enregistrée</p>
                </div>
              ) : (
                <div className="pd-table-wrapper">
                  <table className="pd-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Moment</th>
                        <th>Repas</th>
                        <th>Glycémie</th>
                        <th>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {suivis.map((s) => {
                        const status = getGlycemieStatus(s.glycemie);
                        return (
                          <tr key={s.id}>
                            <td>{s.dateSuivi.split("T")[0]}</td>
                            <td>{formatMoment(s.moment)}</td>
                            <td>{formatRepas(s.repas)}</td>
                            <td>
                              <span className="pd-glycemie-val" style={{ color: status.color }}>
                                {s.glycemie} g/L
                              </span>
                            </td>
                            <td>
                              <span className="pd-status-badge" style={{ color: status.color, background: status.bg }}>
                                {status.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}