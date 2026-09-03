import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DoctorLoginScreen } from '@/pages/physician/DoctorLoginScreen';
import { DoctorQueueScreen } from '@/pages/physician/DoctorQueueScreen';
import { DoctorSessionReview } from '@/pages/physician/DoctorSessionReview';

export const DoctorApp: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen bg-[#EAEDF0] text-[#212529] font-sans">
        <Routes>
          {/* Doctor Portal Login */}
          <Route path="/" element={<DoctorLoginScreen />} />
          <Route path="/login" element={<DoctorLoginScreen />} />

          {/* Real-Time Prioritized Patient Queue */}
          <Route path="/queue" element={<DoctorQueueScreen />} />

          {/* Clinical Case Sheet Review */}
          <Route path="/session/:sessionId" element={<DoctorSessionReview />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </HashRouter>
  );
};

export default DoctorApp;
