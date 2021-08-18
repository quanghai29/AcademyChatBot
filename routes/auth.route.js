const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const randomstring = require('randomstring');

const accountService = require('../services/account.service');
const validate = require('../middlewares/validate.mdw');

const loginSchema = require('../schema/account/login.account.json');
const rfTokenSchema = require('../schema/rfToken.json');

const router = express.Router();



/**
 * @openapi
 *
 * /auth:
 *   post:
 *     description: Login
 *     tags: [Auth]
 *     requestBody:
 *      content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *              username:
 *                type: string
 *                default: 'haimtp'
 *              password:
 *                type: string
 *                default: 'Daihoc12345'
 *           encoding:
 *     responses:
 *       200:
 *         description: json data if sucess
 */
router.post('/', validate(loginSchema), async function (req, res) {
  const ret = await accountService.getAccountByUsername(req.body.username);
  const account = ret.data || null;
  if (account === null) {
    return res.json({
      authenticated: false,
      shouldConfirmEmail:false
    });
  }

  if (!bcrypt.compareSync(req.body.password, account.password)) {
    return res.json({
      authenticated: false,
      shouldConfirmEmail: false
    });
  }

  if(!account.confirm_email){
    return res.json({
      authenticated: false,
      shouldConfirmEmail: true,
      email: account.email
    })
  }

  if(!account.enable){
    return res.json({
      authenticated: false,
      shouldConfirmEmail: false,
      isDisable: true
    })
  }

  const moreInfo = await accountService.getMoreInfoAccount(account.id);

  const accessToken = jwt.sign({
    userId: account.id,
    role: account.account_role,
    isAuth: true,
    ...moreInfo
  }, process.env.JWT_TOKEN, {
    expiresIn: process.env.JWT_EXPIRES_IN // seconds (1 day)
  });

  const refreshToken = randomstring.generate();
  await accountService.updateRefreshToken(account.id, refreshToken);

  
  res.json({
    authenticated: true,
    accessToken,
    refreshToken,
    username:account.username,
    email: account.email,
    shouldConfirmEmail: false,
  })
})

router.post('/refresh', validate(rfTokenSchema), async function (req, res) {
  const { accessToken, refreshToken } = req.body;
  const { userId } = jwt.verify(accessToken, process.env.JWT_TOKEN, {
    ignoreExpiration: true
  });

  const ret = await accountService.isValidRefreshToken(userId, refreshToken);
  if (ret.data === true) {
    const newAccessToken = jwt.sign({ userId }, process.env.JWT_TOKEN, { expiresIn: process.env.JWT_EXPIRES_IN });
    return res.json({
      accessToken: newAccessToken
    })
  }

  res.status(400).json({
    message: 'Invalid refresh token.'
  })
})

module.exports = router;