// src/pages/patient/ChatPatient.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { API_BASE_URL } from "../../services/api";
import { Client } from "@stomp/stompjs";
import SidebarPatient from "../../components/SidebarPatient";
import AideModal from "../../components/AideModal";
import "./ChatPatient.css";

function ChatPatient() {
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [showAide, setShowAide] = useState(false);

  const messagesEndRef = useRef(null);
  const stompClientRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const patientRef = useRef(null);
  const conversationRef = useRef(null);

  // Garder les refs à jour pour les callbacks stables
  useEffect(() => {
    patientRef.current = patient;
  }, [patient]);
  useEffect(() => {
    conversationRef.current = conversation;
  }, [conversation]);

  const handleNewMessage = useCallback((newMessage) => {
    if (
      conversationRef.current &&
      newMessage.conversationId === conversationRef.current.id
    ) {
      setMessages((prev) => prev.some((message) => message.id === newMessage.id) ? prev : [...prev, newMessage]);
      api.post(`/api/messages/conversation/${newMessage.conversationId}/read`).catch(() => {});
    }
  }, []);

  const stopTyping = useCallback(() => {
    const p = patientRef.current;
    const c = conversationRef.current;
    if (!c || !stompClientRef.current?.connected) return;
    stompClientRef.current.publish({
      destination: "/app/chat.typing",
      body: JSON.stringify({
        conversationId: c.id,
        userId: p.id,
        userName: p.prenom,
        typing: false,
      }),
    });
  }, []);

  const connectWebSocket = useCallback(
    (patientData) => {
      if (!patientData) return;
      const client = new Client({
        brokerURL: `${API_BASE_URL.replace(/^http/, "ws")}/ws`,
        connectHeaders: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
        reconnectDelay: 3000,
        onConnect: () => {
            setIsConnected(true);
            client.subscribe(
              `/topic/patient/${patientData.id}/messages`,
              (message) => {
                handleNewMessage(JSON.parse(message.body));
              },
            );
            client.subscribe("/user/queue/acks", (frame) => handleNewMessage(JSON.parse(frame.body)));
            client.subscribe("/user/queue/errors", (frame) => window.alert(frame.body));
            stompClientRef.current = client;
          },
        onWebSocketClose: () => {
            setIsConnected(false);
          },
        onStompError: () => setIsConnected(false),
      });
      stompClientRef.current = client;
      client.activate();
    },
    [handleNewMessage],
  );

  const loadMessages = useCallback(async (conversationId) => {
    try {
      const response = await api.get(
        `/api/messages/conversation/${conversationId}?page=0&size=100`,
      );
      setMessages(response.data.content.reverse());
    } catch (error) {
      console.error("Erreur chargement messages:", error);
    }
  }, []);

  const loadConversation = useCallback(async (patientData) => {
    if (!patientData) return;
    try {
      setLoading(true);
      const response = await api.post(
        `/api/conversations/patient/${patientData.id}`,
      );
      setConversation(response.data);
    } catch (error) {
      console.error("Erreur chargement conversation:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Chargement initial du patient
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setLoading(true);
        const profileRes = await api.get("/api/auth/profile");
        const patientRes = await api.get(
          `/api/patients/byUtilisateur/${profileRes.data.id}`,
        );
        const patientData = patientRes.data;
        setPatient(patientData);

        if (!patientData.medecinId) {
          navigate("/patient/rattachement-medecin", { replace: true });
          return;
        }

        await loadConversation(patientData);
        connectWebSocket(patientData);
      } catch (error) {
        console.error("Erreur profil patient:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();

    return () => {
      if (stompClientRef.current) stompClientRef.current.deactivate();
    };
  }, [navigate, connectWebSocket, loadConversation]);

  // Charger messages quand conversation change
  useEffect(() => {
    if (conversation) {
      loadMessages(conversation.id);
    }
  }, [conversation, loadMessages]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleTyping = () => {
    const p = patientRef.current;
    const c = conversationRef.current;
    if (!c || !stompClientRef.current) return;
    stompClientRef.current.publish({
      destination: "/app/chat.typing",
      body: JSON.stringify({
        conversationId: c.id,
        userId: p.id,
        userName: p.prenom,
        typing: true,
      }),
    });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(stopTyping, 2000);
  };

  const sendMessage = async () => {
    if (!messageInput.trim()) return;
    const currentPatient = patientRef.current;
    let activeConversation = conversationRef.current;
    if (!currentPatient) return;
    if (!activeConversation) {
      try {
        const response = await api.post(`/api/conversations/patient/${currentPatient.id}`);
        activeConversation = response.data;
        conversationRef.current = activeConversation;
        setConversation(activeConversation);
      } catch (error) {
        console.error("Échec de création/récupération de la conversation patient:", error);
        const responseData = error.response?.data;
        const serverMessage = typeof responseData === "string"
          ? responseData
          : responseData?.message || responseData?.error;
        const reason = serverMessage
          || (error.response?.status === 401 ? "Votre session a expiré. Reconnectez-vous." : null)
          || (error.response?.status === 403 ? "Votre compte n’a pas accès à cette conversation." : null)
          || (error.response?.status ? `Le serveur a répondu avec le code ${error.response.status}.` : "Le service de communication est inaccessible.");
        window.alert(`Impossible d’ouvrir la conversation : ${reason}`);
        return;
      }
    }
    const message = {
      conversationId: activeConversation.id,
      senderId: currentPatient.id,
      senderType: "PATIENT",
      content: messageInput,
      messageType: "TEXT",
    };
    try {
      if (stompClientRef.current?.connected) {
        stompClientRef.current.publish({ destination: "/app/chat.send", body: JSON.stringify(message) });
      } else {
        const response = await api.post("/api/messages", message);
        handleNewMessage(response.data);
      }
      setMessageInput("");
      stopTyping();
    } catch (error) {
      window.alert(error.response?.data?.message || "Le message n’a pas pu être envoyé.");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !conversation) return;
    setUploadingFile(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("conversationId", conversation.id);
    formData.append("senderId", patient.id);
    formData.append("senderType", "PATIENT");
    formData.append("content", `Fichier partagé: ${file.name}`);
    try {
      const response = await api.post("/api/messages/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      handleNewMessage(response.data);
    } catch (error) {
      console.error("Erreur upload:", error);
    } finally {
      setUploadingFile(false);
      e.target.value = "";
    }
  };

  const downloadFile = async (url, filename) => {
    try {
      const response = await api.get(url, { responseType: "blob" });
      const objectUrl = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename || "piece-jointe";
      link.click();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      window.alert("Téléchargement impossible. Vérifiez votre accès à la conversation.");
    }
  };

  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      const diffInHours = (new Date() - date) / (1000 * 60 * 60);
      if (diffInHours < 24)
        return date.toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        });
      if (diffInHours < 48) return "Hier";
      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const isMyMessage = (msg) =>
    msg.senderId === patient?.id && msg.senderType === "PATIENT";

  if (loading)
    return (
      <div className="cp-wrapper">
        <SidebarPatient patient={null} onShowAide={() => setShowAide(true)} />
        <div className="cp-main">
          <div className="cp-loading">
            <div className="cp-spinner"></div>
            <p>Chargement de votre messagerie...</p>
          </div>
        </div>
      </div>
    );

  if (!patient?.medecinId) return null;

  return (
    <div className="cp-wrapper">
      <SidebarPatient patient={patient} onShowAide={() => setShowAide(true)} />

      <div className="cp-main">
        {/* Header */}
        <div className="cp-header">
          <div className="cp-header-left">
            <div className="cp-header-icon">
              <i className="bi bi-chat-heart-fill"></i>
            </div>
            <div>
              <div className="cp-header-tag">MESSAGERIE</div>
              <h1 className="cp-header-title">Équipe soignante</h1>
              <div className="cp-header-status">
                <span
                  className={`cp-status-dot ${isConnected ? "online" : "offline"}`}
                ></span>
                <span>
                  {isConnected ? "Connecté en temps réel" : "Hors ligne"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Zone chat */}
        <div className="cp-chat-wrapper">
          {/* Messages */}
          <div className="cp-messages">
            {messages.length === 0 ? (
              <div className="cp-empty">
                <div className="cp-empty-icon">
                  <i className="bi bi-chat-dots"></i>
                </div>
                <h5>Aucun message</h5>
                <p>
                  Envoyez un message à votre équipe médicale pour commencer la
                  discussion.
                </p>
              </div>
            ) : (
              messages.map((msg, index) => {
                const mine = isMyMessage(msg);
                return (
                  <div
                    key={msg.id || index}
                    className={`cp-msg ${mine ? "cp-msg-out" : "cp-msg-in"}`}
                  >
                    {!mine && (
                      <div className="cp-msg-avatar">
                        <i className="bi bi-person-fill"></i>
                      </div>
                    )}
                    <div className="cp-msg-content">
                      {!mine && (
                        <div className="cp-msg-sender">{msg.senderName}</div>
                      )}

                      {msg.messageType === "TEXT" ? (
                        <div
                          className={`cp-msg-bubble ${mine ? "cp-bubble-out" : "cp-bubble-in"}`}
                        >
                          {msg.content}
                        </div>
                      ) : (
                        <div className="cp-msg-file">
                          <div className="cp-file-icon">
                            <i className="bi bi-file-earmark-text-fill"></i>
                          </div>
                          <div className="cp-file-info">
                            <div className="cp-file-name">{msg.fileName}</div>
                            <div className="cp-file-size">
                              {(msg.fileSize / 1024).toFixed(1)} KB
                            </div>
                          </div>
                          <a
                            href={msg.fileUrl}
                            onClick={(event) => { event.preventDefault(); downloadFile(msg.fileUrl, msg.fileName); }}
                            className="cp-file-download"
                          >
                            <i className="bi bi-download"></i>
                          </a>
                        </div>
                      )}

                      <div
                        className={`cp-msg-time ${mine ? "cp-time-out" : ""}`}
                      >
                        {formatTime(msg.createdAt)}
                        {mine && (
                          <i className="bi bi-check2-all ms-1 text-success"></i>
                        )}
                      </div>
                    </div>
                    {mine && (
                      <div className="cp-msg-avatar cp-msg-avatar-me">
                        <i className="bi bi-person-fill"></i>
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Zone saisie */}
          <div className="cp-input-area">
            <div className="cp-secure-note">
              <i className="bi bi-shield-check me-1"></i>
              Messages sécurisés et confidentiels
            </div>

            <Form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
            >
              <div className="cp-input-row">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                <button
                  type="button"
                  className="cp-attach-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingFile}
                  title="Joindre un fichier"
                >
                  {uploadingFile ? (
                    <span className="cp-mini-spinner"></span>
                  ) : (
                    <i className="bi bi-paperclip"></i>
                  )}
                </button>

                <input
                  type="text"
                  className="cp-input"
                  placeholder="Écrivez votre message..."
                  value={messageInput}
                  onChange={(e) => {
                    setMessageInput(e.target.value);
                    handleTyping();
                  }}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                />

                <button
                  type="submit"
                  className="cp-send-btn"
                  disabled={
                    !messageInput.trim()
                  }
                >
                  <i className="bi bi-send-fill"></i>
                </button>
              </div>
            </Form>
          </div>
        </div>
      </div>

      <AideModal show={showAide} onHide={() => setShowAide(false)} />
    </div>
  );
}

export default ChatPatient;
