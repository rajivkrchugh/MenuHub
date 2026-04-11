import React, { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import EmptyState from './EmptyState';
import './ChatContainer.css';

export default function ChatContainer({ messages, loading, error }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const isEmpty = messages.length === 0 && !loading;

  return (
    <div className="chat-container">
      {isEmpty ? (
        <EmptyState />
      ) : (
        <div className="chat-container__messages">
          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} index={i} />
          ))}
          {loading && <TypingIndicator />}
          {error && (
            <div className="chat-container__error animate-fade-up">
              <span>⚠️</span> {error}
            </div>
          )}
          <div ref={endRef} />
        </div>
      )}
    </div>
  );
}
