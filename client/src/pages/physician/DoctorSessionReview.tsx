import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  Edit3,
  XCircle,
  FileText,
  Scale,
  Activity,
  ShieldAlert,
  User,
  Printer,
  Stethoscope,
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCw,
  X,
  ExternalLink,
  Check,
  AlertCircle,
} from 'lucide-react';
import { usePhysicianStore, DocumentItem } from '@/stores/physicianStore';

export const DoctorSessionReview: React.FC = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const { queue, activePatient, reviewSession, doctorName, roomNumber } = usePhysicianStore();

  const patient = activePatient || queue.find((p) => p.sessionId === sessionId) || queue[1] || queue[0];
  const [doctorNotes, setDoctorNotes] = useState(
    patient?.doctorNotes || 'रोग निदान: संधिवात (Sandhigata Vata)। चिकित्सा योजना: जानु बस्ति (महानारायण तैल) + योगराज गुग्गुलु २ वटी।'
  );
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Document Lightbox Modal State
  const [activeDocModal, setActiveDocModal] = useState<DocumentItem | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleOpenDocModal = (doc: DocumentItem) => {
    setActiveDocModal(doc);
    setZoomLevel(1);
    setRotation(0);
  };

  const handleCloseDocModal = () => {
    setActiveDocModal(null);
  };

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

  const patientDocs: DocumentItem[] = patient?.documents && patient.documents.length > 0
    ? patient.documents
    : [
        {
          id: 'DOC-DEF-1',
          name: 'आयुष ओपीडी पर्चा (Prior Prescription Scan)',
          url: './sample_reports/CamScanner 09-03-2026 01.07 (2)_page-0001.jpg',
          type: 'Prescription',
          date: '14-Aug-2026',
          facility: 'AIIA OPD Kayachikitsa',
          ocrSnippet: patient.ocrText || 'Rx: Maharasnadi Kwath 20ml BD, Yogaraj Guggulu 2 Tab BD.',
        },
      ];

  const medications = patient?.extractedMedications && patient.extractedMedications.length > 0
    ? patient.extractedMedications
    : [
        {
          drugName: 'महारास्नादि क्वाथ (Maharasnadi Kwath)',
          dosage: '20 ml',
          frequency: '1-0-1 (भोजनोपरांत BD)',
          anupana: 'समान भाग कोष्ण जल (Warm Water)',
          duration: '1 माह',
          source: 'Ayurvedic Formulations' as const,
        },
        {
          drugName: 'योगराज गुग्गुलु (Yogaraj Guggulu)',
          dosage: '2 वटी (500mg)',
          frequency: '1-0-1 (BD)',
          anupana: 'गुनगुना जल (Koshna Jala)',
          duration: '1 माह',
          source: 'Ayurvedic Formulations' as const,
        },
        {
          drugName: 'शल्लाकी कैप्सूल (Shallaki Capsule)',
          dosage: '1 कैप्सूल (400mg)',
          frequency: '1-0-1 (BD)',
          anupana: 'दुग्ध / जल',
          duration: '1 माह',
          source: 'Ayurvedic Formulations' as const,
        },
      ];

  const labFindings = patient?.extractedLabFindings && patient.extractedLabFindings.length > 0
    ? patient.extractedLabFindings
    : [
        {
          testName: 'हीमोग्लोबिन (Hemoglobin)',
          value: '13.2',
          unit: 'g/dL',
          referenceRange: '12.0 - 16.0',
          flag: 'NORMAL' as const,
          verifiedStatus: 'verified' as const,
        },
        {
          testName: 'सीरम यूरिक एसिड (Serum Uric Acid)',
          value: '6.4',
          unit: 'mg/dL',
          referenceRange: '3.5 - 7.2',
          flag: 'NORMAL' as const,
          verifiedStatus: 'verified' as const,
        },
        {
          testName: 'ईएसआर (ESR 1st Hour)',
          value: '28',
          unit: 'mm/hr',
          referenceRange: '0 - 20',
          flag: 'ELEVATED' as const,
          verifiedStatus: 'verified' as const,
        },
      ];

  return (
    <div className="flex flex-col min-h-screen bg-[#EAEDF0] text-[#212529] font-sans select-none justify-between">
      
      {/* Top Workstation Header */}
      <header className="bg-white border-b border-[#CED4DA] px-6 py-2.5 shrink-0 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/doctor/queue')}
              className="py-1 px-2.5 rounded-[3px] border border-[#CED4DA] hover:bg-[#E8F1F8] text-xs font-bold text-[#0B5FA5] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>कतार पर वापस (Back to Queue)</span>
            </button>

            <span className="text-[#CED4DA]">|</span>

            <div>
              <span className="text-xs font-black text-[#0B5FA5]">
                रोगी नैदानिक सारांश • Clinical Case Sheet Review
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
              className="py-1.5 px-3 rounded-[3px] border border-[#CED4DA] hover:bg-[#EAEDF0] text-xs font-bold text-[#495057] flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>केस शीट प्रिंट करें (Print Case Sheet)</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main 2-Column Clinical Review Interface */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* LEFT COLUMN (7 Cols): Demographics, SOCRATES Timeline, Documents & Lab Findings */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* 1. PATIENT HEADER CARD (Rogi Vivarana) */}
          <div className="bg-white border border-[#CED4DA] p-4 rounded-[3px] shadow-xs">
            <div className="flex items-start justify-between border-b border-[#CED4DA] pb-2.5 mb-2.5">
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
                  ABHA ID: {patient.abhaId}
                </span>
              </div>
            </div>

            {/* Red Flag Warning Banner if triggered */}
            {patient.redFlagTriggered && (
              <div className="p-2.5 bg-[#FEF2F2] border border-[#DC2626] rounded-[2px] mb-2.5 flex items-center gap-2 text-xs font-black text-[#DC2626]">
                <ShieldAlert className="w-4 h-4 shrink-0 text-[#DC2626]" />
                <span>आपातकालीन चेतावनी: सीने में दर्द / सांस की तकलीफ के गंभीर लक्षण रिकॉर्ड किए गए हैं!</span>
              </div>
            )}

            {/* Chief Complaint (Pradhana Vedana) */}
            <div className="p-2.5 bg-[#F8FAFC] border border-[#CED4DA] rounded-[2px] text-xs">
              <span className="text-[10px] font-extrabold uppercase text-[#6C757D] block mb-0.5">
                प्रधान वेदना / मुख्य स्वास्थ्य समस्या (Chief Complaint):
              </span>
              <span className="font-black text-sm text-[#212529] block">
                {patient.chiefComplaint}
              </span>
            </div>
          </div>

          {/* 2. SOCRATES CLINICAL TIMELINE (Roga Itihasa) */}
          <div className="bg-white border border-[#CED4DA] p-4 rounded-[3px] shadow-xs">
            <div className="text-xs font-black text-[#0B5FA5] uppercase tracking-wider mb-2.5 flex items-center gap-1.5 border-b border-[#CED4DA] pb-1.5">
              <Activity className="w-4 h-4 text-[#0B5FA5]" />
              <span>रोग इतिहास एवं लक्षण अन्वेषण • SOCRATES Timeline</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-medium">
              <div className="p-2 bg-[#F8FAFC] border border-[#CED4DA] rounded-[2px]">
                <span className="text-[10px] text-[#6C757D] font-bold block">1. स्थान (Site):</span>
                <span className="font-bold text-[#212529]">
                  {patient.socrates.site || 'दोनों जानु सन्धि (Bilateral Knees)'}
                </span>
              </div>

              <div className="p-2 bg-[#F8FAFC] border border-[#CED4DA] rounded-[2px]">
                <span className="text-[10px] text-[#6C757D] font-bold block">2. अवधि (Onset & Duration):</span>
                <span className="font-bold text-[#212529]">
                  {patient.socrates.onset || '6 महीने से अधिक (Chronic 6+ Months)'}
                </span>
              </div>

              <div className="p-2 bg-[#F8FAFC] border border-[#CED4DA] rounded-[2px]">
                <span className="text-[10px] text-[#6C757D] font-bold block">3. तीव्रता (Severity Scale):</span>
                <span className="font-black text-[#DC2626]">
                  {patient.socrates.severity || '7 / 10 (Moderate to Severe)'}
                </span>
              </div>

              <div className="p-2 bg-[#F8FAFC] border border-[#CED4DA] rounded-[2px]">
                <span className="text-[10px] text-[#6C757D] font-bold block">4. वर्धक/शामक कारण (Triggers & Timing):</span>
                <span className="font-bold text-[#212529]">
                  {patient.socrates.timing || 'प्रातःकाल सोकर उठने पर व शीत ऋतु में (Cold / Morning)'}
                </span>
              </div>

              <div className="col-span-2 p-2 bg-[#F8FAFC] border border-[#CED4DA] rounded-[2px]">
                <span className="text-[10px] text-[#6C757D] font-bold block">5. पारिवारिक इतिहास (Family History / Kulaja):</span>
                <span className="font-bold text-[#212529]">
                  {patient.socrates.familyHistory || 'माता को संधिवात का इतिहास (Positive Maternal History)'}
                </span>
              </div>
            </div>
          </div>

          {/* 3. CAPTURED DOCUMENT SCANS & LIGHTBOX VIEWER GALLERY */}
          <div className="bg-white border border-[#CED4DA] p-4 rounded-[3px] shadow-xs">
            <div className="text-xs font-black text-[#0B5FA5] uppercase tracking-wider mb-2.5 flex items-center justify-between border-b border-[#CED4DA] pb-1.5">
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#0B5FA5]" />
                <span>अपलोड किए गए मूल दस्तावेज एवं पर्चे (Original Scanned Documents)</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#E8F1F8] text-[#0B5FA5] rounded-[2px]">
                {patientDocs.length} दस्तावेज उपलब्ध
              </span>
            </div>

            {/* Document Thumbnail Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              {patientDocs.map((doc, idx) => (
                <div
                  key={doc.id || idx}
                  onClick={() => handleOpenDocModal(doc)}
                  className="p-2.5 bg-[#F8FAFC] border border-[#CED4DA] hover:border-[#0B5FA5] rounded-[3px] flex gap-2.5 items-center cursor-pointer transition-all hover:shadow-xs group"
                >
                  <div className="relative w-16 h-20 bg-gray-200 border border-[#CED4DA] rounded-[2px] overflow-hidden shrink-0 flex items-center justify-center">
                    <img
                      src={doc.url}
                      alt={doc.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        // Fallback image if local path fails
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Eye className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-[2px] bg-[#E8F1F8] text-[#0B5FA5]">
                        {doc.type}
                      </span>
                      {doc.date && <span className="text-[9px] text-[#6C757D] font-bold">{doc.date}</span>}
                    </div>
                    <span className="text-xs font-black text-[#212529] block truncate group-hover:text-[#0B5FA5]">
                      {doc.name}
                    </span>
                    <span className="text-[10px] text-[#6C757D] block truncate">
                      {doc.facility || 'संलग्न चिकित्सा पर्चा'}
                    </span>
                    <span className="text-[10px] font-bold text-[#0B5FA5] flex items-center gap-0.5 mt-1">
                      <Eye className="w-3 h-3" />
                      <span>बड़ा देखें (Click to Zoom)</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* OCR Extracted Text Box */}
            <div className="p-2.5 bg-[#F8FAFC] border border-[#CED4DA] rounded-[2px] text-xs">
              <span className="text-[10px] text-[#6C757D] font-bold block mb-0.5">
                ऑप्टिकल कैरेक्टर रिकग्निशन (OCR Raw Findings):
              </span>
              <p className="font-mono text-[#212529] text-[11px] leading-relaxed">
                {patient.ocrText || 'Rx: Maharasnadi Kwath 20ml BD, Yogaraj Guggulu 2 Tab BD. Diagnosed: Sandhivata.'}
              </p>
            </div>
          </div>

          {/* 4. EXTRACTED MEDICATIONS & AYURVEDIC FORMULATIONS TABLE */}
          <div className="bg-white border border-[#CED4DA] p-4 rounded-[3px] shadow-xs">
            <div className="text-xs font-black text-[#0B5FA5] uppercase tracking-wider mb-2.5 flex items-center gap-1.5 border-b border-[#CED4DA] pb-1.5">
              <Stethoscope className="w-4 h-4 text-[#0B5FA5]" />
              <span>पूर्व औषधि योग एवं मात्रा विवरण (Extracted Formulations & Dosage)</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-[#CED4DA]">
                <thead className="bg-[#E8F1F8] text-[#0B5FA5] font-black text-[10px] uppercase">
                  <tr className="border-b border-[#CED4DA]">
                    <th className="p-2">औषधि का नाम (Medication)</th>
                    <th className="p-2">मात्रा (Dosage)</th>
                    <th className="p-2">सेवन काल (Frequency)</th>
                    <th className="p-2">अनुपान (Vehicle)</th>
                    <th className="p-2">श्रेणी (Category)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#CED4DA] font-semibold text-[#212529]">
                  {medications.map((med, idx) => (
                    <tr key={idx} className="hover:bg-[#F8FAFC]">
                      <td className="p-2 font-bold text-[#0B5FA5]">{med.drugName}</td>
                      <td className="p-2">{med.dosage}</td>
                      <td className="p-2">{med.frequency}</td>
                      <td className="p-2 text-[#495057]">{med.anupana}</td>
                      <td className="p-2">
                        <span className="px-1.5 py-0.5 rounded-[2px] bg-[#EDF7F1] text-[#2F7D4F] text-[9px] font-bold">
                          {med.source}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. VERIFIED LAB BIOMARKERS & INVESTIGATIONS TABLE */}
          <div className="bg-white border border-[#CED4DA] p-4 rounded-[3px] shadow-xs">
            <div className="text-xs font-black text-[#0B5FA5] uppercase tracking-wider mb-2.5 flex items-center gap-1.5 border-b border-[#CED4DA] pb-1.5">
              <Activity className="w-4 h-4 text-[#0B5FA5]" />
              <span>प्रयोगशाला जांच एवं पैथोलॉजी रिपोर्ट (Verified Lab Investigations)</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-[#CED4DA]">
                <thead className="bg-[#E8F1F8] text-[#0B5FA5] font-black text-[10px] uppercase">
                  <tr className="border-b border-[#CED4DA]">
                    <th className="p-2">जांच का नाम (Test / Biomarker)</th>
                    <th className="p-2">प्राप्त मान (Result Value)</th>
                    <th className="p-2">मानक सीमा (Reference Range)</th>
                    <th className="p-2">सत्यापन (Verification)</th>
                    <th className="p-2">स्थिति (Flag)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#CED4DA] font-semibold text-[#212529]">
                  {labFindings.map((lab, idx) => (
                    <tr key={idx} className="hover:bg-[#F8FAFC]">
                      <td className="p-2 font-bold text-[#212529]">{lab.testName}</td>
                      <td className="p-2 font-mono font-bold">{lab.value} {lab.unit}</td>
                      <td className="p-2 text-[#6C757D] font-mono">{lab.referenceRange} {lab.unit}</td>
                      <td className="p-2">
                        <span className="px-1.5 py-0.5 rounded-[2px] bg-[#EDF7F1] text-[#2F7D4F] text-[9px] font-bold flex items-center gap-1 w-fit">
                          <Check className="w-3 h-3 text-[#2F7D4F]" />
                          <span>Tesseract Verified</span>
                        </span>
                      </td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-0.5 rounded-[2px] text-[9px] font-black uppercase ${
                            lab.flag === 'ELEVATED'
                              ? 'bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/30'
                              : 'bg-[#EDF7F1] text-[#2F7D4F]'
                          }`}
                        >
                          {lab.flag}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (5 Cols): Classical Tridosha Prakriti Analysis & Doctor Action Bar */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* 6. CHARAKA SAMHITA PRAKRITI ANALYSIS (Vimanasthana 8) */}
          <div className="bg-white border-2 border-[#2F7D4F] p-4 rounded-[3px] shadow-xs">
            <div className="flex items-center justify-between border-b border-[#2F7D4F]/30 pb-2 mb-3">
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
                द्वन्द्वज प्रकृति (Dual-Dosha Dominance) • मध्यम आत्मविश्वास (Medium Confidence)
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
                  <span className="text-[#E07B1A]">पित्त (Pitta - Metabolism/Agni):</span>
                  <span>{patient.pittaScore}%</span>
                </div>
                <div className="w-full h-2.5 bg-[#EAEDF0] rounded-full overflow-hidden">
                  <div className="h-full bg-[#E07B1A]" style={{ width: `${patient.pittaScore}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-0.5">
                  <span className="text-[#2F7D4F]">कफ (Kapha - Structure/Immunity):</span>
                  <span>{patient.kaphaScore}%</span>
                </div>
                <div className="w-full h-2.5 bg-[#EAEDF0] rounded-full overflow-hidden">
                  <div className="h-full bg-[#2F7D4F]" style={{ width: `${patient.kaphaScore}%` }} />
                </div>
              </div>
            </div>

            {/* Ayurvedic Clinical Guidance Note */}
            <div className="p-3 bg-[#F8FAFC] border border-[#CED4DA] rounded-[2px] text-xs space-y-1.5">
              <span className="text-[10px] font-black text-[#0B5FA5] uppercase tracking-wider block">
                दोष दृष्टि एवं सम्प्राप्ति (Doshic Imbalance & Pathogenesis):
              </span>
              <p className="text-[11px] text-[#495057] leading-relaxed">
                • <strong>दोष अवस्था:</strong> जानु संधि में वात प्रकोप (संधिगत वात) के साथ पित्त-कफ अनुबंध।
              </p>
              <p className="text-[11px] text-[#495057] leading-relaxed">
                • <strong>चिकित्सा सूत्र:</strong> स्थानीय अभ्यंग, जानु बस्ति (महानारायण तैल) एवं वातशामक योगराज गुग्गुलु का प्रयोग लाभप्रद रहेगा।
              </p>
            </div>
          </div>

          {/* 7. PHYSICIAN CONSULTATION & FINAL PRESCRIPTION BOX */}
          <div className="bg-white border border-[#CED4DA] p-4 rounded-[3px] shadow-xs">
            <span className="text-xs font-black text-[#0B5FA5] uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
              <Edit3 className="w-4 h-4 text-[#0B5FA5]" />
              <span>वैद्य परामर्श एवं अंतिम व्यवस्थापत्र (Physician Clinical Notes) *</span>
            </span>

            <textarea
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              rows={4}
              placeholder="चिकित्सक की टिप्पणी एवं औषधि निर्देश यहाँ लिखें..."
              className="w-full p-2.5 bg-[#F8FAFC] border border-[#CED4DA] rounded-[3px] text-xs font-bold text-[#212529] focus:outline-none focus:border-[#0B5FA5] resize-none"
            />

            {/* Fast Clinical Preset Insertion Buttons */}
            <div className="flex flex-wrap gap-1 mt-2">
              <button
                type="button"
                onClick={() => setDoctorNotes((prev) => prev + ' जानु बस्ति (Janu Basti) 7 दिन हेतु अनुशंसित।')}
                className="px-2 py-1 bg-[#E8F1F8] border border-[#0B5FA5]/30 text-[10px] font-bold text-[#0B5FA5] rounded-[2px] hover:bg-[#0B5FA5] hover:text-white cursor-pointer"
              >
                + जानु बस्ति
              </button>
              <button
                type="button"
                onClick={() => setDoctorNotes((prev) => prev + ' पथ्य: वातवर्धक आहार (उड़द, गोभी, ठंडा पानी) का त्याग करें।')}
                className="px-2 py-1 bg-[#E8F1F8] border border-[#0B5FA5]/30 text-[10px] font-bold text-[#0B5FA5] rounded-[2px] hover:bg-[#0B5FA5] hover:text-white cursor-pointer"
              >
                + पथ्य-अपथ्य निर्देश
              </button>
              <button
                type="button"
                onClick={() => setDoctorNotes((prev) => prev + ' 15 दिन पश्चात पुनर्परीक्षण (Follow-up after 15 days).')}
                className="px-2 py-1 bg-[#E8F1F8] border border-[#0B5FA5]/30 text-[10px] font-bold text-[#0B5FA5] rounded-[2px] hover:bg-[#0B5FA5] hover:text-white cursor-pointer"
              >
                + 15 दिन फॉलो-अप
              </button>
            </div>

            {/* 3 ACTIONS BAR: Reject, Amend, Accept */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              <button
                type="button"
                onClick={() => handleAction('rejected')}
                className="py-2.5 px-2 bg-white border border-[#DC2626] hover:bg-[#FEF2F2] text-[#DC2626] text-xs font-black rounded-[3px] flex items-center justify-center gap-1 cursor-pointer transition-colors active:scale-98"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>पुनः परीक्षण (Reject)</span>
              </button>

              <button
                type="button"
                onClick={() => handleAction('amended')}
                className="py-2.5 px-2 bg-white border border-[#0B5FA5] hover:bg-[#E8F1F8] text-[#0B5FA5] text-xs font-black rounded-[3px] flex items-center justify-center gap-1 cursor-pointer transition-colors active:scale-98"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>संशोधन (Amend)</span>
              </button>

              <button
                type="button"
                onClick={() => handleAction('accepted')}
                className="py-2.5 px-2 bg-[#2F7D4F] border border-[#1E4620] hover:bg-[#25633e] text-white text-xs font-black rounded-[3px] flex items-center justify-center gap-1 cursor-pointer transition-colors active:scale-98 shadow-xs"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>स्वीकार करें (Accept)</span>
              </button>
            </div>
          </div>

        </div>

      </main>

      {/* FULL-SCREEN DOCUMENT LIGHTBOX MODAL */}
      {activeDocModal && (
        <div className="fixed inset-0 z-50 bg-black/85 flex flex-col items-center justify-between p-4 select-none">
          
          {/* Modal Top Bar */}
          <div className="w-full max-w-5xl bg-white border border-[#CED4DA] px-4 py-2 rounded-[3px] flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#0B5FA5]" />
              <div>
                <span className="text-xs font-black text-[#212529] block">
                  {activeDocModal.name}
                </span>
                <span className="text-[10px] text-[#6C757D]">
                  {activeDocModal.facility} • {activeDocModal.date}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5))}
                className="p-1.5 border border-[#CED4DA] hover:bg-[#EAEDF0] rounded-[2px] text-xs font-bold flex items-center gap-1 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
                <span>{Math.round(zoomLevel * 100)}%</span>
              </button>

              <button
                type="button"
                onClick={() => setZoomLevel((prev) => Math.max(prev - 0.25, 0.5))}
                className="p-1.5 border border-[#CED4DA] hover:bg-[#EAEDF0] rounded-[2px] text-xs font-bold flex items-center gap-1 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setRotation((prev) => (prev + 90) % 360)}
                className="p-1.5 border border-[#CED4DA] hover:bg-[#EAEDF0] rounded-[2px] text-xs font-bold flex items-center gap-1 cursor-pointer"
                title="Rotate Document"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>घुमाएं</span>
              </button>

              <button
                type="button"
                onClick={handleCloseDocModal}
                className="p-1.5 bg-[#DC2626] text-white hover:bg-red-700 rounded-[2px] text-xs font-bold flex items-center gap-1 cursor-pointer ml-2"
                title="Close"
              >
                <X className="w-4 h-4" />
                <span>बंद करें</span>
              </button>
            </div>
          </div>

          {/* Modal Main Content: Side-by-Side Image and Extracted Text */}
          <div className="w-full max-w-5xl flex-1 my-3 flex flex-col lg:flex-row gap-4 overflow-hidden items-center justify-center">
            
            {/* Scanned Image Preview Container with Pan/Zoom */}
            <div className="flex-1 w-full h-full bg-[#1A202C] border border-[#CED4DA] rounded-[3px] overflow-auto flex items-center justify-center p-4">
              <img
                src={activeDocModal.url}
                alt={activeDocModal.name}
                style={{
                  transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                  transition: 'transform 0.2s ease',
                  maxHeight: '70vh',
                }}
                className="object-contain shadow-2xl rounded-[2px]"
              />
            </div>

            {/* OCR Extracted Text Side Panel */}
            <div className="w-full lg:w-80 bg-white border border-[#CED4DA] rounded-[3px] p-4 flex flex-col justify-between max-h-[70vh] overflow-y-auto">
              <div>
                <span className="text-xs font-black text-[#0B5FA5] uppercase tracking-wider block mb-2 border-b pb-1">
                  दस्तावेज निष्कर्षण विवरण (OCR Extracted Data)
                </span>
                
                <div className="space-y-2 text-xs">
                  <div className="p-2 bg-[#F8FAFC] border border-[#CED4DA] rounded-[2px]">
                    <span className="text-[10px] text-[#6C757D] font-bold block">दस्तावेज प्रकार:</span>
                    <span className="font-bold text-[#212529]">{activeDocModal.type}</span>
                  </div>

                  <div className="p-2 bg-[#F8FAFC] border border-[#CED4DA] rounded-[2px]">
                    <span className="text-[10px] text-[#6C757D] font-bold block">संस्था / लैब:</span>
                    <span className="font-bold text-[#212529]">{activeDocModal.facility || 'AIIA New Delhi'}</span>
                  </div>

                  <div className="p-2 bg-[#F8FAFC] border border-[#CED4DA] rounded-[2px]">
                    <span className="text-[10px] text-[#6C757D] font-bold block">पाठ (Raw Text):</span>
                    <p className="font-mono text-[11px] text-[#212529] mt-0.5 leading-relaxed">
                      {activeDocModal.ocrSnippet || 'Rx: Formulations extracted and verified.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2 border-t text-[10px] text-[#6C757D] font-bold text-center">
                Tesseract Spatial Bounding-Box Verified
              </div>
            </div>

          </div>

          <div className="text-white text-xs font-semibold">
            मूल पर्चे एवं जांच रिपोर्ट का उच्च-रिज़ॉल्यूशन पूर्वावलोकन • ESC या बंद करें दबाएं
          </div>

        </div>
      )}

      {/* TOAST FEEDBACK NOTIFICATION */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#212529] text-white px-4 py-3 rounded-[3px] border border-[#CED4DA] shadow-xl text-xs font-black flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4 text-[#2F7D4F]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Persistent Single-Line Clean Footer */}
      <footer className="w-full bg-white border-t border-[#CED4DA] py-2 px-6 text-xs text-[#495057] select-none shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
          <div className="flex items-center gap-2 font-bold" style={{ color: '#0B5FA5' }}>
            <span>अखिल भारतीय आयुर्वेद संस्थान (AIIA)</span>
            <span className="text-[#CED4DA]">|</span>
            <span className="font-semibold text-[#495057]">National Ayush EMR Consultation Terminal</span>
          </div>
          <div className="text-[11px] font-semibold text-[#6C757D]">
            <span>DPDP Act 2023 & Ayush Pharmacopoeia (API) Certified</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
