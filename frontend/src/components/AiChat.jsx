import React, { useState, useRef, useEffect } from "react";

export default function AiChat({ backendUrl }) {
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "👋 Hello! I am ArenaIQ, your official multilingual stadium coordinator. Ask me about gates, wait times, food concessions, accessibility elevators, public transit, or sustainability rewards!"
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Quick prompt triggers
  const handleQuickPrompt = (promptText) => {
    sendMessage(promptText);
  };

  const sendMessage = async (textToSend) => {
    const prompt = textToSend.trim();
    if (!prompt) return;

    // Append user message
    setMessages(prev => [...prev, { sender: "user", text: prompt }]);
    setInputText("");
    setLoading(true);

    try {
      const response = await fetch(`${backendUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, lang: language })
      });

      if (!response.ok) {
        throw new Error("API failed to respond.");
      }

      const data = await response.json();
      setMessages(prev => [...prev, { sender: "ai", text: data.reply }]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages(prev => [
        ...prev, 
        { sender: "system", text: "⚠️ Network connectivity alert: Local AI fallback activated." },
        { sender: "ai", text: "I'm having trouble reaching the telemetry database. You can still reach stadium staff directly at Gate 1 assistance desk." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage(inputText);
    }
  };

  // Multilingual Text-to-Speech support
  const handleSpeak = (text) => {
    if ("speechSynthesis" in window) {
      // Cancel previous speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Match voice language
      switch (language) {
        case "es":
          utterance.lang = "es-ES";
          break;
        case "pt":
          utterance.lang = "pt-BR";
          break;
        case "ar":
          utterance.lang = "ar-SA";
          break;
        case "en":
        default:
          utterance.lang = "en-US";
          break;
      }
      
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech is not supported in this browser.");
    }
  };

  const quickPrompts = [
    { label: "🚪 Gate Delays", query: "Which gate has the shortest wait time right now?" },
    { label: "♿ Wheelchair Elevator", query: "Where is the nearest accessibility elevator?" },
    { label: "🚆 Transit Status", query: "Is the NJ Transit train running or delayed?" },
    { label: "🍔 Clean concessions", query: "Where can I find food stalls in Zone C with short lines?" },
    { label: "♻️ Eco Rewards", query: "How do I earn points for recycling my bottles?" }
  ];

  return (
    <div className="glass-panel chat-container" style={{ padding: "1.25rem" }}>
      <div className="card-header-styled">
        <h3 className="card-title-styled">
          🤖 ArenaIQ Generative AI Fan Assistant
        </h3>
        <div className="lang-select-container">
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Language:</span>
          <select 
            className="lang-select" 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="en">English (US)</option>
            <option value="es">Español (ES)</option>
            <option value="pt">Português (BR)</option>
            <option value="ar">العربية (Arabic)</option>
          </select>
        </div>
      </div>

      {/* Quick Prompts Widgets */}
      <div className="quick-prompts">
        {quickPrompts.map((qp, idx) => (
          <button 
            key={idx} 
            className="quick-prompt-btn" 
            onClick={() => handleQuickPrompt(qp.query)}
            disabled={loading}
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Message Screen */}
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`chat-bubble ${
              msg.sender === "user" ? "bubble-user" : msg.sender === "system" ? "bubble-system" : "bubble-ai"
            }`}
          >
            <div>{msg.text}</div>
            
            {msg.sender === "ai" && (
              <button 
                onClick={() => handleSpeak(msg.text)}
                style={{ 
                  background: "transparent", 
                  border: "none", 
                  color: "var(--secondary)", 
                  fontSize: "0.75rem", 
                  cursor: "pointer", 
                  marginTop: "0.5rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.25rem" 
                }}
              >
                🔊 Read Aloud
              </button>
            )}
          </div>
        ))}
        {loading && (
          <div className="chat-bubble bubble-ai" style={{ fontStyle: "italic", opacity: 0.8 }}>
            ArenaIQ is analyzing live stadium state...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="chat-input-bar">
        <input 
          type="text" 
          className="chat-input" 
          placeholder="Ask ArenaIQ (e.g. 'restroom lines in Zone C' or 'train delay')..." 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={loading}
        />
        <button 
          className="chat-btn" 
          onClick={() => sendMessage(inputText)}
          disabled={loading || !inputText.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}
