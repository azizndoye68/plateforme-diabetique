// src/services/medecinService.js
import api from './api';

/* ================================
   PROFIL
================================ */
export const getProfile = async () => {
  const res = await api.get('/api/auth/profile'); 
  return res.data;
};

/* ================================
   MÉDECINS CRUD
================================ */
export const getAllMedecins = async () => {
  const res = await api.get('/api/medecins');
  return res.data;
};

export const getMedecinById = async (id) => {
  const res = await api.get(`/api/medecins/${id}`);
  return res.data;
};

export const getMedecinByUtilisateurId = async (utilisateurId) => {
  const res = await api.get(`/api/medecins/byUtilisateur/${utilisateurId}`);
  return res.data;
};

export const getMedecinByNumero = async (numeroProfessionnel) => {
  const res = await api.get(`/api/medecins/numero/${numeroProfessionnel}`);
  return res.data;
};

export const createMedecin = async (data) => {
  const res = await api.post('/api/medecins', data);
  return res.data;
};

export const updateMedecin = async (id, data) => {
  const res = await api.put(`/api/medecins/${id}`, data);
  return res.data;
};

export const deleteMedecin = async (id) => {
  const res = await api.delete(`/api/medecins/${id}`);
  return res.data;
};

/* ================================
   PATIENTS DU MÉDECIN
================================ */
export const getPatients = async () => {
  const res = await api.get('/api/medecins/patients');
  return res.data;
};

/* ================================
   ÉQUIPES MÉDICALES
================================ */
export const getAllEquipes = async () => {
  const res = await api.get('/api/equipes-medicales/all');
  return res.data;
};

export const getEquipesDuMedecin = async (medecinId) => {
  const res = await api.get(`/api/equipes-medicales/medecin/${medecinId}`);
  return res.data;
};

export const getEquipeById = async (equipeId, medecinId) => {
  const res = await api.get(`/api/equipes-medicales/${equipeId}?medecinId=${medecinId}`);
  return res.data;
};

export const creerEquipe = async (data, medecinId) => {
  const res = await api.post(`/api/equipes-medicales?medecinId=${medecinId}`, data);
  return res.data;
};

export const modifierNomEquipe = async (equipeId, nouveauNom, medecinProprietaireId) => {
  const res = await api.put(`/api/equipes-medicales/${equipeId}/nom?nouveauNom=${encodeURIComponent(nouveauNom)}&medecinProprietaireId=${medecinProprietaireId}`);
  return res.data;
};

export const supprimerEquipe = async (equipeId, medecinProprietaireId) => {
  const res = await api.delete(`/api/equipes-medicales/${equipeId}?medecinProprietaireId=${medecinProprietaireId}`);
  return res.data;
};

export const ajouterMedecinEquipe = async (equipeId, medecinAajouterId, medecinProprietaireId) => {
  const res = await api.post(`/api/equipes-medicales/${equipeId}/medecins/${medecinAajouterId}?medecinProprietaireId=${medecinProprietaireId}`);
  return res.data;
};

export const retirerMedecinEquipe = async (equipeId, medecinAretirerId, medecinProprietaireId) => {
  const res = await api.delete(`/api/equipes-medicales/${equipeId}/medecins/${medecinAretirerId}?medecinProprietaireId=${medecinProprietaireId}`);
  return res.data;
};

/* ================================
   RENDEZ-VOUS
================================ */
export const getAllRendezVous = async () => {
  const res = await api.get('/api/rendezvous');
  return res.data;
};

export const getRendezVousByPatient = async (patientId) => {
  const res = await api.get(`/api/rendezvous/patient/${patientId}`);
  return res.data;
};

export const getRendezVousByMedecin = async (medecinId) => {
  const res = await api.get(`/api/rendezvous/medecin/${medecinId}`);
  return res.data;
};

export const creerRendezVous = async (data) => {
  const res = await api.post('/api/rendezvous', data);
  return res.data;
};

export const updateRendezVous = async (id, data) => {
  const res = await api.put(`/api/rendezvous/${id}`, data);
  return res.data;
};

export const updateStatutRendezVous = async (id, statut) => {
  const res = await api.patch(`/api/rendezvous/${id}/statut?statut=${statut}`);
  return res.data;
};

export const deleteRendezVous = async (id) => {
  const res = await api.delete(`/api/rendezvous/${id}`);
  return res.data;
};
