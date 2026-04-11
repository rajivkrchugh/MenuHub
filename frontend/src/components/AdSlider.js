import React, { useState, useEffect, useRef, useCallback } from 'react';
import { fetchAds } from '../services/api';
import './AdSlider.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function AdSlider() {
  const [ads, setAds] = useState([]);
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);

  // Load ad image list from backend (auto-detects folder contents)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetchAds();
        if (!cancelled && res.success && res.data.length > 0) {
          setAds(res.data);
        }
      } catch {
        // ads are non-critical; fail silently
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Auto-advance every 5 seconds
  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    if (ads.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % ads.length);
    }, 5000);
  }, [ads.length]);

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [startTimer]);

  const goTo = (idx) => {
    setCurrent(idx);
    startTimer(); // reset timer on manual nav
  };

  if (ads.length === 0) return null;

  return (
    <div className="ad-slider glass-panel">
      <div className="ad-slider__track">
        {ads.map((ad, i) => (
          <div
            key={ad.filename}
            className={`ad-slider__slide ${i === current ? 'ad-slider__slide--active' : ''}`}
          >
            <img
              src={`${API_BASE.replace('/api', '')}${ad.url}`}
              alt={`Advertisement ${i + 1}`}
              loading="lazy"
              draggable={false}
            />
          </div>
        ))}
      </div>

      {ads.length > 1 && (
        <div className="ad-slider__dots">
          {ads.map((_, i) => (
            <button
              key={i}
              className={`ad-slider__dot ${i === current ? 'ad-slider__dot--active' : ''}`}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
