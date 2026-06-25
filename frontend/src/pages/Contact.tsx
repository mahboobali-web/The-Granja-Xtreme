import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, Clock } from 'lucide-react';
import { useStickyState } from '../hooks/useStickyState';
import { fetchAPI } from '../utils/api';
import { useTranslation } from 'react-i18next';

export const Contact: React.FC = () => {
  const { t } = useTranslation();
  const [name, setName] = useStickyState('', 'contact_name');
  const [email, setEmail] = useStickyState('', 'contact_email');
  const [phone, setPhone] = useStickyState('', 'contact_phone');
  const [subject, setSubject] = useStickyState('Booking Inquiry', 'contact_subject');
  const [message, setMessage] = useStickyState('', 'contact_message');
  const [success, setSuccess] = useState(false);
  const [contactData, setContactData] = useState({
    phone: '+1 (555) 0123-4567',
    email: 'hello@granjax.com',
    address: '123 Adventure Trail, Emerald Highlands, Pine Valley, 90210',
    hours: { days: 'Monday to Sunday', open: '08:00', close: '18:00' }
  });

  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    if (!minutes) return time; // Fallback if already formatted
    let h = parseInt(hours, 10);
    if (isNaN(h)) return time;
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12;
    return `${h}:${minutes} ${ampm}`;
  };

  const [faqItems, setFaqItems] = useState<{question: string, answer: string}[]>([]);

  useEffect(() => {
    const loadContactInfo = async () => {
      try {
        const [settings, cmsInfo, faqData] = await Promise.all([
          fetchAPI('/settings').catch(() => null),
          fetchAPI('/cms/contact_info').catch(() => null),
          fetchAPI('/cms/faq_content').catch(() => null)
        ]);

        setContactData(prev => ({
          ...prev,
          phone: settings?.businessPhone || prev.phone,
          email: settings?.businessEmail || prev.email,
          hours: settings?.operatingHours || prev.hours,
          address: cmsInfo?.value?.address || prev.address
        }));

        if (faqData?.value?.items) {
          setFaqItems(faqData.value.items);
        }
      } catch (err) {
        console.error('Failed to load contact info', err);
      }
    };
    loadContactInfo();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || 'Unknown';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'User';

      await fetchAPI('/contact', {
        method: 'POST',
        body: {
          firstName,
          lastName,
          email,
          phone,
          message: `[Subject: ${subject}]\n\n${message}`
        }
      });
      
      setSuccess(true);
      setName('');
      setEmail('');
      setPhone('');
      setSubject('Booking Inquiry');
      setMessage('');
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      console.error('Failed to submit message', err);
      alert(err.message || 'Failed to send message. Please try again.');
    }
  };

  return (
    <div className="contact-page">
      {/* Header */}
      <div className="contact-header">
        <h1>{t("Get in Touch")}</h1>
        <p>{t("Ready for your next adventure? Our team is here to help you craft the perfect off-road experience in the heart of nature.")}</p>
      </div>

      <div className="container">
        {/* Main Content Grid */}
        <div className="contact-grid">
          {/* Left: Form Card */}
          <div className="contact-form-card">
            <h2>{t("Send us a Message")}</h2>

            <form onSubmit={handleSubmit}>
              <div className="contact-form-row">
                <div className="contact-form-group">
                  <label>{t("NAME")}</label>
                  <input
                    type="text"
                    placeholder={t("Your full name")}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="contact-form-group">
                  <label>{t("PHONE")}</label>
                  <input
                    type="tel"
                    placeholder="(555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="contact-form-group">
                <label>{t("EMAIL")}</label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="contact-form-group">
                <label>{t("SUBJECT")}</label>
                <select value={subject} onChange={(e) => setSubject(e.target.value)}>
                  <option value="Booking Inquiry">{t("Booking Inquiry")}</option>
                  <option value="Group Reservation">{t("Group Reservation")}</option>
                  <option value="Fleet Information">{t("Fleet Information")}</option>
                  <option value="Custom Trail Route">{t("Custom Trail Route")}</option>
                  <option value="General Question">{t("General Question")}</option>
                </select>
              </div>

              <div className="contact-form-group">
                <label>{t("MESSAGE")}</label>
                <textarea
                  placeholder={t("How can we help you?")}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  required
                />
              </div>

              {success && (
                <div className="contact-success">
                  <CheckCircle size={16} /> {t("Inquiry sent successfully! Our staff will email you shortly.")}
                </div>
              )}

              <button type="submit" className="contact-submit-btn">
                {t("Send Message")} <Send size={16} />
              </button>
            </form>
          </div>

          {/* Right: Map + Info */}
          <div className="contact-right">
            {/* Map Image */}
            <div className="contact-map-card">
              <img
                src="/images/nicolas-hoizey-ouL9Ccp5KXw-unsplash.jpg"
                alt={t("Visit Our Ranch")}
              />
              <div className="contact-map-overlay">
                <MapPin size={16} /> {t("Visit Our Ranch")}
              </div>
            </div>

            {/* Contact Info Row */}
            <div className="contact-info-row">
              <div className="contact-info-item">
                <div className="contact-info-icon phone-icon">
                  <Phone size={18} />
                </div>
                <div>
                  <span className="contact-info-label">{t("PHONE")}</span>
                  <span className="contact-info-value">{contactData.phone}</span>
                </div>
              </div>
              <div className="contact-info-item">
                <div className="contact-info-icon email-icon">
                  <Mail size={18} />
                </div>
                <div>
                  <span className="contact-info-label">{t("EMAIL")}</span>
                  <span className="contact-info-value">{contactData.email}</span>
                </div>
              </div>
            </div>

            <div className="contact-info-row" style={{ marginTop: 0 }}>
              <div className="contact-info-item">
                <div className="contact-info-icon location-icon">
                  <MapPin size={18} />
                </div>
                <div>
                  <span className="contact-info-label">{t("LOCATION")}</span>
                  <span className="contact-info-value">{contactData.address}</span>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="contact-hours-card">
              <h3><Clock size={18} /> {t("Business Hours")}</h3>
              <div className="hours-row">
                <span>{t(contactData.hours.days || 'Monday - Sunday', contactData.hours.days || 'Monday - Sunday')}</span>
                <span className="hours-time">{formatTime(contactData.hours.open)} - {formatTime(contactData.hours.close)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* FAQ Section */}
        {faqItems.length > 0 && (
          <div style={{ marginTop: '64px', borderTop: '1px solid #e5e7eb', paddingTop: '64px', marginBottom: '64px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 800, textAlign: 'center', marginBottom: '48px', color: '#111827' }}>{t("Frequently Asked Questions")}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', maxWidth: '1000px', margin: '0 auto' }}>
              {faqItems.map((faq, idx) => (
                <div key={idx} style={{ backgroundColor: '#f9fafb', padding: '24px', borderRadius: '12px' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#1f2937', marginBottom: '12px' }}>{t(faq.question, faq.question)}</h4>
                  <p style={{ fontSize: '15px', color: '#4b5563', lineHeight: '1.6' }}>{t(faq.answer, faq.answer)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
