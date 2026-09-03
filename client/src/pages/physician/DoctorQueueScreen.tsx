import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, AlertTriangle, Users, Clock, Search, Filter, ArrowRight, CheckCircle2, ShieldAlert, LogOut } from 'lucide-react';
import { usePhysicianStore } from '@/stores/physicianStore';

export const DoctorQueueScreen: React.FC = () => {
  const navigate = useNavigate();
  const { queue, doctorName, department, roomNumber, setActivePatient, logoutDoctor } = usePhysicianStore();

  const [filter, setFilter] = useState<'all' | 'critical' | 'normal'>('all');
  const [searchTerm, setSearchTerm] = useState('');

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

  const totalWaiting = queue.length;
  const criticalCount = queue.filter((p) => p.redFlagTriggered).length;

  const handleOpenReview = (sessionId: string) => {
    setActivePatient(sessionId);
    navigate(`/doctor/session/${sessionId}`);
  };

  const handleLogout = () => {
    logoutDoctor();
    navigate('/doctor/login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#EAEDF0] text-[#212529] font-sans select-none">
      
      {/* Top Workstation Header */}
      <header className="bg-white border-b border-[#CED4DA] px-6 py-2.5 shrink-0 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[2px] bg-[#0B5FA5] text-white flex items-center justify-center font-black">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-[#0B5FA5]">{doctorName}</span>
                <span className="text-[11px] font-bold px-2 py-0.5 bg-[#E8F1F8] text-[#0B5FA5] rounded-[2px]">
                  {roomNumber}
                </span>
              </div>
              <span className="text-[10px] font-semibold text-[#6C757D]">
                {department} • ओपीडी सक्रिय कतार (OPD Active Triage)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleLogout}
              className="py-1.5 px-3 rounded-[3px] border border-[#CED4DA] hover:bg-[#FEF2F2] hover:text-[#DC2626] text-xs font-bold text-[#495057] flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>लॉगआउट (Logout)</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Queue Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 flex-1 flex flex-col space-y-4">
        
        {/* STATS STRIP (4 Metrics) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
          
          <div className="bg-white border border-[#CED4DA] p-3.5 rounded-[3px]">
            <div className="flex items-center justify-between text-[#6C757D] text-[11px] font-bold uppercase mb-1">
              <span>आज कुल मरीज (Today)</span>
              <Users className="w-4 h-4 text-[#0B5FA5]" />
            </div>
            <div className="text-2xl font-black text-[#212529]">21</div>
            <span className="text-[10px] text-[#2F7D4F] font-semibold">18 परामर्श पूर्ण (Completed)</span>
          </div>

          <div className="bg-white border border-[#CED4DA] p-3.5 rounded-[3px]">
            <div className="flex items-center justify-between text-[#6C757D] text-[11px] font-bold uppercase mb-1">
              <span>कतार में प्रतीक्षारत (Waiting)</span>
              <Clock className="w-4 h-4 text-[#0B5FA5]" />
            </div>
            <div className="text-2xl font-black text-[#0B5FA5]">{totalWaiting}</div>
            <span className="text-[10px] text-[#495057] font-semibold">अनुमानित समय: ~15 मिनट</span>
          </div>

          <div className="bg-white border-2 border-[#DC2626] p-3.5 rounded-[3px] bg-[#FEF2F2]/40">
            <div className="flex items-center justify-between text-[#DC2626] text-[11px] font-bold uppercase mb-1">
              <span>आपातकालीन रेड-फ्लैग</span>
              <ShieldAlert className="w-4 h-4 text-[#DC2626]" />
            </div>
            <div className="text-2xl font-black text-[#DC2626]">{criticalCount}</div>
            <span className="text-[10px] text-[#DC2626] font-extrabold">तत्काल प्राथमिकता (Immediate)</span>
          </div>

          <div className="bg-white border border-[#CED4DA] p-3.5 rounded-[3px]">
            <div className="flex items-center justify-between text-[#6C757D] text-[11px] font-bold uppercase mb-1">
              <span>औसत समय बचत (Saved)</span>
              <CheckCircle2 className="w-4 h-4 text-[#2F7D4F]" />
            </div>
            <div className="text-2xl font-black text-[#2F7D4F]">72%</div>
            <span className="text-[10px] text-[#6C757D] font-semibold">कियोस्क पूर्व-पंजीकरण द्वारा</span>
          </div>

        </div>

        {/* CONTROLS BAR: SEARCH & PRIORITY FILTERS */}
        <div className="bg-white border border-[#CED4DA] p-3 rounded-[3px] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          
          {/* Search Box */}
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-[#6C757D] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="मरीज का नाम, टोकन # या आभा संख्या खोजें..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#F8FAFC] border border-[#CED4DA] rounded-[3px] text-xs font-bold text-[#212529] focus:outline-none focus:border-[#0B5FA5]"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-[#6C757D] flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>फ़िल्टर:</span>
            </span>

            <div className="flex gap-1.5">
              {[
                { id: 'all', label: 'सभी मरीज (All)' },
                { id: 'critical', label: 'आपातकालीन (Red Flag)' },
                { id: 'normal', label: 'सामान्य (Normal)' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setFilter(t.id as any)}
                  className="px-3 py-1 text-xs font-extrabold rounded-[3px] border transition-colors cursor-pointer"
                  style={{
                    backgroundColor: filter === t.id ? '#0B5FA5' : '#FFFFFF',
                    borderColor: filter === t.id ? '#084B83' : '#CED4DA',
                    color: filter === t.id ? '#FFFFFF' : '#495057',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* PRIORITIZED PATIENT QUEUE TABLE */}
        <div className="bg-white border border-[#CED4DA] rounded-[3px] overflow-hidden flex-1 shadow-sm">
          
          <table className="w-full text-left text-xs border-collapse">
            
            <thead className="bg-[#E8F1F8] border-b border-[#CED4DA] text-[#0B5FA5] font-black uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">प्राथमिकता / टोकन</th>
                <th className="py-3 px-4">रोगी का नाम एवं आयु</th>
                <th className="py-3 px-4">मुख्य स्वास्थ्य समस्या (Chief Complaint)</th>
                <th className="py-3 px-4">प्रकृति विश्लेषण (Prakriti)</th>
                <th className="py-3 px-4">आगमन समय</th>
                <th className="py-3 px-4 text-right">कार्रवाई (Action)</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#CED4DA] text-[#212529] font-medium">
              {filteredQueue.map((patient) => {
                const isCritical = patient.redFlagTriggered;
                return (
                  <tr
                    key={patient.sessionId}
                    className={`transition-colors hover:bg-[#F8FAFC] cursor-pointer ${
                      isCritical ? 'bg-[#FEF2F2]/60' : ''
                    }`}
                    onClick={() => handleOpenReview(patient.sessionId)}
                  >
                    
                    {/* Priority & Token */}
                    <td className="py-3.5 px-4 font-bold">
                      <div className="flex items-center gap-2">
                        {isCritical ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#DC2626] text-white text-[10px] font-black rounded-[2px] uppercase">
                            <AlertTriangle className="w-3 h-3 text-white" />
                            <span>CRITICAL</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 bg-[#EDF7F1] text-[#2F7D4F] border border-[#2F7D4F]/30 text-[10px] font-black rounded-[2px]">
                            NORMAL
                          </span>
                        )}
                        <span className="font-mono font-black text-sm text-[#0B5FA5]">
                          {patient.tokenNumber}
                        </span>
                      </div>
                    </td>

                    {/* Patient Name & Age */}
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-black text-sm block leading-tight text-[#212529]">
                          {patient.patientName}
                        </span>
                        <span className="text-[10px] text-[#6C757D] block mt-0.5">
                          {patient.age} वर्ष • {patient.gender === 'female' ? 'महिला' : 'पुरुष'} • आभा: {patient.abhaId}
                        </span>
                      </div>
                    </td>

                    {/* Chief Complaint */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <span className="font-bold text-xs block leading-snug line-clamp-2" style={{ color: isCritical ? '#991B1B' : '#212529' }}>
                        {patient.chiefComplaint}
                      </span>
                      <span className="text-[10px] text-[#6C757D] font-semibold block mt-0.5">
                        {patient.socrates.onset ? `अवधि: ${patient.socrates.onset}` : ''}
                      </span>
                    </td>

                    {/* Prakriti Typology Tag */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <span className="inline-block px-2 py-0.5 bg-[#EDF7F1] border border-[#2F7D4F]/40 text-[#2F7D4F] font-black rounded-[2px] text-[11px]">
                          {patient.dominantPrakriti}
                        </span>
                        <div className="text-[9px] text-[#6C757D] font-bold">
                          V: {patient.vataScore}% | P: {patient.pittaScore}% | K: {patient.kaphaScore}%
                        </div>
                      </div>
                    </td>

                    {/* Arrived Time */}
                    <td className="py-3.5 px-4 text-[11px] font-bold text-[#6C757D]">
                      {patient.createdAt}
                    </td>

                    {/* Review CTA */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenReview(patient.sessionId);
                        }}
                        className="py-1.5 px-3.5 rounded-[3px] border border-[#084B83] text-xs font-black text-white inline-flex items-center gap-1.5 cursor-pointer transition-transform active:scale-[0.98]"
                        style={{ backgroundColor: isCritical ? '#DC2626' : '#0B5FA5' }}
                      >
                        <span>केस देखें (Review)</span>
                        <ArrowRight className="w-3.5 h-3.5 text-white" />
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
      <footer className="w-full bg-white border-t border-[#CED4DA] py-2 px-6 text-xs text-[#495057] select-none shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="font-bold text-[#0B5FA5]">अखिल भारतीय आयुर्वेद संस्थान (AIIA), नई दिल्ली</span>
          <span className="text-[11px] font-semibold text-[#6C757D]">e-Hospital Real-Time OPD Queue Gateway</span>
        </div>
      </footer>

    </div>
  );
};
