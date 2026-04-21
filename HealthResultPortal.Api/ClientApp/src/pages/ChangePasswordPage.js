import React, { useState } from 'react';
import { P, font } from '../styles/theme';
import { Card, Spinner } from '../components/Shared';
import { AuthService } from '../services/api';

export default function ChangePasswordPage({ user, onBack }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
      return;
    }
    if (newPassword !== confirm) {
      setMessage({ type: 'error', text: 'Xác nhận mật khẩu không khớp' });
      return;
    }
    setSaving(true);
    try {
      await AuthService.changePassword(oldPassword, newPassword);
      setMessage({ type: 'success', text: 'Đổi mật khẩu thành công' });
      setOldPassword(''); setNewPassword(''); setConfirm('');
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Không thể đổi mật khẩu' });
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 8,
    border: '1px solid ' + P.border, background: P.inputBg,
    fontFamily: font, fontSize: 14, color: P.text, outline: 'none',
    boxSizing: 'border-box',
  };

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
        <div style={{ fontSize: 15, fontWeight: 700, color: P.headerText }}>Đổi mật khẩu</div>
      </header>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 20px' }}>
        <Card style={{ padding: 24 }}>
          <div style={{ marginBottom: 16, fontSize: 13, color: P.textDim }}>
            Tài khoản: <b>{user.dienThoai}</b>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 13, color: P.textDim }}>Mật khẩu hiện tại</span>
              <input type="password" value={oldPassword}
                     onChange={e => setOldPassword(e.target.value)}
                     autoComplete="current-password" required style={inputStyle} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 13, color: P.textDim }}>Mật khẩu mới (ít nhất 6 ký tự)</span>
              <input type="password" value={newPassword}
                     onChange={e => setNewPassword(e.target.value)}
                     autoComplete="new-password" required minLength={6} style={inputStyle} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 13, color: P.textDim }}>Xác nhận mật khẩu mới</span>
              <input type="password" value={confirm}
                     onChange={e => setConfirm(e.target.value)}
                     autoComplete="new-password" required minLength={6} style={inputStyle} />
            </label>

            {message && (
              <div style={{
                padding: '10px 12px', borderRadius: 8, fontSize: 13,
                background: message.type === 'success' ? '#e6f7ec' : '#fde7ea',
                color: message.type === 'success' ? P.success : P.danger,
                border: '1px solid ' + (message.type === 'success' ? '#b4e2c7' : '#f4c2c8'),
              }}>{message.text}</div>
            )}

            <button type="submit" disabled={saving} style={{
              marginTop: 8, padding: '12px 0', borderRadius: 8,
              background: saving ? P.primaryDark : P.primary,
              color: P.white, border: 'none', cursor: saving ? 'wait' : 'pointer',
              fontFamily: font, fontSize: 14, fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              {saving ? <Spinner size={16} color={P.white} /> : null}
              {saving ? 'Đang lưu...' : 'Đổi mật khẩu'}
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}
