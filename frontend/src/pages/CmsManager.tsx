import React, { useEffect, useState } from 'react';
import { Save, CheckCircle, Plus, Trash2 } from 'lucide-react';
import { fetchAPI } from '../utils/api';
import { uploadImage } from '../utils/upload';
import { useTranslation } from 'react-i18next';

interface StatItem {
  value: string;
  label: string;
  showStars?: boolean;
}

interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

interface TestimonialItem {
  quote: string;
  name: string;
  role: string;
  initials: string;
  stars: number;
}

interface GalleryItem {
  url: string;
  alt: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface TeamMember {
  name: string;
  role: string;
  img: string;
}

export const CmsManager: React.FC = () => {
  const { t } = useTranslation();
  // Hero
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSub, setHeroSub] = useState('');
  const [heroDesc, setHeroDesc] = useState('');
  const [heroBannerUrl, setHeroBannerUrl] = useState('');
  const [uploadingHero, setUploadingHero] = useState(false);

  // Waiver
  const [waiverTitle, setWaiverTitle] = useState('');
  const [waiverTerms, setWaiverTerms] = useState('');

  // Stats
  const [stats, setStats] = useState<StatItem[]>([]);

  // Features
  const [featTitle, setFeatTitle] = useState('');
  const [featSubtitle, setFeatSubtitle] = useState('');
  const [featItems, setFeatItems] = useState<FeatureItem[]>([]);

