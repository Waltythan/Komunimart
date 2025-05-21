import express, { Request, Response } from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
const db = require('../../models');
const { User } = db;
const dbConfig = require('../../config/config.json').development;
import groupRoutes from './routes/groups';
import postRoutes from './routes/posts';
import { upload, getImageUrl } from './utils/fileUpload';
import path from 'path';
import { generateToken } from './utils/jwt_helper';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Register route dengan hashing password
app.post('/auth/register', async (req: Request, res: Response) => {
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

    console.log('✅ User registered:', {
      id: newUser.user_id,
      uname: newUser.uname,
      email: newUser.email,
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
});

// Login route
app.post('/auth/login', async (req: Request, res: Response) => {
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
    // Find user by email or username
    let user;
    if (email) {
      user = await User.findOne({ where: { email } });
    } else if (uname) {
      user = await User.findOne({ where: { uname } });
    }
    
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials.' });
      return;
    }
    
    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid credentials.' });
      return;
    }

    const token = generateToken(user.user_id);
    console.log('✅ Generated token:', token);
    
    console.log('✅ Login successful:', {
      id: user.user_id,
      uname: user.uname,
      email: user.email,
    });
    
    // Return user data
    res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user.user_id,
        uname: user.uname,
        email: user.email,
        role: user.role,
      }
    });
  } catch (err) {
    console.error('❌ Error during login:', err);
    res.status(500).json({
      message: 'Error during login',
      error: err instanceof Error ? err.message : String(err),
    });
  }
});

// Upload profile picture
app.post('/profile/image', upload.single('image'), async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ message: 'No file uploaded' });
    return;
  }
  
  try {
    const { user_id } = req.body;
    if (!user_id) {
      res.status(400).json({ message: 'User ID is required' });
      return;
    }
    
    // Update user profile
    const user = await User.findByPk(user_id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    // Save filename to database
    await user.update({ profile_pic: req.file.filename });
    
    // Return success with image URL
    res.json({
      message: 'Profile picture uploaded successfully',
      image_url: getImageUrl(req.file.filename, 'profile')
    });
  } catch (err) {
    console.error('Error uploading profile picture:', err);
    res.status(500).json({ 
      message: 'Error uploading profile picture',
      error: err instanceof Error ? err.message : String(err)
    });
  }
});

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Use group routes
app.use('/groups', groupRoutes);
// Use post routes
app.use('/posts', postRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`🗄️ Connected to DB: ${dbConfig.database} as ${dbConfig.username} @ ${dbConfig.host}:${dbConfig.port}`);
});

app.get('/debug/users', async (req, res) => {
  try {
    const users = await User.findAll({ order: [['user_id', 'DESC']] });
    console.log('🔍 Users from DB:', users.map((u: any) => u.toJSON()));
    res.json(users);
  } catch (err) {
    console.error('❌ Failed to fetch users:', err);
    res.status(500).json({ message: 'Error fetching users' });
  }
});
