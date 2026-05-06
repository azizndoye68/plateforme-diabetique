// src/services/patientService.js
import api from "./api";

/* ================================
   PATIENTS CRUD
================================ */

// 🔹 Tous les patients
export const getPatients = async () => {
  const res = await api.get("/api/patients");
  return res.data;
};

// 🔹 Patient par ID
export const getPatientById = async (id) => {
  const res = await api.get(`/api/patients/${id}`);
  return res.data;
};

// 🔹 Patient par utilisateur (IMPORTANT)
export const getPatientByUtilisateurId = async (utilisateurId) => {
  const res = await api.get(`/api/patients/byUtilisateur/${utilisateurId}`);
  return res.data;
};

// 🔹 Création patient
export const createPatient = async (data) => {
  const res = await api.post("/api/patients", data);
  return res.data;
};

// 🔹 Mise à jour patient
export const updatePatient = async (id, data) => {
  const res = await api.put(`/api/patients/${id}`, data);
  return res.data;
};

// 🔹 Suppression patient
export const deletePatient = async (id) => {
  const res = await api.delete(`/api/patients/${id}`);
  return res.data;
};

/* ================================
   RATTACHEMENT MÉDECIN
================================ */

// 🔹 Rattacher un médecin à un patient
export const rattacherMedecin = async (
  patientId,
  numeroProfessionnelMedecin
) => {
  const res = await api.patch(
    `/api/patients/${patientId}/rattacher-medecin`,
    null,
    {
      params: { numeroProfessionnelMedecin },
    }
  );
  return res.data;
};

/* ================================
   CONSEILS PERSONNALISÉS
================================ */

export const getConseils = async () => {
  const res = await api.get("/api/conseils");
  return res.data;
};

export const getConseilById = async (id) => {
  const res = await api.get(`/api/conseils/${id}`);
  return res.data;
};

export const getConseilsByPatient = async (patientId) => {
  const res = await api.get(`/api/conseils/patient/${patientId}`);
  return res.data;
};

export const createConseil = async (data) => {
  const res = await api.post("/api/conseils", data);
  return res.data;
};

export const updateConseil = async (id, data) => {
  const res = await api.put(`/api/conseils/${id}`, data);
  return res.data;
};

export const deleteConseil = async (id) => {
  const res = await api.delete(`/api/conseils/${id}`);
  return res.data;
};

/* ================================
   CONTENU ÉDUCATIF
================================ */

export const getContenus = async () => {
  const res = await api.get("/api/contenus");
  return res.data;
};

export const getContenuById = async (id) => {
  const res = await api.get(`/api/contenus/${id}`);
  return res.data;
};

export const createContenu = async (data) => {
  const res = await api.post("/api/contenus", data);
  return res.data;
};

export const updateContenu = async (id, data) => {
  const res = await api.put(`/api/contenus/${id}`, data);
  return res.data;
};

export const deleteContenu = async (id) => {
  const res = await api.delete(`/api/contenus/${id}`);
  return res.data;
};

/* ================================
   DOSSIERS MÉDICAUX
================================ */

export const getDossiers = async () => {
  const res = await api.get("/api/dossiers");
  return res.data;
};

export const getDossierById = async (id) => {
  const res = await api.get(`/api/dossiers/${id}`);
  return res.data;
};

export const getDossierByPatient = async (patientId) => {
  const res = await api.get(`/api/dossiers/patient/${patientId}`);
  return res.data;
};

export const createDossier = async (data) => {
  const res = await api.post("/api/dossiers", data);
  return res.data;
};

export const updateDossier = async (id, data) => {
  const res = await api.put(`/api/dossiers/${id}`, data);
  return res.data;
};

export const deleteDossier = async (id) => {
  const res = await api.delete(`/api/dossiers/${id}`);
  return res.data;
};

/* ================================
   OBJECTIFS SANTÉ
================================ */

export const getObjectifs = async () => {
  const res = await api.get("/api/objectifs");
  return res.data;
};

export const getObjectifsByPatient = async (patientId) => {
  const res = await api.get(`/api/objectifs/patient/${patientId}`);
  return res.data;
};

export const getObjectifById = async (id) => {
  const res = await api.get(`/api/objectifs/${id}`);
  return res.data;
};

export const createObjectif = async (data) => {
  const res = await api.post("/api/objectifs", data);
  return res.data;
};

export const updateObjectif = async (id, data) => {
  const res = await api.put(`/api/objectifs/${id}`, data);
  return res.data;
};

export const deleteObjectif = async (id) => {
  const res = await api.delete(`/api/objectifs/${id}`);
  return res.data;
};
