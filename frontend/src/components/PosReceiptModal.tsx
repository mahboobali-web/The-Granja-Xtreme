import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { X, Printer, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fetchAPI } from '../utils/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PosReceiptModalProps {
  orderId: string;
  onClose: () => void;
}

export const PosReceiptModal: React.FC<PosReceiptModalProps> = ({ orderId, onClose }) => {
  const { t, i18n } = useTranslation();
  const isSpanish = i18n.language === 'es';
  const [order, setOrder] = useState<any>(null);
  const [exchangeRate, setExchangeRate] = useState<number>(58.80);
  const [loading, setLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const [orders, settings] = await Promise.all([
        fetchAPI('/orders'),
        fetchAPI('/settings').catch(() => null)
      ]);
      const found = orders.find((o: any) => o._id === orderId);
      setOrder(found);
      if (settings && settings.exchangeRateDOP) {
        setExchangeRate(Number(settings.exchangeRateDOP));
      }
    } catch (err) {
      console.error('Failed to load order', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return ReactDOM.createPortal(
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
        <div style={{ color: 'white', fontWeight: 600 }}>{t("Loading receipt...")}</div>
      </div>,
      document.body
    );
  }

  if (!order) return null;

  const isPaid = order.status === 'Paid';

  return ReactDOM.createPortal(
    <div id="pos-receipt-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}>
      <style>
        {`
          @media (max-width: 640px) {
            .receipt-top-bar { flex-direction: column !important; align-items: flex-start !important; gap: 16px !important; padding: 16px 20px !important; }
            .receipt-top-bar-actions { width: 100% !important; justify-content: flex-end !important; }
            .receipt-content { padding: 24px 16px !important; }
            .receipt-header-flex { flex-direction: column !important; gap: 32px !important; }
            .receipt-header-right { text-align: left !important; }
            .receipt-totals-flex { justify-content: flex-start !important; }
            .receipt-totals-box { width: 100% !important; }
          }
          @media print {
            @page { margin: 15mm; }
            /* Hide the main app root */
            body > :not(#pos-receipt-modal-overlay) { 
              display: none !important; 
            }
            /* Make the overlay a static block so it flows normally */
            #pos-receipt-modal-overlay {
              position: static !important;
              display: block !important;
              padding: 0 !important;
              background: white !important;
              height: auto !important;
            }
            /* Remove scroll constraints from the modal container */
            .admin-modal-scroll { 
              overflow: visible !important; 
              max-height: none !important; 
              box-shadow: none !important;
              background: transparent !important;
              margin: 0 !important;
            }
            #printable-receipt {
              width: 100%;
              margin: 0;
              padding: 0;
              box-shadow: none !important;
              background: white !important;
            }
            .no-print { display: none !important; }
          }
        `}
      </style>
      
      <div className="admin-modal-scroll" style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
        
        {/* Top Header (No Print) */}
        <div className="no-print receipt-top-bar" style={{ padding: '20px 32px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a' }}>
            <CheckCircle size={24} />
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>{t("Sale Successful")}</h2>
          </div>
          <div className="receipt-top-bar-actions" style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={handlePrint}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}
            >
              <Printer size={18} /> {t("Print Receipt")}
            </button>
            <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', color: '#64748b' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div id="printable-receipt" className="receipt-content" ref={printRef} style={{ padding: '48px', backgroundColor: 'white', flex: 1 }}>
          
          {/* Card Header */}
          <div className="receipt-header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#396759', letterSpacing: '2px', margin: 0 }}>THE GRANJA</h2>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#396759', letterSpacing: '2px', marginTop: '-4px', marginBottom: '24px' }}>XTREME</h2>
              
              <div style={{ fontSize: '14px', color: '#4b5563', lineHeight: 1.6 }}>
                Calle Los Hidalgos, Sector Majagual<br />
                Sánchez, Samaná, Dominican Republic<br />
                <strong style={{ display: 'block', marginTop: '12px', color: '#111827' }}>+1 809-622-4122</strong>
                <a href="mailto:tgranjaxtreme065@gmail.com" style={{ color: '#396759', textDecoration: 'none' }}>tgranjaxtreme065@gmail.com</a>
              </div>
            </div>
            
            <div className="receipt-header-right" style={{ textAlign: 'right' }}>
              {order.status === 'Refunded' ? (
                <div style={{ display: 'inline-block', border: '1px solid #9ca3af', color: '#4b5563', background: '#f3f4f6', padding: '4px 16px', borderRadius: '16px', fontSize: '12px', fontWeight: 700, letterSpacing: '1px', marginBottom: '24px' }}>
                  {t("REFUNDED")}
                </div>
              ) : isPaid ? (
                <div style={{ display: 'inline-block', border: '1px solid #84cc16', color: '#65a30d', background: '#ecfccb', padding: '4px 16px', borderRadius: '16px', fontSize: '12px', fontWeight: 700, letterSpacing: '1px', marginBottom: '24px' }}>
                  {t("PAID")}
                </div>
              ) : (
                <div style={{ display: 'inline-block', border: '1px solid #ef4444', color: '#b91c1c', background: '#fee2e2', padding: '4px 16px', borderRadius: '16px', fontSize: '12px', fontWeight: 700, letterSpacing: '1px', marginBottom: '24px' }}>
                  {t("UNPAID")}
                </div>
              )}
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
                {t("Order #")}{order.orderNumber}
              </div>
              {order.invoiceId && (
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#6b7280', marginBottom: '16px' }}>
                  {t("Invoice #")}{order.invoiceId.invoiceNumber}
                </div>
              )}
              <div style={{ fontSize: '14px', color: '#4b5563', lineHeight: 1.6 }}>
                {t("Date & Time:")} <strong>{format(new Date(order.createdAt), 'PPp', { locale: isSpanish ? es : undefined })}</strong><br />
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div style={{ marginBottom: '48px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid #e5e7eb' }}>
              {t("CUSTOMER DETAILS")}
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
              {order.customerId ? `${order.customerId.firstName} ${order.customerId.lastName}` : t("Guest Customer")}
            </div>
            {order.customerId?.email && (
              <div style={{ fontSize: '14px', color: '#4b5563', lineHeight: 1.8 }}>
                {t("Email:")} <strong style={{ color: '#111827' }}>{order.customerId.email}</strong><br />
                {order.customerId.phone && <>{t("Phone:")} <strong style={{ color: '#111827' }}>{order.customerId.phone}</strong></>}
              </div>
            )}
          </div>

          {/* Table */}
          <div style={{ marginBottom: '32px', overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#eef2ff' }}>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 700, color: '#4f46e5', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px' }}>{t("Description")}</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 700, color: '#4f46e5', textAlign: 'center' }}>{t("Qty")}</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 700, color: '#4f46e5', textAlign: 'right' }}>{t("Unit Price")}</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 700, color: '#4f46e5', textAlign: 'right', borderTopRightRadius: '8px', borderBottomRightRadius: '8px' }}>{t("Total")}</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item: any, idx: number) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#111827', fontWeight: 500 }}>
                      {item.name}
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#4b5563', textAlign: 'center' }}>
                      {item.quantity}
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#4b5563', textAlign: 'right' }}>
                      ${item.price.toFixed(2)}
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#111827', fontWeight: 600, textAlign: 'right' }}>
                      ${(item.quantity * item.price).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="receipt-totals-flex" style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div className="receipt-totals-box" style={{ width: '320px', borderTop: '2px solid #e5e7eb', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', color: '#4b5563' }}>
                <span>{t("Subtotal")}</span>
                <span style={{ fontWeight: 600, color: '#111827' }}>${order.totalAmount.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '14px', color: '#4b5563' }}>
                <span>{t("Tax")}</span>
                <span style={{ fontWeight: 600, color: '#111827' }}>$0.00</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>{t("Total Paid (USD)")}</span>
                <span style={{ fontSize: '22px', fontWeight: 800, color: '#396759' }}>${order.totalAmount.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#166534' }}>{t("DOP Equivalent")}</span>
                  <span style={{ fontSize: '10px', color: '#15803d', display: 'block' }}>{t("Rate:")} 1 USD = {exchangeRate} DOP</span>
                </div>
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#166534' }}>
                  RD$ {(order.totalAmount * exchangeRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Notes */}
          <div style={{ marginTop: '64px', textAlign: 'center', fontSize: '12px', color: '#9ca3af', borderTop: '1px solid #e5e7eb', paddingTop: '24px' }}>
            {t("Thank you for your purchase! All retail sales are final.")}
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
};
