import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { P, font } from '../styles/theme';
import { Spinner } from './Shared';
import { ResultService } from '../services/api';

/**
 * Full-screen modal embedding a PDF via a blob URL in an iframe.
 * Works offline from the server once loaded and avoids popup-blocker
 * issues that `window.open(blobUrl)` hits in some browsers.
 */
export default function PdfViewerModal({ maLuotKham, file, onClose }) {
  const [url, setUrl] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    let objectUrl = null;
    (async () => {
      try {
        const u = await ResultService.fetchFileUrl(maLuotKham, file.id);
        if (cancelled) { window.URL.revokeObjectURL(u); return; }
        objectUrl = u;
        setUrl(u);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Không thể tải file để xem trước');
      }
    })();
    return () => {
      cancelled = true;
      if (objectUrl) window.URL.revokeObjectURL(objectUrl);
    };
  }, [maLuotKham, file.id]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const downloadFromBlob = () => {
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', file.name + (file.name.toLowerCase().endsWith('.pdf') ? '' : '.pdf'));
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return createPortal((
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999,
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Always-visible floating close button — covers the case where the
          iframe's own PDF toolbar overlaps the modal header. */}
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        title="Đóng (Esc)"
        style={{
          position: 'fixed', top: 10, right: 10, zIndex: 10000,
          width: 40, height: 40, borderRadius: '50%',
          background: P.danger, color: P.white,
          border: '2px solid rgba(255,255,255,0.9)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 700,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <div
        onClick={e => e.stopPropagation()}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 60px 10px 16px', background: P.headerBg, color: P.headerText,
          fontFamily: font, fontSize: 14, fontWeight: 600,
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={downloadFromBlob} disabled={!url} style={iconBtn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Tải xuống
          </button>
          <button onClick={onClose} style={iconBtn} title="Đóng (Esc)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      <div onClick={e => e.stopPropagation()} style={{ flex: 1, background: '#1a1a1a', position: 'relative' }}>
        {!url && !error && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            color: P.white, fontFamily: font,
          }}>
            <Spinner size={40} color={P.white} />
            <div style={{ marginTop: 12, fontSize: 14 }}>Đang tải file PDF...</div>
          </div>
        )}
        {error && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            color: '#ffb4b4', fontFamily: font, padding: 24, textAlign: 'center',
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
            <div>{error}</div>
          </div>
        )}
        {url && (
          <iframe
            title={file.name}
            src={url}
            style={{ width: '100%', height: '100%', border: 0, background: '#fff' }}
          />
        )}
      </div>
    </div>
  ), document.body);
}

const iconBtn = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '6px 12px', borderRadius: 6,
  background: 'rgba(255,255,255,0.18)', color: '#fff',
  border: '1px solid rgba(255,255,255,0.35)',
  cursor: 'pointer', fontFamily: font, fontSize: 13, fontWeight: 600,
};
