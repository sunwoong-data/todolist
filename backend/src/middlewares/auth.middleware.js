const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다.' } });
    return;
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ error: { code: 'INVALID_TOKEN', message: '유효하지 않은 토큰입니다.' } });
  }
}

module.exports = { authMiddleware };
