import Place from "../models/Place.js";

const toRad = (v) => (v * Math.PI) / 180;
export const haversineKm = (a, b) => {
  const R = 6371;
  const dLat = toRad(b[1] - a[1]);
  const dLon = toRad(b[0] - a[0]);
  const lat1 = toRad(a[1]);
  const lat2 = toRad(b[1]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

export const estimateTravelMinutes = (km) => Math.round((km / 25) * 60); // 25km/h avg city/regional

export const fetchCandidatePlaces = async (interests = [], limit = 50) => {
  const filter = {};
  if (interests?.length) {
    filter.category = { $in: interests };
  }
  return Place.find(filter).limit(limit).lean();
};

export const scorePlace = (place, prefs) => {
  const pop = place.popularityScore || 1;
  const feePenalty = (place.entranceFee || 0) / 1000; // scale
  const interestBoost = prefs?.interests?.includes(place.category) ? 1 : 0;
  return pop + interestBoost - feePenalty;
};

export const buildItinerary = (startCoords, days, candidates, prefs) => {
  const DAILY_MIN = (prefs?.dailyStartHour ?? 9) * 60;
  const DAILY_MAX = (prefs?.dailyEndHour ?? 18) * 60;
  const DAY_WINDOW = DAILY_MAX - DAILY_MIN;

  const sorted = [...candidates];
  if (!Array.isArray(prefs?.lockedPlaceIds) || prefs.lockedPlaceIds.length === 0) {
    sorted.sort((a, b) => scorePlace(b, prefs) - scorePlace(a, prefs));
  }
  const used = new Set();
  const itinerary = [];
  let cursor = startCoords;

  for (let d = 0; d < days; d++) {
    let minutes = 0;
    let last = cursor;
    const items = [];
    for (const p of sorted) {
      if (used.has(p._id.toString())) continue;
      const coords = p.location?.coordinates;
      if (!Array.isArray(coords) || coords.length !== 2) continue;
      const km = haversineKm(last, coords);
      const travel = estimateTravelMinutes(km);
      const visit = p.avgVisitMins || 90;
      if (minutes + travel + visit > DAY_WINDOW) continue;
      items.push({
        place: p._id,
        startTime: toTime(DAILY_MIN + minutes + travel),
        endTime: toTime(DAILY_MIN + minutes + travel + visit),
        travelMinutesFromPrev: travel,
        distanceKmFromPrev: Number(km.toFixed(2)),
        entranceFee: p.entranceFee || 0,
      });
      minutes += travel + visit;
      last = coords;
      used.add(p._id.toString());
      if (items.length >= 5) break; // cap per day
    }
    itinerary.push({ items, totalTravelMinutes: items.reduce((s,i)=>s+i.travelMinutesFromPrev,0), totalEntranceFees: items.reduce((s,i)=>s+i.entranceFee,0) });
    // start next day from the last visited place if any
    cursor = items.length ? candidates.find(c=>c._id.toString()===items[items.length-1].place.toString())?.location?.coordinates || startCoords : startCoords;
  }
  return itinerary;
};

const toTime = (mins) => {
  const h = Math.floor(mins / 60).toString().padStart(2, "0");
  const m = Math.floor(mins % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
};
