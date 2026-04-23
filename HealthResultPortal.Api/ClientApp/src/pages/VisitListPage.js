import React, { useState, useEffect } from 'react';
import { P, font, mono } from '../styles/theme';
import { Spinner, Card } from '../components/Shared';
import { VisitService } from '../services/api';

export default function VisitListPage({ user, onLogout, onSelectVisit, onChangePassword, onOpenAdmin }) {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await VisitService.getVisits(user.idBenhNhan);
        if (!cancelled) setVisits(data || []);
      } catch (err) {
        if (!cancelled) {
          if (!err.response) {
            setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
          } else if (err.response?.status === 401) {
            setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
          } else if (err.response?.status === 403) {
            setError('Bạn không có quyền xem dữ liệu này.');
          } else {
            setError('Không thể tải danh sách lượt khám. ' + (err.response?.data?.message || ''));
          }
        }
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user.idBenhNhan]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
  };

  return (
    <div style={{ minHeight: '100vh', background: P.bg, fontFamily: font, color: P.text }}>

      {/* Header — Blue bar like viendinhduong.vn */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: P.headerBg,
        borderBottom: '2px solid ' + P.primaryDark, padding: '12px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,114,188,0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: P.headerText }}>VIỆN DINH DƯỠNG</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>Danh sách lượt khám</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, color: P.headerText }}>{user.tenBenhNhan}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{user.dienThoai}</div>
          </div>
          {user.isAdmin && (
            <button onClick={onOpenAdmin} title="Quản trị người dùng" style={{
              width: 36, height: 36, borderRadius: 8,
              background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
              color: P.headerText, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .2s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </button>
          )}
          <button onClick={onChangePassword} title="Đổi mật khẩu" style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
            color: P.headerText, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .2s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </button>
          <button onClick={onLogout} title="Đăng xuất" style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
            color: P.headerText, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background .2s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </header>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 920, margin: '0 auto', padding: '24px 20px 60px' }}>

        {/* Welcome banner */}
        <Card style={{ padding: '24px 28px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 50, height: 50, borderRadius: '50%',
              background: P.primaryLight,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, fontWeight: 700, color: P.primary,
            }}>{(user.tenBenhNhan || '?')[0]}</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: P.text }}>{user.tenBenhNhan}</div>
              <div style={{ fontSize: 13, color: P.textMuted }}>
                SĐT: <span style={{ fontFamily: mono, color: P.textDim }}>{user.dienThoai}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Section title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 18 }}>📋</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: P.primary }}>Chọn lượt khám để xem kết quả</span>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Spinner size={40} />
            <p style={{ color: P.textDim, marginTop: 16, fontSize: 14 }}>Đang tải danh sách...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <Card style={{ padding: '40px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
            <p style={{ color: P.danger, fontSize: 15 }}>{error}</p>
          </Card>
        )}

        {/* Empty */}
        {!loading && !error && visits.length === 0 && (
          <Card style={{ padding: '40px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
            <p style={{ color: P.textDim, fontSize: 15 }}>Chưa có lượt khám nào</p>
          </Card>
        )}

        {/* Visit list */}
        {!loading && !error && visits.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {visits.map((v, idx) => (
              <Card
                key={v.maLuotKham || idx}
                style={{
                  padding: '18px 24px',
                  cursor: 'pointer',
                  transition: 'border-color .2s, box-shadow .2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}
                onClick={() => onSelectVisit(v.maLuotKham)}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = P.primary;
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,114,188,0.1)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = P.border;
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {/* Số thứ tự */}
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: P.primaryLight, border: '1px solid ' + P.primary + '30',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, fontWeight: 700, color: P.primary, fontFamily: mono,
                  }}>{idx + 1}</div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: P.text, fontFamily: mono }}>{v.maLuotKham}</span>
                    </div>
                    <div style={{ fontSize: 13, color: P.textMuted, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.6 }}>
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      {formatDate(v.ngayTiepDon)}
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={P.textMuted} strokeWidth="2" style={{ flexShrink: 0 }}>
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
