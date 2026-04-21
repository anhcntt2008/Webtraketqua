import React, { useState } from 'react';
import { P, font, mono } from '../styles/theme';

// Subtle animated background (light particles)
export function ParticleBG() {
  const [pts] = useState(() =>
    Array.from({ length: 12 }, (_, i) => ({
      w: 4 + Math.random() * 8,
      l: Math.random() * 100,
      t: Math.random() * 100,
      c: [P.primary, P.accent, P.primaryDark][i % 3],
      d: 5 + Math.random() * 8,
      dl: Math.random() * 5,
    }))
  );
  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
      {pts.map((p, i) => (
        <div key={i} style={{
          position: 'absolute', width: p.w, height: p.w, borderRadius: '50%',
          left: p.l + '%', top: p.t + '%', background: p.c, filter: 'blur(2px)',
          animation: `float ${p.d}s ease-in-out infinite`, animationDelay: p.dl + 's',
        }} />
      ))}
    </div>
  );
}

export function Spinner({ size = 28, color = P.primary }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ animation: 'spin 1s linear infinite' }}>
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="3" fill="none"
        strokeDasharray="31.4 31.4" strokeLinecap="round" />
    </svg>
  );
}

export function Badge({ status }) {
  const cfg = {
    normal: { bg: '#e8f8ef', c: P.success, l: 'Bình thường' },
    high: { bg: '#fde8e8', c: P.danger, l: 'Cao' },
    low: { bg: '#fef3e2', c: P.warning, l: 'Thấp' },
    completed: { bg: '#e8f8ef', c: P.success, l: 'Hoàn tất' },
    pending: { bg: '#fef3e2', c: P.warning, l: 'Đang xử lý' },
  };
  const s = cfg[status] || { bg: '#e8f8ef', c: P.success, l: status };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 10px', borderRadius: 20,
      background: s.bg, color: s.c, fontSize: 12, fontWeight: 600, fontFamily: font,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.c }} />
      {s.l}
    </span>
  );
}

export function FileIcon({ type }) {
  const cl = { pdf: '#dc3545', dicom: '#3b82f6' }[type] || '#6b7280';
  const lb = { pdf: 'PDF', dicom: 'DCM' }[type] || 'FILE';
  return (
    <div style={{
      width: 40, height: 44, borderRadius: 6,
      background: cl + '12', border: '1px solid ' + cl + '30',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontSize: 9, fontWeight: 700, color: cl, fontFamily: mono,
    }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
      {lb}
    </div>
  );
}

export function Card({ children, style, ...rest }) {
  return (
    <div style={{
      background: P.card,
      border: '1px solid ' + P.border, borderRadius: 14,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      ...style,
    }} {...rest}>
      {children}
    </div>
  );
}

export function SectionTitle({ icon, title, color = P.primary }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span style={{ fontSize: 15, fontWeight: 700, color }}>{title}</span>
    </div>
  );
}

export function InfoRow({ label, value, useMono }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '8px 0', borderBottom: '1px solid ' + P.border + '66',
    }}>
      <span style={{ fontSize: 13, color: P.textMuted }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: P.text, fontFamily: useMono ? mono : font }}>{value}</span>
    </div>
  );
}
