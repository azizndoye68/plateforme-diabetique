// src/hooks/useNotifications.js
import { useState, useEffect, useCallback } from "react";
import api from "../services/api";

const POLL_INTERVAL = 30000;

export function useNotifications(patientId, role = "patient") {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const basePath =
    role === "medecin"
      ? `/api/notification-history/medecin/${patientId}`
      : `/api/notification-history/patient/${patientId}`;

  const countPath =
    role === "medecin"
      ? `/api/notification-history/medecin/${patientId}/non-lues/count`
      : `/api/notification-history/patient/${patientId}/non-lues/count`;

  const markAllPath =
    role === "medecin"
      ? `/api/notification-history/medecin/${patientId}/mark-all-read`
      : `/api/notification-history/patient/${patientId}/mark-all-read`;

  // Compteur non lues (polling léger)
  const fetchUnreadCount = useCallback(async () => {
    if (!patientId) return;
    try {
      const res = await api.get(countPath);
      setUnreadCount(res.data.count);
    } catch (err) {
      console.error("Erreur comptage notifications:", err);
    }
  }, [patientId, countPath]);

  // Toutes les notifications — tri côté frontend, pas d'endpoint /ordered
  const fetchNotifications = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    try {
      const res = await api.get(basePath);
      const sorted = [...res.data].sort(
        (a, b) => new Date(b.dateEnvoi) - new Date(a.dateEnvoi)
      );
      setNotifications(sorted);
    } catch (err) {
      console.error("Erreur récupération notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [patientId, basePath]);

  const markAsRead = useCallback(async (notifId) => {
    try {
      await api.put(`/api/notification-history/${notifId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, statut: "LU" } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Erreur markAsRead:", err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await api.put(markAllPath);
      setNotifications((prev) => prev.map((n) => ({ ...n, statut: "LU" })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Erreur markAllAsRead:", err);
    }
  }, [markAllPath]);

  // Polling toutes les 30s
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
}