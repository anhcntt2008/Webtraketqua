import React, { useState, useEffect } from 'react';
import { P, font } from '../styles/theme';
import { Spinner, Card, Badge } from '../components/Shared';
import { ResultService } from '../services/api';
import TabExamInfo from '../components/TabExamInfo';
import TabLabResults from '../components/TabLabResults';
import TabPrescription from '../components/TabPrescription';
import TabFiles from '../components/TabFiles';
import TabImaging from '../components/TabImaging';
// eslint-disable-next-line no-unused-vars
import TabImagingMockup from '../components/TabImagingMockup';

const TABS = [
  { key: 'info', label: '🩺 Thông tin khám' },
  { key: 'lab', label: '📊 Xét nghiệm' },
  { key: 'imaging', label: '🩻 CĐHA' },
  { key: 'rx', label: '💊 Đơn thuốc' },
  { key: 'files', label: '📁 File' },
];

export default function ResultPage({ user, maLuotKham, onLogout, onBack }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    setResult(null);
    setActiveTab('info');
    (async () => {
      try {
        const data = await ResultService.getResults(maLuotKham);
        if (!cancelled) setResult(data);
      } catch (err) {
        if (!cancelled) setError('Không thể tải kết quả. Vui lòng thử lại.');
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [maLuotKham]);

  // Loading
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: P.bg, fontFamily: font }}>
        <div style={{ textAlign: 'center' }}>
          <Spinner size={40} />
          <p style={{ color: P.textDim, marginTop: 16, fontSize: 14 }}>Đang tải kết quả khám...</p>
        </div>
      </div>
    );
  }

  // No result / Error
  if (!result || error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, background: P.bg, fontFamily: font }}>
        <div style={{ fontSize: 48 }}>📋</div>
        <p style={{ color: P.textDim, fontSize: 16 }}>{error || 'Chưa có kết quả khám'}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onBack} style={{ padding: '10px 24px', borderRadius: 8, background: P.primaryLight, border: '1px solid ' + P.primary + '30', color: P.primary, cursor: 'pointer', fontFamily: font, fontWeight: 600 }}>
            ← Quay lại
          </button>
          <button onClick={onLogout} style={{ padding: '10px 24px', borderRadius: 8, background: P.white, border: '1px solid ' + P.border, color: P.text, cursor: 'pointer', fontFamily: font }}>
            Đăng xuất
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: P.bg, fontFamily: font, color: P.text }}>

      {/* Header — Blue bar */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: P.headerBg,
        borderBottom: '2px solid ' + P.primaryDark, padding: '12px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,114,188,0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Back button */}
          <button onClick={onBack} title="Quay lại danh sách" style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
            color: P.headerText, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background .2s', flexShrink: 0,
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
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
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>Kết quả khám • {result.examDate}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, color: P.headerText }}>{user.tenBenhNhan}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{user.dienThoai}</div>
          </div>
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
        {/* Patient summary */}
        <Card style={{ padding: '16px 22px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 42, height: 42, borderRadius: '50%',
              background: P.primaryLight,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, fontWeight: 700, color: P.primary,
            }}>{(result.patient.name || '?')[0]}</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: P.text }}>{result.patient.name}</div>
              <div style={{ fontSize: 12, color: P.textMuted }}>{result.patient.gender} • {result.patient.dob} • {result.examCode}</div>
            </div>
          </div>
          <Badge status={result.status} />
        </Card>

        {/* 4 Tabs */}
        <div style={{
          display: 'flex', gap: 3, marginBottom: 20,
          background: P.white, padding: 3, borderRadius: 12,
          border: '1px solid ' + P.border, overflowX: 'auto',
        }}>
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              flex: 1, padding: '11px 10px', borderRadius: 10, whiteSpace: 'nowrap',
              background: activeTab === tab.key ? P.primaryLight : 'transparent',
              border: activeTab === tab.key ? '1px solid ' + P.primary + '30' : '1px solid transparent',
              color: activeTab === tab.key ? P.primary : P.textDim,
              cursor: 'pointer', fontFamily: font, fontSize: 13, fontWeight: 600,
              transition: 'all .2s',
            }}>{tab.label}</button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'info' && <TabExamInfo result={result} />}
        {activeTab === 'lab' && <TabLabResults result={result} />}
        {activeTab === 'imaging' && <ImagingTabWithToggle result={result} />}
        {activeTab === 'rx' && <TabPrescription result={result} />}
        {activeTab === 'files' && <TabFiles result={result} />}
      </div>
    </div>
  );
}

function ImagingTabWithToggle({ result }) {
  const [showMockup, setShowMockup] = useState(
    () => window.location.search.includes('mockup=cdha')
  );
  return (
    <div>
      <div style={{
        display: 'flex', justifyContent: 'flex-end', marginBottom: 8,
      }}>
        <button
          onClick={() => setShowMockup(v => !v)}
          style={{
            padding: '6px 12px', borderRadius: 8,
            background: showMockup ? '#fff7e6' : P.white,
            border: '1px solid ' + (showMockup ? '#ffd79d' : P.border),
            color: showMockup ? '#8a5a00' : P.textDim,
            cursor: 'pointer', fontFamily: font, fontSize: 12, fontWeight: 600,
          }}
        >
          {showMockup ? '🧪 Đang xem mockup — bấm để xem bản thật' : '🧪 Xem mockup'}
        </button>
      </div>
      {showMockup ? <TabImagingMockup result={result} /> : <TabImaging result={result} />}
    </div>
  );
}
