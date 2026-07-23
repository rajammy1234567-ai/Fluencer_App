import express from 'express';
import Banner from '../models/Banner.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Real Default Banners Fallback
const DEFAULT_BANNERS = [
  {
    id: 'default_1',
    title: 'Monetize Your Influence',
    subtitle: 'Connect with Top Fashion & Lifestyle Brands',
    image_url: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=800&auto=format&fit=crop&q=80',
    action_type: 'category',
    target_id: 'Fashion'
  },
  {
    id: 'default_2',
    title: 'Summer Campaign Drop 2026',
    subtitle: 'Paid Reel Deals starting at ₹5,000 / Creator',
    image_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80',
    action_type: 'campaign',
    target_id: ''
  },
  {
    id: 'default_3',
    title: 'Zero Commission Deduction on First Deal',
    subtitle: 'Grow, Learn & Earn with Fluencer',
    image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&auto=format&fit=crop&q=80',
    action_type: 'url',
    target_id: ''
  }
];

// Public Route: Fetch all active banners
router.get('/', async (req, res) => {
  try {
    const list = await Banner.find({ is_active: true }).sort({ order: 1, created_at: -1 }).lean();
    if (list && list.length > 0) {
      const banners = list.map(b => ({
        id: b._id.toString(),
        title: b.title,
        subtitle: b.subtitle,
        image_url: b.image_url,
        action_type: b.action_type,
        target_id: b.target_id
      }));
      return res.json({ success: true, banners });
    }
    // Return default curated banners if no DB banners exist yet
    res.json({ success: true, banners: DEFAULT_BANNERS });
  } catch (error) {
    console.error('Fetch banners error:', error);
    res.json({ success: true, banners: DEFAULT_BANNERS });
  }
});

// Admin Route: Add a new banner
router.post('/admin', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    const { title, subtitle, image_url, action_type, target_id, order } = req.body;
    if (!title || !image_url) {
      return res.status(400).json({ success: false, message: 'Title and Image URL are required' });
    }
    const banner = await Banner.create({
      title,
      subtitle: subtitle || '',
      image_url,
      action_type: action_type || 'campaign',
      target_id: target_id || '',
      order: order || 0
    });
    res.status(201).json({ success: true, message: 'Banner added successfully', banner });
  } catch (error) {
    console.error('Create banner error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin Route: Delete a banner
router.delete('/admin/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    await Banner.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Banner deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
