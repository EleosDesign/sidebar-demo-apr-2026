import React from 'react';
import '../../components/ui/DurationPill.css';

export default function DurationPill() {
  return (
    <div className="duration-pill">
      <svg style={{ flexShrink: 0, width: 19, height: 19 }} viewBox="0 0 19 19" fill="none">
        <path d="M9.5 1.583L11.22 7.13 16.625 9.5 11.22 11.87 9.5 17.417 7.78 11.87 2.375 9.5 7.78 7.13 9.5 1.583Z" fill="#2D4CCD"/>
        <path d="M15.833 12.667L16.625 14.25 18.208 15.042 16.625 15.833 15.833 17.417 15.042 15.833 13.458 15.042 15.042 14.25 15.833 12.667Z" fill="#2D4CCD" opacity="0.6"/>
        <path d="M3.958 1.583L4.75 3.167 6.333 3.958 4.75 4.75 3.958 6.333 3.167 4.75 1.583 3.958 3.167 3.167 3.958 1.583Z" fill="#2D4CCD" opacity="0.4"/>
      </svg>

      <div className="pill-text-track">
        <div className="pill-text-inner">
          <span className="pill-segment-bold">Duration: 45 min</span>
          <span className="pill-separator">&nbsp;|&nbsp;</span>
          <span className="pill-segment-regular">Jun 8, 2024</span>
          <span className="pill-separator">&nbsp;|&nbsp;</span>
          <span className="pill-segment-regular">4:00 – 4:45 PM</span>
          <span className="pill-separator">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
          <span className="pill-segment-bold">Duration: 45 min</span>
          <span className="pill-separator">&nbsp;|&nbsp;</span>
          <span className="pill-segment-regular">Jun 8, 2024</span>
          <span className="pill-separator">&nbsp;|&nbsp;</span>
          <span className="pill-segment-regular">4:00 – 4:45 PM</span>
          <span className="pill-separator">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
        </div>
      </div>
    </div>
  );
}
