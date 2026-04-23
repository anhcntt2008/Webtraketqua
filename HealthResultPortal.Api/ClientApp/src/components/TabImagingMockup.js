import React, { useState } from 'react';
import { P, font } from '../styles/theme';
import { Card } from '../components/Shared';

/**
 * MOCKUP — xem ảnh / video đính kèm trong kết quả CĐHA.
 *
 * Mỗi kết quả có thể kèm nhiều file: ảnh (jpg/png), video (mp4),
 * hoặc PDF. UI cho xem inline: ảnh click để zoom lightbox, video
 * click để play full-screen, PDF click mở PdfViewerModal.
 *
 * Chưa gọi API thật — dùng ảnh/video demo public.
 */

const MOCK_ITEMS = [
  {
    id: 1, idFile: 2001,
    name: 'Chụp X-quang phổi thẳng',
    date: '13/02/2026 09:15', doctor: 'BS. Nguyễn Văn A',
    result: 'Nhu mô phổi 2 bên không thấy tổn thương khu trú. Bóng tim kích thước bình thường.',
    media: [
      { id: 101, kind: 'image', name: 'xq_phoi_truoc.jpg',
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Chest_Xray_PA_3-8-2010.png/640px-Chest_Xray_PA_3-8-2010.png' },
      { id: 102, kind: 'image', name: 'xq_phoi_ben.jpg',
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Normal_chest_X-ray_-_lateral_view.png/480px-Normal_chest_X-ray_-_lateral_view.png' },
      { id: 103, kind: 'pdf', name: 'bao_cao_xquang.pdf', idFile: 2001 },
    ],
  },
  {
    id: 2, idFile: 2002,
    name: 'Siêu âm ổ bụng tổng quát',
    date: '13/02/2026 10:02', doctor: 'BS. Trần Thị B',
    result: 'Gan, lách, thận 2 bên kích thước bình thường. Không thấy dịch ổ bụng.',
    media: [
      { id: 201, kind: 'image', name: 'sieuam_gan.jpg',
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Normal_liver_ultrasound.jpg/640px-Normal_liver_ultrasound.jpg' },
      { id: 202, kind: 'video', name: 'clip_sieuam.mp4',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
    ],
  },
  {
    id: 3, idFile: null,
    name: 'Điện tâm đồ (ECG)',
    date: '13/02/2026 10:35', doctor: 'BS. Lê Văn C',
    result: 'Nhịp xoang đều 78 lần/phút. Trục trung gian.',
    media: [], // không có file đính kèm
  },
];

export default function TabImagingMockup({ result }) {
  const [expanded, setExpanded] = useState(0);
  const [preview, setPreview] = useState(null); // { kind, url, name }

  const openPdf = (m) => {
    // MOCKUP: sẽ mở PdfViewerModal với idFile
    alert(`[Mockup] Mở PDF qua PdfViewerModal\nGET /api/results/${result?.patient?.pid || '...'}/files/${m.idFile}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <MockBanner />

      {MOCK_ITEMS.map((item, idx) => (
        <Card key={item.id} style={{ overflow: 'hidden' }}>
          <button onClick={() => setExpanded(expanded === idx ? null : idx)} style={{
            width: '100%', padding: '14px 18px',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {item.media.length > 0 && (
                <MediaBadge media={item.media} />
              )}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={P.textMuted} strokeWidth="2"
                style={{ transform: expanded === idx ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .2s' }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </button>

          {expanded === idx && (
            <div style={{ padding: '0 18px 16px' }}>
              {item.result && (
                <div style={{
                  padding: '12px 16px', borderRadius: 8,
                  background: P.bg, border: '1px solid ' + P.border,
                  fontSize: 13, color: P.text, lineHeight: 1.7, marginBottom: 12,
                }}>
                  <div style={{ fontSize: 12, color: P.textMuted, marginBottom: 6, fontWeight: 600 }}>Kết quả:</div>
                  {item.result}
                </div>
              )}

              {item.media.length === 0 ? (
                <div style={{ fontSize: 12, color: P.textMuted, fontStyle: 'italic' }}>
                  Không có ảnh / video đính kèm
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 12, color: P.textMuted, fontWeight: 600, marginBottom: 8 }}>
                    Hình ảnh & video đính kèm ({item.media.length})
                  </div>
                  <div style={{
                    display: 'grid', gap: 10,
                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                  }}>
                    {item.media.map(m => (
                      <MediaThumb key={m.id} m={m}
                        onOpen={() => m.kind === 'pdf' ? openPdf(m) : setPreview(m)} />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </Card>
      ))}

      {preview && <Lightbox item={preview} onClose={() => setPreview(null)} />}
    </div>
  );
}

function MediaBadge({ media }) {
  const imgs = media.filter(m => m.kind === 'image').length;
  const vids = media.filter(m => m.kind === 'video').length;
  const pdfs = media.filter(m => m.kind === 'pdf').length;
  const parts = [
    imgs ? { icon: '🖼️', n: imgs } : null,
    vids ? { icon: '🎬', n: vids } : null,
    pdfs ? { icon: '📄', n: pdfs } : null,
  ].filter(Boolean);
  return (
    <div style={{ display: 'inline-flex', gap: 6 }}>
      {parts.map((p, i) => (
        <span key={i} style={{
          padding: '3px 9px', borderRadius: 12,
          background: P.primaryLight, color: P.primary,
          fontSize: 12, fontWeight: 600, fontFamily: font,
        }}>
          {p.icon} {p.n}
        </span>
      ))}
    </div>
  );
}

function MediaThumb({ m, onOpen }) {
  return (
    <div onClick={onOpen} style={{
      position: 'relative', aspectRatio: '4 / 3',
      borderRadius: 10, overflow: 'hidden',
      background: '#000', cursor: 'zoom-in',
      border: '1px solid ' + P.border,
    }}>
      {m.kind === 'image' && (
        <img src={m.url} alt={m.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      )}
      {m.kind === 'video' && (
        <>
          <video src={m.url} muted preload="metadata"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.25)',
          }}>
            <div style={{
              width: 46, height: 46, borderRadius: '50%',
              background: 'rgba(255,255,255,0.92)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill={P.primary}>
                <polygon points="6 4 20 12 6 20 6 4" />
              </svg>
            </div>
          </div>
        </>
      )}
      {m.kind === 'pdf' && (
        <div style={{
          width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: P.primaryLight, color: P.primary,
        }}>
          <div style={{ fontSize: 40 }}>📄</div>
          <div style={{ fontSize: 12, fontWeight: 700, marginTop: 4 }}>PDF</div>
        </div>
      )}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '6px 8px', background: 'linear-gradient(180deg, rgba(0,0,0,0), rgba(0,0,0,0.75))',
        color: '#fff', fontSize: 11, fontFamily: font,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>{m.name}</div>
    </div>
  );
}

function Lightbox({ item, onClose }) {
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <button onClick={(e) => { e.stopPropagation(); onClose(); }} title="Đóng"
        style={{
          position: 'fixed', top: 14, right: 14, zIndex: 10000,
          width: 38, height: 38, borderRadius: '50%',
          background: 'rgba(255,255,255,0.15)', color: '#fff',
          border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      <div onClick={e => e.stopPropagation()}
        style={{ maxWidth: '92vw', maxHeight: '90vh', display: 'flex',
                 alignItems: 'center', justifyContent: 'center' }}>
        {item.kind === 'image'
          ? <img src={item.url} alt={item.name}
              style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain' }} />
          : <video src={item.url} controls autoPlay
              style={{ maxWidth: '100%', maxHeight: '90vh', background: '#000' }} />
        }
      </div>
      <div style={{
        position: 'fixed', bottom: 14, left: 0, right: 0, textAlign: 'center',
        color: '#fff', fontFamily: font, fontSize: 13, opacity: 0.85,
      }}>{item.name}</div>
    </div>
  );
}

function MockBanner() {
  return (
    <div style={{
      padding: '8px 12px', borderRadius: 8,
      background: '#fff7e6', border: '1px solid #ffd79d',
      color: '#8a5a00', fontSize: 12, fontFamily: font,
    }}>
      <b>Mockup UI</b> — nội dung kết quả & media là dữ liệu giả để xem UX. Chưa gọi API thật.
    </div>
  );
}
