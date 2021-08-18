const { Code, Message } = require('../helper/statusCode.helper');
const lecturerModel = require('../models/lecturer.models');
const accountModel = require('../models/account.model');
const moment = require('moment');

//#region TienDung

async function getLecturerById(id) {
  let returnModel = {};

  const lecturer = await lecturerModel.getLecturerById(id);
  if (lecturer == null) {
    returnModel.code = Code.Not_Found;
  } else {
    lecturer.last_update = moment(lecturer.last_update).format(
      'DD/MM/YYYY HH:mm:ss'
    );
    returnModel.code = Code.Success;
    returnModel.message = Message.Success;
    returnModel.data = lecturer;
  }
  return returnModel;
}

//#endregion

async function getLecturers() {
  let retData = {};
  const result = await lecturerModel.getLecturers();
  if (result.length > 0) {
    result.forEach(lecturer => {
      lecturer.create_date = moment(lecturer.create_date).format('DD/MM/YYYY');
    })
    retData.code = Code.Success;
    retData.message = Message.Success;
    retData.data = result;
  } else {

  }

  return retData;
}

async function removeItemById(lecturer_id) {
  let retData = {};
  const result = await lecturerModel.removeItemById(lecturer_id);
  retData.code = Code.Success;
  retData.message = Message.Success;
  retData.data = result;

  return retData;
}

async function blockLecturer(lecturer_id){
  let retData = {};
  const result = await lecturerModel.blockById(lecturer_id);
  retData.code = Code.Success;
  retData.message = Message.Success;
  retData.data = result;

  return retData;
}

async function addLecturerItem(data) {
  let resData = {};
  const isUsernameExisted = await lecturerModel.getLecturerByUsername(data.username);
  if (isUsernameExisted) {
    resData.code = Code.Success;
    resData.isUsernameExisted = true;
  } else {
    const account= {
      username: data.username,
      password: data.password,
      confirm_email: 1,
      account_role: 2
    };
    const accountResult = await lecturerModel.addLecturer(account);
    if(accountResult){
      const account_detail={
        fullname: '',
        headline: '',
        description:'',
        account_id: accountResult,
        creator: data.creator,
        img_profile: -1,
      }
      const accountDetailResult = await accountModel.addAccountDetail(account_detail);
      resData.code = Code.Created_Success;
      resData.message = Message.Created_Success;
      resData.isUsernameExisted = false;
    }else{
      resData.code = Code.Created_Fail;
      resData.message = Message.Created_Fail;
    }
  }

  return resData;
}


module.exports = {
  getLecturerById,
  getLecturers,
  removeItemById,
  addLecturerItem,
  blockLecturer
};
