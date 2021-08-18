const { Code, Message } = require('../helper/statusCode.helper');
const categoryModel = require('../models/category.models');
const moment = require('moment');


//#region Quang Hai MTP
async function getAllCategory() {
  let returnModel = {}; // code; message; data
  const categories = await categoryModel.all();
  if (categories == null) {
    returnModel.code = Code.Not_Found;
  } else {
    categories.forEach(category => {
      category.last_update = moment(category.last_update).format('DD/MM/YYYY');
    });
    returnModel.code = Code.Success;
    returnModel.data = categories;
  }
  return returnModel;
}

async function getMostRegister({ duration, amount }) {
  let returnModel = {}; // code; message; data
  const categories = await categoryModel.getMostRegister({ duration, amount });
  if (categories == null) {
    returnModel.code = Code.Not_Found;
  } else {
    returnModel.code = Code.Success;
    returnModel.data = categories;
  }
  return returnModel;
}

//#endregion

//#region Mai Linh Đồng
async function findCategory(text) {
  const retData = {};
  if (text) {
    const result = await categoryModel.fullTextSearchCategory(text);
    retData.data = result ? result : [];
    retData.code = Code.Success;
    retData.message = Message.Success;
  } else {
    retData.code = Code.Bad_Request;
    retData.message = Message.Bad_Request;
  }

  return retData;
}

async function getExpandedInfo() {
  let returnModel = {}; // code; message; data
  const categories = await categoryModel.getExpandedInfo();

  if(!categories)
    return {code: Code.Forbidden, message: Message.Forbidden}
    
  categories.forEach(category => {
    category.last_update = moment(category.last_update).format('DD/MM/YYYY');
    delete category.course_id;
  });

  returnModel.code = Code.Success;
  returnModel.categories = categories;
  return returnModel;
}

async function editCategoryItem(data) {
  let resData = {};

  const existedItem = await categoryModel.singleByName(data.category_name);
  if (existedItem) {
    resData.code = Code.Success;
    resData.existedItem = true;
  } else {
    const result = await categoryModel.editCategoryItem(data);
    if (result.changedRows === 1) {
      resData.code = Code.Success;
      resData.message = Message.Success;
      resData.existedItem = false;
    }else{

    }
  }
  return resData;
}

async function createCategoryItem(data) {
  let resData = {};
  const existedItem = await categoryModel.singleByName(data.category_name);
  if (existedItem) {
    resData.code = Code.Success;
    resData.existedItem = true;
  } else {
    const result = await categoryModel.add(data);
    if (result.length > 0) {
      resData.code = Code.Created_Success;
      resData.message = Message.Created_Success;
      resData.existedItem = false;
    } else {

    }
  }

  return resData;
}

async function removeItemById(id) {
  let resData = {};
  const result = await categoryModel.removeItemById(id);

  if (result === 1) {
    resData.code = Code.Deleted_Success;
    resData.message = Message.Deleted_Success;
  } else {
    resData.code = Code.Deleted_Fail;
    resData.message = Message.Deleted_Fail;
  }

  return resData;
}
//#endregion


module.exports = {
  getAllCategory,
  getMostRegister,
  findCategory,
  getExpandedInfo,
  editCategoryItem,
  createCategoryItem,
  removeItemById
};
