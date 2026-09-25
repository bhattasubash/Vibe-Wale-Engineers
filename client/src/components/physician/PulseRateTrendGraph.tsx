import React, { useState, useMemo } from 'react';
import {
  Heart,
  CheckCircle2,
  FileText,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from 'lucide-react';
import { PulseHistoryItem } from '@/stores/physicianStore';
import { ProvenanceBadge } from '@/pages/physician/DoctorSessionReview';

interface PulseRateTrendGraphProps {
  records?: PulseHistoryItem[];
  patientName?: string;
  dominantPrakriti?: string;
  currentPulse?: number | string;
}

// Fallback comprehensive mock history in case none provided
const DEFAULT_SAMPLE_PULSE_HISTORY: PulseHistoryItem[] = [
  {
    date: '15 Oct 2025',
    bpm: 72,
    source: 'AIIA OPD Record #8421',
    rhythm: 'Regular (सम गति)',
    notes: 'Resting pulse normal, balanced vata-pitta',
    facility: 'AIIA OPD Block B',
  },
  {
    date: '28 Nov 2025',
    bpm: 84,
    source: 'Civil Hospital Knee Clinic',
    rhythm: 'Slight Elevation (तीव्र)',
    notes: 'Mild sinus tachycardia during joint flare',
    facility: 'Civil Hospital Ayodhya',
  },
  {
    date: '14 Jan 2026',
    bpm: 78,
    source: 'Ayush Wellness Center',
    rhythm: 'Regular (सम)',
    notes: 'Post-Maharasnadi Kwath review',
    facility: 'Ayush AYUSH Dispensary',
  },
  {
    date: '02 Feb 2026',
    bpm: 92,
    source: 'Emergency Triage Note',
    rhythm: 'Elevated (वात प्रकोप)',
    notes: 'Cold weather arthritis exacerbation',
    facility: 'District Hospital Triage',
  },
  {
    date: '22 Feb 2026',
    bpm: 74,
    source: 'Cardiology OPD Vitals',
    rhythm: 'Regular Sinus (स्थिर)',
    notes: 'Vitals stable, normal ECG rhythm',
    facility: 'AIIA Cardiology OPD',
  },
  {
    date: '10 Sep 2026',
    bpm: 76,
    source: 'Current MediKiosk Intake',
    rhythm: 'Normal (प्राकृत नाड़ी)',
    notes: 'Current baseline vitals check',
    facility: 'MediKiosk Terminal 01',
  },
];

export const PulseRateTrendGraph: React.FC<PulseRateTrendGraphProps> = ({
  records,
  dominantPrakriti,
}) => {
  const [useSampleData, setUseSampleData] = useState(false);
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);
  const [showDataTable, setShowDataTable] = useState(false);

  // Determine active data set
  const activeRecords = useMemo(() => {
    if (useSampleData || !records || records.length === 0) {
      return DEFAULT_SAMPLE_PULSE_HISTORY;
    }
    return records;
  }, [records, useSampleData]);

  // Statistics
  const bpmValues = activeRecords.map((r) => r.bpm);
  const latestBpm = bpmValues[bpmValues.length - 1] ?? 76;
  const avgBpm = Math.round(bpmValues.reduce((a, b) => a + b, 0) / (bpmValues.length || 1));
  const minBpm = Math.min(...bpmValues);
  const maxBpm = Math.max(...bpmValues);

  // Selected item (defaults to latest)
  const activeIndex = selectedPointIndex !== null ? selectedPointIndex : activeRecords.length - 1;
  const activeItem = activeRecords[activeIndex] || activeRecords[activeRecords.length - 1];

  // SVG dimensions
  const svgWidth = 720;
  const svgHeight = 250;
  const padLeft = 60;
  const padRight = 35;
  const padTop = 35;
  const padBottom = 45;
  const chartWidth = svgWidth - padLeft - padRight;
  const chartHeight = svgHeight - padTop - padBottom;

  // Y-axis scale: 40 BPM to 130 BPM
  const minY = 40;
  const maxY = 130;
  const getY = (bpm: number) => {
    const clamped = Math.max(minY, Math.min(maxY, bpm));
    return padTop + chartHeight - ((clamped - minY) / (maxY - minY)) * chartHeight;
  };

  const getX = (index: number) => {
    if (activeRecords.length <= 1) return padLeft + chartWidth / 2;
    return padLeft + (index / (activeRecords.length - 1)) * chartWidth;
  };

  // Normal range Y coordinates (60 - 100 bpm)
  const yNormalMin = getY(60);
  const yNormalMax = getY(100);

  // Polyline points
  const pointsString = activeRecords
    .map((r, i) => `${getX(i)},${getY(r.bpm)}`)
    .join(' ');

  // Area path for gradient under curve
  const areaPath = activeRecords.length > 0
    ? `M ${getX(0)},${getY(activeRecords[0].bpm)} ` +
      activeRecords.map((r, i) => `L ${getX(i)},${getY(r.bpm)}`).join(' ') +
      ` L ${getX(activeRecords.length - 1)},${padTop + chartHeight} L ${getX(0)},${padTop + chartHeight} Z`
    : '';

  // Get status color
  const getBpmStatus = (bpm: number) => {
    if (bpm < 60) {
      return { label: 'Bradycardia (मन्द नाड़ी)', badgeBg: '#FEF3C7', badgeText: '#92400E' };
    }
    if (bpm > 100) {
      return { label: 'Tachycardia (तीव्र नाड़ी)', badgeBg: '#FEF2F2', badgeText: '#DC2626' };
    }
    return { label: 'Normal Sinus (सामान्य प्राकृत)', badgeBg: '#DCFCE7', badgeText: '#166534' };
  };

  const latestStatus = getBpmStatus(latestBpm);

  return (
    <div className="bg-white border border-[#CBD5E1] rounded-xl shadow-xs overflow-hidden transition-all">
      
      {/* Top Header Section */}
      <div className="p-4 border-b border-[#E2E8F0] bg-gradient-to-r from-[#FFF5F5] via-[#FFFFFF] to-[#F8FAFC]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 flex-wrap">
          
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#FFE4E6] border border-[#FECDD3] flex items-center justify-center text-[#E11D48] shadow-2xs">
              <Heart className="w-5 h-5 fill-[#E11D48] animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-black text-[#1E293B]">
                  पूर्व मेडिकल रिकॉर्ड: हृदय गति एवं नाड़ी दर ग्राफ
                </span>
                <span className="hidden sm:inline-block text-xs font-semibold text-[#64748B]">
                  • Pulse Rate Trend
                </span>
              </div>
              <span className="text-xs text-[#64748B] block mt-0.5">
                ऐतिहासिक दस्तावेजों एवं पूर्व पर्चों से संकलित नाड़ी गति (Chronological Nadi Pariksha & BPM History)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
            <ProvenanceBadge source="document-extracted" />
            
            <button
              type="button"
              onClick={() => setUseSampleData(!useSampleData)}
              className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md border border-[#CBD5E1] bg-white hover:bg-[#F1F5F9] text-[#475569] cursor-pointer shadow-2xs transition-colors"
              title="Toggle Sample Data"
            >
              <RefreshCw className="w-3 h-3 text-[#0B63AC]" />
              <span>{useSampleData ? 'वास्तविक रिकॉर्ड देखें' : 'नमूना डेटा (Mock Data)'}</span>
            </button>
          </div>

        </div>

        {/* 4 Clinical Snapshot Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3.5">
          
          {/* Tile 1: Latest Pulse */}
          <div className="p-2.5 rounded-lg bg-white border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
            <span className="text-[11px] font-bold text-[#64748B] block">नवीनतम नाड़ी (Latest)</span>
            <div className="flex items-baseline gap-1.5 my-0.5">
              <span className="text-2xl font-black font-mono text-[#E11D48]">
                {latestBpm}
              </span>
              <span className="text-xs font-bold text-[#64748B]">BPM</span>
            </div>
            <span
              className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full w-fit"
              style={{ backgroundColor: latestStatus.badgeBg, color: latestStatus.badgeText }}
            >
              {latestStatus.label}
            </span>
          </div>

          {/* Tile 2: Average Pulse */}
          <div className="p-2.5 rounded-lg bg-white border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
            <span className="text-[11px] font-bold text-[#64748B] block">औसत दर (Average)</span>
            <div className="flex items-baseline gap-1.5 my-0.5">
              <span className="text-2xl font-black font-mono text-[#0B63AC]">
                {avgBpm}
              </span>
              <span className="text-xs font-bold text-[#64748B]">BPM</span>
            </div>
            <span className="text-[10px] font-bold text-[#475569]">
              {activeRecords.length} ऐतिहासिक पर्चे दर्ज
            </span>
          </div>

          {/* Tile 3: Range Min / Max */}
          <div className="p-2.5 rounded-lg bg-white border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
            <span className="text-[11px] font-bold text-[#64748B] block">सीमा (Min / Max)</span>
            <div className="flex items-baseline gap-1.5 my-0.5">
              <span className="text-xl font-black font-mono text-[#1E293B]">
                {minBpm} - {maxBpm}
              </span>
              <span className="text-xs font-bold text-[#64748B]">BPM</span>
            </div>
            <span className="text-[10px] font-bold text-[#166534] flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
              <span>मानक: 60 - 100 BPM</span>
            </span>
          </div>

          {/* Tile 4: Ayurvedic Rhythm Assessment */}
          <div className="p-2.5 rounded-lg bg-white border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
            <span className="text-[11px] font-bold text-[#64748B] block">नाड़ी गति (Rhythm / Gati)</span>
            <span className="text-sm font-black text-[#15803D] truncate my-0.5" title={activeItem.rhythm || 'सम गति'}>
              {activeItem.rhythm || 'सम गति (Regular Sinus)'}
            </span>
            <span className="text-[10px] font-medium text-[#64748B] truncate">
              {dominantPrakriti ? `${dominantPrakriti} प्रकृति अनुकूल` : 'त्रिदोष साम्यावस्था'}
            </span>
          </div>

        </div>
      </div>

      {/* Main Graph Area */}
      <div className="p-4 bg-white">
        
        {/* Interactive Point Detail Alert Box */}
        {activeItem && (
          <div className="mb-3 p-3 bg-[#FFF5F5] border border-[#FECDD3] rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E11D48] animate-ping" />
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-[#1E293B]">चयनित रिकॉर्ड ({activeItem.date}):</span>
                <span className="font-mono font-black text-sm text-[#E11D48] px-2 py-0.5 bg-white border border-[#FECDD3] rounded-md">
                  {activeItem.bpm} BPM
                </span>
                <span className="font-semibold text-[#475569]">
                  • स्रोत: <strong className="text-[#0B63AC]">{activeItem.source}</strong> ({activeItem.facility || 'Clinical OPD'})
                </span>
              </div>
            </div>
            {activeItem.notes && (
              <span className="text-[#64748B] italic sm:text-right">
                टिप्पणी: {activeItem.notes}
              </span>
            )}
          </div>
        )}

        {/* SVG Visualization */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[620px]">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto select-none"
              style={{ overflow: 'visible' }}
            >
              <defs>
                {/* Area Gradient */}
                <linearGradient id="pulseAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E11D48" stopOpacity="0.28" />
                  <stop offset="60%" stopColor="#E11D48" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#E11D48" stopOpacity="0.00" />
                </linearGradient>

                {/* Normal Zone Gradient */}
                <linearGradient id="normalBandGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.10" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.05" />
                </linearGradient>

                {/* Drop shadow for points */}
                <filter id="pointShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#E11D48" floodOpacity="0.3" />
                </filter>
              </defs>

              {/* 1. Normal Reference Range Shaded Band (60 - 100 BPM) */}
              <rect
                x={padLeft}
                y={yNormalMax}
                width={chartWidth}
                height={Math.abs(yNormalMin - yNormalMax)}
                fill="url(#normalBandGradient)"
                rx="3"
              />

              {/* Labeled Reference Boundary Lines */}
              <line
                x1={padLeft}
                y1={yNormalMax}
                x2={padLeft + chartWidth}
                y2={yNormalMax}
                stroke="#10B981"
                strokeWidth="1.2"
                strokeDasharray="4 4"
              />
              <text
                x={padLeft + chartWidth - 6}
                y={yNormalMax - 5}
                textAnchor="end"
                fontSize="10"
                fontWeight="700"
                fill="#059669"
                fontFamily="sans-serif"
              >
                अधिकतम सामान्य सीमा (Max Normal 100 BPM)
              </text>

              <line
                x1={padLeft}
                y1={yNormalMin}
                x2={padLeft + chartWidth}
                y2={yNormalMin}
                stroke="#10B981"
                strokeWidth="1.2"
                strokeDasharray="4 4"
              />
              <text
                x={padLeft + chartWidth - 6}
                y={yNormalMin + 12}
                textAnchor="end"
                fontSize="10"
                fontWeight="700"
                fill="#059669"
                fontFamily="sans-serif"
              >
                न्यूनतम सामान्य सीमा (Min Normal 60 BPM)
              </text>

              {/* 2. Horizontal Gridlines & Y-Axis Labels */}
              {[40, 60, 80, 100, 120].map((bpm) => {
                const y = getY(bpm);
                return (
                  <g key={bpm}>
                    <line
                      x1={padLeft}
                      y1={y}
                      x2={padLeft + chartWidth}
                      y2={y}
                      stroke="#E2E8F0"
                      strokeWidth="1"
                      strokeDasharray="2 3"
                    />
                    <text
                      x={padLeft - 10}
                      y={y + 3.5}
                      textAnchor="end"
                      fontSize="10"
                      fontWeight="600"
                      fontFamily="monospace"
                      fill="#64748B"
                    >
                      {bpm}
                    </text>
                  </g>
                );
              })}

              {/* Y-Axis Title */}
              <text
                x={14}
                y={padTop + chartHeight / 2}
                textAnchor="middle"
                fontSize="10"
                fontWeight="800"
                fill="#94A3B8"
                transform={`rotate(-90 14 ${padTop + chartHeight / 2})`}
              >
                हृदय दर (PULSE / BPM)
              </text>

              {/* 3. Area Gradient Under Curve */}
              {areaPath && (
                <path d={areaPath} fill="url(#pulseAreaGradient)" />
              )}

              {/* 4. The Continuous Trend Line */}
              <polyline
                points={pointsString}
                fill="none"
                stroke="#E11D48"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* 5. Data Points, Tooltips and Date Ticks */}
              {activeRecords.map((item, idx) => {
                const cx = getX(idx);
                const cy = getY(item.bpm);
                const isSelected = activeIndex === idx;
                const isAbnormal = item.bpm > 100 || item.bpm < 60;

                return (
                  <g
                    key={idx}
                    className="cursor-pointer group"
                    onClick={() => setSelectedPointIndex(idx)}
                  >
                    {/* Vertical Highlight Guide Line when selected */}
                    {isSelected && (
                      <line
                        x1={cx}
                        y1={padTop}
                        x2={cx}
                        y2={padTop + chartHeight}
                        stroke="#E11D48"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                        opacity="0.6"
                      />
                    )}

                    {/* Outer Pulsing Ring for latest or selected */}
                    {isSelected && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r="14"
                        fill="none"
                        stroke="#E11D48"
                        strokeWidth="2"
                        opacity="0.4"
                        className="animate-ping"
                      />
                    )}

                    {/* Point Outer Rim */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSelected ? '7' : '5.5'}
                      fill={isAbnormal ? '#DC2626' : isSelected ? '#E11D48' : '#FFFFFF'}
                      stroke={isAbnormal ? '#DC2626' : '#E11D48'}
                      strokeWidth="2.5"
                      filter="url(#pointShadow)"
                      className="transition-all hover:scale-125"
                    />

                    {/* Inner Core Dot */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSelected ? '3' : '2'}
                      fill={isSelected ? '#FFFFFF' : '#E11D48'}
                    />

                    {/* Value Badge on Top */}
                    <g transform={`translate(${cx}, ${cy - 12})`}>
                      <rect
                        x="-14"
                        y="-14"
                        width="28"
                        height="15"
                        rx="3"
                        fill={isSelected ? '#E11D48' : '#FFFFFF'}
                        stroke={isSelected ? '#E11D48' : '#CBD5E1'}
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="-3"
                        textAnchor="middle"
                        fontSize="9.5"
                        fontWeight="800"
                        fontFamily="monospace"
                        fill={isSelected ? '#FFFFFF' : '#1E293B'}
                      >
                        {item.bpm}
                      </text>
                    </g>

                    {/* X-Axis Date Tick Label */}
                    <text
                      x={cx}
                      y={padTop + chartHeight + 18}
                      textAnchor="middle"
                      fontSize="9.5"
                      fontWeight={isSelected ? '800' : '600'}
                      fill={isSelected ? '#0B63AC' : '#64748B'}
                      fontFamily="sans-serif"
                    >
                      {item.date}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Live ECG Waveform Monitor Bar */}
        <div className="mt-3 p-2.5 bg-[#0F172A] rounded-lg border border-[#1E293B] text-white flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-wider text-[#A7F3D0]">
              MONITOR: LEAD II • SINUS RHYTHM
            </span>
          </div>

          {/* Continuous Simulated ECG Wave */}
          <div className="hidden sm:block flex-1 max-w-[280px] h-6 overflow-hidden opacity-90">
            <svg viewBox="0 0 280 24" className="w-full h-full text-[#10B981]" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M0 12 h30 l4 -1 l3 2 l4 -2 h20 l3 -8 l3 18 l4 -22 l3 14 l3 -2 h20 l3 -2 l3 2 h30 l3 -8 l3 18 l4 -22 l3 14 l3 -2 h40 l3 -8 l3 18 l4 -22 l3 14 l3 -2 h40" />
            </svg>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-[#94A3B8]">
              RR: <strong className="text-white">780ms</strong>
            </span>
            <span className="text-[#94A3B8]">
              HR: <strong className="text-[#38BDF8] text-sm font-bold">{latestBpm} BPM</strong>
            </span>
          </div>
        </div>

      </div>

      {/* Expandable Past Records Detail Table */}
      <div className="border-t border-[#E2E8F0] bg-[#F8FAFC]">
        <button
          type="button"
          onClick={() => setShowDataTable(!showDataTable)}
          className="w-full p-3 flex items-center justify-between text-xs font-bold text-[#0B63AC] hover:bg-[#F1F5F9] cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#0B63AC]" />
            <span>सभी पूर्व नाड़ी परीक्षण प्रविष्टियां ({activeRecords.length} रिकॉर्ड्स देखें)</span>
          </div>
          <div className="flex items-center gap-1 text-[#64748B]">
            <span>{showDataTable ? 'छुपाएं' : 'तालिका में देखें'}</span>
            {showDataTable ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showDataTable && (
          <div className="p-3 border-t border-[#E2E8F0] overflow-x-auto bg-white">
            <table className="w-full text-left text-xs border border-[#E2E8F0] rounded-lg overflow-hidden">
              <thead className="bg-[#F1F6FA] text-[#0B63AC] font-black uppercase text-[11px]">
                <tr className="border-b border-[#E2E8F0]">
                  <th className="p-2.5">दिनांक (Date)</th>
                  <th className="p-2.5">नाड़ी दर (Pulse Rate)</th>
                  <th className="p-2.5">स्थिति (Status)</th>
                  <th className="p-2.5">दस्तावेज / स्रोत (Source Document)</th>
                  <th className="p-2.5">चिकित्सीय टिप्पणी (Clinical Notes)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {activeRecords.map((r, i) => {
                  const status = getBpmStatus(r.bpm);
                  return (
                    <tr
                      key={i}
                      onClick={() => setSelectedPointIndex(i)}
                      className={`cursor-pointer transition-colors ${
                        activeIndex === i ? 'bg-[#FFF5F5] font-bold' : 'hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <td className="p-2.5 font-bold text-[#1E293B]">{r.date}</td>
                      <td className="p-2.5 font-mono font-black text-sm text-[#E11D48]">
                        {r.bpm} <span className="text-[10px] font-normal text-[#64748B]">BPM</span>
                      </td>
                      <td className="p-2.5">
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase"
                          style={{ backgroundColor: status.badgeBg, color: status.badgeText }}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="p-2.5 text-[#0B63AC] font-medium">
                        {r.source} {r.facility && <span className="text-[#64748B] text-[10px]">({r.facility})</span>}
                      </td>
                      <td className="p-2.5 text-[#475569]">{r.notes || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
