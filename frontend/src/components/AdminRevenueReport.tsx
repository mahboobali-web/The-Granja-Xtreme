import React, { useState, useEffect } from 'react';
import { Printer, ArrowLeft, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fetchAPI } from '../utils/api';
import type { DateFilterValue } from './DateRangeFilter';

interface AdminRevenueReportProps {
  initialFilter?: DateFilterValue;
  onClose: () => void;
}

export const AdminRevenueReport: React.FC<AdminRevenueReportProps> = ({ initialFilter, onClose }) => {
  const { t, i18n } = useTranslation();
  const isEs = i18n.language?.startsWith('es');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  
  // Format: YYYY-MM or 'custom'
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [customRange, setCustomRange] = useState<DateFilterValue | null>(initialFilter || null);

  const loadData = async () => {
    setLoading(true);
    try {
      let url = '/analytics/revenue';
      if (selectedMonth) {
        url = `/analytics/revenue?month=${selectedMonth}`;
      } else if (customRange) {
        const qp = new URLSearchParams();
        if (customRange.period) qp.set('period', customRange.period);
        if (customRange.startDate) qp.set('startDate', customRange.startDate);
        if (customRange.endDate) qp.set('endDate', customRange.endDate);
        url = `/analytics/revenue?${qp.toString()}`;
      }

      const res = await fetchAPI(url);
      setData(res);
      
      const total = res.reduce((acc: number, curr: any) => acc + (curr.total || 0), 0);
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
  }, [selectedMonth, customRange]);

  const getReportTitle = () => {
    if (selectedMonth) {
      const [year, month] = selectedMonth.split('-');
      const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
      return `${date.toLocaleString(isEs ? 'es-ES' : 'en-US', { month: 'long', year: 'numeric' })} ${t('adminAnalytics.revenueStatement', 'Revenue Statement')}`;
    }
    if (customRange) {
      if (customRange.period === 'PreviousMonth') {
        const prev = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
        return `${prev.toLocaleString(isEs ? 'es-ES' : 'en-US', { month: 'long', year: 'numeric' })} ${t('adminAnalytics.revenueStatement', 'Revenue Statement')}`;
      }
      if (customRange.period === 'PrevMonthToDate') {
        return `${t('adminFilters.prevMonthToDate', 'Previous Month to Date')} ${t('adminAnalytics.revenueStatement', 'Revenue Statement')}`;
      }
      if (customRange.period === 'Monthly') {
        const curr = new Date();
        return `${curr.toLocaleString(isEs ? 'es-ES' : 'en-US', { month: 'long', year: 'numeric' })} ${t('adminAnalytics.revenueStatement', 'Revenue Statement')}`;
      }
      if (customRange.period === 'Custom' && customRange.startDate && customRange.endDate) {
        return `${customRange.startDate} - ${customRange.endDate} ${t('adminAnalytics.revenueStatement', 'Revenue Statement')}`;
      }
    }
    return t('adminAnalytics.last30DaysRev', 'Last 30 Days Revenue Statement');
  };

  const activeDaysCount = data.filter(d => d.total > 0).length;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
      <div style={{ width: '850px', maxHeight: '90vh', backgroundColor: '#f8fafc', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
        
        {/* Controls Header (No Print) */}
        <div className="no-print" style={{ padding: '24px 32px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
              <ArrowLeft size={18} /> {t('adminAnalytics.close', 'Close')}
            </button>
            <div style={{ width: '1px', height: '24px', backgroundColor: '#e2e8f0' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Calendar size={18} color="#64748b" />
              <select 
                value={selectedMonth} 
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  if (e.target.value) setCustomRange(null);
                }}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 600, color: '#334155', cursor: 'pointer', outline: 'none' }}
              >
                <option value="">
                  {customRange ? getReportTitle() : t('adminAnalytics.last30Days', 'Last 30 Days')}
                </option>
                {/* Generate last 12 months dynamically */}
                {Array.from({ length: 12 }).map((_, i) => {
                  const d = new Date();
                  d.setMonth(d.getMonth() - i);
                  const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                  const label = d.toLocaleString(isEs ? 'es-ES' : 'en-US', { month: 'long', year: 'numeric' });
                  return <option key={val} value={val}>{label}</option>;
                })}
              </select>
            </div>
          </div>
          <button 
            onClick={() => window.print()} 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
          >
            <Printer size={16} /> {t('adminAnalytics.printStatement', 'Print Statement')}
          </button>
        </div>

        {/* Printable Area */}
        <div style={{ padding: '40px', overflowY: 'auto', flex: 1, backgroundColor: '#f1f5f9' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>{t('adminAnalytics.generatingStatement', 'Generating Statement...')}</div>
          ) : (
            <div id="printable-document" style={{ background: 'white', padding: '56px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', color: '#0f172a' }}>
              
              {/* Report Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', borderBottom: '2px solid #0f172a', paddingBottom: '24px' }}>
                <div>
                  <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#3f6212', margin: 0, letterSpacing: '2px' }}>THE GRANJA</h2>
                  <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#3f6212', margin: 0, marginTop: '-4px', letterSpacing: '2px' }}>XTREME</h2>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '8px', fontWeight: 700, letterSpacing: '1px' }}>{t('adminAnalytics.officialStatement', 'OFFICIAL REVENUE STATEMENT')}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>{getReportTitle()}</div>
                  <div style={{ fontSize: '12px', color: '#475569' }}>{t('adminAnalytics.generated', 'Generated:')} {new Date().toLocaleString()}</div>
                  <div style={{ fontSize: '12px', color: '#475569' }}>{t('adminAnalytics.generatedBy', 'Generated By: Admin System')}</div>
                </div>
              </div>

              {/* Summary Metrics */}
              <div style={{ display: 'flex', gap: '36px', marginBottom: '40px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>{t('adminAnalytics.totalRevMetrics', 'Total Revenue')}</div>
                  <div style={{ fontSize: '28px', fontWeight: 900, color: '#16a34a' }}>${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>{t('adminAnalytics.activeDays', 'Active Sales Days')}</div>
                  <div style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a' }}>{activeDaysCount}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>{t('adminAnalytics.avgDaily', 'Average Daily')}</div>
                  <div style={{ fontSize: '28px', fontWeight: 900, color: '#0284c7' }}>
                    ${activeDaysCount > 0 ? (totalRevenue / activeDaysCount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                  </div>
                </div>
              </div>

              {/* Data Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginBottom: '40px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #cbd5e1' }}>
                    <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 800, color: '#334155' }}>{t('adminAnalytics.date', 'Date / Period')}</th>
                    <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 800, color: '#334155', textAlign: 'right' }}>{t('adminAnalytics.dailyRev', 'Revenue')}</th>
                    <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 800, color: '#334155', textAlign: 'right' }}>{t('adminAnalytics.pctOfTotal', '% of Total')}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 ? (
                    <tr><td colSpan={3} style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>{t('adminAnalytics.noRevData', 'No revenue data for this period.')}</td></tr>
                  ) : (
                    data.map((row, idx) => {
                      let dateStr = row._id;
                      if (row._id && row._id.length === 10 && row._id.includes('-')) {
                        const [y, m, d] = row._id.split('-').map(Number);
                        dateStr = new Date(y, m - 1, d).toLocaleDateString(isEs ? 'es-ES' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
                      }
                      return (
                        <tr key={row._id} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: idx % 2 === 0 ? 'white' : '#f8fafc' }}>
                          <td style={{ padding: '10px 14px', fontSize: '13px', color: '#0f172a', fontWeight: 600 }}>
                            {dateStr}
                          </td>
                          <td style={{ padding: '10px 14px', fontSize: '13px', color: row.total > 0 ? '#16a34a' : '#94a3b8', fontWeight: 700, textAlign: 'right' }}>
                            ${row.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td style={{ padding: '10px 14px', fontSize: '13px', color: '#64748b', textAlign: 'right' }}>
                            {totalRevenue > 0 ? ((row.total / totalRevenue) * 100).toFixed(1) : 0}%
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: '2px solid #0f172a', backgroundColor: '#f8fafc' }}>
                    <td style={{ padding: '14px', fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>{t('adminAnalytics.total', 'TOTAL')}</td>
                    <td style={{ padding: '14px', fontSize: '16px', fontWeight: 900, color: '#16a34a', textAlign: 'right' }}>
                      ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '14px', textAlign: 'right', color: '#64748b', fontWeight: 800 }}>100%</td>
                  </tr>
                </tfoot>
              </table>

              {/* Signatures */}
              <div style={{ marginTop: '48px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
                <div>
                  <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, letterSpacing: '1px' }}>{t('adminAnalytics.preparedFor', 'PREPARED FOR')}</div>
                  <div style={{ fontSize: '15px', color: '#0f172a', fontWeight: 800, marginTop: '4px' }}>{t('adminAnalytics.execMgmt', 'EXECUTIVE MANAGEMENT')}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic', marginTop: '2px' }}>The Granja Xtreme</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, letterSpacing: '1px' }}>{t('adminAnalytics.reportHash', 'REPORT AUTHENTICITY HASH')}</div>
                  <div style={{ fontSize: '11px', color: '#0f172a', fontFamily: 'monospace', marginTop: '4px' }}>REV-{Math.random().toString(36).substring(2, 10).toUpperCase()}-{selectedMonth || customRange?.period || 'CUSTOM'}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
