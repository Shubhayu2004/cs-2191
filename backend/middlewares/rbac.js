const jwt = require('jsonwebtoken');

const checkRole = (roles) => {
  return (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(403).send('Access Denied');
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      if (roles && !roles.includes(req.user.role)) {
        return res.status(403).send('Access Denied: Insufficient Role');
      }
      next();
    } catch (err) {
      res.status(401).send('Invalid Token');
    }
  };
};

module.exports = checkRole;
