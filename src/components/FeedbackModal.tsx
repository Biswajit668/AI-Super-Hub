import React, { useState } from 'react';
import { X, Star, MessageSquare, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ToolItem } from '../types';

interface FeedbackModalProps {
  tool: ToolItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ tool, isOpen, onClose }) => {
  const { submitFeedback } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !tool) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitFeedback(tool.id, rating, comment);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setComment('');
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-slate-900 dark:text-slate-100 shadow-2xl relative animate-in fade-in zoom-in duration-200">
        
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 dark:text-emerald-400 mx-auto mb-3 animate-bounce" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Thank You for Your Feedback!</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Your review helps improve Super Hub AI.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 dark:border-amber-500/30 flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-amber-500 dark:text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Rate & Review</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">How was your experience with {tool.name}?</p>
            </div>

            {/* Rating Stars */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-700'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Comment Area */}
            <div className="mb-6">
              <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Feedback / Suggestions</label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts or feature requests..."
                className="w-full p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition"
            >
              Submit Feedback
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
