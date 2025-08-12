import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import userRoutes from './routes/users.js';
import businessRoutes from './routes/business.js';
import addressRoutes from './routes/address.js';
import touristRoutes from './routes/tourist.js'
import ownerRoutes from './routes/owner.js';
import touristSpotRoutes from './routes/tourist_spot.js';
import approvalRoutes from './routes/approval.js';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/tourist', touristRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/address', addressRoutes);
app.use('/api/tourist-spots', touristSpotRoutes);
app.use('/api/approval', approvalRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log('API URL: http://localhost:3000/api/users');
  console.log('API URL: http://localhost:3000/api/business');
  console.log('API URL: http://localhost:3000/api/tourist');
  console.log('API URL: http://localhost:3000/api/address');
  console.log('API URL: http://localhost:3000/api/tourist-spots');
  console.log('API URL: http://localhost:3000/api/approval');
  console.log('✅ Connected to MariaDB (Promise Pool)');
  console.log('✅ API is ready to use');
  console.log('\nCTRL + C to stop the server\n');
});
