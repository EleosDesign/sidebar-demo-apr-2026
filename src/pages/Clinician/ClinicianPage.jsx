import React, { useState } from 'react';
import ClinicianScene from './ClinicianScene.jsx';
import { EhrProvider } from '../../contexts/EhrContext.jsx';
import { NoteTypeProvider } from '../../contexts/NoteTypeContext.jsx';
import { EhrNoteHeadersProvider } from '../../contexts/EhrNoteHeadersContext.jsx';
import { LockedDownModeProvider } from '../../contexts/LockedDownModeContext.jsx';
import { MobileModeProvider } from '../../contexts/MobileModeContext.jsx';

export default function ClinicianPage() {
  const [step, setStep] = useState(0);
  return (
    <EhrNoteHeadersProvider>
      <EhrProvider>
        <NoteTypeProvider>
          <LockedDownModeProvider>
            <MobileModeProvider>
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <ClinicianScene step={step} onNext={() => setStep(s => Math.min(s + 1, 1))} />
              </div>
            </MobileModeProvider>
          </LockedDownModeProvider>
        </NoteTypeProvider>
      </EhrProvider>
    </EhrNoteHeadersProvider>
  );
}
