const express = require('express');
const asyncHandler = require('./asyncHandler');
const { protect, authorize } = require('../middleware/auth');

// Builds CRUD routes for listings owned by one partner role.
module.exports = (Model, role, fields) => {
  const router = express.Router();
  const guard = [protect, authorize(role)];
  const pick = (body) => fields.reduce((o, k) => (body[k] !== undefined ? { ...o, [k]: body[k] } : o), {});

  router.get('/mine', guard, asyncHandler(async (req, res) => {
    const docs = await Model.find({ partner: req.user._id }).populate('destination', 'name').sort('-createdAt').lean();
    res.json(docs);
  }));

  router.post('/', guard, asyncHandler(async (req, res) => {
    const doc = await Model.create({ ...pick(req.body), partner: req.user._id });
    res.status(201).json(doc);
  }));

  router.put('/:id', guard, asyncHandler(async (req, res) => {
    const doc = await Model.findOneAndUpdate({ _id: req.params.id, partner: req.user._id }, pick(req.body), {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      res.status(404);
      throw new Error('Listing not found');
    }
    res.json(doc);
  }));

  router.delete('/:id', guard, asyncHandler(async (req, res) => {
    const doc = await Model.findOneAndDelete({ _id: req.params.id, partner: req.user._id });
    if (!doc) {
      res.status(404);
      throw new Error('Listing not found');
    }
    res.json({ message: 'Listing removed' });
  }));

  return router;
};
