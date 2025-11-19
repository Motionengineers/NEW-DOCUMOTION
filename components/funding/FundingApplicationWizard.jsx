'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Info,
  History,
  Loader2,
  RefreshCw,
  Save,
  Sparkles,
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

const REQUIRED_FIELDS_BY_STEP = {
  personal: ['fullName', 'email', 'phone', 'city', 'state'],
  startup: ['startupName', 'industry', 'stage'],
  product: ['problem', 'solution', 'targetAudience'],
  funding: ['amountRequested', 'equityOffered', 'useOfFunds'],
};

const INLINE_VALIDATORS = {
  fullName: value => (!value?.trim() ? 'Full name is required' : ''),
  email: value => {
    if (!value?.trim()) return 'Email is required';
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(value) ? '' : 'Enter a valid email address';
  },
  phone: value => {
    if (!value?.trim()) return 'Contact number is required';
    return value.replace(/[^\d+]/g, '').length >= 10 ? '' : 'Enter a valid phone number';
  },
  city: value => (!value?.trim() ? 'City is required' : ''),
  state: value => (!value?.trim() ? 'State is required' : ''),
  startupName: value => (!value?.trim() ? 'Startup name is required' : ''),
  industry: value => (!value?.trim() ? 'Select an industry' : ''),
  stage: value => (!value?.trim() ? 'Select a stage' : ''),
  problem: value => (!value?.trim() ? 'Problem statement is required' : ''),
  solution: value => (!value?.trim() ? 'Solution is required' : ''),
  targetAudience: value => (!value?.trim() ? 'Target audience is required' : ''),
  amountRequested: value => (!value?.trim() ? 'Funding amount is required' : ''),
  equityOffered: value => (!value?.trim() ? 'Equity offered is required' : ''),
  useOfFunds: value => (!value?.trim() ? 'Explain how funds will be used' : ''),
};

const FIELD_HINTS = {
  amountRequested: 'Example: ₹2.5 Cr for a 18-month runway (include currency).',
  equityOffered: 'Typical seed rounds trade 10–20% equity.',
  growthMetrics: 'e.g., 12% MoM revenue growth, 40% retention, 3 enterprise pilots.',
  customers: 'Example: 1,250 monthly active users or 48 enterprise logos.',
  fundingRaised: 'Example: ₹50 Lakh pre-seed (Jan 2024).',
  socialLinks: 'Share LinkedIn, Twitter, Product Hunt links – one per line.',
};

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

function validateFieldValue(field, value, data = {}) {
  if (INLINE_VALIDATORS[field]) {
    return INLINE_VALIDATORS[field](value);
  }
  if (field === 'website' && value) {
    try {
      const url = new URL(value);
      if (!url.protocol.startsWith('http')) {
        return 'Enter a valid URL (https://...)';
      }
    } catch (error) {
      return 'Enter a valid URL (https://...)';
    }
  }
  if ((field === 'pitchVideoUrl' || field === 'pitchDeckUrl') && value) {
    return '';
  }
  if ((field === 'pitchVideoUrl' || field === 'pitchDeckUrl') && !value) {
    const otherField = field === 'pitchVideoUrl' ? 'pitchDeckUrl' : 'pitchVideoUrl';
    return data[field] || data[otherField] ? '' : 'Upload a pitch deck or video';
  }
  return '';
}

