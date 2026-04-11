import React from 'react';
import { splitResponse } from '../utils/parseTable';
import MenuTable from './MenuTable';
import './MessageBubble.css';

export default function MessageBubble({ message, index }) {
  const isUser = message.role === 'user';
  const parts = isUser ? null : splitResponse(message.content);

  return (
    <div
      className={`bubble ${isUser ? 'bubble--user' : 'bubble--bot'} animate-fade-up`}
      style={{ animationDelay: `${index * 0.04}s` }}
    >
      {!isUser && (
        <div className="bubble__avatar">🍽</div>
      )}

      <div className={`bubble__body ${isUser ? 'bubble__body--user' : 'bubble__body--bot'}`}>
        {isUser ? (
          <p className="bubble__text">{message.content}</p>
        ) : (
          <div className="bubble__content">
            {parts && parts.map((part, i) =>
              part.type === 'table' ? (
                <MenuTable key={i} data={part.content} />
              ) : (
                <p key={i} className="bubble__text">{part.content}</p>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
