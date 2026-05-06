import React from "react";
import { Outlet } from "react-router-dom";
import SidebarPatient from "../components/SidebarPatient";

export default function PatientLayout() {
  return (
    <div style={{ display: "flex" }}>
      {/* Sidebar fixe */}
      <SidebarPatient />

      {/* Contenu principal */}
      <div
        style={{
          marginLeft: "250px", // largeur de la sidebar
          width: "100%",
          padding: "20px",
          background: "#f9fafb",
          minHeight: "100vh",
        }}
      >
        <Outlet />
      </div>
    </div>
  );
}
