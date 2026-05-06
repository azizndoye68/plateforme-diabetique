// src/pages/admin/DashboardAdmin.jsx
import React, { useEffect, useState } from "react";
import AideModal from "../../components/AideModal";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import "./DashboardAdmin.css";
import SidebarAdmin from "../../components/SidebarAdmin";

function DashboardAdmin() {
  const [admin, setAdmin]     = useState(null);
  const [patients, setPatients] = useState([]);
  const [medecins, setMedecins] = useState([]);
  const [attente, setAttente]   = useState([]);
  const [suivis, setSuivis]     = useState([]);
  const [showAide, setShowAide] = useState(false);
  const [time, setTime]         = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await api.get("/api/auth/profile");
        setAdmin(profileRes.data);
        const [pRes, mRes, aRes, sRes] = await Promise.all([
          api.get("/api/patients"),
          api.get("/api/medecins"),
          api.get("/api/auth/users/pending/all"),
          api.get("/api/suivis"),
        ]);
        setPatients(pRes.data || []);
        setMedecins(mRes.data || []);
        const ad = aRes.data;
        setAttente(Array.isArray(ad) ? ad : ad?.content || []);
        setSuivis(sRes.data || []);
      } catch (err) {
        console.error("Erreur dashboard", err);
      }
    };
    fetchData();
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // ── Calculs ──
  const total             = patients.length + medecins.length;
  const avecMedecin       = patients.filter(p => p.medecinId).length;
  const sansMedecin       = patients.length - avecMedecin;
  const tauxRattach       = patients.length > 0 ? Math.round((avecMedecin / patients.length) * 100) : 0;
  const tauxOccup         = medecins.length > 0 ? (patients.length / medecins.length).toFixed(1) : 0;
  const glycNormales      = suivis.filter(s => s.glycemie >= 0.7 && s.glycemie <= 1.2).length;
  const glycElevees       = suivis.filter(s => s.glycemie > 1.2).length;
  const glycFaibles       = suivis.filter(s => s.glycemie < 0.7).length;
  const glycMoy           = suivis.length > 0
    ? (suivis.reduce((a, s) => a + s.glycemie, 0) / suivis.length).toFixed(2) : "--";

  const formatTime = (d) => d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const formatDate = (d) => d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  // ── Donut SVG helper ──
  const Donut = ({ segments, size = 120, stroke = 18, children }) => {
    const r   = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const cx  = size / 2;
    const cy  = size / 2;
    let offset = circ * 0.25;
    const totalVal = segments.reduce((a, s) => a + s.value, 0);
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
        {totalVal > 0 && segments.map((seg, i) => {
          const pct  = seg.value / totalVal;
          const dash = pct * circ;
          const el = (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={seg.color} strokeWidth={stroke}
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          );
          offset -= dash;
          return el;
        })}
      </svg>
    );
  };

  // ── Barre horizontale ──
  const Bar = ({ value, max, color, height = 6 }) => {
    const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
    return (
      <div style={{ height, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 99, transition: "width 1.2s ease" }}></div>
      </div>
    );
  };

  return (
    <div className="da-wrapper">
      <SidebarAdmin admin={admin} onShowAide={() => setShowAide(true)} />

      <div className="da-content">
        <div className="da-container">

          {/* ── TOPBAR ── */}
          <div className="da-topbar">
            <div>
              <p className="da-topbar-date"><i className="bi bi-calendar3 me-2"></i>{formatDate(time)}</p>
              <h1 className="da-topbar-title">
                Bonjour, <span className="da-topbar-name">{admin?.username || "Admin"}</span>
              </h1>
            </div>
            <div className="da-topbar-right">
              <div className="da-clock-box">
                <i className="bi bi-clock me-2" style={{ color: "#94a3b8" }}></i>
                <span className="da-clock-time">{formatTime(time)}</span>
              </div>
              {attente.length > 0 && (
                <button className="da-alert-pill" onClick={() => navigate("/admin/attente")}>
                  <span className="da-alert-dot"></span>
                  {attente.length} en attente
                  <i className="bi bi-arrow-right ms-2"></i>
                </button>
              )}
            </div>
          </div>

          {/* ── KPI CARDS ── */}
          <div className="da-kpi-grid">
            {[
              { label: "Patients",       value: patients.length, icon: "bi-people-fill",       accent: "#10b981", bg: "#ecfdf5", desc: `${avecMedecin} rattachés`,          path: "/admin/patients" },
              { label: "Médecins",       value: medecins.length, icon: "bi-person-badge-fill", accent: "#6366f1", bg: "#eef2ff", desc: `${tauxOccup} patients / médecin`,   path: "/admin/medecins" },
              { label: "En attente",     value: attente.length,  icon: "bi-hourglass-split",   accent: attente.length > 0 ? "#f59e0b" : "#10b981", bg: attente.length > 0 ? "#fffbeb" : "#ecfdf5", desc: attente.length > 0 ? "Validation requise" : "Tout traité ✓", path: "/admin/attente", urgent: attente.length > 0 },
              { label: "Mesures glycémie", value: suivis.length, icon: "bi-droplet-fill",      accent: "#0ea5e9", bg: "#f0f9ff", desc: `Moy. ${glycMoy} g/L`,              path: "/admin/statistiques" },
            ].map((k, i) => (
              <div key={i} className={`da-kpi ${k.urgent ? "da-kpi--urgent" : ""}`}
                style={{ "--accent": k.accent, "--bg": k.bg, animationDelay: `${i * 70}ms` }}
                onClick={() => navigate(k.path)}
              >
                <div className="da-kpi-icon-wrap">
                  <i className={`bi ${k.icon}`}></i>
                  {k.urgent && <span className="da-kpi-dot"></span>}
                </div>
                <div className="da-kpi-body">
                  <div className="da-kpi-val">{k.value}</div>
                  <div className="da-kpi-lbl">{k.label}</div>
                  <div className="da-kpi-desc">{k.desc}</div>
                </div>
                <i className="bi bi-arrow-right da-kpi-arrow"></i>
              </div>
            ))}
          </div>

          {/* ── ROW 2 ── */}
          <div className="da-row2">

            {/* Répartition utilisateurs — Donut */}
            <div className="da-panel">
              <div className="da-panel-head">
                <div className="da-panel-icon" style={{ background: "#eef2ff", color: "#6366f1" }}>
                  <i className="bi bi-pie-chart-fill"></i>
                </div>
                <div>
                  <div className="da-panel-title">Répartition utilisateurs</div>
                  <div className="da-panel-sub">{total} utilisateurs au total</div>
                </div>
              </div>
              <div className="da-panel-body">
                <div className="da-donut-wrap">
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <Donut
                      size={120} stroke={18}
                      segments={[
                        { value: patients.length, color: "#10b981" },
                        { value: medecins.length, color: "#6366f1" },
                        { value: attente.length,  color: "#f59e0b" },
                      ]}
                    />
                    <div className="da-donut-center">
                      <div className="da-donut-num">{total}</div>
                      <div className="da-donut-txt">total</div>
                    </div>
                  </div>
                  <div className="da-donut-legend">
                    {[
                      { label: "Patients",   value: patients.length, color: "#10b981" },
                      { label: "Médecins",   value: medecins.length, color: "#6366f1" },
                      { label: "En attente", value: attente.length,  color: "#f59e0b" },
                    ].map((item, i) => (
                      <div key={i} className="da-dl-item">
                        <span className="da-dl-dot" style={{ background: item.color }}></span>
                        <span className="da-dl-lbl">{item.label}</span>
                        <strong className="da-dl-val">{item.value}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Rattachement — Demi-cercle + barres */}
            <div className="da-panel">
              <div className="da-panel-head">
                <div className="da-panel-icon" style={{ background: "#ecfdf5", color: "#10b981" }}>
                  <i className="bi bi-link-45deg"></i>
                </div>
                <div>
                  <div className="da-panel-title">Rattachement patients</div>
                  <div className="da-panel-sub">Suivi de la couverture médicale</div>
                </div>
              </div>
              <div className="da-panel-body">
                {/* Arc de progression */}
                <div className="da-arc-wrap">
                  <svg viewBox="0 0 120 70" className="da-arc-svg">
                    <path d="M10,60 A50,50 0 0,1 110,60" fill="none" stroke="#f1f5f9" strokeWidth="12" strokeLinecap="round"/>
                    <path d="M10,60 A50,50 0 0,1 110,60" fill="none" stroke="url(#arcGrad)"
                      strokeWidth="12" strokeLinecap="round"
                      strokeDasharray={`${(tauxRattach / 100) * 157} 157`}
                    />
                    <defs>
                      <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10b981"/>
                        <stop offset="100%" stopColor="#34d399"/>
                      </linearGradient>
                    </defs>
                    <text x="60" y="58" textAnchor="middle" fontSize="16" fontWeight="800" fill="#0f172a">{tauxRattach}%</text>
                  </svg>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginTop: "0.5rem" }}>
                  {[
                    { label: "Rattachés",    value: avecMedecin, color: "#10b981" },
                    { label: "Sans médecin", value: sansMedecin, color: "#f59e0b" },
                  ].map((item, i) => (
                    <div key={i}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: "0.78rem", color: "#475569", fontWeight: 500 }}>{item.label}</span>
                        <span style={{ fontSize: "0.78rem", fontWeight: 700, color: item.color }}>{item.value}</span>
                      </div>
                      <Bar value={item.value} max={patients.length} color={item.color} />
                    </div>
                  ))}
                </div>
                <button className="da-panel-link" onClick={() => navigate("/admin/patients")}>
                  Voir les patients <i className="bi bi-arrow-right ms-1"></i>
                </button>
              </div>
            </div>

            {/* Glycémie — barres horizontales */}
            <div className="da-panel">
              <div className="da-panel-head">
                <div className="da-panel-icon" style={{ background: "#f0f9ff", color: "#0ea5e9" }}>
                  <i className="bi bi-droplet-fill"></i>
                </div>
                <div>
                  <div className="da-panel-title">État des glycémies</div>
                  <div className="da-panel-sub">{suivis.length} mesures — moy. {glycMoy} g/L</div>
                </div>
              </div>
              <div className="da-panel-body">
                {/* Mini donut glycémie */}
                <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <Donut size={90} stroke={14}
                      segments={[
                        { value: glycNormales, color: "#10b981" },
                        { value: glycElevees,  color: "#ef4444" },
                        { value: glycFaibles,  color: "#f59e0b" },
                      ]}
                    />
                    <div className="da-donut-center" style={{ fontSize: "0.85rem" }}>
                      <div style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>{suivis.length}</div>
                      <div style={{ fontSize: "0.55rem", color: "#94a3b8", textTransform: "uppercase" }}>total</div>
                    </div>
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {[
                      { label: "Normales",  value: glycNormales, color: "#10b981" },
                      { label: "Élevées",   value: glycElevees,  color: "#ef4444" },
                      { label: "Faibles",   value: glycFaibles,  color: "#f59e0b" },
                    ].map((item, i) => (
                      <div key={i}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                          <span style={{ fontSize: "0.75rem", color: "#475569" }}>{item.label}</span>
                          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: item.color }}>{item.value}</span>
                        </div>
                        <Bar value={item.value} max={suivis.length} color={item.color} height={5} />
                      </div>
                    ))}
                  </div>
                </div>
                <button className="da-panel-link" onClick={() => navigate("/admin/statistiques")} style={{ marginTop: "0.875rem" }}>
                  Voir les statistiques <i className="bi bi-arrow-right ms-1"></i>
                </button>
              </div>
            </div>
          </div>

          {/* ── ROW 3 ── */}
          <div className="da-row3">

            {/* Actions requises */}
            <div className="da-panel">
              <div className="da-panel-head">
                <div className="da-panel-icon" style={{ background: "#fffbeb", color: "#f59e0b" }}>
                  <i className="bi bi-lightning-charge-fill"></i>
                </div>
                <div>
                  <div className="da-panel-title">Actions requises</div>
                  <div className="da-panel-sub">Points nécessitant votre attention</div>
                </div>
                {attente.length > 0 && <span className="da-badge-urgent">{attente.length}</span>}
              </div>
              <div className="da-panel-body">
                <div className="da-action-list">
                  {[
                    {
                      cls: attente.length > 0 ? "da-action--warn" : "da-action--ok",
                      ico: attente.length > 0 ? "bi-hourglass-split" : "bi-check-circle-fill",
                      icoBg: attente.length > 0 ? "#fef3c7" : "#dcfce7",
                      icoColor: attente.length > 0 ? "#f59e0b" : "#10b981",
                      ttl: attente.length > 0 ? `${attente.length} médecin${attente.length > 1 ? "s" : ""} en attente` : "Aucune demande en attente",
                      sub: attente.length > 0 ? "Validation requise" : "Tout est traité ✓",
                      path: "/admin/attente",
                    },
                    {
                      cls: "da-action--info",
                      ico: "bi-person-x-fill",
                      icoBg: "#f0f9ff", icoColor: "#0ea5e9",
                      ttl: `${sansMedecin} patient${sansMedecin !== 1 ? "s" : ""} sans médecin`,
                      sub: "À rattacher à un professionnel",
                      path: "/admin/patients",
                    },
                    {
                      cls: "da-action--neutral",
                      ico: "bi-bar-chart-line-fill",
                      icoBg: "#eef2ff", icoColor: "#6366f1",
                      ttl: `${suivis.length} mesures de glycémie`,
                      sub: `Moyenne : ${glycMoy} g/L`,
                      path: "/admin/statistiques",
                    },
                  ].map((a, i) => (
                    <div key={i} className={`da-action ${a.cls}`} onClick={() => navigate(a.path)}>
                      <div className="da-action-ico" style={{ background: a.icoBg, color: a.icoColor }}>
                        <i className={`bi ${a.ico}`}></i>
                      </div>
                      <div className="da-action-text">
                        <div className="da-action-ttl">{a.ttl}</div>
                        <div className="da-action-sub">{a.sub}</div>
                      </div>
                      <i className="bi bi-chevron-right da-action-chev"></i>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Accès rapide */}
            <div className="da-panel">
              <div className="da-panel-head">
                <div className="da-panel-icon" style={{ background: "#fffbeb", color: "#f59e0b" }}>
                  <i className="bi bi-grid-fill"></i>
                </div>
                <div>
                  <div className="da-panel-title">Accès rapide</div>
                  <div className="da-panel-sub">Navigation vers les sections</div>
                </div>
              </div>
              <div className="da-panel-body">
                <div className="da-quick-grid">
                  {[
                    { icon: "bi-people-fill",         label: "Patients",     info: `${patients.length}`,   color: "#10b981", bg: "#ecfdf5", path: "/admin/patients" },
                    { icon: "bi-person-badge-fill",   label: "Médecins",     info: `${medecins.length}`,   color: "#6366f1", bg: "#eef2ff", path: "/admin/medecins" },
                    { icon: "bi-hourglass-split",     label: "En attente",   info: `${attente.length}`,    color: "#f59e0b", bg: "#fffbeb", path: "/admin/attente" },
                    { icon: "bi-bar-chart-line-fill", label: "Statistiques", info: "Analyses",             color: "#0ea5e9", bg: "#f0f9ff", path: "/admin/statistiques" },
                    { icon: "bi-mortarboard-fill",    label: "Éducation",    info: "Contenus",             color: "#a855f7", bg: "#faf5ff", path: "/medecin/education" },
                    { icon: "bi-person-circle",       label: "Mon profil",   info: "Paramètres",           color: "#64748b", bg: "#f8fafc", path: "/admin/profile" },
                  ].map((item, i) => (
                    <div key={i} className="da-quick"
                      style={{ "--qc": item.color, "--qbg": item.bg }}
                      onClick={() => navigate(item.path)}
                    >
                      <div className="da-quick-ico"><i className={`bi ${item.icon}`}></i></div>
                      <div className="da-quick-lbl">{item.label}</div>
                      <div className="da-quick-info">{item.info}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Indicateurs en bande */}
            <div className="da-panel">
              <div className="da-panel-head">
                <div className="da-panel-icon" style={{ background: "#ecfdf5", color: "#10b981" }}>
                  <i className="bi bi-activity"></i>
                </div>
                <div>
                  <div className="da-panel-title">Indicateurs clés</div>
                  <div className="da-panel-sub">Santé globale de la plateforme</div>
                </div>
              </div>
              <div className="da-panel-body">
                {[
                  { label: "Taux de rattachement",      value: tauxRattach, unit: "%",  max: 100, color: tauxRattach >= 70 ? "#10b981" : "#f59e0b", note: `${avecMedecin} / ${patients.length} patients` },
                  { label: "Patients sans médecin",     value: patients.length > 0 ? Math.round((sansMedecin/patients.length)*100) : 0, unit: "%", max: 100, color: sansMedecin > 0 ? "#f59e0b" : "#10b981", note: `${sansMedecin} à rattacher` },
                  { label: "Glycémies normales",        value: suivis.length > 0 ? Math.round((glycNormales/suivis.length)*100) : 0, unit: "%", max: 100, color: "#10b981", note: `${glycNormales} / ${suivis.length} mesures` },
                  { label: "Charge par médecin",        value: parseFloat(tauxOccup), unit: " pts", max: Math.max(parseFloat(tauxOccup)*2, 10), color: "#6366f1", note: `${patients.length} patients / ${medecins.length} médecins` },
                ].map((ind, i) => {
                  const pct = Math.min(100, Math.round((ind.value / Math.max(ind.max, 1)) * 100));
                  return (
                    <div className="da-ind" key={i}>
                      <div className="da-ind-head">
                        <span className="da-ind-lbl">{ind.label}</span>
                        <span className="da-ind-val" style={{ color: ind.color }}>{ind.value}{ind.unit}</span>
                      </div>
                      <div className="da-ind-track">
                        <div className="da-ind-fill" style={{ width: `${pct}%`, background: ind.color }}></div>
                      </div>
                      <div className="da-ind-note">{ind.note}</div>
                    </div>
                  );
                })}

                {/* Strip résumé */}
                <div className="da-strip">
                  {[
                    { val: patients.length, lbl: "Patients",   color: "#10b981" },
                    { val: medecins.length, lbl: "Médecins",   color: "#6366f1" },
                    { val: attente.length,  lbl: "En attente", color: "#f59e0b" },
                    { val: total,           lbl: "Total",      color: "#0ea5e9" },
                  ].map((s, i) => (
                    <React.Fragment key={i}>
                      <div className="da-strip-item">
                        <span className="da-strip-val" style={{ color: s.color }}>{s.val}</span>
                        <span className="da-strip-lbl">{s.lbl}</span>
                      </div>
                      {i < 3 && <div className="da-strip-div"></div>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <AideModal show={showAide} onHide={() => setShowAide(false)} />
    </div>
  );
}

export default DashboardAdmin;