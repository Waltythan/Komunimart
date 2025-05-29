import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/jwt_helper';

const db = require('../../../models');
const { User } = db;

/**
 * Register a new user
 */
export const register = async (req: Request, res: Response) => {
  const { uname, email, password } = req.body;

  if (!uname || !email || !password) {
    res.status(400).json({ message: 'All fields are required.' });
    return;
  }
  
  // Email validation using regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: 'Please enter a valid email address.' });
    return;
  }
  
  // Username must be at least 3 characters
  if (uname.length < 3) {
    res.status(400).json({ message: 'Username must be at least 3 characters long.' });
    return;
  }

  try {
    // Check if username already exists
    const existingUsername = await User.findOne({ where: { uname } });
    if (existingUsername) {
      res.status(400).json({ message: 'Username already taken.' });
      return;
    }
    
    // Check if email already exists
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      res.status(400).json({ message: 'Email already registered.' });
      return;
    }

    // Hash password before storing
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const newUser = await User.create({
      uname,
      email,
      password: hashedPassword, // Store hashed password
    });

    res.status(201).json({
      message: 'User registered successfully.',
      user: {
        id: newUser.user_id,
        uname: newUser.uname,
        email: newUser.email,
      },
    });
  } catch (err) {
    console.error('❌ Error creating user:', err);
    res.status(500).json({
      message: 'Error creating user',
      error: err instanceof Error ? err.message : String(err),
    });
  }
};

/**
 * Login user
 */
export const login = async (req: Request, res: Response) => {
  const { uname, email, password } = req.body;
  
  if (!password) {
    res.status(400).json({ message: 'Password is required.' });
    return;
  }

  if (!uname && !email) {
    res.status(400).json({ message: 'Username or email is required.' });
    return;
  }

  try {
    // Find user by username or email
    const user = await User.findOne({
      where: uname ? { uname } : { email }
    });

    if (!user) {
      res.status(401).json({ message: 'Invalid credentials.' });
      return;
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid credentials.' });
      return;
    }

    // Generate JWT token
    const token = generateToken(user.user_id, user.uname);

    res.json({
      message: 'Login successful',
      user: {
        id: user.user_id,
        username: user.uname,
        email: user.email,
        profile_pic: user.profile_pic
      },
      token
    });
  } catch (err) {
    console.error('❌ Error logging in:', err);
    res.status(500).json({
      message: 'Error logging in',
      error: err instanceof Error ? err.message : String(err),
    });
  }
};
