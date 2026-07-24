import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, Sliders, RefreshCcw, Crop, Eraser, Eye, Sparkles } from 'lucide-react';
import { ToolItem } from '../../types';

interface ImageToolRunnerProps {
  tool: ToolItem;
}

export const ImageToolRunner: React.FC<ImageToolRunnerProps> = ({ tool }) => {
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
    if (!imageSrc || !canvasRef.current) return;

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
        // Simple color key threshold for white/light background removal
        for (let i = 0; i < data.length; i += 4) {
          if (data[i] > 220 && data[i + 1] > 220 && data[i + 2] > 220) {
            data[i + 3] = 0; // Alpha 0 (transparent)
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
    <div className="w-full max-w-4xl mx-auto p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-sm dark:shadow-xl space-y-6">
      
      <div className="text-center space-y-1">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{tool.name}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">{tool.description}</p>
      </div>

      {/* Upload Drop Zone */}
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="p-8 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 bg-slate-50 dark:bg-slate-950/40 text-center cursor-pointer transition group"
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleImageUpload} 
          accept="image/*" 
          className="hidden" 
        />
        <Upload className="w-8 h-8 text-indigo-500 dark:text-indigo-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
        <p className="text-xs font-semibold text-slate-900 dark:text-white">Click or Drag & Drop Image Here</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Supports PNG, JPG, WEBP formats</p>
      </div>

      {imageSrc && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-slate-800">
          
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

            {(tool.id === 'img-enhancer' || tool.id === 'img-blur') && (
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
