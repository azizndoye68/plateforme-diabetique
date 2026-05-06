import React from 'react';
import { Card } from 'react-bootstrap';
import './DashboardCard.css';

function DashboardCard({ title, icon, children, className }) {
  return (
    <Card className={`dashboard-card shadow-sm p-3 ${className || ''}`}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0 fw-bold">{title}</h5>
        {icon && <i className={`bi ${icon} fs-4 text-success`}></i>}
      </div>
      {children}
    </Card>
  );
}

export default DashboardCard;
