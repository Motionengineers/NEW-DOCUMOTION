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
  'We\'re thrilled to announce our ₹40 Cr Series A led by Accel Partners! This funding will accelerate our mission to democratize AI for Indian startups.',
  'Excited to launch V2.0 of our platform with real-time collaboration, advanced analytics, and enterprise-grade security.',
  'We\'re hiring! Looking for Senior Engineers and Product Managers to join our growing team in Bangalore.',
  'Proud milestone: Reached 10K active users in just 6 months! Thank you to our amazing community of founders.',
  'Breaking barriers: Our AI-powered compliance tool just processed 1M+ documents. Here\'s what we learned.',
  'Product update: New dashboard features, improved UX, and 10x faster performance. Try it now!',
];
const TAG_SETS = [
  ['#Startup', '#Funding', '#AI'],
  ['#ProductLaunch', '#Growth', '#Fintech'],
  ['#Community', '#Hiring', '#SaaS'],
  ['#FounderLife', '#Climate', '#Innovation'],
  ['#Funding', '#SeriesA', '#Startup'],
  ['#ProductLaunch', '#SaaS', '#Tech'],
  ['#Hiring', '#Jobs', '#Startup'],
  ['#Milestone', '#Growth', '#Startup'],
  ['#AI', '#Innovation', '#Tech'],
  ['#ProductUpdate', '#SaaS', '#Growth'],
];
const AUTHOR_POOL = [
  { name: 'Ananya Kapoor', designation: 'Founder · NovaSense AI', verified: true },
  { name: 'Rahul Verma', designation: 'Investor · BrightCap Ventures', verified: false },
  { name: 'Sana Khan', designation: 'COO · Meridian Labs', verified: true },
  { name: 'Ishaan Pillai', designation: 'Product Lead · VeloStack', verified: false },
  { name: 'Priya Sharma', designation: 'Founder · TechFlow', verified: true },
  { name: 'Arjun Mehta', designation: 'CEO · DataSync', verified: true },
  { name: 'Kavya Patel', designation: 'CTO · CloudScale', verified: false },
  { name: 'Rohan Singh', designation: 'Founder · FinTech Pro', verified: true },
  { name: 'Meera Nair', designation: 'Co-founder · AI Labs', verified: true },
  { name: 'Vikram Rao', designation: 'Founder · StartupHub', verified: false },
];

const TEMPLATES = ['general', 'funding', 'launch', 'hiring', 'milestone'];

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
    .filter(file => ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(path.extname(file).toLowerCase()))
    .sort()
    .slice(0, 20); // Show first 20 images for demo

  if (!files.length) return [];

  return files.map((file, index) => {
    const author = AUTHOR_POOL[index % AUTHOR_POOL.length];
    const caption = PLACEHOLDER_CAPTIONS[index % PLACEHOLDER_CAPTIONS.length];
    const tags = TAG_SETS[index % TAG_SETS.length];
    const template = TEMPLATES[index % TEMPLATES.length];
    const createdAt = new Date(Date.now() - index * 60 * 60 * 1000).toISOString();
    const mediaUrl = `/uploads/feed/${file}`;
    const isGif = file.toLowerCase().endsWith('.gif');

    // Template-specific data
    let templateData = {};
    let title = author.verified ? 'Verified milestone update' : 'Community spotlight';
    
    if (template === 'funding') {
      title = 'Funding Announcement';
      templateData = {
        amount: ['₹50 Lakh', '₹5 Cr', '₹10 Cr', '₹40 Cr', '₹100 Cr'][index % 5],
        round: ['Pre-seed', 'Seed', 'Series A', 'Series B'][index % 4],
        investors: ['Accel Partners', 'Sequoia Capital', 'Y Combinator', 'Lightspeed'][index % 4],
      };
    } else if (template === 'launch') {
      title = 'Product Launch';
      templateData = {
        productName: ['AI Platform', 'SaaS Tool', 'Mobile App', 'API Suite'][index % 4],
        features: 'AI-powered, Real-time analytics, Enterprise-ready',
        earlyAccess: index % 2 === 0,
      };
    } else if (template === 'hiring') {
      title = 'We\'re Hiring!';
      templateData = {
        roles: ['Senior Engineer', 'Product Manager', 'Designer', 'Data Scientist'][index % 4],
        location: 'Bangalore, India',
        applyLink: 'https://jobs.example.com',
      };
    } else if (template === 'milestone') {
      title = 'Milestone Achievement';
      templateData = {
        metric: ['10K users', '₹8 Cr ARR', '100K downloads', '50K customers'][index % 4],
        achievement: 'Reached in 6 months',
      };
    }

    return {
      id: `demo-post-${index}`,
      title,
      body: caption,
      tags,
      template: template !== 'general' ? template : undefined,
      templateData: Object.keys(templateData).length > 0 ? templateData : undefined,
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
      mediaType: isGif ? 'video' : 'image',
      mediaUrl,
      media: [
        {
          id: `demo-media-${index}`,
          type: isGif ? 'video' : 'image',
          url: mediaUrl,
          thumbnailUrl: null,
        },
      ],
      engagement: {
        likes: 96 + (index % 45),
        comments: 5 + (index % 12),
        shares: 8 + (index % 9),
      },
      reactionCounts: {
        like: 45 + (index % 30),
        celebrate: 12 + (index % 15),
        support: 8 + (index % 10),
        insightful: 5 + (index % 8),
        question: 2 + (index % 5),
      },
      userReactions: index % 3 === 0 ? ['like'] : index % 5 === 0 ? ['like', 'celebrate'] : [],
      metrics: {
        views: `${(2 + (index % 7)).toFixed(1)}K`,
        engagementRate: `${14 + (index % 6)}%`,
        saved: 30 + (index % 20),
      },
      liked: index % 3 === 0,
      bookmarked: index % 4 === 0,
      following: index % 5 === 0,
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
