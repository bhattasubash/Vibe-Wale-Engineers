import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Edit3, XCircle, FileText, Scale, Activity, ShieldAlert, User, Printer, Stethoscope } from 'lucide-react';
import { usePhysicianStore } from '@/stores/physicianStore';

export const DoctorSessionReview: React.FC = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const { queue, activePatient, reviewSession, doctorName, roomNumber } = usePhysicianStore();

  const patient = activePatient || queue.find((p) => p.sessionId === sessionId) || queue[1];
  const [doctorNotes, setDoctorNotes] = useState(
    patient?.doctorNotes || 'Diagnosed Sandhivata (Osteoarthritis). Prescribed Janu Basti + Yogaraj Guggulu.'
  );
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleAction = (status: 'accepted' | 'amended' | 'rejected') => {
    reviewSession(patient.sessionId, status, doctorNotes);
    setToastMessage(
      status === 'accepted'
        ? 'केस सारांश सफलतापूर्वक स्वीकार किया गया (Case Accepted & Saved to EMR)'
        : status === 'amended'
        ? 'संशोधित सारांश ईएमआर में दर्ज किया गया (Amended & Saved to EMR)'
        : 'केस पुनः परीक्षण हेतु चिह्नित किया गया (Marked for Re-examination)'
    );
    setShowToast(true);
    setTimeout(() => {
      navigate('/doctor/queue');
    }, 1200);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#EAEDF0] text-[#212529] font-sans select-none justify-between">
      
      {/* Top Workstation Header */}
      <header className="bg-white border-b border-[#CED4DA] px-6 py-2.5 shrink-0 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/doctor/queue')}
              className="py-1 px-2.5 rounded-[3px] border border-[#CED4DA] hover:bg-[#E8F1F8] text-xs font-bold text-[#0B5FA5] flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>कतार पर वापस (Back to Queue)</span>
            </button>

            <span className="text-[#CED4DA]">|</span>

            <div>
              <span className="text-xs font-black text-[#0B5FA5]">
                रोगी नैदानिक सारांश • Case Sheet Review
              </span>
              <span className="text-[10px] font-semibold text-[#6C757D] block">
                {doctorName} • {roomNumber}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="py-1.5 px-3 rounded-[3px] border border-[#CED4DA] hover:bg-[#EAEDF0] text-xs font-bold text-[#495057] flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>पर्चा प्रिंट (Print)</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Dense 2-Column Clinical Review Interface */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* LEFT COLUMN (7 Cols): Demographics, SOCRATES Timeline & Documents */}
        <div className="lg:col-span-7 space-y-3">
          
          {/* PATIENT HEADER CARD */}
          <div className="bg-white border border-[#CED4DA] p-4 rounded-[3px] shadow-sm">
            <div className="flex items-start justify-between border-b pb-2.5 mb-2.5">
              <div>
                <span className="text-[10px] font-bold text-[#6C757D] uppercase tracking-wider block">
                  रोगी विवरण (Patient Demographics)
                </span>
                <span className="text-lg font-black text-[#212529] block">
                  {patient.patientName}
                </span>
                <span className="text-xs font-bold text-[#495057]">
                  {patient.age} वर्ष • {patient.gender === 'female' ? 'महिला' : 'पुरुष'} • फोन: {patient.phone}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-[#6C757D] uppercase block">टोकन संख्या</span>
                <span className="text-2xl font-black font-mono text-[#0B5FA5] block">
                  {patient.tokenNumber}
                </span>
                <span className="text-[10px] font-mono font-bold text-[#2F7D4F]">
                  ABDM: {patient.abhaId}
                </span>
              </div>
            </div>

            {/* Red Flag Banner if triggered */}
            {patient.redFlagTriggered && (
              <div className="p-2.5 bg-[#FEF2F2] border border-[#DC2626] rounded-[2px] mb-2 flex items-center gap-2 text-xs font-black text-[#DC2626]">
                <ShieldAlert className="w-4 h-4 shrink-0 text-[#DC2626]" />
                <span>आपातकालीन चेतावनी: सीने में भारीपन एवं सांस की तकलीफ के लक्षण रिकॉर्ड किए गए हैं!</span>
              </div>
            )}

            {/* Chief Complaint */}
            <div className="p-2.5 bg-[#F8FAFC] border border-[#CED4DA] rounded-[2px] text-xs">
              <span className="text-[10px] font-extrabold uppercase text-[#6C757D] block mb-0.5">
                मुख्य स्वास्थ्य लक्षण (Chief Complaint):
              </span>
              <span className="font-black text-sm text-[#212529] block">
                {patient.chiefComplaint}
              </span>
            </div>
          </div>

          {/* SOCRATES CLINICAL INTAKE TABLE */}
          <div className="bg-white border border-[#CED4DA] p-4 rounded-[3px] shadow-sm">
            <div className="text-xs font-black text-[#0B5FA5] uppercase tracking-wider mb-2.5 flex items-center gap-1.5 border-b pb-1.5">
              <Activity className="w-4 h-4 text-[#0B5FA5]" />
              <span>SOCRATES 5-टर्न नैदानिक इतिहास (Clinical Timeline)</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-medium">
              <div className="p-2 bg-[#F8FAFC] border border-[#CED4DA] rounded-[2px]">
                <span className="text-[10px] text-[#6C757D] font-bold block">1. स्थान (Site):</span>
                <span className="font-bold text-[#212529]">
                  {patient.socrates.site === 'bilateral-knees' ? 'दोनों घुटने (Bilateral Knees)' : patient.socrates.site || 'अस्पष्ट'}
                </span>
              </div>

              <div className="p-2 bg-[#F8FAFC] border border-[#CED4DA] rounded-[2px]">
                <span className="text-[10px] text-[#6C757D] font-bold block">2. अवधि (Onset & Duration):</span>
                <span className="font-bold text-[#212529]">
                  {patient.socrates.onset === 'chronic-6-months' ? '6 महीने से अधिक (Chronic)' : patient.socrates.onset || 'पुराना'}
                </span>
              </div>

              <div className="p-2 bg-[#F8FAFC] border border-[#CED4DA] rounded-[2px]">
                <span className="text-[10px] text-[#6C757D] font-bold block">3. तीव्रता (Severity Scale):</span>
                <span className="font-black text-[#DC2626]">
                  {patient.socrates.severity === 'severe-8' ? '8 / 10 (Severe Pain)' : '7 / 10 (Moderate)'}
                </span>
              </div>

              <div className="p-2 bg-[#F8FAFC] border border-[#CED4DA] rounded-[2px]">
                <span className="text-[10px] text-[#6C757D] font-bold block">4. ट्रिगर (Triggers / Timing):</span>
                <span className="font-bold text-[#212529]">
                  {patient.socrates.timing === 'cold-morning' ? 'सुबह उठने पर व ठंड में (Cold/Morning)' : 'शारीरिक श्रम'}
                </span>
              </div>

              <div className="col-span-2 p-2 bg-[#F8FAFC] border border-[#CED4DA] rounded-[2px]">
                <span className="text-[10px] text-[#6C757D] font-bold block">5. पारिवारिक इतिहास (Family History):</span>
                <span className="font-bold text-[#212529]">
                  {patient.socrates.familyHistory === 'family-arthritis' ? 'हाँ, माता/पिता को जोड़ों का दर्द (Arthritis)' : 'पारिवारिक इतिहास नकारात्मक'}
                </span>
              </div>
            </div>
          </div>

          {/* SCANNED DOCUMENTS & EXTRACTED DRUGS */}
          <div className="bg-white border border-[#CED4DA] p-4 rounded-[3px] shadow-sm">
            <div className="text-xs font-black text-[#0B5FA5] uppercase tracking-wider mb-2.5 flex items-center gap-1.5 border-b pb-1.5">
              <FileText className="w-4 h-4 text-[#0B5FA5]" />
              <span>पुराने पर्चे एवं औषध निष्कर्षण (Prescription OCR Entities)</span>
            </div>

            <div className="p-2.5 bg-[#F8FAFC] border border-[#CED4DA] rounded-[2px] mb-2 text-xs">
              <span className="text-[10px] text-[#6C757D] font-bold block mb-0.5">कच्चा पाठ (Extracted Text):</span>
              <p className="font-mono text-[#212529] text-[11px] leading-relaxed">
                {patient.ocrText || 'Rx: Maharasnadi Kwath 20ml BD, Yogaraj Guggulu 2 Tab BD.'}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-[#2F7D4F] uppercase tracking-wider block mb-1">
                पहचाने गए आयुर्वेदिक योग (Matched API Formulations):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(patient.extractedDrugs || ['Maharasnadi Kwath', 'Yogaraj Guggulu', 'Shallaki']).map((drug, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 bg-[#EDF7F1] border border-[#2F7D4F]/40 text-[#2F7D4F] font-black text-xs rounded-[2px]"
                  >
                    ✓ {drug}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (5 Cols): Classical Tridosha Prakriti Analysis */}
        <div className="lg:col-span-5 space-y-3">
          
          <div className="bg-white border-2 border-[#2F7D4F] p-4 rounded-[3px] shadow-sm">
            
            <div className="flex items-center justify-between border-b pb-2 mb-3">
              <span className="text-xs font-black text-[#2F7D4F] uppercase tracking-wider flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-[#2F7D4F]" />
                <span>चरक संहिता प्रकृति विश्लेषण (Constitutional Typology)</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#EDF7F1] text-[#2F7D4F] rounded-[2px]">
                15 मापदंड
              </span>
            </div>

            {/* Prakriti Dominance Header */}
            <div className="p-3 bg-[#EDF7F1] border border-[#2F7D4F]/40 rounded-[2px] mb-3 text-center">
              <span className="text-[10px] font-bold uppercase text-[#2F7D4F] block">
                मूल शारीरिक प्रकृति (Innate Prakriti)
              </span>
              <span className="text-2xl font-black text-[#1E4620] block my-0.5">
                {patient.dominantPrakriti}
              </span>
              <span className="text-[11px] font-bold text-[#495057]">
                द्वन्द्वज प्रकृति (Dual-Dosha Dominance) • मध्यम आत्मविश्वास
              </span>
            </div>

            {/* Tri-Dosha Progress Bars */}
            <div className="space-y-2.5 mb-4 text-xs font-bold">
              <div>
                <div className="flex justify-between mb-0.5">
                  <span className="text-[#0B5FA5]">वात (Vata - Nerves/Movement):</span>
                  <span>{patient.vataScore}%</span>
                </div>
                <div className="w-full h-2.5 bg-[#EAEDF0] rounded-full overflow-hidden">
                  <div className="h-full bg-[#0B5FA5]" style={{ width: `${patient.vataScore}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-0.5">
                  <span className="text-[#E07B1A]">पित्त (Pitta - Digestion/Metabolism):</span>
                  <span>{patient.pittaScore}%</span>
                </div>
                <div className="w-full h-2.5 bg-[#EAEDF0] rounded-full overflow-hidden">
                  <div className="h-full bg-[#E07B1A]" style={{ width: `${patient.pittaScore}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-0.5">
                  <span className="text-[#2F7D4F]">कफ (Kapha - Structure/Stability):</span>
                  <span>{patient.kaphaScore}%</span>
                </div>
                <div className="w-full h-2.5 bg-[#EAEDF0] rounded-full overflow-hidden">
                  <div className="h-full bg-[#2F7D4F]" style={{ width: `${patient.kaphaScore}%` }} />
                </div>
              </div>
            </div>

            {/* Ayurvedic Clinical Chikitsa Notes */}
            <div className="p-3 bg-[#F8FAFC] border border-[#CED4DA] rounded-[2px] text-xs space-y-1.5">
              <span className="text-[10px] font-black uppercase text-[#0B5FA5] block">
                चिकित्सा एवं पथ्य-अपथ्य दिशानिर्देश (Clinical Guidance):
              </span>
              <p className="text-[#495057] text-[11px] leading-relaxed">
                • <strong>दोष अवस्था:</strong> पित्त-कफ अनुबंध के साथ वात वृद्धि (संधिगत वात)।
              </p>
              <p className="text-[#495057] text-[11px] leading-relaxed">
                • <strong>उपचार संस्तुति:</strong> वातशामक तैल से स्थानीय अभ्यंग, जानु बस्ति एवं योगराज गुग्गुलु का प्रयोग लाभप्रद रहेगा।
              </p>
            </div>

          </div>

          {/* DOCTOR NOTES & CONSULTATION ACTION BOX */}
          <div className="bg-white border border-[#CED4DA] p-4 rounded-[3px] shadow-sm space-y-3">
            
            <div>
              <label className="block text-xs font-black text-[#0B5FA5] uppercase tracking-wider mb-1">
                चिकित्सक परामर्श टिप्पणी (Physician Final Notes) *
              </label>
              <textarea
                rows={3}
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                placeholder="परामर्श, औषधि निर्देश एवं पंचकर्म योजना यहाँ लिखें..."
                className="w-full p-2.5 bg-[#F8FAFC] border border-[#CED4DA] rounded-[3px] text-xs font-bold text-[#212529] focus:outline-none focus:border-[#0B5FA5]"
              />
            </div>

            {/* 3 ACTION BUTTONS */}
            <div className="grid grid-cols-3 gap-2">
              
              <button
                type="button"
                onClick={() => handleAction('rejected')}
                className="py-2.5 px-2 rounded-[3px] border border-[#DC2626] bg-white text-[#DC2626] hover:bg-[#FEF2F2] text-xs font-black flex items-center justify-center gap-1 cursor-pointer transition-transform active:scale-[0.98]"
              >
                <XCircle className="w-3.5 h-3.5 text-[#DC2626]" />
                <span>पुनः जांच (Reject)</span>
              </button>

              <button
                type="button"
                onClick={() => handleAction('amended')}
                className="py-2.5 px-2 rounded-[3px] border border-[#0B5FA5] bg-white text-[#0B5FA5] hover:bg-[#E8F1F8] text-xs font-black flex items-center justify-center gap-1 cursor-pointer transition-transform active:scale-[0.98]"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#0B5FA5]" />
                <span>संशोधन (Amend)</span>
              </button>

              <button
                type="button"
                onClick={() => handleAction('accepted')}
                className="py-2.5 px-2 rounded-[3px] border border-[#1E4620] text-white text-xs font-black flex items-center justify-center gap-1 cursor-pointer transition-transform active:scale-[0.98]"
                style={{ backgroundColor: '#2F7D4F' }}
              >
                <CheckCircle className="w-3.5 h-3.5 text-white" />
                <span>स्वीकार (Accept)</span>
              </button>

            </div>

          </div>

        </div>

      </main>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E4620] text-white px-4 py-3 rounded-[3px] shadow-2xl border border-white/20 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Persistent Single-Line Clean Footer */}
      <footer className="w-full bg-white border-t border-[#CED4DA] py-2 px-6 text-xs text-[#495057] select-none shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="font-bold text-[#0B5FA5]">अखिल भारतीय आयुर्वेद संस्थान (AIIA) • e-Hospital Consultation Terminal</span>
          <span className="text-[11px] font-semibold text-[#6C757D]">Signed under DPDP Act 2023 Clinical Authority</span>
        </div>
      </footer>

    </div>
  );
};
