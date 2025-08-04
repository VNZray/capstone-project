import express from 'express';
import cors from 'cors';

import userRoutes from './routes/users.js';
import businessRoutes from './routes/business.js';
import addressRoutes from './routes/address.js';
import touristRoutes from './routes/tourist.js'
// const accommodationRoutes = require('./routes/accommodations');
// const bookingRoutes = require('./routes/bookings');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/business', businessRoutes);
app.use('/tourist', touristRoutes)
app.use('/api/address', addressRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log('API URL: http://localhost:3000/api/');
  console.log('✅ API is ready to use');
  console.log('\nCTRL + C tp stop the server\n');
});
