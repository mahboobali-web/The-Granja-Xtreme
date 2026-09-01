import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, Search, Plus, Minus, X, Trash2 } from 'lucide-react';
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
  const [paymentCurrency, setPaymentCurrency] = useState<'USD' | 'DOP'>('USD');
  const [tendered, setTendered] = useState('');
  const [exchangeRate, setExchangeRate] = useState<number>(58.80);

  // Receipt Modal State
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [accData, custData, settingsData] = await Promise.all([
        fetchAPI('/accessories'),
        fetchAPI('/auth/customers'),
        fetchAPI('/settings').catch(() => null)
      ]);
      setAccessories(accData);
      setCustomers(custData);
      if (settingsData && settingsData.exchangeRateDOP) {
        setExchangeRate(Number(settingsData.exchangeRateDOP));
      }
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

      const cartTotalDOP = Math.round(cartTotal * exchangeRate * 100) / 100;
      const parsedTendered = parseFloat(tendered) || 0;
      const dueInSelectedCurrency = paymentCurrency === 'DOP' ? cartTotalDOP : cartTotal;
      const changeDue = parsedTendered > dueInSelectedCurrency ? parsedTendered - dueInSelectedCurrency : 0;

      const payload: any = {
        items,
        paymentMethod,
        currency: paymentCurrency,
        exchangeRate,
        originalAmount: paymentCurrency === 'DOP' ? cartTotalDOP : cartTotal
      };

      if (parsedTendered > 0) {
        payload.tenderedAmount = parsedTendered;
        payload.changeGiven = changeDue;
      }

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
      setTendered('');
      loadData(); // Reload inventory
      setSuccessOrderId(response.orderId);
      
    } catch (err: any) {
      setError(err.message || 'Checkout failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const cartTotalDOP = Math.round(cartTotal * exchangeRate * 100) / 100;
  const parsedTendered = parseFloat(tendered) || 0;
  const dueInSelectedCurrency = paymentCurrency === 'DOP' ? cartTotalDOP : cartTotal;
  const changeDue = parsedTendered > dueInSelectedCurrency ? parsedTendered - dueInSelectedCurrency : 0;

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

      <div className="pos-container">
        {/* LEFT PANEL - Product Catalog & Search */}
        <div className="pos-left-panel">
          {/* Header Search */}
          <div style={{ padding: '24px 32px', borderBottom: '1px solid #e2e8f0', backgroundColor: 'white', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={20} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder={t("Search accessories or gear...")} 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '15px', outline: 'none', backgroundColor: '#f8fafc' }}
              />
            </div>
          </div>

          {/* Product Grid */}
          <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#64748b' }}>
                {t("Loading Catalog...")}
              </div>
            ) : filteredAccessories.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                <ShoppingBag size={48} style={{ opacity: 0.5, marginBottom: '16px' }} />
                <p>{t("No products found.")}</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                {filteredAccessories.map(acc => {
                  const inCart = cart.find(c => c.accessory._id === acc._id);
                  const isOutOfStock = acc.quantity <= 0;
                  const name = isSpanish && acc.nameEs ? acc.nameEs : acc.name;

                  return (
                    <div 
                      key={acc._id}
                      onClick={() => !isOutOfStock && addToCart(acc)}
                      style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        border: inCart ? '2px solid #ca8a04' : '1px solid #e2e8f0',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                        opacity: isOutOfStock ? 0.6 : 1,
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                        position: 'relative'
                      }}
                    >
                      {acc.images && acc.images[0] ? (
                        <img 
                          src={acc.images[0]} 
                          alt={name} 
                          style={{ width: '100%', height: '140px', objectFit: 'contain', borderRadius: '8px', marginBottom: '12px' }} 
                        />
                      ) : (
                        <div style={{ width: '100%', height: '140px', backgroundColor: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', color: '#94a3b8' }}>
                          <ShoppingBag size={32} />
                        </div>
                      )}

                      <div style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a', marginBottom: '4px' }}>
                        {name}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 'auto', paddingTop: '8px' }}>
                        <div>
                          <span style={{ fontSize: '18px', fontWeight: 800, color: '#ca8a04' }}>
                            ${acc.price.toFixed(2)}
                          </span>
                          <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>
                            RD$ {(acc.price * exchangeRate).toFixed(0)}
                          </span>
                        </div>
                        <span style={{ fontSize: '12px', color: isOutOfStock ? '#ef4444' : '#64748b', fontWeight: 600 }}>
                          {isOutOfStock ? t("Out of Stock") : `${acc.quantity} ${t("in stock")}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL - Cart & Checkout */}
        <div className="pos-right-panel">
          {/* Cart Header */}
          <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '18px', color: '#0f172a' }}>
              <ShoppingBag size={20} color="#ca8a04" />
              {t("Current Order")} ({cart.reduce((a, b) => a + b.quantity, 0)})
            </div>
            {cart.length > 0 && (
              <button 
                onClick={() => setCart([])}
                style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Trash2 size={14} /> {t("Clear")}
              </button>
            )}
          </div>

          {/* Cart Items List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
            {cart.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                <ShoppingBag size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
                <p style={{ fontSize: '14px', margin: 0 }}>{t("No items in cart.")}</p>
                <span style={{ fontSize: '12px', color: '#cbd5e1' }}>{t("Click any product to add.")}</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {cart.map(item => {
                  const name = isSpanish && item.accessory.nameEs ? item.accessory.nameEs : item.accessory.name;
                  return (
                    <div key={item.accessory._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <div style={{ flex: 1, marginRight: '12px' }}>
                        <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>{name}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>${item.accessory.price.toFixed(2)} each</div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button 
                          onClick={() => updateQuantity(item.accessory._id, -1)}
                          style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        >
                          <Minus size={14} />
                        </button>
                        <span style={{ fontWeight: 700, fontSize: '14px', minWidth: '20px', textAlign: 'center' }}>
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.accessory._id, 1)}
                          disabled={item.quantity >= item.accessory.quantity}
                          style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: item.quantity >= item.accessory.quantity ? 'not-allowed' : 'pointer', opacity: item.quantity >= item.accessory.quantity ? 0.5 : 1 }}
                        >
                          <Plus size={14} />
                        </button>
                        <button 
                          onClick={() => removeFromCart(item.accessory._id)}
                          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', marginLeft: '4px' }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Customer Selection & Payment Options */}
          <div style={{ borderTop: '1px solid #e2e8f0', backgroundColor: '#fafafa', padding: '16px 24px', flexShrink: 0, maxHeight: '280px', overflowY: 'auto' }}>
            {error && (
              <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '10px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, marginBottom: '16px' }}>
                {error}
              </div>
            )}

            {/* Customer Type Selector */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '6px', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '8px', marginBottom: '12px' }}>
                <button 
                  onClick={() => setCustomerMode('existing')} 
                  style={{ flex: 1, padding: '6px', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', backgroundColor: customerMode === 'existing' ? 'white' : 'transparent', color: customerMode === 'existing' ? '#0f172a' : '#64748b', boxShadow: customerMode === 'existing' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}
                >
                  {t("Existing")}
                </button>
                <button 
                  onClick={() => setCustomerMode('new')} 
                  style={{ flex: 1, padding: '6px', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', backgroundColor: customerMode === 'new' ? 'white' : 'transparent', color: customerMode === 'new' ? '#0f172a' : '#64748b', boxShadow: customerMode === 'new' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}
                >
                  {t("New")}
                </button>
                <button 
                  onClick={() => setCustomerMode('guest')} 
                  style={{ flex: 1, padding: '6px', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', backgroundColor: customerMode === 'guest' ? 'white' : 'transparent', color: customerMode === 'guest' ? '#0f172a' : '#64748b', boxShadow: customerMode === 'guest' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}
                >
                  {t("Walk-In")}
                </button>
              </div>

              {customerMode === 'existing' && (
                <select 
                  value={selectedCustomerId} 
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white' }}
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

            {/* Currency Selector */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>{t("Payment Currency")}</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
                <button
                  type="button"
                  onClick={() => setPaymentCurrency('USD')}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: paymentCurrency === 'USD' ? 'white' : 'transparent',
                    color: paymentCurrency === 'USD' ? '#0f172a' : '#64748b',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: 'pointer',
                    boxShadow: paymentCurrency === 'USD' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
                  }}
                >
                  💵 USD ($)
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentCurrency('DOP')}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: paymentCurrency === 'DOP' ? 'white' : 'transparent',
                    color: paymentCurrency === 'DOP' ? '#059669' : '#64748b',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: 'pointer',
                    boxShadow: paymentCurrency === 'DOP' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
                  }}
                >
                  RD$ DOP (Pesos)
                </button>
              </div>
            </div>

            {/* Payment Method */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>{t("Payment Method")}</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white' }}
              >
                <option value="Cash">{t("Cash")}</option>
                <option value="Banco Popular">{t("Banco Popular")}</option>
                <option value="Banreservas">{t("Banreservas")}</option>
                <option value="Zelle">{t("Zelle")}</option>
                <option value="PayPal">{t("PayPal")}</option>
                <option value="Apple Pay">{t("Apple Pay")}</option>
                <option value="Google Pay">{t("Google Pay")}</option>
                <option value="International Card">{t("International Card")}</option>
              </select>
            </div>

            {/* Cash Tendered & Change (Vuelto) */}
            {paymentMethod === 'Cash' && cart.length > 0 && (
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px', marginBottom: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', alignItems: 'center' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#15803d', marginBottom: '2px' }}>
                      {t("Received")} ({paymentCurrency})
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder={`e.g. ${paymentCurrency === 'DOP' ? (cartTotalDOP + 500).toFixed(0) : (cartTotal + 10).toFixed(0)}`}
                      value={tendered}
                      onChange={(e) => setTendered(e.target.value)}
                      style={{ width: '100%', padding: '6px 8px', border: '1px solid #86efac', borderRadius: '6px', fontSize: '13px', fontWeight: 600, backgroundColor: 'white' }}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#15803d', marginBottom: '2px' }}>
                      {t("Change (Vuelto)")}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: changeDue > 0 ? '#15803d' : '#64748b' }}>
                      {paymentCurrency === 'DOP' ? `RD$ ${changeDue.toFixed(2)}` : `$${changeDue.toFixed(2)}`}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Footer - Fixed */}
          <div style={{ borderTop: '1px solid #e2e8f0', padding: '20px 24px', backgroundColor: 'white', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>{t("Total Due")}</span>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>{t("Rate:")} 1 USD = {exchangeRate} DOP</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '22px', fontWeight: 800, color: '#ca8a04' }}>${cartTotal.toFixed(2)} USD</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#059669', display: 'block' }}>
                  RD$ {cartTotalDOP.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DOP
                </span>
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              disabled={submitting || cart.length === 0}
              style={{ width: '100%', padding: '14px', backgroundColor: (submitting || cart.length === 0) ? '#94a3b8' : '#ca8a04', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 700, cursor: (submitting || cart.length === 0) ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(202, 138, 4, 0.2)' }}
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
