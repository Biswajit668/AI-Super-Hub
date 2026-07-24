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
  Wand2 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { recordToolUsage } from '../../lib/firebase';
import { ToolItem } from '../../types';

interface AiToolRunnerProps {
  tool: ToolItem;
  onOpenUpgrade: () => void;
}

export const AiToolRunner: React.FC<AiToolRunnerProps> = ({ tool, onOpenUpgrade }) => {
  const { profile, useCredit } = useAuth();
  
  const [inputText, setInputText] = useState('');
  const [targetLang, setTargetLang] = useState('Spanish');
  const [tone, setTone] = useState('Professional');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setSelectedImage(evt.target?.result as string);
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

      const data = await res.json();

      if (data.result) {
        if (tool.id === 'ai-chat') {
          const userMsg = { role: 'user' as const, text: inputText };
          const aiMsg = { role: 'ai' as const, text: data.result };
          setMessages(prev => [...prev, userMsg, aiMsg]);
        } else {
          setOutput(data.result);
        }

        if (profile) {
          await recordToolUsage(profile.uid, tool.id, tool.name, inputText || 'Image Input', data.result);
        }
      } else {
        setOutput('Error: ' + (data.error || 'Failed to generate response.'));
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
    element.download = `${tool.id}-output.md`;
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

        {/* Image / File Upload for Vision Tools */}
        {(tool.id === 'ai-ocr' || tool.id === 'ai-image-desc' || tool.id === 'ai-pdf-chat') && (
          <div>
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              className="hidden" 
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-indigo-600 dark:text-indigo-300 flex items-center gap-2 transition"
            >
              <ImageIcon className="w-4 h-4" />
              <span>{selectedImage ? 'Change Uploaded File' : 'Upload Image / Document'}</span>
            </button>
            {selectedImage && (
              <div className="mt-3 relative w-32 h-32 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
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
