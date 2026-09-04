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
            bilingual={language === 'hi'}
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
            <span>चरण 4: केस शीट सारांश समीक्षा • CASE SUMMARY REVIEW</span>
          </div>

          <h1
            className="text-2xl sm:text-3xl font-black tracking-tight"
            style={{ color: '#0B5FA5' }}
          >
            {language === 'hi' ? 'अपनी जानकारी की जांच करें' : 'Verify Your Clinical Case Summary'}
          </h1>
          <p className="text-xs sm:text-sm text-[#495057] font-semibold">
            {language === 'hi'
              ? 'यह आधिकारिक केस शीट सीधे डॉक्टर के कंप्यूटर पर भेजी जाएगी।'
              : 'This official case sheet will be dispatched directly to the physician.'}
          </p>
        </div>

        {/* AUTHENTIC A4 WHITE PAPER CLINICAL CASE SHEET CONTAINER */}
        <div className="w-full max-w-2xl bg-white border border-[#CED4DA] rounded-[3px] p-4 sm:p-5 shadow-sm text-left shrink-0">
          
          {/* Institutional Letterhead Strip */}
          <div className="border-b-2 border-[#0B5FA5] pb-2 mb-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-[#0B5FA5] tracking-wider block">
                अखिल भारतीय आयुर्वेद संस्थान (AIIA), नई दिल्ली
              </span>
              <span className="text-xs sm:text-sm font-black text-[#212529]">
                {isAyurveda ? 'आयुष ओपीडी पूर्व-परामर्श केस शीट (Ayurveda OPD Case Sheet)' : 'सामान्य चिकित्सा ओपीडी केस शीट (General Medicine Case Sheet)'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-mono text-[#6C757D] block">DPDP Act 2023 Compliant</span>
              <span className="text-[10px] font-mono font-bold text-[#2F7D4F]">ABDM-FHIR-R4</span>
            </div>
          </div>

          {/* 1. ROGI VIVARANA (DEMOGRAPHICS) */}
          <div className="border-b border-[#CED4DA] pb-2 mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="font-black text-xs text-[#0B5FA5] uppercase tracking-wider">
                1. रोगी विवरण (Patient Demographics)
              </span>
              <button
                type="button"
                onClick={() => navigate('/kiosk/identify')}
                className="text-[10px] font-bold text-[#0B5FA5] hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>संशोधन (Edit)</span>
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 text-[#495057] text-[11px]">
              <div>
                <span className="text-[10px] text-[#6C757D] block">रोगी का नाम:</span>
                <span className="font-bold text-[#212529]">{patient.fullName || 'रामेश्वर दयाल शर्मा'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6C757D] block">आयु / लिंग:</span>
                <span className="font-bold text-[#212529]">{patient.age || 62} वर्ष / {patient.gender === 'female' ? 'महिला' : 'पुरुष'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6C757D] block">आभा संख्या (ABHA):</span>
                <span className="font-mono font-bold text-[#212529]">{patient.abhaId || '91-4523-8901-2345'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6C757D] block">विभाग / कमरा:</span>
                <span className="font-bold text-[#0B5FA5]">
                  {isAyurveda ? 'कायचिकित्सा (Room 104)' : 'जनरल मेडिसिन (Room 205)'}
                </span>
              </div>
            </div>
          </div>

          {/* 2. PRADHANA VEDANA (CHIEF COMPLAINT & SOCRATES) */}
          <div className="border-b border-[#CED4DA] pb-2 mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="font-black text-xs text-[#0B5FA5] uppercase tracking-wider flex items-center gap-1">
                <Activity className="w-3 h-3 text-[#0B5FA5]" />
                <span>2. प्रधान वेदना एवं रोग इतिहास (Chief Complaint & Timeline)</span>
              </span>
              <button
                type="button"
                onClick={() => navigate('/kiosk/complaint')}
                className="text-[10px] font-bold text-[#0B5FA5] hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>संशोधन (Edit)</span>
              </button>
            </div>
            <div className="bg-[#F8FAFC] border border-[#CED4DA] p-2 rounded-[2px] text-[11px]">
              <div className="flex justify-between items-center mb-1">
                <span className="font-black text-[#212529]">
                  {chiefComplaint || 'दोनों घुटनों में कट-कट की आवाज, सूजन व तेज दर्द (Sandhivata)'}
                </span>
                <span className="text-[10px] font-bold text-[#DC2626]">
                  तीव्रता: {socrates.severity || '7/10'} (Moderate-Severe)
                </span>
              </div>
              <div className="text-[#6C757D] text-[10px] space-x-2">
                <span>स्थान: {socrates.site || 'जानु संधि (Bilateral Knees)'}</span>
                <span>•</span>
                <span>अवधि: {socrates.onset || '6+ महीने'}</span>
                <span>•</span>
                <span>ट्रिगर: {socrates.timing || 'प्रातः काल / श्रम'}</span>
              </div>
            </div>
          </div>

          {/* 3. ADAPTIVE ASSESSMENT: AYURVEDA PRAKRITI vs ALLOPATHY VITALS */}
          {isAyurveda ? (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-black text-xs text-[#2F7D4F] uppercase tracking-wider flex items-center gap-1">
                  <Scale className="w-3.5 h-3.5 text-[#2F7D4F]" />
                  <span>3. चरक संहिता प्रकृति निर्धारण (Constitutional Typology)</span>
                </span>
                <button
                  type="button"
                  onClick={() => navigate('/kiosk/prakriti')}
                  className="text-[10px] font-bold text-[#2F7D4F] hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>संशोधन (Edit)</span>
                </button>
              </div>

              <div className="flex items-center justify-between p-2 bg-[#EDF7F1] border border-[#2F7D4F]/40 rounded-[2px] mb-1.5">
                <div>
                  <span className="text-[9px] font-bold uppercase text-[#2F7D4F] block">मूल प्रकृति:</span>
                  <span className="text-sm font-black text-[#1E4620]">
                    {prakritiResult?.dominantPrakriti || 'PITTA-KAPHA (द्वन्द्वज)'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-bold uppercase text-[#2F7D4F] block">आत्मविश्वास स्तर:</span>
                  <span className="text-xs font-black text-[#1E4620]">मध्यम (Medium)</span>
                </div>
              </div>

              {/* 3 Tridosha Mini Bars */}
              <div className="grid grid-cols-3 gap-2 text-[10px] font-bold">
                <div className="p-1.5 bg-[#F8FAFC] border border-[#CED4DA] rounded-[2px]">
                  <span className="text-[#0B5FA5] block">वात (Vata): {prakritiResult?.vataScore ?? 20}%</span>
                  <div className="w-full h-1 bg-[#CED4DA] rounded-full mt-0.5 overflow-hidden">
                    <div className="h-full bg-[#0B5FA5]" style={{ width: `${prakritiResult?.vataScore ?? 20}%` }} />
                  </div>
                </div>
                <div className="p-1.5 bg-[#F8FAFC] border border-[#CED4DA] rounded-[2px]">
                  <span className="text-[#E07B1A] block">पित्त (Pitta): {prakritiResult?.pittaScore ?? 53}%</span>
                  <div className="w-full h-1 bg-[#CED4DA] rounded-full mt-0.5 overflow-hidden">
                    <div className="h-full bg-[#E07B1A]" style={{ width: `${prakritiResult?.pittaScore ?? 53}%` }} />
                  </div>
                </div>
                <div className="p-1.5 bg-[#F8FAFC] border border-[#CED4DA] rounded-[2px]">
                  <span className="text-[#2F7D4F] block">कफ (Kapha): {prakritiResult?.kaphaScore ?? 27}%</span>
                  <div className="w-full h-1 bg-[#CED4DA] rounded-full mt-0.5 overflow-hidden">
                    <div className="h-full bg-[#2F7D4F]" style={{ width: `${prakritiResult?.kaphaScore ?? 27}%` }} />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-black text-xs text-[#0B5FA5] uppercase tracking-wider flex items-center gap-1">
                  <Stethoscope className="w-3.5 h-3.5 text-[#0B5FA5]" />
                  <span>3. सामान्य स्वास्थ्य व इतिहास (General Vitals & Allergies)</span>
                </span>
                <button
                  type="button"
                  onClick={() => navigate('/kiosk/vitals')}
                  className="text-[10px] font-bold text-[#0B5FA5] hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>संशोधन (Edit)</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold">
                <div className="p-2 bg-[#F8FAFC] border border-[#CED4DA] rounded-[2px]">
                  <span className="text-[10px] text-[#6C757D] block">रक्तचाप स्थिति (BP):</span>
                  <span className="font-bold text-[#212529]">
                    {generalVitals.bloodPressureHistory === 'hypertensive-meds'
                      ? 'उच्च रक्तचाप (दवा नियमित)'
                      : generalVitals.bloodPressureHistory || 'सामान्य'}
                  </span>
                </div>

                <div className="p-2 bg-[#F8FAFC] border border-[#CED4DA] rounded-[2px]">
                  <span className="text-[10px] text-[#6C757D] block">मधुमेह (Diabetes):</span>
                  <span className="font-bold text-[#212529]">
                    {generalVitals.diabetesStatus === 'diabetic-meds'
                      ? 'मधुमेह पीड़ित (दवा चल रही है)'
                      : generalVitals.diabetesStatus || 'सामान्य / नहीं'}
                  </span>
                </div>

                <div className="p-2 bg-[#F8FAFC] border border-[#CED4DA] rounded-[2px]">
                  <span className="text-[10px] text-[#6C757D] block">औषध एलर्जी (Allergies):</span>
                  <span className="font-bold text-[#15803D]">
                    {generalVitals.knownAllergies === 'allergy-none' || !generalVitals.knownAllergies
                      ? 'कोई ज्ञात दवा एलर्जी नहीं (NKDA)'
                      : generalVitals.knownAllergies}
                  </span>
                </div>

                <div className="p-2 bg-[#F8FAFC] border border-[#CED4DA] rounded-[2px]">
                  <span className="text-[10px] text-[#6C757D] block">पूर्व सर्जरी (Surgeries):</span>
                  <span className="font-bold text-[#212529]">
                    {generalVitals.pastSurgeries === 'no-surgery' || !generalVitals.pastSurgeries
                      ? 'कोई पूर्व बड़ा ऑपरेशन नहीं'
                      : generalVitals.pastSurgeries}
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
            <span>पुराने पर्चे स्कैन करें • SCAN RX & REPORTS</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/kiosk/token')}
            className="h-12 sm:h-14 px-4 rounded-[3px] border border-[#CED4DA] bg-white hover:bg-[#EAEDF0] font-black text-xs sm:text-sm text-[#495057] flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.98]"
          >
            <span>पर्चा नहीं है (सीधे टोकन लें) • SKIP TO TOKEN</span>
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
            <span className="font-semibold text-[#495057]">OPD Terminal #01</span>
          </div>
          <div className="text-[11px] font-semibold text-[#6C757D]">
            <span>DPDP Act 2023 & NHA Clinical Documentation Protocol</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
