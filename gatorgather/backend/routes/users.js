const express = require('express');
const verifyToken = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

router.get('/me', verifyToken, async (req, res) => {
  let user = await User.findOne({ uid: req.user.uid });
  if (!user) {
    user = new User({ uid: req.user.uid, email: req.user.email, name: req.user.name || "" });
    await user.save();
  }
  res.json(user);
});

module.exports = router;
