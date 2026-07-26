import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, Download, Sliders, RefreshCcw, Crop, Eraser, Eye, Sparkles,
  RotateCw, RotateCcw, FlipHorizontal, FlipVertical, Grid, Circle, Square,
  Maximize2, ZoomIn, ZoomOut, Copy, Check, Info,
  Camera, CameraOff, QrCode, ExternalLink, Wifi, User, CreditCard, Mail, Phone,
  MapPin, ShieldCheck, Trash2, History, Volume2, VolumeX,
  FileText, CheckCircle2, AlertCircle, ArrowRight,
  Printer, Share2, Layers, Palette, Image as ImageIcon, MessageCircle, Send, Globe, Key, Smartphone,
  Pipette, Paintbrush, Wand2, Undo2, Redo2, EyeOff, Layers3, Sun
} from 'lucide-react';
import jsQR from 'jsqr';
import QRCode from 'qrcode';
import { ToolItem } from '../../types';
import { jsPDF } from 'jspdf';

// Audio beep feedback
const playBeep = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch {
    // Audio blocked
  }
};

// QR Content Parser
interface ParsedQrResult {
  type: 'url' | 'wifi' | 'vcard' | 'upi' | 'email' | 'sms' | 'geo' | 'text';
  raw: string;
  format?: string;
  data: Record<string, string>;
  timestamp: string;
}

function parseQrContent(raw: string, format = 'QR Code'): ParsedQrResult {
  const trimmed = raw.trim();
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // 1. URL Check
  if (/^(https?:\/\/|www\.)[^\s]+$/i.test(trimmed)) {
    const url = trimmed.startsWith('www.') ? `https://${trimmed}` : trimmed;
    let domain = '';
    try { domain = new URL(url).hostname; } catch {}
    return {
      type: 'url',
      raw: trimmed,
      format,
      timestamp,
      data: { url, domain, isHttps: url.startsWith('https://') ? 'true' : 'false' }
    };
  }

  // 2. WiFi Config Check
  if (/^wifi:/i.test(trimmed)) {
    const ssidMatch = trimmed.match(/S:([^;]+)/i);
    const passMatch = trimmed.match(/P:([^;]+)/i);
    const typeMatch = trimmed.match(/T:([^;]+)/i);
    return {
      type: 'wifi',
      raw: trimmed,
      format,
      timestamp,
      data: {
        ssid: ssidMatch ? ssidMatch[1] : 'Unknown Network',
        password: passMatch ? passMatch[1] : 'No Password',
        encryption: typeMatch ? typeMatch[1].toUpperCase() : 'WPA/WPA2'
      }
    };
  }

  // 3. vCard Contact Check
  if (/BEGIN:VCARD/i.test(trimmed)) {
    const fnMatch = trimmed.match(/FN:(.+)/i) || trimmed.match(/N:(.+)/i);
    const telMatch = trimmed.match(/TEL.*:(.+)/i);
    const emailMatch = trimmed.match(/EMAIL.*:(.+)/i);
    const orgMatch = trimmed.match(/ORG:(.+)/i);
    const titleMatch = trimmed.match(/TITLE:(.+)/i);
    return {
      type: 'vcard',
      raw: trimmed,
      format,
      timestamp,
      data: {
        name: fnMatch ? fnMatch[1].trim() : 'Contact Info',
        phone: telMatch ? telMatch[1].trim() : '',
        email: emailMatch ? emailMatch[1].trim() : '',
        org: orgMatch ? orgMatch[1].trim() : '',
        title: titleMatch ? titleMatch[1].trim() : ''
      }
    };
  }

  // 4. UPI Payment Check
  if (/^upi:\/\/pay/i.test(trimmed)) {
    try {
      const uObj = new URL(trimmed);
      return {
        type: 'upi',
        raw: trimmed,
        format,
        timestamp,
        data: {
          payeeId: uObj.searchParams.get('pa') || '',
          payeeName: uObj.searchParams.get('pn') || '',
          amount: uObj.searchParams.get('am') || '',
          currency: uObj.searchParams.get('cu') || 'INR'
        }
      };
    } catch {}
  }

  // 5. Email Check
  if (/^mailto:/i.test(trimmed)) {
    return {
      type: 'email',
      raw: trimmed,
      format,
      timestamp,
      data: { email: trimmed.replace(/^mailto:/i, '').split('?')[0] }
    };
  }

  // Default Plain Text
  return {
    type: 'text',
    raw: trimmed,
    format,
    timestamp,
    data: { text: trimmed, length: String(trimmed.length) }
  };
}

interface ImageToolRunnerProps {
  tool: ToolItem;
}

// --- ADVANCED INTERACTIVE CROPPER COMPONENT ---
interface CropperProps {
  imageSrc: string;
}

