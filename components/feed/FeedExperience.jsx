'use client';

import { useCallback, useRef } from 'react';
import PostComposer from '@/components/feed/PostComposer';
import FeedTimeline from '@/components/feed/FeedTimeline';

export default function FeedExperience({ initialPosts = [] }) {
  const timelineApiRef = useRef(null);

  const handleCreated = useCallback(post => {
    timelineApiRef.current?.addPost?.(post);
  }, []);

  const handleReady = useCallback(api => {
    timelineApiRef.current = api;
  }, []);

  return (
    <div className="space-y-10">
      <PostComposer onCreate={handleCreated} />
      <FeedTimeline initialPosts={initialPosts} onReady={handleReady} />
    </div>
  );
}
