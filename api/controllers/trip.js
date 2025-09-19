import Trip from "../models/Trip.js";

// Create a new trip
export const createTrip = async (req, res, next) => {
  try {
    const trip = new Trip({ ...req.body, userId: req.user.id });
    await trip.save();
    res.status(201).json({ success: true, data: trip });
  } catch (err) {
    next(err);
  }
};

// Get all trips for a user
export const getUserTrips = async (req, res, next) => {
  try {
    const trips = await Trip.find({ userId: req.user.id }).populate("places");
    res.status(200).json({ success: true, data: trips });
  } catch (err) {
    next(err);
  }
};

// Get a single trip
export const getTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id).populate("places");
    if (!trip) return res.status(404).json({ success: false, message: "Trip not found" });
    res.status(200).json({ success: true, data: trip });
  } catch (err) {
    next(err);
  }
};

// Update a trip
export const updateTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: trip });
  } catch (err) {
    next(err);
  }
};

// Delete a trip
export const deleteTrip = async (req, res, next) => {
  try {
    await Trip.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Trip deleted" });
  } catch (err) {
    next(err);
  }
};
