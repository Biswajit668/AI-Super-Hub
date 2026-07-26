import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lightbulb, 
  ThumbsUp, 
  PlusCircle, 
  CheckCircle2, 
  Search, 
  Sparkles, 
  Filter, 
  Clock, 
  CheckCheck, 
  Flame,
  MessageSquare,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ToolRequestItem } from '../types';
import { 
  submitNewToolRequest, 
  fetchToolRequests, 
  toggleUpvoteToolRequest 
} from '../lib/firebase';
import confetti from 'canvas-confetti';

interface RequestToolModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RequestToolModal: React.FC<RequestToolModalProps> = ({ isOpen, onClose }) => {
  const { profile, currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'request' | 'browse'>('request');
  
  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('AI Tools');
  const [description, setDescription] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Community Requests List State
  const [requestsList, setRequestsList] = useState<ToolRequestItem[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Auto populate user info when logged in
  useEffect(() => {
    if (profile) {
      setUserName(profile.displayName || '');
      setUserEmail(profile.email || '');
    } else if (currentUser) {
      setUserName(currentUser.displayName || currentUser.email?.split('@')[0] || '');
      setUserEmail(currentUser.email || '');
    }
  }, [profile, currentUser]);

  // Fetch Requests when modal opens or tab changes to browse
  useEffect(() => {
    if (isOpen) {
      loadRequests();
    }
  }, [isOpen]);

  const loadRequests = async () => {
    setLoadingRequests(true);
    const data = await fetchToolRequests();
    setRequestsList(data);
    setLoadingRequests(false);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setSubmitting(true);
    try {
      const uid = profile?.uid || currentUser?.uid || 'guest-' + Date.now();
      await submitNewToolRequest(
        uid,
        userEmail || 'guest@superhub.ai',
        userName || 'Super Hub User',
        title.trim(),
        category,
        description.trim()
      );

      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      setSubmittedSuccess(true);
      await loadRequests();

      setTimeout(() => {
        setSubmittedSuccess(false);
        setTitle('');
        setDescription('');
        setActiveTab('browse');
      }, 2000);
    } catch (err) {
      console.error('Error submitting tool request:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpvote = async (requestId?: string) => {
    if (!requestId) return;
    const uid = profile?.uid || currentUser?.uid || 'guest';

    // Optimistic UI update
    setRequestsList(prev => prev.map(req => {
      if (req.id === requestId) {
        const upvotedBy = req.upvotedBy || [];
        const isUpvoted = upvotedBy.includes(uid);
        const newUpvotedBy = isUpvoted 
          ? upvotedBy.filter(id => id !== uid) 
          : [...upvotedBy, uid];
        return {
          ...req,
          upvotedBy: newUpvotedBy,
          upvotes: isUpvoted ? req.upvotes - 1 : req.upvotes + 1
        };
      }
      return req;
    }));

    await toggleUpvoteToolRequest(requestId, uid);
  };

  // Filter requests
  const filteredRequests = requestsList.filter(req => {
    const matchesSearch = req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          req.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          req.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCheck className="w-3 h-3" />
            Completed
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-3 h-3 animate-pulse" />
            In Development
          </span>
        );
      case 'planned':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" />
            Planned
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            Under Review
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-900 dark:text-slate-100 shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header Bar */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-500 p-0.5 shadow-md shadow-amber-500/20">
              <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[14px] flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-amber-500" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Request New Tool & Feature Ideas</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Suggest tools you need or vote on community requests!</p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Bar */}
        <div className="flex items-center border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-100/50 dark:bg-slate-950/40">
          <button
            onClick={() => setActiveTab('request')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'request'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit New Idea</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('browse');
              loadRequests();
            }}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'browse'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Community Requests ({requestsList.length})</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          
          {/* TAB 1: Submit Form */}
          {activeTab === 'request' && (
            <div>
              {submittedSuccess ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Tool Request Submitted!</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Thank you! Your suggestion has been published to the community voting board for review and development.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Tool Name / Feature Idea Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., AI Resume Reviewer, SVG to PNG Converter, OCR PDF Text Extractor..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Category *
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="AI Tools">AI Tools & Generator</option>
                        <option value="PDF Tools">PDF Conversion & Utility</option>
                        <option value="Image Tools">Image Editor & Converter</option>
                        <option value="Text Tools">Text & Formatting Tools</option>
                        <option value="Calculator Tools">Calculators & Finance</option>
                        <option value="Utility Tools">General Smart Utilities</option>
                        <option value="Other">Other Custom Tool Idea</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Your Name / Email
                      </label>
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Your name or email"
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Tool Description & Requirements *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe what the tool should do, what inputs users will upload or enter, and how the output should look..."
                      className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || !title.trim() || !description.trim()}
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <span>Submitting Idea...</span>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Submit Tool Request & Publish</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: Community Ideas & Upvoting */}
          {activeTab === 'browse' && (
            <div className="space-y-4">
              
              {/* Search & Status Filters */}
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search requested tools..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto">
                  {['all', 'under_review', 'planned', 'in_progress', 'completed'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold capitalize whitespace-nowrap transition ${
                        statusFilter === status
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {status.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ideas Cards List */}
              {loadingRequests ? (
                <div className="py-12 text-center text-xs text-slate-400">Loading requested tools...</div>
              ) : filteredRequests.length === 0 ? (
                <div className="py-12 text-center space-y-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <Lightbulb className="w-8 h-8 text-amber-500 mx-auto" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No Tool Requests Found</p>
                  <p className="text-[11px] text-slate-400">Be the first to suggest a new tool or feature idea!</p>
                  <button
                    onClick={() => setActiveTab('request')}
                    className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Submit First Request</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredRequests.map((req) => {
                    const currentUid = profile?.uid || currentUser?.uid || 'guest';
                    const hasUpvoted = (req.upvotedBy || []).includes(currentUid);

                    return (
                      <div 
                        key={req.id}
                        className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700/60 transition flex items-start gap-4"
                      >
                        {/* Upvote Box */}
                        <button
                          onClick={() => handleUpvote(req.id)}
                          className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition min-w-[54px] shrink-0 ${
                            hasUpvoted
                              ? 'bg-amber-500/10 dark:bg-amber-500/20 border-amber-500/40 text-amber-600 dark:text-amber-400 font-extrabold shadow-sm'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-amber-400 hover:text-amber-500'
                          }`}
                        >
                          <ThumbsUp className={`w-4 h-4 ${hasUpvoted ? 'fill-amber-500' : ''}`} />
                          <span className="text-xs font-extrabold mt-1">{req.upvotes || 0}</span>
                        </button>

                        {/* Request Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300">
                              {req.category}
                            </span>
                            {getStatusBadge(req.status)}
                          </div>

                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {req.title}
                          </h4>

                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                            {req.description}
                          </p>

                          {req.adminNotes && (
                            <div className="mt-2.5 p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-700 dark:text-indigo-300">
                              <span className="font-bold">Admin Response: </span>
                              {req.adminNotes}
                            </div>
                          )}

                          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
                            <span>Requested by {req.userName || 'Member'}</span>
                            <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
