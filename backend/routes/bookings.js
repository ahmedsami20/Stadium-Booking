const express = require('express');
const Booking = require('../models/Booking');
const Stadium = require('../models/Stadium');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user's bookings
router.get('/my-bookings', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('stadium')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all bookings (admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate('stadium')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create booking
router.post('/', auth, async (req, res) => {
  try {
    const { stadiumId, date, startTime, endTime, duration, notes } = req.body;
    
    const stadium = await Stadium.findById(stadiumId);
    if (!stadium) {
      return res.status(404).json({ message: 'Stadium not found' });
    }

    // Check for conflicting bookings
    const conflictingBooking = await Booking.findOne({
      stadium: stadiumId,
      date: new Date(date),
      $or: [
        { startTime: { $lte: startTime }, endTime: { $gt: startTime } },
        { startTime: { $lt: endTime }, endTime: { $gte: endTime } },
        { startTime: { $gte: startTime }, endTime: { $lte: endTime } }
      ],
      status: { $ne: 'cancelled' }
    });

    if (conflictingBooking) {
      return res.status(400).json({ message: 'Stadium is already booked for this time slot' });
    }

    const totalPrice = duration * stadium.pricePerHour;
    
    const booking = new Booking({
      user: req.user._id,
      stadium: stadiumId,
      date: new Date(date),
      startTime,
      endTime,
      duration,
      totalPrice,
      notes
    });

    await booking.save();
    await booking.populate('stadium');
    
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cancel booking
router.patch('/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    booking.status = 'cancelled';
    await booking.save();
    
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;