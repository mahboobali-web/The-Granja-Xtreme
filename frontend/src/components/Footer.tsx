import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fetchAPI } from '../utils/api';

export const Footer: React.FC = () => {
  const { t } = useTranslation();
  const [contactData, setContactData] = useState({
    phone: '+1 809-622-4122',
    email: 'tgranjaxtreme065@gmail.com',
    address: 'Calle Los Hidalgos, Sector Majagual, Sánchez, Samaná, Dominican Republic',
    footerText: 'High-end off-road ATV & four-wheeler adventure rentals. Providing premium vehicles, elite trail guides, and absolute safety for an unforgettable experience.',
    facebookUrl: '#',
    instagramUrl: '#',
    twitterUrl: '#'
  });

  useEffect(() => {
    const loadFooterInfo = async () => {
      try {
        const [settings, cmsInfo, footerData] = await Promise.all([
          fetchAPI('/settings').catch(() => null),
          fetchAPI('/cms/contact_info').catch(() => null),
          fetchAPI('/cms/footer_content').catch(() => null)
        ]);

        setContactData(prev => ({
          ...prev,
          phone: cmsInfo?.value?.phone || settings?.businessPhone || prev.phone,
          email: cmsInfo?.value?.email || settings?.businessEmail || prev.email,
          address: cmsInfo?.value?.address || prev.address,
          footerText: footerData?.value?.text || prev.footerText,
          facebookUrl: cmsInfo?.value?.facebookUrl || prev.facebookUrl,
          instagramUrl: cmsInfo?.value?.instagramUrl || prev.instagramUrl,
          twitterUrl: cmsInfo?.value?.twitterUrl || prev.twitterUrl
        }));
      } catch (err) {
        console.error('Failed to load footer info', err);
      }
    };
    loadFooterInfo();
  }, []);
  return (
    <footer style={{
      backgroundColor: '#111827',
      color: '#f3f4f6',
      padding: '64px 0 24px 0',
      fontFamily: 'var(--font-body)',
      borderTop: '4px solid var(--secondary)'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '40px',
          marginBottom: '40px'
        }}>
          {/* Brand Info */}
          <div>
            <h3 style={{
              fontFamily: 'var(--font-headline)',
              fontSize: '20px',
              fontWeight: 800,
              color: '#ffffff',
              marginBottom: '16px',
              letterSpacing: '1px'
            }}>
              THE GRANJA <span style={{ color: 'var(--primary)' }}>XTREME</span>
            </h3>
            <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: '20px', marginBottom: '20px' }}>
              {t(contactData.footerText, contactData.footerText)}
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              {contactData.facebookUrl && (
                <a href={contactData.facebookUrl} style={{ color: '#9ca3af' }} className="social-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0 -5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
              )}
              {contactData.instagramUrl && (
                <a href={contactData.instagramUrl} style={{ color: '#9ca3af' }} className="social-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '15px', fontWeight: 600, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t('footer_quick_links', 'Quick Links')}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              <Link to="/fleet" style={{ color: '#9ca3af' }}>{t('footer_our_fleet', 'Our ATV Fleet')}</Link>
              <Link to="/story" style={{ color: '#9ca3af' }}>{t('footer_our_story', 'Our Story & Gallery')}</Link>
              <Link to="/contact" style={{ color: '#9ca3af' }}>{t('footer_contact', 'Contact Support')}</Link>
              <Link to="/login" style={{ color: '#9ca3af' }}>{t('footer_portal', 'Customer & Staff Portal')}</Link>
            </div>
          </div>

          {/* Guidelines */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '15px', fontWeight: 600, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t('footer_rental_guidelines', 'Rental Guidelines')}
            </h4>
            <ul style={{ color: '#9ca3af', fontSize: '14px', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li>{t('footer_rule_1', 'Must be 18+ to sign waivers')}</li>
              <li>{t('footer_rule_2', 'Helmets provided & required at all times')}</li>
              <li>{t('footer_rule_3', 'Security deposits required for check-out')}</li>
              <li>{t('footer_rule_4', 'All trail rides are subject to weather')}</li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '15px', fontWeight: 600, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t('footer_contact_header', 'Contact')}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '14px', color: '#9ca3af' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <MapPin size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <span>{contactData.address}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Phone size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <span>{contactData.phone}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Mail size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <span>{contactData.email}</span>
              </div>
            </div>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #374151', margin: '32px 0 24px 0' }} />

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          color: '#9ca3af',
          fontSize: '13px'
        }}>
          <span>© {new Date().getFullYear()} The Granja Xtreme. {t('footer_all_rights', 'All rights reserved.')}</span>
          <div style={{ display: 'flex', gap: '20px' }}>
            <a href="#" style={{ color: '#9ca3af' }}>{t('footer_privacy', 'Privacy Policy')}</a>
            <a href="#" style={{ color: '#9ca3af' }}>{t('footer_terms', 'Terms of Service')}</a>
          </div>
        </div>
      </div>

      <style>{`
        .social-icon:hover { color: var(--primary) !important; }
        footer a:hover { color: #ffffff !important; }
      `}</style>
    </footer>
  );
};
