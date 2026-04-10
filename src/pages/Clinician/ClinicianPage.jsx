import React, { useState } from 'react';
import ClinicianScene from './ClinicianScene.jsx';
import { EhrProvider } from '../../contexts/EhrContext.jsx';

export default function ClinicianPage() {
  const [step, setStep] = useState(0);
  return (
    <EhrProvider>
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <ClinicianScene step={step} onNext={() => setStep(s => Math.min(s + 1, 2))} />
      </div>
    </EhrProvider>
  );
}