function getStepFields(stepIndex) {
  const stepId = STEPS[stepIndex]?.id;
  switch (stepId) {
    case 'personal':
      return REQUIRED_FIELDS_BY_STEP.personal;
    case 'startup':
      return REQUIRED_FIELDS_BY_STEP.startup;
    case 'product':
      return REQUIRED_FIELDS_BY_STEP.product;
    case 'funding':
      return REQUIRED_FIELDS_BY_STEP.funding;
    case 'uploads':
      return ['pitchVideoUrl', 'pitchDeckUrl'];
    default:
      return [];
  }
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
  const [fieldErrors, setFieldErrors] = useState({});
  const [hasLoaded, setHasLoaded] = useState(false);
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [guidance, setGuidance] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState(null);
  const autoSaveRef = useRef(null);
  const insightsAbortRef = useRef(null);

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

        const { application, draft, activities, guidance: guidancePayload } = json.data || {};
        if (application) {
          setFormData(prev => ({ ...prev, ...normalizeIncoming(application) }));
          setApplicationId(application.id);
          setApplicationStatus(application.status || 'submitted');
        }
        if (!application && draft) {
          setFormData(prev => ({ ...prev, ...normalizeIncoming(draft) }));
          setDraftUpdatedAt(draft.updatedAt || null);
        }
        setTimeline(Array.isArray(activities) ? activities : []);
        setGuidance(guidancePayload || null);
      } catch (error) {
        console.error('FundingApplicationWizard load failed:', error);
        setLoadError('Unable to load your application. Please refresh.');
      } finally {
        setHasLoaded(true);
        setLoading(false);
      }
    }

    load();
  }, []);

  useEffect(() => {
    if (!hasLoaded || loading || demoMode) return;
    if (autoSaveRef.current) {
      clearTimeout(autoSaveRef.current);
    }
    autoSaveRef.current = setTimeout(() => {
      handleSaveDraft(true);
    }, 5000);
    return () => {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current);
      }
    };
  }, [formData, handleSaveDraft, hasLoaded, loading, demoMode]);

useEffect(() => {
  if (!demoMode && hasLoaded && applicationStatus === 'submitted') {
    fetchInsights();
    fetchAnalytics();
  }
}, [applicationStatus, demoMode, fetchAnalytics, fetchInsights, hasLoaded]);

