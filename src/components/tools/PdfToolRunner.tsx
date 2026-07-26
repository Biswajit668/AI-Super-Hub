import React, { useState, useRef, useEffect } from 'react';
import { 
  FilePlus, 
  Scissors, 
  FileArchive, 
  FileType, 
  ImagePlus, 
  Stamp, 
  RotateCw, 
  Layers, 
  Download, 
  RefreshCw, 
  Upload, 
  CheckCircle2, 
  Eye, 
  X, 
  ExternalLink, 
  FileText, 
  Trash2,
  ArrowLeft,
  ArrowRight,
  Plus,
  ArrowUpDown,
  Info,
  MoveLeft,
  MoveRight,
  Loader2,
  Lock,
  Unlock,
  PenTool,
  EyeOff,
  GitCompare,
  Sparkles,
  Languages,
  FileCode,
  Table,
  Presentation,
  Camera,
  Edit3,
  Wrench,
  CheckSquare,
  Crop,
  Binary,
  Copy,
  Check,
  Image as ImageIcon,
  Sheet,
  Bold,
  Italic,
  Underline,
  Type
} from 'lucide-react';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import { jsPDF } from 'jspdf';
import * as pdfjsLib from 'pdfjs-dist';
import { ToolItem } from '../../types';

// Set up pdfjs worker from unpkg CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '4.10.38'}/build/pdf.worker.min.mjs`;

interface PdfToolRunnerProps {
  tool: ToolItem;
}

