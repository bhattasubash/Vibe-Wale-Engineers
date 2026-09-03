import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, UserCheck, Lock, ArrowRight, Stethoscope } from 'lucide-react';
import { usePhysicianStore } from '@/stores/physicianStore';

export const DoctorLoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const { loginDoctor } = usePhysicianStore();

  const [doctorId, setDoctorId] = useState('DOC-AIIA-104');
  const [doctorName, setDoctorName] = useState('डॉ. अनन्या शर्मा (Dr. Ananya Sharma)');
  const [department, setDepartment] = useState('कायचिकित्सा विभाग (Internal Medicine)');
  const [roomNumber, setRoomNumber] = useState('Room #104 (Block A)');
  const [pin, setPin] = useState('1234');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginDoctor(doctorId, doctorName, roomNumber);
    navigate('/doctor/queue');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#EAEDF0] text-[#212529] font-sans select-none justify-between">
      
      {/* Top Government Strip */}
      <header className="bg-white border-b border-[#CED4DA] px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[2px] bg-[#0B5FA5] text-white flex items-center justify-center font-black">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#6C757D] uppercase tracking-wider block">
                अखिल भारतीय आयुर्वेद संस्थान • ALL INDIA INSTITUTE OF AYURVEDA
              </span>
              <span className="text-base font-black text-[#0B5FA5]">
                चिकित्सक कार्यक्षेत्र पोर्टल • Physician EMR Workstation
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-[#2F7D4F] bg-[#EDF7F1] border border-[#2F7D4F]/30 px-3 py-1 rounded-[2px]">
            <ShieldCheck className="w-4 h-4" />
            <span>ABDM-HIP Role-Based Authenticated Terminal</span>
          </div>
        </div>
      </header>

      {/* Main Login Box */}
      <main className="max-w-md w-full mx-auto px-4 py-8 flex-1 flex flex-col justify-center">
        
        <div className="bg-white border-2 border-[#0B5FA5] rounded-[3px] p-6 shadow-sm">
          
          <div className="text-center mb-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-[3px] bg-[#E8F1F8] border border-[#0B5FA5]/30 text-[11px] font-bold text-[#0B5FA5] uppercase tracking-wider mb-2">
              <UserCheck className="w-3.5 h-3.5" />
              <span>BAMS / MD DOCTOR LOGIN</span>
            </div>
            <h1 className="text-2xl font-black text-[#0B5FA5] tracking-tight">
              चिकित्सक लॉगिन
            </h1>
            <p className="text-xs text-[#495057] font-semibold mt-0.5">
              ओपीडी रोगी कतार एवं नैदानिक सारांश देखने के लिए लॉगिन करें।
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3.5 text-xs font-bold">
            
            <div>
              <label className="block text-[#495057] mb-1">विभाग (Clinical Department) *</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full p-2.5 bg-[#F8FAFC] border border-[#CED4DA] rounded-[3px] text-xs font-bold text-[#212529] focus:outline-none focus:border-[#0B5FA5]"
              >
                <option value="कायचिकित्सा विभाग (Internal Medicine)">कायचिकित्सा विभाग (Internal Medicine)</option>
                <option value="शल्य तंत्र विभाग (General Surgery)">शल्य तंत्र विभाग (General Surgery)</option>
                <option value="शालाकय तंत्र विभाग (ENT & Ophthalmology)">शालाकय तंत्र विभाग (ENT & Ophthalmology)</option>
                <option value="पंचकर्म विभाग (Panchakarma Unit)">पंचकर्म विभाग (Panchakarma Unit)</option>
                <option value="प्रसूति एवं स्त्री रोग (Obstetrics & Gynae)">प्रसूति एवं स्त्री रोग (Obstetrics & Gynae)</option>
              </select>
            </div>

            <div>
              <label className="block text-[#495057] mb-1">चिकित्सक आईडी / नाम (Doctor ID) *</label>
              <input
                type="text"
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                className="w-full p-2.5 bg-[#F8FAFC] border border-[#CED4DA] rounded-[3px] text-xs font-mono text-[#212529] focus:outline-none focus:border-[#0B5FA5]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[#495057] mb-1">कमरा संख्या (OPD Room) *</label>
                <input
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="w-full p-2.5 bg-[#F8FAFC] border border-[#CED4DA] rounded-[3px] text-xs font-bold text-[#212529] focus:outline-none focus:border-[#0B5FA5]"
                />
              </div>

              <div>
                <label className="block text-[#495057] mb-1">सुरक्षा पिन (Security PIN) *</label>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full p-2.5 bg-[#F8FAFC] border border-[#CED4DA] rounded-[3px] text-xs font-mono text-[#212529] focus:outline-none focus:border-[#0B5FA5]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3.5 px-6 rounded-[3px] border border-[#084B83] text-sm font-black text-white flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.98]"
              style={{ backgroundColor: '#0B5FA5' }}
            >
              <span>ओपीडी कतार में प्रवेश करें • ACCESS PATIENT QUEUE</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>

          </form>

        </div>

      </main>

      {/* Persistent Single-Line Clean Footer */}
      <footer className="w-full bg-white border-t border-[#CED4DA] py-2 px-6 text-xs text-[#495057] select-none">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="font-bold text-[#0B5FA5]">AIIA Hospital Information System (e-Hospital 2.0)</span>
          <span className="text-[11px] font-semibold text-[#6C757D]">DPDP Act 2023 & Ayush Grid Compliant</span>
        </div>
      </footer>

    </div>
  );
};
