import jwt from 'jsonwebtoken';
import { SECRET_KEY } from '../auth_helpers/jwt_generator.mjs';

export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log('Authorization Header:', authHeader);
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    const token = authHeader.split(' ')[1];
    console.log('Received JWT:', token);
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        console.log('Decoded JWT:', decoded);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};