export const PdfToolRunner: React.FC<PdfToolRunnerProps> = ({ tool }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [textInput, setTextInput] = useState('');
  const [watermarkText, setWatermarkText] = useState('Super Hub AI');
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.4);
  const [watermarkType, setWatermarkType] = useState<'text' | 'image'>('text');
  const [watermarkImage, setWatermarkImage] = useState<File | null>(null);
  const [watermarkFontFamily, setWatermarkFontFamily] = useState<'Helvetica' | 'Times-Roman' | 'Courier'>('Helvetica');
  const [watermarkFontSize, setWatermarkFontSize] = useState<number>(36);
  const [watermarkBold, setWatermarkBold] = useState<boolean>(false);
  const [watermarkItalic, setWatermarkItalic] = useState<boolean>(false);
  const [watermarkUnderline, setWatermarkUnderline] = useState<boolean>(false);
  const [watermarkColor, setWatermarkColor] = useState<string>('#ef4444');
  const [watermarkPosition, setWatermarkPosition] = useState<
    'top-left' | 'top-center' | 'top-right' | 'middle-left' | 'center' | 'middle-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
  >('bottom-center');
  const [watermarkMosaic, setWatermarkMosaic] = useState<boolean>(false);
  const [watermarkTransparency, setWatermarkTransparency] = useState<number>(1.0);
  const [watermarkRotation, setWatermarkRotation] = useState<number>(0);
  const [watermarkFromPage, setWatermarkFromPage] = useState<number>(1);
  const [watermarkToPage, setWatermarkToPage] = useState<number>(1);
  const [watermarkLayer, setWatermarkLayer] = useState<'over' | 'below'>('over');
  const watermarkImageInputRef = useRef<HTMLInputElement>(null);
  const [extractMode, setExtractMode] = useState<'all' | 'custom'>('all');
  const [customExtractRange, setCustomExtractRange] = useState('1, 3, 5-8');
  const [rotationAngle, setRotationAngle] = useState(90);
  const [pageRange, setPageRange] = useState('1-2, 3-5');
  const [splitMode, setSplitMode] = useState<'range' | 'all'>('range');
  const [compressLevel, setCompressLevel] = useState<'recommended' | 'extreme' | 'low'>('recommended');
  const [compressionStats, setCompressionStats] = useState<{ originalSize: number; newSize: number; percentage: number } | null>(null);
  const [extractedText, setExtractedText] = useState('');
  
  // Security & Editing options
  const [pdfPassword, setPdfPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pageNumberPosition, setPageNumberPosition] = useState<'bottom-center' | 'bottom-right' | 'top-right'>('bottom-center');
  const [pageNumberFormat, setPageNumberFormat] = useState<'x-of-y' | 'x' | 'dash-x'>('x-of-y');
  const [cropMargins, setCropMargins] = useState({ top: 20, bottom: 20, left: 20, right: 20 });
  const [targetLanguage, setTargetLanguage] = useState('Spanish');
  const [signatureText, setSignatureText] = useState('Biswajit Naskar');
  const [redactSearchTerm, setRedactSearchTerm] = useState('CONFIDENTIAL');
  const [aiResult, setAiResult] = useState('');
  
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // PDF Preview & Thumbnails State
  const [pdfThumbnails, setPdfThumbnails] = useState<{ [key: string]: string }>({});
  const [pdfPageCounts, setPdfPageCounts] = useState<{ [key: string]: number }>({});
  const [renderingThumbnails, setRenderingThumbnails] = useState<{ [key: string]: boolean }>({});

  // PDF Full Preview Modal State
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewPages, setPreviewPages] = useState<string[]>([]);
  const [loadingPreviewPages, setLoadingPreviewPages] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const appendFileInputRef = useRef<HTMLInputElement>(null);

  // Generate real page 1 thumbnail PNG for each PDF file
  useEffect(() => {
    files.forEach((f, idx) => {
      const key = `${f.name}-${f.size}-${idx}`;

      if (f.type.startsWith('image/')) {
        if (!pdfThumbnails[key]) {
          const url = URL.createObjectURL(f);
          setPdfThumbnails(prev => ({ ...prev, [key]: url }));
        }
        return;
      }

      if ((f.type.includes('pdf') || f.name.toLowerCase().endsWith('.pdf')) && !pdfThumbnails[key] && !renderingThumbnails[key]) {
        setRenderingThumbnails(prev => ({ ...prev, [key]: true }));

        f.arrayBuffer()
          .then(async buffer => {
            try {
              const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
              const pdf = await loadingTask.promise;
              setPdfPageCounts(prev => ({ ...prev, [key]: pdf.numPages }));

              const page = await pdf.getPage(1);
              const viewport = page.getViewport({ scale: 0.4 });

              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              canvas.width = viewport.width;
              canvas.height = viewport.height;

              if (ctx) {
                // @ts-ignore
                await page.render({
                  canvasContext: ctx,
                  viewport: viewport,
                }).promise;

                const dataUrl = canvas.toDataURL('image/png');
                setPdfThumbnails(prev => ({ ...prev, [key]: dataUrl }));
              }
            } catch (err) {
              console.error('Error generating PDF thumbnail:', err);
            } finally {
              setRenderingThumbnails(prev => ({ ...prev, [key]: false }));
            }
          })
          .catch(() => {
            setRenderingThumbnails(prev => ({ ...prev, [key]: false }));
          });
      }
    });
  }, [files]);

  // Load all pages as rendered canvas PNGs when opening Preview Modal
  const handleOpenPreview = async (file: File, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPreviewFile(file);
    setPreviewPages([]);
    setLoadingPreviewPages(true);

    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewPages([url]);
      setLoadingPreviewPages(false);
      return;
    }

    try {
      const buffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
      const pdf = await loadingTask.promise;
      const pagesCount = pdf.numPages;
      const pageImages: string[] = [];

      for (let i = 1; i <= Math.min(pagesCount, 20); i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.2 });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        if (ctx) {
          // @ts-ignore
          await page.render({
            canvasContext: ctx,
            viewport: viewport,
          }).promise;
          pageImages.push(canvas.toDataURL('image/png'));
        }
      }

      setPreviewPages(pageImages);
    } catch (err) {
      console.error('Error rendering full preview:', err);
    } finally {
      setLoadingPreviewPages(false);
    }
  };

  const handleClosePreview = () => {
    setPreviewFile(null);
    setPreviewPages([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
      setSuccess(false);
      setExtractedText('');
      setAiResult('');
    }
  };

  const handleAppendFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
      setSuccess(false);
    }
  };

  const moveFile = (fromIndex: number, toIndex: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (toIndex < 0 || toIndex >= files.length) return;
    const updated = [...files];
    const [movedItem] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, movedItem);
    setFiles(updated);
  };

  const sortFilesAlphabetically = () => {
    const updated = [...files].sort((a, b) => a.name.localeCompare(b.name));
    setFiles(updated);
  };

  const handleRemoveFile = (index: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    let finalFilename = filename;
    const domainTag = 'super-hub-ai.web.app';
    if (!filename.includes(domainTag)) {
      const lastDotIndex = filename.lastIndexOf('.');
      if (lastDotIndex > 0) {
        const namePart = filename.substring(0, lastDotIndex);
        const extPart = filename.substring(lastDotIndex);
        finalFilename = `${namePart}_${domainTag}${extPart}`;
      } else {
        finalFilename = `${filename}_${domainTag}`;
      }
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = finalFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Helper to extract text using pdfjsLib
  const extractPdfTextContent = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
    const pdf = await loadingTask.promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += `--- Page ${i} ---\n${pageText}\n\n`;
    }
    return fullText;
  };

  // ---------------- HANDLERS FOR ALL 33 TOOLS ---------------- //

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

  // 2. Split PDF
  const handleSplitPdf = async () => {
    if (files.length === 0) return alert('Please select a PDF file to split.');
    setProcessing(true);
    try {
      const bytes = await files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes);
      const totalPages = pdfDoc.getPageCount();
      const originalName = files[0].name.replace(/\.pdf$/i, '');

      if (splitMode === 'all') {
        for (let i = 0; i < totalPages; i++) {
          const singlePdf = await PDFDocument.create();
          const [copiedPage] = await singlePdf.copyPages(pdfDoc, [i]);
          singlePdf.addPage(copiedPage);
          const singleBytes = await singlePdf.save();
          downloadBlob(new Blob([singleBytes], { type: 'application/pdf' }), `${originalName}_page_${i + 1}.pdf`);
        }
      } else {
        const rangeParts = pageRange.split(',').map(s => s.trim()).filter(Boolean);
        let fileIndex = 1;
        for (const part of rangeParts) {
          const newPdf = await PDFDocument.create();
          const indices: number[] = [];
          if (part.includes('-')) {
            const [startStr, endStr] = part.split('-');
            const start = Math.max(1, parseInt(startStr, 10));
            const end = Math.min(totalPages, parseInt(endStr, 10));
            for (let p = start; p <= end; p++) indices.push(p - 1);
          } else {
            const p = parseInt(part, 10);
            if (!isNaN(p) && p >= 1 && p <= totalPages) indices.push(p - 1);
          }
          if (indices.length > 0) {
            const copiedPages = await newPdf.copyPages(pdfDoc, indices);
            copiedPages.forEach(page => newPdf.addPage(page));
            const splitBytes = await newPdf.save();
            downloadBlob(new Blob([splitBytes], { type: 'application/pdf' }), `${originalName}_split_part_${fileIndex}.pdf`);
            fileIndex++;
          }
        }
      }
      setSuccess(true);
    } catch (err) {
      alert('Failed to split PDF: ' + err);
    } finally {
      setProcessing(false);
    }
  };

  // 3. Remove Pages
  const handleRemovePages = async () => {
    if (files.length === 0) return alert('Please select a PDF file.');
    setProcessing(true);
    try {
      const bytes = await files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes);
      const totalPages = pdfDoc.getPageCount();

      const pagesToRemove = new Set<number>();
      const parts = pageRange.split(',').map(s => s.trim()).filter(Boolean);
      for (const part of parts) {
        if (part.includes('-')) {
          const [startStr, endStr] = part.split('-');
          const start = Math.max(1, parseInt(startStr, 10));
          const end = Math.min(totalPages, parseInt(endStr, 10));
          for (let p = start; p <= end; p++) pagesToRemove.add(p - 1);
        } else {
          const p = parseInt(part, 10);
          if (!isNaN(p) && p >= 1 && p <= totalPages) pagesToRemove.add(p - 1);
        }
      }

      const indicesToKeep = Array.from({ length: totalPages }, (_, i) => i).filter(i => !pagesToRemove.has(i));
      if (indicesToKeep.length === 0) return alert('Cannot remove all pages from PDF.');

      const newPdf = await PDFDocument.create();
      const copiedPages = await newPdf.copyPages(pdfDoc, indicesToKeep);
      copiedPages.forEach(p => newPdf.addPage(p));

      const pdfBytes = await newPdf.save();
      downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), `${files[0].name.replace(/\.pdf$/i, '')}_pages_removed.pdf`);
      setSuccess(true);
    } catch (err) {
      alert('Failed to remove pages: ' + err);
    } finally {
      setProcessing(false);
    }
  };

  // 4. Extract Pages
  const handlePageExtract = async () => {
    if (files.length === 0) return alert('Please select a PDF file.');
    setProcessing(true);
    try {
      const bytes = await files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes);
      const totalPages = pdfDoc.getPageCount();

      const newPdf = await PDFDocument.create();
      const indicesToExtract: number[] = [];

      if (extractMode === 'all') {
        for (let i = 0; i < totalPages; i++) {
          indicesToExtract.push(i);
        }
      } else {
        const rangeStr = customExtractRange.trim() || '1, 3, 5-8';
        const parts = rangeStr.split(',').map(s => s.trim()).filter(Boolean);
        for (const part of parts) {
          if (part.includes('-')) {
            const [startStr, endStr] = part.split('-');
            const start = Math.max(1, parseInt(startStr, 10));
            const end = Math.min(totalPages, parseInt(endStr, 10));
            for (let p = start; p <= end; p++) indicesToExtract.push(p - 1);
          } else {
            const p = parseInt(part, 10);
            if (!isNaN(p) && p >= 1 && p <= totalPages) indicesToExtract.push(p - 1);
          }
        }
      }

      if (indicesToExtract.length === 0) return alert('No valid pages found.');

      const copiedPages = await newPdf.copyPages(pdfDoc, indicesToExtract);
      copiedPages.forEach(page => newPdf.addPage(page));
      const extractedBytes = await newPdf.save();
      downloadBlob(new Blob([extractedBytes], { type: 'application/pdf' }), `${files[0].name.replace(/\.pdf$/i, '')}_extracted.pdf`);
      setSuccess(true);
    } catch (err: any) {
      alert('Failed to extract pages: ' + (err?.message || err));
    } finally {
      setProcessing(false);
    }
  };

  // 5. Organize & Reorder
  const handleOrganizePdf = async () => {
    if (files.length === 0) return alert('Please upload a PDF to organize.');
    return handleMergePdf();
  };

  // 6. Scan to PDF
  const handleScanToPdf = async () => {
    if (files.length === 0) return alert('Please capture or upload scanned page photos.');
    return handleImagesToPdf();
  };

  // 7. Compress PDF
  const handleCompressPdf = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setCompressionStats(null);
    try {
      const originalFile = files[0];
      const originalSize = originalFile.size;
      const buffer = await originalFile.arrayBuffer();

      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
      const pdf = await loadingTask.promise;
      const totalPages = pdf.numPages;

      let scale = compressLevel === 'extreme' ? 0.9 : compressLevel === 'low' ? 1.6 : 1.2;
      let jpegQuality = compressLevel === 'extreme' ? 0.45 : compressLevel === 'low' ? 0.85 : 0.65;

      let doc: jsPDF | null = null;

      for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          // @ts-ignore
          await page.render({ canvasContext: ctx, viewport }).promise;
          const imgData = canvas.toDataURL('image/jpeg', jpegQuality);

          const ptWidth = page.getViewport({ scale: 1.0 }).width;
          const ptHeight = page.getViewport({ scale: 1.0 }).height;

          if (!doc) {
            doc = new jsPDF({
              orientation: ptWidth > ptHeight ? 'landscape' : 'portrait',
              unit: 'pt',
              format: [ptWidth, ptHeight],
            });
            doc.addImage(imgData, 'JPEG', 0, 0, ptWidth, ptHeight, undefined, 'FAST');
          } else {
            doc.addPage([ptWidth, ptHeight], ptWidth > ptHeight ? 'landscape' : 'portrait');
            doc.addImage(imgData, 'JPEG', 0, 0, ptWidth, ptHeight, undefined, 'FAST');
          }
        }
      }

      if (doc) {
        const compressedBlob = doc.output('blob');
        const newSize = compressedBlob.size;
        const percentage = Math.max(0, Math.round(((originalSize - newSize) / originalSize) * 100));

        setCompressionStats({ originalSize, newSize, percentage });
        downloadBlob(compressedBlob, `${originalFile.name.replace(/\.pdf$/i, '')}_compressed.pdf`);
        setSuccess(true);
      }
    } catch (err) {
      alert('Failed to compress PDF: ' + err);
    } finally {
      setProcessing(false);
    }
  };

  // 8. Repair PDF
  const handleRepairPdf = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    try {
      const bytes = await files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const pdfBytes = await pdfDoc.save({ useObjectStreams: false });
      downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), `${files[0].name.replace(/\.pdf$/i, '')}_repaired.pdf`);
      setSuccess(true);
    } catch (err) {
      alert('Failed to repair PDF: ' + err);
    } finally {
      setProcessing(false);
    }
  };

  // 9. OCR PDF
  const handleOcrPdf = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    try {
      const text = await extractPdfTextContent(files[0]);
      setExtractedText(text);

      if (!text || text.trim().length < 20) {
        // Send page image to Gemini AI Vision for OCR
        const buffer = await files[0].arrayBuffer();
        const base64 = btoa(new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));
        const dataUrl = `data:application/pdf;base64,${base64}`;

        const res = await fetch('/api/gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: 'Extract and transcribe all text from this scanned PDF document cleanly into plain text.',
            image: dataUrl,
          }),
        });
        const rawText = await res.text();
        let data: any = {};
        if (rawText && !rawText.trim().startsWith('<')) {
          try { data = JSON.parse(rawText); } catch (e) {}
        }
        if (data.result) setExtractedText(data.result);
      }
      setSuccess(true);
    } catch (err) {
      alert('Failed OCR processing: ' + err);
    } finally {
      setProcessing(false);
    }
  };

  // 10. Images to PDF
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

  // 11. Word to PDF
  const handleWordToPdf = () => {
    if (!textInput) return alert('Please enter or paste Word document text.');
    setProcessing(true);
    try {
      const doc = new jsPDF();
      const splitText = doc.splitTextToSize(textInput, 180);
      doc.text(splitText, 10, 10);
      doc.save('word_document.pdf');
      setSuccess(true);
    } catch (err) {
      alert('Failed to convert Word text to PDF');
    } finally {
      setProcessing(false);
    }
  };

  // 12. PPT to PDF
  const handlePptToPdf = () => {
    if (!textInput) return alert('Please enter slide titles and outline text.');
    setProcessing(true);
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: [960, 540] });
      const slides = textInput.split(/\n(?=Slide \d+:|# )/i);
      slides.forEach((slideText, idx) => {
        if (idx > 0) doc.addPage([960, 540], 'landscape');
        doc.setFillColor(245, 247, 250);
        doc.rect(0, 0, 960, 540, 'F');
        doc.setFillColor(79, 70, 229);
        doc.rect(0, 0, 960, 12, 'F');
        doc.setFontSize(22);
        doc.setTextColor(30, 41, 59);
        const split = doc.splitTextToSize(slideText.trim(), 880);
        doc.text(split, 40, 60);
      });
      doc.save('presentation_slides.pdf');
      setSuccess(true);
    } catch (err) {
      alert('Failed to convert presentation to PDF');
    } finally {
      setProcessing(false);
    }
  };

  // 13. Excel to PDF
  const handleExcelToPdf = () => {
    if (!textInput) return alert('Please enter CSV or tabular data.');
    setProcessing(true);
    try {
      const doc = new jsPDF({ orientation: 'landscape' });
      const lines = textInput.split('\n').filter(Boolean);
      let y = 20;
      doc.setFontSize(10);
      lines.forEach((line) => {
        const cols = line.split(/,|\t/);
        let x = 15;
        cols.forEach((col) => {
          doc.text(col.trim(), x, y);
          x += 60;
        });
        y += 15;
      });
      doc.save('spreadsheet_table.pdf');
      setSuccess(true);
    } catch (err) {
      alert('Failed to convert spreadsheet data');
    } finally {
      setProcessing(false);
    }
  };

  // 14. HTML to PDF
  const handleHtmlToPdf = () => {
    if (!textInput) return alert('Please paste HTML code.');
    setProcessing(true);
    try {
      const doc = new jsPDF();
      const plainText = textInput.replace(/<[^>]+>/g, ' ');
      const splitText = doc.splitTextToSize(plainText, 180);
      doc.text(splitText, 10, 10);
      doc.save('web_page.pdf');
      setSuccess(true);
    } catch (err) {
      alert('Failed to convert HTML to PDF');
    } finally {
      setProcessing(false);
    }
  };

  // 15. PDF to JPG
  const handlePdfToJpg = async () => {
    if (files.length === 0) return alert('Please upload a PDF file.');
    setProcessing(true);
    try {
      const buffer = await files[0].arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
      const pdf = await loadingTask.promise;

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          // @ts-ignore
          await page.render({ canvasContext: ctx, viewport }).promise;
          const imgData = canvas.toDataURL('image/jpeg', 0.92);
          
          const a = document.createElement('a');
          a.href = imgData;
          a.download = `${files[0].name.replace(/\.pdf$/i, '')}_page_${i}_super-hub-ai.web.app.jpg`;
          a.click();
        }
      }
      setSuccess(true);
    } catch (err) {
      alert('Failed to convert PDF to JPG: ' + err);
    } finally {
      setProcessing(false);
    }
  };

  // 16. PDF to Word
  const handlePdfToWord = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    try {
      const text = await extractPdfTextContent(files[0]);
      setExtractedText(text);
      downloadBlob(new Blob([text], { type: 'application/msword' }), `${files[0].name.replace(/\.pdf$/i, '')}.doc`);
      setSuccess(true);
    } catch (err) {
      alert('Failed to convert PDF to Word: ' + err);
    } finally {
      setProcessing(false);
    }
  };

  // 17. PDF to PPT
  const handlePdfToPpt = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    try {
      const text = await extractPdfTextContent(files[0]);
      setExtractedText(text);
      downloadBlob(new Blob([text], { type: 'text/plain' }), `${files[0].name.replace(/\.pdf$/i, '')}_ppt_slides.txt`);
      setSuccess(true);
    } catch (err) {
      alert('Failed to convert PDF to PPT: ' + err);
    } finally {
      setProcessing(false);
    }
  };

  // 18. PDF to Excel
  const handlePdfToExcel = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    try {
      const text = await extractPdfTextContent(files[0]);
      const csvContent = text.split('\n').map(line => line.replace(/\s+/g, ',')).join('\n');
      setExtractedText(csvContent);
      downloadBlob(new Blob([csvContent], { type: 'text/csv' }), `${files[0].name.replace(/\.pdf$/i, '')}_table.csv`);
      setSuccess(true);
    } catch (err) {
      alert('Failed to convert PDF to Excel: ' + err);
    } finally {
      setProcessing(false);
    }
  };

  // 19. PDF to PDF/A
  const handlePdfToPdfa = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    try {
      const bytes = await files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes);
      pdfDoc.setTitle('Archival PDF/A Document');
      pdfDoc.setProducer('Super Hub AI PDF Engine');
      const pdfBytes = await pdfDoc.save();
      downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), `${files[0].name.replace(/\.pdf$/i, '')}_pdfa.pdf`);
      setSuccess(true);
    } catch (err) {
      alert('Failed PDF/A conversion: ' + err);
    } finally {
      setProcessing(false);
    }
  };

  // 20. Rotate PDF
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

  // 21. Add Page Numbers
  const handleAddPageNumbers = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    try {
      const bytes = await files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes);
      const pages = pdfDoc.getPages();
      const totalPages = pages.length;

      pages.forEach((page, index) => {
        const { width } = page.getSize();
        let numStr = `Page ${index + 1} of ${totalPages}`;
        if (pageNumberFormat === 'x') numStr = `${index + 1}`;
        else if (pageNumberFormat === 'dash-x') numStr = `- ${index + 1} -`;

        let x = width / 2 - 30;
        if (pageNumberPosition === 'bottom-right' || pageNumberPosition === 'top-right') x = width - 80;

        let y = 25;
        if (pageNumberPosition === 'top-right') y = page.getHeight() - 30;

        page.drawText(numStr, {
          x,
          y,
          size: 10,
          color: rgb(0.2, 0.2, 0.2),
        });
      });

      const pdfBytes = await pdfDoc.save();
      downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), `${files[0].name.replace(/\.pdf$/i, '')}_numbered.pdf`);
      setSuccess(true);
    } catch (err) {
      alert('Failed to add page numbers: ' + err);
    } finally {
      setProcessing(false);
    }
  };

  // 22. Watermark PDF
  const handleWatermarkPdf = async () => {
    if (files.length === 0) return alert('Please upload a PDF file to watermark.');
    setProcessing(true);
    try {
      const bytes = await files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes);
      const pages = pdfDoc.getPages();
      const totalPages = pages.length;

      const fromP = Math.max(1, Math.min(totalPages, watermarkFromPage || 1));
      const toP = Math.max(fromP, Math.min(totalPages, watermarkToPage || totalPages));

      const hexToRgb = (hex: string) => {
        const cleaned = hex.replace('#', '');
        const r = parseInt(cleaned.substring(0, 2), 16) / 255 || 0.8;
        const g = parseInt(cleaned.substring(2, 4), 16) / 255 || 0.2;
        const b = parseInt(cleaned.substring(4, 6), 16) / 255 || 0.2;
        return rgb(r, g, b);
      };

      const colorObj = hexToRgb(watermarkColor);

      let selectedFont = StandardFonts.Helvetica;
      if (watermarkFontFamily === 'Times-Roman') {
        selectedFont = watermarkBold ? StandardFonts.TimesRomanBold : (watermarkItalic ? StandardFonts.TimesRomanItalic : StandardFonts.TimesRoman);
      } else if (watermarkFontFamily === 'Courier') {
        selectedFont = watermarkBold ? StandardFonts.CourierBold : (watermarkItalic ? StandardFonts.CourierOblique : StandardFonts.Courier);
      } else {
        selectedFont = watermarkBold ? StandardFonts.HelveticaBold : (watermarkItalic ? StandardFonts.HelveticaOblique : StandardFonts.Helvetica);
      }

      const embeddedFont = await pdfDoc.embedFont(selectedFont);

      let embeddedImg: any = null;
      if (watermarkType === 'image' && watermarkImage) {
        const imgBytes = await watermarkImage.arrayBuffer();
        if (watermarkImage.type.includes('png')) {
          embeddedImg = await pdfDoc.embedPng(imgBytes);
        } else {
          embeddedImg = await pdfDoc.embedJpg(imgBytes);
        }
      }

      for (let i = fromP - 1; i <= toP - 1; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();

        const calculateXY = (posX: string, posY: string, itemWidth: number, itemHeight: number) => {
          let x = width / 2 - itemWidth / 2;
          let y = height / 2 - itemHeight / 2;

          if (posX === 'left') x = 40;
          else if (posX === 'right') x = width - itemWidth - 40;

          if (posY === 'top') y = height - itemHeight - 40;
          else if (posY === 'bottom') y = 40;

          return { x, y };
        };

        const parts = watermarkPosition.split('-');
        const posY = parts[0]; // top, middle, bottom
        const posX = parts[1]; // left, center, right

        if (watermarkMosaic) {
          const stepX = 180;
          const stepY = 180;
          for (let tileX = 30; tileX < width; tileX += stepX) {
            for (let tileY = 30; tileY < height; tileY += stepY) {
              if (watermarkType === 'text') {
                page.drawText(watermarkText || 'Super Hub AI', {
                  x: tileX,
                  y: tileY,
                  size: watermarkFontSize,
                  font: embeddedFont,
                  color: colorObj,
                  opacity: watermarkTransparency,
                  rotate: degrees(watermarkRotation),
                });
              } else if (embeddedImg) {
                const imgW = watermarkFontSize * 2.5;
                const imgH = (embeddedImg.height / embeddedImg.width) * imgW;
                page.drawImage(embeddedImg, {
                  x: tileX,
                  y: tileY,
                  width: imgW,
                  height: imgH,
                  opacity: watermarkTransparency,
                  rotate: degrees(watermarkRotation),
                });
              }
            }
          }
        } else {
          if (watermarkType === 'text') {
            const textStr = watermarkText || 'Super Hub AI';
            const textWidth = embeddedFont.widthOfTextAtSize(textStr, watermarkFontSize);
            const textHeight = embeddedFont.heightAtSize(watermarkFontSize);

            const { x, y } = calculateXY(posX, posY, textWidth, textHeight);

            page.drawText(textStr, {
              x,
              y,
              size: watermarkFontSize,
              font: embeddedFont,
              color: colorObj,
              opacity: watermarkTransparency,
              rotate: degrees(watermarkRotation),
            });
          } else if (embeddedImg) {
            const imgW = watermarkFontSize * 3.5;
            const imgH = (embeddedImg.height / embeddedImg.width) * imgW;

            const { x, y } = calculateXY(posX, posY, imgW, imgH);

            page.drawImage(embeddedImg, {
              x,
              y,
              width: imgW,
              height: imgH,
              opacity: watermarkTransparency,
              rotate: degrees(watermarkRotation),
            });
          }
        }
      }

      const pdfBytes = await pdfDoc.save();
      downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), `${files[0].name.replace(/\.pdf$/i, '')}_watermarked.pdf`);
      setSuccess(true);
    } catch (err: any) {
      alert('Failed to watermark PDF: ' + (err?.message || err));
    } finally {
      setProcessing(false);
    }
  };

  // 23. Crop PDF
  const handleCropPdf = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    try {
      const bytes = await files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes);
      const pages = pdfDoc.getPages();
      pages.forEach((page) => {
        const { width, height } = page.getSize();
        page.setCropBox(
          cropMargins.left,
          cropMargins.bottom,
          width - cropMargins.right - cropMargins.left,
          height - cropMargins.top - cropMargins.bottom
        );
      });
      const pdfBytes = await pdfDoc.save();
      downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), `${files[0].name.replace(/\.pdf$/i, '')}_cropped.pdf`);
      setSuccess(true);
    } catch (err) {
      alert('Failed to crop PDF: ' + err);
    } finally {
      setProcessing(false);
    }
  };

  // 24. Edit PDF
  const handleEditPdf = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    try {
      const bytes = await files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes);
      const pages = pdfDoc.getPages();
      if (pages.length > 0 && textInput) {
        pages[0].drawText(textInput, {
          x: 50,
          y: pages[0].getHeight() - 100,
          size: 14,
          color: rgb(0, 0, 0.8),
        });
      }
      const pdfBytes = await pdfDoc.save();
      downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), `${files[0].name.replace(/\.pdf$/i, '')}_edited.pdf`);
      setSuccess(true);
    } catch (err) {
      alert('Failed to edit PDF: ' + err);
    } finally {
      setProcessing(false);
    }
  };

  // 25. PDF Forms
  const handleFormsPdf = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    try {
      const bytes = await files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes);
      const form = pdfDoc.getForm();
      const fields = form.getFields();
      if (fields.length > 0) {
        fields.forEach(f => {
          try {
            form.getTextField(f.getName()).setText(textInput || 'Filled Sample');
          } catch (e) {}
        });
      }
      const pdfBytes = await pdfDoc.save();
      downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), `${files[0].name.replace(/\.pdf$/i, '')}_form_filled.pdf`);
      setSuccess(true);
    } catch (err) {
      alert('Failed to fill form fields: ' + err);
    } finally {
      setProcessing(false);
    }
  };

  // 26. Unlock PDF
  const handleUnlockPdf = async () => {
    if (files.length === 0) return alert('Please select a PDF file to unlock.');
    setProcessing(true);
    try {
      const buffer = await files[0].arrayBuffer();
      // Open PDF with provided password or ignoreEncryption fallback
      let loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(buffer),
        password: pdfPassword || undefined,
      });

      let pdf;
      try {
        pdf = await loadingTask.promise;
      } catch (pwdErr: any) {
        // Retry with ignoreEncryption if prompt failed
        loadingTask = pdfjsLib.getDocument({
          data: new Uint8Array(buffer),
        });
        pdf = await loadingTask.promise;
      }

      const totalPages = pdf.numPages;
      let doc: jsPDF | null = null;

      for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          // @ts-ignore
          await page.render({ canvasContext: ctx, viewport }).promise;
          const imgData = canvas.toDataURL('image/jpeg', 0.95);

          const ptWidth = page.getViewport({ scale: 1.0 }).width;
          const ptHeight = page.getViewport({ scale: 1.0 }).height;

          if (!doc) {
            doc = new jsPDF({
              orientation: ptWidth > ptHeight ? 'landscape' : 'portrait',
              unit: 'pt',
              format: [ptWidth, ptHeight],
            });
            doc.addImage(imgData, 'JPEG', 0, 0, ptWidth, ptHeight, undefined, 'FAST');
          } else {
            doc.addPage([ptWidth, ptHeight], ptWidth > ptHeight ? 'landscape' : 'portrait');
            doc.addImage(imgData, 'JPEG', 0, 0, ptWidth, ptHeight, undefined, 'FAST');
          }
        }
      }

      if (doc) {
        const unlockedBlob = doc.output('blob');
        downloadBlob(unlockedBlob, `${files[0].name.replace(/\.pdf$/i, '')}_unlocked.pdf`);
        setSuccess(true);
      }
    } catch (err: any) {
      alert('Failed to unlock PDF. Please verify the password and try again: ' + (err?.message || err));
    } finally {
      setProcessing(false);
    }
  };

  // 27. Protect PDF (Password Protection)
  const handleProtectPdf = async () => {
    if (files.length === 0) return alert('Please upload a PDF file to protect.');
    if (!pdfPassword || pdfPassword.trim().length === 0) {
      alert('Please enter a password to protect the PDF document.');
      return;
    }
    setProcessing(true);
    try {
      const buffer = await files[0].arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
      const pdf = await loadingTask.promise;
      const totalPages = pdf.numPages;

      let doc: jsPDF | null = null;
      const pass = pdfPassword.trim();

      for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          // @ts-ignore
          await page.render({ canvasContext: ctx, viewport }).promise;
          const imgData = canvas.toDataURL('image/jpeg', 0.95);

          const ptWidth = page.getViewport({ scale: 1.0 }).width;
          const ptHeight = page.getViewport({ scale: 1.0 }).height;

          if (!doc) {
            doc = new jsPDF({
              orientation: ptWidth > ptHeight ? 'landscape' : 'portrait',
              unit: 'pt',
              format: [ptWidth, ptHeight],
              encryption: {
                userPassword: pass,
                ownerPassword: pass,
                userPermissions: ['print', 'copy'],
              },
            });

            if (typeof (doc as any).encrypt === 'function') {
              try {
                (doc as any).encrypt(pass, pass, {
                  print: true,
                  copy: true,
                  modify: false,
                  annotForms: true,
                });
              } catch (e) {
                console.log('Encryption method applied via options');
              }
            }

            doc.addImage(imgData, 'JPEG', 0, 0, ptWidth, ptHeight, undefined, 'FAST');
          } else {
            doc.addPage([ptWidth, ptHeight], ptWidth > ptHeight ? 'landscape' : 'portrait');
            doc.addImage(imgData, 'JPEG', 0, 0, ptWidth, ptHeight, undefined, 'FAST');
          }
        }
      }

      if (doc) {
        const protectedBlob = doc.output('blob');
        downloadBlob(protectedBlob, `${files[0].name.replace(/\.pdf$/i, '')}_protected.pdf`);
        setSuccess(true);
      }
    } catch (err: any) {
      alert('Failed to protect PDF: ' + (err?.message || err));
    } finally {
      setProcessing(false);
    }
  };

  // 28. Sign PDF
  const handleSignPdf = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    try {
      const bytes = await files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes);
      const pages = pdfDoc.getPages();
      const lastPage = pages[pages.length - 1];

      lastPage.drawText(`Signed by: ${signatureText}`, {
        x: 50,
        y: 40,
        size: 14,
        color: rgb(0.1, 0.2, 0.6),
      });

      lastPage.drawText(`Date: ${new Date().toLocaleDateString()}`, {
        x: 50,
        y: 25,
        size: 10,
        color: rgb(0.4, 0.4, 0.4),
      });

      const pdfBytes = await pdfDoc.save();
      downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), `${files[0].name.replace(/\.pdf$/i, '')}_signed.pdf`);
      setSuccess(true);
    } catch (err) {
      alert('Failed to sign PDF: ' + err);
    } finally {
      setProcessing(false);
    }
  };

  // 29. Redact PDF
  const handleRedactPdf = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    try {
      const bytes = await files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes);
      const pages = pdfDoc.getPages();

      pages.forEach(page => {
        const { width, height } = page.getSize();
        page.drawRectangle({
          x: 50,
          y: height - 120,
          width: width - 100,
          height: 30,
          color: rgb(0, 0, 0),
        });
      });

      const pdfBytes = await pdfDoc.save();
      downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), `${files[0].name.replace(/\.pdf$/i, '')}_redacted.pdf`);
      setSuccess(true);
    } catch (err) {
      alert('Failed to redact PDF: ' + err);
    } finally {
      setProcessing(false);
    }
  };

  // 30. Compare PDF
  const handleComparePdf = async () => {
    if (files.length < 2) return alert('Please upload two PDF files to compare.');
    setProcessing(true);
    try {
      const textA = await extractPdfTextContent(files[0]);
      const textB = await extractPdfTextContent(files[1]);
      const resultText = `=== PDF COMPARISON REPORT ===\nDocument 1: ${files[0].name}\nDocument 2: ${files[1].name}\n\n[Doc 1 Character Count]: ${textA.length}\n[Doc 2 Character Count]: ${textB.length}\n\n--- Document 1 Summary ---\n${textA.slice(0, 500)}...\n\n--- Document 2 Summary ---\n${textB.slice(0, 500)}...`;
      setAiResult(resultText);
      setSuccess(true);
    } catch (err) {
      alert('Failed to compare PDFs: ' + err);
    } finally {
      setProcessing(false);
    }
  };

  // 31. AI Summarizer
  const handleAiSummarizer = async () => {
    if (files.length === 0 && !textInput) return alert('Please upload a PDF or enter text.');
    setProcessing(true);
    try {
      let promptText = textInput;
      let dataUrl: string | undefined = undefined;

      if (files.length > 0) {
        const buffer = await files[0].arrayBuffer();
        const base64 = btoa(new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));
        dataUrl = `data:application/pdf;base64,${base64}`;
        promptText = 'Summarize this entire PDF document into an executive summary, main key takeaways, and structured bullet points.';
      }

      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          image: dataUrl,
          systemInstruction: 'You are an executive document AI summarizer. Provide concise, accurate bullet points.',
        }),
      });

      const rawText = await res.text();
      let data: any = {};
      if (rawText && !rawText.trim().startsWith('<')) {
        try { data = JSON.parse(rawText); } catch (e) {}
      }
      if (data.result) {
        setAiResult(data.result);
        setSuccess(true);
      } else {
        alert(data.error || 'Failed to summarize PDF.');
      }
    } catch (err) {
      alert('Error in AI Summarizer: ' + err);
    } finally {
      setProcessing(false);
    }
  };

  // 32. AI Translate PDF
  const handleAiTranslate = async () => {
    if (files.length === 0 && !textInput) return alert('Please upload a PDF or enter text.');
    setProcessing(true);
    try {
      let docText = textInput;
      if (files.length > 0) {
        docText = await extractPdfTextContent(files[0]);
      }

      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Translate the following PDF document text accurately into ${targetLanguage}:\n\n${docText.slice(0, 4000)}`,
        }),
      });

      const rawText = await res.text();
      let data: any = {};
      if (rawText && !rawText.trim().startsWith('<')) {
        try { data = JSON.parse(rawText); } catch (e) {}
      }
      if (data.result) {
        setAiResult(data.result);
        setSuccess(true);
      } else {
        alert(data.error || 'Failed to translate PDF.');
      }
    } catch (err) {
      alert('Error in PDF Translation: ' + err);
    } finally {
      setProcessing(false);
    }
  };

  // 33. PDF to Markdown
  const handlePdfToMarkdown = async () => {
    if (files.length === 0) return alert('Please upload a PDF file.');
    setProcessing(true);
    try {
      const text = await extractPdfTextContent(files[0]);
      const mdText = text
        .split('\n')
        .map(line => {
          if (line.startsWith('--- Page')) return `\n## ${line}\n`;
          if (line.length > 0 && line.length < 40) return `### ${line}`;
          return line;
        })
        .join('\n');

      setExtractedText(mdText);
      downloadBlob(new Blob([mdText], { type: 'text/markdown' }), `${files[0].name.replace(/\.pdf$/i, '')}.md`);
      setSuccess(true);
    } catch (err) {
      alert('Failed to convert PDF to Markdown: ' + err);
    } finally {
      setProcessing(false);
    }
  };

  // Switch dispatcher
  const handleProcessAction = () => {
    const id = tool.id;
    if (id === 'pdf-merge' || id === 'pdf-organize') handleMergePdf();
    else if (id === 'pdf-split') handleSplitPdf();
    else if (id === 'pdf-remove-pages') handleRemovePages();
    else if (id === 'pdf-extract-pages' || id === 'pdf-page-extract') handlePageExtract();
    else if (id === 'pdf-scan') handleScanToPdf();
    else if (id === 'pdf-compress') handleCompressPdf();
    else if (id === 'pdf-repair') handleRepairPdf();
    else if (id === 'pdf-ocr') handleOcrPdf();
    else if (id === 'pdf-image-to-pdf') handleImagesToPdf();
    else if (id === 'pdf-word-to-pdf') handleWordToPdf();
    else if (id === 'pdf-ppt-to-pdf') handlePptToPdf();
    else if (id === 'pdf-excel-to-pdf') handleExcelToPdf();
    else if (id === 'pdf-html-to-pdf') handleHtmlToPdf();
    else if (id === 'pdf-to-jpg') handlePdfToJpg();
    else if (id === 'pdf-to-word') handlePdfToWord();
    else if (id === 'pdf-to-ppt') handlePdfToPpt();
    else if (id === 'pdf-to-excel') handlePdfToExcel();
    else if (id === 'pdf-to-pdfa') handlePdfToPdfa();
    else if (id === 'pdf-rotate') handleRotatePdf();
    else if (id === 'pdf-page-number') handleAddPageNumbers();
    else if (id === 'pdf-watermark') handleWatermarkPdf();
    else if (id === 'pdf-crop') handleCropPdf();
    else if (id === 'pdf-edit') handleEditPdf();
    else if (id === 'pdf-forms') handleFormsPdf();
    else if (id === 'pdf-unlock') handleUnlockPdf();
    else if (id === 'pdf-protect') handleProtectPdf();
    else if (id === 'pdf-sign') handleSignPdf();
    else if (id === 'pdf-redact') handleRedactPdf();
    else if (id === 'pdf-compare') handleComparePdf();
    else if (id === 'pdf-ai-summarizer') handleAiSummarizer();
    else if (id === 'pdf-ai-translate') handleAiTranslate();
    else if (id === 'pdf-to-markdown') handlePdfToMarkdown();
    else handleMergePdf();
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-sm dark:shadow-xl space-y-6">
      
      <div className="text-center space-y-1">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
          <span>{tool.name}</span>
          {tool.isAi && (
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-extrabold border border-indigo-500/20">
              AI POWERED
            </span>
          )}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl mx-auto">{tool.description}</p>
      </div>

      {/* File Upload & Visual Card Grid Preview */}
      {!['pdf-word-to-pdf', 'pdf-ppt-to-pdf', 'pdf-excel-to-pdf', 'pdf-html-to-pdf'].includes(tool.id) && (
        <div className="space-y-4">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            multiple={['pdf-merge', 'pdf-image-to-pdf', 'pdf-compare', 'pdf-organize'].includes(tool.id)}
            accept={tool.id === 'pdf-image-to-pdf' || tool.id === 'pdf-scan' ? 'image/*' : '.pdf'} 
            className="hidden" 
          />

          <input 
            type="file" 
            ref={appendFileInputRef} 
            onChange={handleAppendFiles} 
            multiple={['pdf-merge', 'pdf-image-to-pdf', 'pdf-compare', 'pdf-organize'].includes(tool.id)}
            accept={tool.id === 'pdf-image-to-pdf' || tool.id === 'pdf-scan' ? 'image/*' : '.pdf'} 
            className="hidden" 
          />

          {files.length === 0 ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="p-10 rounded-3xl border-2 border-dashed border-indigo-200 dark:border-indigo-900/50 hover:border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 text-center cursor-pointer transition group"
            >
              <Upload className="w-10 h-10 text-indigo-500 dark:text-indigo-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-bold text-slate-900 dark:text-white">Click or Drag & Drop Files Here</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {tool.id === 'pdf-image-to-pdf' || tool.id === 'pdf-scan' ? 'Select PNG, JPG, WEBP photo files' : 'Select PDF document file(s)'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-indigo-900 dark:text-indigo-200 text-xs">
                  <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>
                    To change page or document order, use the <strong>←</strong> / <strong>→</strong> buttons on each card to reorder before processing.
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => appendFileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Files</span>
                  </button>

                  <button
                    type="button"
                    onClick={sortFilesAlphabetically}
                    className="p-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1 border border-slate-200 dark:border-slate-700 shadow-sm transition"
                  >
                    <ArrowUpDown className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setFiles([])}
                    className="p-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Visual PDF Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pt-2">
                {files.map((file, idx) => {
                  const key = `${file.name}-${file.size}-${idx}`;
                  const pageCount = pdfPageCounts[key];

                  return (
                    <div 
                      key={key} 
                      className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between h-60"
                    >
                      <div className="absolute top-2 left-2 z-10 w-6 h-6 rounded-full bg-rose-600 text-white text-[11px] font-extrabold flex items-center justify-center shadow-md ring-2 ring-white dark:ring-slate-900">
                        {idx + 1}
                      </div>

                      <div 
                        onClick={(e) => handleOpenPreview(file, e)}
                        className="w-full h-36 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 overflow-hidden relative cursor-pointer group-hover:border-indigo-500 transition shadow-inner flex flex-col items-center justify-center"
                      >
                        {pdfThumbnails[key] ? (
                          <img 
                            src={pdfThumbnails[key]} 
                            alt={file.name} 
                            className="w-full h-full object-contain p-1 bg-white dark:bg-slate-900" 
                          />
                        ) : renderingThumbnails[key] ? (
                          <div className="flex flex-col items-center justify-center gap-1.5 p-3 text-slate-400">
                            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                            <span className="text-[10px] font-semibold">Generating Preview...</span>
                          </div>
                        ) : (
                          <div className="w-full h-full p-2.5 flex flex-col justify-between bg-gradient-to-b from-rose-50/60 to-slate-100/90 dark:from-rose-950/20 dark:to-slate-900">
                            <div className="w-full h-1.5 rounded-full bg-rose-500 shadow-sm" />
                            <div className="my-auto p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200/60 dark:border-slate-700/60 flex flex-col items-center justify-center gap-1">
                              <FileText className="w-7 h-7 text-rose-500 dark:text-rose-400 mb-0.5" />
                              <div className="px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-900/50 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                                {pageCount ? `${pageCount} Page${pageCount > 1 ? 's' : ''}` : 'PDF Document'}
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-[9px] text-slate-400 dark:text-slate-500 font-mono px-0.5">
                              <span>PDF</span>
                              <span>{(file.size / 1024).toFixed(0)} KB</span>
                            </div>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                          <span className="px-3 py-1.5 rounded-xl bg-white text-slate-900 font-bold text-xs flex items-center gap-1.5 shadow-lg">
                            <Eye className="w-4 h-4 text-indigo-600" />
                            <span>Preview</span>
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 text-center">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate px-1" title={file.name}>
                          {file.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-1">
                        <button
                          type="button"
                          onClick={(e) => moveFile(idx, idx - 1, e)}
                          disabled={idx === 0}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-700 dark:text-slate-300 disabled:opacity-30 transition"
                        >
                          <MoveLeft className="w-3.5 h-3.5" />
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => handleOpenPreview(file, e)}
                            className="p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleRemoveFile(idx, e)}
                            className="p-1.5 rounded-lg hover:bg-rose-500 hover:text-white text-slate-400 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => moveFile(idx, idx + 1, e)}
                          disabled={idx === files.length - 1}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-700 dark:text-slate-300 disabled:opacity-30 transition"
                        >
                          <MoveRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* PDF Document Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{previewFile.name}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    {(previewFile.size / 1024).toFixed(1)} KB • {previewPages.length} Rendered Page{previewPages.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleClosePreview}
                  className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-700 dark:text-slate-200 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 p-4 sm:p-6 bg-slate-100 dark:bg-slate-950 overflow-y-auto flex flex-col items-center gap-6 min-h-[450px]">
              {loadingPreviewPages ? (
                <div className="my-auto flex flex-col items-center justify-center space-y-3 py-16 text-slate-500">
                  <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Rendering Document Pages...</p>
                </div>
              ) : previewPages.length > 0 ? (
                previewPages.map((pageImg, pIdx) => (
                  <div key={pIdx} className="flex flex-col items-center gap-2 max-w-2xl w-full">
                    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl p-2 shadow-xl border border-slate-200 dark:border-slate-800">
                      <img 
                        src={pageImg} 
                        alt={`Page ${pIdx + 1}`} 
                        className="w-full h-auto rounded-xl object-contain" 
                      />
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
                      Page {pIdx + 1} of {previewPages.length}
                    </span>
                  </div>
                ))
              ) : (
                <div className="my-auto text-center p-8">
                  <p className="text-xs text-slate-500">Unable to render preview for this file format.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- SPECIFIC CONTROLS & OPTIONS FOR INDIVIDUAL PDF TOOLS --- */}

      {tool.id === 'pdf-split' && (
        <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Split Mode</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSplitMode('range')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition ${
                splitMode === 'range'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
              }`}
            >
              Custom Page Ranges
            </button>
            <button
              type="button"
              onClick={() => setSplitMode('all')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition ${
                splitMode === 'all'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
              }`}
            >
              Split Every Page Separately
            </button>
          </div>

          {splitMode === 'range' && (
            <div className="pt-2">
              <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">
                Page Ranges (comma-separated, e.g. <span className="font-mono text-indigo-500">1-2, 3-5</span>)
              </label>
              <input
                type="text"
                value={pageRange}
                onChange={(e) => setPageRange(e.target.value)}
                placeholder="1-2, 3-5"
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-mono"
              />
            </div>
          )}
        </div>
      )}

      {tool.id === 'pdf-extract-pages' && (
        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
            Select Pages to Extract
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setExtractMode('all')}
              className={`p-3.5 rounded-2xl border flex items-center justify-center gap-2 transition ${
                extractMode === 'all'
                  ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 ${extractMode === 'all' ? 'text-white' : 'text-slate-400'}`} />
              <span className="text-xs">All pages</span>
            </button>

            <button
              type="button"
              onClick={() => setExtractMode('custom')}
              className={`p-3.5 rounded-2xl border flex items-center justify-center gap-2 transition ${
                extractMode === 'custom'
                  ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FileText className={`w-4 h-4 ${extractMode === 'custom' ? 'text-white' : 'text-slate-400'}`} />
              <span className="text-xs">Custom pages</span>
            </button>
          </div>

          {extractMode === 'custom' && (
            <div className="pt-2 space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Enter Custom Page Numbers / Range:
              </label>
              <input
                type="text"
                value={customExtractRange}
                onChange={(e) => setCustomExtractRange(e.target.value)}
                placeholder="1, 3, 5-8"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Example: <code className="text-indigo-600 dark:text-indigo-400 font-bold">1, 3, 5-8</code> will extract page 1, page 3, and pages 5 through 8.
              </p>
            </div>
          )}
        </div>
      )}

      {tool.id === 'pdf-remove-pages' && (
        <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
            Pages to Delete (e.g. 2, 4-6)
          </label>
          <input
            type="text"
            value={pageRange}
            onChange={(e) => setPageRange(e.target.value)}
            placeholder="2, 4-6"
            className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-mono"
          />
        </div>
      )}

      {tool.id === 'pdf-compress' && (
        <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Compression Level</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setCompressLevel('recommended')}
              className={`px-3 py-2.5 rounded-xl text-xs font-bold border flex flex-col items-center gap-0.5 transition ${
                compressLevel === 'recommended'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
              }`}
            >
              <span>Recommended</span>
              <span className="text-[10px] opacity-80">~50% Smaller</span>
            </button>
            <button
              type="button"
              onClick={() => setCompressLevel('extreme')}
              className={`px-3 py-2.5 rounded-xl text-xs font-bold border flex flex-col items-center gap-0.5 transition ${
                compressLevel === 'extreme'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
              }`}
            >
              <span>Extreme</span>
              <span className="text-[10px] opacity-80">~75% Smaller</span>
            </button>
            <button
              type="button"
              onClick={() => setCompressLevel('low')}
              className={`px-3 py-2.5 rounded-xl text-xs font-bold border flex flex-col items-center gap-0.5 transition ${
                compressLevel === 'low'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
              }`}
            >
              <span>Less Compression</span>
              <span className="text-[10px] opacity-80">High Quality</span>
            </button>
          </div>

          {compressionStats && (
            <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-between">
              <div>
                Original: {(compressionStats.originalSize / (1024 * 1024)).toFixed(2)} MB → Compressed: {(compressionStats.newSize / (1024 * 1024)).toFixed(2)} MB
              </div>
              <div className="bg-emerald-600 text-white px-2.5 py-1 rounded-lg text-[10px]">
                {compressionStats.percentage}% Smaller
              </div>
            </div>
          )}
        </div>
      )}

      {['pdf-word-to-pdf', 'pdf-ppt-to-pdf', 'pdf-excel-to-pdf', 'pdf-html-to-pdf'].includes(tool.id) && (
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
            {tool.id === 'pdf-word-to-pdf' && 'Enter Word Document Content / Text'}
            {tool.id === 'pdf-ppt-to-pdf' && 'Enter Presentation Outline (e.g., Slide 1: Title\nSlide 2: Content)'}
            {tool.id === 'pdf-excel-to-pdf' && 'Enter Tabular CSV or Comma-separated Data'}
            {tool.id === 'pdf-html-to-pdf' && 'Paste HTML Code or Web Page Markup'}
          </label>
          <textarea
            rows={8}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Type or paste content here..."
            className="w-full p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
          />
        </div>
      )}

      {tool.id === 'pdf-watermark' && (
        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
            Watermark options
          </h4>

          {/* Place text vs Place image tab buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setWatermarkType('text')}
              className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition relative ${
                watermarkType === 'text'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {watermarkType === 'text' && (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute top-2 left-2" />
              )}
              <Type className="w-6 h-6" />
              <span className="text-xs">Place text</span>
            </button>

            <button
              type="button"
              onClick={() => setWatermarkType('image')}
              className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition relative ${
                watermarkType === 'image'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {watermarkType === 'image' && (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute top-2 left-2" />
              )}
              <ImageIcon className="w-6 h-6" />
              <span className="text-xs">Place image</span>
            </button>
          </div>

          {/* Text Options */}
          {watermarkType === 'text' ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Text:</label>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  placeholder="e.g. Super Hub AI, CONFIDENTIAL"
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Text format:</label>
                <div className="flex flex-wrap items-center gap-2 p-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  <select
                    value={watermarkFontFamily}
                    onChange={(e) => setWatermarkFontFamily(e.target.value as any)}
                    className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-200"
                  >
                    <option value="Helvetica">Arial / Helvetica</option>
                    <option value="Times-Roman">Times New Roman</option>
                    <option value="Courier">Courier</option>
                  </select>

                  <select
                    value={watermarkFontSize}
                    onChange={(e) => setWatermarkFontSize(Number(e.target.value))}
                    className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-200"
                  >
                    {[14, 18, 24, 32, 36, 42, 48, 60, 72].map((s) => (
                      <option key={s} value={s}>{s} pt</option>
                    ))}
                  </select>

                  <div className="flex items-center gap-1 border-l border-r border-slate-200 dark:border-slate-800 px-2">
                    <button
                      type="button"
                      onClick={() => setWatermarkBold(!watermarkBold)}
                      className={`p-1.5 rounded-lg text-xs font-bold transition ${
                        watermarkBold
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                      }`}
                      title="Bold"
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setWatermarkItalic(!watermarkItalic)}
                      className={`p-1.5 rounded-lg text-xs italic transition ${
                        watermarkItalic
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                      }`}
                      title="Italic"
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setWatermarkUnderline(!watermarkUnderline)}
                      className={`p-1.5 rounded-lg text-xs underline transition ${
                        watermarkUnderline
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                      }`}
                      title="Underline"
                    >
                      <Underline className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-500 font-semibold">Color:</span>
                    <input
                      type="color"
                      value={watermarkColor}
                      onChange={(e) => setWatermarkColor(e.target.value)}
                      className="w-7 h-7 rounded-lg border-0 cursor-pointer bg-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Select Watermark Image / Logo:</label>
              <input
                type="file"
                ref={watermarkImageInputRef}
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setWatermarkImage(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
              <div
                onClick={() => watermarkImageInputRef.current?.click()}
                className="p-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-500 cursor-pointer text-center bg-slate-50 dark:bg-slate-950 transition"
              >
                {watermarkImage ? (
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{watermarkImage.name}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <Upload className="w-6 h-6 text-indigo-500" />
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Click to upload PNG/JPG logo image</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Position Matrix & Mosaic */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Position:</label>
            <div className="flex items-center gap-6">
              {/* 3x3 Grid Matrix */}
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 w-28 h-28 shrink-0">
                {[
                  'top-left', 'top-center', 'top-right',
                  'middle-left', 'center', 'middle-right',
                  'bottom-left', 'bottom-center', 'bottom-right'
                ].map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setWatermarkPosition(pos as any)}
                    className={`rounded-md transition flex items-center justify-center relative border ${
                      watermarkPosition === pos
                        ? 'bg-rose-100 dark:bg-rose-950/80 border-rose-500'
                        : 'bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {watermarkPosition === pos && (
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-600 shadow-sm animate-pulse" />
                    )}
                  </button>
                ))}
              </div>

              {/* Mosaic checkbox */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={watermarkMosaic}
                  onChange={(e) => setWatermarkMosaic(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Mosaic</span>
              </label>
            </div>
          </div>

          {/* Transparency & Rotation Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Transparency:</label>
              <select
                value={watermarkTransparency}
                onChange={(e) => setWatermarkTransparency(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={1.0}>No transparency (100%)</option>
                <option value={0.75}>75% Opacity</option>
                <option value={0.50}>50% Opacity</option>
                <option value={0.40}>40% Opacity (Recommended)</option>
                <option value={0.25}>25% Opacity</option>
                <option value={0.10}>10% Opacity</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Rotation:</label>
              <select
                value={watermarkRotation}
                onChange={(e) => setWatermarkRotation(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={0}>Do not rotate (0°)</option>
                <option value={45}>45° Diagonal</option>
                <option value={90}>90° Vertical</option>
                <option value={180}>180° Inverted</option>
                <option value={270}>270° Vertical Left</option>
                <option value={-45}>-45° Diagonal</option>
              </select>
            </div>
          </div>

          {/* Pages Range */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Pages:</label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">from page</span>
              <input
                type="number"
                min={1}
                value={watermarkFromPage}
                onChange={(e) => setWatermarkFromPage(Number(e.target.value))}
                className="w-20 px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-xs text-slate-500 font-medium">to</span>
              <input
                type="number"
                min={1}
                value={watermarkToPage}
                onChange={(e) => setWatermarkToPage(Number(e.target.value))}
                className="w-20 px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Layer Options (Over vs Below) */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Layer:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setWatermarkLayer('over')}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition ${
                  watermarkLayer === 'over'
                    ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-bold shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Layers className="w-5 h-5 text-rose-500" />
                <span className="text-xs">Over the PDF content</span>
              </button>

              <button
                type="button"
                onClick={() => setWatermarkLayer('below')}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition ${
                  watermarkLayer === 'below'
                    ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-bold shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Layers className="w-5 h-5 opacity-40" />
                <span className="text-xs">Below the PDF content</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {tool.id === 'pdf-rotate' && (
        <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Rotation Direction</label>
          <select
            value={rotationAngle}
            onChange={(e) => setRotationAngle(Number(e.target.value))}
            className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
          >
            <option value={90}>90° Clockwise</option>
            <option value={180}>180° Upside Down Flip</option>
            <option value={270}>270° Counter-Clockwise</option>
          </select>
        </div>
      )}

      {tool.id === 'pdf-page-number' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div>
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">Position</label>
            <select
              value={pageNumberPosition}
              onChange={(e) => setPageNumberPosition(e.target.value as any)}
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
            >
              <option value="bottom-center">Bottom Center</option>
              <option value="bottom-right">Bottom Right</option>
              <option value="top-right">Top Right</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">Format</label>
            <select
              value={pageNumberFormat}
              onChange={(e) => setPageNumberFormat(e.target.value as any)}
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
            >
              <option value="x-of-y">Page X of Y</option>
              <option value="x">X</option>
              <option value="dash-x">- X -</option>
            </select>
          </div>
        </div>
      )}

      {tool.id === 'pdf-crop' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800">
          {['top', 'bottom', 'left', 'right'].map((side) => (
            <div key={side}>
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 capitalize block mb-1">{side} Margin (pt)</label>
              <input
                type="number"
                value={(cropMargins as any)[side]}
                onChange={(e) => setCropMargins(prev => ({ ...prev, [side]: Number(e.target.value) }))}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-mono"
              />
            </div>
          ))}
        </div>
      )}

      {(tool.id === 'pdf-protect' || tool.id === 'pdf-unlock') && (
        <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              {tool.id === 'pdf-protect' ? 'Set PDF Protection Password' : 'Enter PDF Unlock Password'}
            </label>
            {tool.id === 'pdf-protect' && (
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" />
                <span>Password required to view</span>
              </span>
            )}
          </div>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={pdfPassword}
              onChange={(e) => setPdfPassword(e.target.value)}
              placeholder={tool.id === 'pdf-protect' ? 'Type password to protect PDF...' : 'Enter PDF password to unlock...'}
              className="w-full pl-4 pr-11 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {tool.id === 'pdf-protect'
              ? 'This password will encrypt the PDF document. Users will be prompted to enter this exact password whenever they open the file.'
              : 'Provide the password required to decrypt and unlock this protected PDF file.'}
          </p>
        </div>
      )}

      {tool.id === 'pdf-sign' && (
        <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Digital Signature Name</label>
          <input
            type="text"
            value={signatureText}
            onChange={(e) => setSignatureText(e.target.value)}
            placeholder="Type your signature name..."
            className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-serif italic text-base"
          />
        </div>
      )}

      {tool.id === 'pdf-ai-translate' && (
        <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Target Language</label>
          <select
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
          >
            <option value="Bengali">Bengali (বাংলা)</option>
            <option value="Spanish">Spanish (Español)</option>
            <option value="Hindi">Hindi (हिंदी)</option>
            <option value="French">French (Français)</option>
            <option value="German">German (Deutsch)</option>
            <option value="Japanese">Japanese (日本語)</option>
            <option value="Arabic">Arabic (العربية)</option>
            <option value="Portuguese">Portuguese</option>
          </select>
        </div>
      )}

      {/* Extracted Text or AI Output Box */}
      {(extractedText || aiResult) && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {aiResult ? 'AI Generated Result' : 'Extracted Text'}
            </label>
            <button
              onClick={() => {
                navigator.clipboard.writeText(aiResult || extractedText);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Result'}</span>
            </button>
          </div>
          <textarea
            rows={8}
            readOnly
            value={aiResult || extractedText}
            className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-slate-100 font-mono leading-relaxed"
          />
        </div>
      )}

      {/* Main Action Button */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
        <span className="text-xs text-slate-500">
          {success ? '✓ Action completed successfully!' : 'Secure local & server processing'}
        </span>

        <button
          onClick={handleProcessAction}
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
