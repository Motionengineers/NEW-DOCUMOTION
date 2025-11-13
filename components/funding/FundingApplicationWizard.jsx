'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  Save,
  UploadCloud,
  Video,
} from 'lucide-react';
import clsx from 'clsx';

const INITIAL_FORM = {
  fullName: '',
  email: '',
  phone: '',
  city: '',
  state: '',
  startupName: '',
  website: '',
  socialLinks: '',
  industry: '',
  stage: '',
  problem: '',
  solution: '',
  targetAudience: '',
  revenue: '',
  profit: '',
  customers: '',
  fundingRaised: '',
  growthMetrics: '',
  amountRequested: '',
  equityOffered: '',
  useOfFunds: '',
  pitchVideoUrl: '',
  pitchDeckUrl: '',
};

const INDUSTRY_OPTIONS = [
  'Technology',
  'Fintech',
  'Health',
  'FMCG',
  'Education',
  'SaaS',
  'Manufacturing',
  'Agritech',
  'Logistics',
  'Other',
];
const STAGE_OPTIONS = ['Idea', 'Pre-Seed', 'Seed', 'Early', 'Growth', 'Established'];

const STEPS = [
  {
    id: 'intro',
    title: 'Welcome',
    description:
      'Submit your startup details and connect with Documotion investors. You can save a draft at any time and come back when ready.',
  },
  {
    id: 'personal',
    title: 'Personal Details',
    subtitle: 'How can we reach you?',
    tip: 'Use accurate contact details so investors can reach you.',
  },
  {
    id: 'startup',
    title: 'Startup Details',
    subtitle: 'Tell us about your company at a glance.',
    tip: 'Clearly define your industry and stage to help investors assess fit.',
  },
  {
    id: 'product',
    title: 'Product & Story',
    subtitle: 'Share the problem you solve and who you solve it for.',
    tip: 'Highlight uniqueness, value proposition, and potential impact.',
  },
  {
    id: 'traction',
    title: 'Traction & Financials',
    subtitle: 'Showcase proof points and traction metrics.',
    tip: 'Provide real data to showcase traction and potential.',
  },
  {
    id: 'funding',
    title: 'Funding Request',
    subtitle: 'What are you raising and how will you use it?',
    tip: 'Be clear and realistic about your investment needs.',
  },
  {
    id: 'uploads',
    title: 'Pitch Uploads',
    subtitle: 'Share your pitch materials.',
    tip: 'Explain your startup, traction, and funding ask concisely and authentically.',
  },
  {
    id: 'review',
    title: 'Review & Submit',
    subtitle: 'Double-check everything before sending.',
  },
];

function getProgressPercent(stepIndex) {
  return Math.round(((stepIndex + 1) / STEPS.length) * 100);
}

