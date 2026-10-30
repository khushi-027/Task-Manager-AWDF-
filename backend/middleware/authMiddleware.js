import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. No token provided.',
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'task_manager_secret_jwt_key_2026';
    const decoded = jwt.verify(token, secret);

    const user = await UserModel.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    // Attach user (without password)
    req.user = {
      _id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role || 'user',
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Token verification failed or expired.',
      error: error.message,
    });
  }
};

export default protect;
