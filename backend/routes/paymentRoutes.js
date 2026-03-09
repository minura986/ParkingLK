import express from 'express';

const router = express.Router();

router.get('/config/paypal', (req, res) => {
    // Return sandbox client ID if no prod mapping
    res.json({ clientId: process.env.PAYPAL_CLIENT_ID || 'sb' });
});

export default router;
