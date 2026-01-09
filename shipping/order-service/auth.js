const jwt = require('jsonwebtoken');

module.exports = (req) => {
  const auth = req.headers.authorization || '';
  if (!auth) return null;

  try {
    const token = auth.replace('Bearer ', '');
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
};
