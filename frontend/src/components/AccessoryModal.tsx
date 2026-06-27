import React, { useState, useRef } from 'react';
import { X, Upload, Package, Trash2, GripVertical } from 'lucide-react';
import { fetchAPI } from '../utils/api';
import type { Accessory } from '../pages/AdminAccessories';
import { useTranslation } from 'react-i18next';

interface AccessoryModalProps {
  accessory: Accessory | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const AccessoryModal: React.FC<AccessoryModalProps> = ({ accessory, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const [name, setName] = useState(accessory?.name || '');
  const [nameEs, setNameEs] = useState(accessory?.nameEs || '');
  const [description, setDescription] = useState(accessory?.description || '');
  const [descriptionEs, setDescriptionEs] = useState(accessory?.descriptionEs || '');
  const [price, setPrice] = useState(accessory?.price?.toString() || '');
  const [quantity, setQuantity] = useState(accessory?.quantity?.toString() || '');
  const [images, setImages] = useState<string[]>(accessory?.images || []);
  
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    let newImages: string[] = [];
    let hasError = false;

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        hasError = true;
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      }
    });

    if (hasError) {
      setError(t('One or more images exceeded the 5MB limit.'));
    } else {
      setError('');
    }
  };

  const handleSort = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const _images = [...images];
    const draggedItemContent = _images.splice(dragItem.current, 1)[0];
    _images.splice(dragOverItem.current, 0, draggedItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    setImages(_images);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleTranslate = async (field: 'name' | 'description') => {
    const textToTranslate = field === 'name' ? name : description;
    if (!textToTranslate) return;
    
    setTranslating(true);
    try {
      const res = await fetchAPI('/translations', {
        method: 'POST',
        body: { text: textToTranslate, targetLang: 'es' }
      });
      if (res && res.translated) {
        if (field === 'name') setNameEs(res.translated);
        else setDescriptionEs(res.translated);
      }
    } catch (err) {
      alert(t("Translation failed"));
    } finally {
      setTranslating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !price) {
      setError(t('Name, description, and price are required.'));
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      name,
      nameEs,
      description,
      descriptionEs,
      price: Number(price),
      quantity: quantity ? Number(quantity) : undefined,
      images
    };

    try {
      if (accessory) {
        await fetchAPI(`/accessories/${accessory._id}`, {
          method: 'PUT',
          body: payload
        });
      } else {
        await fetchAPI('/accessories', {
          method: 'POST',
          body: payload
        });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || t('Failed to save accessory'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
          <X size={24} />
        </button>
        
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '24px' }}>
          {accessory ? t('Edit Accessory') : t('Add New Accessory')}
        </h2>

        {error && <div style={{ padding: '12px', backgroundColor: '#fef2f2', color: '#ef4444', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', fontWeight: 600 }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>{t("Images (Drag to reorder)")}</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
              {images.map((img, index) => (
                <div 
                  key={index}
                  draggable
                  onDragStart={() => dragItem.current = index}
                  onDragEnter={() => dragOverItem.current = index}
                  onDragEnd={handleSort}
                  onDragOver={(e) => e.preventDefault()}
                  style={{ width: '100px', height: '100px', borderRadius: '12px', border: '1px solid #cbd5e1', position: 'relative', overflow: 'hidden', cursor: 'grab', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}
                >
                  <img src={img} alt={`Preview ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: '4px', right: '4px', display: 'flex', gap: '4px' }}>
                    <button type="button" onClick={() => removeImage(index)} style={{ backgroundColor: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '4px', padding: '4px', cursor: 'pointer', color: '#ef4444' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                style={{ width: '100px', height: '100px', borderRadius: '12px', border: '2px dashed #cbd5e1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backgroundColor: '#f8fafc' }}
              >
                <Upload size={20} color="#94a3b8" style={{ marginBottom: '4px' }} />
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>{t("Upload")}</span>
              </div>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" multiple style={{ display: 'none' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>{t("Name *")}</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} placeholder={t("e.g. Bandana")} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>{t("Name (Spanish)")}</label>
                <button type="button" onClick={() => handleTranslate('name')} disabled={translating} style={{ fontSize: '11px', fontWeight: 700, color: '#4d7c0f', background: 'none', border: 'none', cursor: 'pointer' }}>
                  {translating ? t('Translating...') : t('Auto-Translate')}
                </button>
              </div>
              <input type="text" value={nameEs} onChange={e => setNameEs(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>{t("Description *")}</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={3} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }} placeholder={t("Short description...")} />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>{t("Description (Spanish)")}</label>
              <button type="button" onClick={() => handleTranslate('description')} disabled={translating} style={{ fontSize: '11px', fontWeight: 700, color: '#4d7c0f', background: 'none', border: 'none', cursor: 'pointer' }}>
                {translating ? t('Translating...') : t('Auto-Translate')}
              </button>
            </div>
            <textarea value={descriptionEs} onChange={e => setDescriptionEs(e.target.value)} rows={3} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }} placeholder={t("Descripción en español...")} />
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>{t("Price ($) *")}</label>
              <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} placeholder="0.00" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>{t("Quantity (Optional)")}</label>
              <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} placeholder={t("Unlimited")} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', gap: '12px' }}>
            <button type="button" onClick={onClose} style={{ padding: '12px 24px', backgroundColor: 'transparent', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', color: '#64748b' }}>{t("Cancel")}</button>
            <button type="submit" disabled={loading} style={{ padding: '12px 24px', backgroundColor: '#4d7c0f', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? t('Saving...') : t('Save Accessory')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
