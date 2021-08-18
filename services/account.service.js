const accountModel = require('../models/account.model');
const imageModel = require('../models/image.model');
const { Code, Message } = require('../helper/statusCode.helper');
const nodemailer = require('nodemailer');
const rn = require('random-number');
const bcrypt = require('bcryptjs');
const fs = require('fs-extra');

async function createAcc(newAcc) {
  const result = {};
  const acc = await accountModel.addAccount(newAcc);
  newAcc.id = acc[0];
  newAcc.password = null;

  const accountDetail = {
    fullname: '',
    headline: '',
    description: '',
    account_id: newAcc.id,
    creator: '',
    img_profile: -1
  }

  const insertDetail = await accountModel.addAccountDetail(accountDetail);

  result.code = Code.Created_Success;
  result.message = Message.Created_Success;
  result.isExist = false;
  result.data = newAcc;
  return result;
}

async function checkExistedUsername(username) {
  let result = {};
  const account = await accountModel.getSingleAccountByUsername(username);
  result.isExistedUsername = account ? true : false;
  result.code = Code.Success;

  return result;
}

async function checkExistedEmail(email) {
  let result = {};
  const account = await accountModel.getSingleAccountByEmail(email);
  result.isExistedEmail = account ? true : false;
  result.code = Code.Success;

  return result;
}

function sendOtpCodeByEmail(destinationEmail, content) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: 'gel1999academy@gmail.com',
      pass: 'hoaroicuaphat2468'
    }
  });

  const mailOptions = {
    from: 'gel1999academy@gmail.com',
    to: destinationEmail,
    subject: 'Code',
    text: `${content}`
  }

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
      return info.response
    }
  });
}

function generateCode() {
  const gen = rn.generator({
    min: 100000
    , max: 1000000
    , integer: true
  });
  return gen();
}

async function activeEmail(accountId) {
  const resData = {};
  const result = await accountModel.activeEmail(accountId);
  resData.result = result;
  resData.code = Code.Success;
  resData.message = Message.Success

  return resData;
}

async function getAccountByEmail(email) {
  const res = {};
  const result = await accountModel.getSingleAccountByEmail(email);
  if (result === null) {
    res.code = Code.Not_Found
  } else {
    res.code = Code.Success;
    res.data = result
  }

  return res;
}

const newPassword = 'A123456789a';
async function renewPassword(email) {
  const resData = {};
  const isExistedAcc = await accountModel.getSingleAccountByEmail(email);
  if (!isExistedAcc) {
    resData.isExisted = false;
  } else {
    const hashedPass = bcrypt.hashSync(newPassword, 10);
    await accountModel.updatePasswordAccount(hashedPass, isExistedAcc.id);
    const resultSendingEmail = sendOtpCodeByEmail(email, newPassword);
    resData.isExisted = true;
  }
  resData.code = Code.Success;

  return resData;

}

//#region TienDung

async function getAccountById(id) {
  const returnModel = {};
  const result = await accountModel.getAccountById(id);
  if (result === null) {
    returnModel.code = Code.Not_Found;
  } else {
    returnModel.code = Code.Success;
    returnModel.data = result;
  }

  return returnModel;
}

async function updatePasswordAccount(password, id) {
  let returnModel = {};
  const ret = await accountModel.updatePasswordAccount(password, id);
  if (ret) {
    returnModel.code = Code.Success;
  } else {
    returnModel.code = Code.Bad_Request;
  }
  return returnModel;
}

async function getDetailAccountById(course_id) {
  const returnModel = {};
  const result = await accountModel.getAccountDetail(course_id);
  if (result === null) {
    returnModel.code = Code.Not_Found;
  } else {
    returnModel.code = Code.Success;
    returnModel.data = result;
  }

  return returnModel;
}

async function updateAccountImage(account_id, img_profile) {
  let returnModel = {};

  // remove old image
  const account = await accountModel.getAccountDetail(account_id);
  if (account) {
    const image = await imageModel.getImageById(account.img_profile);
    if (image) {
      // delete account's image
      await imageModel.deleteById(image.id); // delete img in db
      if (image.img_source) {
        imgFilePath = `./public/img/${image.img_source}`;
        try {
          fs.unlinkSync(imgFilePath); // delete img file in server
        } catch (err) {
          console.log(err);
        }
      }
    }
  }

  const ret = await accountModel.updateAccountImage(account_id, img_profile)
  if (ret) {
    returnModel.code = Code.Success;
  } else {
    returnModel.code = Code.Bad_Request;
  }
  return returnModel;
}

async function updateDetailAccountInfo(newAccount, account_id) {
  const returnModel = {};
  const result = await accountModel.updateDetailAccountInfo(newAccount, account_id);
  if (result) {
    returnModel.code = Code.Success;
    returnModel.data = newAccount;
  } else {
    returnModel.code = Code.Bad_Request;
  }
  return returnModel;
}

async function getAccountByUsername(username) {
  const returnModel = {};
  const account = await accountModel.getSingleAccountByUsername(username);
  if (account === null) {
    returnModel.code = Code.Not_Found;
  } else {
    returnModel.code = Code.Success;
    returnModel.data = account;
  }
  return returnModel;
}

async function updateRefreshToken(id, refreshToken) {
  const returnModel = {};
  const ret = await accountModel.updateRefreshToken(id, refreshToken);
  if (ret) {
    returnModel.code = Code.Success;
    returnModel.data = ret;
  }
  return returnModel;
}

async function isValidRefreshToken(id, refreshToken) {
  const returnModel = {};
  const ret = await accountModel.isValidRefreshToken(id, refreshToken);
  if (ret) {
    returnModel.code = Code.Success;
    returnModel.data = ret;
  } else {
    returnModel.code = Code.Not_Found;
    returnModel.data = ret;
  }
  return returnModel;
}


async function getMoreInfoAccount(account_id) {
  const info = await accountModel.getMoreInfoAccount(account_id);
  return info
}

//#endregion

module.exports = {
  createAcc, updateRefreshToken, isValidRefreshToken,
  checkExistedUsername, sendOtpCodeByEmail, generateCode, activeEmail,
  getAccountByUsername, getAccountByEmail, checkExistedEmail
  , sendOtpCodeByEmail, generateCode, activeEmail,
  getAccountByUsername, getAccountByEmail, getDetailAccountById,
  updateDetailAccountInfo, updateAccountImage, getAccountById,
  updatePasswordAccount, getMoreInfoAccount,
  renewPassword
}