import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, VolumeX, ChevronRight, FileText, Megaphone, ArrowRight } from 'lucide-react';
import { useSessionStore } from '@/stores/sessionStore';
import { speechEngine } from '@/lib/speech';

export const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useSessionStore();
  const [activeTab, setActiveTab] = useState<'intake' | 'prakriti' | 'documents'>('intake');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const handleStart = () => {
    navigate('/kiosk/identify');
  };

  const welcomeAudioHindi =
    'नमस्ते। अखिल भारतीय आयुर्वेद संस्थान, आयुष मंत्रालय में आपका स्वागत है। ओपीडी परामर्श से पहले अपना विवरण और प्रकृति दर्ज करने के लिए नीचे दिया गया बड़ा बटन दबाएं।';
  
  const welcomeAudioEnglish =
    'Welcome to All India Institute of Ayurveda, Ministry of Ayush. To record your health details and Ayurvedic body constitution before consultation, please tap the start button.';

  const handlePlayVoice = () => {
    if (isSpeaking) {
      speechEngine.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speechEngine.speakBilingual(welcomeAudioHindi, welcomeAudioEnglish, () => {
        setIsSpeaking(false);
      });
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-95px)] bg-[#EAEDF0] text-[#212529] justify-between select-none font-sans">
      
      {/* Main GIGW Portal Content Area */}
      <main className="max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 flex-1 flex flex-col justify-between">
        
        {/* Flat Audio Guidance Bar */}
        <div className="w-full bg-white border border-[#CED4DA] px-3.5 py-2 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold" style={{ color: 'rgb(10, 45, 101)' }}>
            <span className="w-2 h-2 bg-[#15803D]" />
            <span>
              {language === 'hi'
                ? 'अखिल भारतीय आयुर्वेद संस्थान • ओपीडी रोगी केस-टेकिंग एवं प्रकृति परीक्षण पोर्टल (AIIA)'
                : 'All India Institute of Ayurveda • OPD Patient Case-Taking & Prakriti Portal (AIIA)'}
            </span>
          </div>

          <button
            type="button"
            onClick={handlePlayVoice}
            className="flex items-center gap-1.5 px-3 py-1 text-white text-xs font-bold transition-colors cursor-pointer"
            style={{ backgroundColor: 'rgb(10, 45, 101)' }}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'ऑडियो रोकें' : 'Stop Audio'}</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'निर्देश सुनें (Audio)' : 'Listen Aloud (Audio)'}</span>
              </>
            )}
          </button>
        </div>

        {/* Dense 2-Column Official Layout matching GIGW Guidelines */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* ========================================================= */}
          {/* LEFT PANEL: Key Offerings (मुख्य पेशकश) - 7 Columns       */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 flex flex-col">
            
            {/* Header Title with Document Icon */}
            <div className="flex items-center gap-2 text-sm sm:text-base font-extrabold mb-2" style={{ color: 'rgb(10, 45, 101)' }}>
              <FileText className="w-4 h-4" style={{ color: 'rgb(10, 45, 101)' }} />
              <h2>{language === 'hi' ? 'मुख्य सेवाएं (Key Clinical Services)' : 'Key Clinical Services (मुख्य सेवाएं)'}</h2>
            </div>

            {/* Flat Bordered Tab Container with 0 Shadows and Sharp Corners */}
            <div className="bg-white border border-[#CED4DA] overflow-hidden">
              
              {/* 3 Tab Headers */}
              <div className="grid grid-cols-3 border-b border-[#CED4DA] text-center text-xs font-bold">
                
                <button
                  type="button"
                  onClick={() => setActiveTab('intake')}
                  className="py-2.5 px-2 border-r border-[#CED4DA] transition-colors cursor-pointer"
                  style={{
                    backgroundColor: activeTab === 'intake' ? 'rgb(10, 45, 101)' : '#FFFFFF',
                    color: activeTab === 'intake' ? 'rgb(255, 255, 255)' : 'rgb(10, 45, 101)',
                  }}
                >
                  {language === 'hi' ? 'रोगी पंजीकरण' : 'Patient Intake'}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('prakriti')}
                  className="py-2.5 px-2 border-r border-[#CED4DA] transition-colors cursor-pointer"
                  style={{
                    backgroundColor: activeTab === 'prakriti' ? 'rgb(10, 45, 101)' : '#FFFFFF',
                    color: activeTab === 'prakriti' ? 'rgb(255, 255, 255)' : 'rgb(10, 45, 101)',
                  }}
                >
                  {language === 'hi' ? 'प्रकृति परीक्षण' : 'Prakriti'}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('documents')}
                  className="py-2.5 px-2 transition-colors cursor-pointer"
                  style={{
                    backgroundColor: activeTab === 'documents' ? 'rgb(10, 45, 101)' : '#FFFFFF',
                    color: activeTab === 'documents' ? 'rgb(255, 255, 255)' : 'rgb(10, 45, 101)',
                  }}
                >
                  {language === 'hi' ? 'दस्तावेज़ ओसीआर' : 'Document OCR'}
                </button>

              </div>

              {/* Table List Rows with Chevrons (GIGW Compliant) */}
              <div className="divide-y divide-[#CED4DA] text-xs sm:text-sm">
                
                {activeTab === 'intake' && (
                  <>
                    <div
                      onClick={handleStart}
                      className="p-3 hover:bg-[#EAEDF0] flex items-center justify-between cursor-pointer group transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold" style={{ color: 'rgb(10, 45, 101)' }}>01.</span>
                        <span className="font-bold text-[#212529] group-hover:text-[#0066CC]">
                          {language === 'hi'
                            ? 'आयुष्मान भारत डिजिटल मिशन (ABHA) आधारित पहचान एवं त्वरित पंजीकरण'
                            : 'Ayushman Bharat Digital Mission (ABHA) Identification & Intake'}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#0A2D65] group-hover:translate-x-1 transition-transform" />
                    </div>

                    <div
                      onClick={handleStart}
                      className="p-3 hover:bg-[#EAEDF0] flex items-center justify-between cursor-pointer group transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold" style={{ color: 'rgb(10, 45, 101)' }}>02.</span>
                        <span className="font-bold text-[#212529] group-hover:text-[#0066CC]">
                          {language === 'hi'
                            ? 'आवाज एवं स्पर्श द्वारा मुख्य बीमारी और लक्षणों का व्यवस्थित विवरण'
                            : 'Voice and Touch Structured Clinical Symptom Recording'}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#0A2D65] group-hover:translate-x-1 transition-transform" />
                    </div>

                    <div
                      onClick={handleStart}
                      className="p-3 hover:bg-[#EAEDF0] flex items-center justify-between cursor-pointer group transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold" style={{ color: 'rgb(10, 45, 101)' }}>03.</span>
                        <span className="font-bold text-[#212529] group-hover:text-[#0066CC]">
                          {language === 'hi'
                            ? 'आपातकालीन लक्षण (Red-Flag) रीयल-टाइम सुरक्षा निगरानी एवं अलर्ट'
                            : 'Acute Emergency Symptom (Red-Flag) Real-Time Safety Net'}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#0A2D65] group-hover:translate-x-1 transition-transform" />
                    </div>

                    <div
                      onClick={handleStart}
                      className="p-3 hover:bg-[#EAEDF0] flex items-center justify-between cursor-pointer group transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold" style={{ color: 'rgb(10, 45, 101)' }}>04.</span>
                        <span className="font-bold text-[#212529] group-hover:text-[#0066CC]">
                          {language === 'hi'
                            ? 'चिकित्सक ईएमआर सारांश प्रेषण एवं परामर्श टोकन नंबर'
                            : 'Structured Physician EMR Case File & OPD Token Generation'}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#0A2D65] group-hover:translate-x-1 transition-transform" />
                    </div>
                  </>
                )}

                {activeTab === 'prakriti' && (
                  <>
                    <div
                      onClick={handleStart}
                      className="p-3 hover:bg-[#EAEDF0] flex items-center justify-between cursor-pointer group transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold" style={{ color: 'rgb(10, 45, 101)' }}>01.</span>
                        <span className="font-bold text-[#212529] group-hover:text-[#0066CC]">
                          {language === 'hi'
                            ? 'चरक संहिता (विमान स्थान 8) आधारित 15 शारीरिक एवं मानसिक लक्षण'
                            : 'Charaka Samhita (Vimana Sthana 8) 15-Trait Questionnaire'}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#0A2D65] group-hover:translate-x-1 transition-transform" />
                    </div>

                    <div
                      onClick={handleStart}
                      className="p-3 hover:bg-[#EAEDF0] flex items-center justify-between cursor-pointer group transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold" style={{ color: 'rgb(10, 45, 101)' }}>02.</span>
                        <span className="font-bold text-[#212529] group-hover:text-[#0066CC]">
                          {language === 'hi'
                            ? 'अंकगणितीय वात, पित्त एवं कफ प्रतिशतता स्कोरिंग'
                            : 'Deterministic Vata, Pitta, Kapha Arithmetic Scoring'}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#0A2D65] group-hover:translate-x-1 transition-transform" />
                    </div>

                    <div
                      onClick={handleStart}
                      className="p-3 hover:bg-[#EAEDF0] flex items-center justify-between cursor-pointer group transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold" style={{ color: 'rgb(10, 45, 101)' }}>03.</span>
                        <span className="font-bold text-[#212529] group-hover:text-[#0066CC]">
                          {language === 'hi'
                            ? 'दशविध परीक्षा (अग्नि, सार, संहनन, सात्म्य, सत्व आदि)'
                            : 'Dashavidha Pariksha Rapid Clinical Parameters'}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#0A2D65] group-hover:translate-x-1 transition-transform" />
                    </div>
                  </>
                )}

                {activeTab === 'documents' && (
                  <>
                    <div
                      onClick={handleStart}
                      className="p-3 hover:bg-[#EAEDF0] flex items-center justify-between cursor-pointer group transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold" style={{ color: 'rgb(10, 45, 101)' }}>01.</span>
                        <span className="font-bold text-[#212529] group-hover:text-[#0066CC]">
                          {language === 'hi'
                            ? 'पुरानी अस्पताल पर्ची एवं डिस्चार्ज समरी कैमरा स्कैन'
                            : 'Prescription & Medical Document Camera Ingestion'}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#0A2D65] group-hover:translate-x-1 transition-transform" />
                    </div>

                    <div
                      onClick={handleStart}
                      className="p-3 hover:bg-[#EAEDF0] flex items-center justify-between cursor-pointer group transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold" style={{ color: 'rgb(10, 45, 101)' }}>02.</span>
                        <span className="font-bold text-[#212529] group-hover:text-[#0066CC]">
                          {language === 'hi'
                            ? 'भारतीय भेषजसंहिता (Pharmacopoeia) दवा नाम सत्यापन'
                            : 'Indian Pharmacopoeia Entity Extraction & Verification'}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#0A2D65] group-hover:translate-x-1 transition-transform" />
                    </div>
                  </>
                )}

              </div>

            </div>

            {/* Bottom Flat Rectangular Action Bar */}
            <div className="flex items-center justify-between mt-3 gap-3">
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'intake' ? 'prakriti' : 'intake')}
                className="px-3 py-1.5 bg-white border border-[#CED4DA] text-xs font-bold hover:bg-gray-50 flex items-center gap-1 cursor-pointer"
                style={{ color: 'rgb(10, 45, 101)' }}
              >
                <span>{language === 'hi' ? 'और देखें' : 'VIEW MORE'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {/* Plain Rectangular Flat Start Button in rgb(10, 45, 101) & White Text */}
              <button
                type="button"
                onClick={handleStart}
                className="px-6 py-2.5 text-white text-sm sm:text-base font-extrabold flex items-center gap-2 transition-colors cursor-pointer border border-[#071F45]"
                style={{ backgroundColor: 'rgb(10, 45, 101)', color: 'rgb(255, 255, 255)', borderRadius: '2px' }}
              >
                <span>{language === 'hi' ? 'पंजीकरण आरंभ करें • START INTAKE' : 'START CASE INTAKE • आरंभ करें'}</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </div>

          </div>

          {/* ========================================================= */}
          {/* RIGHT PANEL: What's New (नया क्या है) - 5 Columns        */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 flex flex-col">
            
            {/* Header Title with Megaphone Icon */}
            <div className="flex items-center gap-2 text-sm sm:text-base font-extrabold mb-2" style={{ color: 'rgb(10, 45, 101)' }}>
              <Megaphone className="w-4 h-4" style={{ color: 'rgb(10, 45, 101)' }} />
              <h2>{language === 'hi' ? 'नया क्या है (What\'s New)' : 'What\'s New (नया क्या है)'}</h2>
            </div>

            {/* Solid Navy Blue Container matching Official ayush.gov.in */}
            <div
              className="text-white border border-[#071F45] overflow-hidden"
              style={{ backgroundColor: 'rgb(10, 45, 101)', borderRadius: '2px' }}
            >
              
              <div className="divide-y divide-white/15 text-xs leading-relaxed max-h-[300px] overflow-y-auto p-1">
                
                {/* Item 1 */}
                <div className="p-3 hover:bg-white/5 transition-colors">
                  <p className="font-normal text-white">
                    {language === 'hi'
                      ? 'अखिल भारतीय आयुर्वेद संस्थान (AIIA) ओपीडी पंजीकरण एवं प्रकृति परीक्षण सत्र 2026-27 दिशानिर्देश।'
                      : 'All India Institute of Ayurveda (AIIA) OPD Registration and Prakriti Guidelines 2026-27.'}
                  </p>
                  <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-red-300 font-bold">
                    📄 .pdf (12.00 MB)
                  </span>
                </div>

                {/* Item 2 */}
                <div className="p-3 hover:bg-white/5 transition-colors">
                  <p className="font-normal text-white">
                    {language === 'hi'
                      ? 'आयुष मंत्रालय द्वारा रोगी इतिहास एवं त्रिदोष परीक्षण हेतु मानक संचालन प्रक्रिया (SOP)।'
                      : 'Standard Operating Procedures (SOP) for Patient Case Taking & Tridosha Assessment.'}
                  </p>
                  <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-red-300 font-bold">
                    📄 .pdf (3.76 MB)
                  </span>
                </div>

                {/* Item 3 */}
                <div className="p-3 hover:bg-white/5 transition-colors">
                  <p className="font-normal text-white">
                    {language === 'hi'
                      ? 'गंभीर आपातकालीन लक्षणों (Emergency Red Flags) की त्वरित पहचान एवं चिकित्सा प्राथमिकता नियम।'
                      : 'Acute Red-Flag Emergency Triage and Immediate Physician Dispatch Notification Rules.'}
                  </p>
                  <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-red-300 font-bold">
                    📄 .pdf (244 KB)
                  </span>
                </div>

                {/* Item 4 */}
                <div className="p-3 hover:bg-white/5 transition-colors">
                  <p className="font-normal text-white">
                    {language === 'hi'
                      ? 'डिजिटल व्यक्तिगत डेटा संरक्षण (DPDP) अधिनियम 2023 के तहत स्वास्थ्य रिकॉर्ड गोपनीयता।'
                      : 'Health Record Confidentiality under Digital Personal Data Protection (DPDP) Act 2023.'}
                  </p>
                  <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-red-300 font-bold">
                    📄 .pdf (1.45 MB)
                  </span>
                </div>

              </div>

              {/* View More Button */}
              <div className="p-2 bg-[#071F45]/60 border-t border-white/10 flex justify-end">
                <button
                  type="button"
                  onClick={handleStart}
                  className="px-2.5 py-1 bg-white text-xs font-bold hover:bg-gray-100 flex items-center gap-1 cursor-pointer"
                  style={{ color: 'rgb(10, 45, 101)', borderRadius: '2px' }}
                >
                  <span>{language === 'hi' ? 'और देखें' : 'VIEW MORE'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

          </div>

        </div>

      </main>

      {/* Official Government of India & Ministry of AYUSH Footer Bar */}
      <footer className="w-full bg-white border-t border-[#CED4DA] py-2.5 px-3 sm:px-6 text-xs text-[#495057] select-none mt-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3">
            <span className="font-bold" style={{ color: 'rgb(10, 45, 101)' }}>
              {language === 'hi' ? 'अखिल भारतीय आयुर्वेद संस्थान (AIIA)' : 'All India Institute of Ayurveda'}
            </span>
            <span className="text-[#CED4DA] hidden sm:inline">|</span>
            <span>
              {language === 'hi'
                ? 'वेबसाइट सामग्री का प्रबंधन आयुष मंत्रालय, भारत सरकार द्वारा किया जाता है'
                : 'Website Content Managed by Ministry of Ayush, Government of India'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-[#6C757D] font-semibold">
            <span>NIC / ABDM Portal</span>
            <span>•</span>
            <span>DPDP Act 2023 Compliant</span>
          </div>

        </div>
      </footer>

    </div>
  );
};
