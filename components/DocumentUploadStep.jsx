'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react';
import DocumentUploader from './DocumentUploader';
import GlassCard from './GlassCard';

const REQUIRED_DOCUMENTS = [
  { id: 'identity', label: 'Identity Proof', description: 'Aadhaar/PAN/Passport', required: true },
  { id: 'address', label: 'Address Proof', description: 'Utility bill, rental agreement, etc.', required: true },
  { id: 'dsc', label: 'Digital Signature Certificate (DSC)', description: 'If available', required: false },
  { id: 'photo', label: 'Passport Size Photos', description: 'Recent passport size photos', required: true },
];

export default function DocumentUploadStep({ serviceRequest, onComplete }) {
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [documentsReady, setDocumentsReady] = useState(false);

  useEffect(() => {
    // Check if minimum required documents are uploaded
    const requiredDocs = REQUIRED_DOCUMENTS.filter(d => d.required);
    const uploadedRequired = requiredDocs.filter(req => {
      return uploadedDocs.some(doc => {
        const docName = (doc.name || '').toLowerCase();
        return docName.includes(req.id) || 
               docName.includes(req.label.toLowerCase().split(' ')[0]);
      });
    });
    
    // At least 2 required documents should be uploaded (Identity + Address are critical)
    setDocumentsReady(uploadedRequired.length >= 2);
  }, [uploadedDocs]);

  const handleDocumentsUploaded = (docs) => {
    setUploadedDocs(docs || []);
  };

  const getDocumentStatus = (docId) => {
    const found = uploadedDocs.find(doc => {
      const docName = (doc.name || '').toLowerCase();
      const docInfo = REQUIRED_DOCUMENTS.find(d => d.id === docId);
      return docName.includes(docId) || 
             docName.includes(docInfo?.label.toLowerCase().split(' ')[0]);
    });
    return found ? 'uploaded' : 'pending';
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2" style={{ color: 'var(--label)' }}>
        Upload Required Documents
      </h2>
      <p className="mb-6" style={{ color: 'var(--secondary-label)' }}>
        Upload the documents below to proceed with your registration
      </p>

      {/* Document Checklist */}
      <GlassCard className="p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--label)' }}>
          Required Documents Checklist
        </h3>
        <div className="space-y-3">
          {REQUIRED_DOCUMENTS.map(doc => {
            const status = getDocumentStatus(doc.id);
            const isUploaded = status === 'uploaded';
            
            return (
              <div
                key={doc.id}
                className="flex items-start gap-3 p-3 rounded-lg border transition-all"
                style={{
                  backgroundColor: isUploaded 
                    ? 'rgba(40, 167, 69, 0.1)' 
                    : 'var(--system-secondary-background)',
                  borderColor: isUploaded 
                    ? 'rgba(40, 167, 69, 0.3)' 
                    : 'var(--separator)',
                }}
              >
                <div className="mt-0.5">
                  {isUploaded ? (
                    <CheckCircle2 className="h-5 w-5" style={{ color: 'var(--system-green)' }} />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2" style={{ borderColor: 'var(--separator)' }} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium" style={{ color: 'var(--label)' }}>
                      {doc.label}
                    </span>
                    {doc.required && (
                      <span className="text-xs px-2 py-0.5 rounded" style={{ 
                        backgroundColor: 'rgba(255, 59, 48, 0.1)', 
                        color: 'var(--system-red)' 
                      }}>
                        Required
                      </span>
                    )}
                  </div>
                  <p className="text-sm mt-1" style={{ color: 'var(--secondary-label)' }}>
                    {doc.description}
                  </p>
                </div>
                {isUploaded && (
                  <span className="text-xs font-medium" style={{ color: 'var(--system-green)' }}>
                    ✓ Uploaded
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Document Uploader */}
      <DocumentUploader
        serviceRequestId={serviceRequest.id}
        existingDocuments={uploadedDocs}
        onUploadComplete={handleDocumentsUploaded}
      />

      {/* Status Message */}
      {documentsReady && (
        <GlassCard className="p-4 mt-6 border" style={{ 
          backgroundColor: 'rgba(40, 167, 69, 0.1)', 
          borderColor: 'rgba(40, 167, 69, 0.3)' 
        }}>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5" style={{ color: 'var(--system-green)' }} />
            <div className="flex-1">
              <p className="font-medium" style={{ color: 'var(--label)' }}>
                Documents Ready!
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--secondary-label)' }}>
                You can proceed to payment. Additional documents can be uploaded later if needed.
              </p>
            </div>
          </div>
        </GlassCard>
      )}

      {!documentsReady && uploadedDocs.length > 0 && (
        <GlassCard className="p-4 mt-6 border" style={{ 
          backgroundColor: 'rgba(255, 193, 7, 0.1)', 
          borderColor: 'rgba(255, 193, 7, 0.3)' 
        }}>
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5" style={{ color: 'var(--system-yellow)' }} />
            <div className="flex-1">
              <p className="font-medium" style={{ color: 'var(--label)' }}>
                Upload More Documents
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--secondary-label)' }}>
                Please upload at least Identity Proof and Address Proof to continue.
              </p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Continue Button */}
      <div className="mt-6 flex justify-between items-center">
        <button
          onClick={() => window.history.back()}
          className="px-6 py-3 rounded-lg font-medium transition-all border"
          style={{
            backgroundColor: 'var(--system-secondary-background)',
            color: 'var(--label)',
            borderColor: 'var(--separator)',
          }}
        >
          Back
        </button>
        <button
          onClick={onComplete}
          disabled={!documentsReady}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
            documentsReady ? '' : 'opacity-50 cursor-not-allowed'
          }`}
          style={{
            backgroundColor: documentsReady ? 'var(--system-blue)' : 'var(--separator)',
            color: '#ffffff',
          }}
          onMouseEnter={e => {
            if (documentsReady) {
              e.currentTarget.style.backgroundColor = 'var(--primary-hover)';
            }
          }}
          onMouseLeave={e => {
            if (documentsReady) {
              e.currentTarget.style.backgroundColor = 'var(--system-blue)';
            }
          }}
        >
          <span>Continue to Payment</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

