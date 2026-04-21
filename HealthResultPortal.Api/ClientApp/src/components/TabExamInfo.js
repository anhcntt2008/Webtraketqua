import React, { useState } from 'react';
import { P, mono } from '../styles/theme';
import { Card, SectionTitle, InfoRow } from '../components/Shared';

export default function TabExamInfo({ result }) {
  const { vitals, departments } = result.examInfo;
  const [openDept, setOpenDept] = useState(0);
  const bmiVal = parseFloat(vitals.bmi);
  const bmiColor = bmiVal >= 25 ? P.warning : bmiVal >= 23 ? P.orange : P.success;

  const vitalCards = [
    { label: 'Chiều cao', value: vitals.height + ' cm', color: P.primary },
    { label: 'Cân nặng', value: vitals.weight + ' kg', color: P.primary },
    { label: 'BMI', value: vitals.bmi, color: bmiColor, sub: vitals.bmiStatus },
    { label: 'Huyết áp', value: vitals.bloodPressure + ' mmHg', color: parseInt(vitals.bloodPressure) >= 130 ? P.warning : P.success },
    { label: 'Nhịp tim', value: vitals.heartRate + ' bpm', color: P.success },
    { label: 'Nhiệt độ', value: vitals.temperature + ' °C', color: P.success },
    { label: 'SpO2', value: vitals.spo2 + ' %', color: P.success },
    { label: 'Thị lực (T/P)', value: vitals.visionLeft + ' / ' + vitals.visionRight, color: P.primary },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Hành chính */}
      <Card style={{ padding: '20px 24px' }}>
        <SectionTitle icon="👤" title="Hành chính" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
          <InfoRow label="Họ tên" value={result.patient.name} />
          <InfoRow label="Ngày sinh" value={result.patient.dob} />
          <InfoRow label="Giới tính" value={result.patient.gender} />
          <InfoRow label="SĐT" value={result.patient.phone} useMono />
          <InfoRow label="BHYT" value={result.patient.insurance} useMono />
          <InfoRow label="Nghề nghiệp" value={result.patient.job} />
          <InfoRow label="Đơn vị" value={result.patient.company} />
          <InfoRow label="Mã phiếu" value={result.examCode} useMono />
        </div>
        <div style={{ marginTop: 8 }}>
          <InfoRow label="Địa chỉ" value={result.patient.address} />
        </div>
      </Card>

      {/* Sinh hiệu */}
      <Card style={{ padding: '20px 24px' }}>
        <SectionTitle icon="📏" title="Sinh hiệu & Thể lực" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
          {vitalCards.map((v, i) => (
            <div key={i} style={{
              background: P.bg, borderRadius: 10, padding: '12px 14px',
              border: '1px solid ' + P.border,
            }}>
              <div style={{ fontSize: 11, color: P.textMuted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: .5, fontWeight: 600 }}>{v.label}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: v.color, fontFamily: mono }}>{v.value}</div>
              {v.sub && <div style={{ fontSize: 11, color: v.color, marginTop: 2, fontWeight: 500 }}>{v.sub}</div>}
            </div>
          ))}
        </div>
      </Card>

      {/* Khám chuyên khoa */}
      <Card style={{ padding: '20px 24px' }}>
        <SectionTitle icon="🩺" title="Khám chuyên khoa" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {departments.map((dept, di) => {
            const isAbn = dept.diagnosis !== 'Bình thường';
            return (
              <div key={di} style={{
                border: '1px solid ' + (isAbn ? P.warning + '50' : P.border),
                borderRadius: 10, overflow: 'hidden',
                background: isAbn ? '#fef8f0' : P.white,
              }}>
                <button onClick={() => setOpenDept(openDept === di ? null : di)} style={{
                  width: '100%', padding: '12px 16px', background: 'transparent',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  fontFamily: 'inherit',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 18 }}>{dept.icon}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: P.text }}>{dept.name}</span>
                    {isAbn && (
                      <span style={{
                        fontSize: 11, padding: '1px 8px', borderRadius: 6,
                        background: P.warning + '20', color: P.warning, fontWeight: 600,
                      }}>Bất thường</span>
                    )}
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={P.textMuted} strokeWidth="2"
                    style={{ transform: openDept === di ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .2s' }}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {openDept === di && (
                  <div style={{ padding: '0 16px 14px', fontSize: 13 }}>
                    <div style={{ display: 'grid', gap: 8 }}>
                      <div><span style={{ color: P.textMuted }}>Bác sĩ: </span><span style={{ color: P.text }}>{dept.doctor}</span></div>
                      <div><span style={{ color: P.textMuted }}>Phát hiện: </span><span style={{ color: P.text, lineHeight: 1.6 }}>{dept.findings}</span></div>
                      <div><span style={{ color: P.textMuted }}>Chẩn đoán: </span><span style={{ color: isAbn ? P.warning : P.success, fontWeight: 600 }}>{dept.diagnosis}</span></div>
                      {dept.note && (
                        <div style={{
                          padding: '8px 12px', background: P.primaryLight, borderRadius: 8,
                          border: '1px solid ' + P.primary + '20', color: P.primary, fontSize: 12,
                        }}>💡 {dept.note}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
