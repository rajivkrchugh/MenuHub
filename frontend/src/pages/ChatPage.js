import React, { useState, useCallback } from 'react';
import Header from '../components/Header';
import ChatContainer from '../components/ChatContainer';
import ChatInput from '../components/ChatInput';
import AdSlider from '../components/AdSlider';
import HistorySidebar from '../components/HistorySidebar';
import { sendChatMessage } from '../services/api';
import './ChatPage.css';

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSend = useCallback(async (text) => {
    if (!text.trim() || loading) return;

    setError(null);
    const userMsg = { role: 'user', content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await sendChatMessage(text, conversationId);
      if (res.success) {
        setConversationId(res.data.conversationId);
        const botMsg = {
          role: 'assistant',
          content: res.data.response,
          timestamp: new Date(),
          restaurantName: res.data.restaurantName,
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        setError(res.error || 'Something went wrong.');
      }
    } catch (err) {
      const msg =
        err.response?.data?.error || 'Unable to reach the server. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [conversationId, loading]);

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setError(null);
  }, []);

  const handleSelectConversation = useCallback((conv) => {
    setConversationId(conv._id);
    setMessages(
      conv.messages.map((m) => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
      }))
    );
    setError(null);
    setSidebarOpen(false);
  }, []);

  return (
    <div className="chatpage">
      {/* History sidebar */}
      <HistorySidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelect={handleSelectConversation}
        activeId={conversationId}
      />

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="chatpage__main">
        <Header
          onNewChat={handleNewChat}
          onToggleHistory={() => setSidebarOpen((o) => !o)}
        />

        <div className="chatpage__body">
          <div className="chatpage__chat-area glass-panel">
            <ChatContainer messages={messages} loading={loading} error={error} />
            <ChatInput onSend={handleSend} loading={loading} />
          </div>

          <AdSlider />
        </div>
      </div>
    </div>
  );
}
