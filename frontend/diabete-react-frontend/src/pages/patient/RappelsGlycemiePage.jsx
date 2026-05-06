// src/pages/RappelsGlycemiePage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarPatient from "../../components/SidebarPatient";
import api from "../../services/api";
import "./RappelsGlycemiePage.css";

const MOMENTS = [
  {
    key: "rappelMatin",
    label: "Matin",
    icon: "bi-sunrise-fill",
    color: "#f59e0b",
    bg: "#fef3c7",
    description: "Avant ou après le petit-déjeuner",
  },
  {
    key: "rappelMidi",
    label: "Midi",
    icon: "bi-sun-fill",
    color: "#f97316",
    bg: "#ffedd5",
    description: "Avant ou après le déjeuner",
  },
  {
    key: "rappelSoir",
    label: "Soir",
    icon: "bi-moon-stars-fill",
    color: "#8b5cf6",
    bg: "#ede9fe",
    description: "Avant ou après le dîner",
  },
];

export default function RappelsGlycemiePage() {
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const [prefs, setPrefs] = useState({
    rappelMatin: "",
    rappelMidi: "",
    rappelSoir: "",
    alerteEmailActif: true,
    alerteSmsActif: false,
  });

  // Activer/désactiver chaque rappel
  const [enabled, setEnabled] = useState({
    rappelMatin: false,
    rappelMidi: false,
    rappelSoir: false,
  });

  // =====================================================
  // Chargement du patient et de ses préférences
  // =====================================================
  useEffect(() => {
    const load = async () => {
      try {
        const profileRes = await api.get("/api/auth/profile");
        const utilisateurId = profileRes.data.id;
        const patientRes = await api.get(
          `/api/patients/byUtilisateur/${utilisateurId}`,
        );
        const patientData = patientRes.data;
        setPatient(patientData);

        // Charger les préférences existantes
        try {
          const prefRes = await api.get(
            `/api/notification-preferences/patient/${patientData.id}`,
          );
          const data = prefRes.data;

          setPrefs({
            rappelMatin: data.rappelMatin || "",
            rappelMidi: data.rappelMidi || "",
            rappelSoir: data.rappelSoir || "",
            alerteEmailActif: data.alerteEmailActif ?? true,
            alerteSmsActif: data.alerteSmsActif ?? false,
          });

          setEnabled({
            rappelMatin: !!data.rappelMatin,
            rappelMidi: !!data.rappelMidi,
            rappelSoir: !!data.rappelSoir,
          });
        } catch {
          // Pas encore de préférences, on garde les valeurs par défaut
        }
      } catch (err) {
        console.error("Erreur chargement:", err);
        setError("Impossible de charger vos préférences.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // =====================================================
  // Sauvegarde
  // =====================================================
  const toBackendTime = (time) => {
    if (!time) return null;
    // Ajouter :00 si format HH:mm
    return time.length === 5 ? `${time}:00` : time;
  };

  const handleSave = async () => {
    if (!patient?.id) return;
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await api.post("/api/notification-preferences", {
        patientId: patient.id,
        rappelMatin: enabled.rappelMatin
          ? toBackendTime(prefs.rappelMatin)
          : null,
        rappelMidi: enabled.rappelMidi ? toBackendTime(prefs.rappelMidi) : null,
        rappelSoir: enabled.rappelSoir ? toBackendTime(prefs.rappelSoir) : null,
        alerteEmailActif: prefs.alerteEmailActif,
        alerteSmsActif: prefs.alerteSmsActif,
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Erreur sauvegarde:", err);
      setError("Une erreur est survenue lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (key) => {
    setEnabled((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTimeChange = (key, value) => {
    setPrefs((prev) => ({ ...prev, [key]: value }));
  };

  // =====================================================
  // Rendu
  // =====================================================
  return (
    <div className="rappels-wrapper">
      <SidebarPatient patient={patient} />

      <div className="rappels-content">
        {/* Header */}
        <div className="rappels-header">
          <div className="rappels-header-left">
            <button className="rappels-back-btn" onClick={() => navigate(-1)}>
              <i className="bi bi-arrow-left" />
            </button>
            <div>
              <h1 className="rappels-title">
                <i className="bi bi-alarm-fill me-2" />
                Rappels de mesure
              </h1>
              <p className="rappels-subtitle">
                Configurez vos rappels quotidiens pour mesurer votre glycémie
              </p>
            </div>
          </div>
        </div>

        <div className="rappels-body">
          {loading ? (
            <div className="rappels-loading">
              <div className="rappels-spinner" />
              <p>Chargement de vos préférences...</p>
            </div>
          ) : (
            <>
              {/* Info */}
              <div className="rappels-info-banner">
                <i className="bi bi-info-circle-fill" />
                <p>
                  Activez les rappels aux moments de la journée où vous
                  souhaitez être notifié pour mesurer votre glycémie. Vous
                  recevrez une notification par email à l'heure choisie.
                </p>
              </div>

              {/* Cartes rappels */}
              <div className="rappels-cards">
                {MOMENTS.map((moment) => (
                  <div
                    key={moment.key}
                    className={`rappel-card ${enabled[moment.key] ? "rappel-card--active" : ""}`}
                  >
                    {/* Icône + Label */}
                    <div className="rappel-card-header">
                      <div
                        className="rappel-icon"
                        style={{ background: moment.bg, color: moment.color }}
                      >
                        <i className={`bi ${moment.icon}`} />
                      </div>
                      <div className="rappel-info">
                        <h3 className="rappel-label">{moment.label}</h3>
                        <p className="rappel-desc">{moment.description}</p>
                      </div>
                      {/* Toggle */}
                      <label className="rappel-toggle">
                        <input
                          type="checkbox"
                          checked={enabled[moment.key]}
                          onChange={() => handleToggle(moment.key)}
                        />
                        <span className="rappel-toggle-slider" />
                      </label>
                    </div>

                    {/* Sélecteur d'heure */}
                    {enabled[moment.key] && (
                      <div className="rappel-time-section">
                        <label className="rappel-time-label">
                          <i className="bi bi-clock me-2" />
                          Heure du rappel
                        </label>
                        <input
                          type="time"
                          className="rappel-time-input"
                          value={prefs[moment.key]}
                          onChange={(e) =>
                            handleTimeChange(moment.key, e.target.value)
                          }
                        />
                        {prefs[moment.key] && (
                          <p className="rappel-time-preview">
                            Vous serez notifié à{" "}
                            <strong>
                              {prefs[moment.key].replace(":", "h")}
                            </strong>{" "}
                            chaque jour
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Canaux de notification */}
              <div className="rappels-canaux">
                <h3 className="rappels-section-title">
                  <i className="bi bi-send-fill me-2" />
                  Canaux de notification
                </h3>

                <div className="canal-item">
                  <div className="canal-info">
                    <div
                      className="canal-icon"
                      style={{ background: "#dbeafe", color: "#3b82f6" }}
                    >
                      <i className="bi bi-envelope-fill" />
                    </div>
                    <div>
                      <p className="canal-label">Email</p>
                      <p className="canal-desc">
                        Recevoir les rappels par email
                      </p>
                    </div>
                  </div>
                  <label className="rappel-toggle">
                    <input
                      type="checkbox"
                      checked={prefs.alerteEmailActif}
                      onChange={(e) =>
                        setPrefs((prev) => ({
                          ...prev,
                          alerteEmailActif: e.target.checked,
                        }))
                      }
                    />
                    <span className="rappel-toggle-slider" />
                  </label>
                </div>

                <div className="canal-item">
                  <div className="canal-info">
                    <div
                      className="canal-icon"
                      style={{ background: "#d1fae5", color: "#10b981" }}
                    >
                      <i className="bi bi-phone-fill" />
                    </div>
                    <div>
                      <p className="canal-label">SMS</p>
                      <p className="canal-desc">Recevoir les rappels par SMS</p>
                    </div>
                  </div>
                  <label className="rappel-toggle">
                    <input
                      type="checkbox"
                      checked={prefs.alerteSmsActif}
                      onChange={(e) =>
                        setPrefs((prev) => ({
                          ...prev,
                          alerteSmsActif: e.target.checked,
                        }))
                      }
                    />
                    <span className="rappel-toggle-slider" />
                  </label>
                </div>
              </div>

              {/* Messages feedback */}
              {error && (
                <div className="rappels-alert rappels-alert--error">
                  <i className="bi bi-exclamation-triangle-fill me-2" />
                  {error}
                </div>
              )}

              {success && (
                <div className="rappels-alert rappels-alert--success">
                  <i className="bi bi-check-circle-fill me-2" />
                  Vos préférences ont été enregistrées avec succès.
                </div>
              )}

              {/* Bouton sauvegarder */}
              <button
                className="rappels-save-btn"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="rappels-btn-spinner" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check2-all me-2" />
                    Enregistrer mes rappels
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