useEffect(() => {
  return () => {
    if (autoSaveRef.current) {
      clearTimeout(autoSaveRef.current);
    }
    if (insightsAbortRef.current) {
      insightsAbortRef.current.abort();
    }
  };
}, []);

  useEffect(() => {
    if (applicationStatus !== 'submitted') {
      setInsights(null);
      setInsightsError(null);
      return;
    }
    let cancelled = false;
    async function fetchInsights() {
      try {
        setInsightsLoading(true);
        setInsightsError(null);
        const params = new URLSearchParams();
        if (formData.industry) params.append('industry', formData.industry);
        if (formData.stage) params.append('stage', formData.stage);
        if (formData.state) params.append('state', formData.state);
        if (formData.amountRequested) params.append('amount', formData.amountRequested);
        const response = await fetch(`/api/funding/insights?${params.toString()}`);
        const json = await response.json();
        if (cancelled) return;
        if (!response.ok || !json.success) {
          throw new Error(json.error || 'Unable to load funding insights');
        }
        setInsights(json.data);
      } catch (error) {
        if (!cancelled) {
          setInsightsError(error.message);
        }
      } finally {
        if (!cancelled) {
          setInsightsLoading(false);
        }
      }
    }
    fetchInsights();
    return () => {
      cancelled = true;
    };
  }, [applicationStatus, formData.amountRequested, formData.industry, formData.stage, formData.state]);

  const handleFieldChange = useCallback((name, value) => {
    setErrors([]);
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      setFieldErrors(current => {
        const updated = { ...current };
        const message = validateFieldValue(name, value, next);
        if (message) {
          updated[name] = message;
        } else {
          delete updated[name];
        }
        if (name === 'pitchVideoUrl' || name === 'pitchDeckUrl') {
          if (next.pitchVideoUrl || next.pitchDeckUrl) {
            delete updated.pitchVideoUrl;
            delete updated.pitchDeckUrl;
          }
        }
        return updated;
      });
      return next;
    });
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep === 0) {
      setCurrentStep(1);
      return;
    }

    const stepErrors = validateStep(currentStep, formData);
    if (stepErrors.length) {
      setErrors(stepErrors.map(error => error.label));
      setFieldErrors(prev => {
        const next = { ...prev };
        stepErrors.forEach(({ field, label }) => {
          if (field) {
            next[field] = `${label} is required`;
          }
        });
        return next;
      });
      return;
    }
    setErrors([]);
    setFieldErrors(prev => {
      const next = { ...prev };
      getStepFields(currentStep).forEach(field => {
        delete next[field];
      });
      return next;
    });
    setCurrentStep(step => Math.min(step + 1, STEPS.length - 1));
  }, [currentStep, formData]);

  const handleBack = useCallback(() => {
    setErrors([]);
    setCurrentStep(step => Math.max(step - 1, 0));
  }, []);

  const fetchInsights = useCallback(async () => {
    if (demoMode) return;
    if (insightsAbortRef.current) {
      insightsAbortRef.current.abort();
    }
    const controller = new AbortController();
    insightsAbortRef.current = controller;
    setInsightsLoading(true);
    setInsightsError(null);
    try {
      const response = await fetch('/api/funding/insights', { signal: controller.signal });
      const json = await response.json();
      if (json.success) {
        setInsights(json.data);
      } else {
        setInsights(null);
        setInsightsError(json.error || 'Unable to load insights');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Funding insights load failed:', error);
        setInsightsError('Unable to load insights right now');
      }
    } finally {
      if (insightsAbortRef.current === controller) {
        insightsAbortRef.current = null;
      }
      setInsightsLoading(false);
    }
  }, [demoMode]);

  const fetchAnalytics = useCallback(async () => {
    if (demoMode) return;
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    try {
      const response = await fetch('/api/funding/analytics');
      const json = await response.json();
      if (json.success) {
        setAnalytics(json.data);
      } else {
        setAnalyticsError(json.error || 'Unable to load analytics');
      }
    } catch (error) {
      console.error('Funding analytics load failed:', error);
      setAnalyticsError('Unable to load analytics');
    } finally {
      setAnalyticsLoading(false);
    }
  }, [demoMode]);

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
          setTimeline(prev => {
            const next = [
              {
                id: `draft-${Date.now()}`,
                activityType: 'draft_saved',
                message: 'Draft saved',
                createdAt: new Date().toISOString(),
              },
              ...prev,
            ];
            return next.slice(0, 20);
          });
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
      fetchInsights();
      fetchAnalytics();
      setTimeline(prev => {
        const next = [
          {
            id: `submitted-${Date.now()}`,
            activityType: 'submitted',
            message: 'Application submitted',
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ];
        return next.slice(0, 20);
      });
      setGuidance(null);
    } catch (error) {
      console.error('Submit application failed', error);
      setStatus({ variant: 'error', message: error.message || 'Unable to submit application' });
    } finally {
      setSubmitting(false);
    }
  }, [applicationId, demoMode, fetchInsights, formData]);

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
        <StepProgressIndicator
          currentStep={currentStep}
          onStepSelect={index => setCurrentStep(Math.min(Math.max(index, 0), STEPS.length - 1))}
        />
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
        {applicationStatus === 'submitted' ? (
          <FundingInsightsPanel insights={insights} loading={insightsLoading} error={insightsError} />
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

      {guidance ? <ReapplyGuidance guidance={guidance} /> : null}

      {applicationStatus === 'submitted' && !demoMode ? (
        <FundingInsightsPanel
          insights={insights}
          loading={insightsLoading}
          error={insightsError}
          onRefresh={fetchInsights}
        />
      ) : null}

      {timeline?.length ? <FundingTimeline items={timeline} /> : null}

      {applicationStatus === 'submitted' && !demoMode ? (
        <FundingAnalyticsPanel
          analytics={analytics}
          loading={analyticsLoading}
          error={analyticsError}
          onRefresh={fetchAnalytics}
        />
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
        fieldErrors,
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
    if (!data[field] || !data[field].toString().trim()) {
      missing.push({ field, label: fieldLabel(field) });
    }
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
        missing.push({ field: 'pitchVideoUrl', label: 'Pitch video or deck' });
        missing.push({ field: 'pitchDeckUrl', label: 'Pitch video or deck' });
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
  fieldErrors,
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
              error={fieldErrors.fullName}
            />
            <InputField
              label="Contact Number"
              name="phone"
              value={formData.phone}
              onChange={handleFieldChange}
              required
              error={fieldErrors.phone}
            />
            <InputField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleFieldChange}
              required
              error={fieldErrors.email}
            />
            <InputField
              label="City"
              name="city"
              value={formData.city}
              onChange={handleFieldChange}
              required
              error={fieldErrors.city}
            />
            <InputField
              label="State"
              name="state"
              value={formData.state}
              onChange={handleFieldChange}
              required
              error={fieldErrors.state}
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
              error={fieldErrors.startupName}
            />
            <InputField
              label="Website"
              name="website"
              value={formData.website}
              onChange={handleFieldChange}
              placeholder="https://"
              error={fieldErrors.website}
            />
            <SelectField
              label="Industry / Sector"
              name="industry"
              value={formData.industry}
              onChange={handleFieldChange}
              options={INDUSTRY_OPTIONS}
              required
              error={fieldErrors.industry}
            />
            <SelectField
              label="Stage"
              name="stage"
              value={formData.stage}
              onChange={handleFieldChange}
              options={STAGE_OPTIONS}
              required
              error={fieldErrors.stage}
            />
            <TextAreaField
              label="Social Links"
              name="socialLinks"
              value={formData.socialLinks}
              onChange={handleFieldChange}
              placeholder="LinkedIn, Twitter, Product Hunt... One per line"
              rows={3}
              hint={FIELD_HINTS.socialLinks}
              error={fieldErrors.socialLinks}
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
            error={fieldErrors.problem}
          />
          <TextAreaField
            label="Your solution"
            name="solution"
            value={formData.solution}
            onChange={handleFieldChange}
            required
            rows={4}
            maxLength={1000}
            error={fieldErrors.solution}
          />
          <TextAreaField
            label="Target audience / market"
            name="targetAudience"
            value={formData.targetAudience}
            onChange={handleFieldChange}
            required
            rows={4}
            maxLength={1000}
            error={fieldErrors.targetAudience}
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
              hint={FIELD_HINTS.customers}
            />
            <InputField
              label="Funding raised so far"
              name="fundingRaised"
              value={formData.fundingRaised}
              onChange={handleFieldChange}
              placeholder="e.g. ₹50 Lakh seed"
              hint={FIELD_HINTS.fundingRaised}
            />
          </div>
          <TextAreaField
            label="Growth metrics"
            name="growthMetrics"
            value={formData.growthMetrics}
            onChange={handleFieldChange}
            placeholder="Monthly growth, retention, partnerships etc."
            rows={4}
            hint={FIELD_HINTS.growthMetrics}
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
              hint={FIELD_HINTS.amountRequested}
              error={fieldErrors.amountRequested}
            />
            <InputField
              label="Equity offered (%)"
              name="equityOffered"
              value={formData.equityOffered}
              onChange={handleFieldChange}
              placeholder="e.g. 10"
              required
              hint={FIELD_HINTS.equityOffered}
              error={fieldErrors.equityOffered}
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
              error={fieldErrors.useOfFunds}
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
            error={fieldErrors.pitchVideoUrl}
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
            error={fieldErrors.pitchDeckUrl}
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
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <button
                type="button"
                onClick={() => handleSaveDraft()}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10 disabled:opacity-60"
                disabled={demoMode}
              >
                <Save className="h-4 w-4" /> Save draft
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || demoMode}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/40 transition hover:bg-emerald-500 disabled:opacity-60"
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

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

function formatINR(value) {
  if (!value || Number.isNaN(value)) return '—';
  return `₹${currencyFormatter.format(value)}`;
}

function FundingInsightsPanel({ insights, loading, error, onRefresh }) {
  if (!loading && !error && (!insights || (!insights.benchmarks && !insights.matchInsights?.length))) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-sm text-white">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Funding insights</h3>
          <p className="text-xs text-slate-400">
            Benchmarks from recently submitted startups plus your state match explanation.
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-xs text-white transition hover:bg-white/10"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {error ? (
        <div className="mb-4 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-2 text-xs text-rose-100">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="mb-4 text-xs text-slate-400">Loading insights…</div>
      ) : null}

      {insights?.benchmarks ? (
        <div className="mb-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Industry average raise</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {formatINR(insights.benchmarks.industryAverage)}
            </p>
            <p className="text-xs text-slate-400">
              Based on {insights.benchmarks.industryCount || 0} startups in your sector
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Global average raise</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {formatINR(insights.benchmarks.globalAverage)}
            </p>
            <p className="text-xs text-slate-400">
              Across {insights.benchmarks.globalCount || 0} submitted applications
            </p>
          </div>
        </div>
      ) : null}

      {insights?.matchInsights?.length ? (
        <div className="space-y-4">
          {insights.matchInsights.map(match => (
            <div
              key={match.stateId}
              className="rounded-2xl border border-white/10 bg-white/3 px-4 py-3 text-sm text-slate-200"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-white">
                  <Sparkles className="h-4 w-4 text-blue-300" />
                  <span className="font-semibold">{match.stateName}</span>
                </div>
                <span className="text-xs text-slate-400">{match.score}% fit</span>
              </div>
              <div className="mt-3 space-y-2">
                {match.breakdown?.map(item => (
                  <div key={item.key}>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 capitalize">{item.key}</span>
                      <span className="text-white">{item.value}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10">
                      <div
                        className="h-1.5 rounded-full bg-blue-500"
                        style={{ width: `${Math.min(100, item.value)}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400">{item.note}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

const dateTimeFormatter = new Intl.DateTimeFormat('en-IN', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

function formatDateTime(value) {
  if (!value) return '';
  try {
    return dateTimeFormatter.format(new Date(value));
  } catch {
    return value;
  }
}

const ACTIVITY_LABELS = {
  draft_saved: 'Draft saved',
  submitted: 'Submitted',
  'in-review': 'In review',
  approved: 'Approved',
  rejected: 'Rejected',
};

function FundingTimeline({ items }) {
  if (!items?.length) return null;
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 text-sm text-white">
      <div className="mb-4 flex items-center gap-2 text-slate-300">
        <History className="h-4 w-4 text-blue-300" />
        <div>
          <h3 className="text-lg font-semibold text-white">Application timeline</h3>
          <p className="text-xs text-slate-400">Track every save, submission, and review action.</p>
        </div>
      </div>
      <ol className="space-y-3 text-xs text-slate-300">
        {items.map(item => (
          <li
            key={item.id}
            className="rounded-2xl border border-white/5 bg-white/3 px-4 py-3 text-slate-200"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-white">
              <span>{ACTIVITY_LABELS[item.activityType] || item.activityType}</span>
              <span className="text-xs text-slate-400">{formatDateTime(item.createdAt)}</span>
            </div>
            {item.message ? <p className="text-xs text-slate-400">{item.message}</p> : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

function ReapplyGuidance({ guidance }) {
  if (!guidance) return null;
  return (
    <section className="rounded-3xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-50">
      <div className="mb-3 flex items-center gap-2 text-amber-100">
        <Info className="h-4 w-4" />
        <span className="font-semibold">{guidance.title || 'Tips before you reapply'}</span>
      </div>
      <ul className="list-disc space-y-1 pl-5 text-xs text-amber-100/90">
        {(guidance.tips || []).map(tip => (
          <li key={tip}>{tip}</li>
        ))}
      </ul>
    </section>
  );
}

function FundingAnalyticsPanel({ analytics, loading, error, onRefresh }) {
  if (!loading && !error && !analytics) return null;
  const startupInsights = analytics?.startupInsights || [];
  const investorInsights = analytics?.investorInsights || [];
  const counts = analytics?.systemStats?.counts || {};
  const matchSuccessRate = analytics?.systemStats?.matchSuccessRate ?? 0;

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 text-sm text-white">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Documotion analytics</h3>
          <p className="text-xs text-slate-400">Live benchmarks from the funding network.</p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-xs text-white transition hover:bg-white/10"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {error ? (
        <div className="mb-4 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-2 text-xs text-rose-100">
          {error}
        </div>
      ) : null}

      {loading ? <p className="text-xs text-slate-400">Loading analytics…</p> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/4 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">System status</p>
          <div className="mt-3 space-y-2 text-sm text-slate-200">
            <div className="flex justify-between">
              <span>Submitted</span>
              <span>{counts.submitted || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>In review</span>
              <span>{counts['in-review'] || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Approved</span>
              <span>{counts.approved || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Drafts</span>
              <span>{counts.draft || 0}</span>
            </div>
          </div>
          <p className="mt-3 text-xs text-emerald-300">
            Match success rate {matchSuccessRate}% (approved / submitted)
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/4 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Top industries</p>
          <ul className="mt-3 space-y-2 text-xs text-slate-200">
            {startupInsights.length
              ? startupInsights.map(item => (
                  <li key={item.industry} className="flex justify-between">
                    <span>{item.industry}</span>
                    <span className="text-white">{formatINR(item.averageRaise)}</span>
                  </li>
                ))
              : (
                <li className="text-slate-500">No industry data yet.</li>
                )}
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/4 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Investor hotspots</p>
          <ul className="mt-3 space-y-2 text-xs text-slate-200">
            {investorInsights.length
              ? investorInsights.map(item => (
                  <li key={item.state} className="flex justify-between">
                    <span>{item.state}</span>
                    <span>{item.count}</span>
                  </li>
                ))
              : (
                <li className="text-slate-500">No state trends yet.</li>
                )}
          </ul>
        </div>
      </div>
    </section>
  );
}

function StepNavigation({ currentStep, onBack, onNext }) {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
      <button
        type="button"
        onClick={onBack}
        disabled={currentStep === 0}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10 disabled:opacity-60 sm:w-auto"
      >
        <ChevronLeft className="h-4 w-4" /> Back
      </button>
      <button
        type="button"
        onClick={onNext}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/40 transition hover:bg-blue-500 sm:w-auto"
      >
        Continue
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
  hint,
  error,
}) {
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
        className={clsx(
          'w-full rounded-xl border bg-white/5 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none',
          error ? 'border-rose-400/70 focus:border-rose-300' : 'border-white/10 focus:border-blue-400/70'
        )}
      />
      {hint ? <p className="text-xs text-slate-400">{hint}</p> : null}
      {error ? <p className="text-xs text-rose-300">{error}</p> : null}
    </label>
  );
}

function SelectField({ label, name, value, onChange, options, required, error }) {
  return (
    <label className="space-y-1 text-sm text-slate-200">
      <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
        {label}
        {required ? <span className="text-rose-300"> *</span> : null}
      </span>
      <select
        value={value}
        onChange={event => onChange(name, event.target.value)}
        className={clsx(
          'w-full rounded-xl border bg-white/5 px-3 py-2 text-sm text-white focus:outline-none',
          error ? 'border-rose-400/70 focus:border-rose-300' : 'border-white/10 focus:border-blue-400/70'
        )}
      >
        <option value="">Select</option>
        {options.map(option => (
          <option key={option} value={option} className="text-slate-900">
            {option}
          </option>
        ))}
      </select>
      {error ? <p className="text-xs text-rose-300">{error}</p> : null}
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
  hint,
  error,
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
        className={clsx(
          'w-full rounded-2xl border bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none',
          error ? 'border-rose-400/70 focus:border-rose-300' : 'border-white/10 focus:border-blue-400/70'
        )}
      />
      {hint ? <p className="text-xs text-slate-400">{hint}</p> : null}
      {remaining !== null ? (
        <span className="text-xs text-slate-400">{remaining} characters left</span>
      ) : null}
      {error ? <p className="text-xs text-rose-300">{error}</p> : null}
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
  error,
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
          {error ? <p className="text-xs text-rose-300">{error}</p> : null}
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

function StepProgressIndicator({ currentStep, onStepSelect }) {
  return (
    <div className="mt-3 flex gap-2 overflow-x-auto rounded-2xl border border-white/5 bg-white/[0.02] p-2 text-xs text-slate-300">
      {STEPS.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        return (
          <button
            key={step.id}
            type="button"
            onClick={() => onStepSelect(index)}
            className={clsx(
              'flex min-w-[120px] flex-1 items-center gap-2 rounded-xl px-3 py-2 transition focus:outline-none',
              isActive
                ? 'bg-blue-600/20 text-white'
                : isCompleted
                  ? 'bg-emerald-500/10 text-emerald-100'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
            )}
          >
            <span
              className={clsx(
                'flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold',
                isCompleted
                  ? 'bg-emerald-400/30 text-emerald-50'
                  : isActive
                    ? 'bg-blue-500/30 text-blue-50'
                    : 'bg-white/10 text-slate-300'
              )}
            >
              {index + 1}
            </span>
            <span className="text-left font-medium">{step.title}</span>
          </button>
        );
      })}
    </div>
  );
}

function FundingInsightsPanel({ insights, loading, error }) {
  if (loading) {
    return (
      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
        Loading funding insights...
      </div>
    );
  }
  if (error) {
    return (
      <div className="mt-4 rounded-2xl border border-amber-400/40 bg-amber-500/10 p-4 text-xs text-amber-100">
        {error}
      </div>
    );
  }
  if (!insights) {
    return null;
  }

  const { benchmarks, matchInsights } = insights;

  const formatAmount = value => {
    if (!value) return '—';
    return `₹ ${Number(value).toLocaleString('en-IN')}`;
  };

  return (
    <div className="mt-4 grid gap-4 rounded-3xl border border-white/5 bg-white/[0.02] p-4 md:grid-cols-2">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center gap-2 text-white">
          <Sparkles className="h-4 w-4 text-blue-200" />
          <span className="text-sm font-semibold">Sector Benchmarks</span>
        </div>
        {benchmarks ? (
          <dl className="mt-3 space-y-2 text-sm text-slate-200">
            <div className="flex justify-between">
              <dt>Industry avg. ask</dt>
              <dd className="font-semibold">{formatAmount(benchmarks.industryAverage)}</dd>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <dt>Industry submissions</dt>
              <dd>{benchmarks.industryCount}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Platform avg. ask</dt>
              <dd className="font-semibold">{formatAmount(benchmarks.globalAverage)}</dd>
            </div>
          </dl>
        ) : (
          <p className="mt-2 text-xs text-slate-400">Not enough data yet for benchmarks.</p>
        )}
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center gap-2 text-white">
          <Info className="h-4 w-4 text-emerald-200" />
          <span className="text-sm font-semibold">Top State Matches</span>
        </div>
        {matchInsights?.length ? (
          <ul className="mt-3 space-y-3 text-xs text-slate-200">
            {matchInsights.map(match => (
              <li key={match.stateId} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <div className="flex items-center justify-between text-sm text-white">
                  <span>{match.stateName}</span>
                  <span className="font-semibold">{match.score}% fit</span>
                </div>
                <dl className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                  {(match.breakdown || []).slice(0, 3).map(item => (
                    <div key={`${match.stateId}-${item.key}`} className="rounded border border-white/5 px-2 py-1">
                      <dt className="uppercase tracking-[0.2em] text-[9px] text-slate-500">
                        {item.key}
                      </dt>
                      <dd className="text-slate-200">
                        {item.value}%
                      </dd>
                    </div>
                  ))}
                </dl>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-xs text-slate-400">No matches yet.</p>
        )}
      </div>
    </div>
  );
}
