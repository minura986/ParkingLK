import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            // Decode token id
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.userId).select('-password');

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Admin middleware
export const superAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'super_admin') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as a super admin' });
    }
};

// Car Park Owner middleware
export const carOwner = (req, res, next) => {
    if (req.user && (req.user.role === 'car_owner' || req.user.role === 'super_admin')) {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as a car park owner' });
    }
};
