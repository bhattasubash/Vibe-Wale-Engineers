import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { KioskHeader } from '@/components/shared/KioskHeader';

// Patient Kiosk Flow (Screens S-01 to S-11)
import { WelcomeScreen } from '@/pages/patient/WelcomeScreen';
import { LanguageScreen } from '@/pages/patient/LanguageScreen';
import { IdentifyScreen } from '@/pages/patient/IdentifyScreen';
import { DepartmentScreen } from '@/pages/patient/DepartmentScreen';
import { ConsentScreen } from '@/pages/patient/ConsentScreen';
import { ComplaintScreen } from '@/pages/patient/ComplaintScreen';
import { SocratesScreen } from '@/pages/patient/SocratesScreen';
import { PrakritiScreen } from '@/pages/patient/PrakritiScreen';
import { GeneralVitalsScreen } from '@/pages/patient/GeneralVitalsScreen';
import { ReviewScreen } from '@/pages/patient/ReviewScreen';
import { CameraUploadScreen } from '@/pages/patient/CameraUploadScreen';
import { TokenScreen } from '@/pages/patient/TokenScreen';

// Physician EMR Workstation (Screens S-16 to S-18)
import { DoctorLoginScreen } from '@/pages/physician/DoctorLoginScreen';
import { DoctorQueueScreen } from '@/pages/physician/DoctorQueueScreen';
import { DoctorSessionReview } from '@/pages/physician/DoctorSessionReview';

export const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        {/* ======================================================= */}
        {/* 1. PATIENT KIOSK WORKFLOW (/kiosk/*)                    */}
        {/* ======================================================= */}
        <Route
          path="/*"
          element={
            <div className="flex flex-col min-h-screen bg-[#EAEDF0]">
              <KioskHeader />
              <div className="flex-1 flex flex-col">
                <Routes>
                  {/* S-01: Welcome Walk-Up Screen */}
                  <Route path="" element={<WelcomeScreen />} />
                  <Route path="kiosk" element={<WelcomeScreen />} />

                  {/* S-02: 22 Scheduled Indian Languages Matrix */}
                  <Route path="kiosk/language" element={<LanguageScreen />} />

                  {/* S-03: Patient Identification & ABHA Scan */}
                  <Route path="kiosk/identify" element={<IdentifyScreen />} />

                  {/* S-03B: Department & Treatment Path Selector (Ayurveda vs Allopathy) */}
                  <Route path="kiosk/department" element={<DepartmentScreen />} />

                  {/* S-04: DPDP Act 2023 Audio Consent Capture */}
                  <Route path="kiosk/consent" element={<ConsentScreen />} />

                  {/* S-05 & S-06: Dual-Mode Chief Complaint & Red Flag Interceptor */}
                  <Route path="kiosk/complaint" element={<ComplaintScreen />} />

                  {/* S-07: 5-Turn Adaptive SOCRATES Clinical Follow-Up */}
                  <Route path="kiosk/socrates" element={<SocratesScreen />} />

                  {/* S-08A: 15-Trait Classical Charaka Samhita Prakriti Assessment (Ayurveda) */}
                  <Route path="kiosk/prakriti" element={<PrakritiScreen />} />

                  {/* S-08B: General Medicine Vitals & Allergies Assessment (Allopathy) */}
                  <Route path="kiosk/vitals" element={<GeneralVitalsScreen />} />

                  {/* S-09: Answer Summary Verification & 1-Tap Section Editing */}
                  <Route path="kiosk/review" element={<ReviewScreen />} />

                  {/* S-10: Medical Document Auto-Framing Camera Capture */}
                  <Route path="kiosk/documents" element={<CameraUploadScreen />} />

                  {/* S-11 to S-15: Doctor OPD Assignment & Ephemeral Token Dispatch */}
                  <Route path="kiosk/token" element={<TokenScreen />} />

                  {/* Fallback Redirect */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </div>
          }
        />

        {/* ======================================================= */}
        {/* 2. PHYSICIAN EMR WORKSTATION (/doctor/*)                */}
        {/* ======================================================= */}
        {/* S-16: Doctor Authentication Login */}
        <Route path="/doctor/login" element={<DoctorLoginScreen />} />
        <Route path="/doctor" element={<Navigate to="/doctor/login" replace />} />

        {/* S-17: Prioritized Patient OPD Queue */}
        <Route path="/doctor/queue" element={<DoctorQueueScreen />} />

        {/* S-18: Dense Clinical Case Sheet Review & Actions */}
        <Route path="/doctor/session/:sessionId" element={<DoctorSessionReview />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
