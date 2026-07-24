import React, { useState, useRef } from 'react';
import { FilePlus, Scissors, FileArchive, FileType, ImagePlus, Stamp, RotateCw, Layers, Download, RefreshCw, Upload, CheckCircle2 } from 'lucide-react';
import { PDFDocument, rgb, degrees } from 'pdf-lib';
import { jsPDF } from 'jspdf';
import { ToolItem } from '../../types';

interface PdfToolRunnerProps {
  tool: ToolItem;
}

export const PdfToolRunner: React.FC<PdfToolRunnerProps> = ({ tool }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [textInput, setTextInput] = useState('');
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [rotationAngle, setRotationAngle] = useState(90);
  const [pageRange, setPageRange] = useState('1-3');
  const [extractedText, setExtractedText] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
      setSuccess(false);
      setExtractedText('');
    }
  };

  // 1. Merge PDF
  const handleMergePdf = async () => {
    if (files.length < 2) {
      alert('Please select at least 2 PDF files to merge.');
      return;
    }
    setProcessing(true);
    try {
      const mergedPdf = await PDFDocument.create();
      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const pdf = await PDFDocument.load(bytes);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }
      const mergedPdfBytes = await mergedPdf.save();
      downloadBlob(new Blob([mergedPdfBytes], { type: 'application/pdf' }), 'merged_document.pdf');
      setSuccess(true);
    } catch (err) {
      alert('Failed to merge PDFs: ' + err);
    } finally {
      setProcessing(false);
    }
  };

  // 2. Text to PDF
  const handleTextToPdf = () => {
    if (!textInput) return;
    setProcessing(true);
    try {
      const doc = new jsPDF();
      const splitText = doc.splitTextToSize(textInput, 180);
      doc.text(splitText, 10, 10);
      doc.save('document.pdf');
      setSuccess(true);
    } catch (err) {
      alert('Failed to convert text to PDF');
    } finally {
      setProcessing(false);
    }
  };

  // 3. Image to PDF
  const handleImagesToPdf = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    try {
      const pdfDoc = await PDFDocument.create();
      for (const file of files) {
        const imageBytes = await file.arrayBuffer();
        let image;
        if (file.type.includes('png')) {
          image = await pdfDoc.embedPng(imageBytes);
        } else {
          image = await pdfDoc.embedJpg(imageBytes);
        }
        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
      }
      const pdfBytes = await pdfDoc.save();
      downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), 'images_converted.pdf');
      setSuccess(true);
    } catch (err) {
      alert('Failed to convert images to PDF: ' + err);
    } finally {
      setProcessing(false);
    }
  };

  // 4. Watermark PDF
  const handleWatermarkPdf = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    try {
      const bytes = await files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes);
      const pages = pdfDoc.getPages();
      pages.forEach((page) => {
        const { width, height } = page.getSize();
        page.drawText(watermarkText, {
          x: width / 4,
          y: height / 2,
          size: 40,
          color: rgb(0.75, 0.2, 0.2),
          opacity: 0.4,
          rotate: degrees(45),
        });
      });
      const pdfBytes = await pdfDoc.save();
      downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), 'watermarked_document.pdf');
      setSuccess(true);
    } catch (err) {
      alert('Failed to watermark PDF: ' + err);
    } finally {
      setProcessing(false);
    }
  };

  // 5. Rotate PDF
  const handleRotatePdf = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    try {
      const bytes = await files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes);
      const pages = pdfDoc.getPages();
      pages.forEach((page) => {
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees(currentRotation + rotationAngle));
      });
      const pdfBytes = await pdfDoc.save();
      downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), 'rotated_document.pdf');
      setSuccess(true);
    } catch (err) {
      alert('Failed to rotate PDF: ' + err);
    } finally {
      setProcessing(false);
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-xl space-y-6">
      
      <div className="text-center space-y-1">
        <h3 className="text-xl font-bold text-white">{tool.name}</h3>
        <p className="text-xs text-slate-400">{tool.description}</p>
      </div>

      {/* File Drop Area */}
      {tool.id !== 'pdf-text-to-pdf' && (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="p-8 rounded-2xl border-2 border-dashed border-slate-700 hover:border-indigo-500 bg-slate-950/40 text-center cursor-pointer transition group"
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            multiple={tool.id === 'pdf-merge' || tool.id === 'pdf-image-to-pdf'}
            accept={tool.id === 'pdf-image-to-pdf' ? 'image/*' : '.pdf'} 
            className="hidden" 
          />
          <Upload className="w-8 h-8 text-indigo-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-xs font-semibold text-white">Click or Drag & Drop Files Here</p>
          <p className="text-[11px] text-slate-500 mt-1">
            {tool.id === 'pdf-image-to-pdf' ? 'Select PNG, JPG image files' : 'Select PDF document files'}
          </p>

          {files.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-800 space-y-1 text-left max-w-md mx-auto">
              {files.map((f, i) => (
                <div key={i} className="text-xs text-indigo-300 font-mono truncate">
                  • {f.name} ({(f.size / 1024).toFixed(1)} KB)
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Inputs for Specific Tools */}
      {tool.id === 'pdf-text-to-pdf' && (
        <textarea
          rows={8}
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Paste plain text, Word document content, or notes here..."
          className="w-full p-4 bg-slate-950/60 border border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      )}

      {tool.id === 'pdf-watermark' && (
        <div>
          <label className="text-xs text-slate-400 block mb-1">Watermark Text</label>
          <input
            type="text"
            value={watermarkText}
            onChange={(e) => setWatermarkText(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
          />
        </div>
      )}

      {tool.id === 'pdf-rotate' && (
        <div>
          <label className="text-xs text-slate-400 block mb-1">Rotation Angle</label>
          <select
            value={rotationAngle}
            onChange={(e) => setRotationAngle(Number(e.target.value))}
            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
          >
            <option value={90}>90° Clockwise</option>
            <option value={180}>180° Flip</option>
            <option value={270}>270° Counter-Clockwise</option>
          </select>
        </div>
      )}

      {/* Action Button */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
        <span className="text-xs text-slate-500">
          {success ? 'File processed & downloaded successfully!' : 'Client-side processing'}
        </span>

        <button
          onClick={() => {
            if (tool.id === 'pdf-merge') handleMergePdf();
            else if (tool.id === 'pdf-text-to-pdf') handleTextToPdf();
            else if (tool.id === 'pdf-image-to-pdf') handleImagesToPdf();
            else if (tool.id === 'pdf-watermark') handleWatermarkPdf();
            else if (tool.id === 'pdf-rotate') handleRotatePdf();
            else handleMergePdf();
          }}
          disabled={processing}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition disabled:opacity-50"
        >
          {processing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Processing PDF...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Process & Download</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};
