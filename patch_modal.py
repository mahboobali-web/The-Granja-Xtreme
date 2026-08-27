import re

with open('frontend/src/components/AdminBookingModal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Import Package icon
content = content.replace("User, Truck, PenTool", "User, Truck, PenTool, Package")

# 2. Add new states
state_injection = """  const [bookingType, setBookingType] = useState<'Rental' | 'Retail'>('Rental');
  const [availableAccessories, setAvailableAccessories] = useState<any[]>([]);
  const [selectedAccessories, setSelectedAccessories] = useState<any[]>([]);
"""
content = content.replace("const [settings, setSettings] = useState({ baseTaxRate: 10, securityDeposit: 150 });", 
                          "const [settings, setSettings] = useState({ baseTaxRate: 10, securityDeposit: 150 });\n" + state_injection)


# 3. Load Accessories
content = content.replace("fetchAPI('/settings').catch(() => null)", 
                          "fetchAPI('/settings').catch(() => null),\n          fetchAPI('/accessories').catch(() => [])")

content = content.replace("const [cData, aData, sData] = await Promise.all([", 
                          "const [cData, aData, sData, accData] = await Promise.all([")

content = content.replace("if (sData) setSettings(sData);", 
                          "if (sData) setSettings(sData);\n        if (accData) setAvailableAccessories(accData);")

# 4. Modify getConflictingSelectedAtvs to ignore Retail
content = content.replace("const getConflictingSelectedAtvs = () => {\n    if (!startDate || !endDate) return [];", 
                          "const getConflictingSelectedAtvs = () => {\n    if (bookingType === 'Retail') return [];\n    if (!startDate || !endDate) return [];")

# 5. Modify calculateItemizedTotals
calc_injection = """  const calculateItemizedTotals = () => {
    const accessoriesSum = selectedAccessories.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    
    if (bookingType === 'Retail') {
      const discountRate = customDiscountRate !== '' ? Number(customDiscountRate) : 0;
      const discountAmount = Math.round(accessoriesSum * (discountRate / 100) * 100) / 100;
      return { items: [], grandTotal: accessoriesSum - discountAmount, totalBase: accessoriesSum, totalTax: 0, totalDeposit: 0, discountAmount, discountRate, accessoriesSum };
    }
"""
content = content.replace("  const calculateItemizedTotals = () => {", calc_injection)

# Modify grandTotal for Rental (add accessories)
content = content.replace("const grandTotal = totalBase - discountAmount + recalculatedTax + totalDeposit;",
                          "const grandTotal = totalBase - discountAmount + recalculatedTax + totalDeposit + accessoriesSum;")
content = content.replace("return { items, grandTotal, totalBase, totalTax: recalculatedTax, totalDeposit, discountAmount, discountRate };",
                          "return { items, grandTotal, totalBase, totalTax: recalculatedTax, totalDeposit, discountAmount, discountRate, accessoriesSum };")


# 6. handleReviewConfirm
review_injection = """  const handleReviewConfirm = async () => {
    setLoading(true);
    setError('');

    if (bookingType === 'Retail') {
      if (selectedAccessories.length === 0) {
        setError('Please select at least one accessory for Retail checkout.');
        setLoading(false);
        return;
      }
      if (!selectedCustomerId) {
        setError('Please select a customer or create a new one first.');
        setLoading(false);
        return;
      }
      setStep(3);
      setLoading(false);
      return;
    }
"""
content = content.replace("  const handleReviewConfirm = async () => {\n    setLoading(true);\n    setError('');", review_injection)


# 7. handleSubmit
submit_injection = """      const result = await fetchAPI('/bookings/admin-create', {
        method: 'POST',
        body: {
          bookingType,
          customerId: selectedCustomerId,
          atvIds: bookingType === 'Retail' ? [] : selectedAtvIds,
          startDate: bookingType === 'Retail' ? new Date().toISOString() : startDate,
          endDate: bookingType === 'Retail' ? new Date().toISOString() : endDate,
          notes,
          accessories: selectedAccessories,
          customDiscountRate: customDiscountRate !== '' ? Number(customDiscountRate) : undefined
        }
      });"""
content = re.sub(r"const result = await fetchAPI\('/bookings/admin-create', \{[\s\S]*?\}\);", submit_injection, content)

# 8. Step 1 UI (Add Radio buttons for booking type)
ui_step1_injection = """        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 700, color: bookingType === 'Rental' ? '#4d7c0f' : '#64748b' }}>
                <input type="radio" checked={bookingType === 'Rental'} onChange={() => setBookingType('Rental')} style={{ accentColor: '#4d7c0f' }} />
                ATV Rental
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 700, color: bookingType === 'Retail' ? '#4d7c0f' : '#64748b' }}>
                <input type="radio" checked={bookingType === 'Retail'} onChange={() => setBookingType('Retail')} style={{ accentColor: '#4d7c0f' }} />
                Retail / Accessories Only
              </label>
            </div>
"""
content = content.replace("        {step === 1 && (\n          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>", ui_step1_injection)

# 9. Modify Next button on Step 1 to go to Step 3 if Retail
next_step_1 = """                <button 
                disabled={!selectedCustomerId}
                onClick={() => setStep(bookingType === 'Retail' ? 3 : 2)}
"""
content = content.replace("""                <button 
                disabled={!selectedCustomerId}
                onClick={() => setStep(2)}""", next_step_1)


# 10. Accessories UI in Step 3 (Since Retail goes 1 -> 3, we put Accessories in Step 3, OR we put it in step 3 for Rental as well)
accessories_ui = """
            {/* Accessories Section for Retail or Rental */}
            <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Package size={16} /> {t("Accessories")}
              </h3>
              
              {selectedAccessories.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                  {selectedAccessories.map((acc, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>{acc.name} - ${acc.price.toFixed(2)}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>{t("Qty")}:</span>
                          <input 
                            type="number" 
                            min="1" 
                            value={acc.quantity} 
                            onChange={(e) => {
                              const newQty = Math.max(1, parseInt(e.target.value) || 1);
                              setSelectedAccessories(selectedAccessories.map((a, i) => i === index ? { ...a, quantity: newQty } : a));
                            }}
                            style={{ width: '50px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                          />
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 700, minWidth: '50px', textAlign: 'right' }}>${(acc.price * acc.quantity).toFixed(2)}</span>
                        <button onClick={() => setSelectedAccessories(selectedAccessories.filter((_, i) => i !== index))} style={{ border: 'none', background: 'none', color: '#ef4444', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>{t("Remove")}</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <select 
                onChange={(e) => {
                  if (!e.target.value) return;
                  const accessory = availableAccessories.find(a => a._id === e.target.value);
                  if (accessory) {
                    const exists = selectedAccessories.find(a => a.accessoryId === accessory._id);
                    if (exists) {
                      setSelectedAccessories(selectedAccessories.map(a => a.accessoryId === accessory._id ? { ...a, quantity: a.quantity + 1 } : a));
                    } else {
                      const accName = i18n.language?.startsWith('es') ? (accessory.nameEs || accessory.name) : accessory.name;
                      setSelectedAccessories([...selectedAccessories, { accessoryId: accessory._id, name: accName, price: accessory.price, quantity: 1 }]);
                    }
                  }
                  e.target.value = "";
                }}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              >
                <option value="">{t("-- Select Accessory to Add --")}</option>
                {availableAccessories.map(a => {
                  const accName = i18n.language?.startsWith('es') ? (a.nameEs || a.name) : a.name;
                  return <option key={a._id} value={a._id}>{accName} (${a.price.toFixed(2)})</option>;
                })}
              </select>
            </div>
"""

content = content.replace("""        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>""",
            "        {step === 3 && (\n          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>\n" + accessories_ui + "\n            <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>")


# 11. Fix Itemized summary to only show ATV stuff if Rental
atv_summary = """              {bookingType === 'Rental' && (
                <>
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
                </>
              )}
"""
content = re.sub(r"<h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>[\s\S]*?</div>\n\s*</div>", atv_summary, content, count=1)


# 12. Fix the totals block for Retail
totals_ui = """              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#64748b' }}>
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
                {bookingType === 'Rental' && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{t('tax_label', `Tax (${settings.baseTaxRate}%):`)}</span>
                      <span style={{ fontWeight: 600, color: '#334155' }}>${totals.totalTax.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{t('refundable_security_deposit', 'Refundable Security Deposit')}:</span>
                      <span style={{ fontWeight: 600 }}>${totals.totalDeposit.toFixed(2)}</span>
                    </div>
                  </>
                )}
"""
content = content.replace("""              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#64748b' }}>
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
                </div>""", totals_ui)


# 13. Step 3 back button logic
back_step_3 = """              <button onClick={() => setStep(bookingType === 'Retail' ? 1 : 2)} style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: 600, cursor: 'pointer' }}>{t('back', 'Back')}</button>"""
content = content.replace("""              <button onClick={() => setStep(2)} style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: 600, cursor: 'pointer' }}>{t('back', 'Back')}</button>""", back_step_3)


# Add types for calculateItemizedTotals
# I just did this, so it should be fine.

with open('frontend/src/components/AdminBookingModal.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
