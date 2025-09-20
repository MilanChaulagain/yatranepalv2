import express from 'express';
import { verifyAdmin } from '../utils/verifyToken.js';
import { createChoice, listChoices, getChoice, updateChoice, deleteChoice } from '../controllers/travellersChoice.js';

const router = express.Router();

router.get('/', listChoices);
router.get('/:id', getChoice);
router.post('/', verifyAdmin, createChoice);
router.put('/:id', verifyAdmin, updateChoice);
router.delete('/:id', verifyAdmin, deleteChoice);

export default router;
