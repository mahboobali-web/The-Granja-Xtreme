import React, { useState, useEffect } from 'react';
import { X, CreditCard, DollarSign, ArrowRightLeft, Banknote } from 'lucide-react';
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
  const [exchangeRate, setExchangeRate] = useState<number>(58.80);
  const [currency, setCurrency] = useState<'USD' | 'DOP'>('USD');
  const [amount, setAmount] = useState(invoice.balance.toString());
  const [tendered, setTendered] = useState('');
  const [method, setMethod] = useState('Cash');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const paymentMethods = [
    'Cash',
    'Banco Popular',
    'Banreservas',
    'Zelle',
    'PayPal',
    'Apple Pay',
    'Google Pay',
    'International Card'
  ];

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await fetchAPI('/settings');
        if (settings && settings.exchangeRateDOP) {
          setExchangeRate(Number(settings.exchangeRateDOP));
        }
      } catch (err) {
        console.warn('Could not load exchange rate from settings, using default 58.80');
      }
    };
    loadSettings();
  }, []);

  // When currency switches, convert the amount input
  const handleCurrencyChange = (newCurrency: 'USD' | 'DOP') => {
    if (newCurrency === currency) return;
    setCurrency(newCurrency);
    const currentVal = parseFloat(amount) || 0;
    if (newCurrency === 'DOP') {
      const inDOP = (currentVal * exchangeRate).toFixed(2);
      setAmount(inDOP);
      setTendered('');
    } else {
      const inUSD = (currentVal / exchangeRate).toFixed(2);
      setAmount(inUSD);
      setTendered('');
    }
  };

  const balanceInDOP = Math.round(invoice.balance * exchangeRate * 100) / 100;

  // Calculated conversions
  const parsedInput = parseFloat(amount) || 0;
  const convertedEquivalent = currency === 'USD'
    ? `RD$ ${(parsedInput * exchangeRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DOP`
    : `$${(parsedInput / exchangeRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;

  // Change Calculation
  const parsedTendered = parseFloat(tendered) || 0;
  const changeDue = parsedTendered > parsedInput ? parsedTendered - parsedInput : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg(t('adminPayments.invalidAmount', 'Please enter a valid payment amount.'));
      setLoading(false);
      return;
    }

    let usdAmount = parsedAmount;
    let originalAmount = parsedAmount;

    if (currency === 'DOP') {
      usdAmount = Math.round((parsedAmount / exchangeRate) * 100) / 100;
      originalAmount = parsedAmount;
    }

    if (usdAmount > invoice.balance + 0.01) {
      const maxLimit = currency === 'USD' ? `$${invoice.balance.toFixed(2)}` : `RD$ ${balanceInDOP.toLocaleString()} DOP`;
      setErrorMsg(`${t('adminPayments.invalidAmount', 'Amount exceeds remaining balance of')} ${maxLimit}.`);
      setLoading(false);
      return;
    }

    try {
      const bookingIdStr = typeof invoice.bookingId === 'object' ? (invoice.bookingId as any)._id : invoice.bookingId;
      await fetchAPI(`/bookings/${bookingIdStr}/collect-payment`, {
        method: 'PUT',
        body: { 
          amount: usdAmount, 
          method, 
          invoiceId: invoice._id,
          currency,
          originalAmount,
          exchangeRate,
          tenderedAmount: parsedTendered > 0 ? parsedTendered : undefined,
          changeGiven: changeDue > 0 ? changeDue : undefined
        }
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
        maxWidth: '520px',
        padding: '32px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ backgroundColor: '#eef2ff', padding: '10px', borderRadius: '12px' }}>
              <CreditCard size={24} color="#4f46e5" />
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{t('adminPayments.collectPaymentTitle', 'Collect Payment')}</h2>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Rate: <strong>1 USD = {exchangeRate} DOP</strong></div>
            </div>
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

        {/* Balance Overview Card */}
        <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
            {t('adminPayments.remainingBalance', 'Remaining Balance')}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>
              ${invoice.balance.toFixed(2)} <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>USD</span>
            </span>
            <span style={{ fontSize: '16px', fontWeight: 700, color: '#059669' }}>
              RD$ {balanceInDOP.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DOP
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Currency Switcher */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
              {t('adminPayments.paymentCurrency', 'Payment Currency')}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '12px' }}>
              <button
                type="button"
                onClick={() => handleCurrencyChange('USD')}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: currency === 'USD' ? 'white' : 'transparent',
                  color: currency === 'USD' ? '#0f172a' : '#64748b',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: currency === 'USD' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                💵 USD ($)
              </button>
              <button
                type="button"
                onClick={() => handleCurrencyChange('DOP')}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: currency === 'DOP' ? 'white' : 'transparent',
                  color: currency === 'DOP' ? '#059669' : '#64748b',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: currency === 'DOP' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                🇩🇴 DOP (RD$)
              </button>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>
                {t('adminPayments.amountToCollect', 'Amount to Collect')} ({currency})
              </label>
              <button
                type="button"
                onClick={() => {
                  if (currency === 'USD') setAmount(invoice.balance.toString());
                  else setAmount(balanceInDOP.toString());
                }}
                style={{ background: 'none', border: 'none', color: '#4f46e5', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                {t('adminPayments.payFull', 'Pay Full Balance')}
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: '#64748b' }}>
                {currency === 'USD' ? '$' : 'RD$'}
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{
                  width: '100%', padding: '12px 16px 12px 54px', border: '1px solid #cbd5e1', borderRadius: '12px', fontSize: '16px', fontWeight: 700, color: '#0f172a', outline: 'none'
                }}
                required
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
              <ArrowRightLeft size={13} />
              <span>Equivalent: <strong style={{ color: '#0f172a' }}>{convertedEquivalent}</strong></span>
            </div>
          </div>

          {/* Payment Method */}
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

          {/* Cash Tendered & Change (Vuelto) Calculator */}
          {method === 'Cash' && (
            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#166534', fontWeight: 700, fontSize: '13px' }}>
                <Banknote size={16} /> Cash Tendered & Change Due (Vuelto)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'center' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#15803d', marginBottom: '4px' }}>
                    Cash Received ({currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder={`e.g. ${currency === 'DOP' ? '11000' : '200'}`}
                    value={tendered}
                    onChange={(e) => setTendered(e.target.value)}
                    style={{
                      width: '100%', padding: '8px 12px', border: '1px solid #86efac', borderRadius: '8px', fontSize: '14px', fontWeight: 600, outline: 'none', backgroundColor: 'white'
                    }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#15803d', marginBottom: '4px' }}>
                    Change to Return
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: changeDue > 0 ? '#15803d' : '#64748b' }}>
                    {currency === 'DOP' ? `RD$ ${changeDue.toFixed(2)}` : `$${changeDue.toFixed(2)}`}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div style={{ marginTop: '8px', display: 'flex', gap: '12px' }}>
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
