import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import ClinicianScene from '../Clinician/ClinicianScene.jsx';
import { EhrProvider } from '../../contexts/EhrContext.jsx';
import { NoteTypeProvider } from '../../contexts/NoteTypeContext.jsx';
import { EhrNoteHeadersProvider } from '../../contexts/EhrNoteHeadersContext.jsx';
import { LockedDownModeProvider } from '../../contexts/LockedDownModeContext.jsx';
import { MobileModeProvider } from '../../contexts/MobileModeContext.jsx';
import { GuidedTourProvider } from '../../contexts/GuidedTourContext.jsx';
import { GUIDED_DEMO_TOURS } from '../../data/guidedDemoTours.js';
import GuidedTourCard from '../../components/guidedDemo/GuidedTourCard.jsx';

// Mirrors ClinicianPage.jsx's provider stack, plus a GuidedTourProvider that
// hard-locks navigation to the chosen journey's tab. step={1} skips the
// "click the launch button" beat so the Companion Sidebar is open immediately.
export default function GuidedDemoPage() {
  const { journey } = useParams();
  if (!GUIDED_DEMO_TOURS[journey]) return <Navigate to="/guided-demo" replace />;

  return (
    <EhrNoteHeadersProvider>
      <EhrProvider>
        <NoteTypeProvider>
          <LockedDownModeProvider>
            <MobileModeProvider>
              <GuidedTourProvider journeyId={journey}>
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                  <ClinicianScene step={1} onNext={() => {}} />
                  <GuidedTourCard />
                </div>
              </GuidedTourProvider>
            </MobileModeProvider>
          </LockedDownModeProvider>
        </NoteTypeProvider>
      </EhrProvider>
    </EhrNoteHeadersProvider>
  );
}
