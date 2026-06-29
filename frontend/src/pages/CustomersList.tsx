import React, { useEffect, useState } from 'react';
import { fetchAPI } from '../utils/api';
import { Search, UserPlus, ChevronRight, ChevronLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
  createdAt: string;
  totalRentals?: number;
  avatarUrl?: string;
}

export const CustomersList: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterDate, setFilterDate] = useState('Any');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const navigate = useNavigate();

  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ firstName: '', lastName: '', email: '', phone: '', passport: '' });
  const [adding, setAdding] = useState(false);

  const loadCustomers = async () => {
    try {
      const data = await fetchAPI('/auth/customers');
      setCustomers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      await fetchAPI('/auth/customers', {
        method: 'POST',
        body: addForm
      });
      setShowAddModal(false);
      setAddForm({ firstName: '', lastName: '', email: '', phone: '', passport: '' });
      loadCustomers();
    } catch (error) {
      console.error(error);
      alert(t('Failed to add customer. Email may already exist.'));
    } finally {
      setAdding(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(i18n.language?.startsWith('es') ? 'es-ES' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'vip':
      case 'premium':
        return { bg: '#fef3c7', text: '#b45309', label: t('Premium/VIP'), dot: '#d97706' };
      case 'pending':
        return { bg: '#f1f5f9', text: '#475569', label: t('Pending'), dot: '#94a3b8' };
      case 'active':
      case 'confirmed':
      default:
        return { bg: '#ecfccb', text: '#4d7c0f', label: t('Confirmed'), dot: '#65a30d' };
    }
  };

  // Removed mock data
  const filteredCustomers = customers.filter(c => {
    // Search
    const searchLower = searchQuery.toLowerCase();
    const nameMatch = `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchLower);
    const emailMatch = c.email.toLowerCase().includes(searchLower);
    const phoneMatch = c.phone?.toLowerCase().includes(searchLower);
    const matchesSearch = nameMatch || emailMatch || phoneMatch;

    // Status Filter
    const matchesStatus = filterStatus === 'All' || 
      (filterStatus === 'Premium/VIP' && c.status === 'VIP') ||
      (filterStatus === 'Confirmed' && c.status === 'Active') ||
      (filterStatus === 'Pending' && c.status === 'Pending');

    // Date Filter
    let matchesDate = true;
    const joinDate = new Date(c.createdAt);
    const now = new Date();
    if (filterDate === 'This Month') {
      matchesDate = joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
    } else if (filterDate === 'Last 6 Months') {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(now.getMonth() - 6);
      matchesDate = joinDate >= sixMonthsAgo;
    } else if (filterDate === 'This Year') {
      matchesDate = joinDate.getFullYear() === now.getFullYear();
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const displayCustomers = filteredCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) return <div style={{ textAlign: 'center', padding: '100px 0', color: '#64748b' }}>{t("Loading customer data...")}</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Filter Bar */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '20px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder={t("Search by name, email or phone...")}
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              style={{
                width: '100%',
                padding: '10px 16px 10px 40px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '13px',
                color: '#334155',
                outline: 'none'
              }}
            />
          </div>
          <select 
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', color: '#475569', backgroundColor: 'white', outline: 'none', cursor: 'pointer' }}>
            <option value="All">{t("Status: All")}</option>
            <option value="Premium/VIP">{t("Premium/VIP")}</option>
            <option value="Confirmed">{t("Confirmed")}</option>
            <option value="Pending">{t("Pending")}</option>
          </select>
          <select 
            value={filterDate}
            onChange={(e) => { setFilterDate(e.target.value); setCurrentPage(1); }}
            style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', color: '#475569', backgroundColor: 'white', outline: 'none', cursor: 'pointer' }}>
            <option value="Any">{t("Date Joined: Any")}</option>
            <option value="This Month">{t("This Month")}</option>
            <option value="Last 6 Months">{t("Last 6 Months")}</option>
            <option value="This Year">{t("This Year")}</option>
          </select>
        </div>

        <button 
          onClick={() => setShowAddModal(true)}
          style={{
          backgroundColor: '#4d7c0f',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '10px 20px',
          fontSize: '13px',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          whiteSpace: 'nowrap'
        }}>
          <UserPlus size={16} /> {t("Add Customer")}
        </button>
      </div>

      {/* Main Table Card */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
        overflow: 'hidden'
      }}>
        <div className="admin-table-container">
<table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
              <th style={{ padding: '20px 24px', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t("Customer")}</th>
              <th style={{ padding: '20px 24px', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t("Contact")}</th>
              <th style={{ padding: '20px 24px', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t("Join Date")}</th>
              <th style={{ padding: '20px 24px', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>{t("Total Rentals")}</th>
              <th style={{ padding: '20px 24px', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t("Status")}</th>
              <th style={{ padding: '20px 24px', width: '40px' }}></th>
            </tr>
          </thead>
          <tbody>
            {displayCustomers.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                  {t("No customers found.")}
                </td>
              </tr>
            ) : displayCustomers.map((c) => {
              const badge = getStatusBadge(c.status);
              return (
                <tr key={c._id} 
                  onClick={() => navigate(`/admin/customers/${c._id}`)}
                  style={{ 
                  borderBottom: '1px solid #f1f5f9',
                  backgroundColor: 'white', // Slight green tint for hover state
                  transition: 'background-color 0.2s',
                  cursor: 'pointer'
                }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 800, color: '#475569', flexShrink: 0 }}>
                        {c.firstName?.[0]}{c.lastName?.[0]}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>{c.firstName} {c.lastName}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>ID: #{c._id.substring(c._id.length - 7).toUpperCase()}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: '#334155', marginBottom: '4px' }}>{c.email}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{c.phone || '+1 (555) 000-0000'}</div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: '#334155' }}>
                      {formatDate(c.createdAt).split(',')[0]}<br/>
                      {formatDate(c.createdAt).split(',')[1]}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                    <div style={{ 
                      display: 'inline-flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: '#e0e7ff',
                      color: '#3730a3',
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 800
                    }}>
                      {c.totalRentals || 0}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: badge.bg,
                      color: badge.text,
                      padding: '6px 12px',
                      borderRadius: '16px',
                      fontSize: '11px',
                      fontWeight: 700
                    }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: badge.dot }}></div>
                      {badge.label}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', color: '#cbd5e1' }}>
                    <ChevronRight size={18} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
</div>

        {/* Footer Pagination */}
        {totalPages > 1 && (
          <div style={{ padding: '20px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '13px', color: '#64748b' }}>
              {t("Showing")} <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> {t("to")} <strong>{Math.min(currentPage * itemsPerPage, filteredCustomers.length)}</strong> {t("of")} <strong>{filteredCustomers.length}</strong> {t("customers")}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{ padding: '8px 12px', border: '1px solid #e2e8f0', backgroundColor: 'white', borderRadius: '8px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', color: '#64748b', opacity: currentPage === 1 ? 0.5 : 1 }}>
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button 
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  style={{ 
                    padding: '8px 16px', 
                    border: currentPage === i + 1 ? 'none' : '1px solid #e2e8f0', 
                    backgroundColor: currentPage === i + 1 ? '#4d7c0f' : 'white', 
                    color: currentPage === i + 1 ? 'white' : '#64748b', 
                    borderRadius: '8px', 
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '13px'
                  }}>
                  {i + 1}
                </button>
              ))}
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{ padding: '8px 12px', border: '1px solid #e2e8f0', backgroundColor: 'white', borderRadius: '8px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', color: '#64748b', opacity: currentPage === totalPages ? 0.5 : 1 }}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '400px', padding: '32px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{t("Add Customer")}</h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>{t("First Name")}</label>
                  <input required type="text" value={addForm.firstName} onChange={e => setAddForm({...addForm, firstName: e.target.value})} style={{ width: '100%', padding: '10px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>{t("Last Name")}</label>
                  <input required type="text" value={addForm.lastName} onChange={e => setAddForm({...addForm, lastName: e.target.value})} style={{ width: '100%', padding: '10px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>{t("Email Address")}</label>
                <input required type="email" value={addForm.email} onChange={e => setAddForm({...addForm, email: e.target.value})} style={{ width: '100%', padding: '10px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>{t("Phone Number")}</label>
                <input required type="tel" value={addForm.phone} onChange={e => setAddForm({...addForm, phone: e.target.value})} style={{ width: '100%', padding: '10px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>{t("Passport / ID (Optional)")}</label>
                <input type="text" value={addForm.passport} onChange={e => setAddForm({...addForm, passport: e.target.value})} style={{ width: '100%', padding: '10px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box' }} placeholder={t("Will be used for rental contracts")} />
              </div>
              
              <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: 'white', color: '#475569', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>{t("Cancel")}</button>
                <button type="submit" disabled={adding} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#4d7c0f', color: 'white', fontSize: '14px', fontWeight: 700, cursor: 'pointer', opacity: adding ? 0.7 : 1 }}>{adding ? t('Adding...') : t('Add Customer')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
