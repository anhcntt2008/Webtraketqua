import React, { useState } from 'react';
import { P, font } from '../styles/theme';
import { Card } from '../components/Shared';

export default function TabImaging({ result }) {
  const [expanded, setExpanded] = useState(0);
  const items = result.imagingResults || [];

  if (items.length === 0) {
    return (
      <Card style={{ padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🩻</div>
        <p style={{ color: P.textDim, fontSize: 15 }}>Chưa có kết quả chẩn đoán hình ảnh</p>
      </Card>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {items.map((item, idx) => (
        <Card key={item.id || idx} style={{ overflow: 'hidden' }}>
          <button onClick={() => setExpanded(expanded === idx ? null : idx)} style={{
            width: '100%', padding: '16px 20px',
            background: expanded === idx ? P.primaryLight : 'transparent',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontFamily: 'inherit',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>🩻</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: P.text }}>{item.name}</div>
                <div style={{ fontSize: 12, color: P.textMuted }}>{item.date} • {item.doctor}</div>
              </div>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={P.textMuted} strokeWidth="2"
              style={{ transform: expanded === idx ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .2s' }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {expanded === idx && (
            <div style={{ padding: '0 20px 16px' }}>
              {/* Kết quả text */}
              {item.result && (
                <div style={{
                  padding: '12px 16px', borderRadius: 8,
                  background: P.bg, border: '1px solid ' + P.border,
                  fontSize: 13, color: P.text, lineHeight: 1.7,
                  marginBottom: 12,
                }}>
                  <div style={{ fontSize: 12, color: P.textMuted, marginBottom: 6, fontWeight: 600 }}>Kết quả:</div>
                  {item.result}
                </div>
              )}

              {/* HTML content */}
              {item.contentHtml && (
                <div style={{
                  padding: '12px 16px', borderRadius: 8,
                  background: P.white, border: '1px solid ' + P.border,
                  fontSize: 13, color: P.text, lineHeight: 1.7,
                  marginBottom: 12,
                }}
                  dangerouslySetInnerHTML={{ __html: item.contentHtml }}
                />
              )}

              {/* Link file */}
              {(item.urlFile || item.linkUrl) && (
                <a href={item.urlFile || item.linkUrl} target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '8px 16px', borderRadius: 8,
                    background: P.primaryLight, border: '1px solid ' + P.primary + '30',
                    color: P.primary, fontSize: 13, fontWeight: 600,
                    textDecoration: 'none', fontFamily: font,
                  }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  Xem file kết quả
                </a>
              )}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
