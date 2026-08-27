import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, Search, Plus, Minus, X, CreditCard, Banknote, User, Trash2 } from 'lucide-react';
import { fetchAPI } from '../utils/api';
import { PosReceiptModal } from '../components/PosReceiptModal';

export const AdminPOS = () => {
  const { t, i18n } = useTranslation();
  const isSpanish = i18n.language === 'es';

  const [accessories, setAccessories] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Cart State
  const [cart, setCart] = useState<{ accessory: any; quantity: number }[]>(() => {
    const saved = localStorage.getItem('tgx_pos_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('tgx_pos_cart', JSON.stringify(cart));
  }, [cart]);

  // Checkout State
  const [customerMode, setCustomerMode] = useState<'existing' | 'new' | 'guest'>('existing');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [guestInfo, setGuestInfo] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  // Receipt Modal State
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [accData, custData] = await Promise.all([
        fetchAPI('/accessories'),
        fetchAPI('/auth/customers')
      ]);
      setAccessories(accData);
      setCustomers(custData);
    } catch (err) {
      console.error('Failed to load POS data', err);
      setError('Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  const filteredAccessories = useMemo(() => {
    if (!searchQuery) return accessories;
    const lowerQ = searchQuery.toLowerCase();
    return accessories.filter(a => 
      a.name.toLowerCase().includes(lowerQ) || 
      (a.nameEs && a.nameEs.toLowerCase().includes(lowerQ))
    );
  }, [accessories, searchQuery]);

  const cartTotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + (item.accessory.price * item.quantity), 0);
  }, [cart]);

  const addToCart = (accessory: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.accessory._id === accessory._id);
      if (existing) {
        if (existing.quantity >= accessory.quantity) return prev; // Prevent adding more than stock
        return prev.map(item => 
          item.accessory._id === accessory._id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      if (accessory.quantity > 0) {
        return [...prev, { accessory, quantity: 1 }];
      }
      return prev;
    });
  };

  const removeFromCart = (accessoryId: string) => {
    setCart(prev => prev.filter(item => item.accessory._id !== accessoryId));
  };

  const updateQuantity = (accessoryId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.accessory._id === accessoryId) {
        const newQty = item.quantity + delta;
        if (newQty <= 0) return item; // Handled by remove button usually, but safeguard
        if (newQty > item.accessory.quantity) return item; // Prevent exceeding stock
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setError('Cart is empty.');
      return;
    }
    if (customerMode === 'existing' && !selectedCustomerId) {
      setError('Please select a customer.');
      return;
    }
    if (customerMode === 'new' && (!guestInfo.firstName || !guestInfo.lastName || !guestInfo.email || !guestInfo.phone)) {
      setError('Please fill out all required fields for the new customer.');
      return;
    }
    
    setError('');
    setSubmitting(true);

    try {
      const items = cart.map(item => ({
        accessoryId: item.accessory._id,
        name: item.accessory.name,
        price: item.accessory.price,
        quantity: item.quantity
      }));

      const payload: any = {
        items,
        paymentMethod
      };

      if (customerMode === 'existing') {
        payload.customerId = selectedCustomerId;
      } else {
        payload.guestInfo = guestInfo; // Backend handles both 'new' and 'guest' via guestInfo
      }

      const response = await fetchAPI('/pos/checkout', {
        method: 'POST',
        body: payload
      });

      // Clear cart and show receipt
      setCart([]);
      setGuestInfo({ firstName: '', lastName: '', email: '', phone: '' });
      setSelectedCustomerId('');
      setCustomerMode('existing');
      loadData(); // Reload inventory
      setSuccessOrderId(response.orderId);
      
    } catch (err: any) {
      setError(err.message || 'Checkout failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>
        {`
          .pos-container {
            display: flex;
            height: calc(100vh - 80px);
            background-color: #f8fafc;
            margin: -24px;
            padding: 0;
          }
          .pos-left-panel {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }
          .pos-right-panel {
            width: 400px;
            background-color: white;
            border-left: 1px solid #e2e8f0;
            display: flex;
            flex-direction: column;
            box-shadow: -4px 0 15px rgba(0,0,0,0.03);
          }
          .pos-customer-inputs {
            display: flex;
            gap: 8px;
          }
          @media (max-width: 1024px) {
            .pos-right-panel {
              width: 340px;
            }
          }
          @media (max-width: 768px) {
            .pos-container {
              flex-direction: column;
              height: auto;
              min-height: calc(100vh - 80px);
            }
            .pos-left-panel {
              flex: none;
              height: 60vh;
            }
            .pos-right-panel {
              width: 100%;
              border-left: none;
              border-top: 1px solid #e2e8f0;
            }
          }
          @media (max-width: 480px) {
            .pos-customer-inputs {
              flex-direction: column;
            }
          }
        `}
      </style>

      <div className="no-print pos-container">
      {/* Left Area: Products Grid */}
      <div className="pos-left-panel">
        <div style={{ padding: '12px 24px', borderBottom: '1px solid #e2e8f0', backgroundColor: 'white', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder={t("Search products...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>{t("Loading inventory...")}</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
              {filteredAccessories.map(acc => {
                const inCart = cart.find(i => i.accessory._id === acc._id)?.quantity || 0;
                const available = acc.quantity - inCart;
                const isOutOfStock = acc.quantity === 0;

                return (
                  <div 
                    key={acc._id} 
                    onClick={() => !isOutOfStock && available > 0 && addToCart(acc)}
                    style={{ 
                      backgroundColor: 'white', 
                      borderRadius: '12px', 
                      overflow: 'hidden', 
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      cursor: (isOutOfStock || available <= 0) ? 'not-allowed' : 'pointer',
                      border: '1px solid #e2e8f0',
                      opacity: isOutOfStock ? 0.6 : 1,
                      transition: 'transform 0.1s',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                    onMouseEnter={e => { if (!isOutOfStock && available > 0) e.currentTarget.style.transform = 'translateY(-2px)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none' }}
                  >
                    <div style={{ height: '120px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', position: 'relative' }}>
                      {acc.images?.[0] ? (
                        <img src={acc.images[0]} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      ) : (
                        <ShoppingBag size={32} color="#cbd5e1" />
                      )}
                      {(isOutOfStock || available <= 0) && (
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#ef4444' }}>
                          {isOutOfStock ? t("Out of Stock") : t("Max Reached")}
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{isSpanish ? (acc.nameEs || acc.name) : acc.name}</h4>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>{t("Stock:")} {acc.quantity}</span>
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#ca8a04', marginTop: '8px' }}>
                        ${acc.price.toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Area: Cart & Checkout */}
      <div className="pos-right-panel">
        <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>{t("Current Order")}</h2>
        </div>

        {/* Scrollable Middle Area */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {/* Cart Items */}
          <div style={{ padding: '24px', minHeight: '150px', flexShrink: 0 }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '60px' }}>
              <ShoppingBag size={48} style={{ opacity: 0.5, margin: '0 auto 16px' }} />
              <p>{t("Cart is empty")}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {cart.map(item => (
                <div key={item.accessory._id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', backgroundColor: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.accessory.images?.[0] ? <img src={item.accessory.images[0]} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <ShoppingBag size={20} color="#cbd5e1" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{isSpanish ? (item.accessory.nameEs || item.accessory.name) : item.accessory.name}</div>
                    <div style={{ fontSize: '13px', color: '#ca8a04', fontWeight: 700 }}>${item.accessory.price.toFixed(2)}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '4px' }}>
                    <button onClick={() => { item.quantity > 1 ? updateQuantity(item.accessory._id, -1) : removeFromCart(item.accessory._id) }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#64748b' }}>
                      {item.quantity > 1 ? <Minus size={14} /> : <Trash2 size={14} color="#ef4444" />}
                    </button>
                    <span style={{ fontSize: '14px', fontWeight: 600, width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.accessory._id, 1)} disabled={item.quantity >= item.accessory.quantity} style={{ background: 'none', border: 'none', cursor: item.quantity >= item.accessory.quantity ? 'not-allowed' : 'pointer', padding: '4px', color: item.quantity >= item.accessory.quantity ? '#cbd5e1' : '#64748b' }}>
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Customer & Payment Form */}
          <div style={{ borderTop: '1px solid #e2e8f0', padding: '24px', backgroundColor: '#f8fafc', flex: 1, flexShrink: 0 }}>
          {error && <div style={{ backgroundColor: '#fef2f2', color: '#b91c1c', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}

          {/* Customer Selection */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '8px' }}>{t("Customer Type")}</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <button onClick={() => setCustomerMode('existing')} style={{ flex: 1, padding: '8px', fontSize: '12px', border: `1px solid ${customerMode === 'existing' ? '#ca8a04' : '#cbd5e1'}`, backgroundColor: customerMode === 'existing' ? '#fefce8' : 'white', color: customerMode === 'existing' ? '#ca8a04' : '#64748b', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>{t("Existing")}</button>
              <button onClick={() => setCustomerMode('new')} style={{ flex: 1, padding: '8px', fontSize: '12px', border: `1px solid ${customerMode === 'new' ? '#ca8a04' : '#cbd5e1'}`, backgroundColor: customerMode === 'new' ? '#fefce8' : 'white', color: customerMode === 'new' ? '#ca8a04' : '#64748b', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>{t("New")}</button>
              <button onClick={() => setCustomerMode('guest')} style={{ flex: 1, padding: '8px', fontSize: '12px', border: `1px solid ${customerMode === 'guest' ? '#ca8a04' : '#cbd5e1'}`, backgroundColor: customerMode === 'guest' ? '#fefce8' : 'white', color: customerMode === 'guest' ? '#ca8a04' : '#64748b', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>{t("Guest")}</button>
            </div>
            
            {customerMode === 'existing' && (
              <select 
                value={selectedCustomerId} 
                onChange={e => setSelectedCustomerId(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              >
                <option value="">{t("Select an existing customer...")}</option>
                {customers.map(c => (
                  <option key={c._id} value={c._id}>{c.firstName} {c.lastName} ({c.email})</option>
                ))}
              </select>
            )}

            {customerMode === 'new' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="pos-customer-inputs">
                  <input type="text" placeholder={t("First Name")} value={guestInfo.firstName} onChange={e => setGuestInfo({...guestInfo, firstName: e.target.value})} style={{ flex: 1, minWidth: 0, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                  <input type="text" placeholder={t("Last Name")} value={guestInfo.lastName} onChange={e => setGuestInfo({...guestInfo, lastName: e.target.value})} style={{ flex: 1, minWidth: 0, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
                <input type="email" placeholder={t("Email Address")} value={guestInfo.email} onChange={e => setGuestInfo({...guestInfo, email: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <input type="text" placeholder={t("Phone Number")} value={guestInfo.phone} onChange={e => setGuestInfo({...guestInfo, phone: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
            )}

            {customerMode === 'guest' && (
              <div className="pos-customer-inputs">
                <input type="text" placeholder={t("First Name (Optional)")} value={guestInfo.firstName} onChange={e => setGuestInfo({...guestInfo, firstName: e.target.value})} style={{ flex: 1, minWidth: 0, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '8px' }}>{t("Payment Method")}</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            >
              <option value="Cash">{t("Cash")}</option>
              <option value="Zelle">{t("Zelle")}</option>
              <option value="PayPal">{t("PayPal")}</option>
              <option value="Apple Pay">{t("Apple Pay")}</option>
              <option value="Google Pay">{t("Google Pay")}</option>
              <option value="International Card">{t("International Card")}</option>
              <option value="Banco Popular">{t("Banco Popular")}</option>
              <option value="Banreservas">{t("Banreservas")}</option>
            </select>
          </div>

          </div>
        </div>

        {/* Footer - Fixed */}
        <div style={{ borderTop: '1px solid #e2e8f0', padding: '24px', backgroundColor: 'white', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <span style={{ fontSize: '16px', fontWeight: 600, color: '#475569' }}>{t("Total (Tax Included)")}</span>
            <span style={{ fontSize: '24px', fontWeight: 800, color: '#ca8a04' }}>${cartTotal.toFixed(2)}</span>
          </div>

          <button 
            onClick={handleCheckout}
            disabled={submitting || cart.length === 0}
            style={{ width: '100%', padding: '16px', backgroundColor: (submitting || cart.length === 0) ? '#94a3b8' : '#ca8a04', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 700, cursor: (submitting || cart.length === 0) ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(202, 138, 4, 0.2)' }}
          >
            {submitting ? t("Processing...") : t("Mark as Paid & Generate Receipt")}
          </button>
        </div>
      </div>

      {successOrderId && (
        <PosReceiptModal 
          orderId={successOrderId}
          onClose={() => setSuccessOrderId(null)}
        />
      )}
    </div>
    </>
  );
};
