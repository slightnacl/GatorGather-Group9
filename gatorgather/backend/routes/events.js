const express = require('express');
const Event = require('../models/Event');
const verifyToken = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  const events = await Event.find();
  res.json(events);
});

router.post('/', verifyToken, async (req, res) => {
  const { title, description, location, datetime } = req.body;
  const event = new Event({ title, description, location, datetime, creatorId: req.user.uid });
  await event.save();
  res.status(201).json(event);
});

router.get('/:id', async (req, res) => {
  const event = await Event.findById(req.params.id);
  res.json(event);
});

router.post('/:id/rsvp', verifyToken, async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event.rsvps.includes(req.user.uid)) {
    event.rsvps.push(req.user.uid);
    await event.save();
  }
  res.json({ success: true });
});

module.exports = router;
