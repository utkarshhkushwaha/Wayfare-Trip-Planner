const mongoose = require('mongoose');

module.exports = mongoose.model(
  'Destination',
  new mongoose.Schema(
    {
      name: { type: String, required: true, unique: true, trim: true },
      region: { type: String, required: true },
      description: String,
      bestSeason: String,
      image: String,
      tags: [String],
    },
    { timestamps: true }
  )
);
