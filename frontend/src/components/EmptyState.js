import React from 'react';
import './EmptyState.css';

const SUGGESTIONS = [
  'Show me the menu for Swagath Restaurant South Delhi',
  'What does Bukhara, New Delhi serve?',
  'Give me the Saravana Bhavan menu in Chennai',
  'Pizza Hut India menu with prices',
];

export default function EmptyState() {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">🍽</div>
      <h2 className="empty-state__title">What would you like to eat?</h2>
      <p className="empty-state__subtitle" style={{ color: 'black' }}>
        Ask me about any restaurant menu in the world — I'll fetch the details for you.
      </p>

      <div className="empty-state__suggestions">
        {SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            className="empty-state__chip"
            onClick={() => {
              // Find the input and set its value programmatically
              const input = document.querySelector('.chat-input__field');
              if (input) {
                const nativeSet = Object.getOwnPropertyDescriptor(
                  window.HTMLInputElement.prototype, 'value'
                ).set;
                nativeSet.call(input, s);
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.focus();
              }
            }}
          >
            <span className="empty-state__chip-icon">→</span>
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
