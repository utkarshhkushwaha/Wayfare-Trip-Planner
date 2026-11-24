const express = require('express');
const Itinerary = require('../models/Itinerary');
const TravelOption = require('../models/TravelOption');
const Accommodation = require('../models/Accommodation');
const Destination = require('../models/Destination');
const asyncHandler = require('../utils/asyncHandler');
const { protect, authorize } = require('../middleware/auth');
const { costOf, buildPlans } = require('../utils/planner');

const router = express.Router();
const escapeRx = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const bad = (res, msg) => {
  res.status(400);
  throw new Error(msg);
};

// Compare every route + stay combination for a destination and rank them.
router.post('/plan', protect, authorize('user'), asyncHandler(async (req, res) => {
  const { destinationId, fromCity, mode = 'any', category = 'any', minRating = 0, maxBudget = 0 } = req.body;
  const travellers = Number(req.body.travellers) || 0;
  const nights = Number(req.body.nights) || 0;
  const roundTrip = req.body.roundTrip !== false;

  if (!destinationId || !fromCity) bad(res, 'Destination and starting city are required');
  if (travellers < 1 || travellers > 20) bad(res, 'Travellers must be between 1 and 20');
  if (nights < 1 || nights > 60) bad(res, 'Nights must be between 1 and 60');

  const travelQuery = {
    destination: destinationId,
    fromCity: new RegExp(`^${escapeRx(fromCity.trim())}$`, 'i'),
    seatsAvailable: { $gte: travellers },
  };
  if (mode !== 'any') travelQuery.mode = mode;
  const stayQuery = { destination: destinationId };
  if (category !== 'any') stayQuery.category = category;
  if (minRating > 0) stayQuery.rating = { $gte: Number(minRating) };

  const [travels, stays] = await Promise.all([
    TravelOption.find(travelQuery).populate('partner', 'name companyName').lean(),
    Accommodation.find(stayQuery).populate('partner', 'name companyName').lean(),
  ]);

  const plans = buildPlans({ travels, stays, travellers, nights, roundTrip, maxBudget: Number(maxBudget) });
  res.json({ plans, travelCount: travels.length, stayCount: stays.length });
}));

// Save the plan the traveller picked. Costs are recomputed on the server.
router.post('/', protect, authorize('user'), asyncHandler(async (req, res) => {
  const { destinationId, travelId, stayId, fromCity, startDate } = req.body;
  const travellers = Number(req.body.travellers);
  const nights = Number(req.body.nights);
  const roundTrip = req.body.roundTrip !== false;
  if (!(travellers >= 1) || !(nights >= 1)) bad(res, 'Travellers and nights are required');

  const [destination, travel, stay] = await Promise.all([
    Destination.findById(destinationId),
    TravelOption.findById(travelId).populate('partner', 'name companyName'),
    Accommodation.findById(stayId).populate('partner', 'name companyName'),
  ]);
  if (!destination || !travel || !stay) bad(res, 'One of the selected options is no longer available');
  if (String(travel.destination) !== String(destination._id) || String(stay.destination) !== String(destination._id)) {
    bad(res, 'Selected options do not match the destination');
  }

  const { rooms, ...costs } = costOf({ travel, stay, travellers, nights, roundTrip });
  const label = (p) => p.companyName || p.name;
  const itinerary = await Itinerary.create({
    user: req.user._id,
    destination: destination._id,
    destinationName: destination.name,
    destinationImage: destination.image,
    fromCity: travel.fromCity,
    startDate: startDate || undefined,
    nights, travellers, rooms, roundTrip, costs,
    travel: {
      listing: travel._id, mode: travel.mode, operator: travel.operator, provider: label(travel.partner),
      fromCity: travel.fromCity, departureTime: travel.departureTime, durationHours: travel.durationHours,
      pricePerPerson: travel.pricePerPerson,
    },
    stay: {
      listing: stay._id, name: stay.name, category: stay.category, address: stay.address, image: stay.image, provider: label(stay.partner),
      pricePerNight: stay.pricePerNight, rating: stay.rating, roomCapacity: stay.roomCapacity,
    },
  });
  res.status(201).json(itinerary);
}));

router.get('/mine', protect, authorize('user'), asyncHandler(async (req, res) => {
  res.json(await Itinerary.find({ user: req.user._id }).sort('-createdAt'));
}));

router.delete('/:id', protect, authorize('user'), asyncHandler(async (req, res) => {
  const doc = await Itinerary.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!doc) {
    res.status(404);
    throw new Error('Itinerary not found');
  }
  res.json({ message: 'Itinerary deleted' });
}));

// Partners see itineraries in which a traveller chose one of their listings.
router.get('/partner/selections', protect, authorize('travel_partner', 'accommodation_partner'), asyncHandler(async (req, res) => {
  const isTravel = req.user.role === 'travel_partner';
  const Model = isTravel ? TravelOption : Accommodation;
  const ids = await Model.find({ partner: req.user._id }).distinct('_id');
  const field = isTravel ? 'travel.listing' : 'stay.listing';
  res.json(await Itinerary.find({ [field]: { $in: ids } }).select('-user').sort('-createdAt').limit(100));
}));

module.exports = router;
