import express from 'express';
const db = require('../../../models');
const { Group } = db;

const router = express.Router();

// GET /groups - List all groups
router.get('/', async (req, res) => {
  try {
    const groups = await Group.findAll({ order: [['group_id', 'DESC']] });
    console.log('Fetched groups:', groups);
    res.json(groups);
  } catch (err) {
    console.error('Error in /groups:', err);
    res.status(500).json({ message: 'Error fetching groups', error: err instanceof Error ? err.message : String(err) });
  }
});

console.log('DEBUG Group model:', Group);

// POST /groups - Create a new group
router.post('/', async (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    res.status(400).json({ error: 'Group name is required.' });
  }
  try {
    const newGroup = await Group.create({ name, description });
    res.status(201).json({ message: 'Group created successfully.', group: newGroup });
  } catch (err) {
    console.error('Error creating group:', err);
    res.status(500).json({ message: 'Error creating group', error: err instanceof Error ? err.message : String(err) });
  }
});

// GET /groups/new - Render a form or return a template for creating a new group (API placeholder)
router.get('/new', (req, res) => {
  // Untuk aplikasi SPA/React, biasanya frontend yang render form.
  // Endpoint ini bisa dipakai untuk validasi, atau abaikan jika hanya REST API.
  res.status(200).json({
    message: 'Form pembuatan grup baru. Silakan gunakan POST /groups untuk submit data.'
  });
});

// Ensure this file is imported as:
// import groupRoutes from './routes/groups';
// or for CommonJS: const groupRoutes = require('./routes/groups').default;

export default router;
