"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { toast } from "@/components/ui/sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/lib/auth-client";
import {
  getReviews,
  submitReview,
  type ItemReview,
  type ReviewSummary,
  type ReviewTargetType,
} from "@/lib/core/server";

function formatReviewDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
}

export default function ReviewSection({
  targetType,
  targetId,
  title,
}: {
  targetType: ReviewTargetType;
  targetId: string;
  title: string;
}) {
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [ratingEdited, setRatingEdited] = useState(false);
  const [commentEdited, setCommentEdited] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    void getReviews(targetType, targetId, controller.signal)
      .then((result) => {
        setSummary(result);
        setError(null);
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            cause instanceof Error ? cause.message : "Could not load reviews.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [targetId, targetType]);

  const canReview =
    session?.user?.role === "customer" && !session.user.isBlocked;
  const userReview = summary?.reviews.find(
    (review) => review.customerId === session?.user?.id,
  );

  const selectedRating = ratingEdited ? rating : userReview?.rating ?? rating;
  const reviewComment = commentEdited ? comment : userReview?.comment ?? comment;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = session?.session.token;
    if (!canReview) {
      toast.error("Only signed-in customers can leave reviews.");
      return;
    }
    if (!token) {
      toast.error("Your session token is missing. Please sign in again.");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitReview(token, {
        targetType,
        targetId,
        rating: selectedRating,
        comment: reviewComment.trim(),
      });
      toast.success(userReview ? "Review updated." : "Review submitted.");
      setError(null);
      try {
        setSummary(await getReviews(targetType, targetId));
      } catch (cause) {
        setError(
          cause instanceof Error
            ? `Review saved, but the list could not be refreshed: ${cause.message}`
            : "Review saved, but the list could not be refreshed.",
        );
      }
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "Could not submit review.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-400">
            Community feedback
          </p>
          <h2 className="mt-2 text-xl font-bold">{title}</h2>
        </div>
        <div className="text-right">
          <p className="inline-flex items-center gap-1 font-semibold text-amber-400">
            <Star aria-hidden="true" size={16} className="fill-current" />
            {summary?.averageRating.toFixed(1) ?? "0.0"}
          </p>
          <p className="text-xs text-white/50">
            {summary?.reviewCount ?? 0}{" "}
            {(summary?.reviewCount ?? 0) === 1 ? "review" : "reviews"}
          </p>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-red-400/20 bg-red-400/5 px-3 py-2 text-sm text-red-200"
        >
          {error}
        </p>
      )}

      {canReview ? (
        <form
          onSubmit={handleSubmit}
          className="mt-5 rounded-xl border border-white/10 bg-black/10 p-4"
        >
          <p className="text-sm font-semibold">
            {userReview ? "Update your review" : "Share your experience"}
          </p>
          <div
            role="group"
            aria-label="Your rating"
            className="mt-3 flex items-center gap-1"
          >
            {Array.from({ length: 5 }, (_, index) => {
              const value = index + 1;
              return (
                <button
                  key={value}
                  type="button"
                  aria-label={`${value} star${value === 1 ? "" : "s"}`}
                  aria-pressed={selectedRating === value}
                  onClick={() => {
                    setRating(value);
                    setRatingEdited(true);
                  }}
                  className="rounded p-1 text-amber-400 transition hover:scale-110 focus-visible:outline-2 focus-visible:outline-amber-400"
                >
                  <Star
                    aria-hidden="true"
                    size={21}
                    className={value <= selectedRating ? "fill-current" : ""}
                  />
                </button>
              );
            })}
          </div>
          <Textarea
            value={reviewComment}
            onChange={(event) => {
              setComment(event.target.value);
              setCommentEdited(true);
            }}
            maxLength={1000}
            rows={3}
            placeholder="Write an optional review (up to 1000 characters)"
            className="mt-3 border-white/15 bg-[#090a0b] text-white placeholder:text-white/40"
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-white/40">
              {reviewComment.length}/1000
            </span>
            <Button
              type="submit"
              disabled={isSubmitting || isSessionPending || isLoading}
              className="bg-emerald-600 text-white hover:bg-emerald-500"
            >
              {isSubmitting
                ? "Saving..."
                : userReview
                  ? "Update review"
                  : "Submit review"}
            </Button>
          </div>
        </form>
      ) : !isSessionPending ? (
        <p className="mt-5 text-sm text-white/55">
          <Link
            href="/sign-in"
            className="font-semibold text-emerald-300 underline underline-offset-4"
          >
            Sign in as a customer
          </Link>{" "}
          to leave a review.
        </p>
      ) : null}

      <div className="mt-5 space-y-3">
        {isLoading ? (
          <p role="status" className="text-sm text-white/50">
            Loading reviews...
          </p>
        ) : summary && summary.reviews.length > 0 ? (
          summary.reviews.map((review: ItemReview, index) => (
            <article
              key={review._id ?? `${review.customerName}-${index}`}
              className="border-t border-white/10 pt-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">{review.customerName}</p>
                <time
                  dateTime={review.createdAt}
                  className="text-xs text-white/45"
                >
                  {formatReviewDate(review.createdAt)}
                </time>
              </div>
              <p className="mt-1 inline-flex items-center gap-1 text-sm text-amber-400">
                <Star aria-hidden="true" size={14} className="fill-current" />
                {review.rating}/5
              </p>
              {review.comment && (
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-white/65">
                  {review.comment}
                </p>
              )}
            </article>
          ))
        ) : !error ? (
          <p className="border-t border-white/10 pt-4 text-sm text-white/50">
            No reviews yet. Be the first to share your experience.
          </p>
        ) : null}
      </div>
    </section>
  );
}
