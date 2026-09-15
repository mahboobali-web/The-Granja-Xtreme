import React, { useState, useEffect, useMemo } from 'react';
import { X, CreditCard, DollarSign, ArrowRightLeft, Banknote, Edit3, Plus, Trash2, Check, AlertCircle, Truck, Package, ChevronDown, ChevronUp } from 'lucide-react';
import { fetchAPI } from '../utils/api';
import { useTranslation } from 'react-i18next';

interface AdminCollectPaymentModalProps {
  onClose: () => void;
  onSuccess: () => void;
  invoice: {
    _id: string;
    invoiceNumber?: string;
    bookingId?: any;
    orderId?: any;
    balance: number;
    amount: number;
    status?: string;
  };
  bookingId?: string;
  initialEditMode?: boolean;
}

export const AdminCollectPaymentModal: React.FC<AdminCollectPaymentModalProps> = ({ onClose, onSuccess, invoice: initialInvoice, bookingId, initialEditMode = false }) => {
  const { t } = useTranslation();
  const [exchangeRate, setExchangeRate] = useState<number>(58.80);
  const [currentInvoice, setCurrentInvoice] = useState(initialInvoice);
  const [booking, setBooking] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(initialEditMode);
  
  // Catalogs
  const [allAtvs, setAllAtvs] = useState<any[]>([]);
  const [allAccessories, setAllAccessories] = useState<any[]>([]);
  const [settings, setSettings] = useState({ baseTaxRate: 10, securityDeposit: 150 });

  // Editable Form State
  const [editStartDate, setEditStartDate] = useState<string>('');
  const [editEndDate, setEditEndDate] = useState<string>('');
  const [editAtvs, setEditAtvs] = useState<{ atvId: string; name: string; unitNumber?: string; model: string; ratePerDay: number | string }[]>([]);
  const [editAccessories, setEditAccessories] = useState<{ accessoryId: string; name: string; quantity: number; price: number | string }[]>([]);
  const [editDiscountRate, setEditDiscountRate] = useState<number | string>(0);
  const [editNotes, setEditNotes] = useState<string>('');
  const [selectedAtvToAdd, setSelectedAtvToAdd] = useState<string>('');
  const [selectedAccToAdd, setSelectedAccToAdd] = useState<string>('');

  // Payment Form State
  const [currency, setCurrency] = useState<'USD' | 'DOP'>('USD');
  const [amount, setAmount] = useState(initialInvoice.balance.toString());
  const [tendered, setTendered] = useState('');
  const [method, setMethod] = useState('Cash');
  const [loading, setLoading] = useState(false);
  const [savingEdits, setSavingEdits] = useState(false);
  const [editErrorMsg, setEditErrorMsg] = useState('');
  const [editSuccessMsg, setEditSuccessMsg] = useState('');
  const [paymentErrorMsg, setPaymentErrorMsg] = useState('');

  const bookingIdStr = useMemo(() => {
    if (bookingId) return bookingId;
    if (!currentInvoice.bookingId) return null;
    return typeof currentInvoice.bookingId === 'object' ? currentInvoice.bookingId._id : currentInvoice.bookingId;
  }, [bookingId, currentInvoice.bookingId]);

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
    const loadInitialData = async () => {
      try {
        const [settingsData, atvsData, accsData] = await Promise.all([
          fetchAPI('/settings').catch(() => null),
          fetchAPI('/atvs').catch(() => []),
          fetchAPI('/accessories').catch(() => [])
        ]);

        if (settingsData) {
          setSettings({
            baseTaxRate: settingsData.baseTaxRate !== undefined ? settingsData.baseTaxRate : 10,
            securityDeposit: settingsData.securityDeposit !== undefined ? settingsData.securityDeposit : 150
          });
          if (settingsData.exchangeRateDOP) {
            setExchangeRate(Number(settingsData.exchangeRateDOP));
          }
        }
        setAllAtvs(atvsData);
        setAllAccessories(accsData);

        if (bookingIdStr) {
          const bData = await fetchAPI(`/bookings/${bookingIdStr}`);
          setBooking(bData);
          setEditStartDate(bData.startDate ? new Date(bData.startDate).toISOString().split('T')[0] : '');
          setEditEndDate(bData.endDate ? new Date(bData.endDate).toISOString().split('T')[0] : '');
          setEditDiscountRate(bData.discountRate || 0);
          setEditNotes(bData.notes || '');

          const atvsList = bData.atvIds && bData.atvIds.length > 0 ? bData.atvIds : (bData.atvId ? [bData.atvId] : []);
          const mappedAtvs = atvsList.map((a: any) => {
            const snap = bData.snapshotAtvRates?.find((s: any) => (s.atvId?._id || s.atvId) === a._id);
            return {
              atvId: a._id,
              name: a.name,
              unitNumber: a.unitNumber,
              model: a.model,
              ratePerDay: snap ? snap.ratePerDay : (a.ratePerDay || 0)
            };
          });
          setEditAtvs(mappedAtvs);

          if (bData.accessories && Array.isArray(bData.accessories)) {
            setEditAccessories(bData.accessories.map((acc: any) => ({
              accessoryId: acc.accessoryId?._id || acc.accessoryId || acc._id,
              name: acc.name,
              quantity: acc.quantity || 1,
              price: acc.price || 0
            })));
          }
        }
      } catch (err) {
        console.error('Failed to load initial booking/payment data', err);
      }
    };
    loadInitialData();
  }, [bookingIdStr]);

  // Recalculate Live Financials for the Edit Mode
  const calculatedTotals = useMemo(() => {
    if (!editStartDate || !editEndDate) {
      return { days: 1, baseRate: 0, tax: 0, deposit: 0, accessoriesSum: 0, discountAmount: 0, grandTotal: currentInvoice.amount, newBalance: currentInvoice.balance };
    }

    const s = new Date(editStartDate);
    const e = new Date(editEndDate);
    const diffTime = e.getTime() - s.getTime();
    const days = Math.max(1, Math.round(diffTime / (1000 * 3600 * 24)));

    const parsedDiscountRate = Math.max(0, Math.min(100, parseFloat(String(editDiscountRate)) || 0));

    const baseRate = days * editAtvs.reduce((sum, a) => sum + (parseFloat(String(a.ratePerDay)) || 0), 0);
    const discountAmount = Math.round(baseRate * (parsedDiscountRate / 100) * 100) / 100;
    const taxRate = booking?.snapshotTaxRate !== undefined ? booking.snapshotTaxRate : (settings.baseTaxRate || 10);
    const tax = Math.round((baseRate - discountAmount) * (taxRate / 100) * 100) / 100;
    const deposit = booking?.snapshotSecurityDeposit !== undefined ? booking.snapshotSecurityDeposit : (settings.securityDeposit ?? 150);
    const accessoriesSum = editAccessories.reduce((sum, a) => sum + ((parseFloat(String(a.price)) || 0) * Number(a.quantity || 0)), 0);
    const extraChargesSum = booking?.extraCharges?.reduce((sum: number, c: any) => sum + Number(c.amount || 0), 0) || 0;

    const grandTotal = Math.max(0, baseRate - discountAmount + tax + deposit + accessoriesSum + extraChargesSum);
    
    // Compute paid so far
    const paidSoFar = (booking?.payment?.amountPaid !== undefined) 
      ? booking.payment.amountPaid 
      : Math.max(0, currentInvoice.amount - currentInvoice.balance);

    const newBalance = Math.max(0, Math.round((grandTotal - paidSoFar) * 100) / 100);

    return { days, baseRate, tax, deposit, accessoriesSum, discountAmount, grandTotal, newBalance };
  }, [editStartDate, editEndDate, editAtvs, editAccessories, editDiscountRate, settings, booking, currentInvoice]);

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

  const balanceInDOP = Math.round(currentInvoice.balance * exchangeRate * 100) / 100;

  // Calculated conversions
  const parsedInput = parseFloat(amount) || 0;
  const convertedEquivalent = currency === 'USD'
    ? `RD$ ${(parsedInput * exchangeRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DOP`
    : `$${(parsedInput / exchangeRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;

  // Change Calculation
  const parsedTendered = parseFloat(tendered) || 0;
  const changeDue = parsedTendered > parsedInput ? parsedTendered - parsedInput : 0;

  // Add Vehicle handler
  const handleAddVehicle = () => {
    if (!selectedAtvToAdd) return;
    const found = allAtvs.find(a => a._id === selectedAtvToAdd);
    if (!found) return;
    if (editAtvs.some(a => a.atvId === found._id)) {
      setEditErrorMsg(t('Vehicle already added to this reservation.'));
      return;
    }
    setEditAtvs(prev => [...prev, {
      atvId: found._id,
      name: found.name,
      unitNumber: found.unitNumber,
      model: found.model,
      ratePerDay: found.ratePerDay
    }]);
    setSelectedAtvToAdd('');
    setEditErrorMsg('');
  };

  // Remove Vehicle handler
  const handleRemoveVehicle = (atvId: string) => {
    if (editAtvs.length <= 1) {
      setEditErrorMsg(t('A reservation must have at least one vehicle.'));
      return;
    }
    setEditAtvs(prev => prev.filter(a => a.atvId !== atvId));
    setEditErrorMsg('');
  };

  // Add Accessory handler
  const handleAddAccessory = () => {
    if (!selectedAccToAdd) return;
    const found = allAccessories.find(a => a._id === selectedAccToAdd);
    if (!found) return;
    const existing = editAccessories.find(a => a.accessoryId === found._id);
    if (existing) {
      setEditAccessories(prev => prev.map(a => a.accessoryId === found._id ? { ...a, quantity: a.quantity + 1 } : a));
    } else {
      setEditAccessories(prev => [...prev, {
        accessoryId: found._id,
        name: found.name,
        quantity: 1,
        price: found.price
      }]);
    }
    setSelectedAccToAdd('');
    setEditErrorMsg('');
  };

  // Save Edits to backend
  const handleSaveEdits = async (): Promise<boolean> => {
    if (!bookingIdStr) return false;
    setSavingEdits(true);
    setEditErrorMsg('');
    setEditSuccessMsg('');

    if (editAtvs.length === 0) {
      setEditErrorMsg(t('At least one vehicle must be selected.'));
      setSavingEdits(false);
      return false;
    }

    try {
      // 1. Verify availability of selected vehicles
      const availRes = await fetchAPI('/atvs/batch-availability', {
        method: 'POST',
        body: {
          atvIds: editAtvs.map(a => a.atvId),
          start: editStartDate,
          end: editEndDate,
          excludeBookingId: bookingIdStr
        }
      });

      if (!availRes.allAvailable) {
        const conflictNames = (availRes.conflictingAtvs || []).map((c: any) => `${c.unitNumber ? `[${c.unitNumber}] ` : ''}${c.atvName}`).join(', ');
        setEditErrorMsg(`${t('Conflict Detected: The following vehicle(s) are unavailable:')} ${conflictNames}`);
        setSavingEdits(false);
        return false;
      }

      // 2. Persist update to backend
      const result = await fetchAPI(`/bookings/${bookingIdStr}`, {
        method: 'PUT',
        body: {
          atvIds: editAtvs.map(a => a.atvId),
          snapshotAtvRates: editAtvs.map(a => ({ 
            atvId: a.atvId, 
            ratePerDay: parseFloat(String(a.ratePerDay)) || 0 
          })),
          startDate: editStartDate,
          endDate: editEndDate,
          accessories: editAccessories.map(a => ({
            accessoryId: a.accessoryId,
            name: a.name,
            quantity: Number(a.quantity) || 1,
            price: parseFloat(String(a.price)) || 0
          })),
          discountRate: Math.max(0, Math.min(100, parseFloat(String(editDiscountRate)) || 0)),
          notes: editNotes
        }
      });

      if (result.invoice) {
        setCurrentInvoice(result.invoice);
        setAmount(result.invoice.balance.toString());
      }
      if (result.booking) {
        setBooking(result.booking);
      }

      setEditSuccessMsg(t('Reservation details updated and balance recalculated successfully!'));
      setSavingEdits(false);

      // Real-time parent refresh without closing the drawer or requiring browser reload:
      try {
        if (onSuccess) onSuccess();
        window.dispatchEvent(new Event('refreshNotifications'));
      } catch (e) {
        console.error('Failed to notify parent of booking update', e);
      }

      return true;
    } catch (err: any) {
      console.error(err);
      setEditErrorMsg(err.message || t('Failed to update reservation.'));
      setSavingEdits(false);
      return false;
    }
  };

  // Submit Payment Collection
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPaymentErrorMsg('');

    // If there were unsaved edits open, save them first
    if (isEditing) {
      const saved = await handleSaveEdits();
      if (!saved) {
        setLoading(false);
        return;
      }
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setPaymentErrorMsg(t('adminPayments.invalidAmount', 'Please enter a valid payment amount.'));
      setLoading(false);
      return;
    }

    let usdAmount = parsedAmount;
    let originalAmount = parsedAmount;

    if (currency === 'DOP') {
      usdAmount = Math.round((parsedAmount / exchangeRate) * 100) / 100;
      originalAmount = parsedAmount;
    }

    const currentBal = currentInvoice.balance;
    if (usdAmount > currentBal + 0.01) {
      const maxLimit = currency === 'USD' ? `$${currentBal.toFixed(2)}` : `RD$ ${(currentBal * exchangeRate).toLocaleString()} DOP`;
      setPaymentErrorMsg(`${t('adminPayments.invalidAmount', 'Amount exceeds remaining balance of')} ${maxLimit}.`);
      setLoading(false);
      return;
    }

    try {
      await fetchAPI(`/bookings/${bookingIdStr || currentInvoice._id}/collect-payment`, {
        method: 'PUT',
        body: { 
          amount: usdAmount, 
          method, 
          invoiceId: currentInvoice._id,
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
      setPaymentErrorMsg(err.message || t('adminPayments.failedRecordPayment', 'Failed to record payment.'));
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000,
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '24px',
        width: '100%',
        maxWidth: isEditing ? '860px' : '540px',
        transition: 'max-width 0.3s ease',
        padding: '32px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        maxHeight: '92vh',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ backgroundColor: 'rgba(57, 103, 89, 0.1)', padding: '10px', borderRadius: '12px' }}>
              <CreditCard size={24} color="#396759" />
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {t('adminPayments.collectPaymentTitle', 'Collect Payment')}
              </h2>
              <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{currentInvoice.invoiceNumber ? `Invoice: ${currentInvoice.invoiceNumber}` : ''}</span>
                <span>•</span>
                <span>{t("Rate:")} <strong>1 USD = {exchangeRate} DOP</strong></span>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
            <X size={24} />
          </button>
        </div>

        {/* Edit Toggle Button for Unpaid Bookings */}
        {bookingIdStr && currentInvoice.status !== 'Paid' && (
          <div style={{ marginBottom: '20px' }}>
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                backgroundColor: isEditing ? '#eff6ff' : '#f8fafc',
                border: `1px solid ${isEditing ? '#bfdbfe' : '#e2e8f0'}`,
                borderRadius: '12px',
                color: isEditing ? '#1d4ed8' : '#334155',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit3 size={16} color={isEditing ? '#2563eb' : '#64748b'} />
                <span>{isEditing ? t('Close Edit Panel & View Summary') : t('✏️ Edit Vehicles, Accessories & Rates Before Payment')}</span>
              </div>
              {isEditing ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
        )}

        {/* EDIT PANEL */}
        {isEditing && bookingIdStr && (
          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '20px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit3 size={18} color="#396759" /> {t('Edit Reservation Items & Pricing')}
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', backgroundColor: '#dcfce7', padding: '4px 8px', borderRadius: '6px' }}>
                {t('Live Recalculation Active')}
              </span>
            </div>

            {/* Dates Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  {t('Start Date')}
                </label>
                <input
                  type="date"
                  value={editStartDate}
                  onChange={e => setEditStartDate(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', fontWeight: 600, outline: 'none', backgroundColor: 'white' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  {t('End Date')}
                </label>
                <input
                  type="date"
                  value={editEndDate}
                  onChange={e => setEditEndDate(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', fontWeight: 600, outline: 'none', backgroundColor: 'white' }}
                />
              </div>
            </div>

            {/* Vehicles Manager */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Truck size={16} color="#10b981" /> {t('Assigned Vehicles')} ({editAtvs.length})
                </label>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                {editAtvs.map((atv, index) => (
                  <div key={atv.atvId || index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                    <div>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                        {atv.unitNumber ? `[${atv.unitNumber}] ` : ''}{atv.name}
                      </span>
                      <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '6px' }}>({atv.model})</span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>Rate/Day: $</span>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={atv.ratePerDay}
                          onChange={e => {
                            const val = e.target.value;
                            setEditAtvs(prev => prev.map((a, i) => i === index ? { ...a, ratePerDay: val } : a));
                          }}
                          onBlur={e => {
                            const num = parseFloat(e.target.value);
                            setEditAtvs(prev => prev.map((a, i) => i === index ? { ...a, ratePerDay: isNaN(num) || num < 0 ? 0 : num } : a));
                          }}
                          style={{ width: '75px', padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', fontWeight: 700, outline: 'none' }}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveVehicle(atv.atvId)}
                        disabled={editAtvs.length <= 1}
                        style={{ background: 'none', border: 'none', cursor: editAtvs.length <= 1 ? 'not-allowed' : 'pointer', color: editAtvs.length <= 1 ? '#cbd5e1' : '#ef4444' }}
                        title={t('Remove vehicle')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Vehicle Selector */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  value={selectedAtvToAdd}
                  onChange={e => setSelectedAtvToAdd(e.target.value)}
                  style={{ flex: 1, padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', outline: 'none', backgroundColor: 'white' }}
                >
                  <option value="">{t('-- Select Vehicle to Add to Booking --')}</option>
                  {allAtvs
                    .filter(a => !editAtvs.some(ea => ea.atvId === a._id))
                    .map(a => (
                      <option key={a._id} value={a._id}>
                        {a.unitNumber ? `[${a.unitNumber}] ` : ''}{a.name} ({a.model}) - ${a.ratePerDay}/day {a.status !== 'AVAILABLE' ? `(${a.status})` : ''}
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddVehicle}
                  disabled={!selectedAtvToAdd}
                  style={{ padding: '8px 16px', backgroundColor: selectedAtvToAdd ? '#10b981' : '#cbd5e1', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: selectedAtvToAdd ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Plus size={16} /> {t('Add')}
                </button>
              </div>
            </div>

            {/* Accessories Manager */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Package size={16} color="#8b5cf6" /> {t('Accessories & Gear')} ({editAccessories.length})
                </label>
              </div>

              {editAccessories.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                  {editAccessories.map((acc, index) => (
                    <div key={acc.accessoryId || index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{acc.name}</span>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        {/* Price per unit */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>$</span>
                          <input
                            type="number"
                            step="any"
                            min="0"
                            value={acc.price}
                            onChange={e => {
                              const val = e.target.value;
                              setEditAccessories(prev => prev.map((a, i) => i === index ? { ...a, price: val } : a));
                            }}
                            onBlur={e => {
                              const num = parseFloat(e.target.value);
                              setEditAccessories(prev => prev.map((a, i) => i === index ? { ...a, price: isNaN(num) || num < 0 ? 0 : num } : a));
                            }}
                            style={{ width: '65px', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', fontWeight: 700, outline: 'none' }}
                          />
                        </div>

                        {/* Quantity with - + buttons */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              if (acc.quantity <= 1) {
                                setEditAccessories(prev => prev.filter((_, i) => i !== index));
                              } else {
                                setEditAccessories(prev => prev.map((a, i) => i === index ? { ...a, quantity: a.quantity - 1 } : a));
                              }
                            }}
                            style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', cursor: 'pointer', fontWeight: 700 }}
                          >
                            -
                          </button>
                          <span style={{ fontSize: '13px', fontWeight: 800, minWidth: '20px', textAlign: 'center' }}>{acc.quantity}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditAccessories(prev => prev.map((a, i) => i === index ? { ...a, quantity: a.quantity + 1 } : a));
                            }}
                            style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', cursor: 'pointer', fontWeight: 700 }}
                          >
                            +
                          </button>
                        </div>

                        {/* Line Total */}
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', minWidth: '60px', textAlign: 'right' }}>
                          ${((parseFloat(String(acc.price)) || 0) * (Number(acc.quantity) || 0)).toFixed(2)}
                        </span>

                        <button
                          type="button"
                          onClick={() => setEditAccessories(prev => prev.filter((_, i) => i !== index))}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Accessory Selector */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  value={selectedAccToAdd}
                  onChange={e => setSelectedAccToAdd(e.target.value)}
                  style={{ flex: 1, padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', outline: 'none', backgroundColor: 'white' }}
                >
                  <option value="">{t('-- Select Accessory to Add --')}</option>
                  {allAccessories.map(a => (
                    <option key={a._id} value={a._id}>
                      {a.name} - ${a.price} (Stock: {a.quantity})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddAccessory}
                  disabled={!selectedAccToAdd}
                  style={{ padding: '8px 16px', backgroundColor: selectedAccToAdd ? '#8b5cf6' : '#cbd5e1', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: selectedAccToAdd ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Plus size={16} /> {t('Add')}
                </button>
              </div>
            </div>

            {/* Discount & Notes */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  {t('Discount Rate (%)')}
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  max="100"
                  value={editDiscountRate}
                  onChange={e => setEditDiscountRate(e.target.value)}
                  onBlur={e => {
                    const num = parseFloat(e.target.value);
                    setEditDiscountRate(isNaN(num) || num < 0 ? 0 : Math.min(100, num));
                  }}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', fontWeight: 700, outline: 'none', backgroundColor: 'white' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  {t('Reservation Notes')}
                </label>
                <input
                  type="text"
                  placeholder={t('Optional notes...')}
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', outline: 'none', backgroundColor: 'white' }}
                />
              </div>
            </div>

            {/* Recalculated Live Totals Summary */}
            <div style={{ backgroundColor: 'white', border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#475569' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{t('Vehicles Base Rate')} ({calculatedTotals.days} {calculatedTotals.days > 1 ? t('days') : t('day')} × {editAtvs.length} ATV):</span>
                <strong>${calculatedTotals.baseRate.toFixed(2)}</strong>
              </div>
              {calculatedTotals.discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                  <span>{t('Discount')} ({editDiscountRate}%):</span>
                  <strong>-${calculatedTotals.discountAmount.toFixed(2)}</strong>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{t('Luxury Tax')} ({booking?.snapshotTaxRate || settings.baseTaxRate}%):</span>
                <strong>${calculatedTotals.tax.toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{t('Security Deposit')}:</span>
                <strong>${calculatedTotals.deposit.toFixed(2)}</strong>
              </div>
              {calculatedTotals.accessoriesSum > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{t('Accessories Subtotal')}:</span>
                  <strong>${calculatedTotals.accessoriesSum.toFixed(2)}</strong>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '8px', fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                <span>{t('Updated Grand Total')}:</span>
                <span style={{ color: '#396759' }}>${calculatedTotals.grandTotal.toFixed(2)} USD</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 800, color: '#b91c1c' }}>
                <span>{t('New Balance Due')}:</span>
                <span>${calculatedTotals.newBalance.toFixed(2)} USD (RD$ {(calculatedTotals.newBalance * exchangeRate).toLocaleString()} DOP)</span>
              </div>
            </div>

            {/* Save Edits Action & Real-Time Feedback */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', width: '100%', marginTop: '8px' }}>
              <button
                type="button"
                onClick={handleSaveEdits}
                disabled={savingEdits}
                style={{
                  padding: '12px 32px',
                  backgroundColor: '#396759',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: savingEdits ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(57, 103, 89, 0.35)',
                  minWidth: '280px',
                  transition: 'background-color 0.2s, transform 0.1s'
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#2f5d50')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#396759')}
              >
                <Check size={18} /> {savingEdits ? t('Saving...') : t('Save Changes & Update Balance')}
              </button>

              {editErrorMsg && (
                <div style={{ width: '100%', backgroundColor: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <AlertCircle size={18} /> {editErrorMsg}
                </div>
              )}

              {editSuccessMsg && (
                <div style={{ width: '100%', backgroundColor: '#f0fdf4', color: '#166534', padding: '12px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Check size={18} /> {editSuccessMsg}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Balance Overview Card */}
        <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
            {t('adminPayments.remainingBalance', 'Remaining Balance')}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a' }}>
              ${currentInvoice.balance.toFixed(2)} <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>USD</span>
            </span>
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#059669' }}>
              RD$ {balanceInDOP.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DOP
            </span>
          </div>
        </div>

        {/* Payment Form */}
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
                RD$ DOP (Pesos)
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
                  if (currency === 'USD') setAmount(currentInvoice.balance.toString());
                  else setAmount(balanceInDOP.toString());
                }}
                style={{ background: 'none', border: 'none', color: '#396759', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
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
                  width: '100%',
                  padding: '12px 16px 12px 48px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#0f172a',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                required
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
              <ArrowRightLeft size={13} />
              <span>{t("Equivalent:")} <strong style={{ color: '#0f172a' }}>{convertedEquivalent}</strong></span>
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
                <Banknote size={16} /> {t("Cash Tendered & Change Due (Vuelto)")}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'center' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#15803d', marginBottom: '4px' }}>
                    {t("Cash Received")} ({currency})
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
                    {t("Change to Return")}
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: changeDue > 0 ? '#15803d' : '#64748b' }}>
                    {currency === 'DOP' ? `RD$ ${changeDue.toFixed(2)}` : `$${changeDue.toFixed(2)}`}
                  </div>
                </div>
              </div>
            </div>
          )}

          {paymentErrorMsg && (
            <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={18} /> {paymentErrorMsg}
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
              disabled={loading || savingEdits}
              style={{
                flex: 1,
                padding: '12px',
                border: 'none',
                borderRadius: '12px',
                backgroundColor: '#396759',
                color: 'white',
                fontSize: '14px',
                fontWeight: 700,
                cursor: loading || savingEdits ? 'not-allowed' : 'pointer',
                opacity: loading || savingEdits ? 0.7 : 1,
                boxShadow: '0 4px 14px rgba(57, 103, 89, 0.35)',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#2f5d50')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#396759')}
            >
              {loading ? t('adminPayments.processing', 'Processing...') : t('adminPayments.confirmPayment', 'Complete Payment')}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
