const express = require('express');
const Destination = require('../models/Destination');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  res.json(await Destination.find().sort('name'));
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const d = await Destination.findById(req.params.id);
  if (!d) {
    res.status(404);
    throw new Error('Destination not found');
  }
  res.json(d);
}));

module.exports = router;
