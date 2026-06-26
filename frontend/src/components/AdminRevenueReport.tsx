import React, { useState, useEffect } from 'react';
import { Printer, ArrowLeft, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fetchAPI } from '../utils/api';

interface AdminRevenueReportProps {
  onClose: () => void;
}

export const AdminRevenueReport: React.FC<AdminRevenueReportProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  
  // Format: YYYY-MM. Default to empty (last 30 days)
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  const loadData = async () => {
    setLoading(true);
    try {
      const url = selectedMonth ? `/analytics/revenue?month=${selectedMonth}` : '/analytics/revenue';
      const res = await fetchAPI(url);
      setData(res);
      
      const total = res.reduce((acc: number, curr: any) => acc + curr.total, 0);
      setTotalRevenue(total);
    } catch (err) {
      console.error(err);
      alert('Failed to load revenue data for the selected period.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedMonth]);

  const getReportTitle = () => {
    if (!selectedMonth) return t('adminAnalytics.last30DaysRev', 'Last 30 Days Revenue Statement');
    const [year, month] = selectedMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return `${date.toLocaleString('en-US', { month: 'long', year: 'numeric' })} ${t('adminAnalytics.revenueStatement', 'Revenue Statement')}`;
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
      <div style={{ width: '850px', maxHeight: '90vh', backgroundColor: '#f8fafc', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
        
        {/* Controls Header (No Print) */}
        <div className="no-print" style={{ padding: '24px 32px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
              <ArrowLeft size={20} /> {t('adminAnalytics.close', 'Close')}
            </button>
            <div style={{ width: '1px', height: '24px', backgroundColor: '#e2e8f0' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Calendar size={18} color="#64748b" />
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: 600, color: '#334155', cursor: 'pointer', outline: 'none' }}
              >
                <option value="">{t('adminAnalytics.last30Days', 'Last 30 Days')}</option>
                {/* Generate last 12 months dynamically */}
                {Array.from({ length: 12 }).map((_, i) => {
                  const d = new Date();
                  d.setMonth(d.getMonth() - i);
                  const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                  const label = d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
                  return <option key={val} value={val}>{label}</option>;
                })}
              </select>
            </div>
          </div>
          <button 
            onClick={() => window.print()} 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
          >
            <Printer size={18} /> {t('adminAnalytics.printStatement', 'Print Statement')}
          </button>
        </div>

        {/* Printable Area */}
        <div style={{ padding: '40px', overflowY: 'auto', flex: 1, backgroundColor: '#f1f5f9' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>{t('adminAnalytics.generatingStatement', 'Generating Statement...')}</div>
          ) : (
            <div id="printable-document" style={{ background: 'white', padding: '64px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', color: '#0f172a' }}>
              
              {/* Report Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px', borderBottom: '2px solid #0f172a', paddingBottom: '24px' }}>
                <div>
                  <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#3f6212', margin: 0, letterSpacing: '2px' }}>THE GRANJA</h2>
                  <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#3f6212', margin: 0, marginTop: '-4px', letterSpacing: '2px' }}>XTREME</h2>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px', fontWeight: 600, letterSpacing: '1px' }}>{t('adminAnalytics.officialStatement', 'OFFICIAL REVENUE STATEMENT')}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>{getReportTitle()}</div>
                  <div style={{ fontSize: '13px', color: '#475569' }}>{t('adminAnalytics.generated', 'Generated:')} {new Date().toLocaleString()}</div>
                  <div style={{ fontSize: '13px', color: '#475569' }}>{t('adminAnalytics.generatedBy', 'Generated By: Admin System')}</div>
                </div>
              </div>

              {/* Summary Metrics */}
              <div style={{ display: 'flex', gap: '48px', marginBottom: '48px', backgroundColor: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>{t('adminAnalytics.totalRevMetrics', 'Total Revenue')}</div>
                  <div style={{ fontSize: '32px', fontWeight: 900, color: '#16a34a' }}>${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>{t('adminAnalytics.activeDays', 'Active Days')}</div>
                  <div style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a' }}>{data.length}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>{t('adminAnalytics.avgDaily', 'Average Daily')}</div>
                  <div style={{ fontSize: '32px', fontWeight: 900, color: '#0284c7' }}>
                    ${data.length > 0 ? (totalRevenue / data.length).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                  </div>
                </div>
              </div>

              {/* Data Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginBottom: '48px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #cbd5e1' }}>
                    <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 800, color: '#334155' }}>{t('adminAnalytics.date', 'Date')}</th>
                    <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 800, color: '#334155', textAlign: 'right' }}>{t('adminAnalytics.dailyRev', 'Daily Revenue')}</th>
                    <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 800, color: '#334155', textAlign: 'right' }}>{t('adminAnalytics.pctOfTotal', '% of Total')}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 ? (
                    <tr><td colSpan={3} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>{t('adminAnalytics.noRevData', 'No revenue data for this period.')}</td></tr>
                  ) : (
                    data.map((row, idx) => (
                      <tr key={row._id} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: idx % 2 === 0 ? 'white' : '#f8fafc' }}>
                        <td style={{ padding: '12px 16px', fontSize: '14px', color: '#0f172a', fontWeight: 600 }}>
                          {new Date(row._id).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', color: '#16a34a', fontWeight: 700, textAlign: 'right' }}>
                          ${row.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', color: '#64748b', textAlign: 'right' }}>
                          {totalRevenue > 0 ? ((row.total / totalRevenue) * 100).toFixed(1) : 0}%
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: '2px solid #0f172a', backgroundColor: '#f8fafc' }}>
                    <td style={{ padding: '16px', fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>{t('adminAnalytics.total', 'TOTAL')}</td>
                    <td style={{ padding: '16px', fontSize: '18px', fontWeight: 900, color: '#16a34a', textAlign: 'right' }}>
                      ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right', color: '#64748b', fontWeight: 800 }}>100%</td>
                  </tr>
                </tfoot>
              </table>

              {/* Signatures */}
              <div style={{ marginTop: '64px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '32px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, letterSpacing: '1px' }}>{t('adminAnalytics.preparedFor', 'PREPARED FOR')}</div>
                  <div style={{ fontSize: '16px', color: '#0f172a', fontWeight: 800, marginTop: '4px' }}>{t('adminAnalytics.execMgmt', 'EXECUTIVE MANAGEMENT')}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', marginTop: '4px' }}>The Granja Xtreme</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, letterSpacing: '1px' }}>{t('adminAnalytics.reportHash', 'REPORT AUTHENTICITY HASH')}</div>
                  <div style={{ fontSize: '12px', color: '#0f172a', fontFamily: 'monospace', marginTop: '4px' }}>REV-{Math.random().toString(36).substring(2, 10).toUpperCase()}-{selectedMonth || '30D'}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
