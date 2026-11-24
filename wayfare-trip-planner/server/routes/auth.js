const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { protect } = require('../middleware/auth');

const router = express.Router();
const USER_ROLES = ['user'];
const ADMIN_ROLES = ['travel_partner', 'accommodation_partner'];

const session = (u) => ({
  token: jwt.sign({ id: u._id, role: u.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }),
  user: { id: u._id, name: u.name, email: u.email, role: u.role, companyName: u.companyName },
});

const register = (allowed) =>
  asyncHandler(async (req, res) => {
    const { name, email, password, role, companyName } = req.body;
    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Name, email and password are required');
    }
    if (password.length < 6) {
      res.status(400);
      throw new Error('Password must be at least 6 characters');
    }
    const finalRole = allowed.length === 1 ? allowed[0] : role;
    if (!allowed.includes(finalRole)) {
      res.status(400);
      throw new Error('Please choose a valid partner type');
    }
    const user = await User.create({ name, email, password, role: finalRole, companyName });
    res.status(201).json(session(user));
  });

const login = (allowed) =>
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(password || ''))) {
      res.status(401);
      throw new Error('Incorrect email or password');
    }
    if (!allowed.includes(user.role)) {
      res.status(403);
      throw new Error(
        allowed === USER_ROLES ? 'This is a partner account. Use the partner sign in.' : 'This is a traveller account. Use the traveller sign in.'
      );
    }
    res.json(session(user));
  });

router.post('/user/register', register(USER_ROLES));
router.post('/user/login', login(USER_ROLES));
router.post('/admin/register', register(ADMIN_ROLES));
router.post('/admin/login', login(ADMIN_ROLES));
router.get('/me', protect, (req, res) => res.json(session(req.user).user));

module.exports = router;
