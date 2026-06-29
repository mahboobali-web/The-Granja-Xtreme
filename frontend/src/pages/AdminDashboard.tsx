import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Truck, Clock, ShieldCheck, Banknote } from 'lucide-react';
import { fetchAPI } from '../utils/api';
import { SkeletonGrid } from '../components/Skeletons';
import { useTranslation } from 'react-i18next';

export const AdminDashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [metrics, setMetrics] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const [dashRes, revRes] = await Promise.all([
          fetchAPI('/analytics/dashboard'),
          fetchAPI('/analytics/revenue')
        ]);
        
        setMetrics(dashRes);
        
        // Map revenue data to Recharts format
        const formattedRev = revRes.map((r: any) => ({
          name: new Date(r._id).toLocaleDateString(i18n.language?.startsWith('es') ? 'es-ES' : 'en-US', { weekday: 'short' }).toUpperCase(),
          value: r.total
        }));
        
        setRevenueData(formattedRev.length ? formattedRev : [
          { name: 'MON', value: 0 }, { name: 'TUE', value: 0 }
        ]);

      } catch (err: any) {
        console.error(err);
        setErrorMsg('Failed to load dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, []);

  if (loading) {
    return <div style={{ padding: '24px' }}><SkeletonGrid count={6} /></div>;
  }

  if (errorMsg) {
    return <div style={{ padding: '20px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '12px' }}>{errorMsg}</div>;
  }

  const totalAtvs = metrics.fleet.available + metrics.fleet.rented + metrics.fleet.maintenance;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Top Stats Row */}
      <div className="admin-grid-metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px' }}>
        
        {/* Total ATVs */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div style={{ backgroundColor: '#fef3c7', padding: '8px', borderRadius: '8px' }}>
              <Truck size={20} style={{ color: '#d97706' }} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#3b82f6' }}>{t("Fleet")}</span>
          </div>
          <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>{t("Total ATVs")}</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a' }}>{totalAtvs}</div>
        </div>

        {/* Available ATVs */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div style={{ backgroundColor: '#ecfeff', padding: '8px', borderRadius: '8px' }}>
              <ShieldCheck size={20} style={{ color: '#0891b2' }} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#0ea5e9' }}>{t("Ready")}</span>
          </div>
          <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>{t("Available ATVs")}</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a' }}>{metrics.fleet.available}</div>
        </div>

        {/* Active Rentals */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div style={{ backgroundColor: '#fef3c7', padding: '8px', borderRadius: '8px' }}>
              <Clock size={20} style={{ color: '#d97706' }} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#d97706' }}>{t("On Trail")}</span>
          </div>
          <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>{t("Active Rentals")}</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a' }}>{metrics.activeRentals}</div>
        </div>

        {/* Total Customers */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div style={{ backgroundColor: '#e0e7ff', padding: '8px', borderRadius: '8px' }}>
              <Users size={20} style={{ color: '#4f46e5' }} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#0ea5e9' }}>{t("Growth")}</span>
          </div>
          <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>{t("Total Customers")}</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a' }}>{metrics.customerCount}</div>
        </div>

        {/* Total Revenue */}
        <div style={{ backgroundColor: '#0f172a', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div style={{ backgroundColor: '#84cc16', padding: '8px', borderRadius: '8px' }}>
              <Banknote size={20} style={{ color: '#14532d' }} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#bef264' }}>{t("Overall")}</span>
          </div>
          <div style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: 600, marginBottom: '4px' }}>{t("Total Revenue")}</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#f8fafc' }}>${(metrics.totalRevenue / 1000).toFixed(1)}k</div>
        </div>

      </div>

      {/* Charts Row */}
      <div className="admin-grid-charts" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Revenue Trend Chart */}
        <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>{t("Revenue Trend (Last 30 Days)")}</h2>
              <p style={{ fontSize: '13px', color: '#64748b' }}>{t("Daily revenue performance")}</p>
            </div>
          </div>
          <div style={{ height: '300px', width: '100%', minWidth: 0, minHeight: 0 }}>
            {isMounted && (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#84cc16" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#4d7c0f" stopOpacity={1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} tickFormatter={(val) => `$${val}`} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontWeight: 600 }} />
                <Bar dataKey="value" fill="url(#barGradient)" radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Fleet Distribution */}
        <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>{t("Fleet Status")}</h2>
            <p style={{ fontSize: '13px', color: '#64748b' }}>{t("Current vehicle availability")}</p>
          </div>
          <div style={{ height: '300px', width: '100%', minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            {isMounted && (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={[
                    { name: t('Available'), value: metrics.fleet.available },
                    { name: t('On Trail'), value: metrics.fleet.rented },
                    { name: t('Maintenance'), value: metrics.fleet.maintenance },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {['#0891b2', '#d97706', '#ef4444'].map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
            )}
            
            <div style={{ display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {[
                { name: t('Available'), color: '#0891b2', value: metrics.fleet.available },
                { name: t('On Trail'), color: '#d97706', value: metrics.fleet.rented },
                { name: t('Maintenance'), color: '#ef4444', value: metrics.fleet.maintenance }
              ].map((entry) => (
                <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: entry.color }}></div>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>{entry.name} ({entry.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
