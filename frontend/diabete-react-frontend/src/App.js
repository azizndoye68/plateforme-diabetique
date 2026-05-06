// src/App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import RegisterPatientForm from './components/RegisterPatientForm';
import RegisterMedecinForm from './components/RegisterMedecinForm';
import RegisterChoice from './components/RegisterChoice';
import DashboardPatient from './components/DashboardPatient';
import AjouterDonneesJournee from './pages/patient/AjouterDonneesJournee';
import CarnetGlycemie from './pages/patient/CarnetGlycemie';
import DashboardMedecin from './pages/medecin/DashboardMedecin';
import DashboardAdmin from './pages/admin/DashboardAdmin';
import PatientsTable from './pages/medecin/PatientsTable';
import PatientDossier from './pages/medecin/PatientDossier';
import MonSuivi from './pages/patient/MonSuivi';
import CodeCouleur from './pages/patient/CodeCouleur';
import EducationPatient from './pages/patient/EducationPatient';
import ConsultationsMedecin from './pages/medecin/ConsultationsMedecin';
import TraitementMedecin from './pages/medecin/TraitementMedecin';
import ChatMedecin from './pages/medecin/ChatMedecin';
import ChatPatient from './pages/patient/ChatPatient';
import StatistiquesMedecin from './pages/medecin/StatistiquesMedecin';
import RendezVousMedecin from './pages/medecin/RendezVousMedecin';
import ListeRendezVousMedecin from './pages/medecin/ListeRendezVousMedecin';
import EquipesMedicales from './pages/medecin/EquipesMedicales';
import RattachementMedecin from './pages/patient/RattachementMedecin';
import ProfilMedecin from './pages/medecin/ProfilMedecin';
import ProfilPatient from './pages/patient/ProfilPatient';
import TraitementPatient from './pages/patient/TraitementPatient';
import RendezVousPatient from './pages/patient/RendezVousPatient';
import AdminPatientsPage from './pages/admin/AdminPatientsPage';
import AdminMedecinsPage from './pages/admin/AdminMedecinsPage';
import AdminAttentePage from './pages/admin/AdminAttentePage';
import Education from './pages/admin/Education';
import AdminStatistiquesPage from './pages/admin/AdminStatistiquesPage';
import Conseils from './pages/medecin/Conseils';
import MesConseils from './pages/patient/MesConseils';
import Statistiques from './pages/patient/Statistiques';
import NotificationsPage from './pages/patient/NotificationsPage';
import NotificationsMedecinPage from './pages/medecin/NotificationsMedecinPage';
import RappelsGlycemiePage from './pages/patient/RappelsGlycemiePage';
import ProfilAdmin from './pages/admin/ProfilAdmin';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register/patient" element={<RegisterPatientForm />} />
        <Route path="/register/medecin" element={<RegisterMedecinForm />} />
        <Route path="/register/choice" element={<RegisterChoice />} />
        <Route path="/dashboard-patient" element={<DashboardPatient />} />
        <Route path="/dashboard-medecin" element={<DashboardMedecin />} />
        <Route path="/dashboard-admin" element={<DashboardAdmin />} />
        <Route path="/ajouter-donnees" element={<AjouterDonneesJournee />} />
        <Route path="/carnet" element={<CarnetGlycemie />} />
        <Route path="/medecin/patients-table" element={<PatientsTable />} />
        <Route path="/patient/:id/dossier" element={<PatientDossier />} />
        <Route path="/mon-suivi" element={<MonSuivi />} />
        <Route path="/codes-couleurs" element={<CodeCouleur />} />
        <Route path="/patient/education" element={<EducationPatient />} />
        <Route path="/medecin/consultations" element={<ConsultationsMedecin />} />
        <Route path="/medecin/traitements" element={<TraitementMedecin />} />
        <Route path="/medecin/messagerie" element={<ChatMedecin />} />
        <Route path="/patient/messagerie" element={<ChatPatient />} />
        <Route path="/medecin/statistiques" element={<StatistiquesMedecin />} />
        <Route path="/medecin/liste-rendezvous" element={<ListeRendezVousMedecin />} />
        <Route path="/medecin/equipes-medicales" element={<EquipesMedicales />} />
        <Route path="/patient/rattachement-medecin" element={<RattachementMedecin />} />
        <Route path="/medecin/profil" element={<ProfilMedecin />} />
        <Route path="/patient/profil" element={<ProfilPatient />} />
        <Route path="/patient/traitement" element={<TraitementPatient />} />
        <Route path="/patient/rendez-vous" element={<RendezVousPatient />} />
        <Route path="/admin/patients" element={<AdminPatientsPage />} />
        <Route path="/admin/medecins" element={<AdminMedecinsPage />} />
        <Route path="/admin/attente" element={<AdminAttentePage />} />
        <Route path="/admin/education" element={<Education />} />
        <Route path="/admin/statistiques" element={<AdminStatistiquesPage />} />
        <Route path="/patient/mesconseils" element={<MesConseils />} />
        <Route path="/patient/statistiques" element={<Statistiques />} />
        <Route path="/patient/notifications" element={<NotificationsPage />} />
        <Route path="/medecin/notifications" element={<NotificationsMedecinPage />} />
        <Route path="/patient/rappels-glycemie" element={<RappelsGlycemiePage />} />
        <Route path="/admin/profil" element={<ProfilAdmin />} />


        {/* Routes pour le médecin avec patientId */}
        <Route path="/medecin/patient/:patientId/dashboard" element={<DashboardPatient />} />
        <Route path="/medecin/patient/:patientId/ajouter-donnees" element={<AjouterDonneesJournee />} />
        <Route path="/medecin/patient/:patientId/carnet" element={<CarnetGlycemie />} />
        <Route path="/medecin/patient/:patientId/statistiques" element={<Statistiques />} />
        <Route path="/medecin/patient/:patientId/mon-suivi" element={<MonSuivi />} />
        <Route path="/medecin/patient/:patientId/education" element={<EducationPatient />} />
        <Route path="/medecin/patient/:patientId/codes-couleurs" element={<CodeCouleur />} />
        <Route path="/medecin/patient/:patientId/dossier" element={<PatientDossier />} />
        <Route path="/medecin/patient/:patientId/statistiques" element={<Statistiques />} />
        <Route path="/medecin/patient/:patientId/education" element={<EducationPatient />} />
        <Route path="/medecin/patient/:patientId/consultations" element={<ConsultationsMedecin />} />
        <Route path="/medecin/patient/:patientId/traitements" element={<TraitementMedecin />} />
        <Route path="/medecin/patient/:patientId/rendez-vous" element={<RendezVousMedecin />} />
        <Route path="/medecin/patient/:patientId/traitement" element={<TraitementPatient />} />
        <Route path="/medecin/patient/:patientId/rendez-vous" element={<RendezVousPatient />} />
        <Route path="/medecin/patient/:patientId/conseils" element={<Conseils />} />
        <Route path="/medecin/patient/:patientId/mesconseils" element={<MesConseils />} />
        <Route path="/medecin/patient/:patientId/statistiques" element={<Statistiques />} />
        <Route path="/medecin/patient/:patientId/rappels-glycemie" element={<RappelsGlycemiePage />} />




        {/* Ajoute d'autres routes ici si nécessaire */}
      </Routes>
    </Router>
  );
}

export default App;
