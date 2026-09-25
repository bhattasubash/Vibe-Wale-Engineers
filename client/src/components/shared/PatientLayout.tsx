import React from 'react';
import { KioskHeader } from './KioskHeader';
import patientBg from '@/assets/patient-kiosk-bg.png';

interface PatientLayoutProps {
  children: React.ReactNode;
}

export const PatientLayout: React.FC<PatientLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col relative bg-[#FAFBF8] text-[#212529]">
      {/* High-Resolution AYUSH + ABDM Patient Interface Thematic Background */}
      <div
        className="fixed inset-0 pointer-events-none z-0 bg-no-repeat bg-cover bg-center"
        style={{
          backgroundImage: `url(${patientBg})`,
          backgroundPosition: 'center center',
          backgroundAttachment: 'fixed',
        }}
        aria-hidden="true"
      />

      {/* Foreground Content Stack */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <KioskHeader />
        <div className="flex-1 flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
};

export default PatientLayout;
