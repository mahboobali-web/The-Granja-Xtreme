import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X, CalendarDays } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface DateFilterValue {
  period: 'Daily' | 'Weekly' | 'Monthly' | 'PreviousMonth' | 'PrevMonthToDate' | 'Yearly' | 'All' | 'Custom';
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
}

interface DateRangeFilterProps {
  value: DateFilterValue;
  onChange: (newValue: DateFilterValue) => void;
  mode?: 'analytics' | 'table';
  align?: 'left' | 'right';
  showBadge?: boolean;
  showPresetsBar?: boolean;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  value,
  onChange,
  mode = 'analytics',
  align = 'right',
  showBadge = true,
  showPresetsBar = false
}) => {
  const { t, i18n } = useTranslation();
  const isEs = i18n.language?.startsWith('es');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Local state for custom dates inside the popover
  const [customStart, setCustomStart] = useState<string>(value.startDate || '');
  const [customEnd, setCustomEnd] = useState<string>(value.endDate || '');
  const [validationError, setValidationError] = useState<string>('');

  // Synchronize local custom dates if value changes externally
  useEffect(() => {
    if (value.startDate) setCustomStart(value.startDate);
    if (value.endDate) setCustomEnd(value.endDate);
  }, [value.startDate, value.endDate]);

  // Handle outside click to close popover
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsPopoverOpen(false);
      }
    };
    if (isPopoverOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isPopoverOpen]);

  // Format date helper for badge
  const getDateRangeLabel = (): string => {
    const now = new Date();
    const formatDate = (d: Date) =>
      d.toLocaleDateString(isEs ? 'es-ES' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const formatMonthYear = (d: Date) =>
      d.toLocaleDateString(isEs ? 'es-ES' : 'en-US', { month: 'long', year: 'numeric' });

    if (value.period === 'Daily') {
      return formatDate(now);
    }
    if (value.period === 'Weekly') {
      const past = new Date();
      past.setDate(past.getDate() - 6);
      return `${formatDate(past)} - ${formatDate(now)}`;
    }
    if (value.period === 'Monthly') {
      return formatMonthYear(now);
    }
    if (value.period === 'PreviousMonth') {
      const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return formatMonthYear(prev);
    }
    if (value.period === 'PrevMonthToDate') {
      const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return `${formatDate(prev)} - ${formatDate(now)}`;
    }
    if (value.period === 'Yearly') {
      return now.getFullYear().toString();
    }
    if (value.period === 'All') {
      return t('adminFilters.allTime', 'All Time');
    }
    if (value.period === 'Custom' && value.startDate && value.endDate) {
      const [sy, sm, sd] = value.startDate.split('-').map(Number);
      const [ey, em, ed] = value.endDate.split('-').map(Number);
      const s = new Date(sy, sm - 1, sd);
      const e = new Date(ey, em - 1, ed);
      return `${formatDate(s)} - ${formatDate(e)}`;
    }

    return formatMonthYear(now);
  };

  const handlePresetSelect = (preset: DateFilterValue['period']) => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const toYMD = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    let start = '';
    let end = toYMD(now);

    if (preset === 'Daily') {
      start = toYMD(now);
    } else if (preset === 'Weekly') {
      const p = new Date();
      p.setDate(p.getDate() - 6);
      start = toYMD(p);
    } else if (preset === 'Monthly') {
      const p = new Date(now.getFullYear(), now.getMonth(), 1);
      start = toYMD(p);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      end = toYMD(lastDay);
    } else if (preset === 'PreviousMonth') {
      const p = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      start = toYMD(p);
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
      end = toYMD(lastDay);
    } else if (preset === 'PrevMonthToDate') {
      const p = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      start = toYMD(p);
      end = toYMD(now);
    } else if (preset === 'Yearly') {
      start = `${now.getFullYear()}-01-01`;
      end = `${now.getFullYear()}-12-31`;
    } else if (preset === 'All') {
      start = '';
      end = '';
    }

    onChange({
      period: preset,
      startDate: start,
      endDate: end
    });

    if (preset !== 'Custom') {
      setIsPopoverOpen(false);
      setValidationError('');
    }
  };

  const handleApplyCustom = () => {
    if (!customStart || !customEnd) {
      setValidationError(t('adminFilters.selectBothDates', 'Please select both start and end dates'));
      return;
    }
    if (new Date(customStart) > new Date(customEnd)) {
      setValidationError(t('adminFilters.invalidRange', 'Start date cannot be after end date'));
      return;
    }

    setValidationError('');
    onChange({
      period: 'Custom',
      startDate: customStart,
      endDate: customEnd
    });
    setIsPopoverOpen(false);
  };

  const popoverPresets = mode === 'table' ? [
    { label: t('adminFilters.thisMonth', 'This Month'), period: 'Monthly' as const },
    { label: t('adminFilters.previousMonth', 'Previous Month'), period: 'PreviousMonth' as const },
    { label: t('adminFilters.prevMonthToDate', 'Prev Month to Date'), period: 'PrevMonthToDate' as const },
    { label: t('adminFilters.thisWeek', 'Last 7 Days'), period: 'Weekly' as const },
    { label: t('adminFilters.today', 'Today'), period: 'Daily' as const },
    { label: t('adminFilters.allTime', 'All Time'), period: 'All' as const }
  ] : [
    { label: t('adminFilters.thisMonth', 'This Month'), period: 'Monthly' as const },
    { label: t('adminFilters.previousMonth', 'Previous Month'), period: 'PreviousMonth' as const },
    { label: t('adminFilters.prevMonthToDate', 'Prev Month to Date'), period: 'PrevMonthToDate' as const },
    { label: t('adminFilters.thisWeek', 'Last 7 Days'), period: 'Weekly' as const },
    { label: t('adminFilters.today', 'Today'), period: 'Daily' as const },
    { label: t('adminFilters.thisYear', 'This Year'), period: 'Yearly' as const }
  ];

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: align === 'right' ? 'flex-end' : 'flex-start' }} ref={popoverRef}>
      
      {/* Top Controls Row */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        
        {/* Optional Presets Segmented Control (only when showPresetsBar is true) */}
        {showPresetsBar && (
          <div style={{
            display: 'flex',
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            flexWrap: 'wrap'
          }}>
            {popoverPresets.map((p) => {
              const isActive = value.period === p.period;
              return (
                <button
                  key={p.period}
                  onClick={() => handlePresetSelect(p.period)}
                  style={{
                    padding: '6px 14px',
                    fontSize: '12px',
                    fontWeight: isActive ? 700 : 600,
                    color: isActive ? 'white' : '#64748b',
                    border: 'none',
                    backgroundColor: isActive ? '#4d7c0f' : 'transparent',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                    outline: 'none'
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Date Range Badge / Popover Trigger Button */}
        {showBadge && (
          <button
            onClick={() => setIsPopoverOpen(!isPopoverOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              backgroundColor: isPopoverOpen ? '#f1f5f9' : 'white',
              border: `1px solid ${isPopoverOpen ? '#4d7c0f' : '#e2e8f0'}`,
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              color: '#0f172a',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              transition: 'all 0.15s ease'
            }}
          >
            <CalendarDays size={16} color="#4d7c0f" />
            <span>{getDateRangeLabel()}</span>
            <ChevronDown size={14} color="#64748b" style={{ transform: isPopoverOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>
        )}
      </div>

      {/* Popover Card */}
      {isPopoverOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: align === 'right' ? 0 : 'auto',
          left: align === 'left' ? 0 : 'auto',
          marginTop: '8px',
          width: '320px',
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
          padding: '16px',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
              {t('adminFilters.selectDateRange', 'Select Date Range')}
            </span>
            <button
              onClick={() => setIsPopoverOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: '#94a3b8' }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Quick Presets Grid in Popover */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            {popoverPresets.map((qp) => (
              <button
                key={qp.period}
                onClick={() => handlePresetSelect(qp.period)}
                style={{
                  padding: '7px 8px',
                  backgroundColor: value.period === qp.period ? '#f0fdf4' : '#f8fafc',
                  border: `1px solid ${value.period === qp.period ? '#4d7c0f' : '#e2e8f0'}`,
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: value.period === qp.period ? 700 : 500,
                  color: value.period === qp.period ? '#166534' : '#475569',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                {qp.label}
              </button>
            ))}
          </div>

          <div style={{ height: '1px', backgroundColor: '#f1f5f9' }} />

          {/* Custom Date Inputs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>
                {t('adminFilters.startDate', 'Start Date')}
              </label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => {
                  setCustomStart(e.target.value);
                  setValidationError('');
                }}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  color: '#0f172a',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>
                {t('adminFilters.endDate', 'End Date')}
              </label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => {
                  setCustomEnd(e.target.value);
                  setValidationError('');
                }}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  color: '#0f172a',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {validationError && (
            <div style={{ fontSize: '11px', color: '#dc2626', fontWeight: 600 }}>
              {validationError}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button
              onClick={() => {
                setCustomStart('');
                setCustomEnd('');
                handlePresetSelect('Monthly');
              }}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                backgroundColor: 'white',
                fontSize: '12px',
                fontWeight: 600,
                color: '#64748b',
                cursor: 'pointer'
              }}
            >
              {t('adminFilters.reset', 'Reset')}
            </button>
            <button
              onClick={handleApplyCustom}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#4d7c0f',
                fontSize: '12px',
                fontWeight: 700,
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
            >
              <Check size={14} /> {t('adminFilters.apply', 'Apply')}
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