export default function FundingApplicationWizard() {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);
  const [errors, setErrors] = useState([]);
  const [draftUpdatedAt, setDraftUpdatedAt] = useState(null);
  const [applicationId, setApplicationId] = useState(null);
  const [applicationStatus, setApplicationStatus] = useState('draft');
  const [uploading, setUploading] = useState({ video: false, deck: false });
  const [loadError, setLoadError] = useState(null);
  const [demoMode, setDemoMode] = useState(false);

  const progress = useMemo(() => getProgressPercent(currentStep), [currentStep]);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch('/api/funding/applications', { cache: 'no-store' });
        const json = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            setLoadError(json.error || 'Please sign in to apply for funding.');
          } else {
            setLoadError(json.error || 'Unable to load your application.');
          }
          return;
        }

        if (json.demo) {
          setDemoMode(true);
          const demoApplication = json.data?.application || {};
          setFormData(prev => ({ ...prev, ...normalizeIncoming(demoApplication) }));
          setApplicationStatus('demo');
          setStatus({
            variant: 'info',
            message: 'You are viewing a demo. Sign in to save drafts or submit your application.',
          });
          return;
        }

        if (!json.success) {
          setLoadError(json.error || 'Unable to load application data');
          return;
        }

        const { application, draft } = json.data || {};
        if (application) {
          setFormData(prev => ({ ...prev, ...normalizeIncoming(application) }));
          setApplicationId(application.id);
          setApplicationStatus(application.status || 'submitted');
        }
        if (!application && draft) {
          setFormData(prev => ({ ...prev, ...normalizeIncoming(draft) }));
          setDraftUpdatedAt(draft.updatedAt || null);
        }
      } catch (error) {
        console.error('FundingApplicationWizard load failed:', error);
        setLoadError('Unable to load your application. Please refresh.');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const handleFieldChange = useCallback((name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep === 0) {
      setCurrentStep(1);
      return;
    }

    const stepErrors = validateStep(currentStep, formData);
    if (stepErrors.length) {
      setErrors(stepErrors);
      return;
    }
    setErrors([]);
    setCurrentStep(step => Math.min(step + 1, STEPS.length - 1));
  }, [currentStep, formData]);

  const handleBack = useCallback(() => {
    setErrors([]);
    setCurrentStep(step => Math.max(step - 1, 0));
  }, []);

  const handleSaveDraft = useCallback(
    async (auto = false) => {
      if (demoMode) {
        if (!auto) {
          setStatus({ variant: 'info', message: 'Sign in to save your progress.' });
        }
        return;
      }
      try {
        setSaving(!auto);
        if (!auto) setStatus(null);
        const response = await fetch('/api/funding/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'save-draft',
            data: formData,
            progress,
          }),
        });
        const json = await response.json();
        if (!response.ok || !json.success) {
          throw new Error(json.error || 'Unable to save draft');
        }
        setDraftUpdatedAt(new Date().toISOString());
        if (!auto) {
          setStatus({ variant: 'success', message: 'Draft saved successfully.' });
        }
      } catch (error) {
        console.error('Save draft failed', error);
        setStatus({ variant: 'error', message: error.message || 'Unable to save draft' });
      } finally {
        setSaving(false);
      }
    },
    [demoMode, formData, progress]
  );

  const handleSubmit = useCallback(async () => {
    if (demoMode) {
      setStatus({ variant: 'info', message: 'Sign in to submit your funding application.' });
      return;
    }
    try {
      setSubmitting(true);
      setStatus(null);
      const response = await fetch('/api/funding/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit',
          data: formData,
          applicationId,
        }),
      });
      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Unable to submit application');
      }
      setApplicationId(json.data?.id || applicationId);
      setApplicationStatus(json.data?.status || 'submitted');
      setStatus({
        variant: 'success',
        message: 'Application submitted! Our team will get in touch soon.',
      });
    } catch (error) {
      console.error('Submit application failed', error);
      setStatus({ variant: 'error', message: error.message || 'Unable to submit application' });
    } finally {
      setSubmitting(false);
    }
  }, [applicationId, demoMode, formData]);

  const handleFileUpload = useCallback(
    async (field, file) => {
      if (demoMode) {
        setStatus({ variant: 'info', message: 'Sign in to upload pitch materials.' });
        return;
      }
      if (!file) return;
      const isVideo = field === 'pitchVideoUrl';
      const maxSize = isVideo ? 250 * 1024 * 1024 : 25 * 1024 * 1024;
      const allowedTypes = isVideo
        ? ['video/mp4', 'video/quicktime', 'video/x-m4v']
        : [
            'application/pdf',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          ];

      if (file.size > maxSize) {
        setStatus({
          variant: 'error',
          message: `File too large. ${isVideo ? 'Videos' : 'Pitch decks'} must be under ${isVideo ? '250MB' : '25MB'}.`,
        });
        return;
      }

      if (!allowedTypes.includes(file.type)) {
        setStatus({
          variant: 'error',
          message: `Unsupported file type. Please upload a ${isVideo ? 'MP4/MOV video' : 'PDF or PPT deck'}.`,
        });
        return;
      }

      try {
        setUploading(prev => ({ ...prev, [isVideo ? 'video' : 'deck']: true }));
        const body = new FormData();
        body.append('file', file);
        body.append('type', field);
        const response = await fetch('/api/documents/upload', {
          method: 'POST',
          body,
        });
        const json = await response.json();
        if (!response.ok || !json.success) {
          throw new Error(json.error || 'Unable to upload file');
        }
        handleFieldChange(field, json.fileUrl);
        setStatus({ variant: 'success', message: 'Upload complete.' });
      } catch (error) {
        console.error('Upload failed', error);
        setStatus({ variant: 'error', message: error.message || 'Unable to upload file' });
      } finally {
        setUploading(prev => ({ ...prev, [isVideo ? 'video' : 'deck']: false }));
      }
    },
    [demoMode, handleFieldChange]
  );

  const reviewEntries = useMemo(() => buildReviewEntries(formData), [formData]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.03]">
        <Loader2 className="h-6 w-6 animate-spin text-blue-300" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-3xl border border-rose-400/30 bg-rose-400/10 p-8 text-center text-rose-100">
        {loadError}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">
              Apply for Funding / Investor Connect
            </h2>
            <p className="text-sm text-slate-300">
              Complete the eight-step application. You can save a draft anytime. Progress:{' '}
              {progress}%
            </p>
          </div>
          <div className="hidden md:block">
            <button
              type="button"
              onClick={() => handleSaveDraft()}
              disabled={saving || demoMode}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10 disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save draft
            </button>
          </div>
        </div>
        <ProgressBar value={progress} />
        {demoMode ? (
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/40 bg-blue-500/10 px-4 py-2 text-xs text-blue-100">
            <CheckCircle2 className="h-4 w-4" /> Demo preview — sign in to apply for real.
          </div>
        ) : null}
        {draftUpdatedAt ? (
          <p className="text-xs text-slate-400">
            Draft saved {new Date(draftUpdatedAt).toLocaleString()}
          </p>
        ) : null}
        {applicationStatus === 'submitted' ? (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-xs text-emerald-100">
            <CheckCircle2 className="h-4 w-4" /> Submitted — you can update and resubmit if anything
            changes.
          </div>
        ) : null}
      </header>

      {status ? (
        <div
          className={clsx(
            'rounded-2xl px-4 py-3 text-sm',
            status.variant === 'success'
              ? 'border border-emerald-400/30 bg-emerald-500/10 text-emerald-100'
              : status.variant === 'info'
                ? 'border border-blue-400/30 bg-blue-500/10 text-blue-100'
                : 'border border-rose-400/30 bg-rose-500/10 text-rose-100'
          )}
        >
          {status.message}
        </div>
      ) : null}

      {errors.length ? (
        <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          Please fix the following before continuing: {errors.join(', ')}
        </div>
      ) : null}

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-xl backdrop-blur">
        {renderStep({
          step: STEPS[currentStep],
          currentStep,
          formData,
          handleFieldChange,
          handleNext,
          handleBack,
          reviewEntries,
          submitting,
          handleSubmit,
          handleSaveDraft,
          handleFileUpload,
          uploading,
          goToStep: index => setCurrentStep(Math.min(Math.max(index, 0), STEPS.length - 1)),
          demoMode,
        })}
      </section>

      <footer className="flex flex-col gap-3 border-t border-white/10 pt-4 text-xs text-slate-400">
        <p>
          Need help? Reach our investor success desk at{' '}
          <a href="mailto:funding@documotion.in" className="text-blue-200 underline">
            funding@documotion.in
          </a>
        </p>
        <div className="md:hidden">
          <button
            type="button"
            onClick={() => handleSaveDraft()}
            disabled={saving || demoMode}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save draft
          </button>
        </div>
      </footer>
    </div>
  );
}

