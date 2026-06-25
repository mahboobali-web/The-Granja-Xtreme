import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Wrench } from 'lucide-react';
import { fetchAPI } from '../utils/api';

interface ATV {
  _id: string;
  name: string;
  status: string;
}

export const FleetCheckModal: React.FC<{ onClose: () => void; onSuccess: () => void }> = ({ onClose, onSuccess }) => {
  const { t } = useTranslation();
  const [atvs, setAtvs] = useState<ATV[]>([]);
  const [selectedAtvId, setSelectedAtvId] = useState('');
  const [description, setDescription] = useState('');
  const [mechanicName, setMechanicName] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAtvs = async () => {
      try {
        const data = await fetchAPI('/atvs');
        setAtvs(data);
      } catch (e) {
        console.error(e);
      }
    };
    loadAtvs();
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      await fetchAPI('/maintenance/schedule', {
        method: 'POST',
        body: {
          atvId: selectedAtvId,
          description,
          mechanicName,
          estimatedCost: Number(estimatedCost),
          scheduledDate
        }
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || t('fleetCheckModal.error', 'Failed to schedule fleet check'));
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = selectedAtvId && description && mechanicName && estimatedCost && scheduledDate;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '500px', padding: '32px', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
          <X size={24} />
        </button>
        
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '24px' }}>{t('fleetCheckModal.title', 'Schedule Fleet Check')}</h2>

        {error && <div style={{ padding: '12px', backgroundColor: '#fef2f2', color: '#ef4444', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', fontWeight: 600 }}>{error}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px', display: 'block' }}>{t('fleetCheckModal.selectAtv', 'Select ATV')}</label>
            <select 
              value={selectedAtvId} 
              onChange={e => setSelectedAtvId(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
            >
              <option value="">{t('fleetCheckModal.chooseAtv', '-- Choose ATV --')}</option>
              {atvs.map(a => <option key={a._id} value={a._id}>{a.name} ({a.status})</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px', display: 'block' }}>{t('fleetCheckModal.serviceDescription', 'Service Description')}</label>
            <input 
              type="text" 
              value={description} 
              onChange={e => setDescription(e.target.value)}
              placeholder={t('fleetCheckModal.placeholderDescription', 'e.g. 500mi Service, Oil Change')}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px', display: 'block' }}>{t('fleetCheckModal.mechanicName', 'Mechanic Name')}</label>
              <input 
                type="text" 
                value={mechanicName} 
                onChange={e => setMechanicName(e.target.value)}
                placeholder={t('fleetCheckModal.placeholderMechanic', 'John Doe')}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px', display: 'block' }}>{t('fleetCheckModal.estimatedCost', 'Estimated Cost ($)')}</label>
              <input 
                type="number" 
                value={estimatedCost} 
                onChange={e => setEstimatedCost(e.target.value)}
                placeholder="150"
                style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px', display: 'block' }}>{t('fleetCheckModal.scheduledDate', 'Scheduled Date')}</label>
            <input 
              type="date" 
              value={scheduledDate} 
              onChange={e => setScheduledDate(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
            />
          </div>

          <button 
            onClick={handleSubmit}
            disabled={!isFormValid || loading}
            style={{ 
              width: '100%', 
              backgroundColor: isFormValid ? '#4d7c0f' : '#94a3b8', 
              color: 'white', 
              padding: '14px', 
              borderRadius: '8px', 
              border: 'none', 
              fontWeight: 800, 
              fontSize: '15px', 
              marginTop: '8px', 
              cursor: isFormValid ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Wrench size={18} /> {loading ? t('fleetCheckModal.scheduling', 'Scheduling...') : t('fleetCheckModal.confirm', 'Confirm Fleet Check')}
          </button>
        </div>
      </div>
    </div>
  );
};
