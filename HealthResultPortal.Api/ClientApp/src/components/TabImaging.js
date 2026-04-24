import React, { useEffect, useState } from 'react';
import { P, font } from '../styles/theme';
import { Card, Spinner } from '../components/Shared';
import { ResultService } from '../services/api';
import MediaViewerModal from './MediaViewerModal';

export default function TabImaging({ result, maLuotKham }) {
  const [expanded, setExpanded] = useState(null);
  const [filesByCdid, setFilesByCdid] = useState({}); // { [idChitietChidinh]: { loading, error, items } }
  const [viewing, setViewing] = useState(null); // { id, fileName, kind, linkUrl }

  const items = result.imagingResults || [];

  const loadFiles = async (idChitietChidinh) => {
    if (!idChitietChidinh) return;
    if (filesByCdid[idChitietChidinh]?.items) return; // already loaded
    setFilesByCdid((s) => ({ ...s, [idChitietChidinh]: { loading: true, error: '', items: null } }));
    try {
      const data = await ResultService.getImagingFiles(maLuotKham, idChitietChidinh);
      setFilesByCdid((s) => ({ ...s, [idChitietChidinh]: { loading: false, error: '', items: data || [] } }));
    } catch (err) {
      setFilesByCdid((s) => ({
        ...s,
        [idChitietChidinh]: {
          loading: false,
          error: err.response?.data?.message || 'Không tải được danh sách file',
          items: [],
        },
      }));
    }
  };

  const toggle = (idx, idChitietChidinh) => {
    const next = expanded === idx ? null : idx;
    setExpanded(next);
    if (next !== null && idChitietChidinh) loadFiles(idChitietChidinh);
  };

  const openFile = (f) => {
    if (f.kind === 'link' && f.linkUrl) {
      // External link → open directly, no modal needed
      window.open(f.linkUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    setViewing(f);
  };

  if (items.length === 0) {
    return (
      <Card style={{ padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🩻</div>
        <p style={{ color: P.textDim, fontSize: 15 }}>Chưa có kết quả chẩn đoán hình ảnh</p>
      </Card>
    );
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map((item, idx) => {
          const cdid = item.idChitietChidinh;
          const state = filesByCdid[cdid];
          const isOpen = expanded === idx;
          return (
            <Card key={item.id || idx} style={{ overflow: 'hidden' }}>
              <button onClick={() => toggle(idx, cdid)} style={{
                width: '100%', padding: '16px 20px',
                background: isOpen ? P.primaryLight : 'transparent',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                fontFamily: 'inherit',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 20 }}>🩻</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: P.text }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: P.textMuted }}>{item.date}{item.doctor ? ' • ' + item.doctor : ''}</div>
                  </div>
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={P.textMuted} strokeWidth="2"
                  style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .2s' }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {isOpen && (
                <div style={{ padding: '0 20px 16px' }}>
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

                  {/* Files list */}
                  <div style={{ fontSize: 12, color: P.textMuted, fontWeight: 600, marginBottom: 8 }}>File đính kèm:</div>
                  {!cdid && (
                    <div style={{ fontSize: 13, color: P.textMuted }}>Dịch vụ chưa có mã chi tiết chỉ định.</div>
                  )}
                  {cdid && state?.loading && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: P.textMuted, fontSize: 13 }}>
                      <Spinner size={16} /> Đang tải danh sách file...
                    </div>
                  )}
                  {cdid && state?.error && (
                    <div style={{ color: '#c0392b', fontSize: 13 }}>{state.error}</div>
                  )}
                  {cdid && state?.items && state.items.length === 0 && (
                    <div style={{ fontSize: 13, color: P.textMuted }}>Chưa có file cho dịch vụ này.</div>
                  )}
                  {cdid && state?.items && state.items.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {state.items.map((f) => (
                        <FileRow key={f.id} file={f} onOpen={() => openFile(f)} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {viewing && (
        <MediaViewerModal
          maLuotKham={maLuotKham}
          file={viewing}
          onClose={() => setViewing(null)}
        />
      )}
    </>
  );
}

function FileRow({ file, onOpen }) {
  const icon = kindIcon(file.kind);
  const label = kindLabel(file.kind);
  return (
    <button onClick={onOpen} style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 14px', borderRadius: 8,
      background: P.white, border: '1px solid ' + P.border,
      cursor: 'pointer', fontFamily: font, textAlign: 'left',
    }}>
      <span style={{ fontSize: 22 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 600, color: P.text,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {file.fileName || `file_${file.id}`}
        </div>
        <div style={{ fontSize: 11, color: P.textMuted }}>
          {label}{file.ngayTao ? ' • ' + file.ngayTao : ''}{file.nguoiTao ? ' • ' + file.nguoiTao : ''}
        </div>
      </div>
      <span style={{ color: P.primary, fontSize: 12, fontWeight: 600 }}>Xem</span>
    </button>
  );
}

function kindIcon(kind) {
  switch ((kind || '').toLowerCase()) {
    case 'pdf': return '📄';
    case 'image': return '🖼️';
    case 'video': return '🎬';
    case 'link': return '🔗';
    default: return '📎';
  }
}

function kindLabel(kind) {
  switch ((kind || '').toLowerCase()) {
    case 'pdf': return 'Tài liệu PDF';
    case 'image': return 'Hình ảnh';
    case 'video': return 'Video';
    case 'link': return 'Đường dẫn ngoài';
    default: return 'File';
  }
}
