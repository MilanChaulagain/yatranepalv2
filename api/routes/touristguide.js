import express from "express";
import {
    createTouristGuide,
    updateTouristGuide,
    deleteTouristGuide,
    getTouristGuide,
    getAllTouristGuides
} from "../controllers/touristguide.js";

const router = express.Router();

// Create a new tourist guide
router.post("/register", createTouristGuide);

// Get all tourist guides (support both legacy and RESTful paths)
router.get("/getAllTouristGuides", getAllTouristGuides);
router.get("/", getAllTouristGuides);

// Routes with IDs (must come *after* specific routes)
router.put("/:id", updateTouristGuide);
router.delete("/:id", deleteTouristGuide);
router.get("/:id", getTouristGuide);

export default router;