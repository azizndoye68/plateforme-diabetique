// src/pages/Statistiques.jsx
import React, { useEffect, useState } from "react";
import {
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
  ComposedChart,
  Area,
  ReferenceLine,
} from "recharts";
import { useParams } from "react-router-dom";
import SidebarPatient from "../../components/SidebarPatient";
import AideModal from "../../components/AideModal";
import api from "../../services/api";
import "./Statistiques.css";

const PLAGES = {
  hypo: {
    max: 0.7,
    color: "#f59e0b",
    label: "Hypoglycémie",
    range: "< 0.7 g/L",
  },
  normal: {
    min: 0.7,
    max: 1.2,
    color: "#10b981",
    label: "Normale",
    range: "0.7 – 1.2 g/L",
  },
  hyper: {
    min: 1.2,
    color: "#ef4444",
    label: "Hyperglycémie",
    range: "> 1.2 g/L",
  },
};

const getColor = (v) => {
  if (v < 0.7) return PLAGES.hypo.color;
  if (v <= 1.2) return PLAGES.normal.color;
  return PLAGES.hyper.color;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const gly = payload[0].value;
  const color = getColor(gly);
  const status = gly < 0.7 ? "Faible ⚠️" : gly <= 1.2 ? "Normal ✓" : "Élevé ⚠️";
  return (
    <div className="st-tooltip" style={{ borderColor: color }}>
      <p className="st-tooltip-label">{label}</p>
      <p className="st-tooltip-val" style={{ color }}>
        {gly} g/L
      </p>
      <p className="st-tooltip-status">{status}</p>
    </div>
  );
};

