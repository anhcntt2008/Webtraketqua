import React, { useRef, useState } from 'react';
import { P, font } from '../styles/theme';
import { Card } from '../components/Shared';

/**
 * MOCKUP — dùng để preview UX cho CDHA:
 *  - Kết quả hình ảnh giờ có id_file → hiển thị nút "Xem" giống Tab File
 *  - Khu vực upload ảnh + video (drag & drop / chọn file)
 *  - Lưới thumbnail ảnh/video đã chọn (preview trực tiếp từ object URL)
 *
 * Chưa gọi API thật — giữ file trong state + URL.createObjectURL để demo.
 * Sau khi bạn chốt UX, t sẽ thay mock bằng API thật (upload + list).
 */

const MOCK_ITEMS = [
  {
    id: 1, idFile: 2001,
    name: 'Chụp X-quang phổi thẳng',
    date: '13/02/2026 09:15', doctor: 'BS. Nguyễn Văn A',
    result: 'Nhu mô phổi 2 bên không thấy tổn thương khu trú. Bóng tim kích thước bình thường.',
  },
  {
    id: 2, idFile: 2002,
    name: 'Siêu âm ổ bụng tổng quát',
    date: '13/02/2026 10:02', doctor: 'BS. Trần Thị B',
    result: 'Gan, lách, thận 2 bên kích thước bình thường. Không thấy dịch ổ bụng.',
  },
  {
    id: 3, idFile: null, // chưa gắn file → không có nút Xem
    name: 'Điện tâm đồ (ECG)',
    date: '13/02/2026 10:35', doctor: 'BS. Lê Văn C',
    result: 'Nhịp xoang đều 78 lần/phút. Trục trung gian.',
  },
];

const ACCEPT = 'image/jpeg,image/png,image/webp,video/mp4,video/quicktime';
const MAX_SIZE_MB = 50;

