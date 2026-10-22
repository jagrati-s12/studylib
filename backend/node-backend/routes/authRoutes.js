const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'notie_super_secret_jwt_key_2026', {
    expiresIn: '30d',
  });
};

// Register user
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (
      !name ||
      typeof name !== 'string' ||
      !email ||
      typeof email !== 'string' ||
      !password ||
      typeof password !== 'string'
    ) {
      res.status(400);
      throw new Error('Please provide valid name, email, and password strings');
    }

    const trimmedName = name.trim().slice(0, 100);
    const trimmedEmail = email.toLowerCase().trim().slice(0, 255);

    if (trimmedName.length < 1) {
      res.status(400);
      throw new Error('Name cannot be empty');
    }

    if (password.length < 6 || password.length > 128) {
      res.status(400);
      throw new Error('Password must be between 6 and 128 characters long');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      res.status(400);
      throw new Error('Please provide a valid email address');
    }

    const userExists = await User.findOne({ email: trimmedEmail });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists with this email');
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: trimmedName,
      email: trimmedEmail,
      password: hashedPassword
    });

    if (user) {
      const token = generateToken(user._id);
      res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          token
        }
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data received');
    }
  } catch (error) {
    next(error);
  }
});

// Login user
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (
      !email ||
      typeof email !== 'string' ||
      !password ||
      typeof password !== 'string'
    ) {
      res.status(400);
      throw new Error('Please provide email and password');
    }

    if (password.length > 128) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = generateToken(user._id);
      res.json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          token
        }
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
