const jwt = require('jsonwebtoken');
const { User } = require('../models');
const path = require('path');
const fs = require('fs').promises;

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// Sign up
exports.signup = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, and name are required'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists'
      });
    }

    // Hash password
    const password_hash = await User.hashPassword(password);

    // Create user
    const user = await User.create({
      email,
      password_hash,
      name
    });

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url
      },
      token
    });
  } catch (error) {
    next(error);
  }
};

// Login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check password
    const isValidPassword = await user.checkPassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user.id);

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url
      },
      token
    });
  } catch (error) {
    next(error);
  }
};

// Get current user
exports.getCurrentUser = async (req, res, next) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        avatar_url: req.user.avatar_url
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (email) updates.email = email;

    await req.user.update(updates);

    res.json({
      success: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        avatar_url: req.user.avatar_url
      }
    });
  } catch (error) {
    next(error);
  }
};

// Upload avatar
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    // Delete old avatar if exists
    if (req.user.avatar_url) {
      const oldAvatarPath = path.join(__dirname, '../../', req.user.avatar_url);
      try {
        await fs.unlink(oldAvatarPath);
      } catch (err) {
        // Ignore error if file doesn't exist
      }
    }

    // Update user with new avatar URL
    const avatar_url = `/uploads/avatars/${req.file.filename}`;
    await req.user.update({ avatar_url });

    res.json({
      success: true,
      avatar_url
    });
  } catch (error) {
    next(error);
  }
};

// Delete avatar
exports.deleteAvatar = async (req, res, next) => {
  try {
    if (!req.user.avatar_url) {
      return res.status(400).json({
        success: false,
        error: 'No avatar to delete'
      });
    }

    // Delete file
    const avatarPath = path.join(__dirname, '../../', req.user.avatar_url);
    try {
      await fs.unlink(avatarPath);
    } catch (err) {
      // Ignore error if file doesn't exist
    }

    // Update user
    await req.user.update({ avatar_url: null });

    res.json({
      success: true
    });
  } catch (error) {
    next(error);
  }
};
