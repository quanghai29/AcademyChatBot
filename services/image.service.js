const { Code, Message } = require('../helper/statusCode.helper');
const imageModel = require('../models/image.model');

//#region TienDung

async function insertImage(image) {
    let returnModel = {};
    const ret = await imageModel.add(image);
    image.img_id = ret[0];

    if(image.img_id === null)
        return {code: Code.Created_Fail}; 

    returnModel.code = Code.Created_Success;
    returnModel.data = image;
    return returnModel;
}

//#endregion

module.exports = {
    insertImage
}