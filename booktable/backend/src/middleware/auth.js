const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    console.log(`AUTH_MIDDLEWARE_ENTERED: ${req.method} ${req.originalUrl}`);
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      console.log('AUTH_MIDDLEWARE_NO_TOKEN');
      throw new Error('No token provided');
    }
    console.log('AUTH_MIDDLEWARE_TOKEN_FOUND');

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('AUTH_MIDDLEWARE_TOKEN_DECODED_USERID:', decoded.userId);

    const user = await User.findOne({ _id: decoded.userId });
    
    if (!user) {
      console.log('AUTH_MIDDLEWARE_USER_NOT_FOUND_DB_THROW for userId:', decoded.userId);
      throw new Error('User not found');
    }
    console.log('AUTH_MIDDLEWARE_USER_FOUND_IN_DB:', user.email);

    req.user = user;
    req.token = token;
    console.log(`AUTH_MIDDLEWARE_SUCCESS_NEXT_CALLED for user: ${user.email} on ${req.method} ${req.originalUrl}`);
    next();
  } catch (error) {
    console.error(`AUTH_MIDDLEWARE_CAUGHT_ERROR on ${req.method} ${req.originalUrl}:`, error.name, error.message);
    // console.error(error.stack); // Optionally add stack for more details
    res.status(401).json({ error: 'Please authenticate', details: error.message, errorName: error.name });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    console.log(`AUTHORIZE_MIDDLEWARE_ENTERED for ${req.method} ${req.originalUrl}. Allowed roles: ${roles}. User on req: ${!!req.user}`);
    if (!req.user || !req.user.role) {
      console.error(`AUTHORIZE_MIDDLEWARE_NO_USER_OR_ROLE_ON_REQ for ${req.method} ${req.originalUrl}. req.user:`, req.user);
      return res.status(403).json({ error: 'User not authenticated or role missing for authorization' });
    }
    console.log(`AUTHORIZE_MIDDLEWARE_CHECKING User: ${req.user.email}, Role: ${req.user.role}. Allowed: ${roles}`);
    if (!roles.includes(req.user.role)) {
      console.log(`AUTHORIZE_MIDDLEWARE_ROLE_MISMATCH User: ${req.user.email}, Role: ${req.user.role}. Allowed: ${roles}`);
      return res.status(403).json({ error: 'Not authorized to access this resource' });
    }
    console.log(`AUTHORIZE_MIDDLEWARE_SUCCESS_NEXT_CALLED for user: ${req.user.email}, Role: ${req.user.role} on ${req.method} ${req.originalUrl}`);
    next();
  };
};

module.exports = { auth, authorize };
