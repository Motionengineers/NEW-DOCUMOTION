export function normaliseTag(tag) {
  return tag?.toString().trim().toLowerCase().replace(/\s+/g, '-');
}

export function serializeComment(comment) {
  if (!comment) return null;
  return {
    id: comment.id,
    body: comment.body,
    parentCommentId: comment.parentCommentId,
    createdAt:
      comment.createdAt instanceof Date ? comment.createdAt.toISOString() : comment.createdAt,
    updatedAt:
      comment.updatedAt instanceof Date ? comment.updatedAt.toISOString() : comment.updatedAt,
    author: comment.author
      ? {
          id: comment.author.id,
          name: comment.author.name,
          image: comment.author.image,
        }
      : null,
    replies: comment.replies?.map(reply => serializeComment(reply)) || [],
  };
}

export function serializePost(post, userId) {
  if (!post) return null;
  const tags = post.tags?.map(tag => tag.tag || tag) || [];
  const likeInteractions =
    post.interactions?.filter?.(interaction => interaction.type === 'like') ??
    post.interactions ??
    [];
  const likes = likeInteractions.length;
  const liked = Boolean(likeInteractions.some(interaction => interaction.userId === userId));
  const bookmarked = Boolean(
    post.bookmarks?.some?.(bookmark => bookmark.userId === userId) || post.bookmarks?.length
  );
  const commentsPreview = post.comments?.map(comment => serializeComment(comment)) || [];

  return {
    id: post.id,
    title: post.title || null,
    body: post.body || null,
    embedUrl: post.embedUrl,
    mediaType: post.mediaType,
    mediaUrl: post.mediaUrl,
    link: post.linkUrl
      ? {
          url: post.linkUrl,
          title: post.linkTitle,
          description: post.linkDescription,
        }
      : null,
    professional: post.professional,
    tags,
    stage: post.stage,
    industry: post.industry,
    location: post.location,
    visibility: post.visibility,
    createdAt: post.createdAt instanceof Date ? post.createdAt.toISOString() : post.createdAt,
    updatedAt: post.updatedAt instanceof Date ? post.updatedAt.toISOString() : post.updatedAt,
    author: post.author
      ? {
          id: post.author.id,
          name: post.author.name,
          image: post.author.image,
        }
      : null,
    startup: post.startup
      ? {
          id: post.startup.id,
          name: post.startup.name,
        }
      : null,
    media:
      post.media?.map(item => ({
        id: item.id,
        type: item.type,
        url: item.url,
        thumbnailUrl: item.thumbnailUrl,
      })) || [],
    engagement: {
      likes,
      comments: post._count?.comments ?? post.commentsCount ?? 0,
    },
    liked,
    bookmarked,
    commentsPreview,
  };
}
