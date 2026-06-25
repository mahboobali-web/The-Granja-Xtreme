import { Request, Response } from 'express';
import { CmsContent } from '../models/cms.model';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { logActivity } from './logs.controller';

// Default presets for CMS content to avoid crashes if empty
const DEFAULT_PRESETS: Record<string, any> = {
  homepage_hero: {
    title: 'GRANJA XTREME',
    subtitle: 'PREMIUM FOUR-WHEELER & ATV ADVENTURE RENTALS',
    description: 'Experience the ultimate off-road trail adventure with our fleet of elite, high-performance ATVs. Built for rugged trails, engineered for safety, and curated for premium thrills.',
    bannerUrl: ''
  },
  waiver_terms: {
    title: 'ATV Rental Waiver & Release of Liability',
    terms: 'I hereby acknowledge that operating an All-Terrain Vehicle (ATV) / Four Wheeler is a high-risk activity. I agree to wear a helmet at all times, follow all safety instructions, and assume full financial responsibility for any damages caused to the vehicle. I release The Granja Xtreme from any liability for personal injuries sustained during the rental duration.'
  },
  homepage_stats: {
    items: [
      { value: '10k+', label: 'Adventures Hosted' },
      { value: '4.9', label: 'User Rating', showStars: true },
      { value: '45', label: 'Expert Guides' },
      { value: '150km', label: 'Private Trails' }
    ]
  },
  homepage_features: {
    title: 'The Xtreme Standards',
    subtitle: "We don't just provide tours: we curate exclusive experiences that redefine off-road luxury.",
    items: [
      { icon: 'ShieldCheck', title: 'Premium Gear', description: 'Latest generation safety equipment and high-tech communication systems for every rider.' },
      { icon: 'Eye', title: 'Expert Guides', description: 'Certified pathfinders with deep knowledge of local ecology and technical off-road driving.' },
      { icon: 'Lock', title: 'Private Trails', description: 'Access to exclusive routes reserved only for our guests, ensuring a tranquil and wild journey.' }
    ]
  },
  homepage_testimonials: {
    items: [
      {
        quote: "The private trail experience was unlike anything I've ever done. The equipment was pristine and the guide knew exactly how to push the excitement levels while keeping us safe. Truly premium.",
        name: 'Mickey Jensen',
        role: 'Adventure Enthusiast',
        initials: 'MJ',
        stars: 5
      },
      {
        quote: "A perfect blend of luxury and adrenaline. The VIP forest escape felt exclusive and well-coordinated. Highly recommend for corporate retreats or high-end travelers.",
        name: 'Sarah Lopez',
        role: 'Executive Retreat Organizer',
        initials: 'SL',
        stars: 5
      },
      {
        quote: "The Can-Am Mavericks are absolute beasts! Been to many off-road parks, but The Granja Xtreme's trails are technically challenging. The maintenance quality is top-notch.",
        name: 'Ryan Kim',
        role: 'Off-Road Racer',
        initials: 'RK',
        stars: 5
      }
    ]
  },
  homepage_gallery: {
    items: [
      { url: '/images/gallery_sunset_mountain.png', alt: 'ATV Sunset Mountain' },
      { url: '/images/gallery_muddy_tire.png', alt: 'Muddy Tire Detail' },
      { url: '/images/gallery_winding_path.png', alt: 'Aerial Winding Path' },
      { url: '/images/gallery_dense_jungle.png', alt: 'Dense Jungle Trail' }
    ]
  },
  story_content: {
    title: 'Born from the Mud, Refined for the Elite.',
    text: 'Founded in 2012 by a group of engineers and extreme sports enthusiasts, The Granja Xtreme was created to bridge the gap between raw outdoor adrenaline and luxury hospitality. We believe that true luxury isn\'t found in a lobby, but in the precision of a steering wheel and the thrill of a vertical climb.',
    quote: '"Our mission is to provide an uncompromising adventure that challenges the body while honoring the land, delivered with the world-class service our clients expect."',
    team: [
      { name: 'Marcus Thorne', role: 'CHIEF EXPEDITIONIST', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400' },
      { name: 'Elena Vance', role: 'LEAD ENGINEER', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400' },
      { name: 'David Chen', role: 'SAFETY DIRECTOR', img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400' },
      { name: 'Sofia Rossi', role: 'GUEST EXPERIENCES', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400' },
      { name: 'Jackson Ford', role: 'HEAD MECHANIC', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400' }
    ]
  },
  contact_info: {
    email: 'tgranjaxtreme065@gmail.com',
    phone: '+1 809-622-4122',
    address: 'Calle Los Hidalgos, Sector Majagual, Sánchez, Samaná, Dominican Republic',
    businessHours: 'Monday-Sunday 8:00 AM - 6:00 PM',
    facebookUrl: '#',
    instagramUrl: '#',
    twitterUrl: '#'
  },
  faq_content: {
    items: [
      { question: 'Do I need previous ATV experience?', answer: 'No prior experience is necessary. Our expert guides will provide a comprehensive safety briefing and training session before heading out on the trails.' },
      { question: 'What should I wear?', answer: 'We recommend long pants, closed-toe shoes, and comfortable clothing you don\'t mind getting dirty. We provide all necessary safety gear, including helmets and goggles.' },
      { question: 'Are there age or weight restrictions?', answer: 'Drivers must be at least 18 years old with a valid driver\'s license. Passengers must be at least 12 years old. The maximum weight limit per ATV is 350 lbs.' },
      { question: 'What happens if it rains?', answer: 'We ride rain or shine! In fact, some of our guests prefer muddy trails. However, in cases of extreme weather (e.g., lightning storms), we will reschedule your adventure.' }
    ]
  },
  footer_content: {
    text: 'Experience the wild in absolute luxury.'
  }
};

export const getCmsContent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { key } = req.params;
    let content = await CmsContent.findOne({ key });

    if (!content) {
      // Return preset if not in database
      const preset = DEFAULT_PRESETS[key];
      if (preset) {
        res.status(200).json({ key, value: preset });
        return;
      }
      res.status(404).json({ message: `CMS Section with key '${key}' not found.` });
      return;
    }

    res.status(200).json(content);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch CMS content.', error: (error as Error).message });
  }
};

export const updateCmsContent = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (!value) {
      res.status(400).json({ message: 'Content value object is required.' });
      return;
    }

    let content = await CmsContent.findOne({ key });

    if (!content) {
      content = await CmsContent.create({
        key,
        value,
        updatedBy: req.user!._id
      });
    } else {
      content.value = value;
      content.updatedBy = req.user!._id;
      await content.save();
    }

    await logActivity(`Updated CMS section: ${key}`, req.user!.email, req.ip || '', 'info');

    res.status(200).json(content);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update CMS content.', error: (error as Error).message });
  }
};
