const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    partner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination', required: [true, 'Destination is required'] },
    name: { type: String, required: [true, 'Property name is required'], trim: true },
    category: { type: String, enum: ['hostel', 'budget hotel', 'homestay', 'hotel', 'resort'], required: true },
    address: { type: String, trim: true },
    image: { type: String, trim: true },
    pricePerNight: { type: Number, required: true, min: [0, 'Price cannot be negative'] },
    roomCapacity: { type: Number, default: 2, min: 1 },
    rating: { type: Number, default: 4, min: 0, max: 5 },
    amenities: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Accommodation', schema);
