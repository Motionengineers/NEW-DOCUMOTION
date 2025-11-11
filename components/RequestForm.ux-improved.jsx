'use client';

/**
 * Improved Request Form - Applying UX Laws
 * 
 * Applied Laws:
 * - Miller's Law: Multi-step form with 5-7 fields per step
 * - Hick's Law: Progressive disclosure
 * - Law of Proximity: Grouped related fields
 * - Law of Common Region: Visual boundaries
 * - Parkinson's Law: Progress indicator
 * - Fitt's Law: Large submit buttons
 * - Zeigarnik Effect: Save draft reminder
 * - Postel's Law: Flexible input validation
 */

import { useState, useEffect } from 'react';
import ProgressIndicator from './ProgressIndicator';
import Button from './Button';

export default function RequestFormUX({ agencyId, startupId, onSubmitted }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    serviceType: '',
    budget: '',
    timeline: '',
    message: '',
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Apply Miller's Law: Break form into steps with 5-7 fields per step
  const formSteps = [
    {
      id: 1,
      title: 'Service Details',
      fields: ['serviceType'], // Single field but important
    },
    {
      id: 2,
      title: 'Budget & Timeline',
      fields: ['budget', 'timeline'], // 2 related fields
    },
    {
      id: 3,
      title: 'Additional Information',
      fields: ['message'], // Final details
    },
  ];

  // Apply Zeigarnik Effect: Save draft reminder
  useEffect(() => {
    const hasData = Object.values(formData).some(value => value !== '');
    setHasUnsavedChanges(hasData && currentStep < formSteps.length);
    
    // Save to localStorage as draft
    if (hasData) {
      localStorage.setItem('requestFormDraft', JSON.stringify(formData));
    }
  }, [formData, currentStep, formSteps.length]);

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem('requestFormDraft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setFormData(parsed);
        setHasUnsavedChanges(true);
      } catch (e) {
        // Ignore invalid draft
      }
    }
  }, []);

  const handleNext = () => {
    if (currentStep < formSteps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  // Apply Postel's Law: Flexible input validation
  const normalizeBudget = (value) => {
    // Remove non-numeric characters except for currency symbols
    return value.replace(/[^\d]/g, '');
  };

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/agency-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agencyId,
          startupId,
          serviceType: formData.serviceType,
          budget: formData.budget ? parseInt(normalizeBudget(formData.budget)) : null,
          timeline: formData.timeline,
          message: formData.message,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to submit');
      
      // Clear draft on success
      localStorage.removeItem('requestFormDraft');
      onSubmitted?.(json.request);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const currentStepData = formSteps[currentStep - 1];
  const isLastStep = currentStep === formSteps.length;
  const canProceed = currentStepData.fields.every(field => {
    const value = formData[field];
    if (field === 'budget') return true; // Optional
    return value && value.trim() !== '';
  });

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Apply Parkinson's Law: Progress indicator */}
      <ProgressIndicator
        current={currentStep}
        total={formSteps.length}
        label={`Step ${currentStep} of ${formSteps.length}`}
      />

      {/* Apply Zeigarnik Effect: Unsaved changes reminder */}
      {hasUnsavedChanges && (
        <div
          className="p-3 rounded-lg border flex items-center space-x-2"
          style={{
            backgroundColor: 'rgba(0, 102, 204, 0.05)',
            borderColor: 'rgba(0, 102, 204, 0.2)',
          }}
        >
          <span className="text-sm">💾</span>
          <p className="text-sm" style={{ color: 'var(--system-blue)' }}>
            You have unsaved changes. Complete the form to save your request.
          </p>
        </div>
      )}

      {/* Apply Law of Common Region: Visual boundaries for each step */}
      <div
        className="p-6 rounded-xl border space-y-6"
        style={{
          backgroundColor: 'var(--system-secondary-background)',
          borderColor: 'var(--separator)',
          minHeight: '300px',
        }}
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--label)' }}>
          {currentStepData.title}
        </h3>

        {/* Step 1: Service Type */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--label)' }}>
                Service Needed <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-4 py-3 rounded-lg min-h-[48px]"
                style={{
                  backgroundColor: 'var(--system-background)',
                  color: 'var(--label)',
                  border: '1px solid var(--separator)',
                }}
                value={formData.serviceType}
                onChange={e => handleChange('serviceType', e.target.value)}
                required
              >
                <option value="">Select a service...</option>
                <option value="Logo Design">Logo Design</option>
                <option value="Brand Identity">Brand Identity</option>
                <option value="Website Design">Website Design</option>
                <option value="Marketing Strategy">Marketing Strategy</option>
                <option value="Social Media Management">Social Media Management</option>
                <option value="Content Creation">Content Creation</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 2: Budget & Timeline - Apply Law of Proximity: Group related fields */}
        {currentStep === 2 && (
          <div className="space-y-4">
            {/* Apply Law of Common Region: Group budget and timeline */}
            <div
              className="p-4 rounded-lg border"
              style={{
                backgroundColor: 'var(--system-background)',
                borderColor: 'var(--separator)',
              }}
            >
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--label)' }}>
                Budget (₹)
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-lg min-h-[48px]"
                style={{
                  backgroundColor: 'var(--system-secondary-background)',
                  color: 'var(--label)',
                  border: '1px solid var(--separator)',
                }}
                placeholder="e.g., 50000 or ₹50,000"
                value={formData.budget}
                onChange={e => handleChange('budget', e.target.value)}
              />
              <p className="text-xs mt-1" style={{ color: 'var(--tertiary-label)' }}>
                Enter amount in any format (₹50,000, 50000, etc.)
              </p>
            </div>

            <div
              className="p-4 rounded-lg border"
              style={{
                backgroundColor: 'var(--system-background)',
                borderColor: 'var(--separator)',
              }}
            >
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--label)' }}>
                Timeline
              </label>
              <input
                className="w-full px-4 py-3 rounded-lg min-h-[48px]"
                style={{
                  backgroundColor: 'var(--system-secondary-background)',
                  color: 'var(--label)',
                  border: '1px solid var(--separator)',
                }}
                placeholder="e.g., 2 weeks, 1 month"
                value={formData.timeline}
                onChange={e => handleChange('timeline', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 3: Message */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--label)' }}>
                Additional Information
              </label>
              <textarea
                rows={6}
                className="w-full px-4 py-3 rounded-lg"
                style={{
                  backgroundColor: 'var(--system-background)',
                  color: 'var(--label)',
                  border: '1px solid var(--separator)',
                  minHeight: '120px',
                }}
                placeholder="Describe your project requirements, goals, or any specific needs..."
                value={formData.message}
                onChange={e => handleChange('message', e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div
          className="p-3 rounded-lg"
          style={{ backgroundColor: 'rgba(255,59,48,.12)', color: 'var(--system-red)' }}
        >
          {error}
        </div>
      )}

      {/* Navigation Buttons - Apply Fitt's Law: Large buttons */}
      <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--separator)' }}>
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
        >
          ← Back
        </Button>

        <div className="flex items-center space-x-3">
          {!isLastStep ? (
            <Button
              type="button"
              variant="primary"
              onClick={handleNext}
              disabled={!canProceed}
            >
              Next →
            </Button>
          ) : (
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={!canProceed}
            >
              Submit Request
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}

