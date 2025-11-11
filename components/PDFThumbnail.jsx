'use client';

import { useEffect, useRef, useState } from 'react';

function normalize(url) {
  if (!url || typeof url !== 'string') return '';
  let u = url.trim().replace(/ /g, '%20');
  // For external URLs, route via same-origin proxy to avoid CORS/tainted canvas
  if (/^https?:\/\//i.test(u)) {
    return `/api/pdf-proxy?url=${encodeURIComponent(u)}`;
  }
  if (!u.startsWith('/')) u = '/' + u;
  return u;
}

export default function PDFThumbnail({ fileUrl, width = 600, height = 450 }) {
  const canvasRef = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      const safeUrl = normalize(fileUrl);
      if (!safeUrl) return setFailed(true);
      try {
        const pdfjs = await import('pdfjs-dist/build/pdf');
        // worker
        const ver = pdfjs.version || '4.4.168';
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${ver}/pdf.worker.min.js`;
        const loadingTask = pdfjs.getDocument({ url: safeUrl, withCredentials: false });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1 });
        // Higher scale for better readability (2x for crisp text)
        const scale = Math.min(width / viewport.width, height / viewport.height) * 2;
        const v = page.getViewport({ scale });
        const canvas = canvasRef.current;
        if (!canvas || cancelled) return;
        canvas.width = v.width;
        canvas.height = v.height;
        const ctx = canvas.getContext('2d');
        // White background for better readability
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport: v }).promise;
      } catch (e) {
        setFailed(true);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [fileUrl, width, height]);

  return (
    <div className="w-full h-full flex items-center justify-center bg-white dark:bg-gray-900">
      {!failed ? (
        <canvas 
          ref={canvasRef} 
          className="w-full h-full object-contain"
          style={{ imageRendering: 'high-quality' }}
        />
      ) : (
        <div className="text-sm" style={{ color: 'var(--tertiary-label)' }}>
          No preview
        </div>
      )}
    </div>
  );
}
