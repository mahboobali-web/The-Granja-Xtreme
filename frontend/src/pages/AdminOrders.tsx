import React, { useState, useEffect } from 'react';
import { fetchAPI } from '../utils/api';
import { useTranslation } from 'react-i18next';
import { Search, FileText } from 'lucide-react';
import { PosReceiptModal } from '../components/PosReceiptModal';
import { DateRangeFilter, type DateFilterValue } from '../components/DateRangeFilter';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const AdminOrders: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isSpanish = i18n.language === 'es';
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Default to Current Month
  const [dateFilter, setDateFilter] = useState<DateFilterValue>({ period: 'Monthly' });

  const loadOrders = async () => {
    setLoading(true);
    try {
      const qp = new URLSearchParams();
      if (dateFilter.period) qp.set('period', dateFilter.period);
      if (dateFilter.startDate) qp.set('startDate', dateFilter.startDate);
      if (dateFilter.endDate) qp.set('endDate', dateFilter.endDate);
      const qs = qp.toString() ? `?${qp.toString()}` : '';

      const data = await fetchAPI(`/orders${qs}`);
      setOrders(data || []);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [dateFilter]);

  const filteredOrders = orders.filter(order => 
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.invoiceId?.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPp', { locale: isSpanish ? es : undefined });
    } catch {
      return dateString;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Search & Date Filter Card */}
      <div className="no-print" style={{ backgroundColor: 'white', padding: '20px 24px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', position: 'relative', zIndex: 30 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input 
              type="text" 
              placeholder={t("Search by order number or customer name...")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '10px 14px 10px 42px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none' }}
            />
          </div>

          <DateRangeFilter
            value={dateFilter}
            onChange={setDateFilter}
            mode="table"
            align="right"
          />
        </div>
      </div>

      {/* Orders Table Card */}
      <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', overflowX: 'auto', minHeight: '180px' }}>
        <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#475569' }}>{t("Order")}</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#475569' }}>{t("Customer")}</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#475569' }}>{t("Items")}</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#475569' }}>{t("Total")}</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#475569' }}>{t("Status")}</th>
              <th style={{ padding: '16px', textAlign: 'right', fontSize: '13px', fontWeight: 600, color: '#475569' }}>{t("Action")}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: '48px 16px', textAlign: 'center', color: '#64748b' }}>
                  {t("Loading orders for selected period...")}
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '48px 16px', textAlign: 'center', color: '#94a3b8' }}>
                  {t("No orders found for this period.")}
                </td>
              </tr>
            ) : (
              filteredOrders.map(order => (
                <tr key={order._id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{order.orderNumber}</div>
                    {order.invoiceId && (
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Ref: {order.invoiceId.invoiceNumber}</div>
                    )}
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{formatDate(order.createdAt)}</div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: 500, color: '#0f172a' }}>
                      {order.customerId ? `${order.customerId.firstName} ${order.customerId.lastName}` : t("Guest")}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontSize: '13px', color: '#475569' }}>
                      {order.items.map((item: any, idx: number) => (
                        <div key={idx}>{item.quantity}x {item.name}</div>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '16px', fontWeight: 600, color: '#ca8a04' }}>
                    ${order.totalAmount.toFixed(2)}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, backgroundColor: order.status === 'Paid' ? '#dcfce7' : '#f1f5f9', color: order.status === 'Paid' ? '#166534' : '#475569' }}>
                      {t(order.status)}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <button 
                      onClick={() => setSelectedOrderId(order._id)}
                      style={{ padding: '6px 12px', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: '#475569', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <FileText size={14} /> {t("View Receipt")}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedOrderId && (
        <PosReceiptModal 
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
        />
      )}
    </div>
  );
};
