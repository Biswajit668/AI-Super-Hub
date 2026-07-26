import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Copy,
  Check,
  Download,
  Upload,
  Search,
  Sparkles,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Maximize2,
  Minimize2,
  Eye,
  Edit3,
  Sun,
  Moon,
  Palette,
  Clock,
  Type,
  Share2,
  Printer,
  Pin,
  Tag,
  RefreshCw,
  X,
  FileCode,
  Table,
  Calendar,
  Columns,
  Target,
  Wand2,
  FileDown
} from 'lucide-react';
import { ToolItem } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  pinned?: boolean;
  tags?: string[];
  targetWords?: number;
}

const DEFAULT_NOTES: Note[] = [
  {
    id: 'note-welcome',
    title: 'Welcome to Online Notepad 📝',
    content: `# Welcome to Online Notepad!

This is a fast, distraction-free, feature-rich online notepad and text editor that auto-saves your work in real time.

## 🚀 Key Features:
- **Auto-Save**: Everything you type is automatically saved locally.
- **Rich Formatting & Markdown**: Write in plain text, rich style, or markdown.
- **AI Writing Assistant**: Fix grammar, summarize, rephrase, expand, or translate using Gemini AI.
- **Multiple Notes**: Easily create, pin, search, and switch between multiple notes.
- **Export & Import**: Download as .txt, .md, .html, or print to PDF.
- **Live Document Stats**: Track word count, character count, and reading time in real-time.
- **Focus Mode & Themes**: Switch between Light, Dark, Sepia, and Fullscreen views.

### 💡 Quick Checklist for Today:
- [x] Try editing this note
- [ ] Create a new note using the '+' button
- [ ] Test the AI Grammar & Rephraser tool
- [ ] Export your note as Markdown or TXT

Enjoy seamless note-taking!`,
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now(),
    pinned: true,
    tags: ['Welcome', 'Guide'],
    targetWords: 250
  }
];

interface OnlineNotepadProps {
  tool: ToolItem;
}