function normalizeIncoming(data = {}) {
  const result = { ...INITIAL_FORM };
  Object.keys(result).forEach(key => {
    if (data[key] !== undefined && data[key] !== null) {
      result[key] = data[key]?.toString?.() ?? data[key];
    }
  });
  if (data.amountRequested !== undefined && data.amountRequested !== null) {
    result.amountRequested = data.amountRequested.toString();
  }
  if (data.equityOffered !== undefined && data.equityOffered !== null) {
    result.equityOffered = data.equityOffered.toString();
  }
  return result;
}

function validateStep(stepIndex, data) {
  const missing = [];
  const require = field => {
    if (!data[field] || !data[field].toString().trim()) missing.push(fieldLabel(field));
  };
  switch (STEPS[stepIndex].id) {
    case 'personal':
      ['fullName', 'email', 'phone', 'city', 'state'].forEach(require);
      break;
    case 'startup':
      ['startupName', 'industry', 'stage'].forEach(require);
      break;
    case 'product':
      ['problem', 'solution', 'targetAudience'].forEach(require);
      break;
    case 'funding':
      ['amountRequested', 'equityOffered', 'useOfFunds'].forEach(require);
      break;
    case 'uploads':
      if (!data.pitchVideoUrl && !data.pitchDeckUrl) {
        missing.push('Pitch video or deck');
      }
      break;
    default:
      break;
  }
  return missing;
}

