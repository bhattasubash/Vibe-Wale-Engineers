import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Edit3, ArrowLeft, ArrowRight, Activity, Scale, ShieldCheck } from 'lucide-react';
import { AudioSpeaker } from '@/components/ui/AudioSpeaker';
import { useSessionStore } from '@/stores/sessionStore';

export const ReviewScreen: React.FC = () => {
  const navigate = useNavigate();
  const { language, patient, chiefComplaint, prakritiResult } = useSessionStore();

  const promptHindi =
    'कृपया अपने उत्तरों की जांच करें। यदि सभी विवरण सही हैं, तो पुराने पर्चे या रिपोर्ट अपलोड करने के लिए नीचे दिए गए नीले बटन को दबाएं।';
  const promptEnglish =
    'Please review your entered details. If all information is correct, proceed to upload past medical prescriptions.';

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

        {/* Title Area */}
        <div className="text-center shrink-0">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-[3px] border text-[11px] font-bold uppercase tracking-wider mb-1"
            style={{
              backgroundColor: '#E8F1F8',
              borderColor: 'rgba(11, 95, 165, 0.3)',
              color: '#0B5FA5',
            }}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>चरण 4: विवरण सत्यापन • CASE INTAKE REVIEW</span>
          </div>

          <h1
            className="text-2xl sm:text-3xl font-black tracking-tight"
            style={{ color: '#0B5FA5' }}
          >
            {language === 'hi' ? 'अपने विवरण की पुष्टि करें' : 'Verify Your Case Summary'}
          </h1>
          <p className="text-xs sm:text-sm text-[#495057] font-semibold">
            {language === 'hi'
              ? 'डॉक्टर को भेजने से पहले जांचें। सुधार के लिए "बदलें" पर दबाएं।'
              : 'Review your case history before sending to the doctor.'}
          </p>
        </div>

        {/* 3 CONCISE NON-SCROLLABLE REVIEW CARDS */}
        <div className="w-full max-w-2xl space-y-2.5 shrink-0">
          
          {/* SECTION 1: DEMOGRAPHICS */}
          <div className="bg-white border border-[#CED4DA] rounded-[3px] p-3 text-xs font-semibold">
            <div className="flex items-center justify-between border-b pb-1.5 mb-1.5">
              <span className="font-extrabold text-xs text-[#0B5FA5]">1. रोगी पहचान (Patient Details)</span>
              <button
                type="button"
                onClick={() => navigate('/kiosk/identify')}
                className="text-[11px] font-bold text-[#0B5FA5] hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>बदलें (Edit)</span>
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2 text-[#495057]">
              <div>
                <span className="text-[10px] text-[#6C757D] block">नाम:</span>
                <span className="font-black text-[#212529] truncate block">{patient.fullName || 'रामेश्वर दयाल शर्मा'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6C757D] block">आयु/लिंग:</span>
                <span className="font-bold text-[#212529]">{patient.age || 62} वर्ष / पुरुष</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6C757D] block">मोबाइल:</span>
                <span className="font-mono font-bold text-[#212529]">{patient.phone || '9876543210'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6C757D] block">आभा स्थिति:</span>
                <span className="font-bold text-[#15803D]">ABDM Verified</span>
              </div>
            </div>
          </div>

          {/* SECTION 2: CHIEF COMPLAINT */}
          <div className="bg-white border border-[#CED4DA] rounded-[3px] p-3 text-xs font-semibold">
            <div className="flex items-center justify-between border-b pb-1.5 mb-1.5">
              <span className="font-extrabold text-xs text-[#0B5FA5] flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-[#0B5FA5]" />
                <span>2. मुख्य लक्षण एवं SOCRATES इतिहास</span>
              </span>
              <button
                type="button"
                onClick={() => navigate('/kiosk/complaint')}
                className="text-[11px] font-bold text-[#0B5FA5] hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>बदलें (Edit)</span>
              </button>
            </div>
            <div className="flex items-center justify-between text-[#212529]">
              <div>
                <span className="text-[10px] text-[#6C757D] block">मुख्य समस्या:</span>
                <span className="font-black text-xs text-[#212529]">{chiefComplaint || 'जोड़ों व घुटनों में दर्द (संधिवात)'}</span>
              </div>
              <div className="text-[11px] text-[#495057] font-semibold text-right">
                <span>स्थान: दोनों घुटने • अवधि: 6 महीने से अधिक • तीव्रता: 7/10</span>
              </div>
            </div>
          </div>

          {/* SECTION 3: PRAKRITI SCORECARD */}
          <div className="bg-white border border-[#CED4DA] rounded-[3px] p-3 text-xs font-semibold">
            <div className="flex items-center justify-between border-b pb-1.5 mb-1.5">
              <span className="font-extrabold text-xs text-[#2F7D4F] flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-[#2F7D4F]" />
                <span>3. चरक संहिता प्रकृति स्कोरकार्ड (Constitutional Typology)</span>
              </span>
              <button
                type="button"
                onClick={() => navigate('/kiosk/prakriti')}
                className="text-[11px] font-bold text-[#2F7D4F] hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>बदलें (Edit)</span>
              </button>
            </div>

            <div className="flex items-center justify-between p-2 bg-[#EDF7F1] border border-[#2F7D4F]/30 rounded-[2px] mb-2">
              <span className="text-xs font-black text-[#1E4620]">
                {prakritiResult?.dominantPrakriti || 'PITTA-KAPHA (द्वन्द्वज प्रकृति)'}
              </span>
              <span className="text-[10px] font-bold text-[#2F7D4F]">15 मापदंड सत्यापित</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="p-1.5 bg-[#E8F1F8] rounded-[2px] text-center">
                <span className="text-[10px] text-[#0B5FA5] block">वात (Vata):</span>
                <span className="font-black text-xs text-[#0B5FA5]">{prakritiResult?.vataScore || 20}%</span>
              </div>
              <div className="p-1.5 bg-[#FFF4EB] rounded-[2px] text-center">
                <span className="text-[10px] text-[#E07B1A] block">पित्त (Pitta):</span>
                <span className="font-black text-xs text-[#E07B1A]">{prakritiResult?.pittaScore || 53}%</span>
              </div>
              <div className="p-1.5 bg-[#EDF7F1] rounded-[2px] text-center">
                <span className="text-[10px] text-[#2F7D4F] block">कफ (Kapha):</span>
                <span className="font-black text-xs text-[#2F7D4F]">{prakritiResult?.kaphaScore || 27}%</span>
              </div>
            </div>
          </div>

        </div>

        {/* 2 ACTION BUTTONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl shrink-0">
          <button
            type="button"
            onClick={() => navigate('/kiosk/token')}
            className="h-12 sm:h-14 px-4 rounded-[3px] border border-[#CED4DA] bg-white hover:bg-[#EAEDF0] font-black text-xs sm:text-sm text-[#495057] flex items-center justify-center cursor-pointer transition-transform active:scale-[0.98]"
          >
            <span>पर्चे नहीं हैं • सीधे टोकन लें</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/kiosk/documents')}
            className="h-12 sm:h-14 px-6 rounded-[3px] border border-[#084B83] text-sm sm:text-base font-black text-white flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.98]"
            style={{ backgroundColor: '#0B5FA5' }}
          >
            <span>पुराने पर्चे अपलोड करें • UPLOAD DOCS</span>
            <ArrowRight className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Back Button */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={() => navigate('/kiosk/prakriti')}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-[3px] border border-[#CED4DA] bg-white hover:border-[#0B5FA5] hover:text-[#0B5FA5] text-xs font-bold text-[#212529] transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>प्रकृति प्रश्नों पर वापस जाएं (Back)</span>
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
          <div className="flex items-center gap-1 text-[11px] font-semibold text-[#6C757D]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2F7D4F]" />
            <span>Verified Patient Clinical Record</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
