import React, { useState, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Copy, 
  Check, 
  Download, 
  Sparkles, 
  Mic, 
  Volume2, 
  VolumeX, 
  Image as ImageIcon, 
  FileText, 
  Code, 
  RefreshCw, 
  Languages, 
  Wand2,
  Eye,
  X,
  Trash2,
  ExternalLink,
  File,
  Maximize2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { recordToolUsage } from '../../lib/firebase';
import { ToolItem } from '../../types';

interface AiToolRunnerProps {
  tool: ToolItem;
  onOpenUpgrade: () => void;
}

export const AiToolRunner: React.FC<AiToolRunnerProps> = ({ tool, onOpenUpgrade }) => {
  const { profile, useCredit, recordHistory } = useAuth();
  
  const [inputText, setInputText] = useState('');
  const [targetLang, setTargetLang] = useState('Spanish');
  const [tone, setTone] = useState('Professional');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: string;
    type: 'pdf' | 'image' | 'other';
    url: string;
    rawFile?: File;
  } | null>(null);
  const [showPdfPreviewModal, setShowPdfPreviewModal] = useState(false);

  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Chat message history for AI Chat
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'ai'; text: string }>>([
    { role: 'ai', text: `Hello! I am your AI assistant for ${tool.name}. How can I help you today?` }
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      const sizeStr = file.size > 1024 * 1024 ? `${sizeMb} MB` : `${(file.size / 1024).toFixed(1)} KB`;

      const reader = new FileReader();
      reader.onload = (evt) => {
        const resultUrl = evt.target?.result as string;
        setSelectedImage(resultUrl);
        setUploadedFile({
          name: file.name,
          size: sizeStr,
          type: isPdf ? 'pdf' : 'image',
          url: resultUrl,
          rawFile: file,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInputText(prev => prev + ' ' + transcript);
    };

    recognition.start();
  };

  const handleTextToSpeech = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleRun = async () => {
    if (!inputText && !selectedImage && tool.id !== 'ai-chat') return;

    // Credit check
    const hasCredit = useCredit();
    if (!hasCredit) {
      onOpenUpgrade();
      return;
    }

    setLoading(true);
    let prompt = inputText;
    let systemInstruction = `You are a specialized AI assistant executing the task for "${tool.name}". Provide clean, professional, high-quality markdown formatted responses.`;

    // Tailor prompt based on tool.id
    if (tool.id === 'ai-writer' || tool.id === 'ai-blog-writer') {
      prompt = `Write a comprehensive, engaging piece on "${inputText}". Tone: ${tone}. Use subheadings and clear bullet points where appropriate.`;
    } else if (tool.id === 'ai-rewriter') {
      prompt = `Rewrite and paraphrase the following text to improve clarity, flow, and elegance. Tone: ${tone}.\n\nText:\n${inputText}`;
    } else if (tool.id === 'ai-summarizer') {
      prompt = `Summarize the following document/text concisely with executive bullet points and key takeaways:\n\n${inputText}`;
    } else if (tool.id === 'ai-translator') {
      prompt = `Translate the following text accurately into ${targetLang}:\n\n${inputText}`;
    } else if (tool.id === 'ai-grammar') {
      prompt = `Check and correct all grammatical, spelling, and punctuation errors in the following text. Provide the corrected version first, then briefly explain key improvements made:\n\n${inputText}`;
    } else if (tool.id === 'ai-email-writer') {
      prompt = `Draft a well-structured ${tone.toLowerCase()} email regarding: "${inputText}". Include a clear subject line.`;
    } else if (tool.id === 'ai-resume-builder') {
      prompt = `Generate ATS-optimized resume bullet points and professional summary for target job/role: "${inputText}". Focus on action verbs and quantifiable results.`;
    } else if (tool.id === 'ai-cover-letter') {
      prompt = `Generate a compelling, professional cover letter tailored for the role/company details: "${inputText}".`;
    } else if (tool.id === 'ai-caption-gen') {
      prompt = `Generate 5 viral social media captions with hashtags and relevant emojis for: "${inputText}".`;
    } else if (tool.id === 'ai-prompt-gen') {
      prompt = `Generate 3 detailed, optimized AI art/text prompts (for Midjourney, DALL-E, or ChatGPT) based on concept: "${inputText}".`;
    } else if (tool.id === 'ai-script-writer') {
      prompt = `Write a video script with scene direction cues, voiceover text, and visual notes for topic: "${inputText}".`;
    } else if (tool.id === 'ai-code-gen') {
      prompt = `Write production-ready code with explanatory comments for: "${inputText}". Provide the complete snippet in clean markdown codeblock.`;
    } else if (tool.id === 'ai-debugger') {
      prompt = `Analyze and fix the following code or error stack trace. Explain the root cause and provide the bug-free corrected code:\n\n${inputText}`;
    } else if (tool.id === 'ai-sql-gen') {
      prompt = `Convert the following plain English request into optimized SQL queries:\n\n${inputText}`;
    } else if (tool.id === 'ai-regex-gen') {
      prompt = `Generate a regular expression (Regex) for matching: "${inputText}". Explain each token pattern clearly.`;
    } else if (tool.id === 'ai-ocr') {
      prompt = `Extract all visible text from this image cleanly into formatted text/tables.`;
    } else if (tool.id === 'ai-image-desc') {
      prompt = `Provide a comprehensive description of this image, along with 10 relevant tags and accessibility alt text.`;
    } else if (tool.id === 'ai-pdf-chat') {
      prompt = `Analyze the provided document text/content and answer the query: "${inputText}"`;
    }

    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          systemInstruction,
          image: selectedImage,
          model: 'gemini-2.5-flash',
        }),
      });

      const rawText = await res.text();
      let data: any = {};
      if (rawText && !rawText.trim().startsWith('<')) {
        try {
          data = JSON.parse(rawText);
        } catch (e) {
          data = { error: 'Invalid response from AI server.' };
        }
      } else {
        data = { error: `Server returned non-JSON response (${res.status}). Make sure backend server is active.` };
      }

      if (data.result) {
        if (tool.id === 'ai-chat') {
          const userMsg = { role: 'user' as const, text: inputText };
          const aiMsg = { role: 'ai' as const, text: data.result };
          setMessages(prev => [...prev, userMsg, aiMsg]);
        } else {
          setOutput(data.result);
        }

        await recordHistory(tool.id, tool.name, inputText || 'Image Input', data.result);
      } else {
        const errorText = '⚠️ Error: ' + (data.error || 'Failed to generate response. Please check your Gemini API key settings.');
        if (tool.id === 'ai-chat') {
          const userMsg = { role: 'user' as const, text: inputText };
          const errMsg = { role: 'ai' as const, text: errorText };
          setMessages(prev => [...prev, userMsg, errMsg]);
        } else {
          setOutput(errorText);
        }
      }
    } catch (err: any) {
      setOutput('Error connecting to AI service: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([output], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `${tool.id}-output_super-hub-ai.web.app.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      
      {/* Tool Input Box */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-sm dark:shadow-xl space-y-4">
        
        {/* Custom Controls for Specific Tools */}
        {tool.id === 'ai-translator' && (
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Target Language:</label>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
              <option value="Bengali">Bengali (বাংলা)</option>
              <option value="Hindi">Hindi (हिंदी)</option>
              <option value="Japanese">Japanese</option>
              <option value="Chinese">Chinese</option>
              <option value="Arabic">Arabic</option>
            </select>
          </div>
        )}

        {(tool.id === 'ai-writer' || tool.id === 'ai-email-writer' || tool.id === 'ai-rewriter') && (
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Tone of Voice:</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="Professional">Professional</option>
              <option value="Casual & Friendly">Casual & Friendly</option>
              <option value="Persuasive & Sales">Persuasive & Sales</option>
              <option value="Academic & Formal">Academic & Formal</option>
              <option value="Witty & Creative">Witty & Creative</option>
            </select>
          </div>
        )}

        {/* Image / PDF / File Upload Area */}
        {(tool.id === 'ai-ocr' || tool.id === 'ai-image-desc' || tool.id === 'ai-pdf-chat' || tool.id === 'ai-summarizer' || tool.id === 'ai-rewriter') && (
          <div className="space-y-3">
            <input 
              type="file" 
              accept="image/*,.pdf,application/pdf" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
            />

            {!uploadedFile ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-4 rounded-2xl border-2 border-dashed border-indigo-200 dark:border-indigo-900/50 hover:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-semibold text-xs flex items-center justify-center gap-2 transition group"
              >
                <FileText className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Upload PDF Document or Image</span>
              </button>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`p-3 rounded-xl ${uploadedFile.type === 'pdf' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'}`}>
                    {uploadedFile.type === 'pdf' ? <FileText className="w-6 h-6" /> : <ImageIcon className="w-6 h-6" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-xs">{uploadedFile.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono uppercase">{uploadedFile.type} • {uploadedFile.size}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowPdfPreviewModal(true)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-sm transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview {uploadedFile.type === 'pdf' ? 'PDF' : 'File'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUploadedFile(null);
                      setSelectedImage(null);
                    }}
                    className="p-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-600 dark:text-slate-400 transition"
                    title="Remove file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PDF / File Preview Modal */}
        {showPdfPreviewModal && uploadedFile && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="p-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`p-2 rounded-lg ${uploadedFile.type === 'pdf' ? 'bg-rose-500/10 text-rose-500' : 'bg-indigo-500/10 text-indigo-500'}`}>
                    {uploadedFile.type === 'pdf' ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{uploadedFile.name}</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{uploadedFile.size} • PDF Document Preview</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={uploadedFile.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="hidden sm:inline">New Tab</span>
                  </a>
                  <button
                    onClick={() => setShowPdfPreviewModal(false)}
                    className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-700 dark:text-slate-200 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 p-6 bg-slate-100 dark:bg-slate-950 overflow-auto flex items-center justify-center min-h-[450px]">
                {uploadedFile.type === 'pdf' ? (
                  <object
                    data={uploadedFile.url}
                    type="application/pdf"
                    className="w-full h-[550px] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl bg-white"
                  >
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg flex flex-col items-center text-center space-y-4 my-auto">
                      <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-500">
                        <FileText className="w-12 h-12" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">{uploadedFile.name}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                          To view the complete interactive PDF document with full browser controls, click below to open in a new tab.
                        </p>
                      </div>
                      <a
                        href={uploadedFile.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Open PDF in New Tab</span>
                      </a>
                    </div>
                  </object>
                ) : (
                  <img
                    src={uploadedFile.url}
                    alt="Uploaded preview"
                    className="max-w-full max-h-[600px] object-contain rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800"
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Textarea Input */}
        {tool.id !== 'ai-chat' && (
          <div className="relative">
            <textarea
              rows={5}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Enter input or text for ${tool.name}...`}
              className="w-full p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
            />
            
            <div className="absolute right-3 bottom-3 flex items-center gap-2">
              <button
                type="button"
                onClick={handleVoiceInput}
                className={`p-2 rounded-xl transition ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                title="Voice Dictation"
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Generate Button */}
        {tool.id !== 'ai-chat' && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-500">
              Costs 1 AI Credit (Free users get 10/day)
            </span>

            <button
              onClick={handleRun}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>AI Thinking...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Generate Output</span>
                </>
              )}
            </button>
          </div>
        )}

      </div>

      {/* AI Chat Layout Interface */}
      {tool.id === 'ai-chat' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-sm dark:shadow-xl flex flex-col h-[500px]">
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {messages.map((m, idx) => (
              <div 
                key={idx} 
                className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'ai' && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-600/20 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                )}
                <div className={`p-4 rounded-2xl max-w-[80%] text-xs sm:text-sm leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-none'
                }`}>
                  <p className="whitespace-pre-wrap">{m.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRun()}
              placeholder="Ask anything or enter code..."
              className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleRun}
              disabled={loading}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Output Result Container */}
      {output && tool.id !== 'ai-chat' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-sm dark:shadow-xl space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Generated Result</h4>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleTextToSpeech(output)}
                className={`p-2 rounded-xl border text-xs flex items-center gap-1 transition ${
                  isSpeaking ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Read Aloud"
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={handleCopy}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handleDownload}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-indigo-600 dark:text-indigo-300 flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export .MD</span>
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-mono text-slate-800 dark:text-slate-200 overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {output}
          </div>
        </div>
      )}

    </div>
  );
};
