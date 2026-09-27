import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import connectDB from './config/database.js';
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/user.routes.js';
import doctorRoutes from './modules/doctors/doctor.routes.js';
import {doctorAvailabilityRouter, availabilityRouter} from './modules/availability/availability.routes.js';
import consultationRoutes from './modules/consultations/consultation.routes.js';
import searchRoutes from './modules/search/search.routes.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/doctors', doctorRoutes);
app.use('/api/v1/doctors', doctorAvailabilityRouter);
app.use('/api/v1/availability', availabilityRouter);
app.use('/api/v1/consultations', consultationRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Amrutam Telemedicine API',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.status(200).json({
    name: 'Amrutam Telemedicine API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      health: '/health'
    }
  });
});

// Error handler must be after all routes
app.use((err, req, res, next) => {
  console.error('Error:', err);

  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'Internal server error'
    }
  });
});

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer();