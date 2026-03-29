'use client';

import { useState, useEffect, useRef } from 'react';
import { Sparkles, Loader2, X, Camera, Check, Download, ThumbsUp, ThumbsDown, ArrowUp, ArrowDown, RotateCcw } from 'lucide-react';

// Standalone embed page for B2B widget — no auth required
// URL: /embed?key=API_KEY&garment=GARMENT_URL&lang=es

export default function EmbedPage() {
  const [apiKey, setApiKey] = useState('');
  const [garmentUrl, setGarmentUrl] = useState<string | null>(null);
  const [lang, setLang] = useState<'en' | 'es'>('en');

  const [userImage, setUserImage] = useState<string | null>(null);
  const [garmentImage, setGarmentImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'upload' | 'result'>('upload');
  const [currentSize, setCurrentSize] = useState<string | null>(null);
  const [previewSize, setPreviewSize] = useState<string | null>(null);
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [availableColors, setAvailableColors] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<'liked' | 'disliked' | null>(null);
  const [showSizeOptions, setShowSizeOptions] = useState(false);

  const userRef = useRef<HTMLInputElement>(null);
  const garmentRef = useRef<HTMLInputElement>(null);

  const t = lang === 'es' ? {
    title: 'Prueba Virtual',
    subtitle: 'Sube tu foto y descubre cómo te queda',
    photo: 'Tu foto',
    photoHint: 'Selfie o cuerpo entero',
    generate: 'Probar prenda',
    generating: 'Creando tu look...',
    loadingHint: 'Esto puede tardar hasta 1 min',
    result: 'Tu look',
    tryAgain: 'Repetir',
    download: 'Guardar',
    errorGeneric: 'No se pudo generar. Intenta con otra foto.',
    errorNoPhoto: 'Sube una foto para continuar.',
    yourSize: 'Tu talla',
    tryOtherSize: 'Probar otra talla',
    tryOtherColor: 'Probar otro color',
    regenerate: 'Aplicar cambios',
    garmentDetected: 'Prenda detectada',
    serverLoad: 'Lista para probarte',
    uploadManual: 'Subir prenda',
    feedbackQuestion: '¿Te gusta cómo te queda?',
    feedbackYes: 'Me encanta',
    feedbackNo: 'No mucho',
    sizeQuestion: '¿Probar otra talla?',
    sizeUp: 'Más grande',
    sizeDown: 'Más pequeña',
    thanksFeedback: 'Gracias',
    selectExactSize: 'Elige talla',
  } : {
    title: 'Virtual Try-On',
    subtitle: 'Upload your photo and see how it looks',
    photo: 'Your photo',
    photoHint: 'Selfie or full body',
    generate: 'Try it on',
    generating: 'Creating your look...',
    loadingHint: 'This may take up to 1 min',
    result: 'Your look',
    tryAgain: 'Retry',
    download: 'Save',
    errorGeneric: 'Generation failed. Try a different photo.',
    errorNoPhoto: 'Upload a photo to continue.',
    yourSize: 'Your size',
    tryOtherSize: 'Try another size',
    tryOtherColor: 'Try another color',
    regenerate: 'Apply changes',
    garmentDetected: 'Garment detected',
    serverLoad: 'Ready to try on',
    uploadManual: 'Upload garment',
    feedbackQuestion: 'How does it look?',
    feedbackYes: 'Love it',
    feedbackNo: 'Not great',
    sizeQuestion: 'Try another size?',
    sizeUp: 'Size up',
    sizeDown: 'Size down',
    thanksFeedback: 'Thanks',
    selectExactSize: 'Pick a size',
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setApiKey(params.get('key') || '');
    setGarmentUrl(params.get('garment') || null);
    if (params.get('lang') === 'es') setLang('es');
    const sizes = params.get('sizes');
    if (sizes) setAvailableSizes(sizes.split(',').filter(Boolean));
    const colors = params.get('colors');
    if (colors) setAvailableColors(colors.split(',').filter(Boolean));
  }, []);

  const [garmentError, setGarmentError] = useState(false);

  useEffect(() => {
    if (!garmentUrl) return;
    let cancelled = false;
    async function loadGarment() {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const base64 = await fetchImageAsBase64(garmentUrl!);
          if (!cancelled && base64 && base64.length > 100) {
            setGarmentImage(base64);
            setGarmentError(false);
            return;
          }
        } catch { /* retry */ }
        if (attempt < 1) await new Promise(r => setTimeout(r, 1000));
      }
      if (!cancelled) setGarmentError(true);
    }
    loadGarment();
    return () => { cancelled = true; };
  }, [garmentUrl]);

  function isValidImageBase64(b64: string): boolean {
    if (!b64 || b64.length < 100) return false;
    if (b64.startsWith('/9j/')) return true;
    if (b64.startsWith('iVBOR')) return true;
    if (b64.startsWith('UklGR')) return true;
    if (b64.startsWith('R0lG')) return true;
    if (b64.startsWith('PCFET0') || b64.startsWith('PGh0bW') || b64.startsWith('eyJ')) return false;
    return true;
  }

  async function fetchImageAsBase64(url: string): Promise<string> {
    const proxyUrl = `/api/v1/image-proxy?url=${encodeURIComponent(url)}`;
    try {
      const res = await fetch(proxyUrl);
      if (res.ok) {
        const blob = await res.blob();
        const b64: string = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        if (isValidImageBase64(b64)) return b64;
      }
    } catch { /* continue to fallbacks */ }

    try {
      const res = await fetch(url, { mode: 'cors' });
      if (res.ok) {
        const blob = await res.blob();
        const b64: string = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        if (isValidImageBase64(b64)) return b64;
      }
    } catch { /* continue to fallback */ }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const MIN_DIM = 768;
        const MAX_DIM = 1280;
        let w = img.naturalWidth, h = img.naturalHeight;
        if (w < MIN_DIM || h < MIN_DIM) {
          const scale = MIN_DIM / Math.min(w, h);
          w = Math.round(w * scale); h = Math.round(h * scale);
        }
        if (w > MAX_DIM || h > MAX_DIM) {
          const scale = MAX_DIM / Math.max(w, h);
          w = Math.round(w * scale); h = Math.round(h * scale);
        }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, w, h);
        let dataUrl = canvas.toDataURL('image/jpeg', 0.90);
        let base64 = dataUrl.split(',')[1];
        if (base64.length < 40000) { dataUrl = canvas.toDataURL('image/jpeg', 0.97); base64 = dataUrl.split(',')[1]; }
        if (base64.length < 30000) { dataUrl = canvas.toDataURL('image/png'); base64 = dataUrl.split(',')[1]; }
        resolve(base64);
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  function compressImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const MAX_DIM = 1280;
          const MIN_DIM = 768;
          let { width, height } = img;
          if (width < MIN_DIM || height < MIN_DIM) {
            const scale = MIN_DIM / Math.min(width, height);
            width = Math.round(width * scale); height = Math.round(height * scale);
          }
          if (width > MAX_DIM || height > MAX_DIM) {
            const scale = MAX_DIM / Math.max(width, height);
            width = Math.round(width * scale); height = Math.round(height * scale);
          }
          const canvas = document.createElement('canvas');
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, width, height);
          let dataUrl = canvas.toDataURL('image/jpeg', 0.90);
          let base64 = dataUrl.split(',')[1];
          if (base64.length < 40000) { dataUrl = canvas.toDataURL('image/jpeg', 0.97); base64 = dataUrl.split(',')[1]; }
          if (base64.length < 30000) { dataUrl = canvas.toDataURL('image/png'); base64 = dataUrl.split(',')[1]; }
          resolve(base64);
        };
        img.onerror = reject;
        img.src = reader.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function handleFile(setter: (v: string | null) => void) {
    return async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const base64 = await compressImage(file);
        setter(base64);
      } catch {
        const reader = new FileReader();
        reader.onload = () => setter((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
      }
      e.target.value = '';
    };
  }

  async function handleGenerate() {
    if (!userImage) { setError(t.errorNoPhoto); return; }
    setIsLoading(true);
    setError(null);

    const payload: Record<string, any> = { userImage };
    if (garmentImage) payload.clothingImage = garmentImage;
    if (garmentUrl) payload.garmentUrl = garmentUrl;
    if (currentSize) payload.currentSize = currentSize;
    if (previewSize) payload.previewSize = previewSize;
    if (selectedColor) payload.selectedColor = selectedColor;

    try {
      const res = await fetch('/api/v1/tryon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || t.errorGeneric); setIsLoading(false); return; }
      if (data.image) {
        setResultImage(data.image);
        setStep('result');
        window.parent.postMessage({ type: 'agalaz:result', image: data.image }, '*');
      } else {
        setError(t.errorGeneric);
      }
    } catch {
      setError(t.errorGeneric);
    }
    setIsLoading(false);
  }

  function handleDownload() {
    if (!resultImage) return;
    const a = document.createElement('a');
    a.href = resultImage;
    a.download = 'virtual-tryon.png';
    a.click();
  }

  function getSizeUpDown() {
    if (!currentSize || availableSizes.length < 2) return { up: null, down: null };
    const idx = availableSizes.indexOf(currentSize);
    return {
      down: idx > 0 ? availableSizes[idx - 1] : null,
      up: idx < availableSizes.length - 1 ? availableSizes[idx + 1] : null,
    };
  }

  function handleSizeShift(size: string) {
    setPreviewSize(size);
    setTimeout(() => {
      const btn = document.getElementById('agalaz-regenerate-btn');
      if (btn) btn.click();
    }, 100);
  }

  function handleReset() {
    setUserImage(null);
    setResultImage(null);
    setCurrentSize(null);
    setPreviewSize(null);
    setSelectedColor(null);
    setFeedbackGiven(null);
    setShowSizeOptions(false);
    setError(null);
    setStep('upload');
  }

  // Glass card style
  const glass = 'bg-white/[0.06] backdrop-blur-xl border border-white/[0.1] rounded-2xl';
  const glassHover = 'hover:bg-white/[0.12] hover:border-white/[0.2]';

  return (
    <div className="min-h-screen bg-black flex flex-col" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif' }}>

      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
            <Sparkles size={14} className="text-white" />
          </div>
          <span className="text-[15px] font-semibold text-white tracking-[-0.01em]">{t.title}</span>
        </div>
        <button onClick={() => window.parent.postMessage({ type: 'agalaz:close' }, '*')}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white/[0.08] hover:bg-white/[0.15] transition-all">
          <X size={16} className="text-white/60" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-6">
        {step === 'upload' ? (
          <div className="max-w-sm mx-auto space-y-5 pt-2">
            <p className="text-center text-white/40 text-[13px] font-light tracking-[-0.01em]">{t.subtitle}</p>

            {/* Photo upload */}
            <div className="max-w-[220px] mx-auto">
              <div
                className={`relative w-full rounded-2xl overflow-hidden transition-all duration-300 ${
                  userImage ? 'ring-2 ring-violet-500/50' : `${glass} cursor-pointer`
                }`}
                style={{ aspectRatio: '3 / 4' }}
                onClick={() => !userImage && userRef.current?.click()}
              >
                {userImage ? (
                  <div className="w-full h-full relative group">
                    <img src={`data:image/jpeg;base64,${userImage}`} alt={t.photo} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute top-3 left-3 bg-emerald-500 rounded-full p-1">
                      <Check size={10} className="text-white" />
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setUserImage(null); }}
                      className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-all">
                      <X size={12} className="text-white/80" />
                    </button>
                    <p className="absolute bottom-3 left-0 right-0 text-center text-white/70 text-[11px] font-medium">{t.photo}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center w-full h-full p-6">
                    <div className="w-14 h-14 rounded-full bg-white/[0.08] flex items-center justify-center mb-4">
                      <Camera size={24} className="text-white/50" />
                    </div>
                    <span className="text-[13px] font-medium text-white/40">{t.photo}</span>
                    <span className="text-[11px] text-white/25 mt-1">{t.photoHint}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Garment preview */}
            {garmentImage ? (
              <div className={`${glass} p-3 flex items-center gap-3`}>
                <div className="w-11 h-14 rounded-xl overflow-hidden ring-1 ring-white/10 shrink-0">
                  <img src={`data:image/jpeg;base64,${garmentImage}`} alt="Garment" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-white/70">{t.garmentDetected}</p>
                  <p className="text-[10px] text-white/30 mt-0.5">{t.serverLoad}</p>
                </div>
              </div>
            ) : garmentUrl ? (
              <div className={`${glass} p-3 flex items-center gap-3`}>
                <div className="w-11 h-14 rounded-xl overflow-hidden ring-1 ring-white/10 shrink-0">
                  <img src={`/api/v1/image-proxy?url=${encodeURIComponent(garmentUrl)}`}
                    alt="Garment"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-white/70">{t.garmentDetected}</p>
                  <p className="text-[10px] text-white/30 mt-0.5">{t.serverLoad}</p>
                </div>
              </div>
            ) : (
              <button onClick={() => garmentRef.current?.click()}
                className={`w-full p-3.5 ${glass} ${glassHover} transition-all flex items-center justify-center gap-2`}>
                <Camera size={14} className="text-white/40" />
                <span className="text-[12px] font-medium text-white/40">{t.uploadManual}</span>
              </button>
            )}

            {/* Size selector */}
            {availableSizes.length > 0 && (
              <div className="space-y-2.5">
                <span className="text-[11px] font-semibold text-white/30 uppercase tracking-[0.08em] px-1">{t.yourSize}</span>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size) => (
                    <button key={size}
                      onClick={() => setCurrentSize(currentSize === size ? null : size)}
                      className={`px-4 py-2 rounded-xl text-[12px] font-semibold transition-all duration-200 ${
                        currentSize === size
                          ? 'bg-white text-black'
                          : 'bg-white/[0.06] text-white/50 border border-white/[0.08] hover:bg-white/[0.12] hover:text-white/70'
                      }`}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-2xl text-[12px] font-medium text-red-400">{error}</div>
            )}

            {/* Generate button */}
            <button onClick={handleGenerate} disabled={!userImage || isLoading}
              className={`w-full py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 text-[14px] font-semibold tracking-[-0.01em] ${
                userImage && !isLoading
                  ? 'bg-white text-black hover:bg-white/90 active:scale-[0.98]'
                  : 'bg-white/[0.06] text-white/20 cursor-not-allowed'
              }`}>
              {isLoading ? (
                <div className="flex flex-col items-center gap-1.5">
                  <div className="flex items-center gap-2.5">
                    <Loader2 size={18} className="animate-spin" />
                    <span>{t.generating}</span>
                  </div>
                  <span className="text-[11px] font-normal text-black/40">{t.loadingHint}</span>
                </div>
              ) : (
                <><Sparkles size={16} /> {t.generate}</>
              )}
            </button>
          </div>
        ) : (
          /* ───── Result view ───── */
          <div className="max-w-sm mx-auto space-y-4 pt-2">
            <p className="text-center text-white/30 text-[11px] font-semibold uppercase tracking-[0.12em]">{t.result}</p>

            {/* Result image */}
            <div className="rounded-2xl overflow-hidden ring-1 ring-white/[0.08]">
              <img src={resultImage!} alt="Try-on result" className="w-full" style={{ aspectRatio: '9 / 16', objectFit: 'cover' }} />
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button onClick={handleReset}
                className={`flex-1 py-3.5 ${glass} ${glassHover} transition-all text-[12px] font-semibold text-white/60 flex items-center justify-center gap-2`}>
                <RotateCcw size={14} /> {t.tryAgain}
              </button>
              <button onClick={handleDownload}
                className="flex-1 py-3.5 bg-white text-black rounded-2xl text-[12px] font-semibold hover:bg-white/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                <Download size={14} /> {t.download}
              </button>
            </div>

            {/* Feedback */}
            {!feedbackGiven && (
              <div className={`${glass} p-5 space-y-3`}>
                <p className="text-[14px] font-semibold text-white/80 text-center">{t.feedbackQuestion}</p>
                <div className="flex gap-3">
                  <button onClick={() => { setFeedbackGiven('liked'); setShowSizeOptions(true); }}
                    className="flex-1 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[12px] font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-2">
                    <ThumbsUp size={14} /> {t.feedbackYes}
                  </button>
                  <button onClick={() => { setFeedbackGiven('disliked'); setShowSizeOptions(true); }}
                    className="flex-1 py-3 bg-orange-500/10 border border-orange-500/20 rounded-xl text-[12px] font-semibold text-orange-400 hover:bg-orange-500/20 transition-all flex items-center justify-center gap-2">
                    <ThumbsDown size={14} /> {t.feedbackNo}
                  </button>
                </div>
              </div>
            )}

            {/* Size options after feedback */}
            {feedbackGiven && showSizeOptions && availableSizes.length > 1 && (
              <div className={`${glass} p-5 space-y-4`}>
                <p className="text-[14px] font-semibold text-white/80 text-center">{t.sizeQuestion}</p>

                {currentSize && (
                  <div className="flex gap-3">
                    {getSizeUpDown().down && (
                      <button onClick={() => handleSizeShift(getSizeUpDown().down!)}
                        disabled={isLoading}
                        className={`flex-1 py-3 ${glass} ${glassHover} transition-all text-[12px] font-semibold text-white/60 flex items-center justify-center gap-2 disabled:opacity-30`}>
                        <ArrowDown size={14} /> {t.sizeDown} ({getSizeUpDown().down})
                      </button>
                    )}
                    {getSizeUpDown().up && (
                      <button onClick={() => handleSizeShift(getSizeUpDown().up!)}
                        disabled={isLoading}
                        className={`flex-1 py-3 ${glass} ${glassHover} transition-all text-[12px] font-semibold text-white/60 flex items-center justify-center gap-2 disabled:opacity-30`}>
                        <ArrowUp size={14} /> {t.sizeUp} ({getSizeUpDown().up})
                      </button>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-white/25 uppercase tracking-[0.08em]">{t.selectExactSize}</span>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.filter(s => s !== currentSize).map((size) => (
                      <button key={size}
                        onClick={() => setPreviewSize(previewSize === size ? null : size)}
                        className={`px-4 py-2 rounded-xl text-[12px] font-semibold transition-all duration-200 ${
                          previewSize === size
                            ? 'bg-white text-black'
                            : 'bg-white/[0.06] text-white/50 border border-white/[0.08] hover:bg-white/[0.12]'
                        }`}>
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Color options */}
            {availableColors.length > 1 && (
              <div className={`${glass} p-4 space-y-2.5`}>
                <span className="text-[11px] font-semibold text-white/30 uppercase tracking-[0.08em]">{t.tryOtherColor}</span>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map((color) => (
                    <button key={color}
                      onClick={() => setSelectedColor(selectedColor === color ? null : color)}
                      className={`px-4 py-2 rounded-xl text-[12px] font-semibold transition-all duration-200 ${
                        selectedColor === color
                          ? 'bg-white text-black'
                          : 'bg-white/[0.06] text-white/50 border border-white/[0.08] hover:bg-white/[0.12]'
                      }`}>
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Regenerate */}
            {(previewSize || selectedColor) && (
              <button id="agalaz-regenerate-btn" onClick={handleGenerate} disabled={isLoading}
                className="w-full py-4 bg-white text-black rounded-2xl text-[14px] font-semibold hover:bg-white/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 disabled:opacity-30">
                {isLoading ? (
                  <><Loader2 size={16} className="animate-spin" /> {t.generating}</>
                ) : (
                  <><Sparkles size={16} /> {t.regenerate}</>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="shrink-0 px-5 py-2.5 text-center">
        <a href="https://agalaz.com" target="_blank" rel="noopener noreferrer"
          className="text-[10px] font-medium text-white/15 hover:text-white/40 transition-colors tracking-[0.02em]">
          powered by agalaz
        </a>
      </div>

      {/* Hidden file inputs */}
      <input ref={userRef} type="file" accept="image/*" onChange={handleFile(setUserImage)} className="hidden" />
      <input ref={garmentRef} type="file" accept="image/*" onChange={handleFile(setGarmentImage)} className="hidden" />
    </div>
  );
}
