const express = require('express');
const cors = require('cors');
const { User } = require('./models');
const dbConfig = require('./config/config.json').development;

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Register route
app.post('/auth/register', async (req, res) => {
  const { uname, email, password } = req.body;

  if (!uname || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const newUser = await User.create({
      uname,
      email,
      password, // plain text for now
    });

    console.log('✅ User registered:', {
      id: newUser.id,
      uname: newUser.uname,
      email: newUser.email,
    });

    res.status(201).json({
      message: 'User registered successfully.',
      user: {
        id: newUser.id,
        uname: newUser.uname,
        email: newUser.email,
      },
    });
  } catch (err) {
    console.error('❌ Error creating user:', err);
    res.status(500).json({
      message: 'Error creating user',
      error: err.message,
    });
  }
});

// Login route (optional for future use)
app.post('/auth/login', async (req, res) => {
  const { uname, password } = req.body;

  if (!uname || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    const user = await User.findOne({ where: { uname } });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: 'Incorrect password.' });
    }

    res.status(200).json({
      message: 'Login successful.',
      user: {
        id: user.user_id,
        uname: user.uname,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ message: 'Login failed.', error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`🗄️ Connected to DB: ${dbConfig.database} as ${dbConfig.uname} @ ${dbConfig.host}:${dbConfig.port}`);
});

app.get('/debug/users', async (req, res) => {
  try {
    const users = await User.findAll({ order: [['user_id', 'DESC']] });
    console.log('🔍 Users from DB:', users.map(u => u.toJSON()));
    res.json(users);
  } catch (err) {
    console.error('❌ Failed to fetch users:', err);
    res.status(500).json({ message: 'Error fetching users' });
  }
});
