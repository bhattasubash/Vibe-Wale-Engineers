import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { KioskHeader } from '@/components/shared/KioskHeader';
import { WelcomeScreen } from '@/pages/patient/WelcomeScreen';
import { LanguageScreen } from '@/pages/patient/LanguageScreen';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-background">
        {/* Global Hospital Header */}
        <KioskHeader />

        {/* Page Routing */}
        <div className="flex-1 flex flex-col">
          <Routes>
            {/* S-01 Welcome Screen */}
            <Route path="/" element={<WelcomeScreen />} />
            <Route path="/kiosk" element={<WelcomeScreen />} />

            {/* S-02 Language Selection */}
            <Route path="/kiosk/language" element={<LanguageScreen />} />

            {/* Placeholder routes for upcoming steps */}
            <Route
              path="/kiosk/*"
              element={
                <div className="flex-1 flex items-center justify-center p-8 text-center">
                  <div className="max-w-md bg-surface p-8 rounded-3xl border border-gray-200 shadow-sm">
                    <h2 className="text-2xl font-bold text-text-primary mb-2">Upcoming Screen</h2>
                    <p className="text-text-secondary mb-6">Navigating to the next module...</p>
                    <a
                      href="/"
                      className="inline-flex items-center px-6 py-3 rounded-xl bg-primary text-white font-semibold"
                    >
                      Back to Welcome
                    </a>
                  </div>
                </div>
              }
            />

            {/* Fallback redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;