function Statistiques() {
  const { patientId } = useParams();
  const [data, setData] = useState([]);
  const [patient, setPatient] = useState(null);
  const [showAide, setShowAide] = useState(false);
  const [stats, setStats] = useState({ moyenne: 0, min: 0, max: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let realPatientId, patientData;

        if (patientId) {
          const res = await api.get(`/api/patients/${patientId}`);
          patientData = res.data;
          realPatientId = patientId;
        } else {
          const profileRes = await api.get("/api/auth/profile");
          const res = await api.get(
            `/api/patients/byUtilisateur/${profileRes.data.id}`,
          );
          patientData = res.data;
          realPatientId = patientData.id;
        }

        setPatient(patientData);

        const glyRes = await api.get(
          `/api/suivis/recentes?patientId=${realPatientId}`,
        );
        const formatted = glyRes.data.map((m) => ({
          date: new Date(m.dateSuivi).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
          }),
          glycemie: parseFloat(m.glycemie),
        }));

        setData(formatted);

        if (formatted.length > 0) {
          const vals = formatted.map((d) => d.glycemie);
          setStats({
            moyenne: (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2),
            min: Math.min(...vals).toFixed(2),
            max: Math.max(...vals).toFixed(2),
            total: formatted.length,
          });
        }
      } catch (err) {
        console.error("Erreur statistiques :", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [patientId]);

  // Comptage par plage
  const countHypo = data.filter((d) => d.glycemie < 0.7).length;
  const countNormal = data.filter(
    (d) => d.glycemie >= 0.7 && d.glycemie <= 1.2,
  ).length;
  const countHyper = data.filter((d) => d.glycemie > 1.2).length;

  return (
    <div className="st-wrapper">
      <SidebarPatient
        patient={patient}
        isMedecin={!!patientId}
        onShowAide={() => setShowAide(true)}
      />

      <div className="st-main">
        <div className="st-container">
          {/* ── HEADER ── */}
          <div className="st-header">
            <div className="st-header-left">
              <div className="st-header-icon">
                <i className="bi bi-graph-up-arrow"></i>
              </div>
              <div>
                <div className="st-header-tag">SUIVI MÉDICAL</div>
                <h1 className="st-header-title">Statistiques de glycémie</h1>
                <p className="st-header-sub">
                  {patient
                    ? `${patient.prenom} ${patient.nom}`
                    : "Chargement..."}
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="st-loading">
              <div className="st-spinner"></div>
              <p>Chargement des statistiques...</p>
            </div>
          ) : (
            <>
              {/* ── KPI CARDS ── */}
              <div className="st-kpi-grid">
                {[
                  {
                    label: "Moyenne",
                    value: stats.moyenne,
                    unit: "g/L",
                    icon: "bi-graph-up",
                    color: "#10b981",
                    bg: "#ecfdf5",
                  },
                  {
                    label: "Minimum",
                    value: stats.min,
                    unit: "g/L",
                    icon: "bi-arrow-down-circle",
                    color: "#f59e0b",
                    bg: "#fffbeb",
                  },
                  {
                    label: "Maximum",
                    value: stats.max,
                    unit: "g/L",
                    icon: "bi-arrow-up-circle",
                    color: "#ef4444",
                    bg: "#fef2f2",
                  },
                  {
                    label: "Mesures",
                    value: stats.total,
                    unit: "",
                    icon: "bi-droplet-fill",
                    color: "#6366f1",
                    bg: "#eef2ff",
                  },
                ].map((k, i) => (
                  <div
                    key={i}
                    className="st-kpi"
                    style={{ "--kc": k.color, "--kbg": k.bg }}
                  >
                    <div className="st-kpi-icon">
                      <i className={`bi ${k.icon}`}></i>
                    </div>
                    <div className="st-kpi-body">
                      <div className="st-kpi-val">
                        {k.value} <span className="st-kpi-unit">{k.unit}</span>
                      </div>
                      <div className="st-kpi-lbl">{k.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── RÉPARTITION ── */}
              <div className="st-repartition">
                {[
                  {
                    label: "Hypoglycémies",
                    count: countHypo,
                    color: "#f59e0b",
                    total: data.length,
                  },
                  {
                    label: "Normales",
                    count: countNormal,
                    color: "#10b981",
                    total: data.length,
                  },
                  {
                    label: "Hyperglycémies",
                    count: countHyper,
                    color: "#ef4444",
                    total: data.length,
                  },
                ].map((item, i) => {
                  const pct =
                    data.length > 0
                      ? Math.round((item.count / data.length) * 100)
                      : 0;
                  return (
                    <div
                      key={i}
                      className="st-rep-card"
                      style={{ "--rc": item.color }}
                    >
                      <div className="st-rep-top">
                        <span
                          className="st-rep-dot"
                          style={{ background: item.color }}
                        ></span>
                        <span className="st-rep-lbl">{item.label}</span>
                        <span
                          className="st-rep-pct"
                          style={{ color: item.color }}
                        >
                          {pct}%
                        </span>
                      </div>
                      <div className="st-rep-track">
                        <div
                          className="st-rep-fill"
                          style={{ width: `${pct}%`, background: item.color }}
                        ></div>
                      </div>
                      <div className="st-rep-count">
                        {item.count} mesure{item.count > 1 ? "s" : ""}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── LÉGENDE ── */}
              <div className="st-legend">
                {Object.values(PLAGES).map((p, i) => (
                  <div
                    key={i}
                    className="st-legend-item"
                    style={{ "--lc": p.color }}
                  >
                    <div
                      className="st-legend-dot"
                      style={{ background: p.color }}
                    ></div>
                    <div>
                      <div className="st-legend-name">{p.label}</div>
                      <div className="st-legend-range">{p.range}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── COURBE ── */}
              <div className="st-panel">
                <div className="st-panel-head">
                  <div
                    className="st-panel-icon"
                    style={{ background: "#ecfdf5", color: "#10b981" }}
                  >
                    <i className="bi bi-graph-up-arrow"></i>
                  </div>
                  <div>
                    <div className="st-panel-title">
                      Évolution sur les 30 derniers jours
                    </div>
                    <div className="st-panel-sub">
                      Courbe d'évolution de la glycémie
                    </div>
                  </div>
                </div>
                <div className="st-panel-body">
                  {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <ComposedChart
                        data={data}
                        margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                      >
                        <defs>
                          <linearGradient
                            id="stGrad"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#10b981"
                              stopOpacity={0.25}
                            />
                            <stop
                              offset="95%"
                              stopColor="#10b981"
                              stopOpacity={0.02}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <ReferenceLine
                          y={0.7}
                          stroke="#f59e0b"
                          strokeDasharray="5 5"
                          strokeWidth={1.5}
                        />
                        <ReferenceLine
                          y={1.2}
                          stroke="#ef4444"
                          strokeDasharray="5 5"
                          strokeWidth={1.5}
                        />
                        <XAxis
                          dataKey="date"
                          tick={{ fill: "#94a3b8", fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          domain={[0, 2]}
                          tick={{ fill: "#94a3b8", fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="glycemie"
                          stroke="none"
                          fill="url(#stGrad)"
                        />
                        <Line
                          type="monotone"
                          dataKey="glycemie"
                          stroke="#10b981"
                          strokeWidth={2.5}
                          dot={({ cx, cy, payload }) => (
                            <g key={`dot-${cx}-${cy}`}>
                              <circle
                                cx={cx}
                                cy={cy}
                                r={8}
                                fill={getColor(payload.glycemie)}
                                opacity={0.18}
                              />
                              <circle
                                cx={cx}
                                cy={cy}
                                r={5}
                                fill={getColor(payload.glycemie)}
                                stroke="white"
                                strokeWidth={2}
                              />
                            </g>
                          )}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="st-empty">
                      <i className="bi bi-inbox"></i>
                      <p>Aucune donnée disponible</p>
                    </div>
                  )}
                </div>
              </div>

              {/* ── HISTOGRAMME ── */}
              {data.length > 0 && (
                <div className="st-panel">
                  <div className="st-panel-head">
                    <div
                      className="st-panel-icon"
                      style={{ background: "#eef2ff", color: "#6366f1" }}
                    >
                      <i className="bi bi-bar-chart-fill"></i>
                    </div>
                    <div>
                      <div className="st-panel-title">
                        Distribution des mesures
                      </div>
                      <div className="st-panel-sub">
                        Valeurs de glycémie par date
                      </div>
                    </div>
                  </div>
                  <div className="st-panel-body">
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart
                        data={data}
                        margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                          dataKey="date"
                          tick={{ fill: "#94a3b8", fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          domain={[0, 2]}
                          tick={{ fill: "#94a3b8", fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="glycemie" radius={[8, 8, 0, 0]}>
                          {data.map((entry, i) => (
                            <Cell key={i} fill={getColor(entry.glycemie)} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <AideModal show={showAide} onHide={() => setShowAide(false)} />
    </div>
  );
}

export default Statistiques;
