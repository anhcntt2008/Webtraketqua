import React, { useEffect, useState, useCallback } from 'react';
import { P, font, mono } from '../styles/theme';
import { Card, Spinner } from '../components/Shared';
import { UserAdminService } from '../services/api';

const PAGE_SIZE = 20;

export default function AdminUsersPage({ onBack }) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetTarget, setResetTarget] = useState(null); // UserSummary

  const load = useCallback(async (nextPage = page, q = search) => {
    setLoading(true); setError('');
    try {
      const data = await UserAdminService.list(q, nextPage, PAGE_SIZE);
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { load(1, ''); /* initial */ }, []); // eslint-disable-line

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load(1, search);
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const go = (p) => { if (p >= 1 && p <= totalPages) { setPage(p); load(p, search); } };

  return (
    <div style={{ minHeight: '100vh', background: P.bg, fontFamily: font, color: P.text }}>
      <header style={{
        position: 'sticky', top: 0, zIndex: 10, background: P.headerBg,
        borderBottom: '2px solid ' + P.primaryDark, padding: '12px 24px',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <button onClick={onBack} title="Quay lại" style={{
          width: 36, height: 36, borderRadius: 8,
          background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
          color: P.headerText, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div style={{ fontSize: 15, fontWeight: 700, color: P.headerText }}>Quản trị người dùng</div>
      </header>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 20px' }}>
        <Card style={{ padding: 20, marginBottom: 16 }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo SĐT hoặc tên bệnh nhân..."
              style={{
                flex: 1, padding: '10px 12px', borderRadius: 8,
                border: '1px solid ' + P.border, background: P.inputBg,
                fontFamily: font, fontSize: 14, color: P.text, outline: 'none',
              }}
            />
            <button type="submit" style={{
              padding: '10px 18px', borderRadius: 8,
              background: P.primary, color: P.white, border: 'none', cursor: 'pointer',
              fontFamily: font, fontSize: 14, fontWeight: 600,
            }}>Tìm</button>
          </form>
        </Card>

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spinner size={36} /><p style={{ marginTop: 12, color: P.textDim }}>Đang tải...</p>
          </div>
        )}

        {!loading && error && (
          <Card style={{ padding: 20, textAlign: 'center', color: P.danger }}>{error}</Card>
        )}

        {!loading && !error && items.length === 0 && (
          <Card style={{ padding: 40, textAlign: 'center', color: P.textDim }}>Không có kết quả</Card>
        )}

        {!loading && !error && items.length > 0 && (
          <Card style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: P.primaryLight, color: P.primary, textAlign: 'left' }}>
                  <th style={{ padding: '12px 14px' }}>Số điện thoại</th>
                  <th style={{ padding: '12px 14px' }}>Họ tên</th>
                  <th style={{ padding: '12px 14px' }}>ID BN</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {items.map(u => (
                  <tr key={u.dienThoai} style={{ borderTop: '1px solid ' + P.border }}>
                    <td style={{ padding: '12px 14px', fontFamily: mono }}>
                      {u.dienThoai}
                      {u.isAdmin && <span style={{
                        marginLeft: 8, padding: '2px 8px', borderRadius: 10,
                        background: P.primary, color: P.white, fontSize: 11, fontFamily: font,
                      }}>ADMIN</span>}
                    </td>
                    <td style={{ padding: '12px 14px' }}>{u.tenBenhNhan}</td>
                    <td style={{ padding: '12px 14px', fontFamily: mono, color: P.textDim }}>{u.idBenhNhan}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <button onClick={() => setResetTarget(u)} style={{
                        padding: '6px 12px', borderRadius: 6,
                        background: P.primaryLight, color: P.primary,
                        border: '1px solid ' + P.primary + '40', cursor: 'pointer',
                        fontFamily: font, fontSize: 13, fontWeight: 600,
                      }}>Reset MK</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {!loading && totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 16 }}>
            <button onClick={() => go(page - 1)} disabled={page <= 1} style={pgBtn(page > 1)}>‹</button>
            <span style={{ padding: '8px 12px', color: P.textDim, fontSize: 13 }}>
              Trang {page} / {totalPages} ({total} user)
            </span>
            <button onClick={() => go(page + 1)} disabled={page >= totalPages} style={pgBtn(page < totalPages)}>›</button>
          </div>
        )}
      </div>

      {resetTarget && (
        <ResetDialog
          user={resetTarget}
          onClose={() => setResetTarget(null)}
          onDone={() => { setResetTarget(null); load(page, search); }}
        />
      )}
    </div>
  );
}

function ResetDialog({ user, onClose, onDone }) {
  const [pwd, setPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (pwd.length < 6) { setErr('Mật khẩu mới phải có ít nhất 6 ký tự'); return; }
    if (pwd !== confirm) { setErr('Xác nhận mật khẩu không khớp'); return; }
    setSaving(true);
    try {
      await UserAdminService.resetPassword(user.dienThoai, pwd);
      onDone();
    } catch (e2) {
      setErr(e2.response?.data?.message || 'Không thể reset mật khẩu');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: P.card, borderRadius: 12, width: '92%', maxWidth: 420, padding: 24,
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
      }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: P.text, marginBottom: 6 }}>
          Reset mật khẩu
        </div>
        <div style={{ fontSize: 13, color: P.textDim, marginBottom: 16 }}>
          Tài khoản: <b style={{ fontFamily: mono }}>{user.dienThoai}</b> — {user.tenBenhNhan}
        </div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input type="password" value={pwd} onChange={e => setPwd(e.target.value)}
                 placeholder="Mật khẩu mới (≥ 6 ký tự)" required minLength={6}
                 autoFocus style={dlgInput} />
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                 placeholder="Xác nhận mật khẩu mới" required minLength={6} style={dlgInput} />
          {err && <div style={{ color: P.danger, fontSize: 13 }}>{err}</div>}
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <button type="button" onClick={onClose} disabled={saving} style={{
              flex: 1, padding: '10px 0', borderRadius: 8,
              background: P.inputBg, color: P.text, border: '1px solid ' + P.border,
              cursor: 'pointer', fontFamily: font, fontSize: 14, fontWeight: 600,
            }}>Huỷ</button>
            <button type="submit" disabled={saving} style={{
              flex: 1, padding: '10px 0', borderRadius: 8,
              background: saving ? P.primaryDark : P.primary, color: P.white, border: 'none',
              cursor: saving ? 'wait' : 'pointer', fontFamily: font, fontSize: 14, fontWeight: 600,
            }}>{saving ? 'Đang lưu...' : 'Reset'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const pgBtn = (active) => ({
  padding: '8px 14px', borderRadius: 8,
  background: active ? P.card : '#eef2f6',
  color: active ? P.primary : P.textMuted,
  border: '1px solid ' + P.border,
  cursor: active ? 'pointer' : 'not-allowed',
  fontFamily: font, fontSize: 14, fontWeight: 600,
});

const dlgInput = {
  width: '100%', padding: '10px 12px', borderRadius: 8,
  border: '1px solid ' + P.border, background: P.inputBg,
  fontFamily: font, fontSize: 14, color: P.text, outline: 'none',
  boxSizing: 'border-box',
};
