import React, { useState, useEffect } from 'react';
import { Package, Plus, Pencil, Trash2, Search, LayoutGrid, List } from 'lucide-react';
import { fetchAPI } from '../utils/api';
import { AccessoryModal } from '../components/AccessoryModal';
import { useTranslation } from 'react-i18next';

export interface Accessory {
  _id: string;
  name: string;
  nameEs?: string;
  description: string;
  descriptionEs?: string;
  price: number;
  quantity?: number;
  images?: string[];
}

export const AdminAccessories: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccessory, setSelectedAccessory] = useState<Accessory | null>(null);

  const loadAccessories = async () => {
    try {
      const data = await fetchAPI('/accessories');
      setAccessories(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccessories();
  }, []);

  const handleEdit = (acc: Accessory) => {
    setSelectedAccessory(acc);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedAccessory(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('Are you sure you want to delete this accessory?'))) {
      try {
        await fetchAPI(`/accessories/${id}`, { method: 'DELETE' });
        loadAccessories();
      } catch (e) {
        alert(t('Failed to delete accessory'));
      }
    }
  };

  const isSpanish = i18n.language === 'es';

  const filteredAccessories = accessories.filter(a => {
    const searchName = isSpanish ? (a.nameEs || a.name) : a.name;
    const searchDesc = isSpanish ? (a.descriptionEs || a.description) : a.description;
    return searchName.toLowerCase().includes(search.toLowerCase()) || 
           searchDesc.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minHeight: '80vh' }}>
      
      {/* Top Bar Layout */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '16px 24px', borderRadius: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
        
        {/* Search Input (Left) */}
        <div style={{ position: 'relative', flex: '0 1 350px' }}>
          <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={16} />
          <input 
            type="text" 
            placeholder={t("Search accessories...")}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 16px 10px 40px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '14px', color: '#334155', outline: 'none' }}
          />
        </div>

        {/* Add Button (Center) */}
        <div style={{ display: 'flex', flex: 1, justifyContent: 'center' }}>
          <button 
            onClick={handleAddNew}
            style={{ backgroundColor: '#4d7c0f', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            <Plus size={16} /> {t("Add Accessory")}
          </button>
        </div>

        {/* View Toggle (Right) */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', backgroundColor: '#f1f5f9', borderRadius: '8px', padding: '4px' }}>
            <button 
              onClick={() => setViewMode('grid')}
              style={{ border: 'none', background: viewMode === 'grid' ? 'white' : 'transparent', color: viewMode === 'grid' ? '#0f172a' : '#64748b', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', boxShadow: viewMode === 'grid' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              style={{ border: 'none', background: viewMode === 'list' ? 'white' : 'transparent', color: viewMode === 'list' ? '#0f172a' : '#64748b', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', boxShadow: viewMode === 'list' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>{t("Loading accessories...")}</div>
      ) : filteredAccessories.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>{t("No accessories found.")}</div>
      ) : viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {filteredAccessories.map(a => (
            <div key={a._id} style={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '180px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '16px' }}>
                {a.images && a.images.length > 0 ? (
                  <img src={a.images[0]} alt={a.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <Package size={48} color="#cbd5e1" />
                )}
                <div style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '4px 8px', borderRadius: '8px', fontSize: '13px', fontWeight: 800, color: '#ca8a04', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  ${a.price.toFixed(2)}
                </div>
              </div>
              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 8px 0', color: '#0f172a' }}>{isSpanish ? (a.nameEs || a.name) : a.name}</h3>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px', flex: 1, lineHeight: 1.5 }}>
                  {isSpanish ? (a.descriptionEs || a.description) : a.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>{t("Qty:")} {a.quantity !== undefined && a.quantity !== null ? a.quantity : t('Unlimited')}</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleEdit(a)} style={{ background: 'none', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px', cursor: 'pointer', color: '#64748b' }}><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(a._id)} style={{ background: 'none', border: '1px solid #fca5a5', borderRadius: '6px', padding: '6px', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 700, color: '#475569' }}>{t("Name")}</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 700, color: '#475569' }}>{t("Description")}</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 700, color: '#475569' }}>{t("Price")}</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 700, color: '#475569' }}>{t("Quantity (Optional)")}</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 700, color: '#475569', textAlign: 'right' }}>{t("Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccessories.map(a => (
                <tr key={a._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {a.images && a.images.length > 0 ? (
                        <img src={a.images[0]} alt={a.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Package size={20} color="#94a3b8" />
                        </div>
                      )}
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{isSpanish ? (a.nameEs || a.name) : a.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', color: '#64748b', fontSize: '13px', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {isSpanish ? (a.descriptionEs || a.description) : a.description}
                  </td>
                  <td style={{ padding: '16px 24px', fontWeight: 700, color: '#ca8a04' }}>
                    ${a.price.toFixed(2)}
                  </td>
                  <td style={{ padding: '16px 24px', color: '#64748b', fontSize: '13px' }}>
                    {a.quantity !== undefined && a.quantity !== null ? a.quantity : t('Unlimited')}
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button onClick={() => handleEdit(a)} style={{ background: 'none', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px', cursor: 'pointer', color: '#64748b' }}><Pencil size={16} /></button>
                      <button onClick={() => handleDelete(a._id)} style={{ background: 'none', border: '1px solid #fca5a5', borderRadius: '6px', padding: '6px', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <AccessoryModal 
          accessory={selectedAccessory} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => { setIsModalOpen(false); loadAccessories(); }} 
        />
      )}
    </div>
  );
};
