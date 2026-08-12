import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './styles/globals.css';
import './styles/workflow-utils.css';
import './App.css';

const ClinicianPage = lazy(() => import('./pages/Clinician/ClinicianPage.jsx'));
const GuidedDemoLanding = lazy(() => import('./pages/GuidedDemo/GuidedDemoLanding.jsx'));
const GuidedDemoPage = lazy(() => import('./pages/GuidedDemo/GuidedDemoPage.jsx'));

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ width: '100vw', height: '100vh' }}>
        <Suspense fallback={<div style={{ padding: 32 }}>Loading…</div>}>
          <Routes>
            <Route path="/" element={<Navigate to="/clinician" replace />} />
            <Route path="/clinician" element={<ClinicianPage />} />
            <Route path="/guided-demo" element={<GuidedDemoLanding />} />
            <Route path="/guided-demo/:journey" element={<GuidedDemoPage />} />
            <Route path="*" element={<Navigate to="/clinician" replace />} />
          </Routes>
        </Suspense>
      </div>
    </BrowserRouter>
  );
}
