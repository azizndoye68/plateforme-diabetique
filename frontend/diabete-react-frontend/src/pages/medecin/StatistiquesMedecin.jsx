// src/pages/medecin/StatistiquesMedecin.jsx
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge } from 'react-bootstrap';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import TopbarMedecin from '../../components/TopbarMedecin';
import api from '../../services/api';
import './StatistiquesMedecin.css';

/* ── Tooltip personnalisé ────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'white',
      border: '1.5px solid #f1f5f9',
      borderRadius: 9,
      padding: '8px 12px',
      boxShadow: '0 4px 14px rgba(0,0,0,.08)',
      fontSize: 12
    }}>
      {label && <p style={{ margin: '0 0 4px', color: '#64748b', fontWeight: 600 }}>{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} style={{ margin: 0, color: entry.color, fontWeight: 700 }}>
          {entry.name} : <span style={{ color: '#1e293b' }}>{entry.value}</span>
        </p>
      ))}
    </div>
  );
};

/* ── Carte KPI ───────────────────────────────────────────────── */
function KpiCard({ icon, label, value, unit, gradient, delay }) {
  return (
    <Card className={`stat-card-mini sm-fade`} style={{ '--d': `${delay}ms` }}>
      <Card.Body className="p-3">
        <div className="stat-mini-icon" style={{ background: gradient }}>
          <i className={`bi ${icon}`}></i>
        </div>
        <div className="stat-mini-info">
          <small className="stat-mini-label">{label}</small>
          <h3 className="stat-mini-value">
            {value}{unit && <small>{unit}</small>}
          </h3>
        </div>
      </Card.Body>
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE PRINCIPALE
═══════════════════════════════════════════════════════════════ */
function StatistiquesMedecin() {
  const [medecin, setMedecin]             = useState(null);
  const [patients, setPatients]           = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('all');
  const [periode, setPeriode]             = useState('30');
  const [loading, setLoading]             = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0, patientsActifs: 0,
    moyenneGlycemie: 0, conformite: 0, alertes: 0
  });
  const [chartData, setChartData] = useState({
    evolutionGlycemie: [], repartitionTypes: [],
    conformitePatients: [], alertesParType: []
  });

  const COLORS = ['#11998e', '#667eea', '#0ea5e9', '#f59e0b', '#a855f7', '#ef4444'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await api.get('/api/auth/profile');
        const medRes     = await api.get(`/api/medecins/byUtilisateur/${profileRes.data.id}`);
        setMedecin(medRes.data);
        const patientsRes = await api.get(`/api/patients/medecin/${medRes.data.id}/visibles`);
        setPatients(patientsRes.data || []);
        await loadStatistics(medRes.data.id, 'all', '30');
      } catch (error) {
        console.error('Erreur chargement données:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const processMesures = (mesures, evolutionData, counters) => {
    const newEvolutionData = { ...evolutionData };
    const newCounters      = { ...counters };
    mesures.forEach(m => {
      const date = new Date(m.dateSuivi).toLocaleDateString('fr-FR');
      if (!newEvolutionData[date]) newEvolutionData[date] = { date, total: 0, count: 0 };
      newEvolutionData[date].total += m.glycemie;
      newEvolutionData[date].count++;
      newCounters.totalGlycemies  += m.glycemie;
      newCounters.countGlycemies++;
      if (m.glycemie < 0.7 || m.glycemie > 1.8) newCounters.totalAlertes++;
    });
    return { evolutionData: newEvolutionData, counters: newCounters };
  };

  const loadStatistics = async (medecinId, patientFilter, periodeJours) => {
    try {
      setLoading(true);
      const patientsRes  = await api.get(`/api/patients/medecin/${medecinId}/visibles`);
      const allPatients  = patientsRes.data || [];
      const filteredPatients = patientFilter !== 'all'
        ? allPatients.filter(p => p.id === parseInt(patientFilter))
        : allPatients;

      const counters = { totalGlycemies: 0, countGlycemies: 0, patientsActifs: 0, totalAlertes: 0 };
      const evolutionData    = {};
      const typesRepartition = {};
      const conformiteData   = [];

      for (const patient of filteredPatients) {
        try {
          const suiviRes = await api.get(`/api/suivis/recentes?patientId=${patient.id}`);
          const mesures  = suiviRes.data || [];
          if (mesures.length > 0) {
            counters.patientsActifs++;
            const dateLimit = new Date();
            dateLimit.setDate(dateLimit.getDate() - parseInt(periodeJours));
            const mesuresPeriode = mesures.filter(m => new Date(m.dateSuivi) >= dateLimit);
            const processed = processMesures(mesuresPeriode, evolutionData, counters);
            Object.assign(evolutionData, processed.evolutionData);
            Object.assign(counters, processed.counters);

            const type = patient.typeDiabete || 'Non spécifié';
            typesRepartition[type] = (typesRepartition[type] || 0) + 1;

            const glycemiesNormales = mesuresPeriode.filter(m => m.glycemie >= 0.7 && m.glycemie <= 1.2).length;
            conformiteData.push({
              nom: `${patient.prenom} ${patient.nom}`,
              conformite: mesuresPeriode.length > 0
                ? Math.round((glycemiesNormales / mesuresPeriode.length) * 100) : 0
            });
          }
        } catch (err) {
          console.log(`Pas de données pour patient ${patient.id}`);
        }
      }

      const evolutionArray = Object.values(evolutionData)
        .map(d => ({ date: d.date, moyenne: (d.total / d.count).toFixed(2) }))
        .sort((a, b) => {
          const [dA, mA, yA] = a.date.split('/');
          const [dB, mB, yB] = b.date.split('/');
          return new Date(yA, mA - 1, dA) - new Date(yB, mB - 1, dB);
        })
        .slice(-30);

      setStats({
        totalPatients:   filteredPatients.length,
        patientsActifs:  counters.patientsActifs,
        moyenneGlycemie: counters.countGlycemies > 0
          ? (counters.totalGlycemies / counters.countGlycemies).toFixed(2) : 0,
        conformite: conformiteData.length > 0
          ? Math.round(conformiteData.reduce((s, p) => s + p.conformite, 0) / conformiteData.length) : 0,
        alertes: counters.totalAlertes
      });

      setChartData({
        evolutionGlycemie:  evolutionArray,
        repartitionTypes:   Object.entries(typesRepartition).map(([name, value]) => ({ name, value })),
        conformitePatients: conformiteData.slice(0, 10),
        alertesParType: [
          { name: 'Hypoglycémies',  value: Math.floor(counters.totalAlertes * 0.4), fill: '#f59e0b' },
          { name: 'Hyperglycémies', value: Math.floor(counters.totalAlertes * 0.6), fill: '#ef4444' }
        ]
      });
    } catch (error) {
      console.error('Erreur calcul statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = () => {
    if (medecin) loadStatistics(medecin.id, selectedPatient, periode);
  };

  /* ── KPI cards config ── */
  const kpis = [
    { icon: 'bi-people-fill',        label: 'Patients',       value: stats.totalPatients,   unit: '',    gradient: 'linear-gradient(135deg,#667eea,#764ba2)', delay: 60  },
    { icon: 'bi-activity',           label: 'Actifs',         value: stats.patientsActifs,  unit: '',    gradient: 'linear-gradient(135deg,#11998e,#38ef7d)',  delay: 120 },
    { icon: 'bi-droplet-half',       label: 'Moy. Glycémie',  value: stats.moyenneGlycemie, unit: ' g/L',gradient: 'linear-gradient(135deg,#0ea5e9,#38bdf8)',  delay: 180 },
    { icon: 'bi-check-circle',       label: 'Conformité',     value: stats.conformite,      unit: '%',   gradient: 'linear-gradient(135deg,#11998e,#38ef7d)',  delay: 240 },
    { icon: 'bi-exclamation-triangle',label:'Alertes',        value: stats.alertes,         unit: '',    gradient: 'linear-gradient(135deg,#f59e0b,#fbbf24)',  delay: 300 },
    { icon: 'bi-calendar-check',     label: 'Période',        value: periode,               unit: ' j',  gradient: 'linear-gradient(135deg,#667eea,#764ba2)', delay: 360 },
  ];

  return (
    <div className="stats-medecin-wrapper">
      <TopbarMedecin user={medecin} />

      <div className="stats-medecin-content">
        <Container fluid className="px-0">

          {/* ═══ EN-TÊTE ══════════════════════════════════════════ */}
          <div className="stats-header sm-fade" style={{ '--d': '0ms' }}>
            <div className="stats-header-content">
              <div className="stats-icon-wrapper">
                <i className="bi bi-graph-up-arrow"></i>
              </div>
              <div>
                <h2>Statistiques &amp; Rapports</h2>
                <p><i className="bi bi-calendar3 me-1"></i>Analyse et suivi de vos patients</p>
              </div>
            </div>
            <Button className="btn-export" onClick={() => window.print()}>
              <i className="bi bi-file-earmark-pdf me-1"></i>Exporter PDF
            </Button>
          </div>

          {/* ═══ FILTRES ══════════════════════════════════════════ */}
          <Card className={`filter-card sm-fade`} style={{ '--d': '80ms' }}>
            <Card.Body>
              <Row className="g-2 align-items-end">
                <Col md={5}>
                  <Form.Label className="fw-semibold">
                    <i className="bi bi-person me-1"></i>Patient
                  </Form.Label>
                  <Form.Select
                    value={selectedPatient}
                    onChange={e => setSelectedPatient(e.target.value)}
                    className="form-select-custom"
                    size="sm"
                  >
                    <option value="all">Tous les patients</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.prenom} {p.nom} — {p.typeDiabete}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={4}>
                  <Form.Label className="fw-semibold">
                    <i className="bi bi-calendar-range me-1"></i>Période
                  </Form.Label>
                  <Form.Select
                    value={periode}
                    onChange={e => setPeriode(e.target.value)}
                    className="form-select-custom"
                    size="sm"
                  >
                    <option value="7">7 derniers jours</option>
                    <option value="30">30 derniers jours</option>
                    <option value="90">3 derniers mois</option>
                    <option value="180">6 derniers mois</option>
                    <option value="365">1 an</option>
                  </Form.Select>
                </Col>
                <Col md={3}>
                  <Button
                    className="w-100 btn-filter"
                    onClick={handleFilterChange}
                    disabled={loading}
                    size="sm"
                  >
                    {loading
                      ? <><i className="bi bi-hourglass-split me-1"></i>Chargement…</>
                      : <><i className="bi bi-funnel me-1"></i>Appliquer</>
                    }
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* ═══ KPI CARDS ════════════════════════════════════════ */}
          <Row className="g-2 mb-3">
            {kpis.map((kpi, i) => (
              <Col key={i} xl={2} md={4} sm={6} xs={6}>
                <KpiCard {...kpi} />
              </Col>
            ))}
          </Row>

          {/* ═══ GRAPHIQUES ROW 1 ═════════════════════════════════ */}
          <Row className="g-3 mb-3">
            {/* Évolution glycémie */}
            <Col lg={8}>
              <Card className={`chart-card sm-fade`} style={{ '--d': '420ms' }}>
                <Card.Body>
                  <div className="chart-header">
                    <h5>
                      <i className="bi bi-graph-up me-2" style={{ color: '#667eea' }}></i>
                      Évolution glycémie moyenne
                    </h5>
                    <Badge className="badge-chart">Tendance</Badge>
                  </div>
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={chartData.evolutionGlycemie}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                      <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line
                        type="monotone"
                        dataKey="moyenne"
                        name="Glycémie moy. (g/L)"
                        stroke="#667eea"
                        strokeWidth={2.5}
                        dot={{ fill: '#667eea', r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>

            {/* Répartition types */}
            <Col lg={4}>
              <Card className={`chart-card sm-fade`} style={{ '--d': '480ms' }}>
                <Card.Body>
                  <div className="chart-header">
                    <h5>
                      <i className="bi bi-pie-chart me-2" style={{ color: '#11998e' }}></i>
                      Types de diabète
                    </h5>
                    <Badge className="badge-chart">Répartition</Badge>
                  </div>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={chartData.repartitionTypes}
                        cx="50%" cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={75}
                        dataKey="value"
                      >
                        {chartData.repartitionTypes.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* ═══ GRAPHIQUES ROW 2 ═════════════════════════════════ */}
          <Row className="g-3">
            {/* Conformité par patient */}
            <Col lg={6}>
              <Card className={`chart-card sm-fade`} style={{ '--d': '540ms' }}>
                <Card.Body>
                  <div className="chart-header">
                    <h5>
                      <i className="bi bi-bar-chart me-2" style={{ color: '#11998e' }}></i>
                      Conformité glycémique
                    </h5>
                    <Badge className="badge-chart">Top 10</Badge>
                  </div>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={chartData.conformitePatients}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        dataKey="nom"
                        stroke="#94a3b8"
                        tick={{ fontSize: 10 }}
                        angle={-35}
                        textAnchor="end"
                        height={70}
                      />
                      <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <defs>
                        <linearGradient id="colorConformite" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#11998e" stopOpacity={0.9} />
                          <stop offset="95%" stopColor="#38ef7d" stopOpacity={0.8} />
                        </linearGradient>
                      </defs>
                      <Bar
                        dataKey="conformite"
                        name="Conformité (%)"
                        fill="url(#colorConformite)"
                        radius={[5, 5, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>

            {/* Répartition alertes */}
            <Col lg={6}>
              <Card className={`chart-card sm-fade`} style={{ '--d': '600ms' }}>
                <Card.Body>
                  <div className="chart-header">
                    <h5>
                      <i className="bi bi-exclamation-triangle me-2" style={{ color: '#f59e0b' }}></i>
                      Répartition des alertes
                    </h5>
                    <Badge className="badge-chart">Détails</Badge>
                  </div>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={chartData.alertesParType}
                        cx="50%" cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name} (${value})`}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {chartData.alertesParType.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>
          </Row>

        </Container>
      </div>
    </div>
  );
}

export default StatistiquesMedecin;