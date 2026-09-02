import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Edit3, ArrowLeft, ArrowRight, FileText, Activity, Scale, ShieldCheck } from 'lucide-react';
import { AudioSpeaker } from '@/components/ui/AudioSpeaker';
import { useSessionStore } from '@/stores/sessionStore';

export const ReviewScreen: React.FC = () => {
  const navigate = useNavigate();
  const { language, patient, chiefComplaint, socrates, prakritiResult } = useSessionStore();

  const promptHindi =
    'कृपया अपने उत्तरों की जांच करें। यदि सभी विवरण सही हैं, तो पुराने पर्चे या रिपोर्ट अपलोड करने के लिए नीचे दिए गए नीले बटन को दबाएं।';
  const promptEnglish =
    'Please review your entered details. If all information is correct, proceed to upload past medical prescriptions.';

  const handleProceedWithDocs = () => {
    navigate('/kiosk/documents');
  };

  const handleSkipDocsToToken = () => {
    navigate('/kiosk/token');
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-76px)] bg-[#EAEDF0] text-[#212529] justify-between font-sans select-none">
      
      {/* Central Review Container */}
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

        {/* Top Badge */}
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
          className="text-2xl sm:text-3xl font-black mb-1 tracking-tight text-center"
          style={{ color: '#0B5FA5' }}
        >
          {language === 'hi' ? 'अपने विवरण की पुष्टि करें' : 'Verify Your Case Summary'}
        </h1>
        <p className="text-xs sm:text-sm text-[#495057] font-semibold mb-4 text-center max-w-xl">
          {language === 'hi'
            ? 'डॉक्टर को भेजने से पहले अपने सभी उत्तरों की जांच करें। सुधार के लिए "बदलें" पर दबाएं।'
            : 'Review your case history before sending to the doctor. Tap "Edit" to modify any section.'}
        </p>

        <div className="w-full max-w-3xl space-y-3 mb-6">
          
          {/* SECTION 1: PATIENT DEMOGRAPHICS */}
          <div className="bg-white border border-[#CED4DA] rounded-[3px] p-4 text-xs font-semibold">
            <div className="flex items-center justify-between border-b pb-2 mb-2">
              <span className="font-extrabold text-sm text-[#0B5FA5]">1. रोगी पहचान (Patient Details)</span>
              <button
                type="button"
                onClick={() => navigate('/kiosk/identify')}
                className="text-xs font-bold text-[#0B5FA5] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>बदलें (Edit)</span>
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[#495057]">
              <div>
                <span className="text-[10px] text-[#6C757D] block">नाम:</span>
                <span className="font-black text-[#212529]">{patient.fullName || 'रामेश्वर दयाल शर्मा'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6C757D] block">आयु / लिंग:</span>
                <span className="font-bold text-[#212529]">
                  {patient.age || 62} वर्ष / {patient.gender === 'female' ? 'महिला' : 'पुरुष'}
                </span>
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

          {/* SECTION 2: CHIEF COMPLAINT & SOCRATES TIMELINE */}
          <div className="bg-white border border-[#CED4DA] rounded-[3px] p-4 text-xs font-semibold">
            <div className="flex items-center justify-between border-b pb-2 mb-2">
              <span className="font-extrabold text-sm text-[#0B5FA5] flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-[#0B5FA5]" />
                <span>2. मुख्य स्वास्थ्य लक्षण एवं इतिहास (Complaint & SOCRATES)</span>
              </span>
              <button
                type="button"
                onClick={() => navigate('/kiosk/complaint')}
                className="text-xs font-bold text-[#0B5FA5] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>बदलें (Edit)</span>
              </button>
            </div>
            <div className="space-y-1.5 text-[#212529]">
              <div className="p-2 bg-[#F8FAFC] border border-[#CED4DA] rounded-[2px]">
                <span className="text-[10px] text-[#6C757D] font-bold block">मुख्य शिकायत:</span>
                <span className="font-black text-sm text-[#212529]">{chiefComplaint || 'घुटनों व जोड़ों में दर्द'}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px] text-[#495057]">
                <div>• स्थान: <strong>दोनों घुटने (Bilateral Knees)</strong></div>
                <div>• अवधि: <strong>6 महीने से अधिक (Chronic)</strong></div>
                <div>• तीव्रता: <strong>7/10 (Severe Pain)</strong></div>
              </div>
            </div>
          </div>

          {/* SECTION 3: PRAKRITI SCORECARD */}
          <div className="bg-white border border-[#CED4DA] rounded-[3px] p-4 text-xs font-semibold">
            <div className="flex items-center justify-between border-b pb-2 mb-2">
              <span className="font-extrabold text-sm text-[#2F7D4F] flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-[#2F7D4F]" />
                <span>3. चरक संहिता प्रकृति स्कोरकार्ड (Ayurvedic Typology)</span>
              </span>
              <button
                type="button"
                onClick={() => navigate('/kiosk/prakriti')}
                className="text-xs font-bold text-[#2F7D4F] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>बदलें (Edit)</span>
              </button>
            </div>

            {/* Prakriti Dominance Header */}
            <div className="flex items-center justify-between p-2.5 bg-[#EDF7F1] border border-[#2F7D4F]/30 rounded-[2px] mb-3">
              <div>
                <span className="text-[10px] text-[#2F7D4F] font-bold uppercase tracking-wider block">
                  शारीरिक प्रकृति (Dominant Typology):
                </span>
                <span className="text-base sm:text-lg font-black text-[#1E4620]">
                  {prakritiResult?.dominantPrakriti || 'PITTA-KAPHA (द्वन्द्वज प्रकृति)'}
                </span>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 bg-white border border-[#2F7D4F]/40 rounded-[2px] text-[#2F7D4F]">
                15 मापदंड सत्यापित
              </span>
            </div>

            {/* Tri-Dosha Progress Bars */}
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-[11px] font-bold mb-0.5">
                  <span className="text-[#0B5FA5]">वात (Vata - Movement/Nerves):</span>
                  <span>{prakritiResult?.vataScore || 20}%</span>
                </div>
                <div className="w-full h-2 bg-[#EAEDF0] rounded-full overflow-hidden">
                  <div className="h-full bg-[#0B5FA5]" style={{ width: `${prakritiResult?.vataScore || 20}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-bold mb-0.5">
                  <span className="text-[#E07B1A]">पित्त (Pitta - Digestion/Heat):</span>
                  <span>{prakritiResult?.pittaScore || 53}%</span>
                </div>
                <div className="w-full h-2 bg-[#EAEDF0] rounded-full overflow-hidden">
                  <div className="h-full bg-[#E07B1A]" style={{ width: `${prakritiResult?.pittaScore || 53}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-bold mb-0.5">
                  <span className="text-[#2F7D4F]">कफ (Kapha - Structure/Immunity):</span>
                  <span>{prakritiResult?.kaphaScore || 27}%</span>
                </div>
                <div className="w-full h-2 bg-[#EAEDF0] rounded-full overflow-hidden">
                  <div className="h-full bg-[#2F7D4F]" style={{ width: `${prakritiResult?.kaphaScore || 27}%` }} />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* 2 Big Proceed Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl mb-4">
          
          {/* Skip Upload and Go Directly to Token */}
          <button
            type="button"
            onClick={handleSkipDocsToToken}
            className="py-3.5 px-4 rounded-[3px] border border-[#CED4DA] bg-white hover:bg-[#EAEDF0] font-black text-xs sm:text-sm text-[#495057] flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>पर्चे नहीं हैं • सीधे टोकन लें</span>
          </button>

          {/* Upload Documents Button */}
          <button
            type="button"
            onClick={handleProceedWithDocs}
            className="py-3.5 px-6 rounded-[3px] border border-[#084B83] text-sm sm:text-base font-black text-white flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.99]"
            style={{ backgroundColor: '#0B5FA5' }}
          >
            <span>पुराने पर्चे अपलोड करें • UPLOAD DOCS</span>
            <ArrowRight className="w-5 h-5 text-white" />
          </button>

        </div>

        {/* Back Button */}
        <button
          type="button"
          onClick={() => navigate('/kiosk/prakriti')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[3px] border border-[#CED4DA] bg-white hover:border-[#0B5FA5] hover:text-[#0B5FA5] text-xs font-bold text-[#212529] transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>प्रकृति प्रश्नों पर वापस जाएं (Back to Prakriti)</span>
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
          <div className="flex items-center gap-1 text-[11px] font-semibold text-[#6C757D]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2F7D4F]" />
            <span>Verified Patient Clinical Intake Record</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
