import { UserLog } from '../Models/UserLogModel.js';
import Student from '../Models/StudentModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Check if student exists in students collection
export const checkStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findOne({ studentId });
    if (!student) {
      return res.status(404).json({ exists: false, message: 'Student not found' });
    }
    res.json({ exists: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Check if userlogin exists for studentId
export const checkUserLogin = async (req, res) => {
  try {
    const { studentId } = req.params;
    const user = await UserLog.findOne({ studentId });
    if (!user) {
      return res.json({ exists: false });
    }
    res.json({ exists: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Register new user
// @route   POST /api/user/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    console.log('Registration request received:', req.body);
    
    const { studentId, password } = req.body;

    if (!studentId || !password) {
      console.log('Missing required fields:', { studentId, password });
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if user exists
    const userExists = await UserLog.findOne({ studentId });
    if (userExists) {
      console.log('User already exists:', studentId);
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await UserLog.create({
      studentId,
      password: hashedPassword
    });

    if (user) {
      console.log('User created successfully:', user.studentId);
      res.status(201).json({
        _id: user._id,
        studentId: user.studentId,
        token: generateToken(user._id)
      });
    } else {
      console.log('Failed to create user');
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Server error during registration',
      error: error.message 
    });
  }
};

// @desc    Authenticate a user
// @route   POST /api/user/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    console.log('Login request received:', req.body);
    
    const { studentId, password, isAdmin } = req.body;

    if (!studentId || !password) {
      console.log('Missing required fields:', { studentId, password });
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check for user
    const user = await UserLog.findOne({ studentId });
    if (!user) {
      console.log('User not found:', studentId);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is trying to access admin panel without admin privileges
    if (isAdmin && !user.isAdmin) {
      console.log('Non-admin user trying to access admin panel:', studentId);
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Invalid password for user:', studentId);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('Login successful for user:', studentId);
    res.json({
      _id: user._id,
      studentId: user.studentId,
      isAdmin: user.isAdmin,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Server error during login',
      error: error.message 
    });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/user/logout
// @access  Private
export const logoutUser = async (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await UserLog.findById(req.user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await UserLog.findById(req.user._id);

    if (user) {
      user.studentId = req.body.studentId || user.studentId;
      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        studentId: updatedUser.studentId,
        token: generateToken(updatedUser._id)
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Generate JWT
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not defined in environment variables');
    throw new Error('JWT_SECRET is not defined');
  }
  
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};


