import React, { useState } from 'react';
import { P, font, mono } from '../styles/theme';
import { Spinner } from '../components/Shared';
import { AuthService } from '../services/api'; 
import logo from '../assets/logo.png';

/* ========== SVG Illustrations ========== */
const NutritionIllustration = () => (
  <svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', maxWidth: 360 }}>
    {/* Stethoscope */}
    <path d="M160 80 C160 40, 240 40, 240 80 L240 160 C240 200, 280 220, 280 260 C280 290, 260 310, 230 310 C200 310, 180 290, 180 260" 
          stroke="rgba(255,255,255,0.6)" strokeWidth="4" fill="none" strokeLinecap="round"/>
    <circle cx="160" cy="80" r="12" fill="rgba(255,255,255,0.4)"/>
    <circle cx="240" cy="80" r="12" fill="rgba(255,255,255,0.4)"/>
    <circle cx="230" cy="310" r="16" fill="rgba(255,255,255,0.3)" stroke="rgba(255,255,255,0.5)" strokeWidth="2"/>
    {/* Apple (nutrition) */}
    <ellipse cx="100" cy="220" rx="35" ry="40" fill="rgba(0,166,81,0.4)"/>
    <path d="M100 180 C100 170, 110 165, 115 170" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" fill="none"/>
    <ellipse cx="95" cy="215" rx="8" ry="10" fill="rgba(255,255,255,0.12)"/>
    {/* Leaf */}
    <path d="M115 175 Q140 160 130 185 Q120 190 115 175Z" fill="rgba(0,166,81,0.5)"/>
    {/* Chart / growth line */}
    <polyline points="280,200 300,180 320,190 340,160 360,140" 
             stroke="rgba(255,255,255,0.4)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="280" cy="200" r="4" fill="rgba(255,255,255,0.5)"/>
    <circle cx="300" cy="180" r="4" fill="rgba(255,255,255,0.5)"/>
    <circle cx="320" cy="190" r="4" fill="rgba(255,255,255,0.5)"/>
    <circle cx="340" cy="160" r="4" fill="rgba(255,255,255,0.5)"/>
    <circle cx="360" cy="140" r="4" fill="rgba(255,255,255,0.5)"/>
    {/* Heart rate */}
    <polyline points="40,140 60,140 70,120 80,160 90,130 100,140 120,140" 
             stroke="rgba(255,255,255,0.35)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    {/* Small decorative circles */}
    <circle cx="50" cy="260" r="20" fill="rgba(255,255,255,0.06)"/>
    <circle cx="320" cy="260" r="30" fill="rgba(255,255,255,0.05)"/>
    <circle cx="350" cy="90" r="15" fill="rgba(255,255,255,0.06)"/>
  </svg>
);

