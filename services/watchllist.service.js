const studentModel = require('../models/watchlist.model');
const { Code, Message } = require('../helper/statusCode.helper');
const courseModel = require('../models/course.models');

//#region QuangHai
async function addWatchlist ({student_id,course_id}) {
  let retData = {};
  const watchcourse = await studentModel.getOne({student_id,course_id});
  if(watchcourse){
    return {code: Code.Bad_Request, message: 'Đã có trong danh sách yêu thích'};
  }

  await studentModel.add({student_id,course_id});
  retData.code = Code.Created_Success;
  retData.message = Message.Created_Success;
  return retData;
}

async function deleteWatchlist (student_id,course_id) {
  const res = await studentModel.delete(student_id,course_id);
  if(res){
    return {code: Code.Deleted_Success, message: Message.Deleted_Success};
  }
  return {code: Code.Deleted_Fail, message: Message.Deleted_Fail};
}

async function getWatchlist(student_id){
  const res = await studentModel.getWatchlist(student_id);
  if(res){
    const bestSellerCourse = await courseModel.getBestSellerCourse();
    const data = res.map(course => {
      let isBestseller = false;
      if (bestSellerCourse[course.id]) {
        isBestseller = true;
      }
      course.isBestseller = isBestseller;
      return course;
    })
    return {code: Code.Success, data: data};
  }
  return {code: Code.Forbidden, message: Message.Forbidden};
}
//#endregion

module.exports = {
  addWatchlist,
  deleteWatchlist,
  getWatchlist,
}