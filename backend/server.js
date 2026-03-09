import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import userRoutes from './routes/userRoutes.js';
import carParkRoutes from './routes/carParkRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import revenueRoutes from './routes/revenueRoutes.js';
import { startNoShowCron } from './cron/noShowCron.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
export const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173', // Vite default port
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/carparks', carParkRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/revenue', revenueRoutes);

// Basic Route
app.get('/', (req, res) => {
    res.send('ParkingLK API is running...');
});

// Socket.io connection test
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join a specific room based on User ID to receive personal real-time updates
    socket.on('joinUserRoom', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined their personal room`);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/parkinglk';

// Connect to DB and Start Server
mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        startNoShowCron(); // Start background tasks
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });
