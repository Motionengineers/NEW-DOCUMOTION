import fs from 'fs';
import path from 'path';
import Navbar from '@/components/Navbar';
import FeedExperience from '@/components/feed/FeedExperience';
import prisma from '@/lib/prisma';
import { serializePost } from '@/lib/feed/serializers';

const FEED_IMAGES_DIR = path.join(process.cwd(), 'public', 'uploads', 'feed');
const PLACEHOLDER_CAPTIONS = [
  'Startup milestone update: unlocking Seed+ to expand our compliance automation pods across India and SEA.',
  'Product launch drop: introducing our AI underwriting sandbox for founders in Fintech and ClimateTech.',
  'Investor spotlight: sharing portfolio wins and lessons from onboarding 120+ venture-backed founders.',
  'Talent shoutout: scaling our design practice with fresh leadership across Bengaluru and Mumbai hubs.',
];
const TAG_SETS = [
  ['#Startup', '#Funding', '#AI'],
  ['#ProductLaunch', '#Growth', '#Fintech'],
  ['#Community', '#Hiring', '#SaaS'],
  ['#FounderLife', '#Climate', '#Innovation'],
];
const AUTHOR_POOL = [
  { name: 'Ananya Kapoor', designation: 'Founder · NovaSense AI', verified: true },
  { name: 'Rahul Verma', designation: 'Investor · BrightCap Ventures', verified: false },
  { name: 'Sana Khan', designation: 'COO · Meridian Labs', verified: true },
  { name: 'Ishaan Pillai', designation: 'Product Lead · VeloStack', verified: false },
];

export const metadata = {
  title: 'Startup Feed • Documotion',
  description:
    'Share startup milestones, product launches, and insights with the Documotion community.',
};

async function loadInitialFeed() {
  if (!prisma?.feedPost?.findMany) {
    console.warn(
      '[feed] FeedPost model is missing on Prisma client. This usually means the Prisma client was not regenerated after schema changes. Returning empty feed.'
    );
    return loadDemoPosts();
  }

  const posts = await prisma.feedPost.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      author: { select: { id: true, name: true, image: true } },
      startup: { select: { id: true, name: true } },
      tags: true,
      media: true,
      interactions: {
        where: { type: 'like' },
        select: { userId: true, type: true },
      },
      bookmarks: {
        select: { userId: true, postId: true },
      },
      comments: {
        where: { parentCommentId: null },
        orderBy: { createdAt: 'desc' },
        take: 2,
        include: {
          author: { select: { id: true, name: true, image: true } },
          replies: {
            orderBy: { createdAt: 'asc' },
            include: { author: { select: { id: true, name: true, image: true } } },
          },
        },
      },
      _count: { select: { comments: true } },
    },
  });

  const serialized = posts.map(post => serializePost(post));

  if (serialized.length === 0) {
    return loadDemoPosts();
  }

  return serialized;
}

export default async function StartupFeedPage() {
  const initialPosts = await loadInitialFeed();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.18),_transparent_65%),#05070f] text-white">
      <Navbar />
      <main className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 md:px-8">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/40 bg-blue-500/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-blue-200">
            Startup Feed
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold md:text-4xl">Documotion Startup Feed</h1>
            <p className="max-w-3xl text-sm text-slate-300 md:text-base">
              Publish funding milestones, product drops, hiring announcements, and lessons learned.
              Engage other founders instantly with likes, comments, and saves.
            </p>
          </div>
        </header>

        <FeedExperience initialPosts={initialPosts} />
      </main>
    </div>
  );
}

function loadDemoPosts() {
  if (!fs.existsSync(FEED_IMAGES_DIR)) return [];
  const files = fs
    .readdirSync(FEED_IMAGES_DIR)
    .filter(file => ['.jpg', '.jpeg', '.png', '.webp'].includes(path.extname(file).toLowerCase()))
    .sort();

  if (!files.length) return [];

  return files.map((file, index) => {
    const author = AUTHOR_POOL[index % AUTHOR_POOL.length];
    const caption = PLACEHOLDER_CAPTIONS[index % PLACEHOLDER_CAPTIONS.length];
    const tags = TAG_SETS[index % TAG_SETS.length];
    const createdAt = new Date(Date.now() - index * 60 * 60 * 1000).toISOString();
    const mediaUrl = `/uploads/feed/${file}`;

    return {
      id: `demo-post-${index}`,
      title: author.verified ? 'Verified milestone update' : 'Community spotlight',
      body: caption,
      tags,
      professional: author.verified,
      createdAt,
      updatedAt: createdAt,
      author: {
        id: `demo-author-${index}`,
        name: author.name,
        designation: author.designation,
        title: author.designation,
        image: null,
      },
      startup: null,
      mediaType: 'image',
      mediaUrl,
      media: [
        {
          id: `demo-media-${index}`,
          type: 'image',
          url: mediaUrl,
          thumbnailUrl: null,
        },
      ],
      engagement: {
        likes: 96 + (index % 45),
        comments: 5 + (index % 12),
        shares: 8 + (index % 9),
      },
      metrics: {
        views: `${(2 + (index % 7)).toFixed(1)}K`,
        engagementRate: `${14 + (index % 6)}%`,
        saved: 30 + (index % 20),
      },
      liked: false,
      bookmarked: false,
      commentsPreview: buildDemoComments(author.name, index),
    };
  });
}

function buildDemoComments(authorName, index) {
  const firstName = authorName.split(' ')[0] ?? 'Founder';
  const now = Date.now();
  return [
    {
      id: `comment-${index}-1`,
      body: `Incredible momentum ${firstName}! Let’s sync on weaving this into our GTM stack.`,
      createdAt: new Date(now - 35 * 60 * 1000).toISOString(),
      author: { name: 'Meera S', title: 'Head of Growth · FluxPay' },
    },
    {
      id: `comment-${index}-2`,
      body: 'Exactly the playbook our cohort founders need before demo day. Sharing this ASAP.',
      createdAt: new Date(now - 12 * 60 * 1000).toISOString(),
      author: { name: 'Arjun D', title: 'Accelerator Mentor' },
    },
    {
      id: `comment-${index}-3`,
      body: 'The visuals look stellar. Kudos to the team for raising the bar on storytelling.',
      createdAt: new Date(now - 2 * 60 * 1000).toISOString(),
      author: { name: 'Priya N', title: 'Designer · SteadyOps' },
    },
  ];
}
