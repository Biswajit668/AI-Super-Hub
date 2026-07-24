import React, { useState } from 'react';
import { Copy, Check, Hash, Type, Key, QrCode, Code2, FileCode, Edit3, RefreshCw } from 'lucide-react';
import { ToolItem } from '../../types';

interface TextToolRunnerProps {
  tool: ToolItem;
}

export const TextToolRunner: React.FC<TextToolRunnerProps> = ({ tool }) => {
  const [inputText, setInputText] = useState('');
  const [copied, setCopied] = useState(false);
  const [passwordLen, setPasswordLen] = useState(16);
  const [passNums, setPassNums] = useState(true);
  const [passSyms, setPassSyms] = useState(true);
  const [generatedResult, setGeneratedResult] = useState('');

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Word Counter Stats
  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const charCount = inputText.length;
  const sentenceCount = inputText.trim() ? inputText.split(/[.!?]+/).filter(Boolean).length : 0;
  const readingTimeMinutes = (wordCount / 200).toFixed(1);

  // Case Converters
  const toUpper = () => setInputText(inputText.toUpperCase());
  const toLower = () => setInputText(inputText.toLowerCase());
  const toTitle = () => setInputText(inputText.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()));
  const toCamel = () => setInputText(inputText.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => index === 0 ? word.toLowerCase() : word.toUpperCase()).replace(/\s+/g, ''));
  const toKebab = () => setInputText(inputText.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''));
  const toSnake = () => setInputText(inputText.toLowerCase().replace(/\s+/g, '_').replace(/[^\w_]+/g, ''));

  // Duplicate Line Remover
  const removeDuplicates = () => {
    const lines = inputText.split('\n');
    const unique = Array.from(new Set(lines));
    setInputText(unique.join('\n'));
  };

  // Lorem Ipsum Generator
  const generateLorem = () => {
    const lorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
    setInputText(lorem);
  };

  // Password Generator
  const generatePassword = () => {
    let chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (passNums) chars += "0123456789";
    if (passSyms) chars += "!@#$%^&*()_+-=[]{}|;:,.<>?";
    let pwd = "";
    for (let i = 0; i < passwordLen; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedResult(pwd);
  };

  // Base64 & URL
  const handleBase64Encode = () => {
    try { setGeneratedResult(btoa(inputText)); } catch { alert('Invalid encoding'); }
  };
  const handleBase64Decode = () => {
    try { setGeneratedResult(atob(inputText)); } catch { alert('Invalid Base64 string'); }
  };

  // JSON Formatter
  const formatJson = () => {
    try {
      const parsed = JSON.parse(inputText);
      setGeneratedResult(JSON.stringify(parsed, null, 2));
    } catch (err: any) {
      setGeneratedResult('JSON Error: ' + err.message);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-xl space-y-6">
      
      <div className="text-center space-y-1">
        <h3 className="text-xl font-bold text-white">{tool.name}</h3>
        <p className="text-xs text-slate-400">{tool.description}</p>
      </div>

      {/* Word Counter Dashboard */}
      {tool.id === 'text-word-counter' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-center">
            <span className="text-[10px] uppercase text-slate-400 font-bold">Words</span>
            <p className="text-xl font-black text-indigo-400 mt-1">{wordCount}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-center">
            <span className="text-[10px] uppercase text-slate-400 font-bold">Characters</span>
            <p className="text-xl font-black text-purple-400 mt-1">{charCount}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-center">
            <span className="text-[10px] uppercase text-slate-400 font-bold">Sentences</span>
            <p className="text-xl font-black text-pink-400 mt-1">{sentenceCount}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-center">
            <span className="text-[10px] uppercase text-slate-400 font-bold">Reading Time</span>
            <p className="text-xl font-black text-emerald-400 mt-1">{readingTimeMinutes}m</p>
          </div>
        </div>
      )}

      {/* Main Text Input */}
      {tool.id !== 'text-password-gen' && tool.id !== 'text-qr-gen' && (
        <textarea
          rows={7}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Enter text for ${tool.name}...`}
          className="w-full p-4 bg-slate-950/60 border border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
        />
      )}

      {/* Case Converter Action Buttons */}
      {tool.id === 'text-case-converter' && (
        <div className="flex flex-wrap gap-2">
          <button onClick={toUpper} className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-indigo-300">UPPERCASE</button>
          <button onClick={toLower} className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-indigo-300">lowercase</button>
          <button onClick={toTitle} className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-indigo-300">Title Case</button>
          <button onClick={toCamel} className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-indigo-300">camelCase</button>
          <button onClick={toKebab} className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-indigo-300">kebab-case</button>
          <button onClick={toSnake} className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-indigo-300">snake_case</button>
        </div>
      )}

      {tool.id === 'text-duplicate-remover' && (
        <button onClick={removeDuplicates} className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold">
          Remove Duplicate Lines
        </button>
      )}

      {tool.id === 'text-lorem-gen' && (
        <button onClick={generateLorem} className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold">
          Generate Placeholder Text
        </button>
      )}

      {/* Password Generator Controls */}
      {tool.id === 'text-password-gen' && (
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Password Length: {passwordLen}</label>
            <input type="range" min="8" max="64" value={passwordLen} onChange={(e) => setPasswordLen(Number(e.target.value))} className="w-full accent-indigo-500" />
          </div>
          <div className="flex gap-4 text-xs text-slate-300">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={passNums} onChange={(e) => setPassNums(e.target.checked)} className="rounded" /> Include Numbers
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={passSyms} onChange={(e) => setPassSyms(e.target.checked)} className="rounded" /> Include Symbols
            </label>
          </div>
          <button onClick={generatePassword} className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30">
            Generate Secure Password
          </button>
        </div>
      )}

      {/* QR Code Creator */}
      {tool.id === 'text-qr-gen' && (
        <div className="space-y-4">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter URL, text or WiFi credentials..."
            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
          />
          {inputText && (
            <div className="p-4 bg-white rounded-2xl w-fit mx-auto shadow-xl">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(inputText)}`} 
                alt="QR Code"
                className="w-44 h-44" 
              />
            </div>
          )}
        </div>
      )}

      {/* Base64 & JSON Buttons */}
      {tool.id === 'text-base64' && (
        <div className="flex gap-2">
          <button onClick={handleBase64Encode} className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold">Encode to Base64</button>
          <button onClick={handleBase64Decode} className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold">Decode Base64</button>
        </div>
      )}

      {tool.id === 'text-json-formatter' && (
        <button onClick={formatJson} className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold">
          Format & Validate JSON
        </button>
      )}

      {/* Output Display Container */}
      {(generatedResult || (tool.id !== 'text-word-counter' && inputText)) && (
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-indigo-300 relative">
          <button
            onClick={() => handleCopy(generatedResult || inputText)}
            className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <pre className="whitespace-pre-wrap overflow-x-auto pr-16">{generatedResult || inputText}</pre>
        </div>
      )}

    </div>
  );
};
