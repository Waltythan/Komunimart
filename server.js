// server.js with detailed error logging
const express = require('express');
const cors = require('cors');
const { User } = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

// Enhanced CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // Add your frontend URLs
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// Test database connection on startup
(async () => {
  try {
    await User.sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
  } catch (err) {
    console.error('❌ Unable to connect to the database:', err);
  }
})();

// Register route with enhanced error handling
app.post('/auth/register', async (req, res) => {
  console.log('📝 Register request received:', req.body);
  
  const { uname, email, password } = req.body;

  if (!uname || !email || !password) {
    console.log('❌ Missing required fields');
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    console.log('Creating user in database...');
    const newUser = await User.create({
      uname,
      email,
      password, // Note: plain text, not hashed yet
    });

    console.log('✅ User created successfully:', newUser.user_id);
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
    
    // Check for specific database errors
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ 
        message: 'A user with that username or email already exists.',
        error: err.message 
      });
    }
    
    if (err.name === 'SequelizeConnectionError') {
      return res.status(503).json({ 
        message: 'Database connection issue. Please try again later.',
        error: err.message 
      });
    }
    
    res.status(500).json({ 
      message: 'Error creating user', 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Simple hello endpoint
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the server!' });
});

// Proper catch-all route
app.use((req, res) => {
  res.status(404).send('Not Found');
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});