function fieldLabel(key) {
  const map = {
    fullName: 'Full Name',
    email: 'Email',
    phone: 'Contact Number',
    city: 'City',
    state: 'State',
    startupName: 'Startup Name',
    industry: 'Industry',
    stage: 'Stage',
    problem: 'Problem solved',
    solution: 'Your solution',
    targetAudience: 'Target audience',
    amountRequested: 'Amount requested',
    equityOffered: 'Equity offered',
    useOfFunds: 'Use of funds',
  };
  return map[key] || key;
}

function buildReviewEntries(form) {
  return [
    {
      heading: 'Personal Details',
      fields: [
        ['Full Name', form.fullName],
        ['Email', form.email],
        ['Contact Number', form.phone],
        ['Location', [form.city, form.state].filter(Boolean).join(', ')],
      ],
      stepIndex: 1,
    },
    {
      heading: 'Startup Details',
      fields: [
        ['Startup Name', form.startupName],
        ['Website', form.website],
        ['Social Links', form.socialLinks],
        ['Industry', form.industry],
        ['Stage', form.stage],
      ],
      stepIndex: 2,
    },
    {
      heading: 'Product & Market',
      fields: [
        ['Problem', form.problem],
        ['Solution', form.solution],
        ['Target Audience', form.targetAudience],
      ],
      stepIndex: 3,
    },
    {
      heading: 'Traction & Financials',
      fields: [
        ['Revenue', form.revenue || '—'],
        ['Profit', form.profit || '—'],
        ['Customers / Users', form.customers || '—'],
        ['Funding Raised', form.fundingRaised || '—'],
        ['Growth Metrics', form.growthMetrics || '—'],
      ],
      stepIndex: 4,
    },
    {
      heading: 'Funding Request',
      fields: [
        ['Amount Requested', form.amountRequested ? `₹ ${form.amountRequested}` : '—'],
        ['Equity Offered', form.equityOffered ? `${form.equityOffered}%` : '—'],
        ['Use of Funds', form.useOfFunds || '—'],
      ],
      stepIndex: 5,
    },
    {
      heading: 'Pitch Materials',
      fields: [
        ['Pitch Video', form.pitchVideoUrl ? 'Uploaded' : 'Not provided'],
        ['Pitch Deck', form.pitchDeckUrl ? 'Uploaded' : 'Not provided'],
      ],
      stepIndex: 6,
    },
  ];
}

