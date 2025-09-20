import express from 'express';
import {
    createPlace,
    deletePlace,
    getAllCategories,
    getAllCities,
    getAllPlaces,
    getPlaceById,
    getPlacesByCategory,
    updatePlace
} from '../controllers/place.js';

const router = express.Router();

// Create a new place
router.post('/', createPlace);

// Get all places with optional filters
router.get('/', getAllPlaces);

// Get places by category
router.get('/category/:category', getPlacesByCategory);

// Get all available categories
router.get('/categories/all', getAllCategories);

// Get all available cities
router.get('/cities', getAllCities);

// Get place by ID
router.get('/:id', getPlaceById);

// Update a place
router.put('/:id', updatePlace);

// Delete a place
router.delete('/:id', deletePlace);

export default router;