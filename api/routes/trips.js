import express from "express";
import { verifyToken } from "../utils/verifyToken.js";
import {
  createTrip,
  getUserTrips,
  getTrip,
  updateTrip,
  deleteTrip
} from "../controllers/trip.js";

const router = express.Router();

// Create a new trip
router.post("/", verifyToken, createTrip);
// Get all trips for logged-in user
router.get("/user", verifyToken, getUserTrips);
// Get a single trip
router.get("/:id", verifyToken, getTrip);
// Update a trip
router.put("/:id", verifyToken, updateTrip);
// Delete a trip
router.delete("/:id", verifyToken, deleteTrip);

export default router;
