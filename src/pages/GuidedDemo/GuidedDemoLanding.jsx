import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GUIDED_DEMO_TOURS, GUIDED_DEMO_TOUR_ORDER } from '../../data/guidedDemoTours.js';
import './GuidedDemoLanding.css';

const JOURNEY_ICON = {
  capture: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z" stroke="#293D87" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 11a7 7 0 0 1-14 0M12 18v3" stroke="#293D87" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  summary: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9l-5-6Z" stroke="#293D87" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 13h6M9 17h6" stroke="#293D87" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  quality: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L4 6V12C4 16.418 7.582 20 12 22C16.418 20 20 16.418 20 12V6L12 2Z" stroke="#293D87" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 12L11 14L15 10" stroke="#293D87" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

export default function GuidedDemoLanding() {
  const navigate = useNavigate();

  return (
    <div className="guided-landing">
      <div className="guided-landing__inner">
        <span className="guided-landing__eyebrow">Eleos Guided Demo</span>
        <h1 className="guided-landing__title">What would you like to see today?</h1>
        <p className="guided-landing__subtitle">
          Pick a journey below and we’ll walk you through it step by step — no sales call required.
        </p>
        <div className="guided-landing__grid">
          {GUIDED_DEMO_TOUR_ORDER.map((id) => {
            const journey = GUIDED_DEMO_TOURS[id];
            return (
              <div key={id} className="guided-landing__card">
                <div className="guided-landing__icon">{JOURNEY_ICON[id]}</div>
                <h2 className="guided-landing__card-title">{journey.label}</h2>
                <p className="guided-landing__tagline">{journey.tagline}</p>
                <p className="guided-landing__blurb">{journey.marketingBlurb}</p>
                <button
                  className="guided-landing__start"
                  onClick={() => navigate(`/guided-demo/${id}`)}
                >
                  Start
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
