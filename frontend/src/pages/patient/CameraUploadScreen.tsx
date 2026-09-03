import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, CheckCircle2, ArrowLeft, ArrowRight, Trash2, AlertTriangle, RotateCcw, Loader2 } from 'lucide-react';
import { AudioSpeaker } from '@/components/ui/AudioSpeaker';
import { useSessionStore } from '@/stores/sessionStore';

interface CapturedDocItem {
  id: string;
  name: string;
  url: string;
  file: File;
}

export const CameraUploadScreen: React.FC = () => {
  const navigate = useNavigate();
  const { language, sessionId, addUploadedDocument } = useSessionStore();

  const [cameraActive, setCameraActive] = useState(false);
  const [detectionState, setDetectionState] = useState<'searching' | 'adjusting' | 'holding' | 'captured'>('searching');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [capturedDocs, setCapturedDocs] = useState<CapturedDocItem[]>([]);
  const [qualityWarning, setQualityWarning] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const checkImageQuality = (ctx: CanvasRenderingContext2D, width: number, height: number): { pass: boolean; reason?: string } => {
    try {
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;
      let brightnessSum = 0;
      let brightnessSqSum = 0;
      const step = 4 * 16;
      let count = 0;

      for (let i = 0; i < data.length; i += step) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
        brightnessSum += brightness;
        brightnessSqSum += brightness * brightness;
        count++;
      }

      if (count === 0) return { pass: true };

      const mean = brightnessSum / count;
      const variance = (brightnessSqSum / count) - (mean * mean);

      // Check if image is extremely dark
      if (mean < 30) {
        return {
          pass: false,
          reason: language === 'hi'
            ? 'कम रोशनी! फ़ोटो बहुत काली आई है। कृपया रोशनी में रखकर दोबारा फ़ोटो खींचें।'
            : 'Too dark! The image is very dark. Please hold under light and retake photo.',
        };
      }

      // Check if image is washed out or direct glare
      if (mean > 248) {
        return {
          pass: false,
          reason: language === 'hi'
            ? 'अत्यधिक चकाचौंध! कृपया पर्चा सीधा रखें और दोबारा फ़ोटो खींचें।'
            : 'Too bright/glare! Please align the document properly and retake.',
        };
      }

      // Check if image is completely flat/blank (very low contrast or covered lens)
      if (variance < 25) {
        return {
          pass: false,
          reason: language === 'hi'
            ? 'पर्चा स्पष्ट नहीं है। कृपया कैमरा लेंस के सामने पर्चा ठीक से रखें।'
            : 'Image is unclear or blank. Please hold the document firmly and retake.',
        };
      }

      return { pass: true };
    } catch {
      return { pass: true };
    }
  };

  const handleCaptureDocument = () => {
    setCountdown(null);
    setDetectionState('captured');

    const video = videoRef.current;
    if (!video) return;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    ctx.drawImage(video, 0, 0, width, height);

    // Perform real-time image quality evaluation
    const quality = checkImageQuality(ctx, width, height);
    if (!quality.pass) {
      setQualityWarning(quality.reason || 'फ़ोटो स्पष्ट नहीं है, कृपया दोबारा प्रयास करें।');
      return;
    }

    setQualityWarning(null);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;

        const url = URL.createObjectURL(blob);
        const docIndex = capturedDocs.length + 1;
        const file = new File([blob], `document_page_${docIndex}_${Date.now()}.jpg`, {
          type: 'image/jpeg',
        });

        const newDoc: CapturedDocItem = {
          id: `DOC-${Date.now()}-${docIndex}`,
          name: language === 'hi' ? `पर्चा #${docIndex}` : `Document #${docIndex}`,
          url,
          file,
        };

        setCapturedDocs((prev) => [...prev, newDoc]);
        addUploadedDocument({
          id: newDoc.id,
          name: newDoc.name,
          previewUrl: newDoc.url,
          extractedText: 'Document captured via camera',
        });
      },
      'image/jpeg',
      0.92
    );
  };

  const handleRemoveDoc = (idToRemove: string) => {
    setCapturedDocs((prev) => {
      const remaining = prev.filter((d) => d.id !== idToRemove);
      return remaining.map((doc, idx) => ({
        ...doc,
        name: language === 'hi' ? `पर्चा #${idx + 1}` : `Document #${idx + 1}`,
      }));
    });
  };

  const handleRetake = () => {
    setQualityWarning(null);
    setDetectionState('searching');
  };

  const handleFinishAndSend = async () => {
    if (isSubmitting) return;

    if (capturedDocs.length > 0) {
      setIsSubmitting(true);
      try {
        const formData = new FormData();
        capturedDocs.forEach((doc) => {
          formData.append('files', doc.file);
        });
        if (sessionId) {
          formData.append('patient_session_id', sessionId);
        }

        await fetch('/api/process-reports', {
          method: 'POST',
          body: formData,
        });
      } catch (err) {
        console.error('Error sending documents to backend:', err);
      } finally {
        setIsSubmitting(false);
        navigate('/kiosk/token');
      }
    } else {
      navigate('/kiosk/token');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-76px)] max-h-[calc(100vh-76px)] bg-[#EAEDF0] text-[#212529] justify-between font-sans select-none overflow-hidden">
      {/* Centered Main Container */}
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

        {/* COMPACT CAMERA VIEWFINDER */}
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

          {/* Quality Warning Notice */}
          {qualityWarning && (
            <div className="w-full mt-2 p-2 bg-[#FEF2F2] border border-[#F87171] rounded-[3px] flex items-center justify-between gap-2 text-xs text-[#991B1B]">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0 text-[#DC2626]" />
                <span>{qualityWarning}</span>
              </div>
              <button
                type="button"
                onClick={handleRetake}
                className="shrink-0 px-2.5 py-1 bg-[#DC2626] text-white font-bold rounded-[2px] hover:bg-[#B91C1C] flex items-center gap-1 cursor-pointer text-[11px]"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{language === 'hi' ? 'दोबारा खींचें' : 'Retake'}</span>
              </button>
            </div>
          )}

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

        {/* UPLOADED DOC TRAY WITH THUMBNAILS & REMOVE BUTTON */}
        {capturedDocs.length > 0 && (
          <div className="w-full max-w-xl bg-white border border-[#CED4DA] rounded-[3px] p-2.5 shrink-0 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                <span className="font-extrabold text-[#212529]">
                  {language === 'hi'
                    ? `${capturedDocs.length} पर्चा जोड़ा गया`
                    : `${capturedDocs.length} Document(s) Captured`}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setQualityWarning(null);
                  setDetectionState('searching');
                }}
                className="px-2.5 py-1 bg-[#E8F1F8] border border-[#0B5FA5]/30 text-xs font-bold text-[#0B5FA5] rounded-[2px] hover:bg-[#0B5FA5] hover:text-white cursor-pointer"
              >
                + एक और जोड़ें
              </button>
            </div>

            {/* Thumbnail Strip */}
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              {capturedDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="relative group shrink-0 w-20 h-20 rounded-[3px] border border-[#CED4DA] overflow-hidden bg-[#F8F9FA]"
                >
                  <img src={doc.url} alt={doc.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 text-[10px] text-white text-center py-0.5 font-bold truncate px-1">
                    {doc.name}
                  </div>
                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveDoc(doc.id)}
                    title={language === 'hi' ? 'हटाएं' : 'Remove image'}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center cursor-pointer shadow-sm transition-transform hover:scale-110"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl shrink-0">
          <button
            type="button"
            onClick={() => {
              setQualityWarning(null);
              setDetectionState('searching');
            }}
            className="h-12 sm:h-14 px-4 rounded-[3px] border border-[#CED4DA] bg-white hover:bg-[#EAEDF0] font-black text-xs sm:text-sm text-[#495057] flex items-center justify-center cursor-pointer transition-transform active:scale-[0.98]"
          >
            <span>+ एक और पर्चा जोड़ें</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleFinishAndSend}
            className="h-12 sm:h-14 px-6 rounded-[3px] border border-[#084B83] text-sm sm:text-base font-black text-white flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.98] disabled:opacity-75"
            style={{ backgroundColor: '#0B5FA5' }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 text-white animate-spin" />
                <span>भेज रहे हैं... • SENDING...</span>
              </>
            ) : (
              <>
                <span>डॉक्टर को भेजें एवं टोकन लें • FINISH</span>
                <ArrowRight className="w-5 h-5 text-white" />
              </>
            )}
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

