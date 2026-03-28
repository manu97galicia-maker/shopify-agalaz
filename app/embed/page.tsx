'use client';

import { useState, useEffect, useRef } from 'react';
import { Sparkles, Loader2, X, Camera, ImagePlus, Check, Download, ThumbsUp, ThumbsDown, ArrowUp, ArrowDown } from 'lucide-react';

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
    subtitle: 'Sube tu foto y pruébate esta prenda',
    photo: 'Tu foto',
    photoHint: 'Selfie, medio cuerpo o cuerpo entero',
    generate: 'Probar prenda',
    generating: 'Generando...',
    loadingHint: 'Puede tardar 30s - 1 min',
    result: 'Tu prueba virtual',
    tryAgain: 'Probar de nuevo',
    download: 'Guardar',
    poweredBy: 'Powered by Agalaz',
    errorGeneric: 'No se pudo generar. Intenta con otra foto.',
    errorNoPhoto: 'Sube una foto para continuar.',
    yourSize: '¿Qué talla usas?',
    previewIn: 'Probar en otra talla',
    sizeLabel: 'Tu talla',
    tryOtherSize: '¿Quieres verte con otra talla?',
    tryOtherColor: '¿Quieres probar otro color?',
    regenerate: 'Generar con cambios',
    garmentSelected: 'Prenda seleccionada',
    garmentDetected: 'Prenda detectada',
    autoApply: 'Se aplicará automáticamente',
    serverLoad: 'Se cargará desde el servidor',
    uploadManual: 'Subir prenda manualmente',
    feedbackQuestion: '¿Te ha gustado el resultado?',
    feedbackYes: 'Sí, me encanta',
    feedbackNo: 'No del todo',
    sizeQuestion: '¿Quieres probar una talla más o menos?',
    sizeUp: 'Talla más',
    sizeDown: 'Talla menos',
    thanksFeedback: '¡Gracias por tu opinión!',
    tryDifferentSize: '¿Quieres ver cómo te queda en otra talla?',
    selectExactSize: 'O elige una talla exacta:',
  } : {
    title: 'Virtual Try-On',
    subtitle: 'Upload your photo and try on this garment',
    photo: 'Your photo',
    photoHint: 'Selfie, half body, or full body',
    generate: 'Try it on',
    generating: 'Generating...',
    loadingHint: 'This may take 30s - 1 min',
    result: 'Your virtual try-on',
    tryAgain: 'Try again',
    download: 'Save',
    poweredBy: 'Powered by Agalaz',
    errorGeneric: 'Generation failed. Try a different photo.',
    errorNoPhoto: 'Upload a photo to continue.',
    yourSize: 'What size do you wear?',
    previewIn: 'Try another size',
    sizeLabel: 'Your size',
    tryOtherSize: 'Want to try a different size?',
    tryOtherColor: 'Want to try another color?',
    regenerate: 'Generate with changes',
    garmentSelected: 'Selected garment',
    garmentDetected: 'Garment detected',
    autoApply: 'Will be applied automatically',
    serverLoad: 'Will load server-side',
    uploadManual: 'Upload garment manually',
    feedbackQuestion: 'Did you like the result?',
    feedbackYes: 'Yes, love it',
    feedbackNo: 'Not really',
    sizeQuestion: 'Want to try a size up or down?',
    sizeUp: 'Size up',
    sizeDown: 'Size down',
    thanksFeedback: 'Thanks for your feedback!',
    tryDifferentSize: 'Want to see how it fits in another size?',
    selectExactSize: 'Or pick an exact size:',
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
    // Use server-side image proxy to bypass CORS
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

      if (!res.ok) {
        setError(data.error || t.errorGeneric);
        setIsLoading(false);
        return;
      }

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
    // Auto-generate immediately
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

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Header */}
      <div className="border-b border-slate-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-indigo-600" />
          <span className="text-sm font-black text-slate-900 tracking-tight">{t.title}</span>
          <span className="text-[8px] text-slate-300 font-bold">•</span>
          <a href="https://agalaz.com" target="_blank" rel="noopener noreferrer"
            className="text-[9px] font-bold text-slate-300 hover:text-indigo-500 transition-colors">
            powered by <span className="text-indigo-400">agalaz.com</span>
          </a>
        </div>
        <button onClick={() => window.parent.postMessage({ type: 'agalaz:close' }, '*')}
          className="p-1.5 hover:bg-slate-100 rounded-full transition-colors">
          <X size={18} className="text-slate-400" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {step === 'upload' ? (
          <div className="max-w-sm mx-auto space-y-6">
            <p className="text-center text-slate-400 text-xs font-light">{t.subtitle}</p>

            {/* Photo upload */}
            <div className="max-w-[200px] mx-auto">
              <div className="flex flex-col gap-1.5 w-full">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">{t.photo}</span>
                <div
                  className={`relative w-full rounded-xl overflow-hidden transition-all ${
                    userImage ? 'ring-2 ring-indigo-200' : 'border-2 border-dashed border-slate-200 bg-slate-50'
                  }`}
                  style={{ aspectRatio: '3 / 4' }}
                >
                  {userImage ? (
                    <div className="w-full h-full relative group">
                      <img src={`data:image/jpeg;base64,${userImage}`} alt={t.photo} className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 bg-emerald-500 rounded-full p-1 shadow-sm">
                        <Check size={12} className="text-white" />
                      </div>
                      <button onClick={() => setUserImage(null)}
                        className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-sm">
                        <X size={14} className="text-slate-500" />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => userRef.current?.click()}
                      className="flex flex-col items-center justify-center w-full h-full p-4 hover:bg-indigo-50/50 transition-all">
                      <div className="p-3 bg-white border border-slate-200 rounded-xl mb-3 shadow-sm">
                        <Camera size={20} className="text-indigo-600" />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Upload</span>
                      <ImagePlus size={12} className="text-slate-200 mt-2" />
                    </button>
                  )}
                </div>
                <p className="text-[9px] font-bold text-slate-300 text-center">{t.photoHint}</p>
              </div>
            </div>

            {/* Garment preview */}
            {garmentImage ? (
              <div className="flex items-center gap-3 p-3 rounded-xl border bg-indigo-50 border-indigo-100">
                <div className="w-12 h-16 rounded-lg overflow-hidden ring-2 ring-indigo-200 shrink-0">
                  <img src={`data:image/jpeg;base64,${garmentImage}`} alt="Garment" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">{t.garmentSelected}</span>
                  <p className="text-[10px] text-indigo-400 mt-0.5">{t.autoApply}</p>
                </div>
                <button onClick={() => { setGarmentImage(null); garmentRef.current?.click(); }}
                  className="p-1.5 hover:bg-indigo-100 rounded-full transition-colors">
                  <X size={14} className="text-indigo-400" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {garmentUrl && (
                  <div className="flex items-center gap-3 p-3 rounded-xl border bg-amber-50 border-amber-200">
                    <div className="w-12 h-16 rounded-lg overflow-hidden ring-2 ring-amber-200 shrink-0">
                      <img src={`/api/v1/image-proxy?url=${encodeURIComponent(garmentUrl)}`}
                        alt="Garment"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">{t.garmentDetected}</span>
                      <p className="text-[10px] text-amber-500 mt-0.5">{t.serverLoad}</p>
                    </div>
                  </div>
                )}
                <button onClick={() => garmentRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 transition-all">
                  <ImagePlus size={16} className="text-slate-400" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.uploadManual}</span>
                </button>
              </div>
            )}

            {/* Size selector (pre-render) */}
            {availableSizes.length > 0 && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.yourSize}</span>
                <div className="flex flex-wrap gap-1.5">
                  {availableSizes.map((size) => (
                    <button key={size}
                      onClick={() => setCurrentSize(currentSize === size ? null : size)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                        currentSize === size ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:border-indigo-300'
                      }`}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 rounded-xl border border-red-100 text-xs font-bold text-red-600">{error}</div>
            )}

            <button onClick={handleGenerate} disabled={!userImage || isLoading}
              className={`w-full py-4 flex items-center justify-center gap-3 rounded-xl transition-all font-black uppercase tracking-[0.15em] text-xs ${
                userImage && !isLoading ? 'bg-slate-900 text-white hover:bg-indigo-600 shadow-lg' : 'bg-slate-100 text-slate-300'
              }`}>
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <div className="flex flex-col items-center">
                    <span>{t.generating}</span>
                    <span className="text-[10px] font-normal normal-case tracking-normal text-slate-300 mt-1">{t.loadingHint}</span>
                  </div>
                </>
              ) : (
                <><Sparkles size={18} /> {t.generate}</>
              )}
            </button>
          </div>
        ) : (
          /* Result view */
          <div className="max-w-sm mx-auto space-y-4">
            <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.result}</p>
            <div className="rounded-2xl overflow-hidden border-2 border-slate-100">
              <img src={resultImage!} alt="Try-on result" className="w-full" style={{ aspectRatio: '9 / 16', objectFit: 'cover' }} />
            </div>
            <div className="flex gap-3">
              <button onClick={handleReset}
                className="flex-1 py-3 border border-slate-200 rounded-xl text-xs font-black text-slate-500 uppercase tracking-widest hover:bg-slate-50 transition-colors">
                {t.tryAgain}
              </button>
              <button onClick={handleDownload}
                className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2">
                <Download size={14} /> {t.download}
              </button>
            </div>

            {/* Post-render feedback */}
            {!feedbackGiven && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <p className="text-sm font-black text-slate-700 text-center">{t.feedbackQuestion}</p>
                <div className="flex gap-3">
                  <button onClick={() => { setFeedbackGiven('liked'); setShowSizeOptions(true); }}
                    className="flex-1 py-3 bg-emerald-50 border-2 border-emerald-200 rounded-xl text-xs font-black text-emerald-600 hover:bg-emerald-100 transition-all flex items-center justify-center gap-2">
                    <ThumbsUp size={16} /> {t.feedbackYes}
                  </button>
                  <button onClick={() => { setFeedbackGiven('disliked'); setShowSizeOptions(true); }}
                    className="flex-1 py-3 bg-orange-50 border-2 border-orange-200 rounded-xl text-xs font-black text-orange-600 hover:bg-orange-100 transition-all flex items-center justify-center gap-2">
                    <ThumbsDown size={16} /> {t.feedbackNo}
                  </button>
                </div>
              </div>
            )}

            {/* After feedback: size up/down quick options */}
            {feedbackGiven && showSizeOptions && availableSizes.length > 1 && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 space-y-3">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest text-center">{t.thanksFeedback}</p>
                <p className="text-sm font-black text-indigo-700 text-center">{t.sizeQuestion}</p>

                {/* Quick size up / size down buttons */}
                {currentSize && (
                  <div className="flex gap-3">
                    {getSizeUpDown().down && (
                      <button onClick={() => handleSizeShift(getSizeUpDown().down!)}
                        disabled={isLoading}
                        className="flex-1 py-3 bg-white border-2 border-indigo-200 rounded-xl text-xs font-black text-indigo-600 hover:bg-indigo-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                        <ArrowDown size={16} /> {t.sizeDown} ({getSizeUpDown().down})
                      </button>
                    )}
                    {getSizeUpDown().up && (
                      <button onClick={() => handleSizeShift(getSizeUpDown().up!)}
                        disabled={isLoading}
                        className="flex-1 py-3 bg-white border-2 border-indigo-200 rounded-xl text-xs font-black text-indigo-600 hover:bg-indigo-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                        <ArrowUp size={16} /> {t.sizeUp} ({getSizeUpDown().up})
                      </button>
                    )}
                  </div>
                )}

                {/* Full size selector */}
                <div className="space-y-2">
                  <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{t.selectExactSize}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {availableSizes.filter(s => s !== currentSize).map((size) => (
                      <button key={size}
                        onClick={() => setPreviewSize(previewSize === size ? null : size)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                          previewSize === size ? 'bg-indigo-600 text-white' : 'bg-white border border-indigo-200 text-indigo-500 hover:border-indigo-400'
                        }`}>
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Post-render: try another color */}
            {availableColors.length > 1 && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 space-y-2">
                <span className="text-[10px] font-black text-amber-600">{t.tryOtherColor}</span>
                <div className="flex flex-wrap gap-1.5">
                  {availableColors.map((color) => (
                    <button key={color}
                      onClick={() => setSelectedColor(selectedColor === color ? null : color)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                        selectedColor === color ? 'bg-amber-600 text-white' : 'bg-white border border-amber-200 text-amber-600 hover:border-amber-400'
                      }`}>
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Regenerate button */}
            {(previewSize || selectedColor) && (
              <button id="agalaz-regenerate-btn" onClick={handleGenerate} disabled={isLoading}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
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
      <div className="shrink-0 border-t border-slate-100 px-4 py-1.5 text-center bg-white">
        <a href="https://agalaz.com" target="_blank" rel="noopener noreferrer"
          className="text-[8px] font-bold text-slate-200 hover:text-indigo-400 transition-colors">agalaz.com</a>
      </div>

      {/* Hidden file inputs */}
      <input ref={userRef} type="file" accept="image/*" onChange={handleFile(setUserImage)} className="hidden" />
      <input ref={garmentRef} type="file" accept="image/*" onChange={handleFile(setGarmentImage)} className="hidden" />
    </div>
  );
}