function renderStep({
  step,
  currentStep,
  formData,
  handleFieldChange,
  handleNext,
  handleBack,
  reviewEntries,
  submitting,
  handleSubmit,
  handleSaveDraft,
  handleFileUpload,
  uploading,
  goToStep,
  demoMode,
}) {
  switch (step.id) {
    case 'intro':
      return (
        <div className="space-y-6 text-slate-200">
          <h3 className="text-xl font-semibold text-white">
            Welcome to Documotion Investor Connect
          </h3>
          <p className="text-sm text-slate-300">
            Fill in eight concise steps covering your personal details, startup story, traction, and
            funding needs. You can save a draft and come back later.
          </p>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>• Takes around 10 minutes to complete.</li>
            <li>• Have your pitch deck or short video handy.</li>
            <li>• Real examples help investors understand your progress.</li>
          </ul>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/40 transition hover:bg-blue-500"
            >
              Start application
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      );
    case 'personal':
      return (
        <div className="space-y-4">
          <StepHeader step={step} />
          <div className="grid gap-4 md:grid-cols-2">
            <InputField
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleFieldChange}
              required
            />
            <InputField
              label="Contact Number"
              name="phone"
              value={formData.phone}
              onChange={handleFieldChange}
              required
            />
            <InputField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleFieldChange}
              required
            />
            <InputField
              label="City"
              name="city"
              value={formData.city}
              onChange={handleFieldChange}
              required
            />
            <InputField
              label="State"
              name="state"
              value={formData.state}
              onChange={handleFieldChange}
              required
            />
          </div>
          <StepNavigation currentStep={currentStep} onBack={handleBack} onNext={handleNext} />
        </div>
      );
    case 'startup':
      return (
        <div className="space-y-4">
          <StepHeader step={step} />
          <div className="grid gap-4 md:grid-cols-2">
            <InputField
              label="Startup Name"
              name="startupName"
              value={formData.startupName}
              onChange={handleFieldChange}
              required
            />
            <InputField
              label="Website"
              name="website"
              value={formData.website}
              onChange={handleFieldChange}
              placeholder="https://"
            />
            <SelectField
              label="Industry / Sector"
              name="industry"
              value={formData.industry}
              onChange={handleFieldChange}
              options={INDUSTRY_OPTIONS}
              required
            />
            <SelectField
              label="Stage"
              name="stage"
              value={formData.stage}
              onChange={handleFieldChange}
              options={STAGE_OPTIONS}
              required
            />
            <TextAreaField
              label="Social Links"
              name="socialLinks"
              value={formData.socialLinks}
              onChange={handleFieldChange}
              placeholder="LinkedIn, Twitter, Product Hunt... One per line"
              rows={3}
            />
          </div>
          <StepNavigation currentStep={currentStep} onBack={handleBack} onNext={handleNext} />
        </div>
      );
    case 'product':
      return (
        <div className="space-y-4">
          <StepHeader step={step} />
          <TextAreaField
            label="Problem solved"
            name="problem"
            value={formData.problem}
            onChange={handleFieldChange}
            required
            rows={4}
            maxLength={1000}
          />
          <TextAreaField
            label="Your solution"
            name="solution"
            value={formData.solution}
            onChange={handleFieldChange}
            required
            rows={4}
            maxLength={1000}
          />
          <TextAreaField
            label="Target audience / market"
            name="targetAudience"
            value={formData.targetAudience}
            onChange={handleFieldChange}
            required
            rows={4}
            maxLength={1000}
          />
          <StepNavigation currentStep={currentStep} onBack={handleBack} onNext={handleNext} />
        </div>
      );
    case 'traction':
      return (
        <div className="space-y-4">
          <StepHeader step={step} />
          <div className="grid gap-4 md:grid-cols-2">
            <InputField
              label="Revenue"
              name="revenue"
              value={formData.revenue}
              onChange={handleFieldChange}
              placeholder="INR or USD"
            />
            <InputField
              label="Profit"
              name="profit"
              value={formData.profit}
              onChange={handleFieldChange}
              placeholder="Optional"
            />
            <InputField
              label="Customers / Users"
              name="customers"
              value={formData.customers}
              onChange={handleFieldChange}
              placeholder="e.g. 1200 active users"
            />
            <InputField
              label="Funding raised so far"
              name="fundingRaised"
              value={formData.fundingRaised}
              onChange={handleFieldChange}
              placeholder="e.g. ₹50 Lakh seed"
            />
          </div>
          <TextAreaField
            label="Growth metrics"
            name="growthMetrics"
            value={formData.growthMetrics}
            onChange={handleFieldChange}
            placeholder="Monthly growth, retention, partnerships etc."
            rows={4}
          />
          <StepNavigation currentStep={currentStep} onBack={handleBack} onNext={handleNext} />
        </div>
      );
    case 'funding':
      return (
        <div className="space-y-4">
          <StepHeader step={step} />
          <div className="grid gap-4 md:grid-cols-2">
            <InputField
              label="Amount requested"
              name="amountRequested"
              value={formData.amountRequested}
              onChange={handleFieldChange}
              placeholder="e.g. 2.5 crore"
              required
            />
            <InputField
              label="Equity offered (%)"
              name="equityOffered"
              value={formData.equityOffered}
              onChange={handleFieldChange}
              placeholder="e.g. 10"
              required
            />
          </div>
          <TextAreaField
            label="Use of funds"
            name="useOfFunds"
            value={formData.useOfFunds}
            onChange={handleFieldChange}
            required
            rows={4}
            maxLength={800}
          />
          <StepNavigation currentStep={currentStep} onBack={handleBack} onNext={handleNext} />
        </div>
      );
    case 'uploads':
      return (
        <div className="space-y-6">
          <StepHeader step={step} />
          <UploadCard
            icon={Video}
            title="Pitch Video"
            description="2-3 minute introduction. MP4 or MOV up to 250MB."
            value={formData.pitchVideoUrl}
            uploading={uploading.video}
            onFileSelected={file => handleFileUpload('pitchVideoUrl', file)}
            onChange={value => handleFieldChange('pitchVideoUrl', value)}
            accept="video/mp4,video/quicktime,video/x-m4v"
            disabled={demoMode}
          />
          <UploadCard
            icon={FileText}
            title="Pitch Deck"
            description="PDF or PPT up to 25MB."
            value={formData.pitchDeckUrl}
            uploading={uploading.deck}
            onFileSelected={file => handleFileUpload('pitchDeckUrl', file)}
            onChange={value => handleFieldChange('pitchDeckUrl', value)}
            accept="application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
            required
            disabled={demoMode}
          />
          <StepNavigation currentStep={currentStep} onBack={handleBack} onNext={handleNext} />
        </div>
      );
    case 'review':
      return (
        <div className="space-y-6">
          <StepHeader step={step} />
          <div className="space-y-4">
            {reviewEntries.map(section => (
              <div
                key={section.heading}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-white">{section.heading}</h4>
                  <button
                    type="button"
                    className="text-xs text-blue-200 hover:text-blue-100"
                    onClick={() => goToStep(section.stepIndex)}
                  >
                    Edit
                  </button>
                </div>
                <dl className="mt-3 space-y-2 text-sm text-slate-200">
                  {section.fields.map(([label, value]) => (
                    <div
                      key={label}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
                    >
                      <dt className="text-slate-400">{label}</dt>
                      <dd className="font-medium text-white sm:text-right">{value || '—'}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleSaveDraft()}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10 disabled:opacity-60"
                disabled={demoMode}
              >
                <Save className="h-4 w-4" /> Save draft
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || demoMode}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/40 transition hover:bg-emerald-500 disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Submit application
              </button>
            </div>
          </div>
        </div>
      );
    default:
      return null;
  }
}

function StepHeader({ step }) {
  return (
    <div className="space-y-2">
      <h3 className="text-xl font-semibold text-white">{step.title}</h3>
      {step.subtitle ? <p className="text-sm text-slate-300">{step.subtitle}</p> : null}
      {step.tip ? <div className="text-xs text-blue-200">Tip: {step.tip}</div> : null}
    </div>
  );
}

function StepNavigation({ currentStep, onBack, onNext }) {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
      <button
        type="button"
        onClick={onBack}
        disabled={currentStep === 0}
        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10 disabled:opacity-60"
      >
        <ChevronLeft className="h-4 w-4" /> Back
      </button>
      <button
        type="button"
        onClick={onNext}
        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/40 transition hover:bg-blue-500"
      >
        Continue
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function InputField({ label, name, value, onChange, type = 'text', placeholder, required }) {
  return (
    <label className="space-y-1 text-sm text-slate-200">
      <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
        {label}
        {required ? <span className="text-rose-300"> *</span> : null}
      </span>
      <input
        type={type}
        value={value}
        onChange={event => onChange(name, event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-400/70 focus:outline-none"
      />
    </label>
  );
}

function SelectField({ label, name, value, onChange, options, required }) {
  return (
    <label className="space-y-1 text-sm text-slate-200">
      <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
        {label}
        {required ? <span className="text-rose-300"> *</span> : null}
      </span>
      <select
        value={value}
        onChange={event => onChange(name, event.target.value)}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-400/70 focus:outline-none"
      >
        <option value="">Select</option>
        {options.map(option => (
          <option key={option} value={option} className="text-slate-900">
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextAreaField({
  label,
  name,
  value,
  onChange,
  rows = 4,
  placeholder,
  maxLength,
  required,
}) {
  const remaining = maxLength ? maxLength - (value?.length || 0) : null;
  return (
    <label className="space-y-1 text-sm text-slate-200">
      <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
        {label}
        {required ? <span className="text-rose-300"> *</span> : null}
      </span>
      <textarea
        value={value}
        onChange={event => {
          const next = maxLength ? event.target.value.slice(0, maxLength) : event.target.value;
          onChange(name, next);
        }}
        rows={rows}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-400/70 focus:outline-none"
      />
      {remaining !== null ? (
        <span className="text-xs text-slate-400">{remaining} characters left</span>
      ) : null}
    </label>
  );
}

function UploadCard({
  icon: Icon,
  title,
  description,
  value,
  uploading,
  onFileSelected,
  onChange,
  accept,
  required,
  disabled,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-200">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-white">{title}</h4>
            {required ? (
              <span className="text-[10px] uppercase tracking-[0.3em] text-rose-300">Required</span>
            ) : null}
          </div>
          <p className="text-xs text-slate-300">{description}</p>
          <div className="flex flex-wrap items-center gap-3">
            <label
              className={clsx(
                'inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white transition',
                disabled ? 'opacity-50' : 'hover:bg-white/10'
              )}
            >
              <UploadCloud className="h-4 w-4" />
              Upload file
              <input
                type="file"
                accept={accept}
                className="hidden"
                onChange={event => onFileSelected(event.target.files?.[0] || null)}
                disabled={disabled}
              />
            </label>
            <button
              type="button"
              className="text-xs text-blue-200 underline disabled:opacity-50"
              onClick={() => {
                const url = prompt('Paste a hosted URL');
                if (url) onChange(url);
              }}
              disabled={disabled}
            >
              Paste URL
            </button>
            {uploading ? <Loader2 className="h-4 w-4 animate-spin text-blue-200" /> : null}
          </div>
          {value ? (
            <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-xs text-emerald-100">
              Uploaded:{' '}
              <a href={value} target="_blank" rel="noopener noreferrer" className="underline">
                {value}
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ value }) {
  return (
    <div className="h-2 rounded-full bg-white/10">
      <div className="h-2 rounded-full bg-blue-500 transition-all" style={{ width: `${value}%` }} />
    </div>
  );
}
