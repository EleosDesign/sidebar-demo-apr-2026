import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './styles/globals.css';
import './styles/workflow-utils.css';
import './App.css';
import { EnhanceProvider } from './contexts/EnhanceContext.jsx';

const ClinicianPage = lazy(() => import('./pages/Clinician/ClinicianPage.jsx'));

export default function App() {
  return (
    <BrowserRouter>
      <EnhanceProvider>
        <div style={{ width: '100vw', height: '100vh' }}>
          <Suspense fallback={<div style={{ padding: 32 }}>Loading…</div>}>
            <Routes>
              <Route path="/" element={<Navigate to="/clinician" replace />} />
              <Route path="/clinician" element={<ClinicianPage />} />
              <Route path="*" element={<Navigate to="/clinician" replace />} />
            </Routes>
          </Suspense>
        </div>
      </EnhanceProvider>
    </BrowserRouter>
  );
}
