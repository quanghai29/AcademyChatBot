const studentModel = require('../models/student.models');
const { Code, Message } = require('../helper/statusCode.helper');
const studentModels = require('../models/student.models');
const courseModel = require('../models/course.models');
const moment = require('moment');

//#region Mai Linh Đồng
async function getFavoriteCourses(student_id) {
  let retData = {};
  const courses = await studentModel.getFavoriteCoursesOfStudent(student_id);
  retData.code = Code.Success;
  retData.message = Message.Success;
  retData.data = courses;

  return retData;
}

async function deleteOneFavorite(student_id, course_id) {
  let retData = {};
  const deletedInfo = await studentModel.deleteOneFavoriteCourse(student_id, course_id);
  retData.code = Code.Success;
  retData.message = Message.Success;
  retData.data = deletedInfo

  return retData;
}

async function getStudents() {
  let retData = {};
  const result = await studentModel.getStudents();
  if (result.length > 0) {
    result.forEach(student => {
      student.create_date = moment(student.create_date).format('DD/MM/YYYY');
    })
    retData.code = Code.Success;
    retData.message = Message.Success;
    retData.data = result;
  } else {

  }

  return retData;
}

async function removeItemById(student_id) {
  let retData = {};
  const result = await studentModel.removeItemById(student_id);
  retData.code = Code.Success;
  retData.message = Message.Success;
  retData.data = result;
  
  return retData;
}

async function blockItemById(student_id){
  let retData = {};
  const result = await studentModel.blockItemById(student_id);
  retData.code = Code.Success;
  retData.message = Message.Success;
  retData.data = result;
  
  return retData;
}
//#endregion

//#region QuangHai
async function getCourseLearning(student_id, course_id) {
  let returnModel = { code: Code.Forbidden, message: Message.Forbidden }; // code; message; data
  if (student_id === null || course_id === null)
    return returnModel;

  const course = await studentModel.getCourseLearning(student_id, course_id);
  if (course == null) {
    returnModel.code = Code.Not_Found;
  } else {
    returnModel.code = Code.Success;
    returnModel.data = course;
  }
  return returnModel;
}


async function getHandleStudentCourse(student_id, course_id) {
  if (student_id === null || course_id === null)
    return null;
  const student_course = await studentModels.getHandleStudentCourse(student_id, course_id);
  return student_course;
}

async function registerCourse(student_id, course_id) {
  if (student_id === null || course_id === null) {
    return { code: Code.Bad_Request, message: Message.Bad_Request }
  }

  const student_course = await studentModels.add({ student_id, course_id });
  if (student_course) {
    return { code: Code.Created_Success, message: Message.Created_Success };
  } else {
    return { code: Code.Created_Fail, message: Message.Created_Fail };
  }
}

async function updateComment(comment) {
  const result = await studentModel.updateComment(comment);
  if (result) {
    return { code: Code.Created_Success, message: Message.Success };
  } else {
    return { code: Code.Created_Fail, message: Message.Created_Fail }
  }
}

async function getCourseRegister(student_id){
  const result = await studentModel.getCourseRegister(student_id);
  if (result) {
    const bestSellerCourse = await courseModel.getBestSellerCourse();
    const data = result.map(course => {
      let isBestseller = false;
      if (bestSellerCourse[course.id]) {
        isBestseller = true;
      }
      course.isBestseller = isBestseller;
      return course;
    })

    return { code: Code.Success, data: data};
  } else {
    return { code: Code.Bad_Request, message: Message.Bad_Request }
  }
}

async function updateStudentVideo(props){
  const result = await studentModel.UpdateStudentVideo(props);
  if (result) {
    return { code: Code.Created_Success};
  } else {
    return { code: Code.Created_Fail };
  }
}

async function getStudentVideo(student_id, video_id){
  const result = await studentModel.getStudentVideo(student_id, video_id);
  if (result) {
    return { code: Code.Success, data: result};
  } else {
    return { code: Code.Bad_Request, message: Message.Bad_Request }
  }
}

//#endregion

module.exports = {
  getFavoriteCourses,
  deleteOneFavorite,
  getCourseLearning,
  getHandleStudentCourse,
  registerCourse,
  updateComment,
  getStudents,
  removeItemById,
  getCourseRegister,
  updateStudentVideo,
  getStudentVideo,
  blockItemById
}