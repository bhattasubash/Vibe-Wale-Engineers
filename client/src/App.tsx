import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { KioskHeader } from '@/components/shared/KioskHeader';
import { WelcomeScreen } from '@/pages/patient/WelcomeScreen';
import { LanguageScreen } from '@/pages/patient/LanguageScreen';
import { IdentifyScreen } from '@/pages/patient/IdentifyScreen';
import { ConsentScreen } from '@/pages/patient/ConsentScreen';
import { ComplaintScreen } from '@/pages/patient/ComplaintScreen';
import { SocratesScreen } from '@/pages/patient/SocratesScreen';
import { PrakritiScreen } from '@/pages/patient/PrakritiScreen';
import { ReviewScreen } from '@/pages/patient/ReviewScreen';
import { CameraUploadScreen } from '@/pages/patient/CameraUploadScreen';
import { TokenScreen } from '@/pages/patient/TokenScreen';

export const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen bg-[#EAEDF0]">
        {/* Global Government Kiosk Header */}
        <KioskHeader />

        {/* Complete End-to-End Route Architecture */}
        <div className="flex-1 flex flex-col">
          <Routes>
            {/* S-01: Welcome Walk-Up Screen */}
            <Route path="/" element={<WelcomeScreen />} />
            <Route path="/kiosk" element={<WelcomeScreen />} />

            {/* S-02: 22 Scheduled Indian Languages Selection Matrix */}
            <Route path="/kiosk/language" element={<LanguageScreen />} />

            {/* S-03: Patient Identification & ABHA Scan */}
            <Route path="/kiosk/identify" element={<IdentifyScreen />} />

            {/* S-04: DPDP Act 2023 Audio Consent Capture */}
            <Route path="/kiosk/consent" element={<ConsentScreen />} />

            {/* S-05 & S-06: Dual-Mode Chief Complaint & Red Flag Interceptor */}
            <Route path="/kiosk/complaint" element={<ComplaintScreen />} />

            {/* S-07: 5-Turn Adaptive SOCRATES Clinical Follow-Up */}
            <Route path="/kiosk/socrates" element={<SocratesScreen />} />

            {/* S-08: 15-Trait Classical Charaka Samhita Prakriti Assessment */}
            <Route path="/kiosk/prakriti" element={<PrakritiScreen />} />

            {/* S-09: Answer Summary Verification & 1-Tap Section Editing */}
            <Route path="/kiosk/review" element={<ReviewScreen />} />

            {/* S-10: Medical Document Auto-Framing Camera Capture */}
            <Route path="/kiosk/documents" element={<CameraUploadScreen />} />

            {/* S-11 to S-15: Doctor OPD Assignment & Ephemeral Token Dispatch */}
            <Route path="/kiosk/token" element={<TokenScreen />} />

            {/* Fallback Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </HashRouter>
  );
};

export default App;