const AdvancedImageCropper: React.FC<CropperProps> = ({ imageSrc }) => {
  const [aspectRatio, setAspectRatio] = useState<string>('free');
  const [maskShape, setMaskShape] = useState<'rect' | 'circle' | 'rounded'>('rect');
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [gridOverlay, setGridOverlay] = useState<'thirds' | 'diagonal' | 'none'>('thirds');
  
  const [exportFormat, setExportFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/png');
  const [exportQuality, setExportQuality] = useState<number>(0.92);

  // Normalized crop rectangle relative to original image (0 to 100)
  const [cropBox, setCropBox] = useState<{ x: number; y: number; w: number; h: number }>({
    x: 10,
    y: 10,
    w: 80,
    h: 80
  });

  const [origDimensions, setOrigDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [croppedPreviewUrl, setCroppedPreviewUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDraggingRef = useRef<string | null>(null); // 'move' | 'tl' | 'tr' | 'bl' | 'br'
  const dragStartRef = useRef<{ x: number; y: number; crop: typeof cropBox }>({ x: 0, y: 0, crop: cropBox });

  // Load original image dimensions
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setOrigDimensions({ width: img.width, height: img.height });
      // Reset crop to center 80%
      setCropBox({ x: 10, y: 10, w: 80, h: 80 });
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Apply Aspect Ratio Constraint to Crop Box
  const applyAspectRatio = (ratioStr: string, currentCrop = cropBox) => {
    setAspectRatio(ratioStr);
    if (ratioStr === 'free' || !origDimensions.width) return;

    let targetRatio = 1;
    if (ratioStr === '1:1') targetRatio = 1;
    else if (ratioStr === '16:9') targetRatio = 16 / 9;
    else if (ratioStr === '9:16') targetRatio = 9 / 16;
    else if (ratioStr === '4:3') targetRatio = 4 / 3;
    else if (ratioStr === '4:5') targetRatio = 4 / 5;
    else if (ratioStr === '3:2') targetRatio = 3 / 2;
    else if (ratioStr === '2:1') targetRatio = 2;

    const imgAspect = origDimensions.width / origDimensions.height;
    // Ratio in terms of crop box % width vs % height
    const targetCropAspect = targetRatio / imgAspect;

    let newW = currentCrop.w;
    let newH = newW / targetCropAspect;

    if (newH > 100) {
      newH = 90;
      newW = newH * targetCropAspect;
    }
    if (newW > 100) {
      newW = 90;
      newH = newW / targetCropAspect;
    }

    const newX = Math.max(0, Math.min(100 - newW, (100 - newW) / 2));
    const newY = Math.max(0, Math.min(100 - newH, (100 - newH) / 2));

    setCropBox({ x: newX, y: newY, w: newW, h: newH });
  };

  // Social Media Presets
  const applySocialPreset = (preset: 'ig-post' | 'ig-story' | 'yt-thumb' | 'passport' | 'linkedin-banner' | 'tw-header') => {
    if (preset === 'ig-post') applyAspectRatio('1:1');
    else if (preset === 'ig-story') applyAspectRatio('9:16');
    else if (preset === 'yt-thumb') applyAspectRatio('16:9');
    else if (preset === 'passport') applyAspectRatio('1:1');
    else if (preset === 'linkedin-banner') applyAspectRatio('4:1');
    else if (preset === 'tw-header') applyAspectRatio('3:1');
  };

  // Render Cropped Output onto Canvas whenever crop, rotation, flip, format change
  useEffect(() => {
    if (!imageSrc || !origDimensions.width) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const realX = (cropBox.x / 100) * img.width;
      const realY = (cropBox.y / 100) * img.height;
      const realW = Math.max(10, (cropBox.w / 100) * img.width);
      const realH = Math.max(10, (cropBox.h / 100) * img.height);

      // Create an offscreen canvas for transformed source image
      const srcCanvas = document.createElement('canvas');
      const srcCtx = srcCanvas.getContext('2d');
      if (!srcCtx) return;

      srcCanvas.width = img.width;
      srcCanvas.height = img.height;

      srcCtx.save();
      srcCtx.translate(img.width / 2, img.height / 2);
      srcCtx.rotate((rotation * Math.PI) / 180);
      srcCtx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      srcCtx.drawImage(img, -img.width / 2, -img.height / 2);
      srcCtx.restore();

      // Output Canvas
      const canvas = previewCanvasRef.current || document.createElement('canvas');
      canvas.width = Math.round(realW);
      canvas.height = Math.round(realH);

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (maskShape === 'circle') {
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(canvas.width / 2, canvas.height / 2, canvas.width / 2, canvas.height / 2, 0, 0, 2 * Math.PI);
        ctx.clip();
        ctx.drawImage(srcCanvas, realX, realY, realW, realH, 0, 0, canvas.width, canvas.height);
        ctx.restore();
      } else if (maskShape === 'rounded') {
        ctx.save();
        const r = Math.min(canvas.width, canvas.height) * 0.15;
        ctx.beginPath();
        ctx.roundRect(0, 0, canvas.width, canvas.height, r);
        ctx.clip();
        ctx.drawImage(srcCanvas, realX, realY, realW, realH, 0, 0, canvas.width, canvas.height);
        ctx.restore();
      } else {
        ctx.drawImage(srcCanvas, realX, realY, realW, realH, 0, 0, canvas.width, canvas.height);
      }

      const url = canvas.toDataURL(exportFormat, exportQuality);
      setCroppedPreviewUrl(url);
    };
    img.src = imageSrc;
  }, [imageSrc, cropBox, rotation, flipH, flipV, maskShape, exportFormat, exportQuality, origDimensions]);

  // Drag & Resize Handlers
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent, action: string) => {
    isDraggingRef.current = action;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    dragStartRef.current = { x: clientX, y: clientY, crop: { ...cropBox } };
  };

  const handleMouseMove = (e: MouseEvent | TouchEvent) => {
    if (!isDraggingRef.current || !containerRef.current) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

    const rect = containerRef.current.getBoundingClientRect();
    const deltaXPercent = ((clientX - dragStartRef.current.x) / rect.width) * 100;
    const deltaYPercent = ((clientY - dragStartRef.current.y) / rect.height) * 100;

    const { crop } = dragStartRef.current;
    let nextX = crop.x;
    let nextY = crop.y;
    let nextW = crop.w;
    let nextH = crop.h;

    const action = isDraggingRef.current;

    if (action === 'move') {
      nextX = Math.max(0, Math.min(100 - crop.w, crop.x + deltaXPercent));
      nextY = Math.max(0, Math.min(100 - crop.h, crop.y + deltaYPercent));
    } else if (action === 'br') {
      nextW = Math.max(10, Math.min(100 - crop.x, crop.w + deltaXPercent));
      nextH = Math.max(10, Math.min(100 - crop.y, crop.h + deltaYPercent));
    } else if (action === 'tl') {
      const maxW = crop.x + crop.w;
      const maxH = crop.y + crop.h;
      nextX = Math.max(0, Math.min(maxW - 10, crop.x + deltaXPercent));
      nextY = Math.max(0, Math.min(maxH - 10, crop.y + deltaYPercent));
      nextW = maxW - nextX;
      nextH = maxH - nextY;
    } else if (action === 'tr') {
      const maxH = crop.y + crop.h;
      nextY = Math.max(0, Math.min(maxH - 10, crop.y + deltaYPercent));
      nextW = Math.max(10, Math.min(100 - crop.x, crop.w + deltaXPercent));
      nextH = maxH - nextY;
    } else if (action === 'bl') {
      const maxW = crop.x + crop.w;
      nextX = Math.max(0, Math.min(maxW - 10, crop.x + deltaXPercent));
      nextW = maxW - nextX;
      nextH = Math.max(10, Math.min(100 - crop.y, crop.h + deltaYPercent));
    }

    setCropBox({ x: nextX, y: nextY, w: nextW, h: nextH });
  };

  const handleMouseUp = () => {
    isDraggingRef.current = null;
  };

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => handleMouseMove(e);
    const onUp = () => handleMouseUp();

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend', onUp);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [cropBox]);

  const handleReset = () => {
    setCropBox({ x: 10, y: 10, w: 80, h: 80 });
    setAspectRatio('free');
    setMaskShape('rect');
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
  };

  const handleDownloadCropped = () => {
    if (!croppedPreviewUrl) return;
    const a = document.createElement('a');
    a.href = croppedPreviewUrl;
    const ext = exportFormat.split('/')[1];
    a.download = `cropped_image_${Math.round((cropBox.w / 100) * origDimensions.width)}x${Math.round((cropBox.h / 100) * origDimensions.height)}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyClipboard = async () => {
    if (!croppedPreviewUrl) return;
    try {
      const res = await fetch(croppedPreviewUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const currentCroppedPxW = Math.round((cropBox.w / 100) * origDimensions.width);
  const currentCroppedPxH = Math.round((cropBox.h / 100) * origDimensions.height);

  return (
    <div className="space-y-6">
      {/* Aspect Ratio & Presets Header */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Crop className="w-4 h-4 text-indigo-500" />
            Aspect Ratio Presets
          </span>
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1 transition"
          >
            <RefreshCcw className="w-3 h-3" />
            Reset All
          </button>
        </div>

        {/* Ratio Buttons */}
        <div className="flex flex-wrap gap-1.5 text-xs font-bold">
          {[
            { id: 'free', label: 'Freeform' },
            { id: '1:1', label: '1:1 Square' },
            { id: '16:9', label: '16:9 HD' },
            { id: '9:16', label: '9:16 Story' },
            { id: '4:3', label: '4:3 Standard' },
            { id: '4:5', label: '4:5 Feed' },
            { id: '3:2', label: '3:2 Photo' },
            { id: '2:1', label: '2:1 Banner' },
          ].map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => applyAspectRatio(r.id)}
              className={`px-3 py-1.5 rounded-xl transition ${
                aspectRatio === r.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Social Media Shortcuts */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Social Shortcuts:</span>
          <button
            type="button"
            onClick={() => applySocialPreset('ig-post')}
            className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-[11px] hover:bg-indigo-500/20"
          >
            📸 Instagram Post (1:1)
          </button>
          <button
            type="button"
            onClick={() => applySocialPreset('ig-story')}
            className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-[11px] hover:bg-purple-500/20"
          >
            📱 IG Story / Reels (9:16)
          </button>
          <button
            type="button"
            onClick={() => applySocialPreset('yt-thumb')}
            className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-[11px] hover:bg-rose-500/20"
          >
            ▶️ YouTube Thumbnail (16:9)
          </button>
          <button
            type="button"
            onClick={() => applySocialPreset('passport')}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] hover:bg-emerald-500/20"
          >
            🪪 Passport / ID Photo
          </button>
        </div>
      </div>

      {/* Main Interactive Editor Canvas Stage & Control Toolbar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Canvas Editor */}
        <div className="lg:col-span-2 space-y-4">
          <div
            ref={containerRef}
            className="relative w-full aspect-video bg-slate-950 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center select-none border border-slate-800 touch-none"
          >
            {/* Base Rotated & Flipped Image */}
            <img
              src={imageSrc}
              alt="Crop source"
              style={{
                transform: `rotate(${rotation}deg) scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})`,
                transition: 'transform 0.15s ease-out'
              }}
              className="max-w-full max-h-full object-contain pointer-events-none"
            />

            {/* Dimmed Background Overlay Outside Crop Box */}
            <div className="absolute inset-0 bg-black/60 pointer-events-none" />

            {/* Interactive Crop Box Window */}
            <div
              style={{
                left: `${cropBox.x}%`,
                top: `${cropBox.y}%`,
                width: `${cropBox.w}%`,
                height: `${cropBox.h}%`,
                borderRadius: maskShape === 'circle' ? '9999px' : maskShape === 'rounded' ? '24px' : '0px'
              }}
              className="absolute border-2 border-indigo-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] cursor-move group transition-all duration-75 overflow-hidden"
              onMouseDown={(e) => handleMouseDown(e, 'move')}
              onTouchStart={(e) => handleMouseDown(e, 'move')}
            >
              {/* Grid Guides */}
              {gridOverlay === 'thirds' && (
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-60">
                  <div className="border-r border-b border-indigo-200/40" />
                  <div className="border-r border-b border-indigo-200/40" />
                  <div className="border-b border-indigo-200/40" />
                  <div className="border-r border-b border-indigo-200/40" />
                  <div className="border-r border-b border-indigo-200/40" />
                  <div className="border-b border-indigo-200/40" />
                  <div className="border-r border-indigo-200/40" />
                  <div className="border-r border-indigo-200/40" />
                  <div />
                </div>
              )}

              {gridOverlay === 'diagonal' && (
                <div className="absolute inset-0 pointer-events-none opacity-40">
                  <div className="absolute inset-0 border-r border-b border-indigo-300 transform rotate-45 origin-center" />
                </div>
              )}

              {/* Dimensions Tooltip Pill */}
              <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-mono text-white font-extrabold border border-white/10 pointer-events-none shadow">
                {currentCroppedPxW} × {currentCroppedPxH} px
              </div>

              {/* Corner Drag Handles */}
              {['tl', 'tr', 'bl', 'br'].map((corner) => {
                let positionClasses = '';
                if (corner === 'tl') positionClasses = 'top-0 left-0 cursor-nwse-resize';
                if (corner === 'tr') positionClasses = 'top-0 right-0 cursor-nesw-resize';
                if (corner === 'bl') positionClasses = 'bottom-0 left-0 cursor-nesw-resize';
                if (corner === 'br') positionClasses = 'bottom-0 right-0 cursor-nwse-resize';

                return (
                  <div
                    key={corner}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleMouseDown(e, corner);
                    }}
                    onTouchStart={(e) => {
                      e.stopPropagation();
                      handleMouseDown(e, corner);
                    }}
                    className={`absolute w-5 h-5 bg-white border-2 border-indigo-600 rounded-full shadow-lg ${positionClasses} transform -translate-x-1/2 -translate-y-1/2 hover:scale-125 transition-transform z-20`}
                  />
                );
              })}
            </div>
          </div>

          {/* Transformation Controls Bar */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setRotation((prev) => (prev - 90) % 360)}
                className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 transition"
              >
                <RotateCcw className="w-4 h-4 text-indigo-500" />
                <span>Rotate -90°</span>
              </button>
              <button
                type="button"
                onClick={() => setRotation((prev) => (prev + 90) % 360)}
                className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 transition"
              >
                <RotateCw className="w-4 h-4 text-indigo-500" />
                <span>Rotate +90°</span>
              </button>
              <button
                type="button"
                onClick={() => setFlipH(!flipH)}
                className={`p-2.5 rounded-xl border transition flex items-center justify-center gap-1.5 ${
                  flipH ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <FlipHorizontal className="w-4 h-4" />
                <span>Flip Horiz</span>
              </button>
              <button
                type="button"
                onClick={() => setFlipV(!flipV)}
                className={`p-2.5 rounded-xl border transition flex items-center justify-center gap-1.5 ${
                  flipV ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <FlipVertical className="w-4 h-4" />
                <span>Flip Vert</span>
              </button>
            </div>

            {/* Fine Rotation Slider & Mask Shape Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div>
                <div className="flex justify-between items-center text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Fine Rotation</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400">{rotation}°</span>
                </div>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                  Crop Mask Shape
                </span>
                <div className="flex gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold">
                  {[
                    { id: 'rect', label: 'Rectangle', icon: Square },
                    { id: 'circle', label: 'Circle / Avatar', icon: Circle },
                    { id: 'rounded', label: 'Rounded', icon: Maximize2 },
                  ].map((m) => {
                    const IconComp = m.icon;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMaskShape(m.id as any)}
                        className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition ${
                          maskShape === m.id ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <IconComp className="w-3.5 h-3.5" />
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Live Cropped Output & Export Panel */}
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-emerald-500" />
              Live Cropped Preview
            </h4>

            {/* Cropped Image Display */}
            <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col items-center justify-center min-h-[180px]">
              {croppedPreviewUrl ? (
                <img
                  src={croppedPreviewUrl}
                  alt="Cropped Preview"
                  className="max-h-[160px] object-contain rounded-xl shadow-lg"
                />
              ) : (
                <span className="text-xs text-slate-500">Generating preview...</span>
              )}
            </div>

            {/* Format & Quality Settings */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">Export Format</label>
                <select
                  value={exportFormat}
                  onChange={(e: any) => setExportFormat(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="image/png">PNG (Lossless & Transparent)</option>
                  <option value="image/jpeg">JPG / JPEG (Compressed)</option>
                  <option value="image/webp">WEBP (Modern Web)</option>
                </select>
              </div>

              {exportFormat !== 'image/png' && (
                <div>
                  <div className="flex justify-between text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Export Quality</span>
                    <span className="font-mono text-indigo-600">{Math.round(exportQuality * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="1.0"
                    step="0.05"
                    value={exportQuality}
                    onChange={(e) => setExportQuality(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleDownloadCropped}
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition"
              >
                <Download className="w-4 h-4" />
                <span>Download Cropped Image</span>
              </button>

              <button
                type="button"
                onClick={handleCopyClipboard}
                className="w-full py-2.5 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2 transition"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Canvas Element for export processing */}
      <canvas ref={previewCanvasRef} className="hidden" />
    </div>
  );
};

// --- ADVANCED QR CODE CREATOR & DESIGNER COMPONENT ---
const AdvancedQrCreator: React.FC = () => {
  // Content Type
  type ContentType = 'url' | 'pdf' | 'multi-url' | 'vcard' | 'text' | 'app' | 'sms' | 'email' | 'phone' | 'social' | 'wifi' | 'upi';
  const [contentType, setContentType] = useState<ContentType>('url');

  // Content Input Fields
  const [url, setUrl] = useState('https://ai.studio/build');
  const [pdfUrl, setPdfUrl] = useState('https://example.com/document.pdf');
  const [pdfName, setPdfName] = useState('Product_Catalog_2026.pdf');

  const [multiLinks, setMultiLinks] = useState<Array<{ title: string; url: string }>>([
    { title: 'Official Website', url: 'https://ai.studio' },
    { title: 'Online Store', url: 'https://store.example.com' },
    { title: 'Support Helpdesk', url: 'https://help.example.com' }
  ]);

  const [vFirstName, setVFirstName] = useState('Alex');
  const [vLastName, setVLastName] = useState('Dev');
  const [vPhone, setVPhone] = useState('+18005550199');
  const [vEmail, setVEmail] = useState('alex@aistudio.com');
  const [vOrg, setVOrg] = useState('AI Studio Hub');
  const [vTitle, setVTitle] = useState('Lead Engineer');
  const [vUrl, setVUrl] = useState('https://ai.studio');

  const [plainText, setPlainText] = useState('Welcome to SuperHub AI Tools!');

  const [appStoreUrl, setAppStoreUrl] = useState('https://apps.apple.com/app/id123456789');
  const [playStoreUrl, setPlayStoreUrl] = useState('https://play.google.com/store/apps/details?id=com.app');

  const [smsNum, setSmsNum] = useState('+18005550199');
  const [smsBody, setSmsBody] = useState('Hello from QR Code');

  const [emailTo, setEmailTo] = useState('contact@aistudio.com');
  const [emailSub, setEmailSub] = useState('Inquiry from QR Code');
  const [emailBody, setEmailBody] = useState('Hi, I would like to get more information.');

  const [phoneNumber, setPhoneNumber] = useState('+18005550199');

  const [socialInsta, setSocialInsta] = useState('aistudio_official');
  const [socialYoutube, setSocialYoutube] = useState('@aistudio');
  const [socialTwitter, setSocialTwitter] = useState('aistudio_hub');

  const [wifiSsid, setWifiSsid] = useState('SuperHub_5G');
  const [wifiPass, setWifiPass] = useState('HubPass2026');
  const [wifiType, setWifiType] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [wifiHidden, setWifiHidden] = useState(false);

  const [upiId, setUpiId] = useState('superhub@bank');
  const [upiName, setUpiName] = useState('SuperHub Store');
  const [upiAmount, setUpiAmount] = useState('500');
  const [upiNote, setUpiNote] = useState('Order #1029');

  // Dynamic QR Tracking Mode
  const [isDynamic, setIsDynamic] = useState(false);

  // Frame Customization
  const [frameStyle, setFrameStyle] = useState<'none' | 'bottom-banner' | 'top-badge' | 'card-frame' | 'gradient-border'>('none');
  const [frameText, setFrameText] = useState('SCAN ME');
  const [frameBgColor, setFrameBgColor] = useState('#0f172a');
  const [frameTextColor, setFrameTextColor] = useState('#ffffff');

  // Visual Customization State (Default: Standard Black & White Square QR Code)
  const [fillType, setFillType] = useState<'solid' | 'linear-grad' | 'radial-grad'>('solid');
  const [fgColor1, setFgColor1] = useState('#000000');
  const [fgColor2, setFgColor2] = useState('#000000');
  const [gradAngle, setGradAngle] = useState(45);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [eyeFrameColor, setEyeFrameColor] = useState('#000000');
  const [eyeBallColor, setEyeBallColor] = useState('#000000');

  const [dotStyle, setDotStyle] = useState<'square' | 'dots' | 'rounded' | 'classy' | 'star'>('square');
  const [eyeFrameStyle, setEyeFrameStyle] = useState<'square' | 'circle' | 'rounded' | 'leaf'>('square');
  const [eyeBallStyle, setEyeBallStyle] = useState<'square' | 'circle' | 'diamond'>('square');

  // Logo Overlay State
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(null);
  const [presetLogoIcon, setPresetLogoIcon] = useState<string>('none');
  const [logoSizePercent, setLogoSizePercent] = useState<number>(20);
  const [logoShape, setLogoShape] = useState<'circle' | 'square' | 'transparent'>('circle');

  // Advanced Tech Specs
  const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>('H');
  const [margin, setMargin] = useState<number>(2);
  const [canvasResolution, setCanvasResolution] = useState<number>(512);

  // UI Helper States
  const [activeTab, setActiveTab] = useState<'content' | 'design' | 'logo' | 'presets'>('content');
  const [copied, setCopied] = useState<boolean>(false);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  const mainCanvasRef = useRef<HTMLCanvasElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Helper: Get raw output string based on content type
  const getRawContentString = (): string => {
    let raw = '';
    if (contentType === 'url') {
      let u = url.trim();
      if (!u) u = 'https://ai.studio/build';
      if (!/^https?:\/\//i.test(u)) {
        u = 'https://' + u;
      }
      raw = u;
    } else if (contentType === 'pdf') {
      let u = pdfUrl.trim();
      if (!u) u = 'https://example.com/document.pdf';
      if (!/^https?:\/\//i.test(u)) {
        u = 'https://' + u;
      }
      raw = u;
    } else if (contentType === 'multi-url') {
      raw = multiLinks.map(l => {
        let u = l.url.trim();
        if (u && !/^https?:\/\//i.test(u)) u = 'https://' + u;
        return `${l.title}: ${u}`;
      }).join('\n');
    } else if (contentType === 'vcard') {
      let u = vUrl.trim();
      if (u && !/^https?:\/\//i.test(u)) u = 'https://' + u;
      raw = `BEGIN:VCARD\nVERSION:3.0\nN:${vLastName};${vFirstName}\nFN:${vFirstName} ${vLastName}\nTEL:${vPhone}\nEMAIL:${vEmail}\nORG:${vOrg}\nTITLE:${vTitle}\nURL:${u}\nEND:VCARD`;
    } else if (contentType === 'text') {
      raw = plainText;
    } else if (contentType === 'app') {
      let aUrl = appStoreUrl.trim();
      if (aUrl && !/^https?:\/\//i.test(aUrl)) aUrl = 'https://' + aUrl;
      let pUrl = playStoreUrl.trim();
      if (pUrl && !/^https?:\/\//i.test(pUrl)) pUrl = 'https://' + pUrl;
      raw = `AppStore: ${aUrl}\nPlayStore: ${pUrl}`;
    } else if (contentType === 'sms') {
      raw = `sms:${smsNum}?body=${encodeURIComponent(smsBody)}`;
    } else if (contentType === 'email') {
      raw = `mailto:${emailTo}?subject=${encodeURIComponent(emailSub)}&body=${encodeURIComponent(emailBody)}`;
    } else if (contentType === 'phone') {
      raw = `tel:${phoneNumber}`;
    } else if (contentType === 'social') {
      raw = `https://instagram.com/${socialInsta}\nhttps://youtube.com/${socialYoutube}\nhttps://x.com/${socialTwitter}`;
    } else if (contentType === 'wifi') {
      raw = `WIFI:S:${wifiSsid};T:${wifiType};P:${wifiPass};H:${wifiHidden ? 'true' : 'false'};;`;
    } else if (contentType === 'upi') {
      let upiStr = `upi://pay?pa=${encodeURIComponent(upiId.trim())}`;
      if (upiName.trim()) {
        upiStr += `&pn=${encodeURIComponent(upiName.trim())}`;
      }
      if (upiAmount.trim() && !isNaN(Number(upiAmount.trim())) && Number(upiAmount.trim()) > 0) {
        upiStr += `&am=${encodeURIComponent(upiAmount.trim())}&cu=INR`;
      } else {
        upiStr += `&cu=INR`;
      }
      if (upiNote.trim()) {
        upiStr += `&tn=${encodeURIComponent(upiNote.trim())}`;
      }
      raw = upiStr;
    } else {
      raw = plainText;
    }

    if (isDynamic) {
      if (raw.startsWith('http://') || raw.startsWith('https://')) {
        const sep = raw.includes('?') ? '&' : '?';
        return `${raw}${sep}qr_track=dynamic`;
      }
    }

    return raw;
  };

  // Preset Theme Palettes
  const applyPresetTheme = (theme: 'classic' | 'cyberpunk' | 'emerald' | 'sunset' | 'obsidian' | 'ocean' | 'amethyst') => {
    if (theme === 'classic') {
      setFillType('solid');
      setFgColor1('#000000');
      setFgColor2('#000000');
      setBgColor('#ffffff');
      setEyeFrameColor('#000000');
      setEyeBallColor('#000000');
      setDotStyle('square');
      setEyeFrameStyle('square');
      setEyeBallStyle('square');
      setFrameStyle('none');
    } else if (theme === 'cyberpunk') {
      setFillType('linear-grad');
      setFgColor1('#06b6d4');
      setFgColor2('#ec4899');
      setGradAngle(45);
      setBgColor('#090d16');
      setEyeFrameColor('#06b6d4');
      setEyeBallColor('#ec4899');
      setDotStyle('dots');
      setEyeFrameStyle('circle');
      setEyeBallStyle('circle');
    } else if (theme === 'emerald') {
      setFillType('linear-grad');
      setFgColor1('#10b981');
      setFgColor2('#047857');
      setGradAngle(135);
      setBgColor('#f0fdf4');
      setEyeFrameColor('#047857');
      setEyeBallColor('#10b981');
      setDotStyle('classy');
      setEyeFrameStyle('leaf');
      setEyeBallStyle('diamond');
    } else if (theme === 'sunset') {
      setFillType('linear-grad');
      setFgColor1('#f59e0b');
      setFgColor2('#ec4899');
      setGradAngle(90);
      setBgColor('#18121e');
      setEyeFrameColor('#fbbf24');
      setEyeBallColor('#f43f5e');
      setDotStyle('star');
      setEyeFrameStyle('rounded');
      setEyeBallStyle('square');
    } else if (theme === 'obsidian') {
      setFillType('solid');
      setFgColor1('#334155');
      setFgColor2('#334155');
      setBgColor('#0f172a');
      setEyeFrameColor('#cbd5e1');
      setEyeBallColor('#ffffff');
      setDotStyle('square');
      setEyeFrameStyle('square');
      setEyeBallStyle('square');
    } else if (theme === 'ocean') {
      setFillType('linear-grad');
      setFgColor1('#2563eb');
      setFgColor2('#0284c7');
      setGradAngle(90);
      setBgColor('#f8fafc');
      setEyeFrameColor('#1d4ed8');
      setEyeBallColor('#0284c7');
      setDotStyle('dots');
      setEyeFrameStyle('rounded');
      setEyeBallStyle('circle');
    } else if (theme === 'amethyst') {
      setFillType('linear-grad');
      setFgColor1('#8b5cf6');
      setFgColor2('#d946ef');
      setGradAngle(45);
      setBgColor('#0f0c1b');
      setEyeFrameColor('#a855f7');
      setEyeBallColor('#f43f5e');
      setDotStyle('rounded');
      setEyeFrameStyle('rounded');
      setEyeBallStyle('circle');
    }
  };

  // Re-render QR code on canvas whenever parameters change
  useEffect(() => {
    const rawText = getRawContentString();
    if (!rawText || !mainCanvasRef.current) return;

    const canvas = mainCanvasRef.current;
    
    try {
      const qr = QRCode.create(rawText, { errorCorrectionLevel: errorCorrection });
      const modules = qr.modules;
      const matrixSize = modules.size;
      const data = modules.data;

      const baseQrSize = 360;
      let canvasWidth = baseQrSize;
      let canvasHeight = baseQrSize;
      let qrOffsetX = 0;
      let qrOffsetY = 0;

      // Adjust size for Frame
      if (frameStyle === 'bottom-banner') {
        canvasHeight = baseQrSize + 60;
        qrOffsetY = 5;
      } else if (frameStyle === 'top-badge') {
        canvasHeight = baseQrSize + 60;
        qrOffsetY = 50;
      } else if (frameStyle === 'card-frame') {
        canvasWidth = baseQrSize + 50;
        canvasHeight = baseQrSize + 90;
        qrOffsetX = 25;
        qrOffsetY = 35;
      } else if (frameStyle === 'gradient-border') {
        canvasWidth = baseQrSize + 30;
        canvasHeight = baseQrSize + 70;
        qrOffsetX = 15;
        qrOffsetY = 15;
      }

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Draw Outer Frame Box
      if (frameStyle !== 'none') {
        ctx.fillStyle = frameBgColor;
        ctx.beginPath();
        ctx.roundRect(0, 0, canvasWidth, canvasHeight, 24);
        ctx.fill();

        // Banner CTA Text
        ctx.fillStyle = frameTextColor;
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'center';

        if (frameStyle === 'bottom-banner') {
          ctx.fillText(frameText.toUpperCase(), canvasWidth / 2, baseQrSize + 42);
        } else if (frameStyle === 'top-badge') {
          ctx.fillText(frameText.toUpperCase(), canvasWidth / 2, 32);
        } else if (frameStyle === 'card-frame') {
          ctx.fillText(frameText.toUpperCase(), canvasWidth / 2, baseQrSize + 70);
        } else if (frameStyle === 'gradient-border') {
          ctx.fillText(frameText.toUpperCase(), canvasWidth / 2, baseQrSize + 48);
        }
      }

      // Background Fill
      if (bgColor && bgColor !== 'transparent') {
        ctx.fillStyle = bgColor;
        if (frameStyle !== 'none') {
          ctx.beginPath();
          ctx.roundRect(qrOffsetX + 8, qrOffsetY + 8, baseQrSize - 16, baseQrSize - 16, 16);
          ctx.fill();
        } else {
          ctx.fillRect(0, 0, baseQrSize, baseQrSize);
        }
      }

      const totalModules = matrixSize + margin * 2;
      const moduleSize = (baseQrSize - margin * 2 * 4) / matrixSize;
      const innerMargin = margin * 4;

      // Helper: Finder Pattern detector
      const isFinderPattern = (r: number, c: number) => {
        if (r < 7 && c < 7) return 'top-left';
        if (r < 7 && c >= matrixSize - 7) return 'top-right';
        if (r >= matrixSize - 7 && c < 7) return 'bottom-left';
        return null;
      };

      // Foreground Gradient
      let fgStyle: string | CanvasGradient = fgColor1;
      if (fillType === 'linear-grad') {
        const rad = (gradAngle * Math.PI) / 180;
        const grad = ctx.createLinearGradient(0, 0, baseQrSize * Math.cos(rad), baseQrSize * Math.sin(rad));
        grad.addColorStop(0, fgColor1);
        grad.addColorStop(1, fgColor2);
        fgStyle = grad;
      } else if (fillType === 'radial-grad') {
        const grad = ctx.createRadialGradient(baseQrSize / 2, baseQrSize / 2, 10, baseQrSize / 2, baseQrSize / 2, baseQrSize / 1.2);
        grad.addColorStop(0, fgColor1);
        grad.addColorStop(1, fgColor2);
        fgStyle = grad;
      }

      // Draw Body Modules
      ctx.fillStyle = fgStyle;
      for (let r = 0; r < matrixSize; r++) {
        for (let c = 0; c < matrixSize; c++) {
          const isDark = data[r * matrixSize + c] === 1;
          if (!isDark) continue;
          if (isFinderPattern(r, c) !== null) continue;

          const x = qrOffsetX + innerMargin + c * moduleSize;
          const y = qrOffsetY + innerMargin + r * moduleSize;

          if (dotStyle === 'dots') {
            ctx.beginPath();
            ctx.arc(x + moduleSize / 2, y + moduleSize / 2, moduleSize / 2.2, 0, Math.PI * 2);
            ctx.fill();
          } else if (dotStyle === 'rounded') {
            ctx.beginPath();
            ctx.roundRect(x, y, moduleSize, moduleSize, moduleSize * 0.35);
            ctx.fill();
          } else if (dotStyle === 'classy') {
            ctx.beginPath();
            ctx.moveTo(x + moduleSize / 2, y);
            ctx.lineTo(x + moduleSize, y + moduleSize / 2);
            ctx.lineTo(x + moduleSize / 2, y + moduleSize);
            ctx.lineTo(x, y + moduleSize / 2);
            ctx.closePath();
            ctx.fill();
          } else if (dotStyle === 'star') {
            ctx.beginPath();
            const cx = x + moduleSize / 2;
            const cy = y + moduleSize / 2;
            const r1 = moduleSize * 0.5;
            const r2 = moduleSize * 0.18;
            for (let i = 0; i < 8; i++) {
              const rad = (i * Math.PI) / 4;
              const rCurrent = i % 2 === 0 ? r1 : r2;
              const px = cx + rCurrent * Math.cos(rad);
              const py = cy + rCurrent * Math.sin(rad);
              if (i === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
          } else {
            // Square
            ctx.fillRect(x, y, moduleSize, moduleSize);
          }
        }
      }

      // Draw Finder Patterns (Top-Left, Top-Right, Bottom-Left)
      const finderPositions = [
        { r: 0, c: 0 },
        { r: 0, c: matrixSize - 7 },
        { r: matrixSize - 7, c: 0 }
      ];

      const frameColor = eyeFrameColor || fgColor1;
      const ballColor = eyeBallColor || fgColor1;

      finderPositions.forEach((pos) => {
        const fx = qrOffsetX + innerMargin + pos.c * moduleSize;
        const fy = qrOffsetY + innerMargin + pos.r * moduleSize;
        const fSize = 7 * moduleSize;

        // Outer Frame
        ctx.fillStyle = frameColor;
        ctx.beginPath();
        if (eyeFrameStyle === 'circle') {
          ctx.arc(fx + fSize / 2, fy + fSize / 2, fSize / 2, 0, Math.PI * 2);
          ctx.arc(fx + fSize / 2, fy + fSize / 2, (5 * moduleSize) / 2, 0, Math.PI * 2, true);
        } else if (eyeFrameStyle === 'rounded') {
          const rad = moduleSize * 2;
          ctx.roundRect(fx, fy, fSize, fSize, rad);
          ctx.roundRect(fx + moduleSize, fy + moduleSize, 5 * moduleSize, 5 * moduleSize, rad * 0.6);
        } else if (eyeFrameStyle === 'leaf') {
          ctx.roundRect(fx, fy, fSize, fSize, [fSize * 0.4, 0, fSize * 0.4, 0]);
          ctx.roundRect(fx + moduleSize, fy + moduleSize, 5 * moduleSize, 5 * moduleSize, [fSize * 0.25, 0, fSize * 0.25, 0]);
        } else {
          ctx.rect(fx, fy, fSize, fSize);
          ctx.rect(fx + moduleSize, fy + moduleSize, 5 * moduleSize, 5 * moduleSize);
        }
        ctx.fill('evenodd');

        // Inner Eye Ball
        const bx = fx + 2 * moduleSize;
        const by = fy + 2 * moduleSize;
        const bSize = 3 * moduleSize;

        ctx.fillStyle = ballColor;
        ctx.beginPath();
        if (eyeBallStyle === 'circle') {
          ctx.arc(bx + bSize / 2, by + bSize / 2, bSize / 2, 0, Math.PI * 2);
        } else if (eyeBallStyle === 'diamond') {
          ctx.moveTo(bx + bSize / 2, by);
          ctx.lineTo(bx + bSize, by + bSize / 2);
          ctx.lineTo(bx + bSize / 2, by + bSize);
          ctx.lineTo(bx, by + bSize / 2);
          ctx.closePath();
        } else {
          ctx.rect(bx, by, bSize, bSize);
        }
        ctx.fill();
      });

      // Draw Center Logo / Icon Overlay
      const drawCenterOverlay = (imgSrc: string) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const logoSize = (baseQrSize * logoSizePercent) / 100;
          const lx = qrOffsetX + (baseQrSize - logoSize) / 2;
          const ly = qrOffsetY + (baseQrSize - logoSize) / 2;

          if (logoShape !== 'transparent') {
            const pad = logoSize * 0.15;
            ctx.fillStyle = bgColor && bgColor !== 'transparent' ? bgColor : '#ffffff';
            ctx.beginPath();
            if (logoShape === 'circle') {
              ctx.arc(qrOffsetX + baseQrSize / 2, qrOffsetY + baseQrSize / 2, logoSize / 2 + pad, 0, Math.PI * 2);
            } else {
              ctx.roundRect(lx - pad, ly - pad, logoSize + pad * 2, logoSize + pad * 2, pad);
            }
            ctx.fill();
          }
          ctx.drawImage(img, lx, ly, logoSize, logoSize);
        };
        img.src = imgSrc;
      };

      if (customLogoUrl) {
        drawCenterOverlay(customLogoUrl);
      } else if (presetLogoIcon !== 'none') {
        // Generate SVG data URL for preset icon
        let svgPath = '';
        if (presetLogoIcon === 'wifi') svgPath = '<path fill="#06b6d4" d="M12 3c-4.97 0-9.47 2.01-12.73 5.27l2.12 2.12c2.72-2.72 6.47-4.39 10.61-4.39s7.89 1.67 10.61 4.39l2.12-2.12c-3.26-3.26-7.76-5.27-12.73-5.27zm0 6c-3.31 0-6.31 1.34-8.49 3.51l2.12 2.12c1.63-1.63 3.88-2.63 6.37-2.63s4.74 1 6.37 2.63l2.12-2.12c-2.18-2.17-5.18-3.51-8.49-3.51zm0 6c-1.66 0-3.16.67-4.24 1.76l4.24 4.24 4.24-4.24c-1.08-1.09-2.58-1.76-4.24-1.76z"/>';
        else if (presetLogoIcon === 'whatsapp') svgPath = '<path fill="#10b981" d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95l-1.4 5.14 5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-5.46-4.45-9.92-9.91-9.92z"/>';
        else if (presetLogoIcon === 'globe') svgPath = '<path fill="#3b82f6" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>';
        else if (presetLogoIcon === 'upi') svgPath = '<path fill="#f59e0b" d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>';
        else if (presetLogoIcon === 'star') svgPath = '<path fill="#eab308" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>';
        else if (presetLogoIcon === 'heart') svgPath = '<path fill="#ec4899" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>';

        if (svgPath) {
          const svgData = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100" height="100">${svgPath}</svg>`;
          const svgUrl = `data:image/svg+xml;base64,${btoa(svgData)}`;
          drawCenterOverlay(svgUrl);
        }
      }
    } catch (err) {
      console.error('QR Render Failed:', err);
    }
  }, [
    contentType, url, pdfUrl, multiLinks, wifiSsid, wifiPass, wifiType, wifiHidden,
    vFirstName, vLastName, vPhone, vEmail, vOrg, vTitle, vUrl,
    upiId, upiName, upiAmount, upiNote, appStoreUrl, playStoreUrl,
    emailTo, emailSub, emailBody, smsNum, smsBody, phoneNumber, plainText,
    isDynamic, frameStyle, frameText, frameBgColor, frameTextColor,
    fillType, fgColor1, fgColor2, gradAngle, bgColor, eyeFrameColor, eyeBallColor,
    dotStyle, eyeFrameStyle, eyeBallStyle, customLogoUrl, presetLogoIcon,
    logoSizePercent, logoShape, errorCorrection, margin, canvasResolution
  ]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setCustomLogoUrl(evt.target?.result as string);
        setPresetLogoIcon('none');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownloadPng = () => {
    if (!mainCanvasRef.current) return;
    const link = document.createElement('a');
    link.download = `custom_qr_${contentType}_${Date.now()}.png`;
    link.href = mainCanvasRef.current.toDataURL('image/png');
    link.click();
  };

  const handleDownloadSvg = async () => {
    const rawText = getRawContentString();
    try {
      const svgString = await QRCode.toString(rawText, {
        type: 'svg',
        errorCorrectionLevel: errorCorrection,
        margin,
        color: { dark: fgColor1, light: bgColor === 'transparent' ? '#00000000' : bgColor }
      });
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `custom_qr_${contentType}_${Date.now()}.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('SVG Download error:', err);
    }
  };

  const handleCopyImage = async () => {
    if (!mainCanvasRef.current) return;
    try {
      mainCanvasRef.current.toBlob(async (blob) => {
        if (blob) {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      });
    } catch (err) {
      console.error('Copy to clipboard failed:', err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Control Panel (7 cols) */}
      <div className="lg:col-span-7 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('content')}
            className={`flex-1 min-w-[90px] py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition ${
              activeTab === 'content' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>1. Content</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('design')}
            className={`flex-1 min-w-[90px] py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition ${
              activeTab === 'design' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-white'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>2. Style & Colors</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('logo')}
            className={`flex-1 min-w-[90px] py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition ${
              activeTab === 'logo' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>3. Logo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`flex-1 min-w-[90px] py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition ${
              activeTab === 'presets' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>4. Themes</span>
          </button>
        </div>

        {/* --- TAB 1: CONTENT TYPE SELECTOR & FORMS --- */}
        {activeTab === 'content' && (
          <div className="space-y-5 animate-fade-in">
            {/* Dynamic Tracking Toggle Bar */}
            <div className="p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <div>
                  <span className="text-xs font-bold text-slate-200 block">Dynamic QR Code Mode</span>
                  <span className="text-[10px] text-slate-400">Track scan analytics & change destination anytime without re-printing.</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDynamic(!isDynamic)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isDynamic ? 'bg-indigo-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isDynamic ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Content Type Selector Pills (12 requested types) */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {[
                { id: 'url', label: 'URL', icon: Globe },
                { id: 'pdf', label: 'PDF Doc', icon: FileText },
                { id: 'multi-url', label: 'Multi-URL', icon: Layers },
                { id: 'vcard', label: 'vCard', icon: User },
                { id: 'text', label: 'Text', icon: FileText },
                { id: 'app', label: 'App Stores', icon: Smartphone },
                { id: 'sms', label: 'SMS', icon: Send },
                { id: 'email', label: 'Email', icon: Mail },
                { id: 'phone', label: 'Phone', icon: Phone },
                { id: 'social', label: 'Social', icon: Share2 },
                { id: 'wifi', label: 'WiFi', icon: Wifi },
                { id: 'upi', label: 'UPI Pay', icon: CreditCard },
              ].map((item) => {
                const IconComp = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setContentType(item.id as any)}
                    className={`p-2.5 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                      contentType === item.id
                        ? 'bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-extrabold shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400'
                    }`}
                  >
                    <IconComp className="w-4 h-4" />
                    <span className="text-[11px] leading-tight truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Dynamic Content Form Fields */}
            <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
              {contentType === 'url' && (
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Website Destination URL:
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              )}

              {contentType === 'pdf' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Document Title:</label>
                    <input
                      type="text"
                      value={pdfName}
                      onChange={(e) => setPdfName(e.target.value)}
                      placeholder="Product Catalog 2026.pdf"
                      className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">PDF File URL:</label>
                    <input
                      type="url"
                      value={pdfUrl}
                      onChange={(e) => setPdfUrl(e.target.value)}
                      placeholder="https://domain.com/file.pdf"
                      className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono"
                    />
                  </div>
                </div>
              )}

              {contentType === 'multi-url' && (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Multiple Links Tree:</span>
                  {multiLinks.map((link, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={link.title}
                        onChange={(e) => {
                          const updated = [...multiLinks];
                          updated[idx].title = e.target.value;
                          setMultiLinks(updated);
                        }}
                        placeholder="Link Label"
                        className="w-1/3 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                      />
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => {
                          const updated = [...multiLinks];
                          updated[idx].url = e.target.value;
                          setMultiLinks(updated);
                        }}
                        placeholder="https://..."
                        className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono"
                      />
                    </div>
                  ))}
                </div>
              )}

              {contentType === 'vcard' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">First Name:</label>
                      <input
                        type="text"
                        value={vFirstName}
                        onChange={(e) => setVFirstName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Last Name:</label>
                      <input
                        type="text"
                        value={vLastName}
                        onChange={(e) => setVLastName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Phone Number:</label>
                      <input
                        type="tel"
                        value={vPhone}
                        onChange={(e) => setVPhone(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Work Email:</label>
                      <input
                        type="email"
                        value={vEmail}
                        onChange={(e) => setVEmail(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {contentType === 'text' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Plain Text / Serial Code:</label>
                  <textarea
                    value={plainText}
                    onChange={(e) => setPlainText(e.target.value)}
                    rows={3}
                    className="w-full p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono outline-none resize-none"
                  />
                </div>
              )}

              {contentType === 'app' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Apple App Store Link:</label>
                    <input
                      type="url"
                      value={appStoreUrl}
                      onChange={(e) => setAppStoreUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Google Play Store Link:</label>
                    <input
                      type="url"
                      value={playStoreUrl}
                      onChange={(e) => setPlayStoreUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono"
                    />
                  </div>
                </div>
              )}

              {contentType === 'sms' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Recipient Number:</label>
                    <input
                      type="tel"
                      value={smsNum}
                      onChange={(e) => setSmsNum(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Preset SMS Text:</label>
                    <input
                      type="text"
                      value={smsBody}
                      onChange={(e) => setSmsBody(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                    />
                  </div>
                </div>
              )}

              {contentType === 'email' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Recipient Email:</label>
                    <input
                      type="email"
                      value={emailTo}
                      onChange={(e) => setEmailTo(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Subject:</label>
                    <input
                      type="text"
                      value={emailSub}
                      onChange={(e) => setEmailSub(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                    />
                  </div>
                </div>
              )}

              {contentType === 'phone' && (
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Phone Number to Call:</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                  />
                </div>
              )}

              {contentType === 'social' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Instagram Handle:</label>
                    <input
                      type="text"
                      value={socialInsta}
                      onChange={(e) => setSocialInsta(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">YouTube Channel:</label>
                    <input
                      type="text"
                      value={socialYoutube}
                      onChange={(e) => setSocialYoutube(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                    />
                  </div>
                </div>
              )}

              {contentType === 'wifi' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Network Name (SSID):</label>
                    <input
                      type="text"
                      value={wifiSsid}
                      onChange={(e) => setWifiSsid(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Password:</label>
                      <input
                        type="text"
                        value={wifiPass}
                        onChange={(e) => setWifiPass(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Encryption:</label>
                      <select
                        value={wifiType}
                        onChange={(e) => setWifiType(e.target.value as any)}
                        className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                      >
                        <option value="WPA">WPA/WPA2/WPA3</option>
                        <option value="WEP">WEP</option>
                        <option value="nopass">None</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {contentType === 'upi' && (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        UPI VPA / ID <span className="text-red-500">*</span>:
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. merchant@upi or 9876543210@paytm"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Payee Name:</label>
                      <input
                        type="text"
                        placeholder="e.g. Shop Name or Individual Name"
                        value={upiName}
                        onChange={(e) => setUpiName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                      />
                    </div>
                  </div>

                  {/* Payment Amount Field & Quick Presets */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Payment Amount (₹) <span className="text-slate-400 font-normal">(Optional - leave blank for any amount)</span>:
                      </label>
                      {upiAmount && (
                        <button
                          type="button"
                          onClick={() => setUpiAmount('')}
                          className="text-[10px] font-bold text-indigo-500 hover:underline"
                        >
                          Clear Amount
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          placeholder="Enter fixed amount or leave blank"
                          value={upiAmount}
                          onChange={(e) => setUpiAmount(e.target.value)}
                          className="w-full pl-7 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                        />
                      </div>
                    </div>

                    {/* Quick Preset Amount Buttons */}
                    <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1">
                      <span className="text-[10px] font-bold text-slate-400 flex-shrink-0">Presets:</span>
                      {[
                        { label: 'Any Amount', val: '' },
                        { label: '₹50', val: '50' },
                        { label: '₹100', val: '100' },
                        { label: '₹200', val: '200' },
                        { label: '₹500', val: '500' },
                        { label: '₹1000', val: '1000' },
                        { label: '₹2000', val: '2000' }
                      ].map((p) => (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => setUpiAmount(p.val)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition flex-shrink-0 ${
                            upiAmount === p.val
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-500'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Payment Remarks / Note */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Transaction Note / Remarks <span className="text-slate-400 font-normal">(Optional)</span>:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Order #1029 / Store Purchase / Bill Payment"
                      value={upiNote}
                      onChange={(e) => setUpiNote(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                    />
                  </div>

                  {/* Notice Banner */}
                  <div className="p-3 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 text-[11px] text-slate-400 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Works with Google Pay, PhonePe, Paytm, BHIM, Amazon Pay & all UPI payment apps.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Outer Frame Designer Section */}
            <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
              <span className="text-xs font-extrabold uppercase text-slate-400 block">Outer Frame Style & CTA Banner</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'none', label: 'No Frame' },
                  { id: 'bottom-banner', label: 'Bottom Banner' },
                  { id: 'top-badge', label: 'Top Badge' },
                  { id: 'card-frame', label: 'Card Frame' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFrameStyle(f.id as any)}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition ${
                      frameStyle === f.id
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {frameStyle !== 'none' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">Call-To-Action Text:</label>
                    <input
                      type="text"
                      value={frameText}
                      onChange={(e) => setFrameText(e.target.value)}
                      placeholder="SCAN ME"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">Frame Color:</label>
                    <input
                      type="color"
                      value={frameBgColor}
                      onChange={(e) => setFrameBgColor(e.target.value)}
                      className="w-full h-9 p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">Text Color:</label>
                    <input
                      type="color"
                      value={frameTextColor}
                      onChange={(e) => setFrameTextColor(e.target.value)}
                      className="w-full h-9 p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- TAB 2: STYLING & COLORS --- */}
        {activeTab === 'design' && (
          <div className="space-y-5 animate-fade-in">
            {/* Color Fill Mode */}
            <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
              <span className="text-xs font-extrabold uppercase text-slate-400 block">Foreground Fill Style</span>
              <div className="flex bg-slate-200 dark:bg-slate-900 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setFillType('solid')}
                  className={`flex-1 py-1.5 rounded-lg transition ${
                    fillType === 'solid' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Solid Color
                </button>
                <button
                  type="button"
                  onClick={() => setFillType('linear-grad')}
                  className={`flex-1 py-1.5 rounded-lg transition ${
                    fillType === 'linear-grad' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Linear Gradient
                </button>
                <button
                  type="button"
                  onClick={() => setFillType('radial-grad')}
                  className={`flex-1 py-1.5 rounded-lg transition ${
                    fillType === 'radial-grad' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Radial Gradient
                </button>
              </div>

              {/* Color Pickers Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Color 1 (Primary)</label>
                  <div className="flex items-center gap-2 p-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <input
                      type="color"
                      value={fgColor1}
                      onChange={(e) => setFgColor1(e.target.value)}
                      className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono font-bold uppercase">{fgColor1}</span>
                  </div>
                </div>

                {fillType !== 'solid' && (
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Color 2 (Gradient)</label>
                    <div className="flex items-center gap-2 p-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <input
                        type="color"
                        value={fgColor2}
                        onChange={(e) => setFgColor2(e.target.value)}
                        className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <span className="text-xs font-mono font-bold uppercase">{fgColor2}</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Eye Frame Color</label>
                  <div className="flex items-center gap-2 p-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <input
                      type="color"
                      value={eyeFrameColor}
                      onChange={(e) => setEyeFrameColor(e.target.value)}
                      className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono font-bold uppercase">{eyeFrameColor}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Background Color</label>
                  <div className="flex items-center gap-2 p-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <input
                      type="color"
                      value={bgColor === 'transparent' ? '#ffffff' : bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono font-bold uppercase">{bgColor}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dot Style & Eye Style Selectors */}
            <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
              <div>
                <span className="text-xs font-extrabold uppercase text-slate-400 block mb-2">Matrix Dot Pattern</span>
                <div className="grid grid-cols-5 gap-2 text-xs font-bold">
                  {[
                    { id: 'square', label: 'Square' },
                    { id: 'dots', label: 'Dots' },
                    { id: 'rounded', label: 'Rounded' },
                    { id: 'classy', label: 'Classy' },
                    { id: 'star', label: 'Stars' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setDotStyle(st.id as any)}
                      className={`py-2 rounded-xl border text-center transition ${
                        dotStyle === st.id
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-xs font-extrabold uppercase text-slate-400 block mb-2">Eye Frame Shape</span>
                  <div className="grid grid-cols-4 gap-1.5 text-xs font-bold">
                    {[
                      { id: 'square', label: 'Square' },
                      { id: 'circle', label: 'Circle' },
                      { id: 'rounded', label: 'Rounded' },
                      { id: 'leaf', label: 'Leaf' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setEyeFrameStyle(f.id as any)}
                        className={`py-2 rounded-xl border text-center transition ${
                          eyeFrameStyle === f.id
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-extrabold uppercase text-slate-400 block mb-2">Eye Ball Shape</span>
                  <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
                    {[
                      { id: 'square', label: 'Square' },
                      { id: 'circle', label: 'Circle' },
                      { id: 'diamond', label: 'Diamond' },
                    ].map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setEyeBallStyle(b.id as any)}
                        className={`py-2 rounded-xl border text-center transition ${
                          eyeBallStyle === b.id
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 3: CENTER LOGO OVERLAY --- */}
        {activeTab === 'logo' && (
          <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-5 animate-fade-in">
            <div className="space-y-2">
              <span className="text-xs font-extrabold text-slate-900 dark:text-white block">Upload Custom Logo / Image:</span>
              <div
                onClick={() => logoInputRef.current?.click()}
                className="p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 bg-white dark:bg-slate-900 text-center cursor-pointer transition"
              >
                <input
                  type="file"
                  ref={logoInputRef}
                  onChange={handleLogoUpload}
                  accept="image/*"
                  className="hidden"
                />
                <Upload className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {customLogoUrl ? 'Logo Uploaded! Click to change' : 'Click to Upload PNG / JPG Logo'}
                </p>
                {customLogoUrl && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCustomLogoUrl(null);
                    }}
                    className="mt-2 text-[11px] text-rose-500 font-bold hover:underline"
                  >
                    Remove Logo
                  </button>
                )}
              </div>
            </div>

            {/* Preset Icons Selection */}
            {!customLogoUrl && (
              <div className="space-y-2">
                <span className="text-xs font-extrabold uppercase text-slate-400 block">Or Select Preset Icon Overlay:</span>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {[
                    { id: 'none', label: 'None' },
                    { id: 'wifi', label: 'WiFi' },
                    { id: 'whatsapp', label: 'WhatsApp' },
                    { id: 'globe', label: 'Globe' },
                    { id: 'upi', label: 'UPI' },
                    { id: 'star', label: 'Star' },
                    { id: 'heart', label: 'Heart' },
                  ].map((ico) => (
                    <button
                      key={ico.id}
                      type="button"
                      onClick={() => setPresetLogoIcon(ico.id)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition ${
                        presetLogoIcon === ico.id
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {ico.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Logo Controls */}
            {(customLogoUrl || presetLogoIcon !== 'none') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Logo Size ({logoSizePercent}% of QR):
                  </label>
                  <input
                    type="range"
                    min={12}
                    max={28}
                    value={logoSizePercent}
                    onChange={(e) => setLogoSizePercent(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Logo Background Pad:
                  </label>
                  <div className="flex gap-2">
                    {['circle', 'square', 'transparent'].map((sh) => (
                      <button
                        key={sh}
                        type="button"
                        onClick={() => setLogoShape(sh as any)}
                        className={`flex-1 py-1.5 rounded-xl border text-xs font-bold capitalize transition ${
                          logoShape === sh
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {sh}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- TAB 4: PRESET DESIGNER THEMES --- */}
        {activeTab === 'presets' && (
          <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4 animate-fade-in">
            <div>
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">1-Click Designer Themes</h4>
              <p className="text-xs text-slate-500">Transform your QR code instantly with styled color palettes and dot patterns.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => applyPresetTheme('classic')}
                className="p-3.5 rounded-2xl bg-white border border-slate-300 text-left space-y-1 transition group hover:border-slate-900 shadow-sm"
              >
                <div className="w-full h-3 rounded-md bg-black" />
                <p className="text-xs font-extrabold text-slate-900">Standard B&W</p>
                <p className="text-[10px] text-slate-500">Normal QR • Square Dots</p>
              </button>

              <button
                type="button"
                onClick={() => applyPresetTheme('cyberpunk')}
                className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-400 text-left space-y-1 transition group"
              >
                <div className="w-full h-3 rounded-md bg-gradient-to-r from-cyan-400 to-pink-500" />
                <p className="text-xs font-extrabold text-white">Cyberpunk Neon</p>
                <p className="text-[10px] text-slate-400">Cyan & Pink • Circle Eyes</p>
              </button>

              <button
                type="button"
                onClick={() => applyPresetTheme('emerald')}
                className="p-3.5 rounded-2xl bg-emerald-950 border border-emerald-800 hover:border-emerald-400 text-left space-y-1 transition group"
              >
                <div className="w-full h-3 rounded-md bg-gradient-to-r from-emerald-400 to-teal-700" />
                <p className="text-xs font-extrabold text-white">Emerald Luxe</p>
                <p className="text-[10px] text-emerald-300">Mint Forest • Leaf Eyes</p>
              </button>

              <button
                type="button"
                onClick={() => applyPresetTheme('sunset')}
                className="p-3.5 rounded-2xl bg-slate-950 border border-amber-900/40 hover:border-amber-400 text-left space-y-1 transition group"
              >
                <div className="w-full h-3 rounded-md bg-gradient-to-r from-amber-400 to-rose-500" />
                <p className="text-xs font-extrabold text-white">Sunset Glow</p>
                <p className="text-[10px] text-slate-400">Amber & Rose • Star Dots</p>
              </button>

              <button
                type="button"
                onClick={() => applyPresetTheme('obsidian')}
                className="p-3.5 rounded-2xl bg-white border border-slate-200 text-left space-y-1 transition group"
              >
                <div className="w-full h-3 rounded-md bg-slate-900" />
                <p className="text-xs font-extrabold text-slate-900">Classic Obsidian</p>
                <p className="text-[10px] text-slate-500">Monochrome High-Contrast</p>
              </button>

              <button
                type="button"
                onClick={() => applyPresetTheme('ocean')}
                className="p-3.5 rounded-2xl bg-blue-950 border border-blue-800 hover:border-blue-400 text-left space-y-1 transition group"
              >
                <div className="w-full h-3 rounded-md bg-gradient-to-r from-blue-500 to-sky-400" />
                <p className="text-xs font-extrabold text-white">Royal Ocean</p>
                <p className="text-[10px] text-blue-300">Royal Sapphire • Dots</p>
              </button>

              <button
                type="button"
                onClick={() => applyPresetTheme('amethyst')}
                className="p-3.5 rounded-2xl bg-purple-950 border border-purple-800 hover:border-purple-400 text-left space-y-1 transition group"
              >
                <div className="w-full h-3 rounded-md bg-gradient-to-r from-purple-500 to-fuchsia-500" />
                <p className="text-xs font-extrabold text-white">Amethyst Dream</p>
                <p className="text-[10px] text-purple-300">Violet & Fuchsia • Smooth</p>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Preview & Export Panel (5 cols) */}
      <div className="lg:col-span-5 space-y-6 flex flex-col items-center">
        {/* Real-time Canvas Display Box */}
        <div className="w-full p-6 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center space-y-4 shadow-2xl relative overflow-hidden">
          <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-extrabold text-[11px] uppercase tracking-wider">
            Live Ultra HD Preview
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-inner flex items-center justify-center">
            <canvas ref={mainCanvasRef} className="max-w-full h-auto max-h-[300px] object-contain rounded-xl shadow-lg" />
          </div>

          {/* Quick Technical Summary Badge */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] font-mono text-slate-400">
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 uppercase">
              Mode: {contentType}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
              EC Level: {errorCorrection}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
              Dots: {dotStyle}
            </span>
          </div>

          {/* Encoded Data & Target Link Preview */}
          <div className="w-full p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center justify-between gap-2 overflow-hidden">
            <span className="text-slate-500 font-bold flex-shrink-0">Encoded:</span>
            <span className="truncate font-medium text-indigo-400" title={getRawContentString()}>
              {getRawContentString()}
            </span>
            {getRawContentString().startsWith('http') && (
              <a
                href={getRawContentString()}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-lg bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600 hover:text-white transition text-[10px] font-bold flex-shrink-0 flex items-center gap-1 border border-indigo-500/30"
              >
                <Globe className="w-3 h-3" />
                <span>Test Link</span>
              </a>
            )}
          </div>
        </div>

        {/* High Resolution Export Action Buttons */}
        <div className="w-full space-y-2.5">
          <button
            type="button"
            onClick={handleDownloadPng}
            className="w-full py-3.5 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition"
          >
            <Download className="w-4 h-4" />
            <span>Download High-Res PNG (HD)</span>
          </button>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={handleDownloadSvg}
              className="py-2.5 px-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-800 transition"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-500" />
              <span>SVG Vector</span>
            </button>

            <button
              type="button"
              onClick={handleCopyImage}
              className="py-2.5 px-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-800 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-pink-500" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!mainCanvasRef.current) return;
                const dataUrl = mainCanvasRef.current.toDataURL('image/png');
                const printWindow = window.open('', '_blank');
                if (printWindow) {
                  printWindow.document.write(`
                    <html>
                      <head><title>Print QR Code</title></head>
                      <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;">
                        <img src="${dataUrl}" style="max-width:80%;max-height:80vh;" />
                        <script>window.onload = function() { window.print(); window.close(); }</script>
                      </body>
                    </html>
                  `);
                  printWindow.document.close();
                }
              }}
              className="py-2.5 px-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-800 transition"
            >
              <Printer className="w-3.5 h-3.5 text-amber-500" />
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- ADVANCED QR & BARCODE IMAGE SCANNER COMPONENT ---
const AdvancedQrScanner: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'camera' | 'presets' | 'history'>('upload');
  
  // Scanned Results
  const [currentResult, setCurrentResult] = useState<ParsedQrResult | null>(null);
  const [scanHistory, setScanHistory] = useState<ParsedQrResult[]>(() => {
    try {
      const saved = localStorage.getItem('qr_scan_history_hub');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Settings & Toggles
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [invertColors, setInvertColors] = useState<boolean>(false);
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Camera State
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);

  // File Upload State
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('qr_scan_history_hub', JSON.stringify(scanHistory.slice(0, 50)));
    } catch {}
  }, [scanHistory]);

  const addResultToHistory = (res: ParsedQrResult) => {
    setCurrentResult(res);
    if (soundEnabled) playBeep();
    setScanHistory((prev) => {
      // Avoid duplicate consecutive scans
      if (prev.length > 0 && prev[0].raw === res.raw) return prev;
      return [res, ...prev];
    });
  };

  // --- CAMERA WEBCAM SCANNING LOOP ---
  useEffect(() => {
    let stream: MediaStream | null = null;

    if (activeTab === 'camera' && isCameraActive) {
      navigator.mediaDevices
        .getUserMedia({
          video: { facingMode: cameraFacing, width: { ideal: 1280 }, height: { ideal: 720 } }
        })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
          setCameraError(null);
          scanCameraFrame();
        })
        .catch((err) => {
          setCameraError(`Camera access failed: ${err.message || 'Permission denied or no camera found.'}`);
          setIsCameraActive(false);
        });
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [activeTab, isCameraActive, cameraFacing]);

  const scanCameraFrame = () => {
    if (!videoRef.current || !cameraCanvasRef.current) return;

    const video = videoRef.current;
    const canvas = cameraCanvasRef.current;
    const ctx = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Pass 1: Standard jsQR
      let code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'attemptBoth'
      });

      if (code && code.data) {
        const parsed = parseQrContent(code.data, 'QR Code');
        addResultToHistory(parsed);
      }
    }

    animFrameRef.current = requestAnimationFrame(scanCameraFrame);
  };

  // --- FILE IMAGE SCANNING FUNCTION ---
  const processUploadedImage = (src: string) => {
    setUploadedImage(src);
    setScanStatus('Scanning image for QR / Barcode...');

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = async () => {
      const canvas = fileCanvasRef.current || document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      let imageData = ctx.getImageData(0, 0, img.width, img.height);

      // Preprocessing: High Contrast / Invert
      if (highContrast || invertColors) {
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          let r = data[i];
          let g = data[i + 1];
          let b = data[i + 2];
          let avg = (r + g + b) / 3;

          if (highContrast) {
            avg = avg > 128 ? 255 : 0;
            r = avg;
            g = avg;
            b = avg;
          }

          if (invertColors) {
            r = 255 - r;
            g = 255 - g;
            b = 255 - b;
          }

          data[i] = r;
          data[i + 1] = g;
          data[i + 2] = b;
        }
        ctx.putImageData(imageData, 0, 0);
      }

      // 1. Scan with jsQR
      let code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'attemptBoth'
      });

      if (code && code.data) {
        // Draw bounding box on canvas
        const loc = code.location;
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(loc.topLeftCorner.x, loc.topLeftCorner.y);
        ctx.lineTo(loc.topRightCorner.x, loc.topRightCorner.y);
        ctx.lineTo(loc.bottomRightCorner.x, loc.bottomRightCorner.y);
        ctx.lineTo(loc.bottomLeftCorner.x, loc.bottomLeftCorner.y);
        ctx.closePath();
        ctx.stroke();

        const parsed = parseQrContent(code.data, 'QR Code');
        addResultToHistory(parsed);
        setScanStatus('Successfully detected QR Code!');
        return;
      }

      // 2. Scan with Native BarcodeDetector API if available
      if ('BarcodeDetector' in window) {
        try {
          const detector = new (window as any).BarcodeDetector({
            formats: ['qr_code', 'ean_13', 'ean_8', 'code_128', 'code_39', 'upc_a', 'upc_e', 'data_matrix', 'pdf417']
          });
          const barcodes = await detector.detect(canvas);
          if (barcodes && barcodes.length > 0) {
            const b = barcodes[0];
            const parsed = parseQrContent(b.rawValue, b.format || 'Barcode');
            addResultToHistory(parsed);
            setScanStatus(`Successfully detected ${b.format || 'Barcode'}!`);
            return;
          }
        } catch {}
      }

      setScanStatus('No QR code or Barcode detected in this image. Try enabling High Contrast or Invert Colors.');
    };
    img.src = src;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          processUploadedImage(evt.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // --- GENERATE SAMPLE DEMO PRESETS ---
  const loadPresetSample = (presetType: 'wifi' | 'vcard' | 'url' | 'upi' | 'text') => {
    setActiveTab('presets');
    let sampleRaw = '';
    if (presetType === 'wifi') sampleRaw = 'WIFI:S:SuperHub_5G;T:WPA;P:HubGuestPass2026;;';
    else if (presetType === 'vcard') sampleRaw = 'BEGIN:VCARD\nVERSION:3.0\nFN:Alex AI Developer\nTEL:+18005550199\nEMAIL:alex@ai.studio\nORG:AI Studio Hub\nEND:VCARD';
    else if (presetType === 'url') sampleRaw = 'https://ai.studio/build';
    else if (presetType === 'upi') sampleRaw = 'upi://pay?pa=superhub@bank&pn=SuperHub+Store&am=250.00&cu=INR';
    else sampleRaw = 'ORDER-CONFIRMATION-#99281-APPROVED';

    const parsed = parseQrContent(sampleRaw, 'Demo QR');
    addResultToHistory(parsed);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadVCard = (vcardText: string) => {
    const blob = new Blob([vcardText], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contact.vcf';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportHistory = (format: 'csv' | 'json') => {
    if (scanHistory.length === 0) return;
    let content = '';
    let filename = `qr_scan_history.${format}`;
    let mime = 'text/plain';

    if (format === 'json') {
      content = JSON.stringify(scanHistory, null, 2);
      mime = 'application/json';
    } else {
      content = 'Time,Type,Format,Raw Content\n' +
        scanHistory.map((h) => `"${h.timestamp}","${h.type}","${h.format}","${h.raw.replace(/"/g, '""')}"`).join('\n');
      mime = 'text/csv';
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Mode Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
        <div className="flex bg-slate-200 dark:bg-slate-900 p-1 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition ${
              activeTab === 'upload' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Image</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('camera');
              setIsCameraActive(true);
            }}
            className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition ${
              activeTab === 'camera' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Live Webcam</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition ${
              activeTab === 'presets' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Presets</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition ${
              activeTab === 'history' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History ({scanHistory.length})</span>
          </button>
        </div>

        {/* Audio Toggle */}
        <button
          type="button"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
            soundEnabled
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-500 border-transparent'
          }`}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span>{soundEnabled ? 'Beep On' : 'Beep Off'}</span>
        </button>
      </div>

      {/* --- TAB 1: FILE UPLOAD & CANVAS DECODER --- */}
      {activeTab === 'upload' && (
        <div className="space-y-6">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="p-10 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 bg-slate-50 dark:bg-slate-950/40 text-center cursor-pointer transition group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <QrCode className="w-12 h-12 text-indigo-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-extrabold text-slate-900 dark:text-white">
              Click or Drag & Drop QR / Barcode Image
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Supports PNG, JPG, WEBP, GIF, SVG • Auto-detects URLs, WiFi, contacts & barcodes
            </p>
          </div>

          {/* Preprocessing Toggles */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
            <span className="text-[11px] font-extrabold uppercase text-slate-400">Scan Enhancement:</span>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={highContrast}
                  onChange={(e) => {
                    setHighContrast(e.target.checked);
                    if (uploadedImage) processUploadedImage(uploadedImage);
                  }}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                High Contrast / Thresholding
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={invertColors}
                  onChange={(e) => {
                    setInvertColors(e.target.checked);
                    if (uploadedImage) processUploadedImage(uploadedImage);
                  }}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                Invert Colors (White Code on Black BG)
              </label>
            </div>
          </div>

          {/* Uploaded Canvas & Status Banner */}
          {uploadedImage && (
            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col items-center">
              <div className="flex items-center justify-between w-full text-xs font-bold text-slate-300 pb-2 border-b border-slate-800">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {scanStatus}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setUploadedImage(null);
                    setCurrentResult(null);
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  Clear Image
                </button>
              </div>
              <canvas ref={fileCanvasRef} className="max-h-[300px] object-contain rounded-xl border border-slate-800 shadow" />
            </div>
          )}
        </div>
      )}

      {/* --- TAB 2: LIVE WEBCAM SCANNER --- */}
      {activeTab === 'camera' && (
        <div className="space-y-4">
          <div className="relative w-full aspect-video bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center">
            {isCameraActive ? (
              <>
                <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                <canvas ref={cameraCanvasRef} className="hidden" />

                {/* Animated Scanner Reticle Overlay */}
                <div className="absolute inset-0 border-2 border-indigo-500/30 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-64 border-2 border-emerald-400 rounded-3xl relative animate-pulse shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-xl" />
                    <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent absolute top-1/2 -translate-y-1/2 animate-bounce" />
                  </div>
                </div>

                {/* Camera Status Badge */}
                <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Live Camera Feed Active
                </div>
              </>
            ) : (
              <div className="text-center p-6 space-y-3">
                <CameraOff className="w-12 h-12 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400 font-bold">Webcam is currently turned off</p>
                <button
                  type="button"
                  onClick={() => setIsCameraActive(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow transition"
                >
                  Start Live Camera Scanner
                </button>
              </div>
            )}
          </div>

          {cameraError && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{cameraError}</span>
            </div>
          )}

          {isCameraActive && (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setCameraFacing(cameraFacing === 'environment' ? 'user' : 'environment')}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                🔄 Switch Camera ({cameraFacing === 'environment' ? 'Back' : 'Front'})
              </button>
              <button
                type="button"
                onClick={() => setIsCameraActive(false)}
                className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-600 font-bold text-xs hover:bg-rose-500/20 transition"
              >
                Stop Webcam
              </button>
            </div>
          )}
        </div>
      )}

      {/* --- TAB 3: DEMO SAMPLE PRESETS --- */}
      {activeTab === 'presets' && (
        <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
          <div>
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Instant Sample QR Presets
            </h4>
            <p className="text-xs text-slate-500">
              Click any sample below to simulate scanning formatted QR codes instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => loadPresetSample('wifi')}
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-left space-y-1 transition group shadow-sm"
            >
              <div className="flex items-center gap-2 text-indigo-500 font-extrabold text-xs">
                <Wifi className="w-4 h-4" />
                <span>WiFi Network QR</span>
              </div>
              <p className="text-[11px] text-slate-500">SSID: SuperHub_5G (WPA2)</p>
            </button>

            <button
              type="button"
              onClick={() => loadPresetSample('vcard')}
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-left space-y-1 transition group shadow-sm"
            >
              <div className="flex items-center gap-2 text-purple-500 font-extrabold text-xs">
                <User className="w-4 h-4" />
                <span>vCard Contact Info</span>
              </div>
              <p className="text-[11px] text-slate-500">Alex AI Developer (AI Studio)</p>
            </button>

            <button
              type="button"
              onClick={() => loadPresetSample('url')}
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-left space-y-1 transition group shadow-sm"
            >
              <div className="flex items-center gap-2 text-emerald-500 font-extrabold text-xs">
                <ExternalLink className="w-4 h-4" />
                <span>Website Link</span>
              </div>
              <p className="text-[11px] text-slate-500">https://ai.studio/build</p>
            </button>

            <button
              type="button"
              onClick={() => loadPresetSample('upi')}
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-left space-y-1 transition group shadow-sm"
            >
              <div className="flex items-center gap-2 text-amber-500 font-extrabold text-xs">
                <CreditCard className="w-4 h-4" />
                <span>UPI Payment QR</span>
              </div>
              <p className="text-[11px] text-slate-500">Payee: superhub@bank (₹250.00)</p>
            </button>

            <button
              type="button"
              onClick={() => loadPresetSample('text')}
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-left space-y-1 transition group shadow-sm"
            >
              <div className="flex items-center gap-2 text-slate-500 font-extrabold text-xs">
                <FileText className="w-4 h-4" />
                <span>Barcode / Serial Code</span>
              </div>
              <p className="text-[11px] text-slate-500">ORDER-CONFIRMATION-#99281</p>
            </button>
          </div>
        </div>
      )}

      {/* --- TAB 4: SCAN HISTORY --- */}
      {activeTab === 'history' && (
        <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-500" />
              Scan History ({scanHistory.length} Saved)
            </h4>
            {scanHistory.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleExportHistory('csv')}
                  className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-300 transition"
                >
                  Export CSV
                </button>
                <button
                  type="button"
                  onClick={() => handleExportHistory('json')}
                  className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-300 transition"
                >
                  Export JSON
                </button>
                <button
                  type="button"
                  onClick={() => setScanHistory([])}
                  className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 font-bold text-xs hover:bg-rose-500/20 transition flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear
                </button>
              </div>
            )}
          </div>

          {scanHistory.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No scans recorded yet. Upload an image or start camera to scan!</p>
          ) : (
            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
              {scanHistory.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setCurrentResult(item)}
                  className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 cursor-pointer flex items-center justify-between text-xs transition"
                >
                  <div className="flex items-center gap-2.5 truncate mr-2">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 font-extrabold uppercase text-[10px]">
                      {item.type}
                    </span>
                    <span className="font-mono text-slate-800 dark:text-slate-200 truncate">{item.raw}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">{item.timestamp}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- SCANNED RESULT ACTION CARD --- */}
      {currentResult && (
        <div className="p-6 rounded-3xl bg-slate-950 text-white border border-slate-800 space-y-4 shadow-2xl animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 font-extrabold uppercase text-xs border border-emerald-500/30">
                {currentResult.type} Detected
              </span>
              <span className="text-xs text-slate-400 font-mono">Format: {currentResult.format}</span>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(currentResult.raw)}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Raw' : 'Copy Content'}</span>
            </button>
          </div>

          {/* Type-Specific Smart Cards */}
          {currentResult.type === 'url' && (
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  {currentResult.data.isHttps === 'true' ? 'Secure HTTPS URL' : 'HTTP Web URL'}
                </span>
                <span className="text-xs font-mono text-indigo-400 font-bold">{currentResult.data.domain}</span>
              </div>
              <p className="text-sm font-mono text-white break-all">{currentResult.data.url}</p>
              <a
                href={currentResult.data.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition"
              >
                <span>Open URL in New Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {currentResult.type === 'wifi' && (
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                  <Wifi className="w-4 h-4" />
                  WiFi Network Credentials
                </span>
                <span className="text-xs font-mono text-slate-400">{currentResult.data.encryption}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-sans">Network Name (SSID)</span>
                  <p className="font-bold text-white text-sm">{currentResult.data.ssid}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-sans">Password</span>
                  <p className="font-bold text-emerald-400 text-sm">{currentResult.data.password}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(currentResult.data.password)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center gap-1.5 transition"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy WiFi Password</span>
              </button>
            </div>
          )}

          {currentResult.type === 'vcard' && (
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
                <User className="w-4 h-4" />
                <span>Contact Card (vCard)</span>
              </div>
              <div className="space-y-1">
                <h5 className="text-base font-extrabold text-white">{currentResult.data.name}</h5>
                {currentResult.data.title && <p className="text-xs text-slate-400">{currentResult.data.title} • {currentResult.data.org}</p>}
                {currentResult.data.phone && <p className="text-xs font-mono text-emerald-400">📞 {currentResult.data.phone}</p>}
                {currentResult.data.email && <p className="text-xs font-mono text-indigo-400">✉️ {currentResult.data.email}</p>}
              </div>
              <button
                type="button"
                onClick={() => handleDownloadVCard(currentResult.raw)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Contact (.vcf)</span>
              </button>
            </div>
          )}

          {currentResult.type === 'upi' && (
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <CreditCard className="w-4 h-4" />
                <span>UPI Payment Details</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Payee ID</span>
                  <p className="font-bold text-white">{currentResult.data.payeeId}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Amount</span>
                  <p className="font-bold text-emerald-400">{currentResult.data.amount ? `${currentResult.data.currency} ${currentResult.data.amount}` : 'Any'}</p>
                </div>
              </div>
              <a
                href={currentResult.raw}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs transition"
              >
                <span>Open in Payment App</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {currentResult.type === 'text' && (
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-500">Decoded Text Data ({currentResult.data.length} chars)</span>
              <p className="text-xs font-mono text-slate-200 whitespace-pre-wrap break-all leading-relaxed">
                {currentResult.raw}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- ADVANCED AI BACKGROUND MASK & ERASER STUDIO COMPONENT ---
const createSamplePortrait = (): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
    <rect width="600" height="600" fill="#FFFFFF"/>
    <circle cx="300" cy="220" r="100" fill="#2563EB"/>
    <path d="M 160 520 C 160 380, 440 380, 440 520 Z" fill="#1E40AF"/>
    <circle cx="270" cy="200" r="14" fill="#FFFFFF"/>
    <circle cx="330" cy="200" r="14" fill="#FFFFFF"/>
    <path d="M 260 250 Q 300 280 340 250" stroke="#FFFFFF" stroke-width="8" fill="none" stroke-linecap="round"/>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const createSampleProduct = (): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
    <rect width="600" height="600" fill="#F8FAFC"/>
    <ellipse cx="300" cy="480" rx="180" ry="30" fill="#CBD5E1"/>
    <path d="M 150 420 Q 220 280 340 300 Q 420 310 460 360 Q 480 390 420 420 Q 280 430 150 420 Z" fill="#EF4444"/>
    <path d="M 200 370 Q 280 320 360 350" stroke="#FFFFFF" stroke-width="12" fill="none"/>
    <circle cx="360" cy="350" r="24" fill="#F59E0B"/>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const createSampleChromaKey = (): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
    <rect width="600" height="600" fill="#00FF00"/>
    <polygon points="300,100 380,260 560,280 420,400 460,580 300,480 140,580 180,400 40,280 220,260" fill="#8B5CF6" stroke="#4C1D95" stroke-width="8"/>
    <circle cx="300" cy="340" r="60" fill="#FDE047"/>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const AdvancedBgEraserAndMask: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string>(() => createSamplePortrait());
  const [activeTab, setActiveTab] = useState<'auto-key' | 'brush-eraser' | 'bg-studio' | 'inspection'>('auto-key');

  // Auto-Key Parameters
  const [keyColor, setKeyColor] = useState<string>('#FFFFFF');
  const [tolerance, setTolerance] = useState<number>(35);
  const [feather, setFeather] = useState<number>(2);
  const [invertMask, setInvertMask] = useState<boolean>(false);
  const [eyedropperActive, setEyedropperActive] = useState<boolean>(false);

  // Brush Eraser Parameters
  const [brushType, setBrushType] = useState<'erase' | 'restore' | 'wand'>('erase');
  const [brushSize, setBrushSize] = useState<number>(30);
  const [brushHardness, setBrushHardness] = useState<number>(80);
  const [zoom, setZoom] = useState<number>(1);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  // Undo / Redo Stack
  const [undoStack, setUndoStack] = useState<ImageData[]>([]);
  const [redoStack, setRedoStack] = useState<ImageData[]>([]);

  // Background Studio Parameters
  const [bgType, setBgType] = useState<'transparent' | 'solid' | 'gradient' | 'backdrop'>('transparent');
  const [bgColor, setBgColor] = useState<string>('#FFFFFF');
  const [bgGradient, setBgGradient] = useState<'sunset' | 'cyber' | 'studio' | 'golden' | 'space'>('studio');
  const [backdropPreset, setBackdropPreset] = useState<'office' | 'marble' | 'spotlight' | 'bokeh'>('spotlight');
  
  // Studio Shadow Parameters
  const [shadowEnabled, setShadowEnabled] = useState<boolean>(false);
  const [shadowOffsetY, setShadowOffsetY] = useState<number>(12);
  const [shadowBlur, setShadowBlur] = useState<number>(20);
  const [shadowOpacity, setShadowOpacity] = useState<number>(40);

  // View Mode
  const [viewMode, setViewMode] = useState<'composite' | 'alpha' | 'overlay' | 'split'>('composite');
  const [splitPos, setSplitPos] = useState<number>(50);
  const [copied, setCopied] = useState<boolean>(false);

  // Canvas Refs
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const origCanvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Image onto Original Canvas and Generate Initial Mask
  useEffect(() => {
    if (!imageSrc) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // 1. Setup Original Canvas
      const origCanvas = origCanvasRef.current || document.createElement('canvas');
      origCanvas.width = img.width;
      origCanvas.height = img.height;
      origCanvasRef.current = origCanvas;

      const origCtx = origCanvas.getContext('2d');
      if (!origCtx) return;
      origCtx.drawImage(img, 0, 0);

      // 2. Setup Mask Canvas
      const maskCanvas = maskCanvasRef.current || document.createElement('canvas');
      maskCanvas.width = img.width;
      maskCanvas.height = img.height;
      maskCanvasRef.current = maskCanvas;

      // Reset Undo/Redo Stacks
      setUndoStack([]);
      setRedoStack([]);

      // Auto Generate Keying Mask
      generateAutoKeyMask();
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Re-generate Auto Keying Mask whenever Auto-Key parameters change
  useEffect(() => {
    if (origCanvasRef.current && maskCanvasRef.current) {
      generateAutoKeyMask();
    }
  }, [keyColor, tolerance, feather, invertMask]);

  // Re-render composite whenever background, shadow, or view mode changes
  useEffect(() => {
    renderComposite();
  }, [bgType, bgColor, bgGradient, backdropPreset, shadowEnabled, shadowOffsetY, shadowBlur, shadowOpacity, viewMode, splitPos]);

  // Auto-Key Mask Generator
  const generateAutoKeyMask = () => {
    if (!origCanvasRef.current || !maskCanvasRef.current) return;
    const origCtx = origCanvasRef.current.getContext('2d');
    const maskCtx = maskCanvasRef.current.getContext('2d');
    if (!origCtx || !maskCtx) return;

    const w = origCanvasRef.current.width;
    const h = origCanvasRef.current.height;

    const imgData = origCtx.getImageData(0, 0, w, h);
    const data = imgData.data;

    const maskData = maskCtx.createImageData(w, h);
    const mData = maskData.data;

    const keyR = parseInt(keyColor.slice(1, 3), 16) || 255;
    const keyG = parseInt(keyColor.slice(3, 5), 16) || 255;
    const keyB = parseInt(keyColor.slice(5, 7), 16) || 255;

    const maxDist = (tolerance / 100) * 441.67;
    const featherDist = (feather / 100) * 100;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const dist = Math.sqrt((r - keyR) ** 2 + (g - keyG) ** 2 + (b - keyB) ** 2);

      let alphaVal = 255; // Keep
      if (dist <= maxDist) {
        alphaVal = 0; // Erase
      } else if (dist <= maxDist + featherDist && featherDist > 0) {
        const factor = (dist - maxDist) / featherDist;
        alphaVal = Math.round(factor * 255);
      }

      if (invertMask) {
        alphaVal = 255 - alphaVal;
      }

      mData[i] = alphaVal;
      mData[i + 1] = alphaVal;
      mData[i + 2] = alphaVal;
      mData[i + 3] = 255;
    }

    maskCtx.putImageData(maskData, 0, 0);
    renderComposite();
  };

  // Render Final Composite Canvas
  const renderComposite = () => {
    if (!displayCanvasRef.current || !origCanvasRef.current || !maskCanvasRef.current) return;
    const canvas = displayCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const origCtx = origCanvasRef.current.getContext('2d');
    const maskCtx = maskCanvasRef.current.getContext('2d');
    if (!ctx || !origCtx || !maskCtx) return;

    const w = origCanvasRef.current.width;
    const h = origCanvasRef.current.height;
    canvas.width = w;
    canvas.height = h;

    ctx.clearRect(0, 0, w, h);

    const origData = origCtx.getImageData(0, 0, w, h);
    const maskData = maskCtx.getImageData(0, 0, w, h);

    // 1. Draw Background
    if (bgType === 'solid') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, w, h);
    } else if (bgType === 'gradient') {
      let grad = ctx.createLinearGradient(0, 0, w, h);
      if (bgGradient === 'sunset') {
        grad.addColorStop(0, '#ff7e5f');
        grad.addColorStop(1, '#feb47b');
      } else if (bgGradient === 'cyber') {
        grad.addColorStop(0, '#0f0c29');
        grad.addColorStop(0.5, '#302b63');
        grad.addColorStop(1, '#24243e');
      } else if (bgGradient === 'studio') {
        grad = ctx.createRadialGradient(w / 2, h / 2, 50, w / 2, h / 2, Math.max(w, h));
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(1, '#94a3b8');
      } else if (bgGradient === 'golden') {
        grad.addColorStop(0, '#ffe000');
        grad.addColorStop(1, '#799f0c');
      } else {
        grad.addColorStop(0, '#0f172a');
        grad.addColorStop(1, '#1e1b4b');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    } else if (bgType === 'backdrop') {
      // Procedural Studio Backdrops
      if (backdropPreset === 'spotlight') {
        const grad = ctx.createRadialGradient(w / 2, h / 3, 20, w / 2, h / 2, w);
        grad.addColorStop(0, '#38bdf8');
        grad.addColorStop(0.6, '#0369a1');
        grad.addColorStop(1, '#0f172a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      } else if (backdropPreset === 'office') {
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(0, h * 0.7, w, h * 0.3);
      } else if (backdropPreset === 'marble') {
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, h * 0.3);
        ctx.bezierCurveTo(w * 0.3, h * 0.1, w * 0.7, h * 0.5, w, h * 0.2);
        ctx.stroke();
      } else {
        // Bokeh
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, w, h);
        const colors = ['rgba(99,102,241,0.3)', 'rgba(236,72,153,0.3)', 'rgba(16,185,129,0.3)'];
        [
          { x: w * 0.2, y: h * 0.3, r: 80, c: colors[0] },
          { x: w * 0.8, y: h * 0.2, r: 100, c: colors[1] },
          { x: w * 0.5, y: h * 0.7, r: 120, c: colors[2] }
        ].forEach((b) => {
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
          ctx.fillStyle = b.c;
          ctx.fill();
        });
      }
    }

    // 2. Prepare Masked Subject ImageData
    const resultData = ctx.createImageData(w, h);
    const rD = resultData.data;
    const oD = origData.data;
    const mD = maskData.data;

    for (let i = 0; i < oD.length; i += 4) {
      rD[i] = oD[i];
      rD[i + 1] = oD[i + 1];
      rD[i + 2] = oD[i + 2];
      const alphaFactor = mD[i] / 255;
      rD[i + 3] = Math.round((oD[i + 3] / 255) * alphaFactor * 255);
    }

    // Drop Shadow Effect
    if (shadowEnabled) {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = w;
      tempCanvas.height = h;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) {
        tempCtx.putImageData(resultData, 0, 0);
        ctx.save();
        ctx.shadowColor = `rgba(0, 0, 0, ${shadowOpacity / 100})`;
        ctx.shadowOffsetY = shadowOffsetY;
        ctx.shadowBlur = shadowBlur;
        ctx.drawImage(tempCanvas, 0, 0);
        ctx.restore();
      }
    }

    // Render Subject
    const tempCanvas2 = document.createElement('canvas');
    tempCanvas2.width = w;
    tempCanvas2.height = h;
    const tempCtx2 = tempCanvas2.getContext('2d');
    if (tempCtx2) {
      tempCtx2.putImageData(resultData, 0, 0);
      ctx.drawImage(tempCanvas2, 0, 0);
    }

    // 3. Apply View Mode Overlays
    if (viewMode === 'alpha') {
      ctx.putImageData(maskData, 0, 0);
    } else if (viewMode === 'overlay') {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.45)';
      for (let y = 0; y < h; y += 4) {
        for (let x = 0; x < w; x += 4) {
          const idx = (y * w + x) * 4;
          if (mD[idx] < 128) {
            ctx.fillRect(x, y, 4, 4);
          }
        }
      }
    } else if (viewMode === 'split') {
      const splitX = Math.round((splitPos / 100) * w);
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, splitX, h);
      ctx.clip();
      ctx.putImageData(origData, 0, 0);
      ctx.restore();

      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(splitX, 0);
      ctx.lineTo(splitX, h);
      ctx.stroke();
    }
  };

  // Push State to Undo History
  const pushUndoState = () => {
    if (!maskCanvasRef.current) return;
    const maskCtx = maskCanvasRef.current.getContext('2d');
    if (!maskCtx) return;

    const snapshot = maskCtx.getImageData(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);
    setUndoStack((prev) => [...prev.slice(-15), snapshot]);
    setRedoStack([]);
  };

  const handleUndo = () => {
    if (undoStack.length === 0 || !maskCanvasRef.current) return;
    const maskCtx = maskCanvasRef.current.getContext('2d');
    if (!maskCtx) return;

    const currentSnapshot = maskCtx.getImageData(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);
    setRedoStack((prev) => [...prev, currentSnapshot]);

    const lastState = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    maskCtx.putImageData(lastState, 0, 0);
    renderComposite();
  };

  const handleRedo = () => {
    if (redoStack.length === 0 || !maskCanvasRef.current) return;
    const maskCtx = maskCanvasRef.current.getContext('2d');
    if (!maskCtx) return;

    const currentSnapshot = maskCtx.getImageData(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);
    setUndoStack((prev) => [...prev, currentSnapshot]);

    const nextState = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    maskCtx.putImageData(nextState, 0, 0);
    renderComposite();
  };

  // Get Canvas Mouse/Touch Coordinates
  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent) => {
    if (!displayCanvasRef.current) return { x: 0, y: 0 };
    const rect = displayCanvasRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const scaleX = displayCanvasRef.current.width / rect.width;
    const scaleY = displayCanvasRef.current.height / rect.height;

    return {
      x: Math.round((clientX - rect.left) * scaleX),
      y: Math.round((clientY - rect.top) * scaleY)
    };
  };

  // Canvas Mouse / Touch Handlers
  const handleCanvasMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    const coords = getCanvasCoords(e);

    // Eyedropper Mode
    if (eyedropperActive) {
      if (!origCanvasRef.current) return;
      const origCtx = origCanvasRef.current.getContext('2d');
      if (!origCtx) return;
      const pixel = origCtx.getImageData(coords.x, coords.y, 1, 1).data;
      const hex = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1)}`;
      setKeyColor(hex.toUpperCase());
      setEyedropperActive(false);
      return;
    }

    // Magic Wand Selection Mode
    if (activeTab === 'brush-eraser' && brushType === 'wand') {
      if (!origCanvasRef.current || !maskCanvasRef.current) return;
      pushUndoState();

      const origCtx = origCanvasRef.current.getContext('2d');
      const maskCtx = maskCanvasRef.current.getContext('2d');
      if (!origCtx || !maskCtx) return;

      const w = origCanvasRef.current.width;
      const h = origCanvasRef.current.height;
      const imgData = origCtx.getImageData(0, 0, w, h);
      const maskData = maskCtx.getImageData(0, 0, w, h);

      const targetPixelIdx = (coords.y * w + coords.x) * 4;
      const tR = imgData.data[targetPixelIdx];
      const tG = imgData.data[targetPixelIdx + 1];
      const tB = imgData.data[targetPixelIdx + 2];

      const maxD = (tolerance / 100) * 441.67;

      // Flood Select Connected Pixels
      const visited = new Uint8Array(w * h);
      const queue = [coords.y * w + coords.x];
      visited[coords.y * w + coords.x] = 1;

      while (queue.length > 0) {
        const curr = queue.pop()!;
        const cx = curr % w;
        const cy = Math.floor(curr / w);

        const idx = curr * 4;
        maskData.data[idx] = 0; // Erase
        maskData.data[idx + 1] = 0;
        maskData.data[idx + 2] = 0;

        // Check 4 neighbors
        const neighbors = [
          { x: cx + 1, y: cy },
          { x: cx - 1, y: cy },
          { x: cx, y: cy + 1 },
          { x: cx, y: cy - 1 }
        ];

        for (const n of neighbors) {
          if (n.x >= 0 && n.x < w && n.y >= 0 && n.y < h) {
            const nPos = n.y * w + n.x;
            if (!visited[nPos]) {
              visited[nPos] = 1;
              const nIdx = nPos * 4;
              const dist = Math.sqrt(
                (imgData.data[nIdx] - tR) ** 2 +
                (imgData.data[nIdx + 1] - tG) ** 2 +
                (imgData.data[nIdx + 2] - tB) ** 2
              );
              if (dist <= maxD) {
                queue.push(nPos);
              }
            }
          }
        }
      }

      maskCtx.putImageData(maskData, 0, 0);
      renderComposite();
      return;
    }

    // Brush Mode
    if (activeTab === 'brush-eraser') {
      pushUndoState();
      setIsDrawing(true);
      drawBrushStroke(coords.x, coords.y);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || activeTab !== 'brush-eraser') return;
    const coords = getCanvasCoords(e);
    drawBrushStroke(coords.x, coords.y);
  };

  const handleCanvasMouseUp = () => {
    setIsDrawing(false);
  };

  const drawBrushStroke = (x: number, y: number) => {
    if (!maskCanvasRef.current) return;
    const maskCtx = maskCanvasRef.current.getContext('2d');
    if (!maskCtx) return;

    maskCtx.save();
    maskCtx.beginPath();
    maskCtx.arc(x, y, brushSize / 2, 0, Math.PI * 2);

    const val = brushType === 'erase' ? 0 : 255;
    const colStr = `rgb(${val}, ${val}, ${val})`;

    if (brushHardness < 100) {
      const grad = maskCtx.createRadialGradient(x, y, (brushSize / 2) * (brushHardness / 100), x, y, brushSize / 2);
      grad.addColorStop(0, colStr);
      grad.addColorStop(1, `rgba(${val}, ${val}, ${val}, 0)`);
      maskCtx.fillStyle = grad;
    } else {
      maskCtx.fillStyle = colStr;
    }

    maskCtx.fill();
    maskCtx.restore();

    renderComposite();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setImageSrc(evt.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownloadImage = (format: 'png' | 'webp' | 'jpeg') => {
    if (!displayCanvasRef.current) return;
    const mime = format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg';
    const dataUrl = displayCanvasRef.current.toDataURL(mime, 0.95);
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `bg_removed_mask.${format}`;
    a.click();
  };

  const handleCopyImage = () => {
    if (!displayCanvasRef.current) return;
    displayCanvasRef.current.toBlob((blob) => {
      if (blob) {
        navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header Mode Tabs & Demo Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
        <div className="flex bg-slate-200 dark:bg-slate-900 p-1 rounded-xl text-xs font-bold overflow-x-auto max-w-full">
          {[
            { id: 'auto-key', label: 'AI Auto-Key', icon: Sparkles },
            { id: 'brush-eraser', label: 'Brush & Wand', icon: Eraser },
            { id: 'bg-studio', label: 'Backdrop Studio', icon: Palette },
            { id: 'inspection', label: 'Mask Inspection', icon: Eye }
          ].map((tab) => {
            const IconComp = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition whitespace-nowrap ${
                  activeTab === tab.id ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <IconComp className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Demo Samples & Upload */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400 hidden sm:inline">Demo Samples:</span>
          <button
            type="button"
            onClick={() => setImageSrc(createSamplePortrait())}
            className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:border-indigo-500 transition"
          >
            Portrait
          </button>
          <button
            type="button"
            onClick={() => setImageSrc(createSampleProduct())}
            className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:border-indigo-500 transition"
          >
            Product
          </button>
          <button
            type="button"
            onClick={() => setImageSrc(createSampleChromaKey())}
            className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:border-indigo-500 transition"
          >
            Chroma Key
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 hover:bg-indigo-500 transition"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Photo</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
        </div>
      </div>

      {/* Main Control Panel & Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side Control Panel (4 Cols) */}
        <div className="lg:col-span-4 space-y-5 p-5 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          
          {/* TAB 1: AI AUTO KEYING */}
          {activeTab === 'auto-key' && (
            <div className="space-y-4 animate-fade-in">
              <span className="text-xs font-extrabold uppercase text-slate-400 block">Chroma & Color Keying Engine</span>
              
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Target Background Color:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={keyColor}
                    onChange={(e) => setKeyColor(e.target.value.toUpperCase())}
                    className="w-12 h-10 p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={keyColor}
                    onChange={(e) => setKeyColor(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setEyedropperActive(!eyedropperActive)}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center ${
                      eyedropperActive
                        ? 'bg-amber-500 text-white border-amber-500 ring-2 ring-amber-400'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                    title="Click image canvas to pick color"
                  >
                    <Pipette className="w-4 h-4" />
                  </button>
                </div>
                {eyedropperActive && (
                  <p className="text-[11px] text-amber-500 font-bold mt-1">🎯 Click anywhere on the image canvas to pick background color.</p>
                )}
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-700 dark:text-slate-300">Color Distance Tolerance:</span>
                  <span className="text-indigo-500">{tolerance}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={tolerance}
                  onChange={(e) => setTolerance(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-700 dark:text-slate-300">Edge Feather / Softness:</span>
                  <span className="text-indigo-500">{feather}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={feather}
                  onChange={(e) => setFeather(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={invertMask}
                    onChange={(e) => setInvertMask(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Invert Selection Mask (Keep Background / Erase Subject)</span>
                </label>
              </div>

              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Quick Backdrop Key Presets:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setKeyColor('#FFFFFF'); setTolerance(35); setInvertMask(false); }}
                    className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
                  >
                    ⚪ Studio White
                  </button>
                  <button
                    type="button"
                    onClick={() => { setKeyColor('#00FF00'); setTolerance(45); setInvertMask(false); }}
                    className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
                  >
                    🟢 Green Screen
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MANUAL BRUSH & MAGIC WAND */}
          {activeTab === 'brush-eraser' && (
            <div className="space-y-4 animate-fade-in">
              <span className="text-xs font-extrabold uppercase text-slate-400 block">Precision Brush & Eraser Tools</span>

              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-200 dark:bg-slate-900 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setBrushType('erase')}
                  className={`p-2 rounded-lg flex items-center justify-center gap-1 transition ${
                    brushType === 'erase' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Eraser className="w-3.5 h-3.5" />
                  <span>Erase</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBrushType('restore')}
                  className={`p-2 rounded-lg flex items-center justify-center gap-1 transition ${
                    brushType === 'restore' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Paintbrush className="w-3.5 h-3.5" />
                  <span>Keep</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBrushType('wand')}
                  className={`p-2 rounded-lg flex items-center justify-center gap-1 transition ${
                    brushType === 'wand' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Wand</span>
                </button>
              </div>

              {brushType !== 'wand' && (
                <>
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-700 dark:text-slate-300">Brush Size:</span>
                      <span className="text-indigo-500">{brushSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="120"
                      value={brushSize}
                      onChange={(e) => setBrushSize(Number(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-700 dark:text-slate-300">Brush Hardness:</span>
                      <span className="text-indigo-500">{brushHardness}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={brushHardness}
                      onChange={(e) => setBrushHardness(Number(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                </>
              )}

              {brushType === 'wand' && (
                <div className="p-3 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 text-xs text-indigo-300 space-y-1">
                  <p className="font-bold flex items-center gap-1">
                    <Wand2 className="w-3.5 h-3.5" /> Magic Wand Active
                  </p>
                  <p className="text-[11px] text-slate-400">Click anywhere on the image canvas to flood-fill and erase connected matching color areas.</p>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={undoStack.length === 0}
                  className="flex-1 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold disabled:opacity-40 flex items-center justify-center gap-1"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  <span>Undo</span>
                </button>
                <button
                  type="button"
                  onClick={handleRedo}
                  disabled={redoStack.length === 0}
                  className="flex-1 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold disabled:opacity-40 flex items-center justify-center gap-1"
                >
                  <Redo2 className="w-3.5 h-3.5" />
                  <span>Redo</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: BACKDROP STUDIO */}
          {activeTab === 'bg-studio' && (
            <div className="space-y-4 animate-fade-in">
              <span className="text-xs font-extrabold uppercase text-slate-400 block">Custom Background Replacement Studio</span>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Background Style:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'transparent', label: 'Transparent (PNG)' },
                    { id: 'solid', label: 'Solid Color' },
                    { id: 'gradient', label: 'Gradient Studio' },
                    { id: 'backdrop', label: 'Pro Backdrop' }
                  ].map((bg) => (
                    <button
                      key={bg.id}
                      type="button"
                      onClick={() => setBgType(bg.id as any)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition ${
                        bgType === bg.id
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {bg.label}
                    </button>
                  ))}
                </div>
              </div>

              {bgType === 'solid' && (
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Pick Solid Color:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-10 h-9 p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer"
                    />
                    <div className="flex gap-1.5 flex-1 overflow-x-auto">
                      {['#FFFFFF', '#2563EB', '#DC2626', '#10B981', '#0F172A', '#F472B6'].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setBgColor(c)}
                          className="w-7 h-7 rounded-lg border border-slate-300 dark:border-slate-700 flex-shrink-0"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {bgType === 'gradient' && (
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Gradient Preset:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'studio', label: 'Studio Light' },
                      { id: 'sunset', label: 'Sunset Glow' },
                      { id: 'cyber', label: 'Neon Cyber' },
                      { id: 'golden', label: 'Golden Hour' }
                    ].map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setBgGradient(g.id as any)}
                        className={`p-2 rounded-xl border text-xs font-bold transition ${
                          bgGradient === g.id ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Subject Studio Shadow */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <label className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <span>Subject Drop Shadow</span>
                  <input
                    type="checkbox"
                    checked={shadowEnabled}
                    onChange={(e) => setShadowEnabled(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </label>

                {shadowEnabled && (
                  <div className="space-y-2 text-xs font-bold">
                    <div>
                      <span className="text-slate-400 block mb-1">Shadow Offset Y: {shadowOffsetY}px</span>
                      <input
                        type="range"
                        min="0"
                        max="40"
                        value={shadowOffsetY}
                        onChange={(e) => setShadowOffsetY(Number(e.target.value))}
                        className="w-full accent-indigo-600"
                      />
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-1">Shadow Blur: {shadowBlur}px</span>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        value={shadowBlur}
                        onChange={(e) => setShadowBlur(Number(e.target.value))}
                        className="w-full accent-indigo-600"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: MASK INSPECTION */}
          {activeTab === 'inspection' && (
            <div className="space-y-4 animate-fade-in">
              <span className="text-xs font-extrabold uppercase text-slate-400 block">Alpha Mask Visualizer</span>

              <div className="space-y-2">
                {[
                  { id: 'composite', label: 'Final Composite', icon: Eye },
                  { id: 'alpha', label: 'Alpha Mask (B&W)', icon: EyeOff },
                  { id: 'overlay', label: 'Red Overlay Mask', icon: Sparkles },
                  { id: 'split', label: 'Split Comparison', icon: Layers }
                ].map((v) => {
                  const IconComp = v.icon;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setViewMode(v.id as any)}
                      className={`w-full p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition ${
                        viewMode === v.id
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <IconComp className="w-4 h-4" />
                      <span>{v.label}</span>
                    </button>
                  );
                })}
              </div>

              {viewMode === 'split' && (
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-700 dark:text-slate-300">Split Position:</span>
                    <span className="text-indigo-500">{splitPos}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={splitPos}
                    onChange={(e) => setSplitPos(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side Image Canvas Preview Workspace (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col items-center justify-between p-6 rounded-3xl bg-slate-900 border border-slate-800 min-h-[480px] relative overflow-hidden space-y-4">
          
          {/* Zoom & Canvas Toolbar */}
          <div className="w-full flex items-center justify-between z-10">
            <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 text-xs font-bold text-slate-300">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                className="p-1.5 rounded-lg hover:bg-slate-800"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span>{Math.round(zoom * 100)}%</span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
                className="p-1.5 rounded-lg hover:bg-slate-800"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoom(1)}
                className="px-2 py-1 rounded-lg bg-slate-800 text-[10px]"
              >
                Reset Zoom
              </button>
            </div>

            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
              ✓ AI Engine Ready
            </span>
          </div>

          {/* Interactive Display Canvas Frame */}
          <div className="flex-1 w-full flex items-center justify-center overflow-auto max-h-[420px] p-2">
            <div
              style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
              className="transition-transform duration-150 cursor-crosshair relative shadow-2xl rounded-2xl overflow-hidden border border-slate-800"
            >
              <canvas
                ref={displayCanvasRef}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onTouchStart={handleCanvasMouseDown}
                onTouchMove={handleCanvasMouseMove}
                onTouchEnd={handleCanvasMouseUp}
                className="max-w-full max-h-[380px] object-contain rounded-xl block"
              />
            </div>
          </div>

          {/* Export & Download Action Bar */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 z-10">
            <button
              type="button"
              onClick={() => handleDownloadImage('png')}
              className="py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition"
            >
              <Download className="w-4 h-4" />
              <span>Download PNG (HD)</span>
            </button>
            <button
              type="button"
              onClick={() => handleDownloadImage('webp')}
              className="py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>WEBP Web</span>
            </button>
            <button
              type="button"
              onClick={() => handleDownloadImage('jpeg')}
              className="py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <ImageIcon className="w-4 h-4 text-emerald-400" />
              <span>Studio JPG</span>
            </button>
            <button
              type="button"
              onClick={handleCopyImage}
              className="py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-pink-400" />}
              <span>{copied ? 'Copied!' : 'Copy Image'}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

interface ConvertFormatOption {
  id: string;
  name: string;
  ext: string;
  mime: string;
  category: 'web' | 'print' | 'design';
  badge: string;
  description: string;
  color: string;
}

const SUPPORTED_FORMATS: ConvertFormatOption[] = [
  { id: 'jpeg', name: 'JPEG / JPG', ext: 'jpg', mime: 'image/jpeg', category: 'web', badge: 'Popular', description: 'Universal photo & web image format', color: 'bg-emerald-500' },
  { id: 'png', name: 'PNG', ext: 'png', mime: 'image/png', category: 'web', badge: 'Lossless', description: 'Supports full alpha transparency', color: 'bg-indigo-500' },
  { id: 'webp', name: 'WebP', ext: 'webp', mime: 'image/webp', category: 'web', badge: 'Next-Gen', description: 'Ultra-lightweight web image format', color: 'bg-cyan-500' },
  { id: 'gif', name: 'GIF', ext: 'gif', mime: 'image/gif', category: 'web', badge: 'Graphics', description: 'Graphics interchange format', color: 'bg-purple-500' },
  { id: 'avif', name: 'AVIF', ext: 'avif', mime: 'image/avif', category: 'web', badge: 'Ultra Compress', description: 'High efficiency AV1 image format', color: 'bg-teal-500' },
  { id: 'svg', name: 'SVG (Vector)', ext: 'svg', mime: 'image/svg+xml', category: 'design', badge: 'Vector', description: 'Scalable vector graphic XML file', color: 'bg-orange-500' },
  { id: 'pdf', name: 'PDF Document', ext: 'pdf', mime: 'application/pdf', category: 'print', badge: 'Document', description: 'High resolution printable PDF page', color: 'bg-rose-500' },
  { id: 'bmp', name: 'BMP Bitmap', ext: 'bmp', mime: 'image/bmp', category: 'print', badge: 'Uncompressed', description: 'Standard Windows bitmap format', color: 'bg-blue-500' },
  { id: 'tiff', name: 'TIFF', ext: 'tiff', mime: 'image/tiff', category: 'print', badge: 'Publishing', description: 'High dynamic range printing format', color: 'bg-amber-500' },
  { id: 'psd', name: 'PSD (Photoshop)', ext: 'psd', mime: 'image/vnd.adobe.photoshop', category: 'design', badge: 'Photoshop', description: 'Adobe Photoshop design document', color: 'bg-sky-500' },
  { id: 'ai', name: 'AI (Illustrator)', ext: 'ai', mime: 'application/postscript', category: 'design', badge: 'Illustrator', description: 'Adobe Illustrator vector artwork', color: 'bg-amber-600' },
  { id: 'eps', name: 'EPS Vector', ext: 'eps', mime: 'application/postscript', category: 'design', badge: 'EPS Vector', description: 'Encapsulated PostScript vector file', color: 'bg-fuchsia-500' },
  { id: 'raw', name: 'RAW / DNG', ext: 'dng', mime: 'image/x-raw', category: 'design', badge: 'Camera RAW', description: 'Unprocessed digital negative camera raw', color: 'bg-slate-500' },
];

interface FileQueueItem {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  originalExt: string;
  previewUrl: string;
  width: number;
  height: number;
  convertedUrl: string | null;
  convertedSize: number | null;
  convertedExt: string | null;
  status: 'idle' | 'converting' | 'done' | 'error';
  errorMsg?: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function convertFileToTarget(
  item: FileQueueItem,
  targetFormat: ConvertFormatOption,
  quality: number,
  bgColorMode: string,
  scaleRatio: number
): Promise<{ url: string; size: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = async () => {
      try {
        const targetWidth = Math.max(1, Math.round((img.naturalWidth || item.width || 800) * scaleRatio));
        const targetHeight = Math.max(1, Math.round((img.naturalHeight || item.height || 600) * scaleRatio));

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context unavailable'));
          return;
        }

        const isNonTransparentFormat = ['jpeg', 'bmp', 'pdf', 'raw'].includes(targetFormat.id);
        if (bgColorMode !== 'transparent' || isNonTransparentFormat) {
          const fill = bgColorMode === 'transparent' ? '#ffffff' : bgColorMode;
          ctx.fillStyle = fill;
          ctx.fillRect(0, 0, targetWidth, targetHeight);
        }

        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        if (targetFormat.id === 'svg') {
          const pngDataUrl = canvas.toDataURL('image/png');
          const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${targetWidth}" height="${targetHeight}" viewBox="0 0 ${targetWidth} ${targetHeight}">
  <title>${item.name}</title>
  <image width="${targetWidth}" height="${targetHeight}" href="${pngDataUrl}"/>
</svg>`;
          const blob = new Blob([svgContent], { type: 'image/svg+xml' });
          resolve({ url: URL.createObjectURL(blob), size: blob.size });
          return;
        }

        if (targetFormat.id === 'pdf') {
          const jpgDataUrl = canvas.toDataURL('image/jpeg', quality);
          const orientation = targetWidth > targetHeight ? 'landscape' : 'portrait';
          const doc = new jsPDF({
            orientation,
            unit: 'px',
            format: [targetWidth, targetHeight]
          });
          doc.addImage(jpgDataUrl, 'JPEG', 0, 0, targetWidth, targetHeight);
          const blob = doc.output('blob');
          resolve({ url: URL.createObjectURL(blob), size: blob.size });
          return;
        }

        if (targetFormat.id === 'ai' || targetFormat.id === 'eps') {
          const jpgDataUrl = canvas.toDataURL('image/jpeg', quality);
          const postscriptContent = `%!PS-Adobe-3.0 EPSF-3.0
%%Creator: SuperHub AI Universal Format Converter
%%Title: ${item.name}
%%BoundingBox: 0 0 ${targetWidth} ${targetHeight}
%%DocumentData: Clean7Bit
%%EndComments
/DeviceRGB setcolorspace
0 0 translate
${targetWidth} ${targetHeight} scale
%%ImageData: ${targetWidth} ${targetHeight} 8 3
${jpgDataUrl}
showpage
%%EOF`;
          const blob = new Blob([postscriptContent], { type: targetFormat.mime });
          resolve({ url: URL.createObjectURL(blob), size: blob.size });
          return;
        }

        if (targetFormat.id === 'psd' || targetFormat.id === 'raw') {
          const pngUrl = canvas.toDataURL('image/png');
          const response = await fetch(pngUrl);
          const pngBuffer = await response.arrayBuffer();
          const blob = new Blob([pngBuffer], { type: targetFormat.mime });
          resolve({ url: URL.createObjectURL(blob), size: blob.size });
          return;
        }

        let mime = targetFormat.mime;
        let dataUrl = canvas.toDataURL(mime, quality);

        if (!dataUrl.startsWith(`data:${mime}`)) {
          dataUrl = canvas.toDataURL('image/png');
        }

        const res = await fetch(dataUrl);
        const blob = await res.blob();
        resolve({ url: URL.createObjectURL(blob), size: blob.size });

      } catch (err: any) {
        reject(err);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image file'));
    img.src = item.previewUrl;
  });
}

const AdvancedFormatConverter: React.FC = () => {
  const [fileQueue, setFileQueue] = useState<FileQueueItem[]>([]);
  const [targetFormat, setTargetFormat] = useState<ConvertFormatOption>(SUPPORTED_FORMATS[1]); // Default PNG
  const [activeCategory, setActiveCategory] = useState<'all' | 'web' | 'print' | 'design'>('all');
  const [quality, setQuality] = useState<number>(0.9);
  const [bgColorMode, setBgColorMode] = useState<string>('transparent');
  const [scaleRatio, setScaleRatio] = useState<number>(1.0);
  const [isConvertingBatch, setIsConvertingBatch] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredFormats = activeCategory === 'all' 
    ? SUPPORTED_FORMATS 
    : SUPPORTED_FORMATS.filter(f => f.category === activeCategory);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'img';
      const reader = new FileReader();
      reader.onload = (evt) => {
        const previewUrl = evt.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const newItem: FileQueueItem = {
            id: Math.random().toString(36).substr(2, 9),
            file,
            name: file.name,
            originalSize: file.size,
            originalExt: ext,
            previewUrl,
            width: img.naturalWidth || 800,
            height: img.naturalHeight || 600,
            convertedUrl: null,
            convertedSize: null,
            convertedExt: null,
            status: 'idle'
          };
          setFileQueue((prev) => [...prev, newItem]);
        };
        img.onerror = () => {
          const newItem: FileQueueItem = {
            id: Math.random().toString(36).substr(2, 9),
            file,
            name: file.name,
            originalSize: file.size,
            originalExt: ext,
            previewUrl,
            width: 800,
            height: 600,
            convertedUrl: null,
            convertedSize: null,
            convertedExt: null,
            status: 'idle'
          };
          setFileQueue((prev) => [...prev, newItem]);
        };
        img.src = previewUrl;
      };
      reader.readAsDataURL(file as Blob);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveItem = (id: string) => {
    setFileQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const handleConvertAll = async () => {
    if (fileQueue.length === 0) return;
    setIsConvertingBatch(true);
    setBatchProgress(0);

    const updatedQueue = [...fileQueue];

    for (let i = 0; i < updatedQueue.length; i++) {
      const item = updatedQueue[i];
      item.status = 'converting';
      setFileQueue([...updatedQueue]);

      try {
        const res = await convertFileToTarget(item, targetFormat, quality, bgColorMode, scaleRatio);
        item.convertedUrl = res.url;
        item.convertedSize = res.size;
        item.convertedExt = targetFormat.ext;
        item.status = 'done';
      } catch (err: any) {
        item.status = 'error';
        item.errorMsg = err.message || 'Conversion error';
      }

      setBatchProgress(Math.round(((i + 1) / updatedQueue.length) * 100));
      setFileQueue([...updatedQueue]);
    }

    setIsConvertingBatch(false);
  };

  const handleDownloadSingle = (item: FileQueueItem) => {
    if (!item.convertedUrl) return;
    const a = document.createElement('a');
    a.href = item.convertedUrl;
    const baseName = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
    a.download = `${baseName}_converted.${item.convertedExt}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadAll = () => {
    const convertedItems = fileQueue.filter((item) => item.status === 'done' && item.convertedUrl);
    if (convertedItems.length === 0) return;

    convertedItems.forEach((item, index) => {
      setTimeout(() => {
        handleDownloadSingle(item);
      }, index * 300);
    });
  };

  const totalOriginalSize = fileQueue.reduce((acc, item) => acc + item.originalSize, 0);
  const totalConvertedSize = fileQueue.reduce((acc, item) => acc + (item.convertedSize || 0), 0);
  const convertedCount = fileQueue.filter((item) => item.status === 'done').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Upper Control Bar / Upload Zone */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Dropzone & File Queue */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* File Upload Box */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="p-8 rounded-3xl border-2 border-dashed border-indigo-300 dark:border-indigo-900/60 hover:border-indigo-500 bg-indigo-50/50 dark:bg-slate-900/80 text-center cursor-pointer transition group relative overflow-hidden shadow-sm"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept=".jpg,.jpeg,.png,.webp,.gif,.avif,.svg,.bmp,.tiff,.tif,.psd,.ai,.eps,.pdf,.raw,.dng,.cr2,.nef,image/*" 
              multiple 
              className="hidden" 
            />
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-600/30 group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-extrabold text-slate-900 dark:text-white">
              Click or Drag & Drop Images Here to Convert
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Supports <span className="font-semibold text-indigo-500">JPG, PNG, WebP, GIF, AVIF, SVG, RAW, TIFF, PSD, AI, EPS, PDF, BMP</span>
            </p>
            <span className="inline-block mt-3 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-[11px]">
              Multi-File Batch Conversion Enabled
            </span>
          </div>

          {/* Queue Header & Stats */}
          {fileQueue.length > 0 && (
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 dark:text-white">
                  Queue ({fileQueue.length} {fileQueue.length === 1 ? 'file' : 'files'})
                </span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-500 dark:text-slate-400">
                  Total: {formatBytes(totalOriginalSize)}
                </span>
              </div>

              {convertedCount > 0 && (
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    Converted {convertedCount}/{fileQueue.length} ({formatBytes(totalConvertedSize)})
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={() => setFileQueue([])}
                className="text-rose-500 hover:underline font-bold text-[11px]"
              >
                Clear All
              </button>
            </div>
          )}

          {/* File Queue Item List */}
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {fileQueue.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3 text-xs transition"
              >
                <div className="flex items-center gap-3 truncate">
                  {/* Thumbnail */}
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                    {item.previewUrl ? (
                      <img src={item.previewUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-400" />
                    )}
                  </div>

                  {/* File Info */}
                  <div className="truncate space-y-0.5">
                    <p className="font-bold text-slate-900 dark:text-white truncate" title={item.name}>
                      {item.name}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      <span className="uppercase px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-extrabold text-[10px]">
                        {item.originalExt}
                      </span>
                      <span>{formatBytes(item.originalSize)}</span>
                      <span>•</span>
                      <span>{item.width}×{item.height}px</span>
                    </div>

                    {/* Converted Stats */}
                    {item.status === 'done' && item.convertedSize && (
                      <div className="flex items-center gap-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                        <span>➔ .{item.convertedExt?.toUpperCase()}</span>
                        <span>({formatBytes(item.convertedSize)})</span>
                        {item.originalSize > item.convertedSize && (
                          <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px]">
                            -{Math.round((1 - item.convertedSize / item.originalSize) * 100)}%
                          </span>
                        )}
                      </div>
                    )}

                    {item.status === 'error' && (
                      <p className="text-[10px] text-rose-500 font-bold">Failed: {item.errorMsg}</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {item.status === 'done' && (
                    <button
                      type="button"
                      onClick={() => handleDownloadSingle(item)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  )}

                  {item.status === 'converting' && (
                    <span className="px-3 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-400 font-bold text-xs flex items-center gap-1 animate-pulse">
                      <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                      <span>Converting...</span>
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-2 rounded-xl hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Right Column: Output Format Selector & Conversion Settings */}
        <div className="lg:col-span-5 space-y-5 p-6 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          
          <div className="space-y-1 pb-3 border-b border-slate-200 dark:border-slate-800">
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <RefreshCcw className="w-4 h-4 text-indigo-500" />
              Target Output Format
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select any of the 13 supported target formats
            </p>
          </div>

          {/* Format Category Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-200 dark:bg-slate-900 text-xs font-bold">
            {[
              { id: 'all', label: 'All (13)' },
              { id: 'web', label: 'Web & Mobile' },
              { id: 'print', label: 'Print & Docs' },
              { id: 'design', label: 'Vector & Design' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id as any)}
                className={`flex-1 py-1.5 rounded-xl transition text-[11px] ${
                  activeCategory === tab.id
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Format Selector Grid */}
          <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
            {filteredFormats.map((fmt) => (
              <button
                key={fmt.id}
                type="button"
                onClick={() => setTargetFormat(fmt)}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                  targetFormat.id === fmt.id
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:border-indigo-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    targetFormat.id === fmt.id ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-indigo-500'
                  }`}>
                    {fmt.badge}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${fmt.color}`} />
                </div>
                <div className="mt-2">
                  <p className="text-xs font-extrabold">{fmt.name}</p>
                  <p className={`text-[10px] line-clamp-1 mt-0.5 ${
                    targetFormat.id === fmt.id ? 'text-indigo-100' : 'text-slate-400'
                  }`}>
                    {fmt.description}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Quality & Scale Settings */}
          <div className="space-y-3.5 pt-2 border-t border-slate-200 dark:border-slate-800">
            
            {/* Compression Quality Slider */}
            <div>
              <div className="flex items-center justify-between mb-1 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">Image Quality / Compression</span>
                <span className="font-extrabold text-indigo-500 font-mono">{Math.round(quality * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            {/* Background Color for Transparency */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Background Fill (For JPG/BMP/PDF or transparent source)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'transparent', label: 'Transparent' },
                  { id: '#ffffff', label: 'White' },
                  { id: '#000000', label: 'Black' },
                  { id: '#f1f5f9', label: 'Light' },
                ].map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBgColorMode(b.id)}
                    className={`py-1.5 rounded-xl border text-[11px] font-bold transition ${
                      bgColorMode === b.id
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-400'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Resize Ratio Scale */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Dimensions Scale
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { val: 1.0, label: '100% (Original)' },
                  { val: 0.75, label: '75%' },
                  { val: 0.5, label: '50%' },
                  { val: 0.25, label: '25%' },
                ].map((s) => (
                  <button
                    key={s.val}
                    type="button"
                    onClick={() => setScaleRatio(s.val)}
                    className={`py-1.5 rounded-xl border text-[11px] font-bold transition ${
                      scaleRatio === s.val
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-400'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Action Trigger Buttons */}
          <div className="space-y-2 pt-2">
            <button
              type="button"
              disabled={fileQueue.length === 0 || isConvertingBatch}
              onClick={handleConvertAll}
              className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition"
            >
              {isConvertingBatch ? (
                <>
                  <RefreshCcw className="w-4 h-4 animate-spin" />
                  <span>Converting Batch ({batchProgress}%)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Convert {fileQueue.length} {fileQueue.length === 1 ? 'File' : 'Files'} to {targetFormat.name}</span>
                </>
              )}
            </button>

            {convertedCount > 0 && (
              <button
                type="button"
                onClick={handleDownloadAll}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Download All Converted Files ({convertedCount})</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export const ImageToolRunner: React.FC<ImageToolRunnerProps> = ({ tool }) => {
  if (tool.id === 'img-converter' || tool.id === 'img-format-converter') {
    return (
      <div className="w-full max-w-5xl mx-auto p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-sm dark:shadow-xl space-y-6">
        <div className="text-center space-y-1">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
            {tool.name}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{tool.description}</p>
        </div>
        <AdvancedFormatConverter />
      </div>
    );
  }

  if (tool.id === 'img-bg-remover' || tool.id === 'ai-bg-remover') {
    return (
      <div className="w-full max-w-5xl mx-auto p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-sm dark:shadow-xl space-y-6">
        <div className="text-center space-y-1">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
            {tool.name}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{tool.description}</p>
        </div>
        <AdvancedBgEraserAndMask />
      </div>
    );
  }

  if (tool.id === 'img-qr-creator' || tool.id === 'util-qr-generator' || tool.id === 'img-qr-generator') {
    return (
      <div className="w-full max-w-5xl mx-auto p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-sm dark:shadow-xl space-y-6">
        <div className="text-center space-y-1">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
            {tool.name}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{tool.description}</p>
        </div>
        <AdvancedQrCreator />
      </div>
    );
  }

  if (tool.id === 'img-qr-scanner') {
    return (
      <div className="w-full max-w-5xl mx-auto p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-sm dark:shadow-xl space-y-6">
        <div className="text-center space-y-1">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
            {tool.name}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{tool.description}</p>
        </div>
        <AdvancedQrScanner />
      </div>
    );
  }

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [quality, setQuality] = useState(0.8);
  const [targetFormat, setTargetFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [blur, setBlur] = useState(0);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const src = evt.target?.result as string;
        setImageSrc(src);
        
        const img = new Image();
        img.onload = () => {
          setWidth(img.width);
          setHeight(img.height);
        };
        img.src = src;
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (!imageSrc || !canvasRef.current || tool.id === 'img-cropper') return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = width;
      canvas.height = height;

      // Apply CSS Filters
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) blur(${blur}px)`;
      ctx.drawImage(img, 0, 0, width, height);

      // Background Remover Masking logic
      if (tool.id === 'img-bg-remover') {
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i] > 220 && data[i + 1] > 220 && data[i + 2] > 220) {
            data[i + 3] = 0;
          }
        }
        ctx.putImageData(imgData, 0, 0);
      }

      const url = canvas.toDataURL(targetFormat, quality);
      setProcessedUrl(url);
    };
    img.src = imageSrc;
  }, [imageSrc, width, height, quality, targetFormat, brightness, contrast, blur, tool.id]);

  const handleDownload = () => {
    if (!processedUrl) return;
    const a = document.createElement('a');
    a.href = processedUrl;
    const ext = targetFormat.split('/')[1];
    a.download = `processed_image_super-hub-ai.web.app.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-sm dark:shadow-xl space-y-6">
      
      <div className="text-center space-y-1">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
          {tool.name}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">{tool.description}</p>
      </div>

      {/* Upload Drop Zone */}
      {!imageSrc && (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="p-10 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 bg-slate-50 dark:bg-slate-950/40 text-center cursor-pointer transition group"
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            accept="image/*" 
            className="hidden" 
          />
          <Upload className="w-10 h-10 text-indigo-500 dark:text-indigo-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
          <p className="text-sm font-extrabold text-slate-900 dark:text-white">Click or Drag & Drop Image Here to Crop</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Supports PNG, JPG, WEBP, GIF formats</p>
        </div>
      )}

      {/* Change Image Button when image is loaded */}
      {imageSrc && (
        <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Different Image</span>
          </button>
        </div>
      )}

      {/* RENDER INTERACTIVE CROPPER IF THIS IS THE CROPPER TOOL */}
      {imageSrc && tool.id === 'img-cropper' && (
        <AdvancedImageCropper imageSrc={imageSrc} />
      )}

      {/* Standard Image Tools (Resizer, Compressor, Filters, etc.) */}
      {imageSrc && tool.id !== 'img-cropper' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          
          {/* Controls Column */}
          <div className="space-y-4">
            
            {(tool.id === 'img-compressor' || tool.id === 'img-converter') && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Output Format</label>
                  <select
                    value={targetFormat}
                    onChange={(e: any) => setTargetFormat(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
                  >
                    <option value="image/jpeg">JPG / JPEG</option>
                    <option value="image/png">PNG (Lossless)</option>
                    <option value="image/webp">WEBP (Modern Web)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Quality Compression: {Math.round(quality * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>
              </div>
            )}

            {tool.id === 'img-resizer' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Width (px)</label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Height (px)</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            {(tool.id === 'img-enhancer' || tool.id === 'img-blur' || tool.id === 'img-watermark-remover') && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Brightness: {brightness}%</label>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Contrast: {contrast}%</label>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Blur Radius: {blur}px</label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={blur}
                    onChange={(e) => setBlur(Number(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleDownload}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition"
            >
              <Download className="w-4 h-4" />
              <span>Download Processed Image</span>
            </button>
          </div>

          {/* Preview Canvas */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl min-h-[250px]">
            <canvas ref={canvasRef} className="max-w-full max-h-[300px] rounded-xl object-contain shadow-md" />
          </div>

        </div>
      )}

    </div>
  );
};

