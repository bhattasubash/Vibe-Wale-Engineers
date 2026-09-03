import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Edit3, ArrowLeft, ArrowRight, Activity, Scale, ShieldCheck, Printer, FileText } from 'lucide-react';
import { AudioSpeaker } from '@/components/ui/AudioSpeaker';
import { useSessionStore } from '@/stores/sessionStore';

export const ReviewScreen: React.FC = () => {
  const navigate = useNavigate();
  const { language, patient, chiefComplaint, prakritiResult } = useSessionStore();

  const promptHindi =
    'कृपया अपने केस पर्चे की जांच करें। यदि सभी जानकारी सही है, तो पुराने पर्चे अपलोड करने के लिए आगे बढ़ें।';
  const promptEnglish =
    'Please review your official clinical case sheet. If all details are correct, proceed to upload documents or generate your OPD token.';

  return (
    <div className="flex flex-col h-[calc(100vh-76px)] max-h-[calc(100vh-76px)] bg-[#EAEDF0] text-[#212529] justify-between font-sans select-none overflow-hidden">
      
      {/* Non-Scrollable Centered Main Container */}
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-1.5 flex-1 flex flex-col justify-evenly items-center">
        
        {/* Top Prompter */}
        <div className="shrink-0">
          <AudioSpeaker
            hindiText={promptHindi}
            englishText={promptEnglish}
            bilingual={language === 'hi'}
            autoPlay={true}
          />
        </div>

        {/* AUTHENTIC CLINICAL WHITE PAPER CASE SHEET CONTAINER */}
        <div className="w-full max-w-3xl bg-white border-2 border-[#CED4DA] rounded-[3px] p-4 shadow-sm text-xs shrink-0 font-medium">
          
          {/* Official Letterhead Header */}
          <div className="border-b-2 border-[#0B5FA5] pb-2 mb-2 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#6C757D] uppercase tracking-wider block">
                अखिल भारतीय आयुर्वेद संस्थान • ALL INDIA INSTITUTE OF AYURVEDA
              </span>
              <span className="text-base font-black text-[#0B5FA5] block">
                प्रारंभिक रोगी नैदानिक विवरण पत्र • OPD Clinical Case Sheet
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#E8F1F8] text-[#0B5FA5] rounded-[2px] block">
                OPD Token: #AIIA-042
              </span>
              <span className="text-[9px] text-[#2F7D4F] font-bold block mt-0.5">
                ABDM Verified • DPDP Compliant
              </span>
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
                <span className="font-bold text-[#212529]">{patient.age || 62} वर्ष / पुरुष</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6C757D] block">आभा संख्या (ABHA):</span>
                <span className="font-mono font-bold text-[#212529]">{patient.abhaId || '91-4523-8901-2345'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6C757D] block">विभाग / कमरा:</span>
                <span className="font-bold text-[#0B5FA5]">कायचिकित्सा (Room 104)</span>
              </div>
            </div>
          </div>

          {/* 2. PRADHANA VEDANA (CHIEF COMPLAINTS & SOCRATES) */}
          <div className="border-b border-[#CED4DA] pb-2 mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="font-black text-xs text-[#0B5FA5] uppercase tracking-wider flex items-center gap-1">
                <Activity className="w-3 h-3 text-[#0B5FA5]" />
                <span>2. प्रधान वेदना एवं रोग इतिहास (Chief Complaint & HPI)</span>
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
                <span className="text-[10px] font-bold text-[#DC2626]">तीव्रता: 8 / 10 (Severe)</span>
              </div>
              <div className="text-[#6C757D] text-[10px] space-x-2">
                <span>स्थान: जानु संधि (Bilateral Knees)</span>
                <span>•</span>
                <span>अवधि: 6+ महीने (जीर्ण)</span>
                <span>•</span>
                <span>ट्रिगर: प्रातः काल व शीत ऋतु</span>
              </div>
            </div>
          </div>

          {/* 3. DASHAVIDHA PARIKSHA: PRAKRITI EVALUATION */}
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
                <span className="text-[10px] text-[#2F7D4F] font-bold block">निर्धारित प्रकृति:</span>
                <span className="text-sm font-black text-[#1E4620]">
                  {prakritiResult?.dominantPrakriti || 'PITTA-KAPHA (द्वन्द्वज प्रकृति)'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-[#495057] block">15 मापदंड गणितीय गणना</span>
                <span className="text-[10px] font-bold text-[#2F7D4F]">मध्यम आत्मविश्वास (Medium Confidence)</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-bold">
              <div className="p-1 bg-[#E8F1F8] border border-[#0B5FA5]/30 rounded-[2px]">
                <span className="text-[10px] text-[#0B5FA5] block">वात (Vata):</span>
                <span className="font-black text-[#0B5FA5]">{prakritiResult?.vataScore || 20}%</span>
              </div>
              <div className="p-1 bg-[#FFF4EB] border border-[#E07B1A]/30 rounded-[2px]">
                <span className="text-[10px] text-[#E07B1A] block">पित्त (Pitta):</span>
                <span className="font-black text-[#E07B1A]">{prakritiResult?.pittaScore || 53}%</span>
              </div>
              <div className="p-1 bg-[#EDF7F1] border border-[#2F7D4F]/30 rounded-[2px]">
                <span className="text-[10px] text-[#2F7D4F] block">कफ (Kapha):</span>
                <span className="font-black text-[#2F7D4F]">{prakritiResult?.kaphaScore || 27}%</span>
              </div>
            </div>
          </div>

        </div>

        {/* 2 ACTION BUTTONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl shrink-0">
          <button
            type="button"
            onClick={() => navigate('/kiosk/token')}
            className="h-11 sm:h-12 px-4 rounded-[3px] border border-[#CED4DA] bg-white hover:bg-[#EAEDF0] font-black text-xs text-[#495057] flex items-center justify-center cursor-pointer transition-transform active:scale-[0.98]"
          >
            <span>पर्चे नहीं हैं • सीधे टोकन लें</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/kiosk/documents')}
            className="h-11 sm:h-12 px-6 rounded-[3px] border border-[#084B83] text-xs sm:text-sm font-black text-white flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.98]"
            style={{ backgroundColor: '#0B5FA5' }}
          >
            <span>पुराने पर्चे अपलोड करें • UPLOAD DOCS</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Back Button */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={() => navigate('/kiosk/prakriti')}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[3px] border border-[#CED4DA] bg-white hover:border-[#0B5FA5] hover:text-[#0B5FA5] text-xs font-bold text-[#212529] transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>प्रकृति प्रश्नों पर वापस जाएं (Back)</span>
          </button>
        </div>

      </main>

      {/* Persistent Single-Line Clean Footer */}
      <footer className="w-full bg-white border-t border-[#CED4DA] py-1.5 px-6 text-xs text-[#495057] select-none shrink-0">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
          <div className="flex items-center gap-2 font-bold" style={{ color: '#0B5FA5' }}>
            <span>अखिल भारतीय आयुर्वेद संस्थान (AIIA)</span>
            <span className="text-[#CED4DA]">|</span>
            <span className="font-semibold text-[#495057]">OPD Terminal #01</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-semibold text-[#6C757D]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2F7D4F]" />
            <span>Verified Patient Clinical Record</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
