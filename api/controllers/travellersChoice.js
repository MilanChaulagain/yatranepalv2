import TravellersChoice from '../models/TravellersChoice.js';

export const createChoice = async (req, res, next) => {
  try {
    const doc = await TravellersChoice.create(req.body);
    res.status(201).json({ success: true, data: doc });
  } catch (err) { next(err); }
};

export const listChoices = async (req, res, next) => {
  try {
    const docs = await TravellersChoice.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, data: docs });
  } catch (err) { next(err); }
};

export const getChoice = async (req, res, next) => {
  try {
    const doc = await TravellersChoice.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json({ success: true, data: doc });
  } catch (err) { next(err); }
};

export const updateChoice = async (req, res, next) => {
  try {
    const doc = await TravellersChoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json({ success: true, data: doc });
  } catch (err) { next(err); }
};

export const deleteChoice = async (req, res, next) => {
  try {
    await TravellersChoice.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { next(err); }
};
