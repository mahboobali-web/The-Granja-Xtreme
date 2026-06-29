import React, { useEffect, useState } from 'react';
import { Mail, CheckCircle, Search, Eye, Trash2 } from 'lucide-react';
import { fetchAPI } from '../utils/api';
import { useTranslation } from 'react-i18next';

interface ContactMessage {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  message: string;
  status: 'unread' | 'read';
  createdAt: string;
}

export const AdminMessages: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  const loadMessages = async () => {
    try {
      const data = await fetchAPI('/contact');
      setMessages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await fetchAPI(`/contact/${id}/read`, { method: 'PUT' });
      setMessages(messages.map(m => m._id === id ? { ...m, status: 'read' as const } : m));
      if (selectedMessage && selectedMessage._id === id) {
        setSelectedMessage({ ...selectedMessage, status: 'read' as const });
      }
    } catch (err) {
      console.error('Failed to mark as read');
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!window.confirm(t('adminMessages.deleteConfirm', 'Are you sure you want to delete this message?'))) return;
    try {
      await fetchAPI(`/contact/${id}`, { method: 'DELETE' });
      setMessages(messages.filter(m => m._id !== id));
      if (selectedMessage && selectedMessage._id === id) {
        setSelectedMessage(null);
      }
    } catch (err) {
      console.error('Failed to delete message');
    }
  };

  const [filterTab, setFilterTab] = useState<'all' | 'unread' | 'read'>('all');

  const filtered = messages.filter(m => {
    if (filterTab !== 'all' && m.status !== filterTab) return false;
    const fullName = `${m.firstName} ${m.lastName}`.toLowerCase();
    const term = searchTerm.toLowerCase();
    return fullName.includes(term) || m.email.toLowerCase().includes(term) || m.message.toLowerCase().includes(term);
  });

  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Bar */}
      <div className="card" style={{ padding: '16px', display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Left Side: Search */}
        <div style={{ position: 'relative', flex: '1 1 300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--on-surface-variant)' }} />
          <input
            type="text"
            placeholder={t('adminMessages.searchMessages', 'Search messages...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '44px', width: '100%', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}
          />
        </div>

        {/* Right Side: Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', backgroundColor: 'var(--surface-container)', padding: '4px', borderRadius: '8px', flex: '1 1 auto' }}>
          {(['all', 'unread', 'read'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              style={{
                flex: 1,
                padding: '12px 16px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: filterTab === tab ? 'white' : 'transparent',
                color: filterTab === tab ? 'var(--on-surface)' : 'var(--on-surface-variant)',
                fontWeight: filterTab === tab ? 600 : 500,
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: filterTab === tab ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                textTransform: 'capitalize',
                textAlign: 'center'
              }}
            >
              {t(`adminMessages.tab_${tab}`, tab)} {tab !== 'all' && `(${messages.filter(m => m.status === tab).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="checkout-grid-layout" style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '24px' }}>
        
        {/* Left Side: Messages List */}
        <div>
          <div className="card" style={{ overflow: 'hidden' }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>{t('adminMessages.loading', 'Loading...')}</div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>{t('adminMessages.noMessagesFound', 'No messages found.')}</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {filtered.map(m => (
                  <div 
                    key={m._id}
                    onClick={() => {
                      setSelectedMessage(m);
                      if (m.status === 'unread') markAsRead(m._id);
                    }}
                    style={{ 
                      padding: '16px 24px', 
                      borderBottom: '1px solid var(--border-light)',
                      cursor: 'pointer',
                      backgroundColor: selectedMessage?._id === m._id ? 'var(--primary-light)' : (m.status === 'read' ? 'transparent' : 'rgba(16, 185, 129, 0.05)'),
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '16px',
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    <div style={{ 
                      width: '40px', height: '40px', borderRadius: '50%', 
                      backgroundColor: m.status === 'read' ? 'var(--surface-container)' : 'var(--primary)', 
                      color: m.status === 'read' ? 'var(--on-surface)' : 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 
                    }}>
                      <Mail size={18} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: m.status === 'read' ? 600 : 700, color: 'var(--on-surface)' }}>{m.firstName} {m.lastName}</span>
                        <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>
                          {new Date(m.createdAt).toLocaleDateString(i18n.language?.startsWith('es') ? 'es-ES' : 'en-US')}
                        </span>
                      </div>
                      <div style={{ fontWeight: m.status === 'read' ? 400 : 600, fontSize: '14px', marginBottom: '4px' }}>{m.email}</div>
                      <div style={{ fontSize: '13px', color: 'var(--on-surface-variant)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {m.message}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Message View Container */}
        <div style={{ flex: 1 }}>
          {selectedMessage ? (
            <div className="card" style={{ padding: '24px', position: 'sticky', top: '100px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700 }}>{t('adminMessages.messageFrom', 'Message from')} {selectedMessage.firstName}</h2>
                {selectedMessage.status === 'read' && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--success)', backgroundColor: 'rgba(34,197,94,0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                    <CheckCircle size={12} /> {t('adminMessages.readStatus', 'Read')}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px', padding: '16px', backgroundColor: 'var(--surface-container)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', color: 'var(--on-surface-variant)' }}>{t('adminMessages.from', 'From')}</span>
                  <span style={{ fontWeight: 600 }}>{selectedMessage.firstName} {selectedMessage.lastName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', color: 'var(--on-surface-variant)' }}>{t('adminMessages.email', 'Email')}</span>
                  <a href={`mailto:${selectedMessage.email}`} style={{ fontWeight: 600, color: 'var(--primary)' }}>{selectedMessage.email}</a>
                </div>
                {selectedMessage.phone && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', color: 'var(--on-surface-variant)' }}>{t('adminMessages.phone', 'Phone')}</span>
                    <span style={{ fontWeight: 600 }}>{selectedMessage.phone}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', color: 'var(--on-surface-variant)' }}>{t('adminMessages.date', 'Date')}</span>
                  <span style={{ fontWeight: 600 }}>{new Date(selectedMessage.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '13px', color: 'var(--on-surface-variant)', marginBottom: '8px', fontWeight: 600 }}>{t('adminMessages.messageLabel', 'Message')}</div>
                <div style={{ 
                  padding: '16px', 
                  border: '1px solid var(--border-light)', 
                  borderRadius: 'var(--radius-md)',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.6,
                  fontSize: '14px'
                }}>
                  {selectedMessage.message}
                </div>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                {(() => {
                  const subject = encodeURIComponent('Re: Your Inquiry with Granja Xtreme');
                  const body = encodeURIComponent(`Hi ${selectedMessage.firstName},\n\n\n\n---\nOriginal Message:\nFrom: ${selectedMessage.firstName} ${selectedMessage.lastName}\nDate: ${new Date(selectedMessage.createdAt).toLocaleString()}\n\n${selectedMessage.message}`);
                  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${selectedMessage.email}&su=${subject}&body=${body}`;
                  return (
                    <>
                      <button
                        onClick={() => {
                          const w = 800;
                          const h = 650;
                          const left = (window.screen.width / 2) - (w / 2);
                          const top = (window.screen.height / 2) - (h / 2);
                          window.open(gmailUrl, 'GmailCompose', `width=${w},height=${h},top=${top},left=${left},toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes`);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          padding: '12px 24px',
                          backgroundColor: 'var(--primary)',
                          color: 'white',
                          border: 'none',
                          borderRadius: 'var(--radius-md)',
                          fontWeight: 600,
                          cursor: 'pointer',
                          flex: 1,
                          fontSize: '15px'
                        }}
                      >
                        <Mail size={18} /> {t('adminMessages.replyViaGmail', 'Reply via Gmail')}
                      </button>
                      <button
                        onClick={() => handleDeleteMessage(selectedMessage._id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          padding: '12px 24px',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          color: '#ef4444',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          borderRadius: 'var(--radius-md)',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontSize: '15px'
                        }}
                      >
                        <Trash2 size={18} /> {t('adminMessages.delete', 'Delete')}
                      </button>
                    </>
                  );
                })()}
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: '60px 24px', textAlign: 'center', position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--surface-container)', color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Eye size={32} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>{t('adminMessages.noMessageSelected', 'No Message Selected')}</h3>
              <p style={{ color: 'var(--on-surface-variant)', fontSize: '14px' }}>{t('adminMessages.selectMessagePrompt', 'Select a message from the list to view its details.')}</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
