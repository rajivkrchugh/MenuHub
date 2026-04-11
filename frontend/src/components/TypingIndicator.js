import React from 'react';
import './TypingIndicator.css';

export default function TypingIndicator() {
  return (
    <div className="typing animate-fade-up">
      <div className="typing__avatar">🍽</div>
      <div className="typing__dots">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
