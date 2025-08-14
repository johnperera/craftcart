import jwt from 'jsonwebtoken';

// Add the 'export' keyword before each function you want to use elsewhere
export const verifyToken = (token) => {
  try {
    if (!token) return null;
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.error('Token verification error:', err.message);
    return null;
  }
};

export const createToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  });
};