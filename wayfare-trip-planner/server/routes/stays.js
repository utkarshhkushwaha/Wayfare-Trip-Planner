const Accommodation = require('../models/Accommodation');
const partnerCrud = require('../utils/partnerCrud');

module.exports = partnerCrud(Accommodation, 'accommodation_partner', [
  'destination', 'name', 'category', 'address', 'image', 'pricePerNight', 'roomCapacity', 'rating', 'amenities',
]);
