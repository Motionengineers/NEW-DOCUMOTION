'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Loader2,
  Sparkles,
  UploadCloud,
  IndianRupee,
  Rocket,
  Users,
  Trophy,
  FileText,
  Link2,
  Image as ImageIcon,
  Video,
} from 'lucide-react';
import clsx from 'clsx';

const MAX_CHARACTERS = 1000;

const TEMPLATES = [
  { id: 'general', label: 'General Update', icon: FileText, color: 'blue' },
  { id: 'funding', label: 'Funding Announcement', icon: IndianRupee, color: 'emerald' },
  { id: 'launch', label: 'Product Launch', icon: Rocket, color: 'purple' },
  { id: 'hiring', label: 'We\'re Hiring', icon: Users, color: 'orange' },
  { id: 'milestone', label: 'Milestone Achievement', icon: Trophy, color: 'amber' },
];

export default function PostComposer({ onCreate }) {
  const [template, setTemplate] = useState('general');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [linkDescription, setLinkDescription] = useState('');
  const [linkImageUrl, setLinkImageUrl] = useState('');
  const [professional, setProfessional] = useState(false);
  const [stage, setStage] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);
  const [fetchingPreview, setFetchingPreview] = useState(false);
  const [mediaItems, setMediaItems] = useState([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const fileInputRef = useRef(null);

  // Template-specific fields
  const [templateData, setTemplateData] = useState({});

  const remaining = MAX_CHARACTERS - body.length;
  const disabled =
    submitting || (!body.trim() && !mediaUrl.trim() && !linkUrl.trim() && mediaItems.length === 0);
  const selectedTemplate = TEMPLATES.find(t => t.id === template) || TEMPLATES[0];

  // Fetch link preview when linkUrl changes
  useEffect(() => {
    if (!linkUrl || !linkUrl.startsWith('http')) return;

    const timeoutId = setTimeout(async () => {
      try {
        setFetchingPreview(true);
        const response = await fetch('/api/feed/link-preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: linkUrl }),
        });

        if (response.ok) {
          const json = await response.json();
          if (json.success && json.data) {
            if (json.data.title && !linkTitle) setLinkTitle(json.data.title);
            if (json.data.description && !linkDescription) setLinkDescription(json.data.description);
            if (json.data.image && !linkImageUrl) setLinkImageUrl(json.data.image);
          }
        }
      } catch (error) {
        console.error('Failed to fetch link preview', error);
      } finally {
        setFetchingPreview(false);
      }
    }, 1000); // Debounce 1 second

    return () => clearTimeout(timeoutId);
  }, [linkUrl, linkTitle, linkDescription, linkImageUrl]);

  // Update template data based on template type
  useEffect(() => {
    if (template === 'funding') {
      setTemplateData(prev => ({
        ...prev,
        amount: prev.amount || '',
        round: prev.round || '',
        investors: prev.investors || '',
      }));
    } else if (template === 'launch') {
      setTemplateData(prev => ({
        ...prev,
        productName: prev.productName || '',
        features: prev.features || '',
        earlyAccess: prev.earlyAccess || false,
      }));
    } else if (template === 'hiring') {
      setTemplateData(prev => ({
        ...prev,
        roles: prev.roles || '',
        location: prev.location || location,
        applyLink: prev.applyLink || '',
      }));
    } else if (template === 'milestone') {
      setTemplateData(prev => ({
        ...prev,
        metric: prev.metric || '',
        achievement: prev.achievement || '',
      }));
    } else {
      setTemplateData({});
    }
  }, [template, location]);

  async function handleMediaSelect(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingMedia(true);
      setStatus(null);

      if (file.size > 25 * 1024 * 1024) {
        throw new Error('File too large. Maximum size is 25MB.');
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/feed/media/upload', {
        method: 'POST',
        body: formData,
      });
      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Unable to upload media');
      }

      const id = json.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setMediaItems(prev => [
        ...prev,
        {
          id,
          url: json.fileUrl,
          type: json.fileType,
          name: json.name || file.name,
          size: json.size || file.size,
        },
      ]);
    } catch (error) {
      console.error('Media upload failed', error);
      setStatus({ variant: 'error', message: error.message || 'Unable to upload media' });
    } finally {
      setUploadingMedia(false);
      if (event.target) event.target.value = '';
    }
  }

  function removeMedia(id) {
    setMediaItems(prev => prev.filter(item => item.id !== id));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (disabled) return;

    try {
      setSubmitting(true);
      setStatus(null);

      const firstUploadedMedia = mediaItems[0];

      const payload = {
        body,
        tags,
        mediaUrl: firstUploadedMedia?.url || mediaUrl || undefined,
        linkUrl: linkUrl || undefined,
        linkTitle: linkTitle || undefined,
        linkDescription: linkDescription || undefined,
        linkImageUrl: linkImageUrl || undefined,
        template: template !== 'general' ? template : undefined,
        templateData: Object.keys(templateData).length > 0 ? templateData : undefined,
        professional,
        stage: stage || undefined,
        industry: industry || undefined,
        location: location || undefined,
        media: mediaItems.length
          ? mediaItems.map(item => ({
              type: item.type,
              url: item.url,
              thumbnailUrl: item.thumbnailUrl ?? null,
            }))
          : undefined,
      };

      const response = await fetch('/api/feed/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Unable to publish post');
      }

      // Reset form
      setBody('');
      setTags('');
      setMediaUrl('');
      setLinkUrl('');
      setLinkTitle('');
      setLinkDescription('');
      setLinkImageUrl('');
      setProfessional(false);
      setStage('');
      setIndustry('');
      setLocation('');
      setTemplate('general');
      setTemplateData({});
      setMediaItems([]);
      setStatus({ variant: 'success', message: 'Post published' });
      onCreate?.(json.data);
    } catch (error) {
      console.error('PostComposer', error);
      setStatus({ variant: 'error', message: error.message || 'Something went wrong' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-xl backdrop-blur"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={handleMediaSelect}
      />
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Share an update</h2>
          <p className="text-xs text-slate-400">
            Celebrate milestones, launches, or insights with founders across the Documotion network.
          </p>
        </div>
        <button
          type="button"
          className={clsx(
            'inline-flex items-center gap-2 rounded-full border border-emerald-400/30 px-3 py-1 text-[11px] uppercase tracking-[0.3em] transition',
            professional
              ? 'bg-emerald-500/20 text-emerald-100'
              : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
          )}
          onClick={() => setProfessional(prev => !prev)}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Professional
        </button>
      </header>

      <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">Media</p>
            <p className="text-xs text-slate-400">Upload photos or short clips (max 25MB each)</p>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingMedia}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200 transition hover:border-blue-400/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <UploadCloud className="h-4 w-4" />
            {uploadingMedia ? 'Uploading…' : 'Upload media'}
          </button>
        </div>
        {mediaItems.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {mediaItems.map(item => (
              <div
                key={item.id}
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5"
              >
                {item.type === 'video' ? (
                  <div className="aspect-video bg-black/60">
                    <video
                      src={item.url}
                      controls
                      className="h-full w-full rounded-2xl object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video">
                    <img src={item.url} alt={item.name} className="h-full w-full object-cover" />
                  </div>
                )}
                <div className="flex items-center justify-between px-3 py-2 text-xs text-slate-200">
                  <span className="flex items-center gap-1">
                    {item.type === 'video' ? (
                      <Video className="h-3.5 w-3.5" />
                    ) : (
                      <ImageIcon className="h-3.5 w-3.5" />
                    )}
                    {item.name}
                  </span>
                  <button
                    type="button"
                    className="text-rose-200 transition hover:text-rose-100"
                    onClick={() => removeMedia(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-white/15 bg-white/5 px-6 py-8 text-center text-sm text-slate-400">
            <UploadCloud className="h-8 w-8 text-slate-500" />
            <p>Drop images or mp4/mov/webm clips, or click upload.</p>
          </div>
        )}
      </div>

      {/* Template Selection */}
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Post Type</label>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
          {TEMPLATES.map(t => {
            const Icon = t.icon;
            const isSelected = template === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTemplate(t.id)}
                className={clsx(
                  'flex flex-col items-center gap-2 rounded-xl border px-3 py-3 text-xs font-medium transition',
                  isSelected
                    ? `border-${t.color}-400/50 bg-${t.color}-500/10 text-${t.color}-100`
                    : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px]">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Template-specific fields */}
      {template === 'funding' && (
        <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-3">
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Amount</label>
            <input
              value={templateData.amount || ''}
              onChange={e => setTemplateData(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="₹5 Cr"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-400/70 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Round</label>
            <select
              value={templateData.round || ''}
              onChange={e => setTemplateData(prev => ({ ...prev, round: e.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-400/70 focus:outline-none"
            >
              <option value="">Select round</option>
              <option value="pre-seed">Pre-seed</option>
              <option value="seed">Seed</option>
              <option value="series-a">Series A</option>
              <option value="series-b">Series B</option>
              <option value="series-c">Series C+</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Investors</label>
            <input
              value={templateData.investors || ''}
              onChange={e => setTemplateData(prev => ({ ...prev, investors: e.target.value }))}
              placeholder="Accel, Sequoia"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-400/70 focus:outline-none"
            />
          </div>
        </div>
      )}

      {template === 'launch' && (
        <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Product Name</label>
            <input
              value={templateData.productName || ''}
              onChange={e => setTemplateData(prev => ({ ...prev, productName: e.target.value }))}
              placeholder="MyAwesome Product"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-400/70 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Key Features</label>
            <textarea
              value={templateData.features || ''}
              onChange={e => setTemplateData(prev => ({ ...prev, features: e.target.value }))}
              placeholder="AI-powered, Real-time analytics, Enterprise-ready"
              rows={2}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-400/70 focus:outline-none"
            />
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-300">
            <input
              type="checkbox"
              checked={templateData.earlyAccess || false}
              onChange={e => setTemplateData(prev => ({ ...prev, earlyAccess: e.target.checked }))}
              className="rounded border-white/10 bg-white/5"
            />
            Early access available
          </label>
        </div>
      )}

      {template === 'hiring' && (
        <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Open Roles</label>
            <input
              value={templateData.roles || ''}
              onChange={e => setTemplateData(prev => ({ ...prev, roles: e.target.value }))}
              placeholder="Senior Engineer, Product Manager"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-400/70 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Apply Link</label>
            <input
              value={templateData.applyLink || ''}
              onChange={e => setTemplateData(prev => ({ ...prev, applyLink: e.target.value }))}
              placeholder="https://jobs.example.com"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-400/70 focus:outline-none"
            />
          </div>
        </div>
      )}

      {template === 'milestone' && (
        <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Metric</label>
            <input
              value={templateData.metric || ''}
              onChange={e => setTemplateData(prev => ({ ...prev, metric: e.target.value }))}
              placeholder="10K users, ₹8 Cr ARR"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-400/70 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Achievement</label>
            <input
              value={templateData.achievement || ''}
              onChange={e => setTemplateData(prev => ({ ...prev, achievement: e.target.value }))}
              placeholder="Reached in 6 months"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-400/70 focus:outline-none"
            />
          </div>
        </div>
      )}

      <div className="space-y-4">
        <textarea
          value={body}
          onChange={event => setBody(event.target.value.slice(0, MAX_CHARACTERS))}
          placeholder={
            template === 'funding'
              ? 'We\'re thrilled to announce...'
              : template === 'launch'
                ? 'Excited to launch...'
                : template === 'hiring'
                  ? 'We\'re growing and looking for...'
                  : template === 'milestone'
                    ? 'Proud to share that we\'ve...'
                    : 'Share a milestone, product launch, or insight...'
          }
          rows={4}
          className="w-full resize-y rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-400/70 focus:outline-none"
        />
        <div className="flex flex-wrap gap-3 text-xs text-slate-400">
          <span>{remaining} characters left</span>
          {professional ? <span className="text-emerald-200">Professional badge enabled</span> : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Tags</label>
          <input
            value={tags}
            onChange={event => setTags(event.target.value)}
            placeholder="#funding, #productlaunch"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-400/70 focus:outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Media URL (optional)
          </label>
          <div className="relative">
            <UploadCloud className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={mediaUrl}
              onChange={event => setMediaUrl(event.target.value)}
              placeholder="https://example.com/image.png"
              className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-400/70 focus:outline-none"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Link (optional) {fetchingPreview && <span className="text-blue-400">Fetching preview...</span>}
          </label>
          <div className="relative">
            <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={linkUrl}
              onChange={event => setLinkUrl(event.target.value)}
              placeholder="https://yourlaunch.com"
              className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-400/70 focus:outline-none"
            />
          </div>
          {linkTitle && (
            <div className="mt-2 rounded-xl border border-white/10 bg-white/5 p-3 text-xs">
              <div className="font-semibold text-white">{linkTitle}</div>
              {linkDescription && <div className="mt-1 text-slate-400">{linkDescription}</div>}
            </div>
          )}
        </div>
        <div className="grid grid-cols-3 gap-3 text-xs text-white">
          <select
            value={stage}
            onChange={event => setStage(event.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 focus:border-blue-400/60 focus:outline-none"
          >
            <option value="">Stage</option>
            <option value="idea">Idea</option>
            <option value="pre-seed">Pre-seed</option>
            <option value="seed">Seed</option>
            <option value="series-a">Series A</option>
            <option value="growth">Growth</option>
          </select>
          <select
            value={industry}
            onChange={event => setIndustry(event.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 focus:border-blue-400/60 focus:outline-none"
          >
            <option value="">Industry</option>
            <option value="fintech">Fintech</option>
            <option value="saas">SaaS</option>
            <option value="healthtech">Healthtech</option>
            <option value="climatetech">Climate</option>
            <option value="ai">AI</option>
          </select>
          <input
            value={location}
            onChange={event => setLocation(event.target.value)}
            placeholder="Location"
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 placeholder:text-slate-500 focus:border-blue-400/60 focus:outline-none"
          />
        </div>
      </div>

      {status ? (
        <div
          className={clsx(
            'rounded-2xl px-4 py-2 text-xs',
            status.variant === 'success'
              ? 'border border-emerald-400/30 bg-emerald-400/10 text-emerald-100'
              : 'border border-rose-400/30 bg-rose-400/10 text-rose-100'
          )}
        >
          {status.message}
        </div>
      ) : null}

      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={disabled}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/40 transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Publish update
        </button>
      </div>
    </form>
  );
}
