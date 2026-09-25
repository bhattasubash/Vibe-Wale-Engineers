import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { StateEmblem } from '@/components/shared/StateEmblem';
import { usePhysicianStore } from '@/stores/physicianStore';
import { API_BASE_URL } from '@/lib/config';

import doctorIllustration from '@/assets/doctor-illustration-hi.png';
import lotusIllustration from '@/assets/lotus-illustration-hi.png';

export const DoctorLoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const { loginDoctor } = usePhysicianStore();

  const [doctorId, setDoctorId] = useState('DOC-AIIA-104');
  const [doctorName] = useState('डॉ. अनन्या शर्मा (Dr. Ananya Sharma)');
  const [department, setDepartment] = useState('कायचिकित्सा विभाग (Internal Medicine)');
  const [roomNumber, setRoomNumber] = useState('Room #104 (Block A)');
  const [pin, setPin] = useState('1234');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/physician/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctor_id: doctorId, pin }),
      });

      if (response.ok) {
        const data = await response.json();
        loginDoctor(data.doctor_id, data.doctor_name, data.room_number, data.access_token);
        navigate('/doctor/queue');
      } else {
        const errData = await response.json().catch(() => ({}));
        setErrorMessage(
          errData.detail || 'अमान्य चिकित्सक आईडी या पिन (Invalid Doctor ID or PIN).'
        );
      }
    } catch {
      // Local fallback for offline demo resilience
      loginDoctor(doctorId, doctorName, roomNumber);
      navigate('/doctor/queue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#EBF5FB] via-[#F4F9FD] to-[#E3EFF9] text-[#212529] font-sans select-none justify-between relative overflow-hidden">
      {/* Background Atmosphere & High-DPI Medical Artwork */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Subtle Ambient Pulse ECG & Cross Motifs */}
        <div className="absolute top-[30%] left-[16%] text-[#93C5FD] opacity-35 hidden md:block">
          <svg width="140" height="45" viewBox="0 0 140 45" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M0 22.5 h45 l9 -20 l11 40 l9 -27 l7 7 h59" />
          </svg>
        </div>

        <div className="absolute top-[38%] left-[26%] text-[#BFDBFE] opacity-40 hidden md:block">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z"/>
          </svg>
        </div>

        <div className="absolute top-[22%] right-[22%] text-[#BFDBFE] opacity-35 hidden lg:block">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z"/>
          </svg>
        </div>

        {/* High-Resolution Ayush Lotus & Wave on Bottom-Left */}
        <div className="absolute left-0 bottom-0 select-none z-0">
          <img
            src={lotusIllustration}
            alt="AIIA Ayush Lotus Motif"
            className="w-[280px] sm:w-[380px] md:w-[480px] lg:w-[560px] max-h-[50vh] object-contain object-bottom-left opacity-90"
          />
        </div>

        {/* High-Resolution Physician Clinical Examination on Bottom-Right */}
        <div className="absolute right-0 bottom-0 select-none z-0">
          <img
            src={doctorIllustration}
            alt="Physician Clinical Examination"
            className="w-[300px] sm:w-[420px] md:w-[520px] lg:w-[620px] xl:w-[700px] max-h-[75vh] object-contain object-bottom-right opacity-95"
          />
        </div>

        {/* Delicate Gradient Layer */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/10 via-transparent to-white/15" />
      </div>

      {/* Top Government Strip */}
      <header className="bg-white/90 backdrop-blur-xs border-b border-[#E2E8F0] px-6 py-3 shrink-0 relative z-20 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StateEmblem className="w-7 h-10 text-[#2B3A4A] shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                PROJECT FOR GOVERNMENT OF INDIA
              </span>
              <span className="text-base font-black text-[#0B63AC] leading-tight">
                चिकित्सक कार्यक्षेत्र पोर्टल • Physician EMR Workstation
              </span>
              <span className="text-[11px] font-bold text-[#64748B] block mt-0.5">
                Vibe Wale Engineers
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-[#166534]">
            <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
            <span>अधिकृत चिकित्सक लॉगिन (Authorised Staff)</span>
          </div>
        </div>
      </header>

      {/* Main Login Box */}
      <main className="max-w-md w-full mx-auto px-4 py-8 flex-1 flex flex-col justify-center relative z-10">
        
        <div className="bg-white/95 backdrop-blur-xs border border-[#DCE7F3] rounded-2xl p-7 sm:p-8 shadow-[0_12px_40px_rgba(11,99,172,0.12)]">
          
          <div className="text-center mb-6">
            <h1 className="text-2xl font-black text-[#0B63AC] tracking-tight">
              चिकित्सक कार्यक्षेत्र लॉगिन
            </h1>
            <p className="text-xs text-[#64748B] font-medium mt-1">
              ओपीडी रोगी गणना एवं मेडिकल केस शीट देखने हेतु प्रवेश करें।
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg mb-4 text-xs font-bold text-[#DC2626] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626]" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs font-bold">
            
            <div>
              <label className="block text-[#475569] mb-1.5 font-bold">विभाग (Clinical Department) *</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-xs font-bold text-[#1E293B] focus:outline-none focus:border-[#0B63AC] focus:ring-1 focus:ring-[#0B63AC] transition-all"
              >
                <option value="कायचिकित्सा विभाग (Internal Medicine)">कायचिकित्सा विभाग (Internal Medicine)</option>
                <option value="शल्य तंत्र विभाग (General Surgery)">शल्य तंत्र विभाग (General Surgery)</option>
                <option value="शालाक्य तंत्र विभाग (ENT & Ophthalmology)">शालाक्य तंत्र विभाग (ENT & Ophthalmology)</option>
                <option value="पंचकर्म विभाग (Panchakarma Unit)">पंचकर्म विभाग (Panchakarma Unit)</option>
                <option value="प्रसूति एवं स्त्री रोग (Obstetrics & Gynae)">प्रसूति एवं स्त्री रोग (Obstetrics & Gynae)</option>
              </select>
            </div>

            <div>
              <label className="block text-[#475569] mb-1.5 font-bold">चिकित्सक आईडी / नाम (Doctor ID) *</label>
              <input
                type="text"
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-xs font-mono font-bold text-[#1E293B] focus:outline-none focus:border-[#0B63AC] focus:ring-1 focus:ring-[#0B63AC] transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#475569] mb-1.5 font-bold">कमरा नंबर (OPD Room) *</label>
                <input
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-xs font-bold text-[#1E293B] focus:outline-none focus:border-[#0B63AC] focus:ring-1 focus:ring-[#0B63AC] transition-all"
                />
              </div>

              <div>
                <label className="block text-[#475569] mb-1.5 font-bold">सुरक्षा पिन (Security PIN) *</label>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-xs font-mono font-bold text-[#1E293B] focus:outline-none focus:border-[#0B63AC] focus:ring-1 focus:ring-[#0B63AC] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-6 rounded-lg bg-[#0B63AC] hover:bg-[#09518C] text-xs sm:text-sm font-black text-white flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <span>{isSubmitting ? 'सत्यापित हो रहा है...' : 'ओपीडी कक्ष में प्रवेश करें (Enter Queue)'}</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>

          </form>

        </div>

      </main>

      {/* Persistent Single-Line Clean Footer */}
      <footer className="w-full bg-white/80 backdrop-blur-xs border-t border-[#DCE7F3] py-2.5 px-6 text-xs text-[#64748B] select-none relative z-20">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-bold text-[#0B63AC]">अखिल भारतीय आयुर्वेद संस्थान (AIIA) - कल्पवृक्ष मेडिकल सूचना प्रणाली</span>
          <div className="flex items-center gap-3 text-[11px] font-semibold text-[#64748B]">
            <span className="hover:underline cursor-pointer">गोपनीयता नीति</span>
            <span>|</span>
            <span className="hover:underline cursor-pointer">सहायता</span>
            <span>|</span>
            <span className="hover:underline cursor-pointer">संपर्क</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
