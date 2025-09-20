import express from 'express';
import { verifyToken, verifyAdmin } from '../utils/verifyToken.js';
import { createStory, getStories, getStory, updateStory, deleteStory, toggleLike, addComment } from '../controllers/travelStory.js';

const router = express.Router();

router.get('/', getStories);
router.get('/:id', getStory);
router.post('/', verifyToken, createStory);
router.put('/:id', verifyToken, updateStory);
router.delete('/:id', verifyToken, deleteStory);
router.post('/:id/like', verifyToken, toggleLike);
router.post('/:id/comments', verifyToken, addComment);

export default router;
