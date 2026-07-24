import React, { useState, useEffect } from 'react';
import { 
  Copy, 
  Check, 
  Hash, 
  Type, 
  Key, 
  QrCode, 
  Code2, 
  FileCode, 
  Edit3, 
  RefreshCw,
  Search,
  ArrowUpDown,
  Scissors,
  Columns,
  Eraser,
  ListFilter,
  Filter,
  Sparkles,
  Shuffle,
  Mail,
  Link as LinkIcon,
  PlusCircle,
  Minimize2,
  FileDiff,
  Download,
  User
} from 'lucide-react';
import { ToolItem } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  toUpsideDown,
  toUnicodeBold,
  toUnicodeItalic,
  toUnicodeCursive,
  toUnicodeOldEnglish,
  normalizeUnicodeText,
  generatePronounceablePassword,
  generateUsernames,
  getRandomWords
} from '../../lib/textUtils';

import { OnlineNotepad } from './OnlineNotepad';

interface TextToolRunnerProps {
  tool: ToolItem;
}

export const TextToolRunner: React.FC<TextToolRunnerProps> = ({ tool }) => {
  if (tool.id === 'text-online-notepad') {
    return <OnlineNotepad tool={tool} />;
  }

  const { recordHistory } = useAuth();
  
  // Generic state
  const [inputText, setInputText] = useState('');
  const [inputTextB, setInputTextB] = useState('');
  const [generatedResult, setGeneratedResult] = useState('');
  const [copied, setCopied] = useState(false);

  // Specific Tool Settings
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const [isRegex, setIsRegex] = useState(false);

  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');

  const [delimiter, setDelimiter] = useState(',');
  const [colIndex, setColIndex] = useState(1);
  const [colA, setColA] = useState(1);
  const [colB, setColB] = useState(2);

  const [breakAfterCount, setBreakAfterCount] = useState(50);
  const [breakChar, setBreakChar] = useState('');

  const [replaceBreakWith, setReplaceBreakWith] = useState(' ');

  const [filterKeyword, setFilterKeyword] = useState('');
  const [keepMatchesOnly, setKeepMatchesOnly] = useState(false);

  const [unwantedCharSet, setUnwantedCharSet] = useState('');
  const [stripType, setStripType] = useState<'non-alphanumeric' | 'numbers' | 'custom'>('non-alphanumeric');

  const [numberingStyle, setNumberingStyle] = useState<'numeric' | 'zero-padded' | 'alpha' | 'roman'>('numeric');

  const [padWidth, setPadWidth] = useState(20);
  const [padChar, setPadChar] = useState(' ');
  const [padAlign, setPadAlign] = useState<'left' | 'right'>('right');

  const [wrapLength, setWrapLength] = useState(80);

  // Generator settings
  const [passwordLen, setPasswordLen] = useState(16);
  const [passNums, setPassNums] = useState(true);
  const [passSyms, setPassSyms] = useState(true);

  const [randStrLen, setRandStrLen] = useState(16);
  const [randCharset, setRandCharset] = useState<'alphanumeric' | 'hex' | 'digits' | 'uppercase'>('alphanumeric');

  const [randNumMin, setRandNumMin] = useState(1);
  const [randNumMax, setRandNumMax] = useState(100);
  const [randNumCount, setRandNumCount] = useState(10);
  const [randNumUnique, setRandNumUnique] = useState(true);

  const [emailDomain, setEmailDomain] = useState('example.com');
  const [emailCount, setEmailCount] = useState(5);

  const [userKeyword, setUserKeyword] = useState('');
  const [userStyle, setUserStyle] = useState('gaming');

  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');

  // Reset output on tool switch
  useEffect(() => {
    setInputText('');
    setInputTextB('');
    setGeneratedResult('');
  }, [tool.id]);

  const handleCopy = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Word Counter Calculations
  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const charCount = inputText.length;
  const sentenceCount = inputText.trim() ? inputText.split(/[.!?]+/).filter(Boolean).length : 0;
  const lineCount = inputText ? inputText.split('\n').length : 0;
  const readingTimeMinutes = (wordCount / 200).toFixed(1);

  // Case Converters
  const convertCase = (type: string) => {
    let res = inputText;
    if (type === 'upper') res = inputText.toUpperCase();
    if (type === 'lower') res = inputText.toLowerCase();
    if (type === 'title') res = inputText.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
    if (type === 'sentence') res = inputText.toLowerCase().replace(/(^\s*\w|[\.\!\?]\s*\w)/g, c => c.toUpperCase());
    if (type === 'capitalize') res = inputText.replace(/\b\w/g, l => l.toUpperCase());
    if (type === 'camel') res = inputText.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => index === 0 ? word.toLowerCase() : word.toUpperCase()).replace(/\s+/g, '');
    if (type === 'kebab') res = inputText.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    if (type === 'snake') res = inputText.toLowerCase().replace(/\s+/g, '_').replace(/[^\w_]+/g, '');
    
    setInputText(res);
    recordHistory(tool.id, tool.name, type, res);
  };

  // Sort Text
  const sortText = (mode: 'a-z' | 'z-a' | 'natural' | 'length' | 'random') => {
    const lines = inputText.split('\n');
    let sorted = [...lines];
    if (mode === 'a-z') sorted.sort((a, b) => a.localeCompare(b));
    if (mode === 'z-a') sorted.sort((a, b) => b.localeCompare(a));
    if (mode === 'natural') sorted.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
    if (mode === 'length') sorted.sort((a, b) => a.length - b.length);
    if (mode === 'random') sorted.sort(() => Math.random() - 0.5);
    const res = sorted.join('\n');
    setInputText(res);
    recordHistory(tool.id, tool.name, `Sort: ${mode}`, res);
  };

  // Find & Replace
  const handleFindReplace = () => {
    if (!findText) return;
    try {
      let flags = 'g';
      if (!matchCase) flags += 'i';
      const searchPattern = isRegex ? new RegExp(findText, flags) : new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
      const res = inputText.replace(searchPattern, replaceText);
      setInputText(res);
      recordHistory(tool.id, tool.name, `Find: ${findText}`, res);
    } catch (err: any) {
      alert('Regex Error: ' + err.message);
    }
  };

  // Reverse List
  const handleReverseList = () => {
    const res = inputText.split('\n').reverse().join('\n');
    setInputText(res);
  };

  // Prefix & Suffix
  const handlePrefixSuffix = () => {
    const res = inputText.split('\n').map(line => `${prefix}${line}${suffix}`).join('\n');
    setInputText(res);
  };

  // Add Line Breaks
  const handleAddLineBreaks = () => {
    if (breakChar) {
      const res = inputText.split(breakChar).join(breakChar + '\n');
      setInputText(res);
    } else {
      let res = '';
      for (let i = 0; i < inputText.length; i += breakAfterCount) {
        res += inputText.slice(i, i + breakAfterCount) + '\n';
      }
      setInputText(res.trimEnd());
    }
  };

  // Remove Line Breaks
  const handleRemoveLineBreaks = () => {
    const res = inputText.replace(/(\r\n|\n|\r)/gm, replaceBreakWith);
    setInputText(res);
  };

  // Concatenate
  const handleConcatenate = () => {
    const linesA = inputText.split('\n');
    const linesB = inputTextB.split('\n');
    const maxLen = Math.max(linesA.length, linesB.length);
    const res: string[] = [];
    for (let i = 0; i < maxLen; i++) {
      const a = linesA[i] || '';
      const b = linesB[i] || '';
      res.push(`${a}${b}`);
    }
    setGeneratedResult(res.join('\n'));
  };

  // Split Text
  const handleSplitText = () => {
    const del = delimiter || ',';
    const res = inputText.split(del).map(s => s.trim()).filter(Boolean).join('\n');
    setGeneratedResult(res);
  };

  // Extract Column
  const handleExtractColumn = () => {
    const del = delimiter || ',';
    const idx = Math.max(0, colIndex - 1);
    const lines = inputText.split('\n');
    const res = lines.map(line => {
      const parts = line.split(del);
      return parts[idx] ? parts[idx].trim() : '';
    }).filter(Boolean).join('\n');
    setGeneratedResult(res);
  };

  // Swap Columns
  const handleSwapColumns = () => {
    const del = delimiter || ',';
    const idxA = Math.max(0, colA - 1);
    const idxB = Math.max(0, colB - 1);
    const lines = inputText.split('\n');
    const res = lines.map(line => {
      const parts = line.split(del);
      if (parts[idxA] !== undefined && parts[idxB] !== undefined) {
        const temp = parts[idxA];
        parts[idxA] = parts[idxB];
        parts[idxB] = temp;
      }
      return parts.join(del);
    }).join('\n');
    setInputText(res);
  };

  // Reverse Words & Letters
  const handleReverseWords = () => {
    const res = inputText.split('\n').map(line => line.split(/\s+/).reverse().join(' ')).join('\n');
    setInputText(res);
  };

  const handleReverseLetters = () => {
    const res = inputText.split('\n').map(line => line.split('').reverse().join('')).join('\n');
    setInputText(res);
  };

  // Extra spaces & duplicates
  const handleRemoveExtraSpaces = () => {
    const res = inputText.split('\n').map(line => line.trim().replace(/\s+/g, ' ')).join('\n');
    setInputText(res);
  };

  const handleRemoveDuplicates = () => {
    const lines = inputText.split('\n');
    const unique = Array.from(new Set(lines));
    setInputText(unique.join('\n'));
  };

  const handleRemoveEmptyLines = () => {
    const res = inputText.split('\n').filter(line => line.trim().length > 0).join('\n');
    setInputText(res);
  };

  const handleRemoveAccents = () => {
    const res = inputText.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    setInputText(res);
  };

  const handleRemoveUnwantedChars = () => {
    let res = inputText;
    if (stripType === 'non-alphanumeric') res = inputText.replace(/[^a-zA-Z0-9\s]/g, '');
    if (stripType === 'numbers') res = inputText.replace(/[0-9]/g, '');
    if (stripType === 'custom' && unwantedCharSet) {
      const escaped = unwantedCharSet.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      res = inputText.replace(new RegExp(`[${escaped}]`, 'g'), '');
    }
    setInputText(res);
  };

  const handleRemoveLinesContaining = () => {
    if (!filterKeyword) return;
    const lines = inputText.split('\n');
    const res = lines.filter(line => {
      const hasMatch = line.toLowerCase().includes(filterKeyword.toLowerCase());
      return keepMatchesOnly ? hasMatch : !hasMatch;
    }).join('\n');
    setInputText(res);
  };

  const handleRemoveEmojis = () => {
    const res = inputText.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
    setInputText(res);
  };

  const handleStripHtml = () => {
    const res = inputText.replace(/<[^>]*>?/gm, '');
    setInputText(res);
  };

  // Formatting Tools
  const handleAddLineNumbers = () => {
    const lines = inputText.split('\n');
    const res = lines.map((line, idx) => {
      const num = idx + 1;
      let label = `${num}`;
      if (numberingStyle === 'zero-padded') label = String(num).padStart(2, '0');
      if (numberingStyle === 'alpha') label = String.fromCharCode(65 + (idx % 26));
      return `${label}. ${line}`;
    }).join('\n');
    setInputText(res);
  };

  const handleAddCommasNumbers = () => {
    const res = inputText.replace(/\b\d+\b/g, (match) => {
      return Number(match).toLocaleString();
    });
    setInputText(res);
  };

  const handleReplaceQuotes = (type: 'straight' | 'smart') => {
    let res = inputText;
    if (type === 'straight') {
      res = inputText.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
    } else {
      res = inputText.replace(/"([^"]*)"/g, '“$1”').replace(/'([^']*)'/g, '‘$1’');
    }
    setInputText(res);
  };

  const handleTabsToSpaces = () => {
    const res = inputText.replace(/\t/g, '    ');
    setInputText(res);
  };

  const handleSpacesToTabs = () => {
    const res = inputText.replace(/ {4}/g, '\t');
    setInputText(res);
  };

  const handlePadText = () => {
    const lines = inputText.split('\n');
    const char = padChar || ' ';
    const res = lines.map(line => {
      if (padAlign === 'right') return line.padStart(padWidth, char);
      return line.padEnd(padWidth, char);
    }).join('\n');
    setInputText(res);
  };

  const handleWordWrap = () => {
    const words = inputText.split(/\s+/);
    let res = '';
    let currentLine = '';

    words.forEach(word => {
      if ((currentLine + ' ' + word).trim().length <= wrapLength) {
        currentLine = (currentLine + ' ' + word).trim();
      } else {
        res += currentLine + '\n';
        currentLine = word;
      }
    });
    res += currentLine;
    setInputText(res);
  };

  const handleCenterText = () => {
    const lines = inputText.split('\n');
    const maxLen = Math.max(...lines.map(l => l.length), 40);
    const res = lines.map(line => {
      const pad = Math.max(0, Math.floor((maxLen - line.length) / 2));
      return ' '.repeat(pad) + line;
    }).join('\n');
    setInputText(res);
  };

  // Unicode text generators
  const applyUnicode = (type: string) => {
    let res = inputText;
    if (type === 'upside-down') res = toUpsideDown(inputText);
    if (type === 'bold') res = toUnicodeBold(inputText);
    if (type === 'italic') res = toUnicodeItalic(inputText);
    if (type === 'old-english') res = toUnicodeOldEnglish(inputText);
    if (type === 'cursive') res = toUnicodeCursive(inputText);
    if (type === 'normalize') res = normalizeUnicodeText(inputText);
    
    setInputText(res);
    recordHistory(tool.id, tool.name, type, res);
  };

  // Encoding & Escaping
  const handleHtmlEncodeDecode = (action: 'encode' | 'decode') => {
    if (action === 'encode') {
      const res = inputText.replace(/[\u00A0-\u9999<>\&]/g, (i) => '&#' + i.charCodeAt(0) + ';');
      setInputText(res);
    } else {
      const doc = new DOMParser().parseFromString(inputText, 'text/html');
      setInputText(doc.documentElement.textContent || '');
    }
  };

  const handleHtmlEscape = (action: 'escape' | 'unescape') => {
    if (action === 'escape') {
      const res = inputText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
      setInputText(res);
    } else {
      const res = inputText.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'");
      setInputText(res);
    }
  };

  // Generators
  const handleGeneratePassword = () => {
    let chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (passNums) chars += "0123456789";
    if (passSyms) chars += "!@#$%^&*()_+-=[]{}|;:,.<>?";
    let pwd = "";
    for (let i = 0; i < passwordLen; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedResult(pwd);
    recordHistory(tool.id, tool.name, `Length: ${passwordLen}`, pwd);
  };

  const handleGeneratePronounceablePass = () => {
    const pwd = generatePronounceablePassword(12);
    setGeneratedResult(pwd);
  };

  const handleGenerateRandomString = () => {
    let charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    if (randCharset === 'hex') charset = '0123456789abcdef';
    if (randCharset === 'digits') charset = '0123456789';
    if (randCharset === 'uppercase') charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    let res = '';
    for (let i = 0; i < randStrLen; i++) {
      res += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setGeneratedResult(res);
  };

  const handleGenerateUsernames = () => {
    const list = generateUsernames(userKeyword, userStyle, 8);
    setGeneratedResult(list.join('\n'));
  };

  const handleGenerateRandomWords = () => {
    const words = getRandomWords(8);
    setGeneratedResult(words.join(', '));
  };

  const handleGenerateRandomNumbers = () => {
    const nums: number[] = [];
    for (let i = 0; i < randNumCount; i++) {
      const val = Math.floor(Math.random() * (randNumMax - randNumMin + 1)) + randNumMin;
      if (randNumUnique && nums.includes(val)) continue;
      nums.push(val);
    }
    setGeneratedResult(nums.join(', '));
  };

  const handleGenerateRandomEmails = () => {
    const names = ['alex', 'jordan', 'sam', 'taylor', 'morgan', 'chris', 'casey', 'riley', 'jamie'];
    const emails: string[] = [];
    for (let i = 0; i < emailCount; i++) {
      const name = names[Math.floor(Math.random() * names.length)];
      const num = Math.floor(100 + Math.random() * 900);
      emails.push(`${name}${num}@${emailDomain}`);
    }
    setGeneratedResult(emails.join('\n'));
  };

  // Scraping / Extractors
  const handleExtractEmails = () => {
    const matches = inputText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
    const unique = Array.from(new Set(matches));
    setGeneratedResult(unique.join('\n') || 'No email addresses found.');
  };

  const handleExtractUrls = () => {
    const matches = inputText.match(/(https?:\/\/[^\s]+)/g) || [];
    const unique = Array.from(new Set(matches));
    setGeneratedResult(unique.join('\n') || 'No URLs found.');
  };

  const handleBase64Encode = () => {
    try { setGeneratedResult(btoa(inputText)); } catch { alert('Encoding failed'); }
  };
  const handleBase64Decode = () => {
    try { setGeneratedResult(atob(inputText)); } catch { alert('Invalid Base64 input'); }
  };

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(inputText);
      setGeneratedResult(JSON.stringify(parsed, null, 2));
    } catch (e: any) {
      setGeneratedResult('Invalid JSON: ' + e.message);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-sm dark:shadow-xl space-y-6">
      
      {/* Header */}
      <div className="text-center space-y-1">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{tool.name}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">{tool.description}</p>
      </div>

      {/* Word Counter Dashboard */}
      {tool.id === 'text-word-counter' && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-center">
            <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-bold">Words</span>
            <p className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{wordCount}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-center">
            <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-bold">Characters</span>
            <p className="text-xl font-black text-purple-600 dark:text-purple-400 mt-1">{charCount}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-center">
            <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-bold">Sentences</span>
            <p className="text-xl font-black text-pink-600 dark:text-pink-400 mt-1">{sentenceCount}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-center">
            <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-bold">Lines</span>
            <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">{lineCount}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-center">
            <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-bold">Reading Time</span>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{readingTimeMinutes}m</p>
          </div>
        </div>
      )}

      {/* Difference Checker Input Side-by-Side */}
      {tool.id === 'text-diff-checker' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Original Document</label>
              <textarea
                rows={8}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste original text here..."
                className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Modified Document</label>
              <textarea
                rows={8}
                value={inputTextB}
                onChange={(e) => setInputTextB(e.target.value)}
                placeholder="Paste modified text here..."
                className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-mono"
              />
            </div>
          </div>
        </div>
      ) : tool.id === 'text-concatenate' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <textarea
            rows={6}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Document A lines..."
            className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-mono"
          />
          <textarea
            rows={6}
            value={inputTextB}
            onChange={(e) => setInputTextB(e.target.value)}
            placeholder="Document B lines..."
            className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-mono"
          />
        </div>
      ) : (
        /* Standard Single Main Textarea */
        !['text-password-gen', 'text-pronounceable-pass', 'text-random-string', 'text-username-gen', 'text-random-numbers', 'text-random-emails', 'text-random-words'].includes(tool.id) && (
          <textarea
            rows={7}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Enter or paste text for ${tool.name}...`}
            className="w-full p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
          />
        )
      )}

      {/* --- TOOL ACTIONS & OPTIONS --- */}

      {/* Case Converter */}
      {tool.id === 'text-case-converter' && (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => convertCase('upper')} className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-indigo-600 dark:text-indigo-400">UPPERCASE</button>
          <button onClick={() => convertCase('lower')} className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-indigo-600 dark:text-indigo-400">lowercase</button>
          <button onClick={() => convertCase('title')} className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-indigo-600 dark:text-indigo-400">Title Case</button>
          <button onClick={() => convertCase('sentence')} className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-indigo-600 dark:text-indigo-400">Sentence case</button>
          <button onClick={() => convertCase('camel')} className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-indigo-600 dark:text-indigo-400">camelCase</button>
          <button onClick={() => convertCase('kebab')} className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-indigo-600 dark:text-indigo-400">kebab-case</button>
          <button onClick={() => convertCase('snake')} className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-indigo-600 dark:text-indigo-400">snake_case</button>
        </div>
      )}

      {/* Sort Text */}
      {tool.id === 'text-sort-text' && (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => sortText('a-z')} className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold">A to Z (Alphabetical)</button>
          <button onClick={() => sortText('z-a')} className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">Z to A (Reverse)</button>
          <button onClick={() => sortText('natural')} className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">Natural Sort</button>
          <button onClick={() => sortText('length')} className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">By Length</button>
          <button onClick={() => sortText('random')} className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">Random Shuffle</button>
        </div>
      )}

      {/* Find & Replace */}
      {tool.id === 'text-find-replace' && (
        <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              placeholder="Find text..."
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            />
            <input
              type="text"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              placeholder="Replace with..."
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            />
          </div>
          <div className="flex items-center gap-4 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={matchCase} onChange={(e) => setMatchCase(e.target.checked)} className="rounded" /> Match Case
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={isRegex} onChange={(e) => setIsRegex(e.target.checked)} className="rounded" /> Use Regex
            </label>
            <button onClick={handleFindReplace} className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold ml-auto">
              Replace All
            </button>
          </div>
        </div>
      )}

      {/* Reverse List */}
      {tool.id === 'text-reverse-list' && (
        <button onClick={handleReverseList} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">
          Reverse List Order
        </button>
      )}

      {/* Prefix & Suffix */}
      {tool.id === 'text-prefix-suffix' && (
        <div className="flex flex-wrap gap-3 items-end p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
          <div>
            <label className="text-[10px] font-bold block mb-1">Prefix (Beginning)</label>
            <input type="text" value={prefix} onChange={(e) => setPrefix(e.target.value)} placeholder="e.g. - " className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs" />
          </div>
          <div>
            <label className="text-[10px] font-bold block mb-1">Suffix (Ending)</label>
            <input type="text" value={suffix} onChange={(e) => setSuffix(e.target.value)} placeholder="e.g. ," className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs" />
          </div>
          <button onClick={handlePrefixSuffix} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">Apply to Each Line</button>
        </div>
      )}

      {/* Add Line Breaks */}
      {tool.id === 'text-add-line-breaks' && (
        <div className="flex flex-wrap gap-3 items-center p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-xs">
          <span>Break after every</span>
          <input type="number" value={breakAfterCount} onChange={(e) => setBreakAfterCount(Number(e.target.value))} className="w-16 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-center" />
          <span>chars OR after delimiter:</span>
          <input type="text" value={breakChar} onChange={(e) => setBreakChar(e.target.value)} placeholder="e.g. ," className="w-20 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg" />
          <button onClick={handleAddLineBreaks} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">Add Line Breaks</button>
        </div>
      )}

      {/* Remove Line Breaks */}
      {tool.id === 'text-remove-line-breaks' && (
        <div className="flex flex-wrap gap-3 items-center p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-xs">
          <span>Replace line break with:</span>
          <input type="text" value={replaceBreakWith} onChange={(e) => setReplaceBreakWith(e.target.value)} placeholder="Space or comma" className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl" />
          <button onClick={handleRemoveLineBreaks} className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold">Remove Breaks</button>
        </div>
      )}

      {/* Concatenate */}
      {tool.id === 'text-concatenate' && (
        <button onClick={handleConcatenate} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">
          Concatenate Line by Line
        </button>
      )}

      {/* Split Text / Extract Column / Swap Columns */}
      {['text-split-text', 'text-extract-column', 'text-swap-columns'].includes(tool.id) && (
        <div className="flex flex-wrap gap-3 items-center p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-xs">
          <div>
            <label className="text-[10px] font-bold block">Delimiter</label>
            <input type="text" value={delimiter} onChange={(e) => setDelimiter(e.target.value)} className="w-20 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-center" />
          </div>

          {tool.id === 'text-extract-column' && (
            <div>
              <label className="text-[10px] font-bold block">Column No.</label>
              <input type="number" min="1" value={colIndex} onChange={(e) => setColIndex(Number(e.target.value))} className="w-16 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-center" />
            </div>
          )}

          {tool.id === 'text-swap-columns' && (
            <div className="flex gap-2">
              <div>
                <label className="text-[10px] font-bold block">Col A</label>
                <input type="number" min="1" value={colA} onChange={(e) => setColA(Number(e.target.value))} className="w-16 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-center" />
              </div>
              <div>
                <label className="text-[10px] font-bold block">Col B</label>
                <input type="number" min="1" value={colB} onChange={(e) => setColB(Number(e.target.value))} className="w-16 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-center" />
              </div>
            </div>
          )}

          <button
            onClick={() => {
              if (tool.id === 'text-split-text') handleSplitText();
              if (tool.id === 'text-extract-column') handleExtractColumn();
              if (tool.id === 'text-swap-columns') handleSwapColumns();
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold ml-auto"
          >
            Execute Action
          </button>
        </div>
      )}

      {/* Reverse Words & Letters */}
      {tool.id === 'text-reverse-words' && (
        <button onClick={handleReverseWords} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">Reverse Words</button>
      )}
      {tool.id === 'text-reverse-letters' && (
        <button onClick={handleReverseLetters} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">Reverse Characters</button>
      )}

      {/* Cleaning tools */}
      {tool.id === 'text-remove-extra-spaces' && (
        <button onClick={handleRemoveExtraSpaces} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">Remove Extra Spaces</button>
      )}
      {tool.id === 'text-duplicate-remover' && (
        <button onClick={handleRemoveDuplicates} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">Remove Duplicate Lines</button>
      )}
      {tool.id === 'text-remove-empty-lines' && (
        <button onClick={handleRemoveEmptyLines} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">Remove Blank Lines</button>
      )}
      {tool.id === 'text-remove-accents' && (
        <button onClick={handleRemoveAccents} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">Remove Letter Accents</button>
      )}

      {tool.id === 'text-remove-unwanted-chars' && (
        <div className="flex flex-wrap gap-3 items-center p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-xs">
          <select value={stripType} onChange={(e: any) => setStripType(e.target.value)} className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
            <option value="non-alphanumeric">Remove Non-Alphanumeric</option>
            <option value="numbers">Remove Digits Only</option>
            <option value="custom">Custom Character List</option>
          </select>
          {stripType === 'custom' && (
            <input type="text" value={unwantedCharSet} onChange={(e) => setUnwantedCharSet(e.target.value)} placeholder="e.g. !@#$" className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl" />
          )}
          <button onClick={handleRemoveUnwantedChars} className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold">Sanitize Text</button>
        </div>
      )}

      {tool.id === 'text-remove-lines-containing' && (
        <div className="flex flex-wrap gap-3 items-center p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-xs">
          <input type="text" value={filterKeyword} onChange={(e) => setFilterKeyword(e.target.value)} placeholder="Filter word or phrase..." className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl" />
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={keepMatchesOnly} onChange={(e) => setKeepMatchesOnly(e.target.checked)} className="rounded" /> Keep ONLY matching lines
          </label>
          <button onClick={handleRemoveLinesContaining} className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold">Filter Lines</button>
        </div>
      )}

      {tool.id === 'text-remove-emojis' && (
        <button onClick={handleRemoveEmojis} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">Remove All Emojis</button>
      )}

      {tool.id === 'text-strip-html' && (
        <button onClick={handleStripHtml} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">Strip HTML Tags</button>
      )}

      {/* Line Numbers */}
      {tool.id === 'text-add-line-numbers' && (
        <div className="flex flex-wrap gap-3 items-center p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-xs">
          <span>Format Style:</span>
          <select value={numberingStyle} onChange={(e: any) => setNumberingStyle(e.target.value)} className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
            <option value="numeric">1, 2, 3...</option>
            <option value="zero-padded">01, 02, 03...</option>
            <option value="alpha">A, B, C...</option>
          </select>
          <button onClick={handleAddLineNumbers} className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold">Add Line Numbers</button>
        </div>
      )}

      {tool.id === 'text-add-commas-numbers' && (
        <button onClick={handleAddCommasNumbers} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">Add Commas to Numbers</button>
      )}

      {tool.id === 'text-replace-quotes' && (
        <div className="flex gap-2">
          <button onClick={() => handleReplaceQuotes('straight')} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">Convert to Straight Quotes (" ')</button>
          <button onClick={() => handleReplaceQuotes('smart')} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">Convert to Smart Quotes (“ ”)</button>
        </div>
      )}

      {tool.id === 'text-tabs-to-spaces' && (
        <button onClick={handleTabsToSpaces} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">Convert Tabs to Spaces</button>
      )}

      {tool.id === 'text-spaces-to-tabs' && (
        <button onClick={handleSpacesToTabs} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">Convert Spaces to Tabs</button>
      )}

      {tool.id === 'text-pad-text' && (
        <div className="flex flex-wrap gap-3 items-center p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-xs">
          <span>Width:</span>
          <input type="number" value={padWidth} onChange={(e) => setPadWidth(Number(e.target.value))} className="w-16 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-center" />
          <span>Char:</span>
          <input type="text" value={padChar} onChange={(e) => setPadChar(e.target.value)} className="w-12 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-center" />
          <span>Align:</span>
          <select value={padAlign} onChange={(e: any) => setPadAlign(e.target.value)} className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
            <option value="right">Right Pad</option>
            <option value="left">Left Pad</option>
          </select>
          <button onClick={handlePadText} className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold">Pad Text</button>
        </div>
      )}

      {tool.id === 'text-word-wrap' && (
        <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-xs">
          <span>Max Line Width:</span>
          <input type="number" value={wrapLength} onChange={(e) => setWrapLength(Number(e.target.value))} className="w-20 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-center" />
          <button onClick={handleWordWrap} className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold">Wrap Words</button>
        </div>
      )}

      {tool.id === 'text-center-text' && (
        <button onClick={handleCenterText} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">Center Align Text</button>
      )}

      {/* Unicode generators */}
      {tool.id === 'text-upside-down' && (
        <button onClick={() => applyUnicode('upside-down')} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">Turn Upside Down</button>
      )}
      {tool.id === 'text-unicode-bold' && (
        <button onClick={() => applyUnicode('bold')} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">Convert to Bold Unicode</button>
      )}
      {tool.id === 'text-unicode-italic' && (
        <button onClick={() => applyUnicode('italic')} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">Convert to Italic Unicode</button>
      )}
      {tool.id === 'text-unicode-old-english' && (
        <button onClick={() => applyUnicode('old-english')} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">Convert to Old English Script</button>
      )}
      {tool.id === 'text-unicode-cursive' && (
        <button onClick={() => applyUnicode('cursive')} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">Convert to Cursive Script</button>
      )}
      {tool.id === 'text-normalize-unicode' && (
        <button onClick={() => applyUnicode('normalize')} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">Normalize Unicode to Plain Text</button>
      )}

      {/* HTML / URL Encode / Decode */}
      {tool.id === 'text-html-encode-decode' && (
        <div className="flex gap-2">
          <button onClick={() => handleHtmlEncodeDecode('encode')} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">HTML Entity Encode</button>
          <button onClick={() => handleHtmlEncodeDecode('decode')} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">Decode Entities</button>
        </div>
      )}

      {tool.id === 'text-html-escape' && (
        <div className="flex gap-2">
          <button onClick={() => handleHtmlEscape('escape')} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">Escape HTML Tags</button>
          <button onClick={() => handleHtmlEscape('unescape')} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">Unescape HTML Tags</button>
        </div>
      )}

      {/* Username Generator */}
      {tool.id === 'text-username-gen' && (
        <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold block mb-1">Keyword / Base Name</label>
              <input type="text" value={userKeyword} onChange={(e) => setUserKeyword(e.target.value)} placeholder="e.g. cyber, gamer..." className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl" />
            </div>
            <div>
              <label className="font-bold block mb-1">Style Preset</label>
              <select value={userStyle} onChange={(e) => setUserStyle(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
                <option value="gaming">Gaming (_X_99)</option>
                <option value="tech">Tech (.dev / .hq)</option>
                <option value="aesthetic">Aesthetic (_vibe)</option>
                <option value="pro">Professional</option>
              </select>
            </div>
          </div>
          <button onClick={handleGenerateUsernames} className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold">Generate Unique Usernames</button>
        </div>
      )}

      {/* Password Generator Controls */}
      {tool.id === 'text-password-gen' && (
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Password Length: {passwordLen}</label>
            <input type="range" min="8" max="64" value={passwordLen} onChange={(e) => setPasswordLen(Number(e.target.value))} className="w-full accent-indigo-500" />
          </div>
          <div className="flex gap-4 text-xs text-slate-700 dark:text-slate-300">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={passNums} onChange={(e) => setPassNums(e.target.checked)} className="rounded" /> Include Numbers
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={passSyms} onChange={(e) => setPassSyms(e.target.checked)} className="rounded" /> Include Symbols
            </label>
          </div>
          <button onClick={handleGeneratePassword} className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30">
            Generate Secure Password
          </button>
        </div>
      )}

      {/* Pronounceable password */}
      {tool.id === 'text-pronounceable-pass' && (
        <button onClick={handleGeneratePronounceablePass} className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold">Generate Pronounceable Password</button>
      )}

      {/* Random String Generator */}
      {tool.id === 'text-random-string' && (
        <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-xs">
          <div className="flex items-center gap-4">
            <span>Length: {randStrLen}</span>
            <input type="range" min="4" max="128" value={randStrLen} onChange={(e) => setRandStrLen(Number(e.target.value))} className="flex-1 accent-indigo-500" />
          </div>
          <div className="flex items-center gap-3">
            <span>Type:</span>
            <select value={randCharset} onChange={(e: any) => setRandCharset(e.target.value)} className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
              <option value="alphanumeric">Alphanumeric (a-Z, 0-9)</option>
              <option value="hex">Hexadecimal (0-9, a-f)</option>
              <option value="digits">Numeric Digits Only</option>
              <option value="uppercase">UPPERCASE Letters</option>
            </select>
          </div>
          <button onClick={handleGenerateRandomString} className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold">Generate Random String</button>
        </div>
      )}

      {/* Random Word Generator */}
      {tool.id === 'text-random-words' && (
        <button onClick={handleGenerateRandomWords} className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold">Generate Random Words</button>
      )}

      {/* Random Number Generator */}
      {tool.id === 'text-random-numbers' && (
        <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-xs">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-bold block mb-1">Min Value</label>
              <input type="number" value={randNumMin} onChange={(e) => setRandNumMin(Number(e.target.value))} className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl" />
            </div>
            <div>
              <label className="font-bold block mb-1">Max Value</label>
              <input type="number" value={randNumMax} onChange={(e) => setRandNumMax(Number(e.target.value))} className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl" />
            </div>
            <div>
              <label className="font-bold block mb-1">Count</label>
              <input type="number" value={randNumCount} onChange={(e) => setRandNumCount(Number(e.target.value))} className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl" />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={randNumUnique} onChange={(e) => setRandNumUnique(e.target.checked)} className="rounded" /> Unique numbers only
          </label>
          <button onClick={handleGenerateRandomNumbers} className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold">Generate Random Numbers</button>
        </div>
      )}

      {/* Random Email Generator */}
      {tool.id === 'text-random-emails' && (
        <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold block mb-1">Email Count ({emailCount})</label>
              <input type="range" min="1" max="25" value={emailCount} onChange={(e) => setEmailCount(Number(e.target.value))} className="w-full accent-indigo-500" />
            </div>
            <div>
              <label className="font-bold block mb-1">Domain</label>
              <select value={emailDomain} onChange={(e) => setEmailDomain(e.target.value)} className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
                <option value="example.com">example.com</option>
                <option value="gmail.com">gmail.com</option>
                <option value="yahoo.com">yahoo.com</option>
                <option value="testorg.com">testorg.com</option>
              </select>
            </div>
          </div>
          <button onClick={handleGenerateRandomEmails} className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold">Generate Bulk Emails</button>
        </div>
      )}

      {/* Extractor Tools */}
      {tool.id === 'text-email-extractor' && (
        <button onClick={handleExtractEmails} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">Extract Email Addresses</button>
      )}

      {tool.id === 'text-url-extractor' && (
        <button onClick={handleExtractUrls} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">Extract All Web Links / URLs</button>
      )}

      {/* Base64 & JSON */}
      {tool.id === 'text-base64' && (
        <div className="flex gap-2">
          <button onClick={handleBase64Encode} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">Encode to Base64</button>
          <button onClick={handleBase64Decode} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">Decode Base64</button>
        </div>
      )}

      {tool.id === 'text-json-formatter' && (
        <button onClick={handleFormatJson} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">Format & Validate JSON</button>
      )}

      {/* QR Code Creator */}
      {tool.id === 'text-qr-gen' && (
        <div className="space-y-4">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter URL, text or WiFi credentials..."
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
          />
          {inputText && (
            <div className="p-4 bg-white rounded-2xl w-fit mx-auto shadow-xl border border-slate-100 text-center space-y-3">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(inputText)}`} 
                alt="QR Code"
                className="w-44 h-44 mx-auto" 
              />
              <a 
                href={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(inputText)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-indigo-600 font-bold hover:underline"
              >
                <Download className="w-3.5 h-3.5" /> Download HD QR
              </a>
            </div>
          )}
        </div>
      )}

      {/* OUTPUT CONTAINER */}
      {(generatedResult || (tool.id !== 'text-word-counter' && inputText)) && (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs font-mono text-indigo-900 dark:text-indigo-300 relative">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500">Output / Result</span>
            <button
              onClick={() => handleCopy(generatedResult || inputText)}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] flex items-center gap-1 shadow-sm font-sans font-bold"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Result'}</span>
            </button>
          </div>
          <pre className="whitespace-pre-wrap overflow-x-auto pr-2 max-h-96">{generatedResult || inputText}</pre>
        </div>
      )}

    </div>
  );
};
