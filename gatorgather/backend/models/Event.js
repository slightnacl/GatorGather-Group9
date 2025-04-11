const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: String,
  description: String,
  location: String,
  datetime: Date,
  creatorId: String,
  rsvps: [String], // List of user UIDs
});

module.exports = mongoose.model('Event', eventSchema);
