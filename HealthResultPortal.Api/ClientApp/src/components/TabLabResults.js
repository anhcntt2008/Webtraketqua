import React, { useState } from 'react';
import { P, mono } from '../styles/theme';
import { Card, Badge } from '../components/Shared';

export default function TabLabResults({ result }) {
  const [expandedCat, setExpandedCat] = useState(0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {result.categories.map((cat, ci) => (
        <Card key={ci} style={{ overflow: 'hidden' }}>
          <button onClick={() => setExpandedCat(expandedCat === ci ? null : ci)} style={{
            width: '100%', padding: '16px 20px',
            background: expandedCat === ci ? P.primaryLight : 'transparent',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontFamily: 'inherit',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>{cat.icon}</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: P.text }}>{cat.name}</span>
              <span style={{
                fontSize: 11, color: P.textMuted,
                background: P.bg, padding: '2px 8px', borderRadius: 6,
              }}>{cat.tests.length} chỉ số</span>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={P.textMuted} strokeWidth="2"
              style={{ transform: expandedCat === ci ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .2s' }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {expandedCat === ci && (
            <div style={{ padding: '0 20px 16px', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid ' + P.border }}>
                    {['Chỉ số', 'Kết quả', 'Đơn vị', 'Tham chiếu', 'Đánh giá'].map(h => (
                      <th key={h} style={{
                        padding: '10px 12px', textAlign: 'left',
                        color: P.textMuted, fontWeight: 600, fontSize: 11,
                        textTransform: 'uppercase', letterSpacing: .5,
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cat.tests.map((t, ti) => (
                    <tr key={ti} style={{
                      borderBottom: ti < cat.tests.length - 1 ? '1px solid ' + P.border + '88' : 'none',
                      background: t.status !== 'normal' ? '#fef3e2' : 'transparent',
                    }}>
                      <td style={{ padding: '10px 12px', color: P.text, fontWeight: 500 }}>{t.name}</td>
                      <td style={{
                        padding: '10px 12px', fontFamily: mono, fontWeight: 700, fontSize: 14,
                        color: t.status === 'high' ? P.danger : t.status === 'low' ? P.warning : P.success,
                      }}>{t.value}</td>
                      <td style={{ padding: '10px 12px', color: P.textMuted }}>{t.unit}</td>
                      <td style={{ padding: '10px 12px', color: P.textMuted, fontFamily: mono, fontSize: 12 }}>{t.range}</td>
                      <td style={{ padding: '10px 12px' }}><Badge status={t.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      ))}

      {/* Conclusion */}
      <div style={{
        background: P.primaryLight, border: '1px solid ' + P.primary + '30',
        borderRadius: 14, padding: '20px 24px', marginTop: 4,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 16 }}>✅</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: P.primary }}>Kết luận</span>
        </div>
        <p style={{ margin: 0, fontSize: 14, color: P.textDim, lineHeight: 1.7 }}>{result.conclusion}</p>
      </div>
    </div>
  );
}
