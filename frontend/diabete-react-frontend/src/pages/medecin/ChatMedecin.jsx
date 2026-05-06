// src/pages/medecin/ChatMedecin.jsx
import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col } from "react-bootstrap";
import TopbarMedecin from "../../components/TopbarMedecin";
import api from "../../services/api";
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

  const messagesEndRef = useRef(null);
  const stompClientRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

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
      if (stompClientRef.current) stompClientRef.current.disconnect();
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
    const initWebSocket = () => {
      if (!window.SockJS || !window.Stomp) {
        setTimeout(initWebSocket, 100);
        return;
      }
      const socket = new WebSocket("ws://localhost:8080/ws");
      const client = window.Stomp.over(socket);
      client.debug = () => {};
      client.connect(
        {},
        () => {
          setIsConnected(true);
          client.subscribe(
            `/topic/medecin/${medecin.id}/messages`,
            (message) => {
              handleNewMessage(JSON.parse(message.body));
            },
          );
          stompClientRef.current = client;
        },
        () => {
          setIsConnected(false);
          setTimeout(connectWebSocket, 3000);
        },
      );
    };
    initWebSocket();
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
      const response = await api.get(
        `/api/messages/conversation/${conversationId}?page=0&size=100`,
      );
      setMessages(response.data.content.reverse());
    } catch (error) {
      console.error("❌ Erreur chargement messages:", error);
    }
  };

  const handleNewMessage = (newMessage) => {
    if (
      selectedConversation &&
      newMessage.conversationId === selectedConversation.id
    ) {
      setMessages((prev) => {
        if (prev.some((msg) => msg.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
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
    if (!selectedConversation || !stompClientRef.current) return;
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
        stompClientRef.current.send(
          "/app/chat.send",
          {},
          JSON.stringify(message),
        );
        setMessages((prev) => [
          ...prev,
          {
            ...message,
            id: Date.now(),
            senderName: `Dr. ${medecin.prenom} ${medecin.nom}`,
            createdAt: new Date().toISOString(),
          },
        ]);
        setMessageInput("");
      }
      stopTyping();
    } catch (error) {
      console.error("❌ Erreur envoi message:", error);
    }
  };

  const handleTyping = () => {
    if (!selectedConversation || !stompClientRef.current) return;
    stompClientRef.current.send(
      "/app/chat.typing",
      {},
      JSON.stringify({
        conversationId: selectedConversation.id,
        userId: medecin.id,
        userName: `Dr. ${medecin.prenom}`,
        typing: true,
      }),
    );
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(stopTyping, 2000);
  };

  const stopTyping = () => {
    if (!selectedConversation || !stompClientRef.current) return;
    stompClientRef.current.send(
      "/app/chat.typing",
      {},
      JSON.stringify({
        conversationId: selectedConversation.id,
        userId: medecin.id,
        userName: `Dr. ${medecin.prenom}`,
        typing: false,
      }),
    );
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
        await api.post("/api/messages/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      setSelectedFiles([]);
    } catch (error) {
      console.error("❌ Erreur upload:", error);
    } finally {
      setUploadingFile(false);
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
    try {
      const patientsRes = await api.get(
        `/api/patients/medecin/${medecin.id}/visibles`,
      );
      setPatients(patientsRes.data);
      const medecinsRes = await api.get("/api/medecins");
      setMedecins(medecinsRes.data.filter((m) => m.id !== medecin.id));
    } catch (error) {
      console.error("❌ Erreur chargement utilisateurs:", error);
    }
  };

  const createConversationWithUser = async (user, type) => {
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

      // ✅ Recharger la liste enrichie (avec patientName, otherMedecinName)
      const conversationsRes = await api.get(
        `/api/conversations/medecin/${medecin.id}`,
      );
      const updatedList = conversationsRes.data;
      setConversations(updatedList);

      // ✅ Chercher la conversation enrichie par son ID
      const enriched = updatedList.find((c) => c.id === createdId);

      if (enriched) {
        setSelectedConversation(enriched);
      } else {
        // ✅ Fallback : construire un objet enrichi manuellement depuis les données locales
        const fallback = {
          ...res.data,
          patientName: type === "patient" ? `${user.prenom} ${user.nom}` : null,
          otherMedecinName:
            type === "medecin" ? `Dr. ${user.prenom} ${user.nom}` : null,
        };
        setSelectedConversation(fallback);

        // Ajouter manuellement à la liste si pas trouvé
        setConversations((prev) => {
          const exists = prev.some((c) => c.id === createdId);
          return exists ? prev : [fallback, ...prev];
        });
      }

      setShowNewConversation(false);
    } catch (error) {
      console.error("❌ Erreur création conversation:", error);
      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Data:", error.response.data);
      }
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
    <div className="chat-medecin-container">
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
                                  href={`http://localhost:8080${message.fileUrl}`}
                                  download
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
                        className={`btn-send-med ${isConnected && (messageInput.trim() || selectedFiles.length > 0) ? "active" : "disabled"}`}
                        onClick={sendMessage}
                        disabled={
                          (!messageInput.trim() &&
                            selectedFiles.length === 0) ||
                          !isConnected ||
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
                      <div
                        key={patient.id}
                        className="user-item-med"
                        onClick={() =>
                          createConversationWithUser(patient, "patient")
                        }
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
                      </div>
                    ))
                  )
                ) : medecins.length === 0 ? (
                  <p className="text-muted text-center py-4">
                    Aucun médecin disponible
                  </p>
                ) : (
                  medecins.map((med) => (
                    <div
                      key={med.id}
                      className="user-item-med"
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
                    </div>
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
