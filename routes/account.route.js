const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const accountService = require('../services/account.service');
const imageService = require('../services/image.service');
const multer = require('multer');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');

const signupSchema = require('../schema/account/signup.account.json')
router.post('/signup', require('../middlewares/validate.mdw')(signupSchema),
  async (req, res) => {
    const newAcc = req.body;
    const checkUsername = await accountService.checkExistedUsername(newAcc.username);
    const checkEmail = await accountService.checkExistedEmail(newAcc.email);
    if (checkUsername.isExistedUsername) {
      res.json(checkUsername);
    } else if (checkEmail.isExistedEmail) {
      res.json(checkEmail);
    } else {
      newAcc.password = bcrypt.hashSync(newAcc.password, 10);
      const ret = await accountService.createAcc(newAcc);
      delete newAcc.password;

      //send OTP-code by email
      const otpCode = accountService.generateCode();
      const otpToken = jwt.sign({
        otpCode,
        id: ret.data.id,
      }, process.env.JWT_TOKEN, {
        expiresIn: process.env.OTP_EXPIRES_IN // seconds
      });
      accountService.sendOtpCodeByEmail(req.body.email, otpCode);

      ret.otpToken = otpToken;
      res.status(ret.code).json(ret);
    }

  })


function authOtp() {
  return function (req, res, next) {
    const accessToken = req.headers['x-otp-token'];
    if (accessToken) {
      try {
        const decoded = jwt.verify(accessToken, process.env.JWT_TOKEN);
        req.accessTokenPayload = decoded;
        next();

      } catch (err) {
        return res.status(401).json({
          message: 'Invalid access token.'
        });
      }
    } else {
      return res.status(400).json({
        code: 400,
        message: 'Access token not found.'
      })
    }
  }
}

const verifyCodeSchema = require('../schema/account/verifyCode.account.json');
const validateCodeSchema = require('../middlewares/validate.mdw')(verifyCodeSchema);
router.post('/verify-code', authOtp(), validateCodeSchema,
  async (req, res) => {
    const code = req.body.code;
    const tokenPayload = req.accessTokenPayload;
    if (code === tokenPayload.otpCode) {
      //active email

      const result = await accountService.activeEmail(tokenPayload.id);
      res.status(result.code).json(result);
    } else {
      res.status(440).json({
        message: 'The otp-code is not correct!'
      });
    }
  })

router.post('/resend-code', async (req, res) => {
  const email = req.body.email;
  const result = await accountService.getAccountByEmail(email);
  if (result.code === 200) {
    const otpCode = accountService.generateCode();
    const otpToken = jwt.sign({
      otpCode,
      id: result.data.id
    }, process.env.JWT_TOKEN, {
      expiresIn: process.env.OTP_EXPIRES_IN // seconds
    });
    accountService.sendOtpCodeByEmail(email, otpCode);

    res.status(200).json({
      ...result,
      otpToken
    });
  } else {
    return res.status(404).json({
      message: 'Email is not found'
    });
  }

})

router.post('/forgot-password', async(req, res)=>{
  const {email} = req.body;
  const result = await accountService.renewPassword(email);
  res.status(result.code).json(result);
})

router.post('/change-password', async (req, res) => {
  const { account_id, old_password, new_password } = req.body;
  console.log(req.body);
  const ret = await accountService.getAccountById(account_id);
  const old_account = ret.data || null;
  if (old_account === null) {
    return res.status(204).end();
  }

  if (!bcrypt.compareSync(old_password, old_account.password)) {
    return res.status(400).json({ message: 'password wrong' });
  }

  const newPassword = bcrypt.hashSync(new_password, 10);
  const ret2 = await accountService.updatePasswordAccount(newPassword, account_id);

  return res.status(ret2.code).end();
})

router.patch('/detail/:id', async (req, res) => {
  const id = req.params.id || 0;
  const newAccount = req.body;
  const ret = await accountService.updateDetailAccountInfo(newAccount, id);
  res.status(ret.code).json(ret.data);
})

const storage = multer.diskStorage({
  filename: async function (req, file, cb) {
    const filename = uuidv4() + '.png';
    req.img_source = filename;
    cb(null, filename);
  },
  destination: function (req, file, cb) {
    var dir = `./public/img`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
});

const upload = multer({ storage });

router.post('/image', (req, res) => {
  if (req.files === null) {
    return res.status(400).json({ msg: 'No file uploaded' });
  }
  upload.single('avatar')(req, res, async err => {
    if (err) {
      res.status(401).end();
    }
    //lấy tên file image
    const img_source = req.img_source;
    const account_id = req.body.account_id;

    const entityImageCourse = {
      img_source: img_source,
    };

    //xử lý insert vào db
    const ret = await imageService.insertImage(entityImageCourse);
    console.log(ret);
    const ret2 = await accountService.updateAccountImage(account_id, ret.data.img_id);

    res.status(ret2.code).json({ img_source: img_source });
  })
})

router.get('/detail/:id', async (req, res) => {
  const id = req.params.id || 0;
  const ret = await accountService.getDetailAccountById(id);
  res.status(ret.code).json(ret.data);
})

module.exports = router;