export default function TabImagingMockup({ result }) {
  const [expanded, setExpanded] = useState(0);
  const [uploads, setUploads] = useState([]); // { id, name, type, sizeMB, url, file }
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(null); // upload item
  const inputRef = useRef(null);

  const addFiles = (fileList) => {
    const files = Array.from(fileList || []);
    const added = files
      .filter(f => f.type.startsWith('image/') || f.type.startsWith('video/'))
      .filter(f => f.size <= MAX_SIZE_MB * 1024 * 1024)
      .map(f => ({
        id: crypto.randomUUID(),
        name: f.name,
        type: f.type,
        sizeMB: (f.size / 1024 / 1024).toFixed(2),
        url: URL.createObjectURL(f),
        file: f,
      }));
    if (added.length !== files.length) {
      alert(`Đã bỏ qua ${files.length - added.length} file (sai định dạng hoặc > ${MAX_SIZE_MB}MB)`);
    }
    setUploads(prev => [...prev, ...added]);
  };

  const removeUpload = (id) => {
    setUploads(prev => {
      const target = prev.find(x => x.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter(x => x.id !== id);
    });
  };

  const handleViewImagingFile = (item) => {
    // MOCKUP: thật sự sẽ mở PdfViewerModal với item.idFile
    alert(`[Mockup] sẽ gọi GET /api/results/${result?.patient?.pid || '...'}/files/${item.idFile}\nvà mở trong PdfViewerModal.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <MockBanner />

      {/* ============ SECTION 1: Kết quả CĐHA đã có trong HIS ============ */}
      <SectionTitle icon="🩻" text={`Kết quả chẩn đoán hình ảnh (${MOCK_ITEMS.length})`} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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
                {item.idFile ? (
                  <span onClick={(e) => { e.stopPropagation(); handleViewImagingFile(item); }}
                    style={{
                      padding: '6px 12px', borderRadius: 8,
                      background: P.white, border: '1px solid ' + P.primary + '50',
                      color: P.primary, fontSize: 13, fontWeight: 600,
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                    }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    Xem
                  </span>
                ) : (
                  <span style={{ fontSize: 11, color: P.textMuted, fontStyle: 'italic' }}>Không có file</span>
                )}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={P.textMuted} strokeWidth="2"
                  style={{ transform: expanded === idx ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .2s' }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </button>
            {expanded === idx && (
              <div style={{ padding: '0 18px 14px' }}>
                <div style={{
                  padding: '12px 16px', borderRadius: 8,
                  background: P.bg, border: '1px solid ' + P.border,
                  fontSize: 13, color: P.text, lineHeight: 1.7,
                }}>
                  <div style={{ fontSize: 12, color: P.textMuted, marginBottom: 6, fontWeight: 600 }}>Kết quả:</div>
                  {item.result}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* ============ SECTION 2: Upload ảnh + video ============ */}
      <SectionTitle icon="📤" text="Tải lên ảnh / video bổ sung" />

      <Card
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
        style={{
          padding: '28px 20px',
          borderStyle: 'dashed', borderWidth: 2,
          borderColor: dragOver ? P.primary : P.primary + '50',
          background: dragOver ? P.primaryLight : P.white,
          textAlign: 'center', transition: 'all .15s',
        }}
      >
        <div style={{ fontSize: 36, marginBottom: 6 }}>☁️</div>
        <div style={{ fontSize: 14, color: P.text, fontWeight: 600 }}>Kéo & thả file vào đây</div>
        <div style={{ fontSize: 12, color: P.textMuted, margin: '4px 0 12px' }}>
          hoặc click nút bên dưới — JPG/PNG/WEBP/MP4/MOV, tối đa {MAX_SIZE_MB}MB/file
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          style={{
            padding: '10px 20px', borderRadius: 8,
            background: P.primary, color: P.white, border: 'none',
            cursor: 'pointer', fontFamily: font, fontSize: 14, fontWeight: 600,
          }}
        >
          Chọn file
        </button>
        <input
          ref={inputRef} type="file" multiple accept={ACCEPT}
          style={{ display: 'none' }}
          onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }}
        />
      </Card>

      {uploads.length > 0 && (
        <>
          <SectionTitle icon="🖼️" text={`Đã chọn (${uploads.length})`} />
          <div style={{
            display: 'grid', gap: 10,
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          }}>
            {uploads.map(u => (
              <Card key={u.id} style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
                <div
                  onClick={() => setPreview(u)}
                  style={{
                    aspectRatio: '4 / 3',
                    background: '#000',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'zoom-in', overflow: 'hidden',
                  }}
                >
                  {u.type.startsWith('image/') ? (
                    <img src={u.url} alt={u.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <video src={u.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                  )}
                </div>
                <button
                  onClick={() => removeUpload(u.id)}
                  title="Xoá"
                  style={{
                    position: 'absolute', top: 6, right: 6,
                    width: 26, height: 26, borderRadius: '50%',
                    background: 'rgba(0,0,0,0.6)', color: '#fff',
                    border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
                <div style={{ padding: '8px 10px' }}>
                  <div style={{
                    fontSize: 12, fontWeight: 600, color: P.text,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{u.name}</div>
                  <div style={{ fontSize: 11, color: P.textMuted, marginTop: 2 }}>
                    {u.type.startsWith('video/') ? '🎬' : '🖼️'} {u.sizeMB} MB
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <button
            onClick={() => alert('[Mockup] sẽ upload ' + uploads.length + ' file lên /api/results/{maLuotKham}/upload')}
            style={{
              marginTop: 4, padding: '12px 0', borderRadius: 10,
              background: P.primary, color: P.white, border: 'none',
              cursor: 'pointer', fontFamily: font, fontSize: 14, fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Gửi {uploads.length} file lên máy chủ
          </button>
        </>
      )}

      {preview && <PreviewModal item={preview} onClose={() => setPreview(null)} />}
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
      <b>Mockup UI</b> — nội dung kết quả & file upload là dữ liệu giả để xem UX. Chưa gọi API thật.
    </div>
  );
}

function SectionTitle({ icon, text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span style={{ fontSize: 14, fontWeight: 700, color: P.primary }}>{text}</span>
    </div>
  );
}

function PreviewModal({ item, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        title="Đóng"
        style={{
          position: 'fixed', top: 14, right: 14, zIndex: 10000,
          width: 38, height: 38, borderRadius: '50%',
          background: 'rgba(255,255,255,0.12)', color: '#fff',
          border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      <div onClick={e => e.stopPropagation()} style={{
        maxWidth: '92vw', maxHeight: '90vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {item.type.startsWith('image/') ? (
          <img src={item.url} alt={item.name} style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain' }} />
        ) : (
          <video src={item.url} controls autoPlay style={{ maxWidth: '100%', maxHeight: '90vh' }} />
        )}
      </div>
    </div>
  );
}
