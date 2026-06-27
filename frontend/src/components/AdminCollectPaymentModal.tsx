import React, { useState } from 'react';
import { X, CreditCard, DollarSign } from 'lucide-react';
import { fetchAPI } from '../utils/api';
import { useTranslation } from 'react-i18next';

interface AdminCollectPaymentModalProps {
  onClose: () => void;
  onSuccess: () => void;
  invoice: {
    _id: string;
    bookingId: string;
    balance: number;
    amount: number;
  };
}

export const AdminCollectPaymentModal: React.FC<AdminCollectPaymentModalProps> = ({ onClose, onSuccess, invoice }) => {
  const { t } = useTranslation();
  const [amount, setAmount] = useState(invoice.balance.toString());
  const [method, setMethod] = useState('Cash');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const paymentMethods = [
    'Cash',
    'Zelle',
    'PayPal',
    'Apple Pay',
    'Google Pay',
    'International Card',
    'Banco Popular',
    'Banreservas'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0 || parsedAmount > invoice.balance) {
      setErrorMsg(`${t('adminPayments.invalidAmount', 'Please enter a valid amount up to')} $${invoice.balance.toFixed(2)}.`);
      setLoading(false);
      return;
    }

    try {
      const bookingIdStr = typeof invoice.bookingId === 'object' ? (invoice.bookingId as any)._id : invoice.bookingId;
      await fetchAPI(`/bookings/${bookingIdStr}/collect-payment`, {
        method: 'PUT',
        body: { amount: parsedAmount, method, invoiceId: invoice._id }
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || t('adminPayments.failedRecordPayment', 'Failed to record payment.'));
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '480px',
        padding: '32px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ backgroundColor: '#eef2ff', padding: '10px', borderRadius: '12px' }}>
              <CreditCard size={24} color="#4f46e5" />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{t('adminPayments.collectPaymentTitle', 'Collect Payment')}</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
            <X size={24} />
          </button>
        </div>

        {errorMsg && (
          <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, marginBottom: '20px' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
              {t('adminPayments.amountToCollect', 'Amount to Collect')}
            </label>
            <div style={{ position: 'relative' }}>
              <DollarSign size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={invoice.balance}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{
                  width: '100%', padding: '12px 16px 12px 42px', border: '1px solid #cbd5e1', borderRadius: '12px', fontSize: '15px', color: '#0f172a', outline: 'none'
                }}
                required
              />
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
              {t('adminPayments.remainingBalance', 'Remaining Balance:')} <span style={{ fontWeight: 700, color: '#0f172a' }}>${invoice.balance.toFixed(2)}</span>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
              {t('adminPayments.paymentMethod', 'Payment Method')}
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              style={{
                width: '100%', padding: '12px 16px', border: '1px solid #cbd5e1', borderRadius: '12px', fontSize: '15px', color: '#0f172a', outline: 'none', backgroundColor: '#f8fafc'
              }}
              required
            >
              {paymentMethods.map(m => (
                <option key={m} value={m}>{t(m)}</option>
              ))}
            </select>
          </div>

          <div style={{ marginTop: '12px', display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ flex: 1, padding: '12px', border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: 'white', color: '#475569', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
            >
              {t('adminPayments.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '12px', backgroundColor: '#4f46e5', color: 'white', fontSize: '14px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? t('adminPayments.processing', 'Processing...') : t('adminPayments.confirmPayment', 'Confirm Payment')}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
