import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, CheckCircle2, ArrowLeft, ArrowRight, FileText } from 'lucide-react';
import { AudioSpeaker } from '@/components/ui/AudioSpeaker';
import { useSessionStore } from '@/stores/sessionStore';

export const CameraUploadScreen: React.FC = () => {
  const navigate = useNavigate();
  const { language, addUploadedDocument } = useSessionStore();

  const [cameraActive, setCameraActive] = useState(false);
  const [detectionState, setDetectionState] = useState<'searching' | 'adjusting' | 'holding' | 'captured'>('searching');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [capturedDocs, setCapturedDocs] = useState<Array<{ id: string; name: string; url: string; ocrSnippet: string }>>([]);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const promptHindi =
    'यदि आपके पास कोई पुराना डॉक्टर का पर्चा या जांच रिपोर्ट है, तो उसे कियोस्क कैमरे के सामने रखें। हरा घेरा बनते ही फोटो अपने आप खिंच जाएगी।';
  const promptEnglish =
    'Hold your prescription in front of the camera. The image will automatically capture when aligned.';

  useEffect(() => {
    let stream: MediaStream | null = null;
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: 'environment', width: 1280, height: 720 } })
      .then((s) => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          setCameraActive(true);
        }
      })
      .catch(() => setCameraActive(true));

    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  useEffect(() => {
    if (cameraActive && detectionState === 'searching') {
      const timer1 = setTimeout(() => setDetectionState('adjusting'), 1200);
      const timer2 = setTimeout(() => {
        setDetectionState('holding');
        setCountdown(3);
      }, 2800);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [cameraActive, detectionState]);

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      handleCaptureDocument();
    }
  }, [countdown]);

  const handleCaptureDocument = () => {
    setCountdown(null);
    setDetectionState('captured');

    const newDoc = {
      id: `DOC-${Date.now()}`,
      name: `पर्चा #${capturedDocs.length + 1}`,
      url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=400',
      ocrSnippet: 'Rx: Maharasnadi Kwath, Yogaraj Guggulu. Diagnosed: Sandhivata.',
    };

    setCapturedDocs((prev) => [...prev, newDoc]);
    addUploadedDocument({
      id: newDoc.id,
      name: newDoc.name,
      previewUrl: newDoc.url,
      extractedText: newDoc.ocrSnippet,
    });
  };

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
            <Camera className="w-3.5 h-3.5" />
            <span>चरण 5: मेडिकल पर्चा स्कैन • DOCUMENT CAPTURE</span>
          </div>

          <h1
            className="text-2xl sm:text-3xl font-black tracking-tight"
            style={{ color: '#0B5FA5' }}
          >
            {language === 'hi' ? 'पुराने पर्चे या रिपोर्ट दिखाएं' : 'Show Medical Prescriptions to Camera'}
          </h1>
          <p className="text-xs sm:text-sm text-[#495057] font-semibold">
            {language === 'hi'
              ? 'पर्चे को सीधे स्क्रीन के सामने पकड़ें। हरा घेरा बनते ही फ़ोटो अपने-आप खिंच जाएगी।'
              : 'Hold prescription in frame. Auto-capture will snap when aligned.'}
          </p>
        </div>

        {/* COMPACT CAMERA VIEWFINDER (Non-Scrollable Fitting) */}
        <div className="w-full max-w-xl bg-white border border-[#CED4DA] rounded-[3px] p-3 flex flex-col items-center shrink-0">
          <div className="relative w-full h-56 sm:h-64 bg-[#1A202C] rounded-[3px] overflow-hidden flex items-center justify-center border-2 border-[#CED4DA]">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

            {/* Bounding Box */}
            <div
              className="absolute inset-4 border-2 border-dashed flex flex-col items-center justify-between p-2 rounded-[2px] pointer-events-none transition-colors"
              style={{
                borderColor:
                  detectionState === 'holding'
                    ? '#15803D'
                    : detectionState === 'adjusting'
                    ? '#E07B1A'
                    : '#0B5FA5',
                backgroundColor: detectionState === 'holding' ? 'rgba(21, 128, 61, 0.15)' : 'transparent',
              }}
            >
              <div
                className="px-2.5 py-0.5 rounded-[2px] text-[10px] font-black text-white"
                style={{
                  backgroundColor:
                    detectionState === 'holding'
                      ? '#15803D'
                      : detectionState === 'adjusting'
                      ? '#E07B1A'
                      : '#0B5FA5',
                }}
              >
                {detectionState === 'holding' && `स्थिर रखें • HOLD STILL (${countdown})`}
                {detectionState === 'adjusting' && 'दस्तावेज़ पास लाएं (Bring Closer)'}
                {detectionState === 'searching' && 'पर्चा फ्रेम में रखें (Align Inside)'}
                {detectionState === 'captured' && '✓ फ़ोटो ले ली गई!'}
              </div>

              {countdown !== null && (
                <div className="text-5xl font-black text-white bg-black/60 w-16 h-16 rounded-full flex items-center justify-center border-2 border-[#15803D]">
                  {countdown}
                </div>
              )}

              <div className="text-[9px] font-bold text-white/80 bg-black/50 px-2 py-0.5 rounded-[2px]">
                A4 Document Alignment Zone
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCaptureDocument}
            className="mt-2 py-2 px-5 rounded-[3px] border border-[#084B83] text-xs font-black text-white flex items-center gap-1.5 cursor-pointer transition-transform active:scale-[0.98]"
            style={{ backgroundColor: '#0B5FA5' }}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>फ़ोटो खींचें • MANUAL SNAP</span>
          </button>
        </div>

        {/* UPLOADED DOC TRAY */}
        {capturedDocs.length > 0 && (
          <div className="w-full max-w-xl bg-white border border-[#CED4DA] rounded-[3px] p-2 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
              <span className="font-extrabold text-[#212529]">
                {capturedDocs.length} पर्चा जोड़ा गया (OCR Extracted)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setDetectionState('searching')}
              className="px-2.5 py-1 bg-[#E8F1F8] border border-[#0B5FA5]/30 text-xs font-bold text-[#0B5FA5] rounded-[2px] hover:bg-[#0B5FA5] hover:text-white cursor-pointer"
            >
              + एक और जोड़ें
            </button>
          </div>
        )}

        {/* 2 ACTION BUTTONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl shrink-0">
          <button
            type="button"
            onClick={() => setDetectionState('searching')}
            className="h-12 sm:h-14 px-4 rounded-[3px] border border-[#CED4DA] bg-white hover:bg-[#EAEDF0] font-black text-xs sm:text-sm text-[#495057] flex items-center justify-center cursor-pointer transition-transform active:scale-[0.98]"
          >
            <span>+ एक और पर्चा जोड़ें</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/kiosk/token')}
            className="h-12 sm:h-14 px-6 rounded-[3px] border border-[#084B83] text-sm sm:text-base font-black text-white flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.98]"
            style={{ backgroundColor: '#0B5FA5' }}
          >
            <span>डॉक्टर को भेजें एवं टोकन लें • FINISH</span>
            <ArrowRight className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Back Button */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={() => navigate('/kiosk/review')}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-[3px] border border-[#CED4DA] bg-white hover:border-[#0B5FA5] hover:text-[#0B5FA5] text-xs font-bold text-[#212529] transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>समीक्षा पृष्ठ पर वापस जाएं (Back)</span>
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
            <span>OpenCV Auto-Framing & WASM OCR</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
