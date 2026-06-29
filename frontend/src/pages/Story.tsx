import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchAPI } from '../utils/api';

export const Story: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [activeFilter, setActiveFilter] = useState('All Photos');
  const filters = ['All Photos', 'Adventure', 'Fleet', 'Team'];

  const [loading, setLoading] = useState(true);

  const [content, setContent] = useState({
    title: 'Born from the Mud, Refined for the Elite.',
    titleEs: '',
    text: 'Founded in 2012 by a group of engineers and extreme sports enthusiasts...',
    textEs: '',
    quote: '"Our mission is to provide an uncompromising adventure..."',
    quoteEs: '',
    team: [
      { name: 'Marcus Thorne', role: 'CHIEF EXPEDITIONIST', img: '/images/hero_home.jpeg' }
    ]
  });

  const [gallery, setGallery] = useState<{url: string, category: string}[]>([
    { url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800&auto=format&fit=crop', category: 'Fleet' }
  ]);

  useEffect(() => {
    const loadStory = async () => {
      try {
        const storyData = await fetchAPI('/cms/story_content');
        if (storyData?.value) setContent(storyData.value);

        const galData = await fetchAPI('/cms/homepage_gallery');
        if (galData?.value?.items) {
          setGallery(galData.value.items.map((g: any, i: number) => ({
            url: g.url,
            category: g.category || 'Adventure'
          })));
        }
      } catch (err) {
        console.error('Failed to load story content', err);
      } finally {
        setLoading(false);
      }
    };
    loadStory();
  }, []);

  const filteredGallery = activeFilter === 'All Photos' 
    ? gallery 
    : gallery.filter(img => img.category === activeFilter);

  if (loading) {
    return (
      <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className="about-page">
      {/* 1. Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content">
          <h1>{t('story_hero_title', 'Our Legacy of Grit')}</h1>
          <p>{t('story_hero_desc', "Where premium engineering meets the untamed wild. Discover the story behind the world's most exclusive off-road experience.")}</p>
        </div>
      </section>

      {/* 2. Our Story Section */}
      <section className="about-section">
        <div className="container">
          <div className="about-story-grid">
            <div>
              <span className="about-label">{t('story_label', 'OUR STORY')}</span>
              <h2 className="about-title">{i18n.language?.startsWith('es') ? (content.titleEs || t(content.title, content.title)) : t(content.title, content.title)}</h2>
              <p className="about-text">
                {i18n.language?.startsWith('es') ? (content.textEs || t(content.text, content.text)) : t(content.text, content.text)}
              </p>
              <div className="about-quote">
                <p>{i18n.language?.startsWith('es') ? (content.quoteEs || t(content.quote, content.quote)) : t(content.quote, content.quote)}</p>
              </div>
            </div>
            <div className="about-story-image">
              <img src="/images/antonio-lopez-1GTeWZgryks-unsplash.jpg" alt="ATV Steering Wheel Dashboard" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Team Section */}
      <section className="about-team-section">
        <div className="container">
          <h2 className="about-title" style={{ textAlign: 'center', marginBottom: '8px' }}>{t('story_team_title', 'The Architects of Adventure')}</h2>
          <p className="about-text" style={{ textAlign: 'center' }}>{t('story_team_desc', 'Expert guides, technical masters, and safety protocols that set the industry standard.')}</p>
          
          <div className="about-team-grid">
            {content.team.map((member, idx) => (
              <div key={idx} className="team-card">
                <img src={member.img} alt={member.name} />
                <h3>{t(member.name, member.name)}</h3>
                <p>{t(member.role, member.role)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Gallery Section */}
      <section className="about-gallery-section">
        <div className="container">
          <div className="gallery-header">
            <div>
              <h2 className="about-title" style={{ marginBottom: '8px' }}>{t('story_gallery_title', 'Glimpses of the Xtreme')}</h2>
              <p className="about-text" style={{ marginBottom: 0 }}>{t('story_gallery_desc', 'Explore the landscapes we conquer and the fleet that takes us there.')}</p>
            </div>
            <div className="gallery-filters">
              {filters.map(filter => (
                <button 
                  key={filter}
                  className={`gallery-filter-btn ${activeFilter === filter ? 'active' : ''}`}
                  onClick={() => setActiveFilter(filter)}
                >
                  {t(filter, filter)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="about-gallery-grid">
            {filteredGallery.map((img, idx) => (
              <img key={idx} src={img.url} alt={`Gallery ${idx}`} />
            ))}
          </div>

          {/* 5. Newsletter Section */}
          <div className="about-newsletter">
            <div className="newsletter-content">
              <h2>{t('story_newsletter_title', 'Join the Xtreme Elite')}</h2>
              <p>{t('story_newsletter_desc', 'Subscribe to our newsletter for exclusive trail access, VIP booking windows, and technical off-road workshops.')}</p>
              <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                <input type="email" placeholder={t('story_newsletter_placeholder', 'Your professional email')} />
                <button type="submit">{t('story_newsletter_btn', 'JOIN THE CLUB')}</button>
              </form>
            </div>
            <div className="newsletter-image"></div>
          </div>
        </div>
      </section>
    </div>
  );
};
