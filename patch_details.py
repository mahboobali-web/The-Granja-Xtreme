import re

with open('frontend/src/components/AdminBookingDetailsModal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Hide "Rental Summary" on the receipt if Retail
rental_summary = """            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid #e5e7eb' }}>
                {t("RENTAL SUMMARY")}
              </div>
              <div style={{ fontSize: '14px', color: '#4b5563', lineHeight: 1.8 }}>
                {t("ATV Assigned:")} <strong style={{ color: '#111827' }}>{atvs.map((a: any) => a.name).join(', ')}</strong><br />
                {t("Pickup:")} <strong style={{ color: '#111827' }}>{pickupText}</strong><br />
                {t("Return:")} <strong style={{ color: '#111827' }}>{returnText}</strong><br />
                {t("Rental Duration:")} <strong style={{ color: '#111827' }}>{t(durationText)}</strong>
              </div>
            </div>"""

new_rental_summary = """            {b.bookingType !== 'Retail' ? (
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid #e5e7eb' }}>
                  {t("RENTAL SUMMARY")}
                </div>
                <div style={{ fontSize: '14px', color: '#4b5563', lineHeight: 1.8 }}>
                  {t("ATV Assigned:")} <strong style={{ color: '#111827' }}>{atvs.map((a: any) => a.name).join(', ')}</strong><br />
                  {t("Pickup:")} <strong style={{ color: '#111827' }}>{pickupText}</strong><br />
                  {t("Return:")} <strong style={{ color: '#111827' }}>{returnText}</strong><br />
                  {t("Rental Duration:")} <strong style={{ color: '#111827' }}>{t(durationText)}</strong>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid #e5e7eb' }}>
                  {t("PURCHASE DETAILS")}
                </div>
                <div style={{ fontSize: '14px', color: '#4b5563', lineHeight: 1.8 }}>
                  {t("Type:")} <strong style={{ color: '#111827' }}>{t("Retail / Accessories")}</strong><br />
                  {t("Date:")} <strong style={{ color: '#111827' }}>{pickupText}</strong><br />
                </div>
              </div>
            )}"""
content = content.replace(rental_summary, new_rental_summary)

# 2. Hide "Vehicles Assigned" block in Details Tab if Retail
vehicles_assigned_block = """            {/* Vehicles Assigned */}
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#1e293b', fontWeight: 800, fontSize: '16px' }}>
                <Truck size={20} color="#f97316" /> {atvsList.length > 1 ? t("Vehicles Assigned") : t("Vehicle Assigned")}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#334155' }}>
                {atvsList.map((atv: any, index: number) => { const snap = booking.snapshotAtvRates?.find((s: any) => s.atvId === atv._id || (s.atvId && s.atvId._id === atv._id)); const rate = snap ? snap.ratePerDay : (atv.ratePerDay || 0); return (
                  <div key={atv._id || index} style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: index < atvsList.length - 1 ? '12px' : '0', borderBottom: index < atvsList.length - 1 ? '1px dashed #e2e8f0' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>{t("Model")}</span> <strong style={{ textAlign: 'right' }}>{atv.name} {atv.model}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>{t("Rate")}</span> <strong>${rate}{t("/day")}</strong></div>
                  </div>
                )})}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}><span style={{ color: '#64748b' }}>{t("Schedule")}</span> 
                  <strong style={{ textAlign: 'right' }}>
                    {booking.actualCheckInTime 
                      ? `${new Date(booking.actualCheckInTime).toLocaleDateString(i18n.language?.startsWith('es') ? 'es-ES' : 'en-US')} ${new Date(booking.actualCheckInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} ${t("(Checked-In)")}`
                      : `${new Date(booking.startDate).toLocaleDateString(i18n.language?.startsWith('es') ? 'es-ES' : 'en-US')} ${t("(Scheduled Start)")}`} <br/>
                    to {booking.actualCheckOutTime 
                      ? `${new Date(booking.actualCheckOutTime).toLocaleDateString(i18n.language?.startsWith('es') ? 'es-ES' : 'en-US')} ${new Date(booking.actualCheckOutTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} ${t("(Checked-Out)")}`
                      : `${new Date(booking.endDate).toLocaleDateString(i18n.language?.startsWith('es') ? 'es-ES' : 'en-US')} ${t("(Scheduled End)")}`}
                  </strong>
                </div>
              </div>
            </div>"""

new_vehicles_assigned_block = """            {/* Vehicles Assigned */}
            {booking.bookingType !== 'Retail' && (
              <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#1e293b', fontWeight: 800, fontSize: '16px' }}>
                  <Truck size={20} color="#f97316" /> {atvsList.length > 1 ? t("Vehicles Assigned") : t("Vehicle Assigned")}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#334155' }}>
                  {atvsList.map((atv: any, index: number) => { const snap = booking.snapshotAtvRates?.find((s: any) => s.atvId === atv._id || (s.atvId && s.atvId._id === atv._id)); const rate = snap ? snap.ratePerDay : (atv.ratePerDay || 0); return (
                    <div key={atv._id || index} style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: index < atvsList.length - 1 ? '12px' : '0', borderBottom: index < atvsList.length - 1 ? '1px dashed #e2e8f0' : 'none' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>{t("Model")}</span> <strong style={{ textAlign: 'right' }}>{atv.name} {atv.model}</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>{t("Rate")}</span> <strong>${rate}{t("/day")}</strong></div>
                    </div>
                  )})}
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}><span style={{ color: '#64748b' }}>{t("Schedule")}</span> 
                    <strong style={{ textAlign: 'right' }}>
                      {booking.actualCheckInTime 
                        ? `${new Date(booking.actualCheckInTime).toLocaleDateString(i18n.language?.startsWith('es') ? 'es-ES' : 'en-US')} ${new Date(booking.actualCheckInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} ${t("(Checked-In)")}`
                        : `${new Date(booking.startDate).toLocaleDateString(i18n.language?.startsWith('es') ? 'es-ES' : 'en-US')} ${t("(Scheduled Start)")}`} <br/>
                      to {booking.actualCheckOutTime 
                        ? `${new Date(booking.actualCheckOutTime).toLocaleDateString(i18n.language?.startsWith('es') ? 'es-ES' : 'en-US')} ${new Date(booking.actualCheckOutTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} ${t("(Checked-Out)")}`
                        : `${new Date(booking.endDate).toLocaleDateString(i18n.language?.startsWith('es') ? 'es-ES' : 'en-US')} ${t("(Scheduled End)")}`}
                    </strong>
                  </div>
                </div>
              </div>
            )}"""
content = content.replace(vehicles_assigned_block, new_vehicles_assigned_block)

# 3. Hide Base Rate, Tax, Security Deposit on Financial breakdown and Receipt totals if Retail
# In renderReceiptView()
receipt_totals = """              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: '14px', color: '#4b5563' }}>
                <span>{t("ATV Rental - ")} ({days} {days > 1 ? t('Days') : t('Day')})</span>
                <span>${baseRate.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: '14px', color: '#4b5563' }}>
                <span>{t(`Luxury Tax (${b.snapshotTaxRate !== undefined ? b.snapshotTaxRate : (settings?.baseTaxRate ?? 10)}%)`)}</span>
                <span>${tax.toFixed(2)}</span>
              </div>"""

new_receipt_totals = """              {b.bookingType !== 'Retail' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: '14px', color: '#4b5563' }}>
                    <span>{t("ATV Rental - ")} ({days} {days > 1 ? t('Days') : t('Day')})</span>
                    <span>${baseRate.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: '14px', color: '#4b5563' }}>
                    <span>{t(`Luxury Tax (${b.snapshotTaxRate !== undefined ? b.snapshotTaxRate : (settings?.baseTaxRate ?? 10)}%)`)}</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                </>
              )}"""
content = content.replace(receipt_totals, new_receipt_totals)

receipt_deposit = """              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: '14px', color: '#4b5563', borderBottom: '1px solid #e5e7eb' }}>
                <span>{t("Security Deposit (Refundable)")}</span>
                <span>${securityDeposit.toFixed(2)}</span>
              </div>"""
new_receipt_deposit = """              {b.bookingType !== 'Retail' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: '14px', color: '#4b5563', borderBottom: '1px solid #e5e7eb' }}>
                  <span>{t("Security Deposit (Refundable)")}</span>
                  <span>${securityDeposit.toFixed(2)}</span>
                </div>
              )}"""
content = content.replace(receipt_deposit, new_receipt_deposit)

# Financial Breakdown
financial_breakdown = """                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>{t("Base Rate")}</span> <span>${baseRate.toFixed(2)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>{t(`Tax (${booking.snapshotTaxRate !== undefined ? booking.snapshotTaxRate : (settings?.baseTaxRate ?? 10)}%)`)}</span> <span>${tax.toFixed(2)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>{t("Security Deposit")}</span> <span>${securityDeposit.toFixed(2)}</span></div>"""

new_financial_breakdown = """                {booking.bookingType !== 'Retail' && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>{t("Base Rate")}</span> <span>${baseRate.toFixed(2)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>{t(`Tax (${booking.snapshotTaxRate !== undefined ? booking.snapshotTaxRate : (settings?.baseTaxRate ?? 10)}%)`)}</span> <span>${tax.toFixed(2)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>{t("Security Deposit")}</span> <span>${securityDeposit.toFixed(2)}</span></div>
                  </>
                )}"""
content = content.replace(financial_breakdown, new_financial_breakdown)

# Also fix "View Contract/Waiver" to be hidden for Retail
contract_btn = """              <button onClick={handleDownloadContract} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#334155', fontSize: '14px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', whiteSpace: 'nowrap' }}>
                <FileText size={18} /> {t("View Contract/Waiver")}
              </button>"""
new_contract_btn = """              {booking.bookingType !== 'Retail' && (
                <button onClick={handleDownloadContract} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#334155', fontSize: '14px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', whiteSpace: 'nowrap' }}>
                  <FileText size={18} /> {t("View Contract/Waiver")}
                </button>
              )}"""
content = content.replace(contract_btn, new_contract_btn)


with open('frontend/src/components/AdminBookingDetailsModal.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
