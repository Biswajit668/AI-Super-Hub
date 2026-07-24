import React, { useState } from 'react';
import { X, Copy, CheckCircle2, Share2, Twitter, Facebook, MessageCircle } from 'lucide-react';
import { ToolItem } from '../types';

interface ShareModalProps {
  tool: ToolItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ tool, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !tool) return null;

  const toolUrl = `${window.location.origin}/?tool=${tool.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(toolUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareText = encodeURIComponent(`Check out ${tool.name} on Super Hub AI!`);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 text-slate-900 dark:text-slate-100 shadow-2xl relative my-auto animate-in fade-in zoom-in duration-200">
        
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-600/20 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center mx-auto mb-3">
            <Share2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Share {tool.name}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Spread the word to colleagues and friends</p>
        </div>

        {/* Copy Link Input */}
        <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl mb-6">
          <input
            type="text"
            readOnly
            value={toolUrl}
            className="flex-1 bg-transparent px-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
          />
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition shrink-0"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Social Share Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <a
            href={`https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(toolUrl)}`}
            target="_blank"
            rel="noreferrer"
            className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-sky-500 dark:text-sky-400 flex flex-col items-center gap-1 text-xs font-semibold transition"
          >
            <Twitter className="w-5 h-5" />
            <span>Twitter</span>
          </a>

          <a
            href={`https://api.whatsapp.com/send?text=${shareText}%20${encodeURIComponent(toolUrl)}`}
            target="_blank"
            rel="noreferrer"
            className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-emerald-600 dark:text-emerald-400 flex flex-col items-center gap-1 text-xs font-semibold transition"
          >
            <MessageCircle className="w-5 h-5" />
            <span>WhatsApp</span>
          </a>

          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(toolUrl)}`}
            target="_blank"
            rel="noreferrer"
            className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 flex flex-col items-center gap-1 text-xs font-semibold transition"
          >
            <Facebook className="w-5 h-5" />
            <span>Facebook</span>
          </a>
        </div>

      </div>
    </div>
  );
};
