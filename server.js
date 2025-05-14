// Simple Express server for Komunimart
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files from the Vite build (if built)
app.use(express.static(path.join(__dirname, 'dist')));

// API example route
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the server!' });
});

// Fallback to index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
