import { UserLog } from '../Models/UserLogModel.js';
import Student from '../Models/UPStudentModel.js';
import Degree from '../Models/UPDegreeModel.js';
import Faculty from '../Models/UPFacultyModel.js';
import Batch from '../Models/UPBatchModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Check if student exists in students collection
export const checkStudent = async (req, res) => {
  try {
    console.log('Checking student existence for:', req.params.studentId);
    const { studentId } = req.params;
    
    if (!studentId) {
      return res.status(400).json({ 
        exists: false, 
        message: 'Student ID is required' 
      });
    }

    const student = await Student.findOne({ studentId: studentId });
    console.log('Student search result:', student ? 'Found' : 'Not found');

    if (!student) {
      return res.status(200).json({ 
        exists: false, 
        message: 'Student not found' 
      });
    }

    res.status(200).json({ 
      exists: true,
      message: 'Student found'
    });
  } catch (error) {
    console.error('Error in checkStudent:', error);
    res.status(500).json({ 
      exists: false, 
      message: 'Server error while checking student',
      error: error.message 
    });
  }
};

// Check if userlogin exists for studentId
export const checkUserLogin = async (req, res) => {
  try {
    console.log('Checking user login existence for:', req.params.studentId);
    const { studentId } = req.params;
    
    if (!studentId) {
      return res.status(400).json({ 
        exists: false, 
        message: 'Student ID is required' 
      });
    }

    const user = await UserLog.findOne({ studentId: studentId });
    console.log('User login search result:', user ? 'Found' : 'Not found');

    res.status(200).json({ 
      exists: !!user,
      message: user ? 'User login exists' : 'User login not found'
    });
  } catch (error) {
    console.error('Error in checkUserLogin:', error);
    res.status(500).json({ 
      exists: false, 
      message: 'Server error while checking user login',
      error: error.message 
    });
  }
};

// @desc    Register new user
// @route   POST /api/user/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    console.log('Registration request received:', req.body);
    
    const { studentId, password, year, semester } = req.body;

    if (!studentId || !password || !year || !semester) {
      console.log('Missing required fields:', { studentId, password, year, semester });
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
      password: hashedPassword,
      year,
      semester
    });

    if (user) {
      console.log('User created successfully:', user.studentId);
      res.status(201).json({
        _id: user._id,
        studentId: user.studentId,
        year: user.year,
        semester: user.semester,
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

// @desc    Get student details
// @route   GET /api/user/student/:studentId
// @access  Public
export const getStudentDetails = async (req, res) => {
  try {
    console.log('Fetching student details for:', req.params.studentId);
    const { studentId } = req.params;
    
    if (!studentId) {
      return res.status(400).json({ 
        message: 'Student ID is required' 
      });
    }

    const student = await Student.findOne({ studentId })
      .populate('degree')
      .populate('faculty')
      .populate('batch');
    
    if (!student) {
      return res.status(404).json({ 
        message: 'Student not found' 
      });
    }

    res.status(200).json(student);
  } catch (error) {
    console.error('Error fetching student details:', error);
    res.status(500).json({ 
      message: 'Server error while fetching student details',
      error: error.message 
    });
  }
};

// @desc    Get all registered students
// @route   GET /api/user/students
// @access  Private/Admin
export const getAllStudents = async (req, res) => {
  try {
    // First get all UserLog entries
    const userLogs = await UserLog.find({}).select('-password');
    
    // Then get all student details
    const students = await Student.find({});
    
    // Create a map of studentId to student details
    const studentMap = students.reduce((acc, student) => {
      acc[student.studentId] = student;
      return acc;
    }, {});

    // Group students by year and semester
    const groupedStudents = userLogs.reduce((acc, userLog) => {
      const student = studentMap[userLog.studentId];
      const year = student?.year || 'Unknown';
      const semester = student?.semester || 'Unknown';
      
      if (!acc[year]) {
        acc[year] = {};
      }
      if (!acc[year][semester]) {
        acc[year][semester] = [];
      }
      
      acc[year][semester].push({
        ...userLog.toObject(),
        studentDetails: student || null
      });
      
      return acc;
    }, {});

    res.status(200).json(groupedStudents);
  } catch (error) {
    console.error('Error fetching all students:', error);
    res.status(500).json({ 
      message: 'Server error while fetching students',
      error: error.message 
    });
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


