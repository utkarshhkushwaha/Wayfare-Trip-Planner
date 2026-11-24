const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const schema = new mongoose.Schema(
  {
    user: { type: ObjectId, ref: 'User', required: true },
    destination: { type: ObjectId, ref: 'Destination', required: true },
    destinationName: String,
    destinationImage: String,
    fromCity: String,
    startDate: Date,
    nights: Number,
    travellers: Number,
    rooms: Number,
    roundTrip: Boolean,
    travel: {
      listing: ObjectId,
      mode: String,
      operator: String,
      provider: String,
      fromCity: String,
      departureTime: String,
      durationHours: Number,
      pricePerPerson: Number,
    },
    stay: {
      listing: ObjectId,
      name: String,
      category: String,
      address: String,
      image: String,
      provider: String,
      pricePerNight: Number,
      rating: Number,
      roomCapacity: Number,
    },
    costs: { travel: Number, stay: Number, total: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Itinerary', schema);
