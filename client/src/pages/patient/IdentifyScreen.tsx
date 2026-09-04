import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, UserPlus, ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, User, Smartphone } from 'lucide-react';
import { AudioSpeaker } from '@/components/ui/AudioSpeaker';
import { useSessionStore } from '@/stores/sessionStore';

export const IdentifyScreen: React.FC = () => {
  const navigate = useNavigate();
  const { language, setPatient, patient } = useSessionStore();

  const [activeTab, setActiveTab] = useState<'abha' | 'register'>('abha');
  const [scannedSuccess, setScannedSuccess] = useState(false);

  // Manual Register Form State
  const [regName, setRegName] = useState('');
  const [regAge, setRegAge] = useState<number | ''>('');
  const [regGender, setRegGender] = useState<'male' | 'female' | 'other' | ''>('');
  const [regPhone, setRegPhone] = useState('');

  const promptHindi =
    'कृपया अपने फोन के आभा ऐप या आरोग्य सेतु से स्क्रीन पर दिया गया QR कोड स्कैन करें। यदि आपके पास फोन नहीं है, तो नया पंजीकरण बटन दबाएं।';
  const promptEnglish =
    'Please scan the on-screen QR code using your ABHA or Aarogya Setu app on your phone. If you do not have a phone, tap Register New.';

  // Simulated ABDM Scan & Share Webhook Listener
  const handleSimulatePhoneScanned = () => {
    setIsWaitingScan(false);
    setScannedSuccess(true);
    setPatient({
      fullName: 'रामेश्वर दयाल शर्मा (Rameshwar Sharma)',
      age: 62,
      gender: 'male',
      phone: '9876543210',
      abhaId: '91-4523-8901-2345',
      abhaAddress: 'rameshwar.sharma@abdm',
      isReturning: true,
      lastVisitDate: '14 अगस्त 2026 (OPD #104)',
    });
  };

  const handleManualRegister = () => {
    if (regName && regAge && regGender && regPhone.length === 10) {
      setPatient({
        fullName: regName,
        age: Number(regAge),
        gender: regGender,
        phone: regPhone,
        isReturning: false,
      });
      navigate('/kiosk/department');
    }
  };

  const handleProceed = () => {
    navigate('/kiosk/department');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-76px)] max-h-[calc(100vh-76px)] bg-[#EAEDF0] text-[#212529] justify-between font-sans select-none overflow-hidden">
      
      {/* Non-Scrollable Centered Main Container */}
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-2 flex-1 flex flex-col justify-evenly items-center">
        
        {/* Top Prompter */}
        <div className="shrink-0">
          <AudioSpeaker
            hindiText={promptHindi}
            englishText={promptEnglish}
            bilingual={language === 'hi'}
            autoPlay={true}
          />
        </div>

        {/* Header Badge */}
        <div className="text-center shrink-0">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-[3px] border text-[11px] font-bold uppercase tracking-wider mb-1"
            style={{
              backgroundColor: '#E8F1F8',
              borderColor: 'rgba(11, 95, 165, 0.3)',
              color: '#0B5FA5',
            }}
          >
            <User className="w-3.5 h-3.5" />
            <span>चरण 1: रोगी पहचान / PATIENT IDENTIFICATION</span>
          </div>

          <h1
            className="text-2xl sm:text-3xl font-black tracking-tight"
            style={{ color: '#0B5FA5' }}
          >
            {language === 'hi' ? 'आभा ऐप से QR कोड स्कैन करें' : 'Scan Kiosk QR via ABHA App'}
          </h1>
          <p className="text-xs sm:text-sm text-[#495057] font-semibold">
            {language === 'hi'
              ? 'फोन में आभा ऐप खोलें और स्क्रीन पर बने QR कोड को स्कैन करें।'
              : 'Open your ABHA / Ayushman app on phone and scan the QR code below.'}
          </p>
        </div>

        {/* 2 MODE SELECTOR TABS */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-lg shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('abha')}
            className="py-2.5 px-4 rounded-[3px] border text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-transform active:scale-[0.98] cursor-pointer"
            style={{
              backgroundColor: activeTab === 'abha' ? '#0B5FA5' : '#FFFFFF',
              borderColor: activeTab === 'abha' ? '#084B83' : '#CED4DA',
              color: activeTab === 'abha' ? '#FFFFFF' : '#495057',
            }}
          >
            <QrCode className="w-4 h-4 shrink-0" />
            <span>{language === 'hi' ? 'आभा ऐप QR स्कैन (Scan & Share)' : 'ABDM Scan & Share'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className="py-2.5 px-4 rounded-[3px] border text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-transform active:scale-[0.98] cursor-pointer"
            style={{
              backgroundColor: activeTab === 'register' ? '#0B5FA5' : '#FFFFFF',
              borderColor: activeTab === 'register' ? '#084B83' : '#CED4DA',
              color: activeTab === 'register' ? '#FFFFFF' : '#495057',
            }}
          >
            <UserPlus className="w-4 h-4 shrink-0" />
            <span>{language === 'hi' ? 'बिना फोन के पंजीकरण' : 'Register Without Phone'}</span>
          </button>
        </div>

        {/* TAB 1: DYNAMIC ABDM SCAN & SHARE QR CODE */}
        {activeTab === 'abha' && (
          <div className="w-full max-w-2xl bg-white border border-[#CED4DA] rounded-[3px] p-4 sm:p-5 flex flex-col items-center text-center shrink-0">
            
            {!scannedSuccess ? (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full">
                
                {/* Genuine High-Contrast ABDM QR Code Graphic */}
                <div className="relative p-3 bg-white border-2 border-[#0B5FA5] rounded-[3px] shrink-0">
                  <div className="w-44 h-44 sm:w-48 sm:h-48 bg-white flex flex-col items-center justify-center">
                    
                    {/* SVG Clean Vector QR Pattern */}
                    <svg viewBox="0 0 100 100" className="w-full h-full fill-[#0B5FA5]">
                      <rect x="5" y="5" width="25" height="25" fill="#0B5FA5" />
                      <rect x="10" y="10" width="15" height="15" fill="#FFFFFF" />
                      <rect x="13" y="13" width="9" height="9" fill="#0B5FA5" />

                      <rect x="70" y="5" width="25" height="25" fill="#0B5FA5" />
                      <rect x="75" y="10" width="15" height="15" fill="#FFFFFF" />
                      <rect x="78" y="13" width="9" height="9" fill="#0B5FA5" />

                      <rect x="5" y="70" width="25" height="25" fill="#0B5FA5" />
                      <rect x="10" y="75" width="15" height="15" fill="#FFFFFF" />
                      <rect x="13" y="78" width="9" height="9" fill="#0B5FA5" />

                      {/* Data dots */}
                      <rect x="35" y="10" width="8" height="8" />
                      <rect x="50" y="15" width="10" height="6" />
                      <rect x="35" y="35" width="30" height="30" fill="none" stroke="#0B5FA5" strokeWidth="4" />
                      <rect x="45" y="45" width="10" height="10" />
                      <rect x="10" y="40" width="6" height="15" />
                      <rect x="75" y="40" width="15" height="6" />
                      <rect x="40" y="75" width="15" height="15" />
                      <rect x="65" y="70" width="10" height="10" />
                      <rect x="80" y="80" width="10" height="10" />
                    </svg>
                  </div>

                  <div className="text-[9px] font-black font-mono text-[#0B5FA5] mt-1 tracking-wider uppercase">
                    HIP: AIIA_DELHI • KIOSK #01
                  </div>
                </div>

                {/* Instructions & Simulation Trigger */}
                <div className="text-left space-y-2.5 max-w-sm">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0B5FA5]">
                    <Smartphone className="w-4 h-4 text-[#0B5FA5] shrink-0" />
                    <span>आयुष्मान भारत डिजिटल मिशन (ABDM)</span>
                  </div>

                  <ol className="text-xs text-[#495057] space-y-1 font-semibold list-decimal list-inside leading-relaxed">
                    <li>अपने मोबाइल में <strong>ABHA / Aarogya Setu</strong> खोलें।</li>
                    <li><strong>'Scan & Share'</strong> बटन दबाकर इस QR को स्कैन करें।</li>
                    <li>आपकी प्रोफाइल बिना टाइप किए तुरंत सत्यापित हो जाएगी।</li>
                  </ol>

                  {/* Immediate Simulation Button for Test/Demo */}
                  <button
                    type="button"
                    onClick={handleSimulatePhoneScanned}
                    className="w-full py-2.5 px-4 rounded-[3px] border border-[#084B83] text-xs font-black text-white cursor-pointer transition-transform active:scale-[0.98]"
                    style={{ backgroundColor: '#0B5FA5' }}
                  >
                    फोन से स्कैन करें • TAP TO SIMULATE PHONE SCAN
                  </button>
                </div>

              </div>
            ) : (
              /* Verified Profile Card */
              <div className="w-full text-left space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#15803D] bg-[#F0FDF4] border border-[#15803D]/30 p-2 rounded-[2px]">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
                  <span>आभा प्रोफाइल सफलतापूर्वक प्राप्त! (ABHA Profile Shared via ABDM)</span>
                </div>

                <div className="border border-[#CED4DA] p-3 rounded-[3px] bg-[#F8FAFC] grid grid-cols-2 gap-2 text-xs font-medium">
                  <div>
                    <span className="text-[#6C757D] text-[10px] block">रोगी का नाम:</span>
                    <span className="font-extrabold text-[#212529] text-sm">{patient.fullName}</span>
                  </div>
                  <div>
                    <span className="text-[#6C757D] text-[10px] block">आयु / लिंग:</span>
                    <span className="font-bold text-[#212529]">{patient.age} वर्ष / पुरुष</span>
                  </div>
                  <div>
                    <span className="text-[#6C757D] text-[10px] block">आभा संख्या:</span>
                    <span className="font-mono font-bold text-[#0B5FA5]">{patient.abhaId}</span>
                  </div>
                  <div>
                    <span className="text-[#6C757D] text-[10px] block">आभा पता:</span>
                    <span className="font-mono font-bold text-[#212529]">{patient.abhaAddress}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleProceed}
                  className="w-full py-3.5 px-6 rounded-[3px] border border-[#084B83] text-sm sm:text-base font-black text-white flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.99]"
                  style={{ backgroundColor: '#0B5FA5' }}
                >
                  <span>सहमति पृष्ठ पर आगे बढ़ें • PROCEED TO CONSENT</span>
                  <ArrowRight className="w-5 h-5 text-white" />
                </button>
              </div>
            )}

          </div>
        )}

        {/* TAB 2: MANUAL REGISTRATION FORM */}
        {activeTab === 'register' && (
          <div className="w-full max-w-2xl bg-white border border-[#CED4DA] rounded-[3px] p-4 sm:p-5 shrink-0">
            <div className="text-xs font-extrabold text-[#495057] uppercase tracking-wider mb-3 border-b pb-1.5">
              नया रोगी पंजीकरण (Walk-In Direct Intake)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold">
              <div>
                <label className="block text-[#495057] mb-1">पूरा नाम (Full Name) *</label>
                <input
                  type="text"
                  placeholder="उदा. राजेश कुमार"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full p-2.5 bg-[#F8FAFC] border border-[#CED4DA] rounded-[3px] text-sm text-[#212529] focus:outline-none focus:border-[#0B5FA5]"
                />
              </div>

              <div>
                <label className="block text-[#495057] mb-1">उम्र (Age in Years) *</label>
                <input
                  type="number"
                  placeholder="उदा. 45"
                  value={regAge}
                  onChange={(e) => setRegAge(e.target.value ? Number(e.target.value) : '')}
                  className="w-full p-2.5 bg-[#F8FAFC] border border-[#CED4DA] rounded-[3px] text-sm text-[#212529] focus:outline-none focus:border-[#0B5FA5]"
                />
              </div>

              <div>
                <label className="block text-[#495057] mb-1">लिंग (Gender) *</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'male', hi: 'पुरुष', en: 'Male' },
                    { key: 'female', hi: 'महिला', en: 'Female' },
                    { key: 'other', hi: 'अन्य', en: 'Other' },
                  ].map((g) => (
                    <button
                      key={g.key}
                      type="button"
                      onClick={() => setRegGender(g.key as any)}
                      className="py-2 px-1 rounded-[3px] border text-center transition-colors cursor-pointer text-xs font-bold"
                      style={{
                        backgroundColor: regGender === g.key ? '#0B5FA5' : '#F8FAFC',
                        borderColor: regGender === g.key ? '#084B83' : '#CED4DA',
                        color: regGender === g.key ? '#FFFFFF' : '#212529',
                      }}
                    >
                      {language === 'hi' ? g.hi : g.en}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[#495057] mb-1">मोबाइल नंबर (10-Digit Mobile) *</label>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="9876543210"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full p-2.5 bg-[#F8FAFC] border border-[#CED4DA] rounded-[3px] text-sm font-mono text-[#212529] focus:outline-none focus:border-[#0B5FA5]"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleManualRegister}
              disabled={!regName || !regAge || !regGender || regPhone.length !== 10}
              className="w-full mt-4 py-3 px-6 rounded-[3px] border border-[#084B83] text-sm font-black text-white flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-transform active:scale-[0.98]"
              style={{ backgroundColor: '#0B5FA5' }}
            >
              <span>पंजीकरण पूर्ण करें एवं आगे बढ़ें • SUBMIT & PROCEED</span>
              <ArrowRight className="w-5 h-5 text-white" />
            </button>
          </div>
        )}

        {/* Back Button */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={() => navigate('/kiosk/language')}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-[3px] border border-[#CED4DA] bg-white hover:border-[#0B5FA5] hover:text-[#0B5FA5] text-xs font-bold text-[#212529] transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>भाषा बदलें (Change Language)</span>
          </button>
        </div>

      </main>

      {/* Persistent Single-Line Clean Footer */}
      <footer className="w-full bg-white border-t border-[#CED4DA] py-2 px-6 text-xs text-[#495057] select-none shrink-0">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
          <div className="flex items-center gap-2 font-bold" style={{ color: '#0B5FA5' }}>
            <span>अखिल भारतीय आयुर्वेद संस्थान (AIIA)</span>
            <span className="text-[#CED4DA]">|</span>
            <span className="font-semibold text-[#495057]">OPD Terminal #01</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#6C757D]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2F7D4F]" />
            <span>ABDM National Health Gateway Integration</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
