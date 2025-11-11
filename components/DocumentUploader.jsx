'use client';

import { useState } from 'react';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import GlassCard from './GlassCard';

export default function DocumentUploader({
  serviceRequestId,
  existingDocuments = [],
  onUploadComplete,
}) {
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState(existingDocuments || []);

  const handleFileUpload = async e => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    try {
      // First, get the service request to find the startupId
      const requestResponse = await fetch(`/api/service-requests/${serviceRequestId}`);
      const requestData = await requestResponse.json();

      if (!requestData.success || !requestData.serviceRequest.startupId) {
        throw new Error('Service request not found');
      }

      const startupId = requestData.serviceRequest.startupId;

      // Now upload the document
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'service_document');
      formData.append('startupId', startupId.toString());
      formData.append('name', file.name);

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Upload failed: ${response.status}`);
      }

      if (data.fileUrl || data.url) {
        const newDoc = {
          url: data.fileUrl || data.url,
          type: file.name.split('.').pop().toUpperCase(),
          name: file.name,
          status: 'uploaded',
          uploadedAt: new Date().toISOString(),
        };

        const updatedDocs = [...documents, newDoc];
        setDocuments(updatedDocs);

        // Update service request with new document
        await fetch(`/api/service-requests/${serviceRequestId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            documents: updatedDocs,
          }),
        });

        if (onUploadComplete) {
          onUploadComplete(updatedDocs);
        }
      } else {
        throw new Error(data.error || 'Upload failed: No file URL returned');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(
        'Upload failed: ' +
          (error.message || 'Please check your storage configuration (AWS S3 or Cloudinary).')
      );
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  const removeDocument = async index => {
    const updated = documents.filter((_, i) => i !== index);
    setDocuments(updated);

    await fetch(`/api/service-requests/${serviceRequestId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documents: updated,
      }),
    });

    if (onUploadComplete) {
      onUploadComplete(updated);
    }
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--label)' }}>
          Upload Documents
        </h3>
        <label className="cursor-pointer">
          <input
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            accept=".pdf,.jpg,.jpeg,.png"
            disabled={uploading}
          />
          <div
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
            style={{
              backgroundColor: 'var(--system-blue)',
              color: '#ffffff',
            }}
            onMouseEnter={e => {
              if (!uploading) {
                e.target.style.backgroundColor = 'var(--primary-hover)';
              }
            }}
            onMouseLeave={e => {
              if (!uploading) {
                e.target.style.backgroundColor = 'var(--system-blue)';
              }
            }}
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                <span>Upload Document</span>
              </>
            )}
          </div>
        </label>
      </div>

      <div className="space-y-2">
        {documents.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: 'var(--secondary-label)' }}>
            No documents uploaded yet
          </p>
        ) : (
          documents.map((doc, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg border"
              style={{
                backgroundColor: 'var(--system-secondary-background)',
                borderColor: 'var(--separator)',
              }}
            >
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5" style={{ color: 'var(--system-blue)' }} />
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--label)' }}>
                    {doc.name || `Document ${index + 1}`}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--secondary-label)' }}>
                    {doc.type} • {doc.status || 'uploaded'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeDocument(index)}
                className="p-1 rounded transition-all"
                style={{ color: 'var(--system-red)' }}
                onMouseEnter={e => {
                  e.target.style.backgroundColor = 'rgba(255, 59, 48, 0.1)';
                }}
                onMouseLeave={e => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>

      <p className="text-xs mt-4" style={{ color: 'var(--tertiary-label)' }}>
        Supported formats: PDF, JPG, PNG. Max size: 10MB
      </p>
    </GlassCard>
  );
}
