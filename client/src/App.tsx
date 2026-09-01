import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { KioskHeader } from '@/components/shared/KioskHeader';
import { WelcomeScreen } from '@/pages/patient/WelcomeScreen';
import { LanguageScreen } from '@/pages/patient/LanguageScreen';

export const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen bg-[#EAEDF0]">
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

            {/* Placeholder for upcoming modules */}
            <Route
              path="/kiosk/*"
              element={
                <div className="flex-1 flex items-center justify-center p-6 text-center">
                  <div className="max-w-md bg-white p-6 border border-[#CED4DA] shadow-sm">
                    <h2 className="text-xl font-bold mb-2" style={{ color: 'rgb(10, 45, 101)' }}>
                      आगामी चरण / Upcoming Module
                    </h2>
                    <p className="text-xs text-[#495057] mb-4">
                      यह मॉड्यूल शीघ्र उपलब्ध होगा।
                    </p>
                    <a
                      href="#/"
                      className="inline-block px-4 py-2 text-xs font-bold text-white bg-[#0A2D65]"
                    >
                      मुख्य पृष्ठ पर वापस जाएं (Back)
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
    </HashRouter>
  );
};

export default App;
