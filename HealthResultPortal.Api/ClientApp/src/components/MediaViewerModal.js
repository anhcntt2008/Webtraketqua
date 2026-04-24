import React, { useEffect, useState } from 'react';
import { P, font } from '../styles/theme';
import { Spinner } from './Shared';
import { ResultService } from '../services/api';

/**
 * Full-screen modal rendering a CĐHA file (pdf / image / video) inline.
 * If the file is an external link (file.kind === 'link') it opens directly
 * in a new tab without fetching through the API.
 */
export default function MediaViewerModal({ maLuotKham, file, onClose }) {
  const [url, setUrl] = useState(null);
  const [contentType, setContentType] = useState('');
  const [error, setError] = useState('');

  const kind = (file.kind || '').toLowerCase();

  useEffect(() => {
    if (kind === 'link') return; // nothing to fetch
    let cancelled = false;
    let objectUrl = null;
    (async () => {
      try {
        const { url: u, contentType: ct } = await ResultService.fetchImagingFileUrl(maLuotKham, file.id);
        if (cancelled) { window.URL.revokeObjectURL(u); return; }
        objectUrl = u;
        setUrl(u);
        setContentType(ct);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Không thể tải file để xem trước');
      }
    })();
    return () => {
      cancelled = true;
      if (objectUrl) window.URL.revokeObjectURL(objectUrl);
    };
  }, [maLuotKham, file.id, kind]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const downloadFromBlob = () => {
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', file.fileName || file.name || `file_${file.id}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const renderBody = () => {
    if (kind === 'link') {
      return (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          color: P.white, fontFamily: font, padding: 24, textAlign: 'center', gap: 16,
        }}>
          <div style={{ fontSize: 48 }}>🔗</div>
          <div>File này được lưu dưới dạng đường dẫn ngoài.</div>
          <a href={file.linkUrl} target="_blank" rel="noopener noreferrer" style={{
            padding: '10px 20px', borderRadius: 8, background: P.primary,
            color: '#fff', fontWeight: 600, textDecoration: 'none', fontFamily: font,
          }}>
            Mở liên kết
          </a>
        </div>
      );
    }

    if (!url && !error) {
      return (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          color: P.white, fontFamily: font,
        }}>
          <Spinner size={40} color={P.white} />
          <div style={{ marginTop: 12, fontSize: 14 }}>Đang tải file...</div>
        </div>
      );
    }
    if (error) {
      return (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          color: '#ffb4b4', fontFamily: font, padding: 24, textAlign: 'center',
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
          <div>{error}</div>
        </div>
      );
    }

    if (kind === 'image' || contentType.startsWith('image/')) {
      return (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#0e0e0e', overflow: 'auto', padding: 16,
        }}>
          <img src={url} alt={file.fileName || file.name}
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        </div>
      );
    }

    if (kind === 'video' || contentType.startsWith('video/')) {
      return (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#000',
        }}>
          <video src={url} controls autoPlay style={{ maxWidth: '100%', maxHeight: '100%' }}>
            Trình duyệt không hỗ trợ phát video này.
          </video>
        </div>
      );
    }

    // Default: PDF / other via iframe
    return (
      <iframe
        title={file.fileName || file.name}
        src={url}
        style={{ width: '100%', height: '100%', border: 0, background: '#fff' }}
      />
    );
  };

  const displayName = file.fileName || file.name || `file_${file.id}`;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100,
        display: 'flex', flexDirection: 'column',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 16px', background: P.headerBg, color: P.headerText,
          fontFamily: font, fontSize: 14, fontWeight: 600,
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%',
        }}>
          <span style={{ fontSize: 16 }}>{iconForKind(kind)}</span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {kind !== 'link' && (
            <button onClick={downloadFromBlob} disabled={!url} style={iconBtn}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Tải xuống
            </button>
          )}
          <button onClick={onClose} style={iconBtn} title="Đóng (Esc)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      <div onClick={e => e.stopPropagation()} style={{ flex: 1, background: '#1a1a1a', position: 'relative' }}>
        {renderBody()}
      </div>
    </div>
  );
}

function iconForKind(kind) {
  switch (kind) {
    case 'pdf': return '📄';
    case 'image': return '🖼️';
    case 'video': return '🎬';
    case 'link': return '🔗';
    default: return '📎';
  }
}

const iconBtn = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '6px 12px', borderRadius: 6,
  background: 'rgba(255,255,255,0.18)', color: '#fff',
  border: '1px solid rgba(255,255,255,0.35)',
  cursor: 'pointer', fontFamily: font, fontSize: 13, fontWeight: 600,
};
