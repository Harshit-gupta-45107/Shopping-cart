const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const userModel = require('../models/user');
const jwtConfig = require('../config/jwt');
const User = require('../models/user');
const { generateToken } = require('../config/jwt');

const authController = {
  // Register a new user
  register: async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { username, password, role } = req.body;
      
      // Check if user already exists
      const existingUser = await userModel.findByUsername(username);
      if (existingUser) {
        return res.status(409).json({ error: 'Username already exists' });
      }
      
      // Create new user
      const newUser = await userModel.create(username, password, role || 'student');
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: newUser.id, role: newUser.role },
        jwtConfig.secret,
        jwtConfig.options
      );
      
      // Return user data and token
      return res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: newUser.id,
          username: newUser.username,
          role: newUser.role
        },
        token
      });
    } catch (error) {
      console.error('Error in register controller:', error);
      return res.status(500).json({ error: 'Registration failed' });
    }
  },
  
  // Login existing user
  login: async (req, res) => {
    try {
      const { username, password } = req.body;      // Check if user exists
      const user = await User.findByUsername(username);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Verify password
      const isValid = await User.comparePassword(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate token
      const token = generateToken(user);
      res.json({ token, role: user.role });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
    // Get current user profile
  getProfile: async (req, res) => {
    try {
      const userId = req.user.id;
      console.log('Getting profile for user ID:', userId);
      
      // Get user details
      const user = await User.findById(userId);
      console.log('Found user:', user);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Return user data
      return res.status(200).json({
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Error in getProfile controller:', error);
      console.error(error.stack);
      return res.status(500).json({ 
        error: 'Failed to get user profile',
        details: error.message 
      });
    }
  }
};

// module.exports = authController;
export default authController;
