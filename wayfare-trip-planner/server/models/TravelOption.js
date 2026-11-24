const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    partner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination', required: [true, 'Destination is required'] },
    fromCity: { type: String, required: [true, 'Origin city is required'], trim: true },
    mode: { type: String, enum: ['flight', 'train', 'bus', 'cab'], required: true },
    operator: { type: String, required: [true, 'Operator is required'], trim: true },
    departureTime: { type: String, default: '08:00' },
    durationHours: { type: Number, required: true, min: [0.5, 'Duration must be at least 0.5 hours'] },
    pricePerPerson: { type: Number, required: true, min: [0, 'Price cannot be negative'] },
    seatsAvailable: { type: Number, default: 40, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TravelOption', schema);
