import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GUIDED_DEMO_TOURS } from '../data/guidedDemoTours.js';

const INACTIVE_TOUR = {
  active: false,
  journeyId: null,
  journey: null,
  steps: [],
  stepIndex: 0,
  currentStep: null,
  isLastStep: true,
  allowedTabs: null,
  defaultClient: '',
  next: () => {},
  back: () => {},
  exit: () => {},
};

const GuidedTourContext = createContext(INACTIVE_TOUR);

export function useGuidedTour() {
  return useContext(GuidedTourContext);
}

// Wraps the real product UI (ClinicianScene) for a single guided-demo journey.
// Every consumer elsewhere in the app (EleosSidebar, EleosNavRail, ClinicianScene
// root) reads this via useGuidedTour() and falls back to INACTIVE_TOUR when no
// provider is present — so /clinician (the AE flow) is completely unaffected.
export function GuidedTourProvider({ journeyId, children }) {
  const navigate = useNavigate();
  const journey = GUIDED_DEMO_TOURS[journeyId] ?? null;
  const [stepIndex, setStepIndex] = useState(0);
  const exit = () => navigate('/guided-demo');

  const value = useMemo(() => {
    if (!journey) return { ...INACTIVE_TOUR, exit };
    const steps = journey.steps;
    const clampedIndex = Math.min(stepIndex, steps.length - 1);
    return {
      active: true,
      journeyId,
      journey,
      steps,
      stepIndex: clampedIndex,
      currentStep: steps[clampedIndex],
      isLastStep: clampedIndex === steps.length - 1,
      allowedTabs: [journey.tab],
      defaultClient: journey.defaultClient,
      next: () => setStepIndex(i => Math.min(i + 1, steps.length - 1)),
      back: () => setStepIndex(i => Math.max(i - 1, 0)),
      exit,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journey, journeyId, stepIndex]);

  // Listen for real actions firing (whether triggered by the user's own click or by
  // the tour's "Next"), and advance the step whenever the signal matches what the
  // current step is waiting on — this is what keeps the tour in sync with the
  // real screen no matter which of the two triggered the action.
  const valueRef = useRef(value);
  valueRef.current = value;
  useEffect(() => {
    const onSignal = (e) => {
      const { currentStep, next } = valueRef.current;
      if (currentStep?.completesOn && e.detail?.signal === currentStep.completesOn) next();
    };
    window.addEventListener('eleos:tourSignal', onSignal);
    return () => window.removeEventListener('eleos:tourSignal', onSignal);
  }, []);

  return <GuidedTourContext.Provider value={value}>{children}</GuidedTourContext.Provider>;
}
