import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import "./chatSidebar.css";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:8800";

const ChatSidebar = ({ open, onClose, user }) => {
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [notifications, setNotifications] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, {
      query: { userId: user?._id },
    });
    socketRef.current.on("message", (msg) => {
      setMessages((prev) => [...prev, msg]);
      setNotifications((prev) => [...prev, msg]);
    });
    // Fetch conversations (mock)
    setConversations([
      { id: "guide1", name: "Guide Milan" },
      { id: "user2", name: "User Sita" },
    ]);
    return () => {
      socketRef.current.disconnect();
    };
  }, [user]);

  useEffect(() => {
    // Fetch messages for active conversation (mock)
    if (activeConv) {
      setMessages([
        { sender: "me", text: "Hello!" },
        { sender: activeConv.name, text: "Hi, how can I help you?" },
      ]);
    }
  }, [activeConv]);

  const sendMessage = () => {
    if (!input.trim() || !activeConv) return;
    const msg = { sender: user?.name || "me", text: input, to: activeConv.id };
    socketRef.current.emit("message", msg);
    setMessages((prev) => [...prev, msg]);
    setInput("");
  };

  return (
    <div className={`chat-sidebar ${open ? "open" : ""}`}> 
      <div className="chat-sidebar-header">
        <span>Chats</span>
        <button className="chat-close-btn" onClick={onClose} aria-label="Close chat sidebar">
          &times;
        </button>
      </div>
      <div className="chat-conversations">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            className={`chat-conv ${activeConv?.id === conv.id ? "active" : ""}`}
            onClick={() => setActiveConv(conv)}
          >
            {conv.name}
          </div>
        ))}
      </div>
      <div className="chat-messages">
        {activeConv ? (
          messages.map((msg, idx) => (
            <div key={idx} className={`chat-msg ${msg.sender === (user?.name || "me") ? "me" : "other"}`}>
              <span>{msg.text}</span>
            </div>
          ))
        ) : (
          <div className="chat-empty">Select a conversation</div>
        )}
      </div>
      {activeConv && (
        <div className="chat-input-box">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      )}
    </div>
  );
};

export default ChatSidebar;
