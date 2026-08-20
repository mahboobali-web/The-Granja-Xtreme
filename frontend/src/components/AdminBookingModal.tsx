import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, User, Truck, PenTool, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { fetchAPI } from '../utils/api';
import { SignatureModal } from './SignatureModal';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useTranslation } from 'react-i18next';
import { formatAtvName } from '../utils/formatAtv';

interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface ATV {
  _id: string;
  name: string;
  nameEs?: string;
  model: string;
  unitNumber?: string;
  color?: string;
  ratePerDay: number;
  status: string;
}

interface AvailabilityDetail {
  atvId: string;
  atvName: string;
  model: string;
  unitNumber?: string;
  available: boolean;
  reason?: string;
}

export const AdminBookingModal: React.FC<{ onClose: () => void; onSuccess: () => void }> = ({ onClose, onSuccess }) => {
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState(1);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [atvs, setAtvs] = useState<ATV[]>([]);
  const [settings, setSettings] = useState({ baseTaxRate: 10, securityDeposit: 150 });
  
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedAtvIds, setSelectedAtvIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [customDiscountRate, setCustomDiscountRate] = useState<number | ''>('');
  
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, AvailabilityDetail>>({});
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSignature, setShowSignature] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cData, aData, sData] = await Promise.all([
          fetchAPI('/auth/customers'),
          fetchAPI('/atvs'),
          fetchAPI('/settings').catch(() => null)
        ]);
        setCustomers(cData);
        setAtvs(aData);
        if (sData) setSettings(sData);
      } catch (e) {
        console.error(e);
      }
    };
    loadData();
  }, []);

  // Whenever dates change, run batch availability check
  useEffect(() => {
    const checkAvailability = async () => {
      if (!startDate || !endDate) {
        setAvailabilityMap({});
        return;
      }

      setCheckingAvailability(true);
      try {
        const res = await fetchAPI('/atvs/batch-availability', {
          method: 'POST',
          body: {
            start: startDate,
            end: endDate
          }
        });

        const map: Record<string, AvailabilityDetail> = {};
        if (res.details && Array.isArray(res.details)) {
          res.details.forEach((item: AvailabilityDetail) => {
            map[item.atvId] = item;
          });
        }
        setAvailabilityMap(map);
      } catch (err) {
        console.error('Failed batch availability check', err);
      } finally {
        setCheckingAvailability(false);
      }
    };

    checkAvailability();
  }, [startDate, endDate]);

  const toggleAtvSelection = (id: string) => {
    setSelectedAtvIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const selectAllAvailable = () => {
    const availableIds = atvs
      .filter(a => {
        if (a.status === 'MAINTENANCE' || a.status === 'DECOMMISSIONED') return false;
        if (startDate && endDate && availabilityMap[a._id] && !availabilityMap[a._id].available) return false;
        return true;
      })
      .map(a => a._id);
    setSelectedAtvIds(availableIds);
  };

  const clearAtvSelection = () => {
    setSelectedAtvIds([]);
  };

  // Find any selected vehicle that has a double-booking conflict
  const getConflictingSelectedAtvs = () => {
    if (!startDate || !endDate) return [];
    return selectedAtvIds
      .map(id => {
        const detail = availabilityMap[id];
        const atv = atvs.find(a => a._id === id);
        if (detail && !detail.available && atv) {
          return { atv, detail };
        }
        return null;
      })
      .filter(Boolean) as { atv: ATV; detail: AvailabilityDetail }[];
  };

  const conflictingSelectedAtvs = getConflictingSelectedAtvs();

  const getDaysCount = () => {
    if (!startDate || !endDate) return 0;
    const s = new Date(startDate);
    const e = new Date(endDate);
    const diffTime = e.getTime() - s.getTime();
    if (diffTime < 0) return 0;
    return Math.max(1, Math.ceil(diffTime / (1000 * 3600 * 24)) + 1);
  };

  const calculateItemizedTotals = () => {
    const days = getDaysCount();
    if (days <= 0 || selectedAtvIds.length === 0) return { items: [], grandTotal: 0, totalBase: 0, totalTax: 0, totalDeposit: 0, discountAmount: 0, discountRate: 0 };

    let totalBase = 0;
    let totalTax = 0;

    const items = selectedAtvIds.map(id => {
      const atv = atvs.find(a => a._id === id);
      if (!atv) return null;

      const baseRate = days * atv.ratePerDay;
      const tax = Math.round(baseRate * (settings.baseTaxRate / 100) * 100) / 100;
      const securityDeposit = 0; // Deposit is added once for the whole booking, not per item
      const itemTotal = baseRate + tax;

      totalBase += baseRate;
      totalTax += tax;

      return {
        atv,
        days,
        baseRate,
        tax,
        securityDeposit,
        itemTotal
      };
    }).filter(Boolean);

    const totalDeposit = settings.securityDeposit || 150;
    const discountRate = customDiscountRate !== '' ? Number(customDiscountRate) : ((settings as any).defaultDiscountRate || 0);
    const discountAmount = Math.round(totalBase * (discountRate / 100) * 100) / 100;
    const recalculatedTax = Math.round((totalBase - discountAmount) * (settings.baseTaxRate / 100) * 100) / 100;
    const grandTotal = totalBase - discountAmount + recalculatedTax + totalDeposit;
    return { items, grandTotal, totalBase, totalTax: recalculatedTax, totalDeposit, discountAmount, discountRate };
  };

  const handleReviewConfirm = async () => {
    setLoading(true);
    setError('');

    if (selectedAtvIds.length === 0) {
      setError('Please select at least one vehicle.');
      setLoading(false);
      return;
    }

    if (!selectedCustomerId) {
      setError('Please select a customer or create a new one first.');
      setLoading(false);
      return;
    }

    if (!startDate || !endDate) {
      setError('Please select start and end dates.');
      setLoading(false);
      return;
    }

    // Server side batch availability validation check
    try {
      const res = await fetchAPI('/atvs/batch-availability', {
        method: 'POST',
        body: {
          atvIds: selectedAtvIds,
          start: startDate,
          end: endDate
        }
      });

      if (!res.allAvailable) {
        const conflictNames = (res.conflictingAtvs || []).map((c: any) => `${c.unitNumber ? `[${c.unitNumber}] ` : ''}${c.atvName}`).join(', ');
        setError(`Conflict Detected: The following vehicle(s) are already booked for the chosen dates: ${conflictNames}`);
        setLoading(false);
        return;
      }

      setStep(3);
    } catch (err: any) {
      setError(err.message || 'Failed to verify vehicle availability.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchAPI('/bookings/admin-create', {
        method: 'POST',
        body: {
          customerId: selectedCustomerId,
          atvIds: selectedAtvIds,
          startDate,
          endDate,
          notes,
          customDiscountRate: customDiscountRate !== '' ? Number(customDiscountRate) : undefined
        }
      });
      setCreatedBookingId(result._id);
      setShowSignature(true);
    } catch (err: any) {
      setError(err.message || 'Failed to create reservation');
    } finally {
      setLoading(false);
    }
  };

  const handleSignatureComplete = async (url: string) => {
    try {
      await fetchAPI(`/bookings/${createdBookingId}/customer-signature`, {
        method: 'PUT',
        body: { signatureUrl: url }
      });
      setShowSignature(false);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to save signature');
    }
  };

  const totals = calculateItemizedTotals();

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '650px', padding: '32px', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', maxHeight: '90vh', overflowY: 'auto' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
          <X size={24} />
        </button>
        
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>{t('new_reservation', 'New Reservation')}</h2>
        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>{t('create_single_multi_reservations', 'Create single or multi-vehicle walk-in reservations')}</p>
        
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          <div style={{ flex: 1, height: '4px', backgroundColor: step >= 1 ? '#84cc16' : '#e2e8f0', borderRadius: '2px' }} />
          <div style={{ flex: 1, height: '4px', backgroundColor: step >= 2 ? '#84cc16' : '#e2e8f0', borderRadius: '2px' }} />
          <div style={{ flex: 1, height: '4px', backgroundColor: step >= 3 ? '#84cc16' : '#e2e8f0', borderRadius: '2px' }} />
        </div>

        {error && (
          <div style={{ padding: '14px', backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444', color: '#991b1b', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>{t(error, error)}</div>
          </div>
        )}

        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}><User size={16} /> {t('select_customer', 'Select Customer')}</label>
              <select 
                value={selectedCustomerId} 
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
              >
                <option value="">{t('choose_a_customer', '-- Choose a customer --')}</option>
                {customers.map(c => <option key={c._id} value={c._id}>{c.firstName} {c.lastName} ({c.email})</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button 
                disabled={!selectedCustomerId}
                onClick={() => setStep(2)}
                style={{ backgroundColor: selectedCustomerId ? '#4d7c0f' : '#94a3b8', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', fontWeight: 700, cursor: selectedCustomerId ? 'pointer' : 'not-allowed' }}
              >{t('next_step', 'Next Step')}</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Date Pickers */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}><CalendarIcon size={16} /> {t('select_dates', 'Select Dates')}</label>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <DatePicker
                    selected={startDate ? new Date(`${startDate}T12:00:00`) : null}
                    onChange={(date: Date | null) => {
                      if (date) {
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        const val = `${year}-${month}-${day}`;
                        setStartDate(val);
                        if (endDate && val > endDate) {
                          setEndDate(val);
                        }
                      } else {
                        setStartDate('');
                      }
                    }}
                    minDate={new Date()}
                    dateFormat={i18n.language?.startsWith('es') ? 'dd/MM/yyyy' : 'MM/dd/yyyy'}
                    placeholderText={t('start_date', 'Start Date')}
                    customInput={<input style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} />}
                  />
                </div>
                <div style={{ flex: 1, position: 'relative' }}>
                  <DatePicker
                    selected={endDate ? new Date(`${endDate}T12:00:00`) : null}
                    onChange={(date: Date | null) => {
                      if (date) {
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        const val = `${year}-${month}-${day}`;
                        setEndDate(val);
                      } else {
                        setEndDate('');
                      }
                    }}
                    minDate={startDate ? new Date(`${startDate}T12:00:00`) : undefined}
                    dateFormat={i18n.language?.startsWith('es') ? 'dd/MM/yyyy' : 'MM/dd/yyyy'}
                    placeholderText={t('end_date', 'End Date')}
                    customInput={<input style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} />}
                  />
                </div>
              </div>
            </div>

            {/* Vehicle Selection Header & Action Buttons */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                  <Truck size={16} /> {t('select_vehicles', 'Select Vehicles')} 
                  <span style={{ backgroundColor: '#e2e8f0', color: '#0f172a', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 800 }}>
                    {selectedAtvIds.length} {t('selected', 'Selected')}
                  </span>
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    type="button" 
                    onClick={selectAllAvailable} 
                    style={{ fontSize: '11px', fontWeight: 700, color: '#4d7c0f', background: '#f7fee7', border: '1px solid #bef264', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer' }}
                  >
                    {t('select_all_available', 'Select All Available')}
                  </button>
                  <button 
                    type="button" 
                    onClick={clearAtvSelection} 
                    style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer' }}
                  >
                    {t('clear', 'Clear')}
                  </button>
                </div>
              </div>

              {/* Conflict Alert Banner */}
              {conflictingSelectedAtvs.length > 0 && (
                <div style={{ backgroundColor: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '8px', padding: '12px 16px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#be123c', fontWeight: 800, fontSize: '13px', marginBottom: '6px' }}>
                    <AlertCircle size={16} /> {t('double_booking_conflict_detected', 'Double Booking Conflict Detected')}
                  </div>
                  <div style={{ fontSize: '12px', color: '#9f1239', lineHeight: 1.4 }}>
                    {t('the_following_selected_vehicles_booked', 'The following selected vehicle(s) are already booked for the chosen date range:')}
                    <ul style={{ marginTop: '4px', paddingLeft: '18px', marginBottom: 0 }}>
                      {conflictingSelectedAtvs.map(({ atv, detail }) => (
                        <li key={atv._id} style={{ fontWeight: 700 }}>
                          {formatAtvName({...atv, name: i18n.language?.startsWith('es') ? (atv.nameEs || atv.name) : atv.name})}: <span style={{ fontWeight: 500 }}>{t(detail.reason || 'already_booked', 'Already reserved')}</span>
                        </li>
                      ))}
                    </ul>
                    <p style={{ marginTop: '6px', fontSize: '11px', fontStyle: 'italic', color: '#be123c', marginBottom: 0 }}>
                      {t('please_deselect_conflicting_vehicles', 'Please deselect the conflicting vehicle(s) or choose different dates to proceed.')}
                    </p>
                  </div>
                </div>
              )}

              {/* Multi-Select Vehicle List */}
              <div style={{ border: '1px solid #cbd5e1', borderRadius: '10px', maxHeight: '240px', overflowY: 'auto', backgroundColor: '#f8fafc', padding: '8px' }}>
                {atvs.map(a => {
                  const displayName = i18n.language?.startsWith('es') ? (a.nameEs || a.name) : a.name;
                  const isSelected = selectedAtvIds.includes(a._id);
                  const isMaintenance = a.status === 'MAINTENANCE' || a.status === 'DECOMMISSIONED';
                  const availability = availabilityMap[a._id];
                  const isBooked = availability && !availability.available && !isMaintenance;

                  let rowBg = '#ffffff';
                  let borderColor = '#e2e8f0';
                  if (isSelected) {
                    rowBg = isBooked || isMaintenance ? '#fef2f2' : '#f0fdf4';
                    borderColor = isBooked || isMaintenance ? '#fca5a5' : '#86efac';
                  }

                  return (
                    <div 
                      key={a._id}
                      onClick={() => !isMaintenance && toggleAtvSelection(a._id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        backgroundColor: rowBg,
                        border: `1px solid ${borderColor}`,
                        borderRadius: '8px',
                        marginBottom: '6px',
                        cursor: isMaintenance ? 'not-allowed' : 'pointer',
                        opacity: isMaintenance ? 0.6 : 1,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          disabled={isMaintenance}
                          onChange={() => {}} // Handled by row click
                          style={{ width: '18px', height: '18px', accentColor: '#4d7c0f', cursor: 'pointer' }}
                        />
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                            {formatAtvName({...a, name: displayName})}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            ${a.ratePerDay}/{t('day', 'day')}
                          </div>
                        </div>
                      </div>

                      <div>
                        {isMaintenance ? (
                          <span style={{ fontSize: '10px', fontWeight: 700, color: '#b45309', backgroundColor: '#fef3c7', padding: '3px 8px', borderRadius: '12px' }}>
                            {t('maintenance', 'Maintenance')}
                          </span>
                        ) : isBooked ? (
                          <span style={{ fontSize: '10px', fontWeight: 800, color: '#b91c1c', backgroundColor: '#fee2e2', padding: '3px 8px', borderRadius: '12px', border: '1px solid #fca5a5' }}>
                            ⚠️ {t('already_booked', 'Already Booked')}
                          </span>
                        ) : startDate && endDate ? (
                          <span style={{ fontSize: '10px', fontWeight: 700, color: '#15803d', backgroundColor: '#dcfce7', padding: '3px 8px', borderRadius: '12px' }}>
                            {t('available', 'Available')}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
              <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: 600, cursor: 'pointer' }}>{t('back', 'Back')}</button>
              <button 
                disabled={selectedAtvIds.length === 0 || !startDate || !endDate || conflictingSelectedAtvs.length > 0 || loading || checkingAvailability}
                onClick={handleReviewConfirm}
                style={{ 
                  backgroundColor: (selectedAtvIds.length > 0 && startDate && endDate && conflictingSelectedAtvs.length === 0 && !loading && !checkingAvailability) ? '#4d7c0f' : '#94a3b8', 
                  color: 'white', 
                  padding: '12px 24px', 
                  borderRadius: '8px', 
                  border: 'none', 
                  fontWeight: 700, 
                  cursor: (selectedAtvIds.length > 0 && startDate && endDate && conflictingSelectedAtvs.length === 0 && !loading && !checkingAvailability) ? 'pointer' : 'not-allowed' 
                }}
              >
                {loading || checkingAvailability ? t('checking_availability', 'Checking Availability...') : t('review_confirm', 'Review & Confirm')}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
                {t('itemized_summary', 'Itemized Summary')} ({selectedAtvIds.length} {selectedAtvIds.length === 1 ? t('vehicle', 'Vehicle') : t('vehicles', 'Vehicles')}, {getDaysCount()} {getDaysCount() === 1 ? t('day_label', 'Day') : t('days_plural', 'Days')})
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #cbd5e1', paddingBottom: '12px' }}>
                {totals.items.map(item => (
                  <div key={item!.atv._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#334155', fontWeight: 600 }}>
                      {formatAtvName({...item!.atv, name: i18n.language?.startsWith('es') ? (item!.atv.nameEs || item!.atv.name) : item!.atv.name})} ({item!.days} {t('days', 'days')} @ ${item!.atv.ratePerDay}/{t('d', 'd')})
                    </span>
                    <span style={{ color: '#0f172a', fontWeight: 700 }}>
                      ${item!.baseRate.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#64748b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{t('total_base_rate', 'Total Base Rate:')}</span>
                  <span style={{ fontWeight: 600, color: '#334155' }}>${totals.totalBase.toFixed(2)}</span>
                </div>
                {totals.discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{t('discount', 'Discount')} ({totals.discountRate}%):</span>
                    <span style={{ fontWeight: 600, color: '#ef4444' }}>-${totals.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{t('tax_label', `Tax (${settings.baseTaxRate}%):`)}</span>
                  <span style={{ fontWeight: 600, color: '#334155' }}>${totals.totalTax.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{t('refundable_security_deposit', 'Refundable Security Deposit')}:</span>
                  <span style={{ fontWeight: 600 }}>${totals.totalDeposit.toFixed(2)}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', paddingTop: '12px', borderTop: '2px solid #cbd5e1', fontSize: '16px' }}>
                <span style={{ color: '#0f172a', fontWeight: 800 }}>{t('grand_total', 'Grand Total')}</span>
                <span style={{ color: '#4d7c0f', fontWeight: 900, fontSize: '18px' }}>${totals.grandTotal.toFixed(2)}</span>
              </div>
            </div>
            
            <div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px', display: 'block' }}>{t('custom_discount_rate', 'Custom Discount Rate (%)')}</label>
                  <input 
                    type="number" 
                    value={customDiscountRate} 
                    onChange={e => setCustomDiscountRate(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder={`Global default: ${(settings as any).defaultDiscountRate || 0}%`}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                    min="0"
                    max="100"
                  />
                </div>
                <div style={{ flex: 2 }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px', display: 'block' }}>{t('admin_notes_optional', 'Admin Notes (Optional)')}</label>
                  <textarea 
                    value={notes} 
                    onChange={e => setNotes(e.target.value)}
                    placeholder={t('walkin_phone_booking_etc', 'Walk-in, phone booking, multi-vehicle package...')}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', minHeight: '44px' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
              <button onClick={() => setStep(2)} style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: 600, cursor: 'pointer' }}>{t('back', 'Back')}</button>
              <button 
                onClick={handleSubmit}
                disabled={loading}
                style={{ backgroundColor: '#84cc16', color: '#0f172a', padding: '12px 24px', borderRadius: '8px', border: 'none', fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <PenTool size={18} /> {loading ? t('processing', 'Processing...') : t('sign_confirm', 'Sign & Confirm')}
              </button>
            </div>
          </div>
        )}
      </div>

      {showSignature && (
        <SignatureModal
          isOpen={showSignature}
          onClose={() => { setShowSignature(false); onSuccess(); }}
          onComplete={handleSignatureComplete}
          title="Customer Signature Required"
          subtitle="Please have the customer sign below to authorize and confirm the reservation."
        />
      )}
    </div>
  );
};
