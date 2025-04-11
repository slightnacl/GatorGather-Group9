const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const admin = require('firebase-admin');

const eventRoutes = require('./routes/events');
const userRoutes = require('./routes/users');

dotenv.config();
const app = express();

// Firebase admin init
admin.initializeApp({
  credential: admin.credential.cert(require('./config/firebase-service-account.json')),
});

app.use(cors());
app.use(express.json());

// DB connect
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

// Routes
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);

// Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
