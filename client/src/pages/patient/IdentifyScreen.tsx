import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, Phone, UserPlus, ArrowLeft, ArrowRight, CheckCircle2, RefreshCw, ShieldCheck, User } from 'lucide-react';
import { AudioSpeaker } from '@/components/ui/AudioSpeaker';
import { useSessionStore } from '@/stores/sessionStore';

export const IdentifyScreen: React.FC = () => {
  const navigate = useNavigate();
  const { language, setPatient, patient } = useSessionStore();

  const [activeTab, setActiveTab] = useState<'abha' | 'phone' | 'register'>('abha');
  const [isScanning, setIsScanning] = useState(false);
  const [scannedSuccess, setScannedSuccess] = useState(false);

  // Phone / Aadhaar Form State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);

  // Manual Register Form State
  const [regName, setRegName] = useState('');
  const [regAge, setRegAge] = useState<number | ''>('');
  const [regGender, setRegGender] = useState<'male' | 'female' | 'other' | ''>('');
  const [regPhone, setRegPhone] = useState('');

  // Audio Prompts
  const promptHindi =
    'कृपया अपना आभा कार्ड क्यूआर स्कैन करें या अपना मोबाइल नंबर दर्ज करके पंजीकरण करें।';
  const promptEnglish =
    'Please scan your ABHA QR code or enter your mobile number to register.';

  // Simulate ABHA QR Camera Scan
  const handleSimulateAbhaScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScannedSuccess(true);
      setPatient({
        fullName: 'रामेश्वर दयाल शर्मा (Rameshwar Sharma)',
        age: 62,
        gender: 'male',
        phone: '9876543210',
        abhaId: '91-4523-8901-2345',
        abhaAddress: 'rameshwar.sharma@abdm',
        aadhaarLastFour: '8912',
        isReturning: true,
        lastVisitDate: '14 अगस्त 2026 (OPD #104)',
      });
    }, 1500);
  };

  // Simulate Phone OTP Verification
  const handleSendOtp = () => {
    if (phoneNumber.length === 10) {
      setOtpSent(true);
    }
  };

  const handleVerifyOtp = () => {
    if (otpCode.length === 6 || otpCode === '123456') {
      setOtpVerified(true);
      setPatient({
        fullName: 'सुनीता देवी (Sunita Devi)',
        age: 58,
        gender: 'female',
        phone: phoneNumber,
        aadhaarLastFour: '4589',
        isReturning: false,
      });
    }
  };

  // Handle Manual Registration Form
  const handleManualRegister = () => {
    if (regName && regAge && regGender && regPhone.length === 10) {
      setPatient({
        fullName: regName,
        age: Number(regAge),
        gender: regGender,
        phone: regPhone,
        isReturning: false,
      });
      navigate('/kiosk/consent');
    }
  };

  // Proceed Handler
  const handleProceed = () => {
    navigate('/kiosk/consent');
  };

  // Large On-Screen Numeric Keypad for Elderly Touch Accessibility
  const handleKeypadPress = (val: string, target: 'phone' | 'otp') => {
    if (target === 'phone') {
      if (val === 'DEL') {
        setPhoneNumber((prev) => prev.slice(0, -1));
      } else if (phoneNumber.length < 10) {
        setPhoneNumber((prev) => prev + val);
      }
    } else {
      if (val === 'DEL') {
        setOtpCode((prev) => prev.slice(0, -1));
      } else if (otpCode.length < 6) {
        setOtpCode((prev) => prev + val);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-76px)] bg-[#EAEDF0] text-[#212529] justify-between font-sans select-none">
      
      {/* Central Card */}
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-8 flex-1 flex flex-col items-center">
        
        {/* Prompter */}
        <div className="mb-3">
          <AudioSpeaker
            hindiText={promptHindi}
            englishText={promptEnglish}
            bilingual={language === 'hi'}
            autoPlay={true}
          />
        </div>

        {/* Top Identification Badge */}
        <div
          className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-[3px] border text-[11px] font-bold uppercase tracking-wider mb-1.5"
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
          className="text-2xl sm:text-3xl font-black mb-1 tracking-tight text-center"
          style={{ color: '#0B5FA5' }}
        >
          {language === 'hi'
            ? 'अपनी पहचान दर्ज करें'
            : 'Identify or Register Patient'}
        </h1>
        <p className="text-xs sm:text-sm text-[#495057] font-semibold mb-4 text-center max-w-xl">
          {language === 'hi'
            ? 'आभा कार्ड क्यूआर स्कैन करें या अपना मोबाइल नंबर दर्ज करें।'
            : 'Scan your ABHA health QR code or enter mobile number to begin intake.'}
        </p>

        {/* 3 TABS SELECTOR */}
        <div className="grid grid-cols-3 gap-2 w-full max-w-2xl mb-4">
          
          {/* Tab 1: ABHA QR */}
          <button
            type="button"
            onClick={() => setActiveTab('abha')}
            className="py-2.5 px-3 rounded-[3px] border text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            style={{
              backgroundColor: activeTab === 'abha' ? '#0B5FA5' : '#FFFFFF',
              borderColor: activeTab === 'abha' ? '#084B83' : '#CED4DA',
              color: activeTab === 'abha' ? '#FFFFFF' : '#495057',
            }}
          >
            <QrCode className="w-4 h-4 shrink-0" />
            <span>{language === 'hi' ? 'आभा कार्ड QR' : 'ABHA QR Scan'}</span>
          </button>

          {/* Tab 2: Mobile / OTP */}
          <button
            type="button"
            onClick={() => setActiveTab('phone')}
            className="py-2.5 px-3 rounded-[3px] border text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            style={{
              backgroundColor: activeTab === 'phone' ? '#0B5FA5' : '#FFFFFF',
              borderColor: activeTab === 'phone' ? '#084B83' : '#CED4DA',
              color: activeTab === 'phone' ? '#FFFFFF' : '#495057',
            }}
          >
            <Phone className="w-4 h-4 shrink-0" />
            <span>{language === 'hi' ? 'मोबाइल OTP' : 'Phone / Aadhaar'}</span>
          </button>

          {/* Tab 3: Fresh Register */}
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className="py-2.5 px-3 rounded-[3px] border text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            style={{
              backgroundColor: activeTab === 'register' ? '#0B5FA5' : '#FFFFFF',
              borderColor: activeTab === 'register' ? '#084B83' : '#CED4DA',
              color: activeTab === 'register' ? '#FFFFFF' : '#495057',
            }}
          >
            <UserPlus className="w-4 h-4 shrink-0" />
            <span>{language === 'hi' ? 'नया पंजीकरण' : 'Register New'}</span>
          </button>

        </div>

        {/* TAB 1 CONTENT: ABHA QR SCANNER */}
        {activeTab === 'abha' && (
          <div className="w-full max-w-2xl bg-white border border-[#CED4DA] rounded-[3px] p-5 flex flex-col items-center text-center">
            
            {!scannedSuccess ? (
              <>
                <div className="text-xs font-extrabold text-[#495057] uppercase tracking-wider mb-3">
                  आयुष्मान भारत डिजिटल मिशन (ABDM) स्वास्थ्य आईडी स्कैनर
                </div>

                {/* Simulated Camera Viewfinder Box */}
                <div className="relative w-64 h-64 sm:w-72 sm:h-72 bg-[#1A202C] rounded-[3px] border-2 border-dashed border-[#0B5FA5] flex flex-col items-center justify-center overflow-hidden mb-4">
                  
                  {isScanning ? (
                    <div className="flex flex-col items-center gap-2 text-white">
                      <RefreshCw className="w-8 h-8 text-[#0B5FA5] animate-spin" />
                      <span className="text-xs font-bold">आभा कोड पढ़ा जा रहा है... (Reading QR)</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-white/80 p-4">
                      <QrCode className="w-16 h-16 text-[#0B5FA5]" />
                      <span className="text-xs font-bold text-center">
                        अपना आभा कार्ड / आरोग्य सेतु QR कोड कैमरे के सामने रखें
                      </span>
                      <span className="text-[10px] text-gray-400">
                        Hold ABHA Card or Ayushman App QR in frame
                      </span>
                    </div>
                  )}

                  {/* Scanning Laser Line */}
                  <div className="absolute inset-x-0 h-0.5 bg-[#0B5FA5] animate-pulse top-1/2"></div>
                </div>

                {/* Trigger Button */}
                <button
                  type="button"
                  onClick={handleSimulateAbhaScan}
                  disabled={isScanning}
                  className="w-full max-w-sm py-3 px-6 rounded-[3px] border border-[#084B83] text-sm font-black text-white cursor-pointer transition-transform active:scale-[0.99]"
                  style={{ backgroundColor: '#0B5FA5' }}
                >
                  {isScanning ? 'स्कैन हो रहा है...' : 'QR स्कैन करें • TAP TO SCAN ABHA'}
                </button>
              </>
            ) : (
              /* Verified ABHA Patient Card */
              <div className="w-full text-left">
                <div className="flex items-center gap-2 text-xs font-bold text-[#15803D] bg-[#F0FDF4] border border-[#15803D]/30 p-2 rounded-[2px] mb-3">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
                  <span>आभा प्रोफाइल सफलतापूर्वक सत्यापित! (ABHA Profile Verified)</span>
                </div>

                <div className="border border-[#CED4DA] p-4 rounded-[3px] bg-[#F8FAFC] space-y-2 text-xs font-medium">
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-[#6C757D] font-bold">रोगी का नाम (Full Name):</span>
                    <span className="font-extrabold text-[#212529] text-sm">{patient.fullName}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-[#6C757D] font-bold">आयु / लिंग (Age / Gender):</span>
                    <span className="font-bold text-[#212529]">
                      {patient.age} वर्ष / {patient.gender === 'male' ? 'पुरुष (Male)' : 'महिला (Female)'}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-[#6C757D] font-bold">आभा संख्या (ABHA ID):</span>
                    <span className="font-mono font-bold text-[#0B5FA5]">{patient.abhaId}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-[#6C757D] font-bold">आभा पता (Health Address):</span>
                    <span className="font-mono font-bold text-[#212529]">{patient.abhaAddress}</span>
                  </div>

                  {/* Returning Patient Intelligence Tag */}
                  {patient.isReturning && (
                    <div className="mt-2 p-2 bg-[#FFF4EB] border border-[#E07B1A]/40 rounded-[2px] text-[#E07B1A] font-bold flex items-center justify-between">
                      <span>पिछला परामर्श इतिहास उपलब्ध (Returning Patient)</span>
                      <span className="text-[11px] font-medium">{patient.lastVisitDate}</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleProceed}
                  className="w-full mt-4 py-3.5 px-6 rounded-[3px] border border-[#084B83] text-base font-black text-white flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.99]"
                  style={{ backgroundColor: '#0B5FA5' }}
                >
                  <span>सहमति पृष्ठ पर आगे बढ़ें • PROCEED TO CONSENT</span>
                  <ArrowRight className="w-5 h-5 text-white" />
                </button>
              </div>
            )}

          </div>
        )}

        {/* TAB 2 CONTENT: PHONE / AADHAAR OTP */}
        {activeTab === 'phone' && (
          <div className="w-full max-w-2xl bg-white border border-[#CED4DA] rounded-[3px] p-5 flex flex-col items-center">
            
            {!otpVerified ? (
              <div className="w-full max-w-md">
                
                {!otpSent ? (
                  <>
                    <label className="block text-xs font-bold text-[#495057] mb-1">
                      अपना 10-अंकों का मोबाइल नंबर दर्ज करें (10-Digit Mobile Number):
                    </label>
                    
                    {/* Display Field */}
                    <div className="w-full h-12 bg-[#F8FAFC] border-2 border-[#0B5FA5] rounded-[3px] flex items-center justify-center text-xl font-mono font-black text-[#212529] tracking-widest mb-3">
                      {phoneNumber ? phoneNumber : '__________'}
                    </div>

                    {/* Numeric Touch Keypad for Elderly Accessibility */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'DEL'].map((k) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => {
                            if (k === 'C') setPhoneNumber('');
                            else handleKeypadPress(k, 'phone');
                          }}
                          className="h-12 bg-white border border-[#CED4DA] hover:bg-[#E8F1F8] rounded-[3px] text-lg font-black text-[#212529] flex items-center justify-center cursor-pointer active:scale-95"
                        >
                          {k}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={phoneNumber.length !== 10}
                      className="w-full py-3 px-6 rounded-[3px] border border-[#084B83] text-sm font-black text-white cursor-pointer disabled:opacity-50"
                      style={{ backgroundColor: '#0B5FA5' }}
                    >
                      ओटीपी भेजें • SEND OTP
                    </button>
                  </>
                ) : (
                  <>
                    <div className="text-xs font-bold text-[#15803D] mb-2 text-center">
                      ओटीपी {phoneNumber} पर भेजा गया है (Demo OTP: 123456)
                    </div>

                    <div className="w-full h-12 bg-[#F8FAFC] border-2 border-[#0B5FA5] rounded-[3px] flex items-center justify-center text-xl font-mono font-black text-[#212529] tracking-widest mb-3">
                      {otpCode ? otpCode : '______'}
                    </div>

                    {/* Numeric Keypad for OTP */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'DEL'].map((k) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => {
                            if (k === 'C') setOtpCode('');
                            else handleKeypadPress(k, 'otp');
                          }}
                          className="h-12 bg-white border border-[#CED4DA] hover:bg-[#E8F1F8] rounded-[3px] text-lg font-black text-[#212529] flex items-center justify-center cursor-pointer active:scale-95"
                        >
                          {k}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={otpCode.length < 6}
                      className="w-full py-3 px-6 rounded-[3px] border border-[#084B83] text-sm font-black text-white cursor-pointer disabled:opacity-50"
                      style={{ backgroundColor: '#0B5FA5' }}
                    >
                      ओटीपी सत्यापित करें • VERIFY OTP
                    </button>
                  </>
                )}

              </div>
            ) : (
              <div className="w-full text-left">
                <div className="flex items-center gap-2 text-xs font-bold text-[#15803D] bg-[#F0FDF4] border border-[#15803D]/30 p-2 rounded-[2px] mb-3">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
                  <span>मोबाइल नंबर सत्यापित! (Mobile Verified)</span>
                </div>

                <div className="border border-[#CED4DA] p-4 rounded-[3px] bg-[#F8FAFC] space-y-2 text-xs font-medium">
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-[#6C757D] font-bold">रोगी का नाम:</span>
                    <span className="font-extrabold text-[#212529]">{patient.fullName}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-[#6C757D] font-bold">आयु / लिंग:</span>
                    <span className="font-bold text-[#212529]">{patient.age} वर्ष / महिला</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6C757D] font-bold">फोन नंबर:</span>
                    <span className="font-mono font-bold text-[#0B5FA5]">{patient.phone}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleProceed}
                  className="w-full mt-4 py-3.5 px-6 rounded-[3px] border border-[#084B83] text-base font-black text-white flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.99]"
                  style={{ backgroundColor: '#0B5FA5' }}
                >
                  <span>सहमति पृष्ठ पर आगे बढ़ें • PROCEED TO CONSENT</span>
                  <ArrowRight className="w-5 h-5 text-white" />
                </button>
              </div>
            )}

          </div>
        )}

        {/* TAB 3 CONTENT: FRESH REGISTRATION FORM */}
        {activeTab === 'register' && (
          <div className="w-full max-w-2xl bg-white border border-[#CED4DA] rounded-[3px] p-5">
            <div className="text-xs font-extrabold text-[#495057] uppercase tracking-wider mb-4 border-b pb-2">
              नया रोगी पंजीकरण (Walk-In Patient Registration)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
              
              {/* Full Name */}
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

              {/* Age */}
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

              {/* Gender */}
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

              {/* Mobile Phone */}
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
              className="w-full mt-5 py-3.5 px-6 rounded-[3px] border border-[#084B83] text-base font-black text-white flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-transform active:scale-[0.99]"
              style={{ backgroundColor: '#0B5FA5' }}
            >
              <span>पंजीकरण पूर्ण करें एवं आगे बढ़ें • SUBMIT & PROCEED</span>
              <ArrowRight className="w-5 h-5 text-white" />
            </button>
          </div>
        )}

        {/* Back Button */}
        <button
          type="button"
          onClick={() => navigate('/kiosk/language')}
          className="inline-flex items-center gap-1.5 px-4 py-2 mt-4 rounded-[3px] border border-[#CED4DA] bg-white hover:border-[#0B5FA5] hover:text-[#0B5FA5] text-xs font-bold text-[#212529] transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>भाषा बदलें (Change Language)</span>
        </button>

      </main>

      {/* Persistent Single-Line Clean Footer */}
      <footer className="w-full bg-white border-t border-[#CED4DA] py-2 px-6 text-xs text-[#495057] select-none">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
          <div className="flex items-center gap-2 font-bold" style={{ color: '#0B5FA5' }}>
            <span>अखिल भारतीय आयुर्वेद संस्थान (AIIA)</span>
            <span className="text-[#CED4DA]">|</span>
            <span className="font-semibold text-[#495057]">OPD Terminal #01</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#6C757D]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2F7D4F]" />
            <span>DPDP Act 2023 • ABDM Verified Gateway</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
