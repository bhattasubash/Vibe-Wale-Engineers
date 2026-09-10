import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowLeft, ArrowRight, Edit3, Activity, Scale, Stethoscope, Camera } from 'lucide-react';
import { AudioSpeaker } from '@/components/ui/AudioSpeaker';
import { useSessionStore } from '@/stores/sessionStore';

export const ReviewScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    language,
    treatmentMode,
    patient,
    chiefComplaint,
    socrates,
    generalVitals,
    prakritiResult,
  } = useSessionStore();

  const isAyurveda = treatmentMode === 'ayurveda';

  const promptHindi =
    'कृपया अपने विवरण की जांच कर लें। सब सही होने पर पर्चा फोटो खींचने के लिए आगे बढ़ें।';
  const promptEnglish =
    'Please review your case summary. If all details are accurate, proceed to photograph old prescriptions.';

  return (
    <div className="flex flex-col h-[calc(100vh-76px)] max-h-[calc(100vh-76px)] bg-[#EAEDF0] text-[#212529] justify-between font-sans select-none overflow-hidden">
      
      {/* Non-Scrollable Centered Main Container */}
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-2 flex-1 flex flex-col justify-evenly items-center">
        
        {/* Top Prompter */}
        <div className="shrink-0">
          <AudioSpeaker
            hindiText={promptHindi}
            englishText={promptEnglish}
            autoPlay={true}
          />
        </div>

        {/* Header Badge */}
        <div className="text-center shrink-0">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-[3px] border text-[11px] font-bold uppercase tracking-wider mb-1"
            style={{
              backgroundColor: isAyurveda ? '#EDF7F1' : '#E8F1F8',
              borderColor: isAyurveda ? 'rgba(47, 125, 79, 0.4)' : 'rgba(11, 95, 165, 0.3)',
              color: isAyurveda ? '#2F7D4F' : '#0B5FA5',
            }}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'विवरण समीक्षा' : 'Case Summary Review'}</span>
          </div>

          <h1
            className="text-2xl sm:text-3xl font-black tracking-tight"
            style={{ color: '#0B5FA5' }}
          >
            {language === 'hi' ? 'अपनी जानकारी की जांच करें' : 'Verify Your Details'}
          </h1>
          <p className="text-xs sm:text-sm text-[#495057] font-semibold">
            {language === 'hi'
              ? 'यह विवरण सीधे आपके परामर्श चिकित्सक के कंप्यूटर पर भेजा जाएगा।'
              : 'This summary will be transmitted directly to your consulting physician.'}
          </p>
        </div>

        {/* AUTHENTIC WHITE PAPER CASE SHEET CONTAINER */}
        <div className="w-full max-w-2xl bg-white border border-[#CED4DA] rounded-[3px] p-4 sm:p-5 shadow-sm text-left shrink-0">
          
          {/* Institutional Letterhead Strip */}
          <div className="border-b-2 border-[#0B5FA5] pb-2 mb-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-[#0B5FA5] tracking-wider block">
                अखिल भारतीय आयुर्वेद संस्थान (AIIA), नई दिल्ली
              </span>
              <span className="text-xs sm:text-sm font-black text-[#212529]">
                {isAyurveda ? 'आयुष ओपीडी पूर्व-परामर्श विवरण' : 'सामान्य चिकित्सा ओपीडी पूर्व-परामर्श विवरण'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-[#495057]">ओपीडी परामर्श कक्ष</span>
            </div>
          </div>

          {/* 1. ROGI VIVARANA (DEMOGRAPHICS) */}
          <div className="border-b border-[#CED4DA] pb-2 mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="font-black text-xs text-[#0B5FA5] uppercase tracking-wider">
                1. रोगी विवरण (Patient Details)
              </span>
              <button
                type="button"
                onClick={() => navigate('/kiosk/identify')}
                className="text-[10px] font-bold text-[#0B5FA5] hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>बदलें (Edit)</span>
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 text-[#495057] text-[11px]">
              <div>
                <span className="text-[10px] text-[#6C757D] block">रोगी का नाम:</span>
                <span className="font-bold text-[#212529]">{patient.fullName || 'नागरिक'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6C757D] block">आयु / लिंग:</span>
                <span className="font-bold text-[#212529]">
                  {patient.age ? `${patient.age} वर्ष` : 'उल्लेख नहीं'} / {patient.gender === 'female' ? 'महिला' : patient.gender === 'male' ? 'पुरुष' : 'अन्य'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#6C757D] block">आभा संख्या (ABHA):</span>
                <span className="font-mono font-bold text-[#212529]">{patient.abhaId || 'लागू नहीं'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6C757D] block">विभाग:</span>
                <span className="font-bold text-[#0B5FA5]">
                  {isAyurveda ? 'आयुर्वेद (कमरा 104)' : 'सामान्य चिकित्सा (कमरा 205)'}
                </span>
              </div>
            </div>
          </div>

          {/* 2. PRADHANA VEDANA (CHIEF COMPLAINT) */}
          <div className="border-b border-[#CED4DA] pb-2 mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="font-black text-xs text-[#0B5FA5] uppercase tracking-wider flex items-center gap-1">
                <Activity className="w-3 h-3 text-[#0B5FA5]" />
                <span>2. मुख्य स्वास्थ्य समस्या (Primary Symptoms)</span>
              </span>
              <button
                type="button"
                onClick={() => navigate('/kiosk/complaint')}
                className="text-[10px] font-bold text-[#0B5FA5] hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>बदलें (Edit)</span>
              </button>
            </div>
            <div className="bg-[#F8FAFC] border border-[#CED4DA] p-2 rounded-[2px] text-[11px]">
              <div className="flex justify-between items-center mb-1">
                <span className="font-black text-[#212529]">
                  {chiefComplaint || 'उल्लेख नहीं (Not recorded)'}
                </span>
                {(socrates as any).anger_irritation ? (
                  <span className="text-[10px] font-bold text-[#0B5FA5]">
                    गुस्सा/चिड़चिड़ापन: {(socrates as any).anger_irritation === 'yes' ? 'हाँ (Yes)' : 'नहीं (No)'}
                  </span>
                ) : socrates.severity && !String(socrates.severity).includes('/10') ? (
                  <span className="text-[10px] font-bold text-[#0B5FA5]">
                    तीव्रता: {socrates.severity}
                  </span>
                ) : null}
              </div>
              <div className="text-[#6C757D] text-[10px] space-x-2">
                <span>स्थान: {socrates.site || 'उल्लेख नहीं'}</span>
                <span>•</span>
                <span>अवधि: {socrates.onset || 'उल्लेख नहीं'}</span>
                {(socrates as any).timing && (
                  <>
                    <span>•</span>
                    <span>स्थिति: {(socrates as any).timing}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 3. ASSESSMENT: PRAKRITI (CALM CONFIRMATION, NO BARS) vs VITALS */}
          {isAyurveda ? (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-black text-xs text-[#2F7D4F] uppercase tracking-wider flex items-center gap-1">
                  <Scale className="w-3.5 h-3.5 text-[#2F7D4F]" />
                  <span>3. शारीरिक प्रकृति विवरण (Body Constitution)</span>
                </span>
                <button
                  type="button"
                  onClick={() => navigate('/kiosk/prakriti')}
                  className="text-[10px] font-bold text-[#2F7D4F] hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>बदलें (Edit)</span>
                </button>
              </div>

              {/* Calm, reassuring patient confirmation - zero confusing percentages */}
              <div className="p-3 bg-[#EDF7F1] border border-[#2F7D4F]/40 rounded-[2px] text-left">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-[#186036] shrink-0" />
                  <span className="text-xs font-black text-[#186036]">
                    प्रकृति संबंधी 15 प्रश्नों के उत्तर दर्ज हो चुके हैं
                  </span>
                </div>
                <p className="text-[11px] text-[#495057] font-medium leading-relaxed">
                  आपके स्वभाव, खान-पान और शारीरिक आदतों का विवरण सुरक्षित रूप से डॉक्टर के पास भेज दिया गया है। चिकित्सक परामर्श के समय इसका परीक्षण करेंगे।
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-black text-xs text-[#0B5FA5] uppercase tracking-wider flex items-center gap-1">
                  <Stethoscope className="w-3.5 h-3.5 text-[#0B5FA5]" />
                  <span>3. सामान्य चिकित्सा स्वास्थ्य इतिहास (Medical History)</span>
                </span>
                <button
                  type="button"
                  onClick={() => navigate('/kiosk/vitals')}
                  className="text-[10px] font-bold text-[#0B5FA5] hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>बदलें (Edit)</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-semibold">
                <div className="p-2 bg-[#F8FAFC] border border-[#CED4DA] rounded-[2px]">
                  <span className="text-[10px] text-[#6C757D] block">उच्च रक्तचाप (BP):</span>
                  <span className="font-bold text-[#212529]">
                    {generalVitals.bloodPressureHistory === 'yes'
                      ? 'हाँ (Yes)'
                      : generalVitals.bloodPressureHistory === 'no'
                      ? 'नहीं (No)'
                      : generalVitals.bloodPressureHistory || 'उल्लेख नहीं'}
                  </span>
                </div>

                <div className="p-2 bg-[#F8FAFC] border border-[#CED4DA] rounded-[2px]">
                  <span className="text-[10px] text-[#6C757D] block">बीपी की दवा:</span>
                  <span className="font-bold text-[#212529]">
                    {generalVitals.bpMedication === 'yes'
                      ? 'हाँ (Yes)'
                      : generalVitals.bpMedication === 'no'
                      ? 'नहीं (No)'
                      : generalVitals.bpMedication || 'उल्लेख नहीं'}
                  </span>
                </div>

                <div className="p-2 bg-[#F8FAFC] border border-[#CED4DA] rounded-[2px]">
                  <span className="text-[10px] text-[#6C757D] block">मधुमेह (Diabetes):</span>
                  <span className="font-bold text-[#212529]">
                    {generalVitals.diabetesStatus === 'yes'
                      ? 'हाँ (Yes)'
                      : generalVitals.diabetesStatus === 'no'
                      ? 'नहीं (No)'
                      : generalVitals.diabetesStatus || 'उल्लेख नहीं'}
                  </span>
                </div>

                <div className="p-2 bg-[#F8FAFC] border border-[#CED4DA] rounded-[2px]">
                  <span className="text-[10px] text-[#6C757D] block">शुगर की दवा:</span>
                  <span className="font-bold text-[#212529]">
                    {generalVitals.diabetesMedication === 'yes'
                      ? 'हाँ (Yes)'
                      : generalVitals.diabetesMedication === 'no'
                      ? 'नहीं (No)'
                      : generalVitals.diabetesMedication || 'उल्लेख नहीं'}
                  </span>
                </div>

                <div className="p-2 bg-[#F8FAFC] border border-[#CED4DA] rounded-[2px]">
                  <span className="text-[10px] text-[#6C757D] block">औषध एलर्जी (Allergies):</span>
                  <span className="font-bold text-[#212529]">
                    {generalVitals.knownAllergies === 'yes'
                      ? 'हाँ (Yes)'
                      : generalVitals.knownAllergies === 'no'
                      ? 'नहीं (No)'
                      : generalVitals.knownAllergies || 'उल्लेख नहीं'}
                  </span>
                </div>

                <div className="p-2 bg-[#F8FAFC] border border-[#CED4DA] rounded-[2px]">
                  <span className="text-[10px] text-[#6C757D] block">पूर्व सर्जरी/भर्ती (Surgeries):</span>
                  <span className="font-bold text-[#212529]">
                    {generalVitals.pastSurgeries === 'yes'
                      ? 'हाँ (Yes)'
                      : generalVitals.pastSurgeries === 'no'
                      ? 'नहीं (No)'
                      : generalVitals.pastSurgeries || 'उल्लेख नहीं'}
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* 2 ACTION BUTTONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl shrink-0">
          <button
            type="button"
            onClick={() => navigate('/kiosk/documents')}
            className="h-12 sm:h-14 px-6 rounded-[3px] border border-[#084B83] text-sm sm:text-base font-black text-white flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.98]"
            style={{ backgroundColor: '#0B5FA5' }}
          >
            <Camera className="w-5 h-5 text-white" />
            <span>{language === 'hi' ? 'पुराने पर्चे जोड़ें (वैकल्पिक)' : 'Add Prescriptions / Reports'}</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/kiosk/token')}
            className="h-12 sm:h-14 px-4 rounded-[3px] border border-[#CED4DA] bg-white hover:bg-[#EAEDF0] font-black text-xs sm:text-sm text-[#495057] flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.98]"
          >
            <span>{language === 'hi' ? 'पर्चा नहीं है (सीधे टोकन लें)' : 'No Documents (Get Token)'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Back Button */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={() => navigate(isAyurveda ? '/kiosk/prakriti' : '/kiosk/vitals')}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-[3px] border border-[#CED4DA] bg-white hover:border-[#0B5FA5] hover:text-[#0B5FA5] text-xs font-bold text-[#212529] transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>पिछले पृष्ठ पर वापस जाएं (Back)</span>
          </button>
        </div>

      </main>

      {/* Persistent Single-Line Clean Footer */}
      <footer className="w-full bg-white border-t border-[#CED4DA] py-2 px-6 text-xs text-[#495057] select-none shrink-0">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
          <div className="flex items-center gap-2 font-bold" style={{ color: '#0B5FA5' }}>
            <span>अखिल भारतीय आयुर्वेद संस्थान (AIIA)</span>
            <span className="text-[#CED4DA]">|</span>
            <span className="font-semibold text-[#495057]">नई दिल्ली</span>
          </div>
          <div className="text-[11px] font-semibold text-[#6C757D]">
            <span>राष्ट्रीय आयुष मिशन • ओपीडी सेवा</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
