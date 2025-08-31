import express from "express";
import {
  createReview, deleteReview, getAllReviews,
  getAverageRating, getReviewsByModel, getUserReviews
} from "../controllers/review.js";
import { verifyToken, verifyAdmin } from "../utils/verifyToken.js";

const router = express.Router();

// 1. Get all reviews
router.get("/", getAllReviews);

// 2. **Important:** Get reviews by user MUST come before model/id
router.get("/user/:userId", verifyToken, getUserReviews);

// 3. Get reviews for a specific item
router.get("/model/:model", getReviewsByModel);

// 4. Get average rating for a specific item
router.get("/:model/:id/average", getAverageRating);

// 5. Create a new review (protected)
router.post("/", verifyToken, createReview);

// 6. Delete a review (allow owner or admin)
router.delete("/:id", verifyToken, deleteReview);

export default router;
