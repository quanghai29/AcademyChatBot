const jwt = require('jsonwebtoken');

module.exports = function (role) {
  return function (req, res, next) {
    const accessToken = req.headers['x-access-token'];
    if (accessToken) {
      try {
        const decoded = jwt.verify(accessToken, process.env.JWT_TOKEN);
        req.accessTokenPayload = decoded;

        if(decoded.role === role){
          next();
        }else{
          return res.status(400).json({
            code: 400,
            message: 'Not allow acess'
          })
        }
      } catch (err) {
        return res.status(401).json({
          message: 'Invalid access token.'
        });
      }
    } else {
      return res.status(400).json({
        code: 400,
        message: 'You must login before'
      })
    }
  }
}