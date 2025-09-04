import express from "express";
import { upload, uploadImage, uploadMultipleImages } from "../controllers/upload.js";

const router = express.Router();

// Upload single image
router.post("/single", upload.single("image"), uploadImage);

// Upload multiple images
router.post("/multiple", upload.array("images", 10), uploadMultipleImages);

export default router;
