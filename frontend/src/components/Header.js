import React from 'react';
import { FiMenu, FiPlus } from 'react-icons/fi';
import './Header.css';

export default function Header({ onNewChat, onToggleHistory }) {
  return (
    <header className="header">
      <div className="header__left">
        <button
          className="header__icon-btn"
          onClick={onToggleHistory}
          aria-label="Toggle chat history"
          title="Chat history"
        >
          <FiMenu size={20} />
        </button>

        <div className="header__brand">
          <span className="header__logo-icon">🍽</span>
          <h1 className="header__title">MenuChat</h1>
          <span className="header__badge">AI</span>
        </div>
      </div>

      <button className="header__new-btn" onClick={onNewChat}>
        <FiPlus size={16} />
        <span>New Chat</span>
      </button>
    </header>
  );
}
