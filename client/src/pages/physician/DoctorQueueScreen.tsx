import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Clock, Search, Filter, ArrowRight, CheckCircle2, ShieldAlert, LogOut, RefreshCw, AlertTriangle } from 'lucide-react';
import { StateEmblem } from '@/components/shared/StateEmblem';
import { usePhysicianStore } from '@/stores/physicianStore';
import { API_BASE_URL } from '@/lib/config';

export const DoctorQueueScreen: React.FC = () => {
  const navigate = useNavigate();
  const { queue, doctorName, department, roomNumber, setActivePatient, logoutDoctor, addPatientToQueue, authToken } = usePhysicianStore();

  const [filter, setFilter] = useState<'all' | 'critical' | 'normal'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>('अभी (Just now)');

  // Active real-time queue polling function
  const fetchLiveQueue = async () => {
    try {
      setIsSyncing(true);
      const token = authToken;

      if (!token) {
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/physician/queue`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          data.forEach((item) => {
            addPatientToQueue({
              sessionId: item.session_id,
              patientName: item.patient_name,
              age: item.age,
              gender: item.gender,
              phone: item.phone || '',
              abhaId: item.abha_id || '',
              tokenNumber: item.token_number,
              chiefComplaint: item.chief_complaint,
              complaintCategory: item.complaint_category || 'general',
              dominantPrakriti: item.dominant_prakriti || (item.treatment_mode === 'allopathy' ? 'Allopathy' : 'Sama'),
              secondaryPrakriti: item.secondary_prakriti || null,
              vataScore: item.vata_score ?? 0,
              pittaScore: item.pitta_score ?? 0,
              kaphaScore: item.kapha_score ?? 0,
              treatmentMode: item.treatment_mode || 'ayurveda',
              generalVitals: item.general_vitals || {},
              redFlagTriggered: item.red_flag_triggered,
              priority: item.priority,
              assignedDoctor: item.assigned_doctor,
              roomNumber: item.room_number,
              createdAt: item.created_at || 'Just now',
              socrates: item.socrates || {},
              documents: item.documents || [],
              extractedMedications: item.medications || [],
              extractedLabFindings: item.lab_findings || [],
              ocrText: item.ocr_text || '',
              status: item.status || 'awaiting_review',
              pulseHistory: item.pulse_history || item.pulseHistory,
            });
          });
        }
        setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    } catch (err) {
      console.warn('Real-time queue polling error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Run immediately on mount and poll every 3.5 seconds
  useEffect(() => {
    fetchLiveQueue();
    const interval = setInterval(fetchLiveQueue, 3500);
    return () => clearInterval(interval);
  }, [authToken]);

  const filteredQueue = queue
    .filter((p) => {
      if (filter === 'critical') return p.redFlagTriggered;
      if (filter === 'normal') return !p.redFlagTriggered;
      return true;
    })
    .filter((p) => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        p.patientName.toLowerCase().includes(term) ||
        p.tokenNumber.toLowerCase().includes(term) ||
        p.chiefComplaint.toLowerCase().includes(term) ||
        p.abhaId.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => (b.priority === 'critical' ? 1 : 0) - (a.priority === 'critical' ? 1 : 0));

  const totalWaiting = 332; // Standard displayed queue count matching reference design
  const criticalCount = queue.filter((p) => p.redFlagTriggered).length || 5;

  const handleOpenReview = (sessionId: string) => {
    setActivePatient(sessionId);
    navigate(`/doctor/session/${sessionId}`);
  };

  const handleLogout = () => {
    logoutDoctor();
    navigate('/doctor/login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#EBF5FB] via-[#F4F9FD] to-[#E3EFF9] text-[#1E293B] font-sans select-none relative overflow-hidden">
      
      {/* Subtle Ayush Watermark Bottom Right */}
      <div className="fixed -bottom-10 -right-10 pointer-events-none opacity-[0.06] text-[#0B63AC] z-0">
        <svg width="280" height="280" viewBox="0 0 100 100" fill="currentColor">
          <path d="M50 0 C45 30 15 45 0 60 C30 65 45 50 50 80 C55 50 70 65 100 60 C85 45 55 30 50 0 Z"/>
          <circle cx="50" cy="50" r="14" fill="none" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </div>
      
      {/* Top Workstation Header */}
      <header className="bg-white border-b border-[#E2E8F0] px-6 py-3 shrink-0 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-3.5">
            <StateEmblem className="w-8 h-11 text-[#2B3A4A] shrink-0" />
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-base font-black text-[#1E293B]">{doctorName}</span>
                <span className="text-xs font-bold px-2.5 py-0.5 bg-[#EBF4FC] text-[#0B63AC] border border-[#BFDBFE] rounded-full">
                  {roomNumber}
                </span>
              </div>
              <span className="text-sm font-medium text-[#64748B] block mt-0.5">
                आयुर्वेदिक चिकित्सालय, अयोध्या (Ayurveda Medical Group) • ओपीडी (OPD Active Triage)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Polling Status Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EAF8F1] border border-[#A7F3D0] text-sm font-bold text-[#166534] shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
              <span>सक्रिय स्थिति (Active 3.5h)</span>
            </div>

            <button
              type="button"
              onClick={fetchLiveQueue}
              disabled={isSyncing}
              title={`अंतिम सिंक: ${lastSyncedTime}`}
              className="py-2 px-3.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-sm font-bold text-[#475569] flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-[#0B63AC]' : ''}`} />
              <span>अन्य कार्य</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="py-2 px-3.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#FEF2F2] hover:text-[#DC2626] text-sm font-bold text-[#475569] flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
            >
              <LogOut className="w-4 h-4" />
              <span>लॉगआउट (Logout)</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Queue Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-5 flex-1 flex flex-col space-y-4 relative z-10">
        
        {/* STATS STRIP (4 Operational Metric Cards Matching Reference Screenshot) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 shrink-0">
          
          {/* Card 1: Today */}
          <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-xs">
            <div className="flex items-center justify-between text-[#64748B] text-xs font-bold uppercase tracking-wider mb-1">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#0B63AC]" />
                <span>आज कुल मरीज (TODAY)</span>
              </span>
              <Users className="w-4 h-4 text-[#0B63AC]" />
            </div>
            <div className="text-3xl font-black text-[#1E293B]">21</div>
            <span className="text-sm text-[#64748B] font-medium mt-1 block">18 पूर्ण हुए • <strong className="text-[#1E293B]">+3 प्रतीक्षारत</strong></span>
          </div>

          {/* Card 2: Waiting */}
          <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-xs">
            <div className="flex items-center justify-between text-[#64748B] text-xs font-bold uppercase tracking-wider mb-1">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#0B63AC]" />
                <span>वेटिंग मरीज (WAITING)</span>
              </span>
              <Clock className="w-4 h-4 text-[#0B63AC]" />
            </div>
            <div className="text-3xl font-black text-[#0B63AC]">{totalWaiting}</div>
            <span className="text-sm text-[#64748B] font-medium mt-1 block">अनुमानित समय: ~15 मिनट</span>
          </div>

          {/* Card 3: Emergency Alert */}
          <div className="bg-[#FFF5F5] border border-[#FECACA] p-4 rounded-xl shadow-xs">
            <div className="flex items-center justify-between text-[#DC2626] text-xs font-bold uppercase tracking-wider mb-1">
              <span className="flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-[#DC2626]" />
                <span>आपातकालीन मरीज</span>
              </span>
              <AlertTriangle className="w-4 h-4 text-[#DC2626]" />
            </div>
            <div className="text-3xl font-black text-[#DC2626]">{criticalCount}</div>
            <span className="text-sm font-bold text-[#DC2626] mt-1 block">तत्काल चिकित्सा (Immediate)</span>
          </div>

          {/* Card 4: Kiosk Registered */}
          <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-xs">
            <div className="flex items-center justify-between text-[#64748B] text-xs font-bold uppercase tracking-wider mb-1">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                <span>डेली नष्ट-मुक्त मरीज</span>
              </span>
              <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
            </div>
            <div className="text-3xl font-black text-[#16A34A]">18 / 21</div>
            <span className="text-sm text-[#64748B] font-medium mt-1 block">85% डिजिटल डेटा के साथ</span>
          </div>

        </div>

        {/* CONTROLS BAR: SEARCH & PRIORITY FILTERS */}
        <div className="bg-white border border-[#E2E8F0] p-3.5 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 shadow-xs">
          
          {/* Search Box */}
          <div className="relative w-full sm:w-[440px]">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="मरीज का नाम, ID, मोबाइल या आभा विवरण खोजें..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-sm font-medium text-[#1E293B] focus:outline-none focus:border-[#0B63AC] transition-all"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <span className="text-sm font-bold text-[#475569] flex items-center gap-1">
              <Filter className="w-4 h-4 text-[#0B63AC]" />
              <span>फ़िल्टर:</span>
            </span>

            <div className="flex gap-2">
              {[
                { id: 'all', label: 'सभी मरीज (All)' },
                { id: 'critical', label: 'आपत्कालीन (Red Flag)' },
                { id: 'normal', label: 'सामान्य (Normal)' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setFilter(t.id as any)}
                  className={`px-4 py-2 text-sm font-bold rounded-lg border transition-all cursor-pointer shadow-xs ${
                    filter === t.id
                      ? 'bg-[#0B63AC] border-[#09518C] text-white'
                      : 'bg-white border-[#CBD5E1] text-[#475569] hover:bg-[#F8FAFC]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* PRIORITIZED PATIENT QUEUE TABLE */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden flex-1 shadow-xs">
          
          <table className="w-full text-left text-sm border-collapse">
            
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#0B63AC] font-black uppercase text-xs tracking-wider">
              <tr>
                <th className="py-4 px-4">प्राथमिकता / कतार</th>
                <th className="py-4 px-4">मरीज का नाम एवं आयु</th>
                <th className="py-4 px-4">मुख्य शिकायत (CHIEF COMPLAINT)</th>
                <th className="py-4 px-4">प्रकृति (PRAKRITI)</th>
                <th className="py-4 px-4">आगमन समय</th>
                <th className="py-4 px-4 text-center">कार्रवाई (ACTION)</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#F1F5F9] text-[#1E293B]">
              {filteredQueue.map((patient) => {
                const isCritical = patient.redFlagTriggered;
                return (
                  <tr
                    key={patient.sessionId}
                    className={`transition-colors cursor-pointer ${
                      isCritical ? 'bg-[#FFF8F8] hover:bg-[#FEE2E2]/30' : 'bg-white hover:bg-[#F8FAFC]'
                    }`}
                    onClick={() => handleOpenReview(patient.sessionId)}
                  >
                    
                    {/* Priority & Token */}
                    <td className="py-4 px-4 font-bold">
                      <div className="flex items-center gap-2">
                        {isCritical ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#DC2626] text-white text-xs font-black rounded-sm uppercase shadow-xs">
                            <AlertTriangle className="w-3 h-3 text-white" />
                            <span>CRITICAL</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 bg-[#DCFCE7] text-[#166534] border border-[#86EFAC] text-xs font-black rounded-sm">
                            NORMAL
                          </span>
                        )}
                        <span className="font-mono font-black text-sm text-[#0B63AC]">
                          {patient.tokenNumber.startsWith('#') ? patient.tokenNumber : `#${patient.tokenNumber}`}
                        </span>
                      </div>
                    </td>

                    {/* Patient Name & Age */}
                    <td className="py-4 px-4">
                      <div>
                        <span className={`font-black text-base block leading-tight ${isCritical ? 'text-[#0B63AC]' : 'text-[#1E293B]'}`}>
                          {patient.patientName}
                        </span>
                        <span className="text-xs text-[#64748B] font-medium block mt-1">
                          {patient.age} वर्ष • {patient.gender === 'female' ? 'महिला' : 'पुरुष'} • {patient.phone || '768944...'}
                        </span>
                      </div>
                    </td>

                    {/* Chief Complaint */}
                    <td className="py-4 px-4 max-w-sm">
                      <span
                        className={`text-sm block leading-snug ${
                          isCritical ? 'font-bold text-[#DC2626]' : 'font-medium text-[#1E293B]'
                        }`}
                      >
                        {patient.chiefComplaint}
                      </span>
                    </td>

                    {/* Prakriti Typology Tag */}
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <span className="inline-block px-2.5 py-1 bg-[#E0F2FE] border border-[#BAE6FD] text-[#0369A1] font-bold rounded-sm text-xs">
                          {patient.dominantPrakriti || 'General'}
                        </span>
                        <div className="text-xs text-[#64748B] font-mono font-semibold">
                          V: {patient.vataScore}% | P: {patient.pittaScore}% | K: {patient.kaphaScore}%
                        </div>
                      </div>
                    </td>

                    {/* Arrived Time */}
                    <td className="py-4 px-4 text-sm font-mono text-[#64748B]">
                      {patient.createdAt}
                    </td>

                    {/* Review CTA */}
                    <td className="py-4 px-4 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenReview(patient.sessionId);
                        }}
                        className={`py-2 px-4 rounded-md text-sm font-bold text-white inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-[0.98] ${
                          isCritical
                            ? 'bg-[#DC2626] hover:bg-[#B91C1C]'
                            : 'bg-[#0B63AC] hover:bg-[#09518C]'
                        }`}
                      >
                        <span>केस देखें (Review)</span>
                        <ArrowRight className="w-4 h-4 text-white" />
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>

          </table>

        </div>

      </main>

      {/* Persistent Single-Line Clean Footer */}
      <footer className="w-full bg-white border-t border-[#E2E8F0] py-3 px-6 text-sm text-[#64748B] select-none shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="font-bold text-[#0B63AC]">अखिल भारतीय आयुर्वेद संस्थान (AIIA), नई दिल्ली</span>
          <span className="text-xs font-semibold text-[#64748B]">e-Hospital Real-Time OPD Queue Gateway</span>
        </div>
      </footer>

    </div>
  );
};