  // Testimonials
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);

  // Gallery
  const [gallery, setGallery] = useState<GalleryItem[]>([]);

  // Story Content
  const [storyTitle, setStoryTitle] = useState('');
  const [storyTitleEs, setStoryTitleEs] = useState('');
  const [storyText, setStoryText] = useState('');
  const [storyTextEs, setStoryTextEs] = useState('');
  const [storyQuote, setStoryQuote] = useState('');
  const [storyQuoteEs, setStoryQuoteEs] = useState('');
  const [storyTeam, setStoryTeam] = useState<TeamMember[]>([]);

  // Contact Info
  const [contactAddress, setContactAddress] = useState('');
  const [contactDirections, setContactDirections] = useState('');
  const [contactFb, setContactFb] = useState('');
  const [contactIg, setContactIg] = useState('');
  const [contactTw, setContactTw] = useState('');

  // FAQ
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);

  // Footer
  const [footerText, setFooterText] = useState('');

  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [successKey, setSuccessKey] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const loadCmsData = async () => {
      try {
        const heroData = await fetchAPI('/cms/homepage_hero');
        if (heroData?.value) {
          setHeroTitle(heroData.value.title);
          setHeroSub(heroData.value.subtitle);
          setHeroDesc(heroData.value.description);
          setHeroBannerUrl(heroData.value.bannerUrl || '');
        }

        const waiverData = await fetchAPI('/cms/waiver_terms');
        if (waiverData?.value) {
          setWaiverTitle(waiverData.value.title);
          setWaiverTerms(waiverData.value.terms);
        }

        const statsData = await fetchAPI('/cms/homepage_stats');
        if (statsData?.value?.items) setStats(statsData.value.items);

        const featData = await fetchAPI('/cms/homepage_features');
        if (featData?.value) {
          setFeatTitle(featData.value.title);
          setFeatSubtitle(featData.value.subtitle);
          setFeatItems(featData.value.items || []);
        }

        const testData = await fetchAPI('/cms/homepage_testimonials');
        if (testData?.value?.items) setTestimonials(testData.value.items);

        const galData = await fetchAPI('/cms/homepage_gallery');
        if (galData?.value?.items) setGallery(galData.value.items);

        const storyData = await fetchAPI('/cms/story_content');
        if (storyData?.value) {
          setStoryTitle(storyData.value.title || '');
          setStoryTitleEs(storyData.value.titleEs || '');
          setStoryText(storyData.value.text || '');
          setStoryTextEs(storyData.value.textEs || '');
          setStoryQuote(storyData.value.quote || '');
          setStoryQuoteEs(storyData.value.quoteEs || '');
          if (storyData.value.team) setStoryTeam(storyData.value.team);
        }

        const contactData = await fetchAPI('/cms/contact_info');
        if (contactData?.value) {
          setContactAddress(contactData.value.address);
          setContactDirections(contactData.value.directions);
          setContactFb(contactData.value.facebookUrl);
          setContactIg(contactData.value.instagramUrl);
          setContactTw(contactData.value.twitterUrl);
        }

        const faqData = await fetchAPI('/cms/faq_content');
        if (faqData?.value?.items) setFaqItems(faqData.value.items);

        const footerData = await fetchAPI('/cms/footer_content');
        if (footerData?.value) setFooterText(footerData.value.text);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadCmsData();
  }, []);

  const saveCms = async (key: string, value: any) => {
    setSavingKey(key);
    setSuccessKey(null);
    setErrorMsg('');
    try {
      await fetchAPI(`/cms/${key}`, { method: 'PUT', body: { value } });
      setSuccessKey(key);
      setTimeout(() => setSuccessKey(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || `Failed to update ${key}.`);
    } finally {
      setSavingKey(null);
    }
  };

  const SaveButton: React.FC<{ cmsKey: string; label: string; onClick: () => void }> = ({ cmsKey, label, onClick }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
      <div>
        {successKey === cmsKey && (
          <span style={{ color: 'var(--primary-dark)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
            <CheckCircle size={16} /> {t('adminCms.saveSuccess', 'Saved!')}
          </span>
        )}
      </div>
      <button
        onClick={onClick}
        className="btn btn-primary"
        disabled={savingKey === cmsKey}
        style={{ fontSize: '13px', padding: '10px 20px' }}
      >
        {savingKey === cmsKey ? t('adminCms.saving', 'Saving...') : <><Save size={14} /> {label}</>}
      </button>
    </div>
  );

  // Stat helpers
  const updateStat = (index: number, field: keyof StatItem, value: any) => {
    const updated = [...stats];
    (updated[index] as any)[field] = value;
    setStats(updated);
  };

  const addStat = () => setStats([...stats, { value: '0', label: 'New Stat' }]);
  const removeStat = (i: number) => setStats(stats.filter((_, idx) => idx !== i));

  // Feature helpers
  const updateFeat = (index: number, field: keyof FeatureItem, value: string) => {
    const updated = [...featItems];
    updated[index][field] = value;
    setFeatItems(updated);
  };
  const addFeat = () => setFeatItems([...featItems, { icon: 'Star', title: 'New Feature', description: '' }]);
  const removeFeat = (i: number) => setFeatItems(featItems.filter((_, idx) => idx !== i));

  // Testimonial helpers
  const updateTest = (index: number, field: keyof TestimonialItem, value: any) => {
    const updated = [...testimonials];
    (updated[index] as any)[field] = value;
    setTestimonials(updated);
  };
  const addTest = () => setTestimonials([...testimonials, { quote: '', name: '', role: '', initials: '', stars: 5 }]);
  const removeTest = (i: number) => setTestimonials(testimonials.filter((_, idx) => idx !== i));

  // Gallery helpers
  const [uploadingGal, setUploadingGal] = useState<number | null>(null);
  const updateGal = (index: number, field: keyof GalleryItem, value: string) => {
    const updated = [...gallery];
    updated[index][field] = value;
    setGallery(updated);
  };
  const addGal = () => setGallery([...gallery, { url: '', alt: '' }]);
  const removeGal = (i: number) => setGallery(gallery.filter((_, idx) => idx !== i));
  const handleGalUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    try {
      setUploadingGal(index);
      setErrorMsg('');
      const url = await uploadImage(e.target.files[0], 'gallery');
      updateGal(index, 'url', url);
    } catch (err: any) {
      setErrorMsg(err.message || 'Upload failed');
    } finally {
      setUploadingGal(null);
    }
  };

  // Team helpers
  const [uploadingTeam, setUploadingTeam] = useState<number | null>(null);
  const updateTeam = (index: number, field: keyof TeamMember, value: string) => {
    const updated = [...storyTeam];
    updated[index][field] = value;
    setStoryTeam(updated);
  };
  const addTeam = () => setStoryTeam([...storyTeam, { name: '', role: '', img: '' }]);
  const removeTeam = (i: number) => setStoryTeam(storyTeam.filter((_, idx) => idx !== i));
  const handleTeamUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    try {
      setUploadingTeam(index);
      setErrorMsg('');
      const url = await uploadImage(e.target.files[0], 'team');
      updateTeam(index, 'img', url);
    } catch (err: any) {
      setErrorMsg(err.message || 'Upload failed');
    } finally {
      setUploadingTeam(null);
    }
  };

  // FAQ helpers
  const updateFaq = (index: number, field: keyof FaqItem, value: string) => {
    const updated = [...faqItems];
    updated[index][field] = value;
    setFaqItems(updated);
  };
  const addFaq = () => setFaqItems([...faqItems, { question: '', answer: '' }]);
  const removeFaq = (i: number) => setFaqItems(faqItems.filter((_, idx) => idx !== i));

  // Hero Helpers
  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    try {
      setUploadingHero(true);
      setErrorMsg('');
      const url = await uploadImage(e.target.files[0], 'hero');
      setHeroBannerUrl(url);
    } catch (err: any) {
      setErrorMsg(err.message || 'Upload failed');
    } finally {
      setUploadingHero(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '100px 0' }}>{t('adminCms.loading', 'Loading CMS panel...')}</div>;

  const sectionCard = (children: React.ReactNode) => (
    <div className="card" style={{ padding: '32px', marginBottom: '32px' }}>
      {children}
    </div>
  );

  const sectionTitle = (title: string, desc?: string) => (
    <div style={{ marginBottom: '20px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>{title}</h2>
      {desc && <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)' }}>{desc}</p>}
    </div>
  );

  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'contents' }}>

        {errorMsg && <div className="alert alert-error">{errorMsg}</div>}

        {/* ====== 1. Hero Section ====== */}
        {sectionCard(<>
          {sectionTitle(t('adminCms.heroSection', 'Homepage Hero Section'), t('adminCms.heroSectionDesc', 'The main banner at the top of the landing page.'))}
          <div className="form-group">
            <label className="form-label">{t('adminCms.heroTitle', 'Hero Title')}</label>
            <input type="text" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} className="form-input" required />
          </div>
          <div className="form-group">
            <label className="form-label">{t('adminCms.heroSubtitle', 'Hero Subtitle')}</label>
            <input type="text" value={heroSub} onChange={(e) => setHeroSub(e.target.value)} className="form-input" required />
          </div>
          <div className="form-group">
            <label className="form-label">{t('adminCms.descBodyText', 'Description Body Text')}</label>
            <textarea value={heroDesc} onChange={(e) => setHeroDesc(e.target.value)} className="form-input" rows={3} required />
          </div>
          <div className="form-group">
            <label className="form-label">{t('adminCms.heroBannerImage', 'Hero Banner Image')}</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <input type="text" value={heroBannerUrl} onChange={(e) => setHeroBannerUrl(e.target.value)} className="form-input" placeholder={t('adminCms.imageUrl', 'Image URL')} />
              <input type="file" accept="image/*" onChange={handleHeroUpload} disabled={uploadingHero} style={{ fontSize: '13px' }} />
              {uploadingHero && <span style={{ fontSize: '13px', color: 'var(--primary)' }}>{t('adminCms.uploading', 'Uploading...')}</span>}
            </div>
            {heroBannerUrl && (
              <div style={{ marginTop: '12px', width: '200px', height: '100px', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'var(--surface-container)' }}>
                <img src={heroBannerUrl} alt="Hero Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
          </div>
          <SaveButton cmsKey="homepage_hero" label={t('adminCms.saveHero', 'Save Hero')} onClick={() => saveCms('homepage_hero', { title: heroTitle, subtitle: heroSub, description: heroDesc, bannerUrl: heroBannerUrl })} />
        </>)}

        {/* ====== 2. Stats Bar ====== */}
        {sectionCard(<>
          {sectionTitle(t('adminCms.statsBar', 'Stats Bar'), t('adminCms.statsBarDesc', 'The row of numbers shown below the hero (Adventures, Rating, Guides, Trails).'))}
          {stats.map((s, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
              <input type="text" value={s.value} onChange={(e) => updateStat(i, 'value', e.target.value)} className="form-input" placeholder={t('adminCms.valueLabel', 'Value (e.g. 10k+)')} style={{ padding: '8px 12px' }} />
              <input type="text" value={s.label} onChange={(e) => updateStat(i, 'label', e.target.value)} className="form-input" placeholder={t('adminCms.label', 'Label')} style={{ padding: '8px 12px' }} />
              <button onClick={() => removeStat(i)} className="btn btn-danger" style={{ padding: '6px 10px', fontSize: '12px' }}><Trash2 size={14} /></button>
            </div>
          ))}
          <button onClick={addStat} className="btn btn-secondary" style={{ fontSize: '12px', padding: '6px 14px', marginTop: '4px' }}><Plus size={14} /> {t('adminCms.addStat', 'Add Stat')}</button>
          <SaveButton cmsKey="homepage_stats" label={t('adminCms.saveStats', 'Save Stats')} onClick={() => saveCms('homepage_stats', { items: stats })} />
        </>)}

        {/* ====== 3. Features Section ====== */}
        {sectionCard(<>
          {sectionTitle(t('adminCms.featuresSection', 'Features — "The Xtreme Standards"'), t('adminCms.featuresSectionDesc', 'The 3 feature cards on the dark section.'))}
          <div className="form-group">
            <label className="form-label">{t('adminCms.sectionTitle', 'Section Title')}</label>
            <input type="text" value={featTitle} onChange={(e) => setFeatTitle(e.target.value)} className="form-input" style={{ padding: '8px 12px' }} />
          </div>
          <div className="form-group">
            <label className="form-label">{t('adminCms.sectionSubtitle', 'Section Subtitle')}</label>
            <input type="text" value={featSubtitle} onChange={(e) => setFeatSubtitle(e.target.value)} className="form-input" style={{ padding: '8px 12px' }} />
          </div>
          <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', margin: '16px 0' }} />
          {featItems.map((f, i) => (
            <div key={i} style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '10px', marginBottom: '8px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--on-surface-variant)' }}>{t('adminCms.icon', 'Icon')}</label>
                  <select value={f.icon} onChange={(e) => updateFeat(i, 'icon', e.target.value)} className="form-input" style={{ padding: '6px 8px', fontSize: '13px' }}>
                    <option value="ShieldCheck">ShieldCheck</option>
                    <option value="Eye">Eye</option>
                    <option value="Lock">Lock</option>
                    <option value="Star">Star</option>
                    <option value="Compass">Compass</option>
                    <option value="Mountain">Mountain</option>
                    <option value="Zap">Zap</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--on-surface-variant)' }}>{t('adminCms.title', 'Title')}</label>
                  <input type="text" value={f.title} onChange={(e) => updateFeat(i, 'title', e.target.value)} className="form-input" style={{ padding: '6px 8px', fontSize: '13px' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button onClick={() => removeFeat(i)} className="btn btn-danger" style={{ padding: '6px 10px', fontSize: '12px' }}><Trash2 size={14} /></button>
                </div>
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--on-surface-variant)' }}>{t('adminCms.description', 'Description')}</label>
                <textarea value={f.description} onChange={(e) => updateFeat(i, 'description', e.target.value)} className="form-input" rows={2} style={{ padding: '6px 8px', fontSize: '13px' }} />
              </div>
            </div>
          ))}
          <button onClick={addFeat} className="btn btn-secondary" style={{ fontSize: '12px', padding: '6px 14px' }}><Plus size={14} /> {t('adminCms.addFeature', 'Add Feature')}</button>
          <SaveButton cmsKey="homepage_features" label={t('adminCms.saveFeatures', 'Save Features')} onClick={() => saveCms('homepage_features', { title: featTitle, subtitle: featSubtitle, items: featItems })} />
        </>)}

        {/* ====== 4. Testimonials ====== */}
        {sectionCard(<>
          {sectionTitle(t('adminCms.testimonials', 'Testimonials — "Unforgettable Stories"'), t('adminCms.testimonialsDesc', 'Customer review cards on the homepage.'))}
          {testimonials.map((tItem, i) => (
            <div key={i} style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px auto', gap: '10px', marginBottom: '8px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--on-surface-variant)' }}>{t('adminCms.name', 'Name')}</label>
                  <input type="text" value={tItem.name} onChange={(e) => updateTest(i, 'name', e.target.value)} className="form-input" style={{ padding: '6px 8px', fontSize: '13px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--on-surface-variant)' }}>{t('adminCms.role', 'Role')}</label>
                  <input type="text" value={tItem.role} onChange={(e) => updateTest(i, 'role', e.target.value)} className="form-input" style={{ padding: '6px 8px', fontSize: '13px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--on-surface-variant)' }}>{t('adminCms.stars', 'Stars')}</label>
                  <select value={tItem.stars} onChange={(e) => updateTest(i, 'stars', parseInt(e.target.value))} className="form-input" style={{ padding: '6px 8px', fontSize: '13px' }}>
                    <option value={5}>★★★★★</option>
                    <option value={4}>★★★★☆</option>
                    <option value={3}>★★★☆☆</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button onClick={() => removeTest(i)} className="btn btn-danger" style={{ padding: '6px 10px', fontSize: '12px' }}><Trash2 size={14} /></button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--on-surface-variant)' }}>{t('adminCms.initials', 'Initials')}</label>
                  <input type="text" value={tItem.initials} onChange={(e) => updateTest(i, 'initials', e.target.value)} className="form-input" maxLength={3} style={{ padding: '6px 8px', fontSize: '13px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--on-surface-variant)' }}>{t('adminCms.quote', 'Quote')}</label>
                  <textarea value={tItem.quote} onChange={(e) => updateTest(i, 'quote', e.target.value)} className="form-input" rows={2} style={{ padding: '6px 8px', fontSize: '13px' }} />
                </div>
              </div>
            </div>
          ))}
          <button onClick={addTest} className="btn btn-secondary" style={{ fontSize: '12px', padding: '6px 14px' }}><Plus size={14} /> {t('adminCms.addTestimonial', 'Add Testimonial')}</button>
          <SaveButton cmsKey="homepage_testimonials" label={t('adminCms.saveTestimonials', 'Save Testimonials')} onClick={() => saveCms('homepage_testimonials', { items: testimonials })} />
        </>)}

        {/* ====== 5. Gallery ====== */}
        {sectionCard(<>
          {sectionTitle(t('adminCms.gallery', 'Gallery — "Capture the Thrill"'), t('adminCms.galleryDesc', 'The photo grid at the bottom of the homepage.'))}
          {gallery.map((g, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '60px 2fr 1fr auto', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ width: '50px', height: '38px', borderRadius: '4px', overflow: 'hidden', backgroundColor: 'var(--surface-container)' }}>
                {g.url && <img src={g.url} alt={g.alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <input type="text" value={g.url} onChange={(e) => updateGal(i, 'url', e.target.value)} className="form-input" placeholder={t('adminCms.imageUrl', 'Image URL')} style={{ padding: '8px 12px' }} />
                <input type="file" accept="image/*" onChange={(e) => handleGalUpload(i, e)} disabled={uploadingGal === i} style={{ fontSize: '12px' }} />
                {uploadingGal === i && <span style={{ fontSize: '12px', color: 'var(--primary)' }}>{t('adminCms.uploading', 'Uploading...')}</span>}
              </div>
              <input type="text" value={g.alt} onChange={(e) => updateGal(i, 'alt', e.target.value)} className="form-input" placeholder={t('adminCms.altText', 'Alt text')} style={{ padding: '8px 12px' }} />
              <button onClick={() => removeGal(i)} className="btn btn-danger" style={{ padding: '6px 10px', fontSize: '12px' }}><Trash2 size={14} /></button>
            </div>
          ))}
          <button onClick={addGal} className="btn btn-secondary" style={{ fontSize: '12px', padding: '6px 14px' }}><Plus size={14} /> {t('adminCms.addImage', 'Add Image')}</button>
          <SaveButton cmsKey="homepage_gallery" label={t('adminCms.saveGallery', 'Save Gallery')} onClick={() => saveCms('homepage_gallery', { items: gallery })} />
        </>)}

        {/* ====== 6. Waiver Terms ====== */}
        {sectionCard(<>
          {sectionTitle(t('adminCms.waiverTitle', 'Liability Waiver Agreement'), t('adminCms.waiverDesc', 'The legal contract shown during checkout.'))}
          <div className="form-group">
            <label className="form-label">{t('adminCms.docHeader', 'Document Contract Header')}</label>
            <input type="text" value={waiverTitle} onChange={(e) => setWaiverTitle(e.target.value)} className="form-input" required />
          </div>
          <div className="form-group">
            <label className="form-label">{t('adminCms.waiverBody', 'Waiver Release Terms Body Copy')}</label>
            <textarea value={waiverTerms} onChange={(e) => setWaiverTerms(e.target.value)} className="form-input" rows={6} required />
          </div>
          <SaveButton cmsKey="waiver_terms" label={t('adminCms.saveWaiver', 'Save Waiver')} onClick={() => saveCms('waiver_terms', { title: waiverTitle, terms: waiverTerms })} />
        </>)}

        {/* ====== 7. Story/About Content ====== */}
        {sectionCard(<>
          {sectionTitle(t('adminCms.storyTitle', 'Story & About'), t('adminCms.storyDesc', 'Content and Team members for the About page.'))}
          <div className="form-group">
            <label className="form-label">{t('adminCms.storyHeadline', 'Story Headline')} (EN)</label>
            <input type="text" value={storyTitle} onChange={(e) => setStoryTitle(e.target.value)} className="form-input" required />
          </div>
          <div className="form-group">
            <label className="form-label">{t('adminCms.storyHeadlineEs', 'Story Headline (Spanish)')}</label>
            <input type="text" value={storyTitleEs} onChange={(e) => setStoryTitleEs(e.target.value)} className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">{t('adminCms.storyBodyText', 'Story Body Text')} (EN)</label>
            <textarea value={storyText} onChange={(e) => setStoryText(e.target.value)} className="form-input" rows={4} required />
          </div>
          <div className="form-group">
            <label className="form-label">{t('adminCms.storyBodyTextEs', 'Story Body Text (Spanish)')}</label>
            <textarea value={storyTextEs} onChange={(e) => setStoryTextEs(e.target.value)} className="form-input" rows={4} />
          </div>
          <div className="form-group">
            <label className="form-label">{t('adminCms.storyQuote', 'Story Quote')} (EN)</label>
            <textarea value={storyQuote} onChange={(e) => setStoryQuote(e.target.value)} className="form-input" rows={2} required />
          </div>
          <div className="form-group">
            <label className="form-label">{t('adminCms.storyQuoteEs', 'Story Quote (Spanish)')}</label>
            <textarea value={storyQuoteEs} onChange={(e) => setStoryQuoteEs(e.target.value)} className="form-input" rows={2} />
          </div>
          <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', margin: '16px 0' }} />
          <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>{t('adminCms.teamMembers', 'Team Members')}</h3>
          {storyTeam.map((tItem, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr auto', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
              <input type="text" value={tItem.name} onChange={(e) => updateTeam(i, 'name', e.target.value)} className="form-input" placeholder={t('adminCms.name', 'Name')} style={{ padding: '8px 12px' }} />
              <input type="text" value={tItem.role} onChange={(e) => updateTeam(i, 'role', e.target.value)} className="form-input" placeholder={t('adminCms.role', 'Role')} style={{ padding: '8px 12px' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <input type="text" value={tItem.img} onChange={(e) => updateTeam(i, 'img', e.target.value)} className="form-input" placeholder={t('adminCms.imageUrl', 'Image URL')} style={{ padding: '8px 12px' }} />
                <input type="file" accept="image/*" onChange={(e) => handleTeamUpload(i, e)} disabled={uploadingTeam === i} style={{ fontSize: '12px' }} />
                {uploadingTeam === i && <span style={{ fontSize: '12px', color: 'var(--primary)' }}>{t('adminCms.uploading', 'Uploading...')}</span>}
              </div>
              <button onClick={() => removeTeam(i)} className="btn btn-danger" style={{ padding: '6px 10px', fontSize: '12px' }}><Trash2 size={14} /></button>
            </div>
          ))}
          <button onClick={addTeam} className="btn btn-secondary" style={{ fontSize: '12px', padding: '6px 14px' }}><Plus size={14} /> {t('adminCms.addTeamMember', 'Add Team Member')}</button>
          <SaveButton cmsKey="story_content" label={t('adminCms.saveStory', 'Save Story Content')} onClick={() => saveCms('story_content', { title: storyTitle, titleEs: storyTitleEs, text: storyText, textEs: storyTextEs, quote: storyQuote, quoteEs: storyQuoteEs, team: storyTeam })} />
        </>)}

        {/* ====== 8. Contact Info ====== */}
        {sectionCard(<>
          {sectionTitle(t('adminCms.contactTitle', 'Contact & Location Info'), t('adminCms.contactDesc', 'Address, directions, and social links used across the site.'))}
          <div className="form-group">
            <label className="form-label">{t('adminCms.physicalAddress', 'Physical Address')}</label>
            <input type="text" value={contactAddress} onChange={(e) => setContactAddress(e.target.value)} className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">{t('adminCms.directions', 'Directions')}</label>
            <textarea value={contactDirections} onChange={(e) => setContactDirections(e.target.value)} className="form-input" rows={2} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">{t('adminCms.facebookUrl', 'Facebook URL')}</label>
              <input type="text" value={contactFb} onChange={(e) => setContactFb(e.target.value)} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">{t('adminCms.instagramUrl', 'Instagram URL')}</label>
              <input type="text" value={contactIg} onChange={(e) => setContactIg(e.target.value)} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">{t('adminCms.twitterUrl', 'Twitter/X URL')}</label>
              <input type="text" value={contactTw} onChange={(e) => setContactTw(e.target.value)} className="form-input" />
            </div>
          </div>
          <SaveButton cmsKey="contact_info" label={t('adminCms.saveContact', 'Save Contact Info')} onClick={() => saveCms('contact_info', { address: contactAddress, directions: contactDirections, facebookUrl: contactFb, instagramUrl: contactIg, twitterUrl: contactTw })} />
        </>)}

        {/* ====== 9. FAQ ====== */}
        {sectionCard(<>
          {sectionTitle(t('adminCms.faqTitle', 'Frequently Asked Questions'), t('adminCms.faqDesc', 'Questions and answers displayed on the Contact/FAQ page.'))}
          {faqItems.map((f, i) => (
            <div key={i} style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--on-surface-variant)' }}>{t('adminCms.question', 'Question')} {i + 1}</label>
                <button onClick={() => removeFaq(i)} className="btn btn-danger" style={{ padding: '6px 10px', fontSize: '12px' }}><Trash2 size={14} /></button>
              </div>
              <input type="text" value={f.question} onChange={(e) => updateFaq(i, 'question', e.target.value)} className="form-input" placeholder={t('adminCms.question', 'Question')} style={{ padding: '8px 12px', marginBottom: '8px' }} />
              <textarea value={f.answer} onChange={(e) => updateFaq(i, 'answer', e.target.value)} className="form-input" placeholder={t('adminCms.answer', 'Answer')} rows={2} style={{ padding: '8px 12px' }} />
            </div>
          ))}
          <button onClick={addFaq} className="btn btn-secondary" style={{ fontSize: '12px', padding: '6px 14px' }}><Plus size={14} /> {t('adminCms.addFaq', 'Add FAQ')}</button>
          <SaveButton cmsKey="faq_content" label={t('adminCms.saveFaqs', 'Save FAQs')} onClick={() => saveCms('faq_content', { items: faqItems })} />
        </>)}

        {/* ====== 10. Footer Content ====== */}
        {sectionCard(<>
          {sectionTitle(t('adminCms.footerTitle', 'Footer Content'), t('adminCms.footerDesc', 'Bottom section text.'))}
          <div className="form-group">
            <label className="form-label">{t('adminCms.footerSlogan', 'Footer Slogan/Text')}</label>
            <input type="text" value={footerText} onChange={(e) => setFooterText(e.target.value)} className="form-input" required />
          </div>
          <SaveButton cmsKey="footer_content" label={t('adminCms.saveFooter', 'Save Footer')} onClick={() => saveCms('footer_content', { text: footerText })} />
        </>)}

      </div>
    </div>
  );
};
