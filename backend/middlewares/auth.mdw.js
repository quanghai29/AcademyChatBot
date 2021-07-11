const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const accessToken = req.headers['x-access-token'] ?
    req.headers['x-access-token'] : req.headers['x-otp-token'];
  if (accessToken) {
    try {
      const decoded = jwt.verify(accessToken, 'HOA_ROI_CUA_PHAT');
      req.accessTokenPayload = decoded;
      next();
    } catch (err) {
      return res.status(401).json({
        message: 'Invalid access token.'
      });
    }
  } else {
    return res.status(400).json({
      message: 'Access token not found.'
    })
  }
}