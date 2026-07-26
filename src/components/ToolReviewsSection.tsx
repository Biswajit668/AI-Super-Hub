import React, { useState, useEffect } from 'react';
import { 
  Star, 
  MessageSquare, 
  ThumbsUp, 
  Send, 
  CheckCircle2, 
  User, 
  Trash2, 
  Sparkles,
  Filter,
  BarChart2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ToolItem, ToolReviewItem } from '../types';
import { submitToolReview, fetchToolReviews, deleteToolReviewFromDb } from '../lib/firebase';
import confetti from 'canvas-confetti';

interface ToolReviewsSectionProps {
  tool: ToolItem;
}

export const ToolReviewsSection: React.FC<ToolReviewsSectionProps> = ({ tool }) => {
  const { profile, currentUser, isAdmin } = useAuth();

  const [reviews, setReviews] = useState<ToolReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  // New review form state
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Pre-fill user details if logged in
  useEffect(() => {
    if (profile) {
      setUserName(profile.displayName || '');
      setUserEmail(profile.email || '');
    } else if (currentUser) {
      setUserName(currentUser.displayName || currentUser.email?.split('@')[0] || '');
      setUserEmail(currentUser.email || '');
    }
  }, [profile, currentUser]);

  // Fetch reviews whenever tool changes
  useEffect(() => {
    loadReviews();
  }, [tool.id]);

  const loadReviews = async () => {
    setLoading(true);
    const data = await fetchToolReviews(tool.id);
    setReviews(data);
    setLoading(false);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmitting(true);
    try {
      const uid = profile?.uid || currentUser?.uid || 'guest-' + Date.now();
      const finalName = userName.trim() || 'Anonymous User';
      const finalEmail = userEmail.trim() || 'guest@superhub.ai';

      await submitToolReview(
        tool.id,
        uid,
        finalName,
        finalEmail,
        rating,
        comment.trim()
      );

      confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
      setSuccessMsg(true);
      setComment('');
      setShowForm(false);
      await loadReviews();

      setTimeout(() => {
        setSuccessMsg(false);
      }, 3000);
    } catch (err) {
      console.error('Error submitting review:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId?: string) => {
    if (!reviewId || !confirm('Are you sure you want to delete this review?')) return;
    await deleteToolReviewFromDb(reviewId);
    setReviews(prev => prev.filter(r => r.id !== reviewId));
  };

  // Compute Statistics
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / totalReviews).toFixed(1)
    : tool.rating ? tool.rating.toFixed(1) : '4.9';

  const starCounts = [5, 4, 3, 2, 1].map(stars => {
    const count = reviews.filter(r => Math.round(r.rating) === stars).length;
    const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : stars === 5 ? 85 : stars === 4 ? 15 : 0;
    return { stars, count, percentage };
  });

  return (
    <div className="mt-8 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <span>Ratings & Reviews for {tool.name}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Read authentic feedback from members or write your review
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition flex items-center gap-2 shrink-0"
        >
          <MessageSquare className="w-4 h-4" />
          <span>{showForm ? 'Cancel Review' : 'Write a Review'}</span>
        </button>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-300">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Thank you! Your star rating and review have been published.</span>
        </div>
      )}

      {/* Rating Summary Breakdown Box */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
        
        {/* Overall Score */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-4 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 text-center">
          <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {avgRating}
          </div>
          <div className="flex items-center gap-1 my-2">
            {[1, 2, 3, 4, 5].map(s => (
              <Star
                key={s}
                className={`w-4 h-4 ${
                  s <= Math.round(Number(avgRating))
                    ? 'text-amber-500 fill-amber-500'
                    : 'text-slate-300 dark:text-slate-700'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Based on {totalReviews > 0 ? `${totalReviews} user review${totalReviews > 1 ? 's' : ''}` : 'community feedback'}
          </p>
        </div>

        {/* Star Progress Bars */}
        <div className="md:col-span-8 space-y-2 flex flex-col justify-center">
          {starCounts.map(({ stars, count, percentage }) => (
            <div key={stars} className="flex items-center gap-3 text-xs">
              <span className="w-12 text-right font-bold text-slate-600 dark:text-slate-400 flex items-center justify-end gap-1 shrink-0">
                <span>{stars}</span>
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              </span>
              <div className="flex-1 h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-10 text-slate-400 text-[11px] font-mono shrink-0">
                {percentage}%
              </span>
            </div>
          ))}
        </div>

      </div>

      {/* Review Submission Form Drawer */}
      {showForm && (
        <form 
          onSubmit={handleSubmitReview}
          className="p-5 sm:p-6 rounded-2xl bg-indigo-50/50 dark:bg-slate-800/50 border border-indigo-200 dark:border-slate-700 space-y-4 animate-in fade-in duration-200"
        >
          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Rate & Review {tool.name}</span>
          </h4>

          {/* Interactive Star Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Star Rating *
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  type="button"
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-125 focus:outline-none"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= (hoverRating || rating)
                        ? 'text-amber-500 fill-amber-500'
                        : 'text-slate-300 dark:text-slate-600'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-xs font-extrabold text-amber-600 dark:text-amber-400">
                {rating === 5 ? '5 Stars - Excellent!' : `${rating} Stars`}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="e.g. Alex Johnson"
                className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Address (Private)
              </label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Your Review / Feedback *
            </label>
            <textarea
              rows={3}
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was your experience using this tool? Was it fast, helpful, or easy to use?"
              className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !comment.trim()}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Publishing...' : 'Submit Review'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Community Reviews List */}
      <div className="space-y-4">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          User Reviews ({reviews.length})
        </h4>

        {loading ? (
          <p className="text-xs text-slate-400 py-4 text-center">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <div className="py-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No Reviews Yet</p>
            <p className="text-[11px] text-slate-500">Be the first to review {tool.name}!</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500 transition"
            >
              <Star className="w-3.5 h-3.5 fill-white" />
              <span>Write First Review</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((rev) => (
              <div 
                key={rev.id}
                className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-extrabold text-xs">
                      {rev.userName ? rev.userName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                        {rev.userName || 'Member'}
                      </h5>
                      <span className="text-[10px] text-slate-400">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star
                          key={s}
                          className={`w-3 h-3 ${
                            s <= rev.rating
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-slate-300 dark:text-slate-700'
                          }`}
                        />
                      ))}
                    </div>

                    {isAdmin && rev.id && (
                      <button
                        onClick={() => handleDeleteReview(rev.id)}
                        className="p-1 text-slate-400 hover:text-rose-500 transition rounded"
                        title="Delete Review (Admin)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-10">
                  {rev.comment}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
