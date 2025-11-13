'use client';

import { useState } from 'react';
import ServiceRequestForm from '@/components/ServiceRequestForm';
import DocumentUploadStep from '@/components/DocumentUploadStep';

export default function RegistrationWorkflow() {
  const [serviceRequest, setServiceRequest] = useState(null);

  return (
    <div className="space-y-10">
      <section className="glass rounded-2xl p-8 border border-white/10 space-y-6">
        <h2 className="text-xl font-semibold" style={{ color: 'var(--label)' }}>
          1. Choose your incorporation path
        </h2>
        <ServiceRequestForm startupId={1} onSelect={(_, request) => setServiceRequest(request)} />
      </section>

      {serviceRequest && (
        <section className="glass rounded-2xl p-8 border border-white/10 space-y-6">
          <h2 className="text-xl font-semibold" style={{ color: 'var(--label)' }}>
            2. Upload core documents
          </h2>
          <DocumentUploadStep serviceRequest={serviceRequest} onComplete={() => {}} />
        </section>
      )}
    </div>
  );
}
