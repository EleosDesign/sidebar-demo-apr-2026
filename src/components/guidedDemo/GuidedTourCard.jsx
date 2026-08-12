import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useGuidedTour } from '../../contexts/GuidedTourContext.jsx';
import './GuidedTourCard.css';

const CARD_WIDTH = 320;
const GAP = 16;
const MARGIN = 16;

// Tracks the live position of the step's target element (if any), the same
// "measure a rect, reposition on scroll/resize" approach EnhancePointerToolbar
// uses elsewhere in this app — polled on an interval too, since the sidebar's
// own drag/resize doesn't fire window resize/scroll events.
function useTargetRect(targetKey) {
  const [rect, setRect] = useState(null);

  useEffect(() => {
    if (!targetKey) { setRect(null); return; }
    let raf = null;
    const measure = () => {
      const el = document.querySelector(`[data-tour-target="${targetKey}"]`);
      setRect(el ? el.getBoundingClientRect() : null);
    };
    measure();
    const interval = setInterval(measure, 200);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [targetKey]);

  return rect;
}

function TourCardBody({ tour, side }) {
  const { steps, stepIndex, currentStep, isLastStep, back, exit } = tour;

  const handleNext = () => {
    if (currentStep.autoAction) {
      // The owning component's eleos:tourApply listener performs the real action,
      // which itself dispatches eleos:tourSignal — GuidedTourContext advances the
      // step from that signal, not from this click, so a real click behaves identically.
      window.dispatchEvent(new CustomEvent('eleos:tourApply', { detail: { action: currentStep.autoAction } }));
    } else if (isLastStep) {
      exit();
    } else {
      tour.next();
    }
  };

  return (
    <div className={`guided-tour-card${side ? ` guided-tour-card--${side}` : ''}`}>
      <div className="guided-tour-card__header">
        <span className="guided-tour-card__progress">Step {stepIndex + 1} of {steps.length}</span>
        <button className="guided-tour-card__exit" onClick={exit} aria-label="Exit guided demo">✕</button>
      </div>
      <h3 className="guided-tour-card__title">{currentStep.title}</h3>
      <p className="guided-tour-card__body">{currentStep.body}</p>
      <div className="guided-tour-card__dots">
        {steps.map((_, i) => (
          <span key={i} className={`guided-tour-card__dot${i === stepIndex ? ' is-active' : ''}`} />
        ))}
      </div>
      <div className="guided-tour-card__actions">
        <button className="guided-tour-card__btn guided-tour-card__btn--ghost" onClick={exit}>Skip tour</button>
        <div className="guided-tour-card__nav-btns">
          {stepIndex > 0 && (
            <button className="guided-tour-card__btn guided-tour-card__btn--secondary" onClick={back}>Back</button>
          )}
          <button className="guided-tour-card__btn guided-tour-card__btn--primary" onClick={handleNext}>
            {currentStep.autoAction ? 'Next (do it for me)' : isLastStep ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GuidedTourCard() {
  const tour = useGuidedTour();
  const targetKey = tour.active ? tour.currentStep?.target ?? null : null;
  const rect = useTargetRect(targetKey);

  if (!tour.active || !tour.currentStep) return null;

  // No target for this step (or it hasn't mounted yet) — fall back to a plain
  // fixed card, no arrow/ring, so every step is always renderable.
  if (!rect) {
    return (
      <div className="guided-tour-card-wrap guided-tour-card-wrap--fallback">
        <TourCardBody tour={tour} side={null} />
      </div>
    );
  }

  const fitsLeft = rect.left - GAP - CARD_WIDTH >= MARGIN;
  const side = fitsLeft ? 'left' : 'right';
  const cardLeft = fitsLeft ? rect.left - GAP - CARD_WIDTH : Math.min(rect.right + GAP, window.innerWidth - CARD_WIDTH - MARGIN);
  const cardTop = Math.max(MARGIN, Math.min(rect.top, window.innerHeight - MARGIN - 260));

  return ReactDOM.createPortal(
    <>
      <div
        className="guided-tour-ring"
        style={{ top: rect.top - 5, left: rect.left - 5, width: rect.width + 10, height: rect.height + 10 }}
      />
      <div className="guided-tour-card-wrap guided-tour-card-wrap--anchored" style={{ top: cardTop, left: cardLeft }}>
        <TourCardBody tour={tour} side={side} />
      </div>
    </>,
    document.body
  );
}
