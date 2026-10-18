// src/pages/medecin/ChatMedecin.jsx
import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col } from "react-bootstrap";
import TopbarMedecin from "../../components/TopbarMedecin";
import api from "../../services/api";
import { API_BASE_URL } from "../../services/api";
import { Client } from "@stomp/stompjs";
import "./ChatMedecin.css";

function ChatMedecin() {
  const [medecin, setMedecin] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [patients, setPatients] = useState([]);
  const [medecins, setMedecins] = useState([]);
  const [userType, setUserType] = useState("patient");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [creatingConversation, setCreatingConversation] = useState(false);
  const [conversationError, setConversationError] = useState("");
  const [usersError, setUsersError] = useState("");
  const [usersLoading, setUsersLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const stompClientRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const selectedConversationRef = useRef(null);
  const messageRequestRef = useRef(0);

  useEffect(() => { selectedConversationRef.current = selectedConversation; }, [selectedConversation]);

  useEffect(() => {
    const fetchMedecin = async () => {
      try {
        const profileRes = await api.get("/api/auth/profile");
        const medRes = await api.get(
          `/api/medecins/byUtilisateur/${profileRes.data.id}`,
        );
        setMedecin(medRes.data);
      } catch (error) {
        console.error("❌ Erreur profil médecin:", error);
      }
    };
    fetchMedecin();
  }, []);

  useEffect(() => {
    if (medecin) {
      loadConversations();
      loadUsers();
      connectWebSocket();
    }
    return () => {
      if (stompClientRef.current) stompClientRef.current.deactivate();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medecin]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  useEffect(() => {
    if (selectedConversation) loadMessages(selectedConversation.id);
  }, [selectedConversation]);

  const connectWebSocket = () => {
    if (!medecin) return;
    const client = new Client({
      brokerURL: `${API_BASE_URL.replace(/^http/, "ws")}/ws`,
      connectHeaders: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
      reconnectDelay: 3000,
      debug: () => {},
      onConnect: () => {
          setIsConnected(true);
          client.subscribe(
            `/topic/medecin/${medecin.id}/messages`,
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
  };

  const loadConversations = async () => {
    if (!medecin) return;
    try {
      setLoading(true);
      const response = await api.get(
        `/api/conversations/medecin/${medecin.id}`,
      );
      setConversations(response.data);
    } catch (error) {
      console.error("❌ Erreur chargement conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const requestId = ++messageRequestRef.current;
      setMessages([]);
      const response = await api.get(
        `/api/messages/conversation/${conversationId}?page=0&size=100`,
      );
      if (requestId === messageRequestRef.current) setMessages(response.data.content.reverse());
    } catch (error) {
      console.error("❌ Erreur chargement messages:", error);
    }
  };

  const handleNewMessage = (newMessage) => {
    if (
      selectedConversationRef.current &&
      newMessage.conversationId === selectedConversationRef.current.id
    ) {
      setMessages((prev) => {
        if (prev.some((msg) => msg.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
      api.post(`/api/messages/conversation/${newMessage.conversationId}/read`).catch(() => {});
    }
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === newMessage.conversationId
          ? {
              ...conv,
              lastMessage: newMessage,
              lastMessageAt: newMessage.createdAt,
            }
          : conv,
      ),
    );
  };

  const sendMessage = async () => {
    if (!selectedConversation) return;
    try {
      if (selectedFiles.length > 0) await sendFiles();
      if (messageInput.trim()) {
        const message = {
          conversationId: selectedConversation.id,
          senderId: medecin.id,
          senderType: "MEDECIN",
          content: messageInput,
          messageType: "TEXT",
        };
        if (stompClientRef.current?.connected) {
          stompClientRef.current.publish({ destination: "/app/chat.send", body: JSON.stringify(message) });
        } else {
          const response = await api.post("/api/messages", message);
          handleNewMessage(response.data);
        }
        setMessageInput("");
      }
      stopTyping();
    } catch (error) {
      console.error("❌ Erreur envoi message:", error);
      window.alert(error.response?.data?.message || "Le message n’a pas pu être envoyé.");
    }
  };

  const handleTyping = () => {
    if (!selectedConversation || !stompClientRef.current?.connected) return;
    stompClientRef.current.publish({
      destination: "/app/chat.typing",
      body: JSON.stringify({
        conversationId: selectedConversation.id,
        userId: medecin.id,
        userName: `Dr. ${medecin.prenom}`,
        typing: true,
      }),
    });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(stopTyping, 2000);
  };

  const stopTyping = () => {
    if (!selectedConversation || !stompClientRef.current?.connected) return;
    stompClientRef.current.publish({
      destination: "/app/chat.typing",
      body: JSON.stringify({
        conversationId: selectedConversation.id,
        userId: medecin.id,
        userName: `Dr. ${medecin.prenom}`,
        typing: false,
      }),
    });
  };

  const handleFileSelect = (e) => {
    setSelectedFiles((prev) => [...prev, ...Array.from(e.target.files)]);
    e.target.value = "";
  };

  const removeFile = (index) =>
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));

  const sendFiles = async () => {
    if (selectedFiles.length === 0) return;
    setUploadingFile(true);
    try {
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("conversationId", selectedConversation.id);
        formData.append("senderId", medecin.id);
        formData.append("senderType", "MEDECIN");
        formData.append("content", `Fichier partagé: ${file.name}`);
        const response = await api.post("/api/messages/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        handleNewMessage(response.data);
      }
      setSelectedFiles([]);
    } catch (error) {
      console.error("❌ Erreur upload:", error);
    } finally {
      setUploadingFile(false);
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

  const getConversationTitle = (conv) =>
    conv.type === "PATIENT_EQUIPE"
      ? conv.patientName || "Patient"
      : conv.otherMedecinName || "Médecin";

  const getConversationSubtitle = (conv) => {
    if (!conv.lastMessage)
      return conv.type === "PATIENT_EQUIPE"
        ? "Aucun message"
        : "Conversation privée";
    const content = conv.lastMessage.content || "";
    const truncated =
      content.length > 30 ? content.substring(0, 30) + "..." : content;
    return conv.lastMessage.senderName
      ? `${conv.lastMessage.senderName}: ${truncated}`
      : truncated;
  };

  const filteredConversations = conversations.filter((conv) =>
    getConversationTitle(conv).toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatMessageTime = (dateString) => {
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

  const isMyMessage = (message) =>
    message.senderId === medecin?.id && message.senderType === "MEDECIN";

  const loadUsers = async () => {
    if (!medecin?.id) return;
    setUsersLoading(true);
    setUsersError("");
    const [patientsResult, medecinsResult] = await Promise.allSettled([
      api.get(`/api/patients/medecin/${medecin.id}/visibles`),
      api.get("/api/medecins"),
    ]);
    const errors = [];
    if (patientsResult.status === "fulfilled") {
      setPatients(Array.isArray(patientsResult.value.data) ? patientsResult.value.data : []);
    } else {
      console.error("❌ Erreur chargement patients:", patientsResult.reason);
      setPatients([]);
      errors.push("patients");
    }
    if (medecinsResult.status === "fulfilled") {
      const list = Array.isArray(medecinsResult.value.data) ? medecinsResult.value.data : [];
      setMedecins(list.filter((m) => m.id !== medecin.id));
    } else {
      console.error("❌ Erreur chargement médecins:", medecinsResult.reason);
      setMedecins([]);
      errors.push("médecins");
    }
    if (errors.length) {
      setUsersError(`Impossible de charger ${errors.join(" et ")}. Vérifiez que les services Patient, Médecin et le gateway sont démarrés, puis actualisez la fenêtre.`);
    }
    setUsersLoading(false);
  };

  const createConversationWithUser = async (user, type) => {
    if (!user?.id || creatingConversation) return;
    setCreatingConversation(true);
    setConversationError("");
    try {
      let res;

      if (type === "patient") {
        res = await api.post(`/api/conversations/patient/${user.id}`, {
          medecinId: medecin.id,
        });
      } else {
        res = await api.post("/api/conversations/medecin-to-medecin", {
          requestingMedecinId: medecin.id,
          targetMedecinId: user.id,
        });
      }

      const createdId = res.data.id;
      const fallback = {
        ...res.data,
        patientName: type === "patient" ? `${user.prenom} ${user.nom}` : null,
        otherMedecinName:
          type === "medecin" ? `Dr. ${user.prenom} ${user.nom}` : null,
      };
      setSelectedConversation(fallback);
      setConversations((prev) => [fallback, ...prev.filter((c) => c.id !== createdId)]);
      setShowNewConversation(false);

      // ✅ Recharger la liste enrichie (avec patientName, otherMedecinName)
      try {
        const conversationsRes = await api.get(`/api/conversations/medecin/${medecin.id}`);
        const updatedList = conversationsRes.data;
        setConversations(updatedList);
        const enriched = updatedList.find((c) => c.id === createdId);
        if (enriched) setSelectedConversation(enriched);
      } catch (refreshError) {
        // La création a réussi : garder la conversation ouverte même si le rafraîchissement échoue.
        console.warn("Conversation créée, liste non actualisée:", refreshError);
      }
    } catch (error) {
      console.error("❌ Erreur création conversation:", error);
      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Data:", error.response.data);
      }
      setConversationError(
        error.response?.data?.message ||
        error.response?.data?.error ||
        (error.response?.status === 403
          ? "Vous n'avez pas accès à cet utilisateur. Vérifiez qu'il appartient à votre équipe."
          : "Impossible d'ouvrir la conversation. Vérifiez la connexion aux services puis réessayez."),
      );
    } finally {
      setCreatingConversation(false);
    }
  };
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`chat-medecin-container${selectedConversation ? " has-selected-conversation" : ""}`}>
      <TopbarMedecin user={medecin} />

      <div className="chat-content">
        <Container fluid className="h-100 p-0">
          <Row className="h-100 g-0">
            {/* ===== SIDEBAR ===== */}
            <Col md={4} lg={3} className="chat-sidebar">
              {/* Header sidebar */}
              <div className="chat-sidebar-header">
                <div className="sidebar-top-row">
                  <h5 className="sidebar-title-med">Messagerie</h5>
                  <button
                    className="btn-new-chat-med"
                    onClick={() => setShowNewConversation(true)}
                    title="Nouvelle conversation"
                  >
                    <i className="bi bi-pencil-square"></i>
                  </button>
                </div>

                {/* Statut + recherche */}
                <div className="sidebar-search-row">
                  <div className="ws-indicator">
                    <span
                      className={`ws-dot-med ${isConnected ? "online" : "offline"}`}
                    ></span>
                    <span className="ws-label-med">
                      {isConnected ? "En ligne" : "Hors ligne"}
                    </span>
                  </div>
                </div>
                <div className="search-field-wrapper">
                  <i className="bi bi-search search-field-icon"></i>
                  <input
                    type="text"
                    placeholder="Rechercher une conversation..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-field-med"
                  />
                </div>
              </div>

              {/* Liste conversations */}
              <div className="conv-list-med">
                {loading ? (
                  <div className="conv-loading">
                    <div className="spinner-border text-purple" role="status">
                      <span className="visually-hidden">Chargement...</span>
                    </div>
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="conv-empty">
                    <i className="bi bi-inbox"></i>
                    <p className="fw-bold mb-1">Aucune conversation</p>
                    <p className="small">Cliquez sur ✏️ pour commencer</p>
                  </div>
                ) : (
                  filteredConversations.map((conv) => (
                    <div
                      key={conv.id}
                      className={`conv-item-med ${selectedConversation?.id === conv.id ? "active" : ""}`}
                      onClick={() => setSelectedConversation(conv)}
                    >
                      <div className="conv-avatar-med">
                        {getInitials(getConversationTitle(conv))}
                        <span
                          className={`conv-type-dot ${conv.type === "PATIENT_EQUIPE" ? "patient" : "medecin"}`}
                        ></span>
                      </div>
                      <div className="conv-details">
                        <div className="conv-title-row">
                          <span className="conv-title-med">
                            {getConversationTitle(conv)}
                          </span>
                          <span className="conv-time-med">
                            {conv.lastMessageAt &&
                              formatMessageTime(conv.lastMessageAt)}
                          </span>
                        </div>
                        <div className="conv-last-msg">
                          {getConversationSubtitle(conv)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Col>

            {/* ===== ZONE CHAT ===== */}
            <Col md={8} lg={9} className="chat-main-med">
              {!selectedConversation ? (
                <div className="chat-empty-med">
                  <div className="chat-empty-icon-wrap">
                    <i className="bi bi-chat-dots-fill"></i>
                  </div>
                  <h5>Sélectionnez une conversation</h5>
                  <p>Choisissez un patient ou un collègue médecin</p>
                  <button
                    className="btn-start-chat"
                    onClick={() => setShowNewConversation(true)}
                  >
                    <i className="bi bi-plus-circle me-2"></i>
                    Nouvelle conversation
                  </button>
                </div>
              ) : (
                <>
                  {/* Header chat */}
                  <div className="chat-header-med">
                    <div className="chat-header-left">
                      <button
                        type="button"
                        className="chat-back-button-med"
                        onClick={() => setSelectedConversation(null)}
                        aria-label="Retour à la liste des conversations"
                        title="Retour aux conversations"
                      >
                        <i className="bi bi-arrow-left"></i>
                      </button>
                      <div className="chat-header-avatar-med">
                        {getInitials(
                          getConversationTitle(selectedConversation),
                        )}
                      </div>
                      <div className="chat-header-info-med">
                        <div className="chat-header-name-med">
                          {getConversationTitle(selectedConversation)}
                        </div>
                        <div className="chat-header-sub-med">
                          <span
                            className={`type-pill ${selectedConversation.type === "PATIENT_EQUIPE" ? "patient" : "medecin"}`}
                          >
                            {selectedConversation.type === "PATIENT_EQUIPE"
                              ? "Patient"
                              : "Médecin"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="chat-header-actions-med">
                      <button className="chat-hdr-btn" title="Informations">
                        <i className="bi bi-info-circle"></i>
                      </button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="messages-area-med">
                    {messages.length === 0 && (
                      <div className="no-msg-state">
                        <i
                          className="bi bi-chat-heart"
                          style={{ fontSize: "3rem", color: "#d4aaff" }}
                        ></i>
                        <p>Commencez la conversation !</p>
                      </div>
                    )}
                    {messages.map((message, index) => (
                      <div
                        key={message.id || index}
                        className={`msg-row ${isMyMessage(message) ? "msg-sent" : "msg-received"}`}
                      >
                        {!isMyMessage(message) && (
                          <div className="msg-avatar-med">
                            {getInitials(message.senderName)}
                          </div>
                        )}
                        <div className="msg-content-wrap">
                          {!isMyMessage(message) && (
                            <div className="msg-sender-name">
                              {message.senderName}
                            </div>
                          )}
                          <div
                            className={`msg-bubble ${isMyMessage(message) ? "bubble-sent-med" : "bubble-received-med"}`}
                          >
                            {message.messageType === "TEXT" ? (
                              <div className="msg-text">{message.content}</div>
                            ) : (
                              <div className="msg-file-block">
                                <i className="bi bi-file-earmark-fill me-2"></i>
                                <div className="flex-grow-1">
                                  <div className="fw-bold">
                                    {message.fileName}
                                  </div>
                                  <small>
                                    {(message.fileSize / 1024).toFixed(1)} KB
                                  </small>
                                </div>
                                <a
                                  href={message.fileUrl}
                                  onClick={(event) => { event.preventDefault(); downloadFile(message.fileUrl, message.fileName); }}
                                  className="btn-dl-file"
                                >
                                  <i className="bi bi-download"></i>
                                </a>
                              </div>
                            )}
                            <div
                              className={`msg-time ${isMyMessage(message) ? "time-sent" : "time-received"}`}
                            >
                              <i className="bi bi-clock me-1"></i>
                              {formatMessageTime(message.createdAt)}
                              {isMyMessage(message) && (
                                <i className="bi bi-check2-all ms-1"></i>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Zone saisie */}
                  <div className="input-area-med">
                    {selectedFiles.length > 0 && (
                      <div className="selected-files-preview">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="file-chip">
                            <i className="bi bi-file-earmark me-2"></i>
                            <span className="file-chip-name">{file.name}</span>
                            <button
                              className="file-chip-remove"
                              onClick={() => removeFile(index)}
                            >
                              <i className="bi bi-x"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="input-row-med">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        style={{ display: "none" }}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        multiple
                      />
                      <button
                        className="input-action-med"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingFile}
                        title="Joindre un fichier"
                      >
                        <i className="bi bi-paperclip"></i>
                      </button>

                      <input
                        type="text"
                        placeholder="Tapez votre message..."
                        value={messageInput}
                        onChange={(e) => {
                          setMessageInput(e.target.value);
                          handleTyping();
                        }}
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                        className="msg-input-med"
                      />

                      <button
                        className={`${(messageInput.trim() || selectedFiles.length > 0) ? "btn-send-med active" : "btn-send-med disabled"}`}
                        onClick={sendMessage}
                        disabled={
                          (!messageInput.trim() &&
                            selectedFiles.length === 0) ||
                          uploadingFile
                        }
                      >
                        {uploadingFile ? (
                          <span className="spinner-border spinner-border-sm"></span>
                        ) : (
                          <i className="bi bi-send-fill"></i>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </Col>
          </Row>
        </Container>
      </div>

      {/* ===== MODAL NOUVELLE CONVERSATION ===== */}
      {showNewConversation && (
        <div
          className="modal-overlay-med"
          onClick={() => setShowNewConversation(false)}
        >
          <div className="modal-box-med" onClick={(e) => e.stopPropagation()}>
            <div className="modal-hdr-med">
              <div className="modal-hdr-title">
                <i className="bi bi-chat-plus-fill me-2"></i>
                Nouvelle conversation
              </div>
              <button
                className="modal-close-med"
                onClick={() => setShowNewConversation(false)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="modal-bdy-med">
              {conversationError && (
                <div className="alert alert-danger py-2" role="alert">
                  {conversationError}
                </div>
              )}
              {creatingConversation && (
                <div className="text-center small text-muted mb-2" role="status">
                  <span className="spinner-border spinner-border-sm me-2" />Ouverture de la conversation…
                </div>
              )}
              {usersError && (
                <div className="alert alert-warning py-2" role="alert">
                  {usersError}
                  <button className="btn btn-sm btn-link p-0 ms-2" type="button" onClick={loadUsers} disabled={usersLoading}>
                    Réessayer
                  </button>
                </div>
              )}
              {usersLoading && <div className="text-center small text-muted mb-2" role="status">Chargement des utilisateurs…</div>}
              <div className="type-selector-med">
                <button
                  className={`type-pill-btn ${userType === "patient" ? "active" : ""}`}
                  onClick={() => setUserType("patient")}
                >
                  <i className="bi bi-person-fill me-2"></i>Patients
                </button>
                <button
                  className={`type-pill-btn ${userType === "medecin" ? "active" : ""}`}
                  onClick={() => setUserType("medecin")}
                >
                  <i className="bi bi-person-badge me-2"></i>Médecins
                </button>
              </div>

              <div className="users-list-med">
                {userType === "patient" ? (
                  patients.length === 0 ? (
                    <p className="text-muted text-center py-4">
                      Aucun patient disponible
                    </p>
                  ) : (
                    patients.map((patient) => (
                      <button
                        key={patient.id}
                        className="user-item-med"
                        type="button"
                        disabled={creatingConversation}
                        onClick={() => createConversationWithUser(patient, "patient")}
                      >
                        <div className="user-avatar-med patient">
                          {getInitials(`${patient.prenom} ${patient.nom}`)}
                        </div>
                        <div className="user-info-med">
                          <div className="user-name-med">
                            {patient.prenom} {patient.nom}
                          </div>
                          <small>Dossier : {patient.numeroDossier}</small>
                        </div>
                        <i className="bi bi-chevron-right user-chevron"></i>
                      </button>
                    ))
                  )
                ) : medecins.length === 0 ? (
                  <p className="text-muted text-center py-4">
                    Aucun médecin disponible
                  </p>
                ) : (
                  medecins.map((med) => (
                    <button
                      key={med.id}
                      className="user-item-med"
                      type="button"
                      disabled={creatingConversation}
                      onClick={() => createConversationWithUser(med, "medecin")}
                    >
                      <div className="user-avatar-med medecin">
                        {getInitials(`${med.prenom} ${med.nom}`)}
                      </div>
                      <div className="user-info-med">
                        <div className="user-name-med">
                          Dr. {med.prenom} {med.nom}
                        </div>
                        <small>{med.specialite || "Médecin"}</small>
                      </div>
                      <i className="bi bi-chevron-right user-chevron"></i>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatMedecin;