const VDDLogo = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 48, height: 48 }}>
    <rect width="48" height="48" rx="12" fill="rgba(255,255,255,0.2)"/>
    <path d="M24 8L24 14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M14 18h20v16a8 8 0 01-8 8h-4a8 8 0 01-8-8V18z" fill="rgba(255,255,255,0.25)" stroke="white" strokeWidth="2"/>
    <path d="M18 14h12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="24" cy="28" r="4" fill="rgba(255,255,255,0.4)"/>
    <path d="M22 28l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function LoginPage({ onLogin }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const doLogin = async () => {
    if (!phone.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ số điện thoại và mật khẩu');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await AuthService.login(phone.trim(), password);
      onLogin(data.user);
    } catch (err) {
      if (!err.response) {
        setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
      } else {
        setError(err.response?.data?.message || 'Số điện thoại hoặc mật khẩu không chính xác');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    padding: '13px 16px 13px 46px',
    background: P.inputBg, border: '1px solid ' + P.border,
    borderRadius: 10, color: P.text, fontSize: 15,
    fontFamily: font, outline: 'none', transition: 'border-color .25s, box-shadow .25s',
  };

  const focusStyle = (e) => {
    e.target.style.borderColor = P.primary;
    e.target.style.boxShadow = '0 0 0 3px rgba(0,114,188,0.1)';
  };
  const blurStyle = (e) => {
    e.target.style.borderColor = P.border;
    e.target.style.boxShadow = 'none';
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      fontFamily: font,
    }}>

      {/* ========== LEFT PANEL — Branded ========== */}
      <div className="login-left-panel" style={{
        flex: '0 0 45%', minHeight: '100vh',
        background: `linear-gradient(135deg, ${P.primaryDark} 0%, ${P.primary} 40%, #91b9cf 100%)`,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        padding: '60px 40px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: -60, left: -60,
          width: 200, height: 200, borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
        }}/>
        <div style={{
          position: 'absolute', bottom: -80, right: -80,
          width: 300, height: 300, borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)',
        }}/>
        <div style={{
          position: 'absolute', top: '30%', right: -40,
          width: 120, height: 120, borderRadius: '50%',
          background: 'rgba(0,166,81,0.1)',
        }}/>

        {/* Logo + Text */}
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 400 }}>
          <div style={{ marginBottom: 24 }}>
            {/* <VDDLogo  />  */}
            <img src={logo} style={{ width: 300 }} />
          </div>

          <h1 style={{
            fontSize: 26, fontWeight: 700, color: '#ffffff',
            margin: '0 0 4px', letterSpacing: 1, textTransform: 'uppercase',
          }}>
            VIỆN DINH DƯỠNG
          </h1>
          <p style={{
            fontSize: 13, color: 'rgba(255,255,255,0.7)',
            letterSpacing: 2, textTransform: 'uppercase', fontWeight: 400,
            marginBottom: 8,
          }}>
            National Institute of Nutrition
          </p>
          <div style={{
            width: 50, height: 2, background: 'rgba(255,255,255,0.3)',
            margin: '16px auto 24px', borderRadius: 1,
          }}/>
          <p style={{
            fontSize: 16, color: 'rgba(255,255,255,0.85)',
            lineHeight: 1.7, fontWeight: 300,
          }}>
            Cổng thông tin tra cứu<br/>kết quả khám bệnh trực tuyến
          </p>

          {/* Illustration */}
          <div style={{ marginTop: 36 }}>
            <NutritionIllustration />
          </div>

          {/* Footer info */}
          <div style={{
            marginTop: 32, fontSize: 12, color: 'rgba(255,255,255,0.45)',
            lineHeight: 1.6,
          }}>
            48B Tăng Bạt Hổ, Hai Bà Trưng, Hà Nội<br/>
            Hotline: (024) 3971 7090
          </div>
        </div>
      </div>

      {/* ========== RIGHT PANEL — Login Form ========== */}
      <div className="login-right-panel" style={{
        flex: 1, minHeight: '100vh',
        background: P.bg,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        padding: '40px 32px',
      }}>
        <div style={{ width: '100%', maxWidth: 400,  }}>
           <div style={{ marginBottom: 0 , textAlign: 'center',justifyContent: 'center'}}>
            {/* <VDDLogo  />  */}
            <img src={logo} style={{ width: 200 }} />
          </div>
          {/* Welcome text */}
          <div style={{ marginBottom: 36 , textAlign: 'center',justifyContent: 'center'}}>
            <h2 style={{
              fontSize: 30, fontWeight: 700, color: P.text, 
              margin: '0 0 8px',
            }}>
              ĐĂNG NHẬP TRA CỨU
            </h2>
            <p style={{ fontSize: 14, color: P.textMuted, margin: 0, lineHeight: 1.5 }}>
              Nhập số điện thoại và mật khẩu đã được cung cấp tại quầy tiếp nhận để xem kết quả khám.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Phone */}
            <div>
              <label style={{  display: 'block', fontSize: 20, color: P.textDim, marginBottom: 7, fontWeight: 800 }}>
                Số điện thoại
              </label>
              <div style={{ position: 'relative' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={P.textMuted} strokeWidth="2"
                  style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <input
                  type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="VD: 0912345678" style={inputStyle}
                  onFocus={focusStyle} onBlur={blurStyle}
                  onKeyDown={e => e.key === 'Enter' && doLogin()}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: 20,  color: P.textDim, marginBottom: 7, fontWeight: 600 }}>
                Mật khẩu
              </label>
              <div style={{ position: 'relative' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={P.textMuted} strokeWidth="2"
                  style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  type={showPass ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="Nhập mật khẩu"
                  style={{ ...inputStyle, paddingRight: 44 }}
                  onFocus={focusStyle} onBlur={blurStyle}
                  onKeyDown={e => e.key === 'Enter' && doLogin()}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                  color: P.textMuted, fontSize: 13,
                }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                padding: '11px 14px', borderRadius: 8,
                background: '#fde8e8', border: '1px solid #f5c6cb',
                color: P.danger, fontSize: 13, fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                {error}
              </div>
            )}

            {/* Submit */}
            <button onClick={doLogin} disabled={loading} style={{
              width: '100%', padding: '14px 0', borderRadius: 10,
              background: loading ? P.primaryDark : `linear-gradient(135deg, ${P.primary}, ${P.primaryDark})`,
              color: P.white, fontSize: 15, fontWeight: 700, border: 'none',
              cursor: loading ? 'wait' : 'pointer', fontFamily: font,
              boxShadow: '0 4px 16px rgba(0,114,188,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all .2s',
              marginTop: 4,
            }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,114,188,0.35)'; }}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,114,188,0.25)'}
            >
              {loading && <Spinner size={20} color={P.white} />}
              {loading ? 'Đang xác thực...' : 'Đăng nhập'}
            </button>
          </div>

          {/* Divider */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            margin: '28px 0 20px',
          }}>
            {/* <div style={{ flex: 1, height: 1, background: P.border }}/>
            <span style={{ fontSize: 12, color: P.textMuted, fontWeight: 500 }}>Hướng dẫn</span>
            <div style={{ flex: 1, height: 1, background: P.border }}/> */}
          </div>

          {/* Info cards
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{
              padding: '12px 16px', borderRadius: 10,
              background: P.white, border: '1px solid ' + P.border,
              display: 'flex', alignItems: 'center', gap: 12,
              fontSize: 13, color: P.textDim,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: P.primaryLight, display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={P.primary} strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              Sử dụng <strong style={{ color: P.text }}>số điện thoại</strong> đã đăng ký tại quầy tiếp nhận
            </div>

            <div style={{
              padding: '12px 16px', borderRadius: 10,
              background: P.white, border: '1px solid ' + P.border,
              display: 'flex', alignItems: 'center', gap: 12,
              fontSize: 13, color: P.textDim,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: '#e8f8ef', display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={P.accent} strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              Mật khẩu được cấp khi đăng ký tài khoản tra cứu
            </div>
          </div> */}

          {/* Footer */}
          <div style={{
            marginTop: 32, textAlign: 'center', fontSize: 12, color: P.textMuted,
            lineHeight: 1.5,
          }}>
           Copyright © 2026 Viện Dinh Dưỡng Quốc Gia — Vietnam National Institute of Nutrition
          </div>
        </div>
      </div>

    </div>
  );
}
