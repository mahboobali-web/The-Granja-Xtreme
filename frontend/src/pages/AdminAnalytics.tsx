import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Download, TrendingUp, CheckCircle2, Ticket, DollarSign, FileText, Truck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchAPI } from '../utils/api';
import { SkeletonGrid } from '../components/Skeletons';
import { AdminRevenueReport } from '../components/AdminRevenueReport';
import { AdminFleetReport } from '../components/AdminFleetReport';

export const AdminAnalytics: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [dashboard, setDashboard] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [fleetData, setFleetData] = useState<any>(null);
  const [bookingData, setBookingData] = useState<any[]>([]);

  const [showRevenueReport, setShowRevenueReport] = useState(false);
  const [showFleetReport, setShowFleetReport] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const { analyticsFilter } = useOutletContext<{ analyticsFilter: string }>();

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      try {
        const [dashRes, revRes, fleetRes, bookRes] = await Promise.all([
          fetchAPI(`/analytics/dashboard?period=${analyticsFilter}`),
          fetchAPI(`/analytics/revenue?period=${analyticsFilter}`),
          fetchAPI('/analytics/fleet'),
          fetchAPI('/analytics/bookings')
        ]);
        
        setDashboard(dashRes);
        
        const formattedRev = revRes.map((r: any) => {
          let dayLabel = r._id;
          if (analyticsFilter === 'Yearly') {
            const [y, m] = r._id.split('-');
            const d = new Date(parseInt(y), parseInt(m) - 1, 1);
            dayLabel = d.toLocaleDateString(i18n.language?.startsWith('es') ? 'es-ES' : 'en-US', { month: 'short' });
          } else if (analyticsFilter === 'Daily') {
            const parts = r._id.split(' ');
            if (parts.length > 1) dayLabel = parts[1];
          } else if (analyticsFilter === 'Monthly') {
            // To prevent off-by-one errors with UTC timezone, we can extract from YYYY-MM-DD
            const [y, m, day] = r._id.split('-');
            if (day) dayLabel = `${new Date(parseInt(y), parseInt(m) - 1, parseInt(day)).toLocaleDateString(i18n.language?.startsWith('es') ? 'es-ES' : 'en-US', { month: 'short', day: 'numeric' })}`;
          } else {
            const [y, m, day] = r._id.split('-');
            if (day) dayLabel = new Date(parseInt(y), parseInt(m) - 1, parseInt(day)).toLocaleDateString(i18n.language?.startsWith('es') ? 'es-ES' : 'en-US', { weekday: 'short' }).toUpperCase();
          }
          return { day: dayLabel, value: r.total };
        });
        setRevenueData(formattedRev.length ? formattedRev : [{ day: '-', value: 0 }]);
        
        setFleetData(fleetRes);
        setBookingData(bookRes);
      } catch (err: any) {
        console.error(err);
        setErrorMsg('Failed to load analytics data.');
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, [analyticsFilter]);

  if (loading) return <div style={{ padding: '24px' }}><SkeletonGrid count={4} /></div>;
  if (errorMsg) return <div style={{ padding: '20px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '12px' }}>{errorMsg}</div>;

  const activeFleetCount = dashboard.fleet.rented + dashboard.fleet.available;
  const totalFleetCount = activeFleetCount + dashboard.fleet.maintenance;
  const activeFleetPct = totalFleetCount > 0 ? Math.round((activeFleetCount / totalFleetCount) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Stat Cards */}
      <div className="admin-grid-metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        
        {/* Revenue Collected */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>{t('adminAnalytics.revenueCollected', 'Revenue Collected')}</span>
            <div style={{ backgroundColor: '#f0fdf4', padding: '6px', borderRadius: '8px' }}><DollarSign size={16} color="#16a34a" /></div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>${dashboard.totalRevenue?.toLocaleString()}</div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>{t('adminAnalytics.totalPayments', 'Total payments received')}</div>
        </div>

        {/* Outstanding Revenue */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>{t('adminAnalytics.outstandingRevenue', 'Outstanding Revenue')}</span>
            <div style={{ backgroundColor: '#fef2f2', padding: '6px', borderRadius: '8px' }}><DollarSign size={16} color="#dc2626" /></div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>${dashboard.outstandingRevenue?.toLocaleString()}</div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#dc2626' }}>{t('adminAnalytics.pendingInvoices', 'Pending unpaid invoices')}</div>
        </div>

        {/* Monthly Revenue */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>{t('adminAnalytics.monthlyRevenue', 'Monthly Revenue')}</span>
            <div style={{ backgroundColor: '#f0f9ff', padding: '6px', borderRadius: '8px' }}><TrendingUp size={16} color="#0284c7" /></div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>${dashboard.monthlyRevenue?.toLocaleString()}</div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#0284c7' }}>{t('adminAnalytics.collectedMonth', 'Collected this month')}</div>
        </div>

        {/* Damage Charges */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>{t('adminAnalytics.damageCharges', 'Damage Charges')}</span>
            <div style={{ backgroundColor: '#fff7ed', padding: '6px', borderRadius: '8px' }}><FileText size={16} color="#ea580c" /></div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>${dashboard.damageCharges?.toLocaleString()}</div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#ea580c' }}>{t('adminAnalytics.assessedDamages', 'Total assessed damages')}</div>
        </div>

        {/* Active Rentals */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>{t('adminAnalytics.activeRentals', 'Active Rentals')}</span>
            <div style={{ backgroundColor: '#f0f9ff', padding: '6px', borderRadius: '8px' }}><Ticket size={16} color="#0284c7" /></div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>{dashboard.activeRentals}</div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>{t('adminAnalytics.onTrails', 'Currently on trails')}</div>
        </div>

        {/* Available ATVs */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>{t('adminAnalytics.availableATVs', 'Available ATVs')}</span>
            <div style={{ backgroundColor: '#f7fee7', padding: '6px', borderRadius: '8px' }}><CheckCircle2 size={16} color="#4d7c0f" /></div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>{dashboard.fleet.available}</div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#4d7c0f' }}>{t('adminAnalytics.readyBooking', 'Ready for booking')}</div>
        </div>

        {/* Total Customers */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>{t('adminAnalytics.totalCustomers', 'Total Customers')}</span>
            <div style={{ backgroundColor: '#f5f3ff', padding: '6px', borderRadius: '8px' }}><Truck size={16} color="#7c3aed" /></div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>{dashboard.customerCount}</div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#7c3aed' }}>{t('adminAnalytics.registeredUsers', 'Registered users')}</div>
        </div>

      </div>

      {/* Charts Row */}
      <div className="checkout-grid-layout" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Revenue Report Chart */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0, marginBottom: '4px' }}>{t('adminAnalytics.revenueReport', 'Revenue Report')}</h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>{t('adminAnalytics.earningsBookings', 'Earnings from all bookings')} ({t(`adminBookings.${analyticsFilter.toLowerCase()}`, analyticsFilter)})</p>
            </div>
            <button 
              onClick={() => setShowRevenueReport(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #e2e8f0', background: 'white', color: '#0f172a', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}
            >
              <Download size={14} /> {t('adminAnalytics.fullStatement', 'Full Statement')}
            </button>
          </div>
          
          <div style={{ height: '300px', width: '100%', minWidth: 0, minHeight: 0 }}>
            {isMounted && (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: '#0f172a', fontWeight: 800 }}
                  cursor={{ fill: '#f8fafc' }}
                  formatter={(value: any) => [`$${value}`, 'Revenue']}
                />
                <Bar dataKey="value" fill="#4d7c0f" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Booking Trends */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0, marginBottom: '24px' }}>{t('adminAnalytics.bookingTrends', 'Booking Status Trends')}</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
            {bookingData.length === 0 ? <div style={{ fontSize: '13px', color: '#64748b' }}>{t('adminAnalytics.noBookingData', 'No booking data available.')}</div> : bookingData.map((b) => {
              const pct = Math.round((b.count / dashboard.totalBookings) * 100);
              const colors: Record<string, string> = {
                'Completed': '#4d7c0f',
                'Active': '#0284c7',
                'Reserved': '#d97706',
                'Pending': '#64748b',
                'Cancelled': '#dc2626'
              };
              return (
                <div key={b._id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                    <span>{t(`adminBookings.status.${b._id.toLowerCase().replace(' ', '')}`, b._id) as string}</span>
                    <span>{pct}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '4px' }}>
                    <div style={{ width: `${pct}%`, height: '100%', backgroundColor: colors[b._id] || '#64748b', borderRadius: '4px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Fleet Utilization Table */}
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0, marginBottom: '4px' }}>{t('adminAnalytics.mostRented', 'Most Rented Vehicles')}</h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>{t('adminAnalytics.trackingDesc', 'Detailed tracking of vehicle performance.')}</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => setShowFleetReport(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: 'white', fontSize: '12px', fontWeight: 700, color: '#334155', cursor: 'pointer' }}
            >
              <FileText size={14} color="#64748b" /> {t('adminAnalytics.genPdf', 'Generate PDF Report')}
            </button>
          </div>
        </div>

        <div className="admin-table-container">
<table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '16px', fontSize: '13px', fontWeight: 700, color: '#475569' }}>{t('adminAnalytics.vehicleModel', 'Vehicle Model')}</th>
              <th style={{ padding: '16px', fontSize: '13px', fontWeight: 700, color: '#475569', textAlign: 'center' }}>{t('adminAnalytics.totalRentals', 'Total Rentals')}</th>
            </tr>
          </thead>
          <tbody>
            {fleetData?.mostRented?.length === 0 ? (
              <tr><td colSpan={2} style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>{t('adminAnalytics.noData', 'No data available')}</td></tr>
            ) : fleetData?.mostRented?.map((row: any, idx: number) => (
              <tr key={idx} style={{ borderBottom: idx === fleetData.mostRented.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                <td style={{ padding: '20px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ backgroundColor: '#f1f5f9', padding: '8px', borderRadius: '8px' }}>
                      <Truck size={16} color="#64748b" />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>{row.name} {row.model}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '20px 16px', textAlign: 'center', fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{row.count} {t('adminAnalytics.times', 'times')}</td>
              </tr>
            ))}
          </tbody>
        </table>
</div>
      </div>

      {showRevenueReport && <AdminRevenueReport onClose={() => setShowRevenueReport(false)} />}
      {showFleetReport && <AdminFleetReport onClose={() => setShowFleetReport(false)} />}
    </div>
  );
};
