const TravelOption = require('../models/TravelOption');
const asyncHandler = require('../utils/asyncHandler');
const partnerCrud = require('../utils/partnerCrud');

const router = partnerCrud(TravelOption, 'travel_partner', [
  'destination', 'fromCity', 'mode', 'operator', 'departureTime', 'durationHours', 'pricePerPerson', 'seatsAvailable',
]);

// Cities travellers can start from, for a destination.
router.get('/origins', asyncHandler(async (req, res) => {
  const cities = await TravelOption.find({ destination: req.query.destination }).distinct('fromCity');
  res.json(cities.sort());
}));

module.exports = router;
