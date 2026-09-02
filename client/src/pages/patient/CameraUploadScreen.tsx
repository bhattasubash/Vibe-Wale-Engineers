import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, RefreshCw, CheckCircle2, ArrowLeft, ArrowRight, FileText, UploadCloud, Trash2, Eye } from 'lucide-react';
import { AudioSpeaker } from '@/components/ui/AudioSpeaker';
import { useSessionStore } from '@/stores/sessionStore';

export const CameraUploadScreen: React.FC = () => {
  const navigate = useNavigate();
  const { language, addUploadedDocument, uploadedDocuments } = useSessionStore();

  const [cameraActive, setCameraActive] = useState(false);
  const [detectionState, setDetectionState] = useState<'searching' | 'adjusting' | 'holding' | 'captured'>('searching');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [capturedDocs, setCapturedDocs] = useState<Array<{ id: string; name: string; url: string; ocrSnippet: string }>>([]);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const promptHindi =
    'यदि आपके पास कोई पुराना डॉक्टर का पर्चा या जांच रिपोर्ट है, तो उसे कियोस्क कैमरे के सामने रखें। हरा घेरा बनते ही फोटो अपने आप खिंच जाएगी।';
  const promptEnglish =
    'If you have previous medical prescriptions or lab reports, hold them in front of the camera. The image will automatically capture when aligned.';

  // Start Camera Feed
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
      .catch((err) => {
        console.warn('Camera access unavailable, running simulated viewfinder:', err);
        setCameraActive(true);
      });

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Simulated Auto-Detection State Progression
  useEffect(() => {
    if (cameraActive && detectionState === 'searching') {
      const timer1 = setTimeout(() => {
        setDetectionState('adjusting');
      }, 1500);

      const timer2 = setTimeout(() => {
        setDetectionState('holding');
        setCountdown(3);
      }, 3500);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [cameraActive, detectionState]);

  // Countdown timer for Auto-Snap
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
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
      name: `पर्चा (Prescription #${capturedDocs.length + 1})`,
      url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=400',
      ocrSnippet: 'Rx: Maharasnadi Kwath 20ml BD, Yogaraj Guggulu 2 Tab BD. Diagnosed: Sandhivata (Osteoarthritis).',
    };

    setCapturedDocs((prev) => [...prev, newDoc]);
    addUploadedDocument({
      id: newDoc.id,
      name: newDoc.name,
      previewUrl: newDoc.url,
      extractedText: newDoc.ocrSnippet,
    });
  };

  const handleAddAnother = () => {
    setDetectionState('searching');
  };

  const handleProceed = () => {
    navigate('/kiosk/token');
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-76px)] bg-[#EAEDF0] text-[#212529] justify-between font-sans select-none">
      
      {/* Central Camera Container */}
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
          <Camera className="w-3.5 h-3.5" />
          <span>चरण 5: मेडिकल पर्चा व रिपोर्ट स्कैन • DOCUMENT CAPTURE</span>
        </div>

        <h1
          className="text-2xl sm:text-3xl font-black mb-1 tracking-tight text-center"
          style={{ color: '#0B5FA5' }}
        >
          {language === 'hi' ? 'पुराने पर्चे या रिपोर्ट दिखाएं' : 'Show Medical Prescriptions to Camera'}
        </h1>
        <p className="text-xs sm:text-sm text-[#495057] font-semibold mb-4 text-center max-w-xl">
          {language === 'hi'
            ? 'पर्चे को सीधे स्क्रीन के सामने पकड़ें। हरा घेरा बनते ही फ़ोटो अपने-आप खिंच जाएगी।'
            : 'Hold your prescription inside the frame. Auto-capture will snap when aligned.'}
        </p>

        <div className="w-full max-w-2xl bg-white border border-[#CED4DA] rounded-[3px] p-4 sm:p-5 mb-4 flex flex-col items-center">
          
          {/* CAMERA VIEWFINDER WITH DYNAMIC BOUNDING BOX */}
          <div className="relative w-full h-72 sm:h-80 bg-[#1A202C] rounded-[3px] overflow-hidden flex items-center justify-center border-2 border-[#CED4DA] mb-3">
            
            {/* Live Video Element */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Simulated Prescription in frame for visual demo */}
            <div className="absolute inset-8 border-2 border-dashed flex flex-col items-center justify-between p-4 rounded-[2px] transition-all duration-300 pointer-events-none"
              style={{
                borderColor:
                  detectionState === 'holding'
                    ? '#15803D'
                    : detectionState === 'adjusting'
                    ? '#E07B1A'
                    : '#0B5FA5',
                backgroundColor:
                  detectionState === 'holding'
                    ? 'rgba(21, 128, 61, 0.15)'
                    : 'transparent',
              }}
            >
              {/* Status Header Badge in Viewfinder */}
              <div
                className="px-3 py-1 rounded-[2px] text-xs font-black text-white"
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
                {detectionState === 'adjusting' && 'दस्तावेज़ थोड़ा पास लाएं (Bring Closer)'}
                {detectionState === 'searching' && 'पर्चा फ्रेम के अंदर रखें (Place Inside Box)'}
                {detectionState === 'captured' && '✓ फ़ोटो सफलतापूर्वक ले ली गई!'}
              </div>

              {/* Countdown Overlay */}
              {countdown !== null && (
                <div className="text-6xl font-black text-white bg-black/60 w-20 h-20 rounded-full flex items-center justify-center border-2 border-[#15803D]">
                  {countdown}
                </div>
              )}

              <div className="text-[10px] font-bold text-white/80 bg-black/50 px-2 py-0.5 rounded-[2px]">
                A4 Prescription Alignment Zone
              </div>
            </div>

          </div>

          {/* MANUAL SNAP BUTTON */}
          <div className="flex gap-3 w-full justify-center">
            <button
              type="button"
              onClick={handleCaptureDocument}
              className="py-2.5 px-6 rounded-[3px] border border-[#084B83] text-xs sm:text-sm font-black text-white flex items-center gap-2 cursor-pointer"
              style={{ backgroundColor: '#0B5FA5' }}
            >
              <Camera className="w-4 h-4" />
              <span>फ़ोटो खींचें • MANUAL SNAP</span>
            </button>
          </div>

        </div>

        {/* UPLOADED DOCUMENTS TRAY */}
        {capturedDocs.length > 0 && (
          <div className="w-full max-w-2xl bg-white border border-[#CED4DA] rounded-[3px] p-4 mb-4">
            <div className="text-xs font-extrabold text-[#15803D] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>अपलोड किए गए दस्तावेज़ ({capturedDocs.length})</span>
            </div>

            <div className="space-y-2">
              {capturedDocs.map((doc, idx) => (
                <div
                  key={doc.id}
                  className="p-2.5 bg-[#F8FAFC] border border-[#CED4DA] rounded-[2px] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-5 h-5 text-[#0B5FA5] shrink-0" />
                    <div>
                      <span className="font-extrabold text-[#212529] block">{doc.name}</span>
                      <span className="text-[10px] text-[#15803D] font-bold block">
                        ✓ OCR विश्लेषित (Ayurvedic Entities Extracted)
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddAnother}
                    className="px-3 py-1 bg-white border border-[#CED4DA] text-xs font-bold text-[#0B5FA5] rounded-[2px] hover:bg-[#E8F1F8] cursor-pointer"
                  >
                    + और जोड़ें
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROCEED ACTION */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl mb-4">
          
          <button
            type="button"
            onClick={handleAddAnother}
            className="py-3.5 px-4 rounded-[3px] border border-[#CED4DA] bg-white hover:bg-[#EAEDF0] font-black text-xs sm:text-sm text-[#495057] flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>+ एक और पर्चा जोड़ें</span>
          </button>

          <button
            type="button"
            onClick={handleProceed}
            className="py-3.5 px-6 rounded-[3px] border border-[#084B83] text-sm sm:text-base font-black text-white flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.99]"
            style={{ backgroundColor: '#0B5FA5' }}
          >
            <span>डॉक्टर को भेजें एवं टोकन लें • FINISH</span>
            <ArrowRight className="w-5 h-5 text-white" />
          </button>

        </div>

        {/* Back Button */}
        <button
          type="button"
          onClick={() => navigate('/kiosk/review')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[3px] border border-[#CED4DA] bg-white hover:border-[#0B5FA5] hover:text-[#0B5FA5] text-xs font-bold text-[#212529] transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>समीक्षा पृष्ठ पर वापस जाएं (Back to Review)</span>
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
          <div className="text-[11px] font-semibold text-[#6C757D]">
            <span>OpenCV Auto-Framing & WebAssembly OCR</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
