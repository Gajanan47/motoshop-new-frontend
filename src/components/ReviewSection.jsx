import { useState, useEffect } from 'react'
import { getReviews, addReviews, deleteReview } from '../api/review'
import { useNavigate } from 'react-router-dom'
import Skeleton from './Skeleton'

// ── Star rating widget — works for both interactive and read-only display ──
const StarRating = ({ value, onChange, readOnly = false }) => {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => !readOnly && onChange?.(star)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          className={`text-2xl transition ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
        >
          <span className={(hovered || value) >= star ? 'text-blue-500' : 'text-slate-200'}>
            ★
          </span>
        </button>
      ))}
    </div>
  )
}

// ── Rating bar — shows distribution of ratings (5★ x%, 4★ y%, ...) ──
const RatingBar = ({ label, count, total }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-slate-500 w-4 text-right shrink-0">{label}</span>
      <span className="text-blue-400 shrink-0">★</span>
      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
        <div
          className="bg-blue-400 h-2 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-slate-400 w-8 text-right shrink-0">{count}</span>
    </div>
  )
}

export default function ReviewSection({ productId }) {
  const navigate = useNavigate()

  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(false)

  // write-review form state
  const [myRating, setMyRating] = useState(0)
  const [myComment, setMyComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')

  const isLoggedIn = !!localStorage.getItem('userToken')
  const currentUserId = localStorage.getItem('userId')

  // ── Load reviews ──
  async function load() {
    setLoading(true)
    try {
      const res = await getReviews(productId)
      setReviews(res.data.data || [])
    } catch (err) {
      console.log('Failed to load reviews:', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (productId) load()
  }, [productId])

  // ── Computed stats ──
  const total = reviews.length
  const avg = total
    ? (reviews.reduce((s, r) => s + r.rating, 0) / total).toFixed(1)
    : null

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }))

  const myExistingReview = currentUserId
    ? reviews.find((r) => String(r.user_id) === String(currentUserId))
    : null

  // ── Submit review ──
  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')

    if (myRating === 0) return setFormError('Please select a star rating.')
    if (!myComment.trim()) return setFormError('Please write a comment.')

    setSubmitting(true)
    try {
      await addReviews(productId, { rating: myRating, comment: myComment.trim() })
      setFormSuccess('Review submitted — thank you!')
      setMyRating(0)
      setMyComment('')
      await load()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Delete own review ──
  async function handleDelete() {
    try {
      await deleteReview(productId)
      await load()
    } catch (err) {
      console.log('Delete failed:', err.message)
    }
  }

  return (
    <div id='reviews' className="max-w-7xl mx-auto px-6 sm:px-8 py-12">

      {/* ── Section header ── */}
      <h2 className="text-2xl font-bold text-slate-900 mb-8">Customer Reviews</h2>

      <div className="grid lg:grid-cols-3 gap-8">

        {/* ── Left column: summary + write form ── */}
        <div className="space-y-6">

          {/* Aggregate rating summary */}
          {total > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-end gap-3 mb-4">
                <span className="text-6xl font-bold text-slate-900 leading-none">{avg}</span>
                <div className="pb-1">
                  <StarRating value={Math.round(avg)} readOnly />
                  <p className="text-sm text-slate-400 mt-1">
                    {total} review{total !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Rating distribution bars */}
              <div className="space-y-2">
                {distribution.map(({ star, count }) => (
                  <RatingBar key={star} label={star} count={count} total={total} />
                ))}
              </div>
            </div>
          )}

          {/* Write a review card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-semibold text-slate-900 mb-4 text-lg">Write a Review</h3>

            {/* Not logged in */}
            {!isLoggedIn && (
              <div className="text-center py-4">
                <div className="text-3xl mb-3">🔐</div>
                <p className="text-sm text-slate-500 mb-3">
                  You need to be logged in to leave a review.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition cursor-pointer"
                >
                  Log in to review
                </button>
              </div>
            )}

            {/* Already reviewed — show existing review with option to delete */}
            {isLoggedIn && myExistingReview && (
              <div>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <StarRating value={myExistingReview.rating} readOnly />
                    <span className="text-xs text-slate-400">Your review</span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {myExistingReview.comment}
                  </p>
                </div>
                <button
                  onClick={handleDelete}
                  className="text-xs text-red-400 hover:text-red-600 transition cursor-pointer underline"
                >
                  Delete my review
                </button>
              </div>
            )}

            {/* Review form — logged in, no existing review */}
            {isLoggedIn && !myExistingReview && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-2">
                    Your Rating
                  </label>
                  <StarRating value={myRating} onChange={setMyRating} />
                  {myRating > 0 && (
                    <p className="text-xs text-slate-400 mt-1">
                      {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][myRating]}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-2">
                    Your Review
                  </label>
                  <textarea
                    value={myComment}
                    onChange={(e) => setMyComment(e.target.value)}
                    placeholder="Share your experience with this vehicle..."
                    rows={4}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:bg-white transition resize-none"
                  />
                  <p className="text-xs text-slate-400 text-right mt-1">
                    {myComment.length}/500
                  </p>
                </div>

                {formError && (
                  <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    {formError}
                  </p>
                )}
                {formSuccess && (
                  <p className="text-sm text-green-600 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                    ✓ {formSuccess}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-slate-200 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition cursor-pointer text-sm"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ── Right column: all reviews list ── */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <div className="flex items-start gap-3">
                    <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="space-y-1.5">
                          <Skeleton className="h-3.5 w-28" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-3.5 w-full mt-3" />
                      <Skeleton className="h-3.5 w-2/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
              <div className="text-5xl mb-4">⭐</div>
              <p className="font-semibold text-slate-700 mb-1">No reviews yet</p>
              <p className="text-sm text-slate-400">
                Be the first to review this vehicle!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:border-blue-200 transition"
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold text-sm flex items-center justify-center shrink-0">
                      {review.user_name?.[0]?.toUpperCase() || 'U'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">
                            {review.user_name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {new Date(review.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                        <StarRating value={review.rating} readOnly />
                      </div>

                      <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                        {review.comment}
                      </p>

                      {/* Verified badge if this is the current user's review */}
                      {currentUserId && String(review.user_id) === String(currentUserId) && (
                        <span className="inline-block mt-2 text-xs text-blue-500 font-medium bg-blue-50 px-2 py-0.5 rounded-full">
                          ✓ Your review
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}