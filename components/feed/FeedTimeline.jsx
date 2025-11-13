'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import FeedPostCard from '@/components/feed/FeedPostCard';
import { Loader2 } from 'lucide-react';

export default function FeedTimeline({ initialPosts = [], onReady }) {
  const [posts, setPosts] = useState(initialPosts);
  const [cursor, setCursor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = useCallback(
    async (options = {}) => {
      if (loading) return;
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set('limit', options.limit ?? 10);
        if (options.cursor) params.set('cursor', options.cursor);
        if (options.sort) params.set('sort', options.sort);
        if (options.tags?.length) {
          options.tags.forEach(tag => params.append('tags', tag));
        }
        if (options.professional !== undefined)
          params.set('professional', String(options.professional));

        const response = await fetch(`/api/feed/posts?${params.toString()}`, { cache: 'no-store' });
        const json = await response.json();
        if (!response.ok || !json.success) {
          throw new Error(json.error || 'Unable to load posts');
        }

        const nextPosts = json.data.posts || [];
        const nextCursor = json.data.nextCursor || null;

        setPosts(prev => (options.cursor ? [...prev, ...nextPosts] : nextPosts));
        setCursor(nextCursor);
        setHasMore(Boolean(nextCursor));
      } catch (err) {
        console.error('FeedTimeline fetch', err);
        setError(err.message || 'Unable to load feed');
      } finally {
        setLoading(false);
      }
    },
    [loading]
  );

  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  useEffect(() => {
    if (!initialPosts?.length) {
      fetchPosts();
    }
  }, [fetchPosts, initialPosts?.length]);

  const handleLike = useCallback(
    async post => {
      try {
        const updated = { ...post, liked: !post.liked };
        updated.engagement = {
          ...post.engagement,
          likes: (post.engagement?.likes ?? 0) + (post.liked ? -1 : 1),
        };
        setPosts(prev => prev.map(item => (item.id === post.id ? updated : item)));

        await fetch(`/api/feed/posts/${post.id}/like`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: post.liked ? 'unlike' : 'like' }),
        });
      } catch (err) {
        console.error('toggle like failed', err);
        fetchPosts();
      }
    },
    [fetchPosts]
  );

  const handleBookmark = useCallback(
    async post => {
      try {
        const updated = { ...post, bookmarked: !post.bookmarked };
        setPosts(prev => prev.map(item => (item.id === post.id ? updated : item)));

        await fetch(`/api/feed/posts/${post.id}/bookmark`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: post.bookmarked ? 'remove' : 'add' }),
        });
      } catch (err) {
        console.error('toggle bookmark failed', err);
        fetchPosts();
      }
    },
    [fetchPosts]
  );

  const addPost = useCallback(post => {
    setPosts(prev => [post, ...prev]);
  }, []);

  const refresh = useCallback(() => fetchPosts(), [fetchPosts]);

  useEffect(() => {
    onReady?.({ addPost, refresh });
  }, [addPost, onReady, refresh]);

  const timelineContent = useMemo(() => {
    if (loading && posts.length === 0) {
      return (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      );
    }

    if (error && posts.length === 0) {
      return (
        <div className="rounded-3xl border border-rose-400/30 bg-rose-400/10 p-10 text-center text-sm text-rose-100">
          {error}
        </div>
      );
    }

    if (!posts.length) {
      return (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-sm text-slate-300">
          Be the first to share an update today.
        </div>
      );
    }

    return posts.map(post => (
      <FeedPostCard
        key={post.id}
        post={post}
        onToggleLike={handleLike}
        onToggleBookmark={handleBookmark}
      />
    ));
  }, [error, handleBookmark, handleLike, loading, posts]);

  return (
    <div className="space-y-8">
      {timelineContent}

      {hasMore ? (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => fetchPosts({ cursor })}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Load more
          </button>
        </div>
      ) : null}
    </div>
  );
}
