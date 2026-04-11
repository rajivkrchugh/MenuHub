import React, { useState, useRef } from 'react';
import { FiSend } from 'react-icons/fi';
import './ChatInput.css';

export default function ChatInput({ onSend, loading }) {
  const [text, setText] = useState('');
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || loading) return;
    onSend(text.trim());
    setText('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  return (
    <form className="chat-input" onSubmit={handleSubmit}>
      <div className="chat-input__inner">
        <input
          ref={inputRef}
          type="text"
          className="chat-input__field"
          placeholder="Ask about any restaurant menu..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={500}
          disabled={loading}
          aria-label="Type your menu question"
          autoComplete="off"
          style={{ color: 'black' }}
        />
        <button
          type="submit"
          className={`chat-input__send ${text.trim() ? 'chat-input__send--active' : ''}`}
          disabled={!text.trim() || loading}
          aria-label="Send message"
        >
          <FiSend size={18} />
        </button>
      </div>
      <p className="chat-input__hint">
        Only restaurant menu queries are supported. Press Enter to send.
      </p>
    </form>
  );
}
