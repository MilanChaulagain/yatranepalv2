import TravelStory from '../models/TravelStory.js';
import jwt from 'jsonwebtoken';

export const createStory = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const body = req.body || {};
    console.log('[createStory] incoming body:', body);

    // Normalize and validate inputs
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const destination = typeof body.destination === 'string' ? body.destination.trim() : '';
    const content = typeof body.content === 'string' ? body.content.trim() : '';

    if (!title || !destination || !content) {
      return res.status(400).json({ message: 'Title, destination, and content are required.' });
    }

    // Tags can be array of strings or comma-separated string
    let tags = [];
    if (Array.isArray(body.tags)) {
      tags = body.tags.map((t) => String(t).trim()).filter(Boolean);
    } else if (typeof body.tags === 'string') {
      tags = body.tags.split(',').map((t) => t.trim()).filter(Boolean);
    }

    // Rating should be 0..5
    let rating = Number(body.rating);
    if (Number.isNaN(rating)) rating = 0;
    rating = Math.max(0, Math.min(5, rating));

    // Optional fields
    let visitDate = undefined;
    if (body.visitDate) {
      const d = new Date(body.visitDate);
      if (!isNaN(d.getTime())) visitDate = d;
    }

    let durationDays = undefined;
    if (body.durationDays !== undefined && body.durationDays !== null && body.durationDays !== '') {
      const dd = Number(body.durationDays);
      if (!Number.isNaN(dd) && dd >= 0) durationDays = dd;
    }

    const payload = {
      user: req.user.id,
      title,
      destination,
      content,
      images: Array.isArray(body.images) ? body.images : [],
      rating,
      tags,
      visitDate,
      durationDays,
      budgetRange: typeof body.budgetRange === 'string' ? body.budgetRange : undefined,
      isPublished: body.isPublished !== undefined ? !!body.isPublished : true,
    };
    console.log('[createStory] normalized payload:', payload);

    const story = await TravelStory.create(payload);
    res.status(201).json({ success: true, data: story });
  } catch (err) {
    console.error('[createStory] error:', err?.name, err?.message);
    if (err?.name === 'ValidationError') {
      const details = Object.values(err.errors || {}).map((e) => e.message);
      return res.status(400).json({ message: 'Validation failed', details });
    }
    next(err);
  }
};

export const getStories = async (req, res, next) => {
  try {
    const { q, destination, userId } = req.query;
    const filter = {};
    if (destination) filter.destination = new RegExp(destination, 'i');
    if (userId) filter.user = userId;
    if (q) {
      const escapeRegExp = (s = '') => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(escapeRegExp(q), 'i');
      filter.$or = [
        { title: re },
        { content: re },
        { destination: re },
        { tags: { $in: [re] } },
      ];
    }
    const stories = await TravelStory.find(filter)
      .sort({ createdAt: -1 })
      .populate([
        { path: 'user', select: 'username img' },
        { path: 'comments.user', select: 'username img' },
      ]);
    // Derive current user id if token provided (optional auth)
    let currentUserId = null;
    try {
      const auth = req.headers?.authorization;
      const token = auth && auth.startsWith('Bearer ') ? auth.split(' ')[1] : null;
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        currentUserId = decoded?.id || null;
      }
    } catch (_) { /* ignore token errors for public listing */ }

    const data = stories.map((s) => {
      const obj = s.toObject({ virtuals: false });
      const likedBy = Array.isArray(obj.likedBy) ? obj.likedBy : [];
      const liked = currentUserId ? likedBy.some((u) => String(u) === String(currentUserId)) : false;
      const commentsCount = Array.isArray(obj.comments) ? obj.comments.length : 0;
      delete obj.likedBy; // avoid leaking liker list
      return { ...obj, liked, commentsCount };
    });
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const getStory = async (req, res, next) => {
  try {
    const story = await TravelStory.findById(req.params.id).populate([
      { path: 'user', select: 'username img' },
      { path: 'comments.user', select: 'username img' },
    ]);
    if (!story) return res.status(404).json({ message: 'Not found' });
    let currentUserId = null;
    try {
      const auth = req.headers?.authorization;
      const token = auth && auth.startsWith('Bearer ') ? auth.split(' ')[1] : null;
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        currentUserId = decoded?.id || null;
      }
    } catch (_) {}
    const obj = story.toObject({ virtuals: false });
    const likedBy = Array.isArray(obj.likedBy) ? obj.likedBy : [];
    const liked = currentUserId ? likedBy.some((u) => String(u) === String(currentUserId)) : false;
    const commentsCount = Array.isArray(obj.comments) ? obj.comments.length : 0;
    delete obj.likedBy;
    res.json({ success: true, data: { ...obj, liked, commentsCount } });
  } catch (err) { next(err); }
};

export const updateStory = async (req, res, next) => {
  try {
    const story = await TravelStory.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Not found' });
    if (String(story.user) !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const updated = await TravelStory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
};

export const deleteStory = async (req, res, next) => {
  try {
    const story = await TravelStory.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Not found' });
    if (String(story.user) !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    await story.deleteOne();
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { next(err); }
};

export const toggleLike = async (req, res, next) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: 'Unauthorized' });
    const story = await TravelStory.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Not found' });
    const userId = req.user.id;
    const already = story.likedBy?.some((u) => String(u) === userId);
    if (already) {
      story.likedBy = story.likedBy.filter((u) => String(u) !== userId);
    } else {
      story.likedBy = [...(story.likedBy || []), userId];
    }
    story.likes = (story.likedBy || []).length;
    await story.save();
    const populated = await story.populate('user', 'username img');
    const obj = populated.toObject({ virtuals: false });
    delete obj.likedBy;
    res.json({ success: true, data: { ...obj, liked: true, commentsCount: Array.isArray(obj.comments) ? obj.comments.length : 0 } });
  } catch (err) { next(err); }
};

export const addComment = async (req, res, next) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: 'Unauthorized' });
    const { text } = req.body || {};
    if (!text || String(text).trim().length === 0) {
      return res.status(400).json({ message: 'Comment text is required.' });
    }
    const story = await TravelStory.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Not found' });
    story.comments = story.comments || [];
    story.comments.push({ user: req.user.id, text: String(text).trim() });
    await story.save();
    const populated = await story.populate([
      { path: 'user', select: 'username img' },
      { path: 'comments.user', select: 'username img' },
    ]);
    const obj = populated.toObject({ virtuals: false });
    delete obj.likedBy;
    res.status(201).json({ success: true, data: { ...obj, commentsCount: Array.isArray(obj.comments) ? obj.comments.length : 0 } });
  } catch (err) { next(err); }
};
