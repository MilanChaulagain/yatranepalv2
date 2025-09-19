import Trip from "../models/Trip.js";
import Place from "../models/Place.js";
import { buildItinerary, fetchCandidatePlaces } from "./plannerUtil.js";

// Create a new trip
export const createTrip = async (req, res, next) => {
  try {
    const body = { ...req.body };
    if (!Array.isArray(body.places) && Array.isArray(body.itinerary)) {
      body.places = Array.from(
        new Set(
          body.itinerary.flatMap((d) => (d.items || []).map((i) => i.place))
        )
      );
    }
    const trip = new Trip({ ...body, userId: req.user.id });
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

// Plan a trip (generate itinerary)
export const planTrip = async (req, res, next) => {
  try {
    const {
      name = "My Trip",
      startLocation, // { type: 'Point', coordinates: [lng, lat] }
      startDate,
      endDate,
      budget = { total: 0, currency: "NPR" },
      preferences = { pace: "standard", interests: [] },
      lockedPlaceIds = [],
    } = req.body || {};

    if (!startLocation?.coordinates || startLocation.coordinates.length !== 2) {
      return res.status(400).json({ success: false, message: "startLocation.coordinates required [lng,lat]" });
    }

    const days = startDate && endDate ? Math.max(1, Math.ceil((new Date(endDate) - new Date(startDate)) / (1000*60*60*24)) + 1) : 1;

    let candidates;
    if (Array.isArray(lockedPlaceIds) && lockedPlaceIds.length > 0) {
      candidates = await Place.find({ _id: { $in: lockedPlaceIds } }).lean();
    } else {
      candidates = await fetchCandidatePlaces(preferences?.interests);
    }

    const itinerary = buildItinerary(startLocation.coordinates, days, candidates, preferences);

    const totals = itinerary.reduce((acc, day) => {
      acc.totalEntranceFees += day.totalEntranceFees || 0;
      acc.totalTravelMinutes += day.totalTravelMinutes || 0;
      acc.days += 1;
      return acc;
    }, { totalEntranceFees: 0, totalTravelMinutes: 0, days: 0, totalCost: 0 });
    totals.totalCost = totals.totalEntranceFees; // transport/hotel can be added later

    const places = Array.from(new Set(itinerary.flatMap(d => d.items.map(i => i.place))));
    const draft = {
      name,
      startDate,
      endDate,
      startLocation,
      budget,
      preferences,
      lockedPlaceIds,
      itinerary,
      places,
      totals,
      unsaved: true,
    };

    res.status(200).json({ success: true, data: draft });
  } catch (err) {
    next(err);
  }
};
