// src/components/GlycemieChart.jsx
import React from 'react';
import {
  Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, ComposedChart
} from 'recharts';

// Tooltip personnalisé moderne
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    let status = '';
    let color = '';
    
    if (value < 0.7) {
      status = 'Faible ⚠️';
      color = '#ffc107';
    } else if (value >= 0.7 && value <= 1.2) {
      status = 'Normal ✓';
      color = '#13a649';
    } else {
      status = 'Élevé ⚠️';
      color = '#dc3545';
    }

    return (
      <div style={{
        background: 'white',
        border: `3px solid ${color}`,
        padding: '12px 16px',
        borderRadius: '12px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.15)'
      }}>
        <p style={{ margin: 0, fontWeight: '600', color: '#333' }}>{label}</p>
        <p style={{ margin: '4px 0 0 0', fontSize: '1.2rem', fontWeight: 'bold', color }}>
          {value} g/L
        </p>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#666' }}>
          {status}
        </p>
      </div>
    );
  }
  return null;
};

function GlycemieChart({ data }) {
  // Transformation de la date
  const formattedData = data.map(item => ({
    ...item,
    date: new Date(item.dateSuivi).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit'
    }),
    glycemie: parseFloat(item.glycemie),
  }));

  // Fonction pour obtenir la couleur du point
  const getPointColor = (value) => {
    if (value < 0.7) return '#ffc107';
    if (value >= 0.7 && value <= 1.2) return '#13a649';
    return '#dc3545';
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Légende visuelle */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '2rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            background: '#ffc107',
            border: '2px solid #ffc107'
          }}></div>
          <span style={{ fontSize: '0.9rem', color: '#666' }}>Faible (&lt; 0.7)</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            background: '#13a649',
            border: '2px solid #13a649'
          }}></div>
          <span style={{ fontSize: '0.9rem', color: '#666' }}>Normal (0.7-1.2)</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            background: '#dc3545',
            border: '2px solid #dc3545'
          }}></div>
          <span style={{ fontSize: '0.9rem', color: '#666' }}>Élevé (&gt; 1.2)</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={formattedData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
          <defs>
            <linearGradient id="colorGlycemie" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#667eea" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#667eea" stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          
          {/* Zone normale en vert très léger */}
          <ReferenceLine 
            y={0.7} 
            stroke="#667eea" 
            strokeDasharray="5 5" 
            strokeWidth={2}
            label={{ 
              value: 'Min normal', 
              position: 'insideTopLeft',
              fill: '#667eea',
              fontSize: 12,
              fontWeight: 600
            }}
          />
          <ReferenceLine 
            y={1.2} 
            stroke="#667eea" 
            strokeDasharray="5 5" 
            strokeWidth={2}
            label={{ 
              value: 'Max normal', 
              position: 'insideBottomLeft',
              fill: '#667eea',
              fontSize: 12,
              fontWeight: 600
            }}
          />
          
          <XAxis 
            dataKey="date" 
            tick={{ fill: '#666', fontSize: 12 }}
            axisLine={{ stroke: '#999' }}
          />
          <YAxis 
            domain={[0, 2]} 
            tick={{ fill: '#666', fontSize: 12 }}
            axisLine={{ stroke: '#999' }}
            label={{ 
              value: 'Glycémie (g/L)', 
              angle: -90, 
              position: 'insideLeft',
              style: { fill: '#666', fontWeight: 600 }
            }}
          />
          
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#667eea', strokeWidth: 2 }} />
          
          {/* Zone sous la courbe */}
          <Area
            type="monotone"
            dataKey="glycemie"
            stroke="none"
            fillOpacity={1}
            fill="url(#colorGlycemie)"
          />
          
          {/* Ligne principale */}
          <Line
            type="monotone"
            dataKey="glycemie"
            stroke="#667eea"
            strokeWidth={3}
            dot={({ cx, cy, payload }) => (
              <g>
                {/* Halo autour du point */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={10}
                  fill={getPointColor(payload.glycemie)}
                  opacity={0.2}
                />
                {/* Point principal */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={6}
                  stroke="white"
                  strokeWidth={2}
                  fill={getPointColor(payload.glycemie)}
                />
              </g>
            )}
            activeDot={{ 
              r: 8, 
              fill: '#667eea',
              stroke: 'white',
              strokeWidth: 3
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export default GlycemieChart;