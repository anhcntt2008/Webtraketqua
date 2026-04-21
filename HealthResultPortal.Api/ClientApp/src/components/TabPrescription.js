import React from 'react';
import { P, font, mono } from '../styles/theme';
import { Card } from '../components/Shared';

export default function TabPrescription({ result }) {
  const items = result.prescriptions || [];

  if (items.length === 0) {
    return (
      <Card style={{ padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>💊</div>
        <p style={{ color: P.textDim, fontSize: 15 }}>Chưa có đơn thuốc</p>
      </Card>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Thông tin đơn */}
      <Card style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 24px', fontSize: 13, color: P.textDim }}>
          <span>👨‍⚕️ BS kê đơn: <strong style={{ color: P.text }}>{result.prescriptionDoctor}</strong></span>
          <span>📅 Ngày kê: <strong style={{ color: P.text }}>{result.prescriptionDate}</strong></span>
          {result.diagnosis && (
            <span>🩺 Chẩn đoán: <strong style={{ color: P.text }}>{result.diagnosis}</strong></span>
          )}
        </div>
      </Card>

      {/* Danh sách thuốc */}
      <div style={{ overflowX: 'auto' }}>
        <Card style={{ padding: '0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid ' + P.border }}>
                {['STT', 'Tên thuốc', 'Hàm lượng', 'SL', 'ĐVT', 'Cách dùng'].map(h => (
                  <th key={h} style={{
                    padding: '12px 14px', textAlign: 'left',
                    color: P.textMuted, fontWeight: 600, fontSize: 12,
                    textTransform: 'uppercase', letterSpacing: .5,
                    background: P.bg,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((rx, i) => (
                <tr key={rx.id || i} style={{
                  borderBottom: i < items.length - 1 ? '1px solid ' + P.border + '88' : 'none',
                }}>
                  <td style={{ padding: '12px 14px', color: P.textMuted, fontFamily: mono, fontWeight: 600, textAlign: 'center', width: 50 }}>{i + 1}</td>
                  <td style={{ padding: '12px 14px', color: P.text, fontWeight: 600 }}>{rx.name}</td>
                  <td style={{ padding: '12px 14px', color: P.textDim, fontSize: 12 }}>{rx.generic}</td>
                  <td style={{ padding: '12px 14px', color: P.primary, fontFamily: mono, fontWeight: 700, textAlign: 'center' }}>{rx.quantity}</td>
                  <td style={{ padding: '12px 14px', color: P.textMuted }}>{rx.unit}</td>
                  <td style={{ padding: '12px 14px', color: P.text, lineHeight: 1.5 }}>{rx.usage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Lưu ý */}
      {result.prescriptionNote && (
        <div style={{
          background: P.primaryLight, border: '1px solid ' + P.primary + '30',
          borderRadius: 12, padding: '16px 20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 14 }}>📋</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: P.primary }}>Chế độ dinh dưỡng / Lời dặn</span>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: P.textDim, lineHeight: 1.7 }}>{result.prescriptionNote}</p>
        </div>
      )}
    </div>
  );
}
