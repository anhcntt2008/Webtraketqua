import React, { useState } from 'react';
import { P, font } from '../styles/theme';
import { Card, FileIcon, Spinner } from '../components/Shared';
import { ResultService } from '../services/api';

export default function TabFiles({ result }) {
  const [downloading, setDownloading] = useState(null);
  const [downloadingAll, setDownloadingAll] = useState(false);

  const downloadOne = async (file) => {
    await ResultService.downloadFile(result.patient.pid, file.id, file.name);
  };

  const handleDownload = async (file) => {
    setDownloading(file.id);
    try {
      await downloadOne(file);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Không thể tải file. Vui lòng thử lại.');
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadAll = async () => {
    if (downloadingAll) return;
    setDownloadingAll(true);
    try {
      for (const f of result.files) {
        setDownloading(f.id);
        try {
          await downloadOne(f);
        } catch (err) {
          console.error('Download failed for', f.name, err);
        }
      }
    } finally {
      setDownloading(null);
      setDownloadingAll(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {result.files.map(f => (
        <Card key={f.id} style={{
          padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          transition: 'border-color .2s',
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor = P.primary}
          onMouseLeave={e => e.currentTarget.style.borderColor = P.border}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <FileIcon type={f.type} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: P.text }}>{f.name}</div>
              <div style={{ fontSize: 12, color: P.textMuted, marginTop: 2 }}>{f.size} • {f.type.toUpperCase()}</div>
            </div>
          </div>
          <button
            onClick={() => handleDownload(f)}
            disabled={downloading === f.id}
            style={{
              padding: '8px 18px', borderRadius: 8,
              background: downloading === f.id ? P.primaryDark : P.primaryLight,
              border: '1px solid ' + P.primary + '30',
              color: downloading === f.id ? P.white : P.primary,
              cursor: downloading === f.id ? 'wait' : 'pointer',
              fontFamily: font, fontSize: 13, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 6,
              transition: 'background .2s',
            }}
            onMouseEnter={e => { if (downloading !== f.id) e.currentTarget.style.background = P.primary + '25'; }}
            onMouseLeave={e => { if (downloading !== f.id) e.currentTarget.style.background = P.primaryLight; }}
          >
            {downloading === f.id
              ? <Spinner size={14} color={P.white} />
              : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
            }
            {downloading === f.id ? 'Đang tải...' : 'Tải xuống'}
          </button>
        </Card>
      ))}

      {/* Download all */}
      <button
        onClick={handleDownloadAll}
        disabled={downloadingAll}
        style={{
          marginTop: 8, padding: '14px 0', borderRadius: 12,
          background: P.primaryLight,
          border: '1px dashed ' + P.primary + '50',
          color: P.primary,
          cursor: downloadingAll ? 'wait' : 'pointer',
          fontFamily: font, fontSize: 14, fontWeight: 600,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'border-color .2s',
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = P.primary}
        onMouseLeave={e => e.currentTarget.style.borderColor = P.primary + '50'}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        {downloadingAll ? 'Đang tải...' : `Tải tất cả (${result.files.length} file)`}
      </button>
    </div>
  );
}
