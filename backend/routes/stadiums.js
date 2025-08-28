const express = require('express');
const Stadium = require('../models/Stadium');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all stadiums
router.get('/', async (req, res) => {
  try {
    const stadiums = await Stadium.find();
    res.json(stadiums);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get stadium by ID
router.get('/:id', async (req, res) => {
  try {
    const stadium = await Stadium.findById(req.params.id);
    if (!stadium) {
      return res.status(404).json({ message: 'Stadium not found' });
    }
    res.json(stadium);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create stadium (admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const stadium = new Stadium(req.body);
    await stadium.save();
    res.status(201).json(stadium);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update stadium (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const stadium = await Stadium.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!stadium) {
      return res.status(404).json({ message: 'Stadium not found' });
    }
    res.json(stadium);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete stadium (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const stadium = await Stadium.findByIdAndDelete(req.params.id);
    if (!stadium) {
      return res.status(404).json({ message: 'Stadium not found' });
    }
    res.json({ message: 'Stadium deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;