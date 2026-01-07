import jwt from 'jsonwebtoken';
export const SECRET_KEY = 'your_secret_key';
export function generateJWT(user) {
    const payload = {
        id: user.id,
        name: user.name,
        email: user.email,
        age: user.age
    };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
    return token;
}