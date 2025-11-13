'use client';

import Image from 'next/image';
import {
  Heart,
  MessageCircle,
  Share2,
  ShieldCheck,
  MoreVertical,
  Bookmark,
  PlayCircle,
} from 'lucide-react';
import clsx from 'clsx';

export default function FeedPostCard({
  post,
  onToggleLike,
  onToggleBookmark,
  onOpenComments,
  onShare,
  showAnalytics = false,
}) {
  if (!post) return null;

  const author = post.author || {
    name: 'Anonymous Founder',
    image: null,
  };

  const designation =
    author?.designation || post.author?.title || post.startup?.name || 'Startup builder';
  const professional = Boolean(post.professional);
  const timestamp = formatRelativeTime(post.createdAt);
  const tags = post.tags?.length
    ? post.tags.map(tag => (tag.startsWith('#') ? tag : `#${tag}`))
    : [];
  const stats = {
    likes: post.engagement?.likes ?? 0,
    comments: post.engagement?.comments ?? 0,
    shares: post.engagement?.shares ?? 0,
    views: post.metrics?.views ?? post.views ?? '—',
  };
  const analytics = post.analytics || {
    engagementRate: post.metrics?.engagementRate ?? '—',
    saved: post.metrics?.saved ?? 0,
  };
  const allowBookmark = typeof onToggleBookmark === 'function';
  const cover = resolveMedia(post);
  const commentPreview = post.commentsPreview || [];

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-xl backdrop-blur">
      <header className="flex items-start justify-between gap-3 px-6 pt-6">
        <div className="flex items-start gap-4">
          <div className="relative h-12 w-12 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/60 to-blue-500/60 text-white shadow-inner">
            <span className="absolute inset-0 flex items-center justify-center text-lg font-semibold">
              {initials(author?.name)}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 text-sm text-white">
              <span className="font-semibold leading-tight">{author?.name}</span>
              {professional && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-emerald-200">
                  <ShieldCheck className="h-3 w-3" />
                  Professional
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300/80">{designation}</p>
            <p className="text-xs text-slate-500">{timestamp}</p>
          </div>
        </div>
        <button
          type="button"
          className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
          aria-label="Post options"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </header>

      <div className="flex flex-col gap-4 px-6 pt-5 text-sm text-slate-200">
        {post.title ? <h2 className="text-lg font-semibold text-white">{post.title}</h2> : null}
        {post.body ? (
          <p className="whitespace-pre-line leading-relaxed text-slate-200/90">{post.body}</p>
        ) : null}
        {post.link ? (
          <a
            href={post.link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-max items-center gap-2 rounded-2xl border border-blue-400/40 bg-blue-500/5 px-3 py-2 text-xs text-blue-200 hover:bg-blue-500/10"
          >
            <span className="font-semibold">{post.link.title ?? post.link.url}</span>
            <Share2 className="h-3.5 w-3.5" />
          </a>
        ) : null}
        {tags?.length ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full border border-blue-400/40 bg-blue-500/10 px-3 py-1 text-[11px] font-medium tracking-wide text-blue-100"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {cover ? (
        <div className="relative mt-5 w-full overflow-hidden">
          <div
            className="group/figure relative w-full overflow-hidden rounded-[22px] border border-white/10 bg-white/5"
            style={{ aspectRatio: '16 / 10', maxHeight: 320 }}
          >
            <Image
              src={cover.url}
              alt={cover.alt}
              fill
              className="object-contain object-center transition duration-500 group-hover/figure:scale-[1.01]"
              sizes="(min-width: 1024px) 520px, 90vw"
            />
            {cover.kind === 'video' ? (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-slate-900">
                  <PlayCircle className="h-5 w-5" />
                  Play spotlight
                </span>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <footer className="px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1 text-[11px] text-slate-100">
              {stats.likes} likes
            </span>
            <span>{stats.comments} comments</span>
            {typeof stats.shares === 'number' && stats.shares > 0 ? (
              <span>{stats.shares} shares</span>
            ) : null}
            {stats.views ? <span>{stats.views} views</span> : null}
          </div>
          <span className="text-[11px] text-slate-500">Documotion Startup Feed</span>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-3 text-sm">
          <ActionButton
            icon={Heart}
            label="Like"
            active={post.liked}
            onClick={() => onToggleLike?.(post)}
          />
          <ActionButton
            icon={MessageCircle}
            label="Comment"
            onClick={() => onOpenComments?.(post)}
          />
          <ActionButton icon={Share2} label="Share" onClick={() => onShare?.(post)} />
          {allowBookmark ? (
            <ActionButton
              icon={Bookmark}
              label="Save"
              active={post.bookmarked}
              onClick={() => onToggleBookmark?.(post)}
            />
          ) : null}
        </div>

        {commentPreview?.length ? (
          <div className="mt-6 space-y-4 rounded-2xl border border-white/5 bg-white/5 p-4 text-sm text-slate-200">
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
              Comment preview
            </div>
            <div className="space-y-4">
              {commentPreview.slice(0, 3).map(comment => (
                <div key={comment.id} className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="font-semibold text-slate-100">
                      {comment.author?.name
                        ? `${comment.author.name}${comment.author.title ? ` · ${comment.author.title}` : ''}`
                        : 'Founder'}
                    </span>
                    <span className="text-slate-500">{formatRelativeTime(comment.createdAt)}</span>
                  </div>
                  <p className="leading-relaxed text-slate-200/90">{comment.body}</p>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-200 transition hover:text-blue-100"
              onClick={() => onOpenComments?.(post)}
            >
              View full thread →
            </button>
          </div>
        ) : null}

        {showAnalytics ? (
          <div className="mt-6 grid gap-3 rounded-2xl border border-white/5 bg-white/5 p-4 text-xs text-slate-300 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] uppercase tracking-[0.25em] text-slate-500">
                Engagement rate
              </span>
              <span className="text-base font-semibold text-white">
                {analytics.engagementRate ?? '—'}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] uppercase tracking-[0.25em] text-slate-500">Saves</span>
              <span className="text-base font-semibold text-white">{analytics.saved ?? 0}</span>
            </div>
          </div>
        ) : null}
      </footer>
    </article>
  );
}

function ActionButton({ icon: Icon, label, active = false, onClick }) {
  return (
    <button
      type="button"
      className={clsx(
        'inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.3em] transition',
        active
          ? 'bg-gradient-to-r from-rose-500/40 via-purple-500/40 to-blue-500/40 text-white shadow-lg shadow-rose-500/20'
          : 'bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white'
      )}
      onClick={onClick}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('');
}

function isVideo(source = '') {
  return /\.(mp4|mov|webm|m4v)$/i.test(source);
}

function resolveMedia(post) {
  if (post.media?.length) {
    const first = post.media[0];
    return {
      url: first.url,
      alt: post.title || 'Feed media',
      kind: first.type?.startsWith('video') ? 'video' : 'image',
    };
  }
  if (post.mediaUrl) {
    return {
      url: post.mediaUrl,
      alt: post.title || 'Feed media',
      kind: isVideo(post.mediaUrl) ? 'video' : 'image',
    };
  }
  return null;
}

function formatRelativeTime(timestamp) {
  if (!timestamp) return 'Just now';
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  if (Number.isNaN(date.getTime())) return 'Just now';
  const diff = Date.now() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < minute) return 'Just now';
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  if (diff < day * 7) return `${Math.floor(diff / day)}d ago`;
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}
