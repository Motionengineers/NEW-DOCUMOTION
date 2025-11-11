'use client';

import { useMemo, useState } from 'react';
import { Download } from 'lucide-react';

function normalizeUrl(url) {
  if (typeof url !== 'string' || !url) return '';
  let u = url.trim();
  // Encode spaces
  u = u.replace(/ /g, '%20');
  // If relative path without protocol, ensure leading slash
  if (!/^https?:\/\//i.test(u) && !u.startsWith('/')) {
    u = `/${u}`;
  }
  // Collapse duplicate slashes except after protocol
  u = u.replace(/([^:])\/\/+/, '$1/');
  return u;
}

export default function PDFViewer({ fileUrl, onShare }) {
  const safeUrl = useMemo(() => {
    const u = normalizeUrl(fileUrl);
    if (u.startsWith('/decks/')) {
      return 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    }
    return u;
  }, [fileUrl]);
  const [failed, setFailed] = useState(false);

  if (!safeUrl) {
    return (
      <div className="text-center p-8 glass rounded-xl">
        <p className="text-red-500">Missing PDF file URL</p>
      </div>
    );
  }

  return (
    <div className="glass p-4 rounded-xl">
      <div className="flex items-center justify-end mb-3 gap-2">
        {onShare && (
          <button
            onClick={onShare}
            className="px-3 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ backgroundColor: 'var(--system-blue)', color: '#ffffff' }}
          >
            Share
          </button>
        )}
        <a
          href={safeUrl}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all"
          style={{
            backgroundColor: 'var(--secondary)',
            color: 'var(--label)',
            borderColor: 'var(--separator)',
          }}
        >
          <Download className="h-4 w-4" />
          Download
        </a>
      </div>

      <div className="flex justify-center" style={{ height: '75vh' }}>
        {!failed ? (
          <iframe
            src={`${safeUrl}#page=1&view=FitH`}
            className="w-full h-full rounded-lg border-0 bg-white"
            title="PDF Preview"
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="glass p-4 rounded-xl text-center" style={{ width: '100%' }}>
            <p className="mb-2" style={{ color: 'var(--label)' }}>
              Unable to display PDF inline.
            </p>
            <a
              href={safeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
              style={{ color: 'var(--system-blue)' }}
            >
              Open in new tab
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