export const OnlineNotepad: React.FC<OnlineNotepadProps> = ({ tool }) => {
  const { recordHistory } = useAuth();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Notes state
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem('online_notepad_notes_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load notes', e);
    }
    return DEFAULT_NOTES;
  });

  const [activeNoteId, setActiveNoteId] = useState<string>(() => {
    return notes[0]?.id || 'note-welcome';
  });

  const activeNote = notes.find((n) => n.id === activeNoteId) || notes[0] || DEFAULT_NOTES[0];

  // Editor states
  const [title, setTitle] = useState(activeNote.title);
  const [content, setContent] = useState(activeNote.content);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // UI preferences
  const [viewMode, setViewMode] = useState<'editor' | 'preview' | 'split'>('editor');
  const [editorTheme, setEditorTheme] = useState<'default' | 'dark' | 'sepia' | 'midnight'>('default');
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif' | 'mono'>('sans');
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [lineSpacing, setLineSpacing] = useState<'tight' | 'normal' | 'relaxed'>('normal');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [targetWordGoal, setTargetWordGoal] = useState<number>(activeNote.targetWords || 0);

  // Save Indicator state
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<string>('Just now');
  const [copied, setCopied] = useState(false);

  // Find & Replace
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [matchCase, setMatchCase] = useState(false);

  // AI Assistant Drawer
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiAction, setAiAction] = useState<'grammar' | 'summarize' | 'expand' | 'tone' | 'translate' | 'title'>('grammar');
  const [aiTone, setAiTone] = useState('professional');
  const [aiTargetLang, setAiTargetLang] = useState('Spanish');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiOutput, setAiOutput] = useState('');

  // Sync editor content when switching active note
  useEffect(() => {
    if (activeNote) {
      setTitle(activeNote.title);
      setContent(activeNote.content);
      setTargetWordGoal(activeNote.targetWords || 0);
    }
  }, [activeNoteId]);

  // Save to localStorage & update state
  useEffect(() => {
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      setNotes((prevNotes) => {
        const updated = prevNotes.map((n) => {
          if (n.id === activeNoteId) {
            return {
              ...n,
              title: title.trim() || 'Untitled Note',
              content,
              updatedAt: Date.now(),
              targetWords: targetWordGoal
            };
          }
          return n;
        });
        try {
          localStorage.setItem('online_notepad_notes_v2', JSON.stringify(updated));
        } catch (e) {
          console.error('Failed to save to localStorage', e);
        }
        return updated;
      });
      setSaveStatus('saved');
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 500);

    return () => clearTimeout(timer);
  }, [title, content, activeNoteId, targetWordGoal]);

  // Create new note
  const handleCreateNote = () => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: 'New Note',
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      pinned: false,
      tags: ['General']
    };
    setNotes((prev) => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
    setTitle(newNote.title);
    setContent(newNote.content);
    recordHistory(tool.id, tool.name, 'Create Note', 'Created new note');
  };

  // Delete note
  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (notes.length <= 1) {
      alert('You must keep at least one note.');
      return;
    }
    if (confirm('Are you sure you want to delete this note?')) {
      const filtered = notes.filter((n) => n.id !== id);
      setNotes(filtered);
      try {
        localStorage.setItem('online_notepad_notes_v2', JSON.stringify(filtered));
      } catch (err) {
        console.error(err);
      }
      if (activeNoteId === id) {
        setActiveNoteId(filtered[0].id);
      }
    }
  };

  // Duplicate note
  const handleDuplicateNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const sourceNote = notes.find((n) => n.id === id);
    if (!sourceNote) return;
    const duplicated: Note = {
      ...sourceNote,
      id: `note-${Date.now()}`,
      title: `${sourceNote.title} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setNotes((prev) => [duplicated, ...prev]);
    setActiveNoteId(duplicated.id);
  };

  // Toggle Pin
  const handleTogglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n))
    );
  };

  // Format Helper: Insert markdown or text wrapper at cursor
  const insertFormatting = (prefix: string, suffix = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    let replacement = '';
    if (selectedText) {
      replacement = `${prefix}${selectedText}${suffix}`;
    } else {
      replacement = `${prefix}${suffix}`;
    }

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    // Reposition cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 10);
  };

  // Insert bullet or task
  const insertLinePrefix = (linePrefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // Find start of line
    const beforeCursor = content.substring(0, start);
    const lastNewline = beforeCursor.lastIndexOf('\n');
    const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;

    const newContent =
      content.substring(0, lineStart) + linePrefix + content.substring(lineStart);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + linePrefix.length, end + linePrefix.length);
    }, 10);
  };

  // Insert current timestamp
  const insertTimestamp = () => {
    const nowStr = `[${new Date().toLocaleString()}] `;
    insertFormatting(nowStr);
  };

  // Find & Replace action
  const handleFindReplace = () => {
    if (!findText) return;
    try {
      const flags = matchCase ? 'g' : 'gi';
      const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
      const updated = content.replace(regex, replaceText);
      setContent(updated);
    } catch (e: any) {
      alert('Replace failed: ' + e.message);
    }
  };

  // Analytics
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;
  const charNoSpaces = content.replace(/\s/g, '').length;
  const sentenceCount = content.trim() ? content.split(/[.!?]+/).filter(Boolean).length : 0;
  const paragraphCount = content.trim() ? content.split(/\n\s*\n/).filter(Boolean).length : 0;
  const lineCount = content ? content.split('\n').length : 0;
  const readingTimeMinutes = Math.ceil(wordCount / 200);
  const speakingTimeMinutes = Math.ceil(wordCount / 130);

  // Word Goal percentage
  const goalProgress = targetWordGoal > 0 ? Math.min(100, Math.round((wordCount / targetWordGoal) * 100)) : 0;

  // Copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export handlers
  const downloadFile = (data: string, filename: string, type: string) => {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    recordHistory(tool.id, tool.name, 'Export', filename);
  };

  const handleExportTxt = () => {
    const safeTitle = (title || 'notepad').toLowerCase().replace(/[^a-z0-9]/g, '_');
    downloadFile(content, `${safeTitle}.txt`, 'text/plain');
  };

  const handleExportMd = () => {
    const safeTitle = (title || 'notepad').toLowerCase().replace(/[^a-z0-9]/g, '_');
    downloadFile(content, `${safeTitle}.md`, 'text/markdown');
  };

  const handleExportHtml = () => {
    const safeTitle = (title || 'notepad').toLowerCase().replace(/[^a-z0-9]/g, '_');
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title || 'Note'}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 20px; color: #1e293b; }
    h1, h2, h3 { color: #0f172a; }
    pre { background: #f1f5f9; padding: 16px; border-radius: 8px; overflow-x: auto; }
    blockquote { border-left: 4px solid #cbd5e1; margin: 0; padding-left: 16px; color: #64748b; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div>${renderMarkdownToHtml(content)}</div>
</body>
</html>`;
    downloadFile(htmlContent, `${safeTitle}.html`, 'text/html');
  };

  const handlePrint = () => {
    window.print();
  };

  // Import file
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text !== undefined) {
        const fileTitle = file.name.replace(/\.[^/.]+$/, '');
        const newNote: Note = {
          id: `note-${Date.now()}`,
          title: fileTitle,
          content: text,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          tags: ['Imported']
        };
        setNotes((prev) => [newNote, ...prev]);
        setActiveNoteId(newNote.id);
      }
    };
    reader.readAsText(file);
  };

  // AI Assistant Call
  const handleRunAiAssistant = async () => {
    if (!content.trim()) {
      alert('Please write some content first before running AI actions.');
      return;
    }

    setAiLoading(true);
    setAiOutput('');

    let prompt = '';
    let systemInstruction = 'You are a professional editor and AI writing assistant. Provide direct, high quality results without unnecessary conversational conversational filler.';

    if (aiAction === 'grammar') {
      prompt = `Proofread and correct all grammar, spelling, punctuation, and stylistic flaws in the following text. Return the complete corrected text:\n\n${content}`;
    } else if (aiAction === 'summarize') {
      prompt = `Provide a clean, bulleted summary and key takeaways of the following text:\n\n${content}`;
    } else if (aiAction === 'expand') {
      prompt = `Continue and expand logically upon the following text, adding detailed insights and relevant ideas:\n\n${content}`;
    } else if (aiAction === 'tone') {
      prompt = `Rewrite the following text in a ${aiTone} tone while preserving all core facts and intent:\n\n${content}`;
    } else if (aiAction === 'translate') {
      prompt = `Translate the following text accurately into ${aiTargetLang}:\n\n${content}`;
    } else if (aiAction === 'title') {
      prompt = `Generate 5 catchy, relevant titles and 3 tags for the following note content:\n\n${content}`;
    }

    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          systemInstruction,
          model: 'gemini-2.5-flash'
        })
      });

      const contentType = res.headers.get('content-type') || '';
      let data: any = {};
      if (contentType.includes('application/json')) {
        try {
          data = await res.json();
        } catch (e) {
          data = { error: 'Invalid JSON response from server.' };
        }
      } else {
        data = { error: 'Server returned HTML or non-JSON response.' };
      }

      if (data.result) {
        setAiOutput(data.result);
        if (aiAction === 'title') {
          // extract first title line if possible
          const lines = data.result.split('\n').map((l: string) => l.trim()).filter(Boolean);
          if (lines[0]) {
            const cleanTitle = lines[0].replace(/^[0-9.#*\-\s]+/, '');
            if (cleanTitle && cleanTitle.length < 60) {
              setTitle(cleanTitle);
            }
          }
        }
      } else {
        setAiOutput('⚠️ Failed to generate AI response. ' + (data.error || 'Check API connection.'));
      }
    } catch (err: any) {
      setAiOutput('⚠️ Error calling AI service: ' + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const applyAiOutputToContent = (mode: 'replace' | 'append') => {
    if (!aiOutput) return;
    if (mode === 'replace') {
      setContent(aiOutput);
    } else {
      setContent((prev) => `${prev}\n\n---\n${aiOutput}`);
    }
    setShowAiModal(false);
  };

  // Filter notes by search query or tag
  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag ? n.tags?.includes(selectedTag) : true;
    return matchesSearch && matchesTag;
  });

  // Collect all tags
  const allTags = Array.from(new Set(notes.flatMap((n) => n.tags || [])));

  // Simple Markdown Renderer helper for preview
  function renderMarkdownToHtml(mdText: string): string {
    if (!mdText) return '<p class="text-slate-400 italic">Empty note...</p>';
    
    let html = mdText
      // Escaping HTML
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-4 mb-2 text-slate-800 dark:text-slate-200">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-5 mb-2 text-slate-900 dark:text-white">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-black mt-6 mb-3 text-slate-900 dark:text-white">$1</h1>')
      // Blockquotes
      .replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-indigo-500 pl-4 py-1 italic my-3 text-slate-600 dark:text-slate-400">$1</blockquote>')
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-slate-950 text-slate-100 p-4 rounded-xl font-mono text-xs my-3 overflow-x-auto"><code>$1</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code class="bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>')
      // Checkboxes
      .replace(/^- \[x\] (.*$)/gim, '<div class="flex items-center gap-2 my-1 text-emerald-600 dark:text-emerald-400 font-medium"><span class="w-4 h-4 rounded bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-xs">✓</span> <span class="line-through">$1</span></div>')
      .replace(/^- \[ \] (.*$)/gim, '<div class="flex items-center gap-2 my-1 text-slate-700 dark:text-slate-300"><span class="w-4 h-4 rounded border border-slate-400 inline-block"></span> $1</div>')
      // Bullet lists
      .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc my-0.5 text-slate-700 dark:text-slate-300">$1</li>')
      // Bold & Italic
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/~~(.*?)~~/g, '<del>$1</del>')
      // Line breaks to paragraphs
      .replace(/\n\n/g, '</p><p class="my-2 text-slate-800 dark:text-slate-200">');

    return `<p class="my-2 text-slate-800 dark:text-slate-200">${html}</p>`;
  }

  // Theme styling classes
  const getEditorThemeStyles = () => {
    switch (editorTheme) {
      case 'dark':
        return 'bg-slate-950 text-slate-100 border-slate-800';
      case 'sepia':
        return 'bg-[#fbf0d9] text-[#433422] border-[#e8d5b7] placeholder-[#a68c6d]';
      case 'midnight':
        return 'bg-[#0f172a] text-[#f8fafc] border-[#1e293b]';
      default:
        return 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-800';
    }
  };

  const getFontFamilyClass = () => {
    if (fontFamily === 'serif') return 'font-serif';
    if (fontFamily === 'mono') return 'font-mono';
    return 'font-sans';
  };

  const getFontSizeClass = () => {
    if (fontSize === 'sm') return 'text-xs sm:text-sm';
    if (fontSize === 'lg') return 'text-base sm:text-lg';
    if (fontSize === 'xl') return 'text-lg sm:text-xl';
    return 'text-sm sm:text-base';
  };

  const getLineSpacingClass = () => {
    if (lineSpacing === 'tight') return 'leading-tight';
    if (lineSpacing === 'relaxed') return 'leading-relaxed';
    return 'leading-normal';
  };

  return (
    <div className={`w-full max-w-7xl mx-auto rounded-3xl transition-all ${
      isFullscreen
        ? 'fixed inset-0 z-50 rounded-none bg-slate-950 text-slate-100 p-4 overflow-y-auto'
        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xl p-3 sm:p-6 space-y-4'
    }`}>
      
      {/* HEADER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        
        {/* Left Title & Save Status */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              Online Notepad
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Auto-Saved
              </span>
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span>{saveStatus === 'saving' ? 'Saving changes...' : `Saved at ${lastSavedTime}`}</span>
              <span>•</span>
              <span>{wordCount} Words</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* AI Helper Button */}
          <button
            onClick={() => setShowAiModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Assistant
          </button>

          {/* New Note */}
          <button
            onClick={handleCreateNote}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            New Note
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>

          {/* Export Menu */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all">
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
            <div className="absolute right-0 top-full mt-1 hidden group-hover:flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-30 p-1.5 min-w-[150px]">
              <button onClick={handleExportTxt} className="text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-medium flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-blue-500" /> Plain Text (.txt)
              </button>
              <button onClick={handleExportMd} className="text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-medium flex items-center gap-2">
                <FileCode className="w-3.5 h-3.5 text-purple-500" /> Markdown (.md)
              </button>
              <button onClick={handleExportHtml} className="text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-medium flex items-center gap-2">
                <Code className="w-3.5 h-3.5 text-amber-500" /> HTML File (.html)
              </button>
              <button onClick={handlePrint} className="text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-medium flex items-center gap-2">
                <Printer className="w-3.5 h-3.5 text-emerald-500" /> Print / Save PDF
              </button>
            </div>
          </div>

          {/* Import File Button */}
          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer transition-all">
            <Upload className="w-3.5 h-3.5" />
            Import
            <input type="file" accept=".txt,.md,.text" onChange={handleImportFile} className="hidden" />
          </label>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all"
            title="Toggle Focus Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* MAIN LAYOUT: SIDEBAR + EDITOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[550px]">
        
        {/* LEFT NOTES MANAGER SIDEBAR (3 Cols) */}
        <div className="lg:col-span-3 space-y-3 p-3 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col">
          
          {/* Search Notes */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Tags Filter */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                  selectedTag === null
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                }`}
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                    selectedTag === tag
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}

          {/* Notes List */}
          <div className="flex-1 overflow-y-auto max-h-[420px] space-y-2 pr-1 custom-scrollbar">
            {filteredNotes.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">No notes found.</div>
            ) : (
              filteredNotes.map((note) => {
                const isActive = note.id === activeNoteId;
                return (
                  <div
                    key={note.id}
                    onClick={() => setActiveNoteId(note.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer relative group ${
                      isActive
                        ? 'bg-white dark:bg-slate-900 border-indigo-500/50 shadow-md ring-1 ring-indigo-500/20'
                        : 'bg-white/60 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 hover:bg-white dark:hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="text-xs font-bold truncate text-slate-900 dark:text-white flex items-center gap-1">
                        {note.pinned && <Pin className="w-3 h-3 text-amber-500 fill-amber-500" />}
                        {note.title || 'Untitled Note'}
                      </h4>
                      
                      {/* Action buttons on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        <button
                          onClick={(e) => handleTogglePin(note.id, e)}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-amber-500"
                          title="Pin note"
                        >
                          <Pin className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => handleDuplicateNote(note.id, e)}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-indigo-500"
                          title="Duplicate"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteNote(note.id, e)}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-rose-500"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 font-mono">
                      {note.content || 'Empty note...'}
                    </p>

                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                      <span>{note.content.trim() ? note.content.trim().split(/\s+/).length : 0} words</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT MAIN EDITOR AREA (9 Cols) */}
        <div className="lg:col-span-9 flex flex-col space-y-3">
          
          {/* TOOLBAR & CONTROLS */}
          <div className="p-2.5 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
            
            {/* Formatting Tools */}
            <div className="flex flex-wrap items-center gap-1">
              <button onClick={() => insertFormatting('**', '**')} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300" title="Bold (**text**)">
                <Bold className="w-4 h-4" />
              </button>
              <button onClick={() => insertFormatting('*', '*')} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300" title="Italic (*text*)">
                <Italic className="w-4 h-4" />
              </button>
              <button onClick={() => insertFormatting('~~', '~~')} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300" title="Strikethrough (~~text~~)">
                <Strikethrough className="w-4 h-4" />
              </button>
              <button onClick={() => insertFormatting('<u>', '</u>')} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300" title="Underline">
                <Underline className="w-4 h-4" />
              </button>
              
              <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />

              <button onClick={() => insertLinePrefix('# ')} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300" title="Heading 1">
                <Heading1 className="w-4 h-4" />
              </button>
              <button onClick={() => insertLinePrefix('## ')} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300" title="Heading 2">
                <Heading2 className="w-4 h-4" />
              </button>
              <button onClick={() => insertLinePrefix('### ')} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300" title="Heading 3">
                <Heading3 className="w-4 h-4" />
              </button>

              <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />

              <button onClick={() => insertLinePrefix('- ')} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300" title="Bullet List">
                <List className="w-4 h-4" />
              </button>
              <button onClick={() => insertLinePrefix('1. ')} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300" title="Numbered List">
                <ListOrdered className="w-4 h-4" />
              </button>
              <button onClick={() => insertLinePrefix('- [ ] ')} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300" title="Task List Checkbox">
                <CheckSquare className="w-4 h-4" />
              </button>
              <button onClick={() => insertLinePrefix('> ')} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300" title="Blockquote">
                <Quote className="w-4 h-4" />
              </button>
              <button onClick={() => insertFormatting('`', '`')} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300" title="Inline Code">
                <Code className="w-4 h-4" />
              </button>

              <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />

              <button onClick={insertTimestamp} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300" title="Insert Timestamp">
                <Calendar className="w-4 h-4" />
              </button>
              <button onClick={() => setShowFindReplace(!showFindReplace)} className={`p-1.5 rounded-lg ${showFindReplace ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`} title="Find & Replace">
                <Search className="w-4 h-4" />
              </button>
            </div>

            {/* View Mode & Typography Preferences */}
            <div className="flex items-center gap-2">
              
              {/* Font Family */}
              <select
                value={fontFamily}
                onChange={(e: any) => setFontFamily(e.target.value)}
                className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold"
              >
                <option value="sans">Sans-Serif</option>
                <option value="serif">Serif</option>
                <option value="mono">Monospace</option>
              </select>

              {/* Font Size */}
              <select
                value={fontSize}
                onChange={(e: any) => setFontSize(e.target.value)}
                className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold"
              >
                <option value="sm">Small Text</option>
                <option value="base">Medium Text</option>
                <option value="lg">Large Text</option>
                <option value="xl">XL Text</option>
              </select>

              {/* Theme Picker */}
              <select
                value={editorTheme}
                onChange={(e: any) => setEditorTheme(e.target.value)}
                className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold"
              >
                <option value="default">Default Theme</option>
                <option value="dark">Dark Theme</option>
                <option value="sepia">Warm Sepia</option>
                <option value="midnight">Midnight Blue</option>
              </select>

              {/* View Switcher (Editor / Preview / Split) */}
              <div className="flex rounded-xl bg-slate-200 dark:bg-slate-800 p-0.5">
                <button
                  onClick={() => setViewMode('editor')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    viewMode === 'editor' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Edit3 className="w-3 h-3 inline mr-1" /> Edit
                </button>
                <button
                  onClick={() => setViewMode('preview')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    viewMode === 'preview' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Eye className="w-3 h-3 inline mr-1" /> Preview
                </button>
                <button
                  onClick={() => setViewMode('split')}
                  className={`hidden sm:inline-flex px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    viewMode === 'split' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Columns className="w-3 h-3 inline mr-1" /> Split
                </button>
              </div>
            </div>
          </div>

          {/* FIND & REPLACE COLLAPSIBLE BAR */}
          {showFindReplace && (
            <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-2xl flex flex-wrap items-center gap-3">
              <input
                type="text"
                value={findText}
                onChange={(e) => setFindText(e.target.value)}
                placeholder="Find text..."
                className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs flex-1"
              />
              <input
                type="text"
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                placeholder="Replace with..."
                className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs flex-1"
              />
              <label className="flex items-center gap-1 text-xs cursor-pointer">
                <input type="checkbox" checked={matchCase} onChange={(e) => setMatchCase(e.target.checked)} className="rounded" /> Match Case
              </label>
              <button onClick={handleFindReplace} className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold">
                Replace All
              </button>
            </div>
          )}

          {/* NOTE TITLE INPUT */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note Title..."
            className="w-full px-4 py-2 bg-transparent text-xl font-black text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none border-b border-slate-200/60 dark:border-slate-800/60"
          />

          {/* EDITOR / PREVIEW CANVAS */}
          <div className="flex-1 flex gap-4 min-h-[400px]">
            
            {/* Editor Textarea */}
            {(viewMode === 'editor' || viewMode === 'split') && (
              <div className="flex-1 flex flex-col">
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Type or paste your notes here..."
                  className={`w-full flex-1 p-4 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-y transition-all ${getEditorThemeStyles()} ${getFontFamilyClass()} ${getFontSizeClass()} ${getLineSpacingClass()}`}
                />
              </div>
            )}

            {/* Live Markdown Preview */}
            {(viewMode === 'preview' || viewMode === 'split') && (
              <div className={`flex-1 p-5 rounded-2xl border overflow-y-auto max-h-[500px] ${getEditorThemeStyles()} ${getFontFamilyClass()}`}>
                <div
                  className="prose dark:prose-invert max-w-none text-xs sm:text-sm"
                  dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(content) }}
                />
              </div>
            )}
          </div>

          {/* FOOTER LIVE STATS BAR */}
          <div className="p-3 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-4 text-slate-600 dark:text-slate-400 font-medium">
              <span><strong>{wordCount}</strong> Words</span>
              <span><strong>{charCount}</strong> Chars ({charNoSpaces} no space)</span>
              <span><strong>{sentenceCount}</strong> Sentences</span>
              <span><strong>{lineCount}</strong> Lines</span>
              <span><strong>{readingTimeMinutes}m</strong> Read</span>
              <span><strong>{speakingTimeMinutes}m</strong> Speak</span>
            </div>

            {/* Target Word Goal Progress */}
            <div className="flex items-center gap-2">
              <Target className="w-3.5 h-3.5 text-indigo-500" />
              <input
                type="number"
                value={targetWordGoal || ''}
                onChange={(e) => setTargetWordGoal(Number(e.target.value))}
                placeholder="Word goal..."
                className="w-20 px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-center text-[11px]"
              />
              {targetWordGoal > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="w-16 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-300"
                      style={{ width: `${goalProgress}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">{goalProgress}%</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI ASSISTANT MODAL */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-2xl w-full space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowAiModal(false)}
              className="absolute right-4 top-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold">
                <Wand2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Writing Assistant</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Enhance, correct, or transform your note content with Gemini AI</p>
              </div>
            </div>

            {/* Actions Switcher */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <button
                onClick={() => setAiAction('grammar')}
                className={`p-2.5 rounded-xl border text-left font-bold transition-all ${
                  aiAction === 'grammar' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}
              >
                🧹 Fix Grammar
              </button>
              <button
                onClick={() => setAiAction('summarize')}
                className={`p-2.5 rounded-xl border text-left font-bold transition-all ${
                  aiAction === 'summarize' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}
              >
                📝 Summarize Note
              </button>
              <button
                onClick={() => setAiAction('expand')}
                className={`p-2.5 rounded-xl border text-left font-bold transition-all ${
                  aiAction === 'expand' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}
              >
                🚀 Expand / Continue
              </button>
              <button
                onClick={() => setAiAction('tone')}
                className={`p-2.5 rounded-xl border text-left font-bold transition-all ${
                  aiAction === 'tone' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}
              >
                🎨 Change Tone
              </button>
              <button
                onClick={() => setAiAction('translate')}
                className={`p-2.5 rounded-xl border text-left font-bold transition-all ${
                  aiAction === 'translate' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}
              >
                🌐 Translate
              </button>
              <button
                onClick={() => setAiAction('title')}
                className={`p-2.5 rounded-xl border text-left font-bold transition-all ${
                  aiAction === 'title' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}
              >
                🏷️ Generate Title
              </button>
            </div>

            {/* Custom parameters */}
            {aiAction === 'tone' && (
              <div className="flex items-center gap-2 text-xs">
                <span>Select Tone:</span>
                <select
                  value={aiTone}
                  onChange={(e) => setAiTone(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="professional">Professional & Formal</option>
                  <option value="casual">Casual & Friendly</option>
                  <option value="academic">Academic & Precise</option>
                  <option value="concise">Short & Concise</option>
                  <option value="creative">Creative & Engaging</option>
                </select>
              </div>
            )}

            {aiAction === 'translate' && (
              <div className="flex items-center gap-2 text-xs">
                <span>Target Language:</span>
                <input
                  type="text"
                  value={aiTargetLang}
                  onChange={(e) => setAiTargetLang(e.target.value)}
                  placeholder="e.g. Spanish, French, Bengali..."
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex-1"
                />
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleRunAiAssistant}
              disabled={aiLoading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {aiLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {aiLoading ? 'AI is processing...' : 'Generate with Gemini AI'}
            </button>

            {/* AI Output Display */}
            {aiOutput && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">AI Suggestion Result:</label>
                <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs max-h-48 overflow-y-auto font-mono whitespace-pre-wrap">
                  {aiOutput}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => applyAiOutputToContent('replace')}
                    className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                  >
                    Replace Current Note
                  </button>
                  <button
                    onClick={() => applyAiOutputToContent('append')}
                    className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold"
                  >
                    Append to Note
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
