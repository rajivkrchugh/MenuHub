import React, { useState, useEffect } from 'react';
import { FiX, FiMessageSquare } from 'react-icons/fi';
import { fetchHistory } from '../services/api';
import './HistorySidebar.css';

export default function HistorySidebar({ open, onClose, onSelect, activeId }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const res = await fetchHistory(1, 30);
        if (!cancelled && res.success) {
          setConversations(res.data.conversations);
        }
      } catch {
        // non-critical
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [open]);

  const formatDate = (d) => {
    const date = new Date(d);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
      <div className="sidebar__header">
        <h2 className="sidebar__title">Chat History</h2>
        <button className="sidebar__close" onClick={onClose} aria-label="Close sidebar">
          <FiX size={20} />
        </button>
      </div>

      <div className="sidebar__list">
        {loading ? (
          <div className="sidebar__loader">Loading...</div>
        ) : conversations.length === 0 ? (
          <div className="sidebar__empty">No conversations yet</div>
        ) : (
          conversations.map((c) => (
            <button
              key={c._id}
              className={`sidebar__item ${c._id === activeId ? 'sidebar__item--active' : ''}`}
              onClick={() => onSelect(c)}
            >
              <FiMessageSquare size={16} className="sidebar__item-icon" />
              <div className="sidebar__item-body">
                <span className="sidebar__item-name">
                  {c.restaurantName || 'Menu Query'}
                </span>
                <span className="sidebar__item-date">{formatDate(c.updatedAt)}</span>
              </div>
            </button>
          ))
        )}
      </div>
    </aside>
  );
}
