const mongoose = require('mongoose');

const stadiumSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    required: true
  },
  pricePerHour: {
    type: Number,
    required: true
  },
  description: {
    type: String
  },
  amenities: [{
    type: String
  }],
  image: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Stadium', stadiumSchema);