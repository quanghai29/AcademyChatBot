const { Code, Message } = require('../helper/statusCode.helper');
const courseModel = require('../models/course.models');
const moment = require('moment');
const accountModel = require('../models/account.model');
const imageModel = require('../models/image.model');
const studentCourseModel = require('../models/student_course.model');
const categoryModel = require('../models/category.models');
const chapterModel = require('../models/chapter.models');
const videoModel = require('../models/video.model')
const fs = require('fs-extra');

//#region Quang Hai MTP
async function getCourseDetail(id) {
  let returnModel = {}; // code; message; data
  const course = await courseModel.detail(id);
  if (course == null) {
    returnModel.code = Code.Not_Found;
  } else {
    course.last_update = moment(course.last_update).format('MM/YYYY');
    course.create_date = moment(course.create_date).format('DD/MM/YYYY');
    returnModel.code = Code.Success;
    returnModel.data = course;
  }
  return returnModel;
}

//#endregion

//#region TienDung

async function updateCourseImage(img_id, course_id) {
  let returnModel = {};
  const ret = await courseModel.updateCourseImage(img_id, course_id);
  if (ret) {
    returnModel.code = Code.Success;
  } else {
    returnModel.code = Code.Bad_Request;
  }
  return returnModel;
}

async function deleteCourseById(id) {
  let returnModel = {};
  const ret = await courseModel.deleteCourseById(id);
  if (ret) {
    returnModel.code = Code.Success;
    returnModel.data = id;
  } else {
    returnModel.code = Code.Bad_Request;
  }
  return returnModel;
}

async function updateCourseByCourseId(newCourse, id) {
  const returnModel = {};
  const result = await courseModel.updateCourseByCourseId(newCourse, id)
  if (result) {
    returnModel.code = Code.Success;
    returnModel.data = newCourse;
  } else {
    returnModel.code = Code.Bad_Request;
  }
  return returnModel;
}

async function getCoursesByLecturerId(lecturer_id) {
  let returnModel = {};
  const ret = await courseModel.getCoursesByLecturerId(lecturer_id);

  if (ret == null) {
    returnModel.code = Code.Not_Found;
  } else {
    const courses = ret.map((course) => {
      course.last_update = moment(course.last_update).format('DD/MM/YYYY');
      course.create_date = moment(course.create_date).format('DD/MM/YYYY');
      return course;
    });
    returnModel.code = Code.Success;
    returnModel.data = courses;
  }
  return returnModel;
}

async function insertCourse(course) {
  let returnModel = {};
  const ret = await courseModel.add(course);
  course.id = ret[0];
  returnModel.code = Code.Created_Success;
  returnModel.message = Message.Created_Success;
  returnModel.data = course;
  return returnModel;
}

async function getLatestCourses(amount) {
  let returnModel = {};
  const ret = await courseModel.getLatestCourses(amount);

  if (ret == null) {
    returnModel.code = Code.Not_Found;
  } else {
    returnModel.code = Code.Success;
    returnModel.data = ret;
  }
  return returnModel;
}

async function getMostViewCourses(amount) {
  let returnModel = {};
  const ret = await courseModel.getMostViewCourses(amount);

  if (ret == null) {
    returnModel.code = Code.Not_Found;
  } else {
    returnModel.code = Code.Success;
    returnModel.data = ret;
  }
  return returnModel;
}

async function getBestSellerStudent_CoursesByCategory(catId, amount) {
  const ret = await courseModel.getBestSellerCourseByCategory(catId, amount);
  return ret;
}

async function getBestSellerCoursesByCategory(catId, amount) {
  let returnModel = {};
  const ret = await getBestSellerStudent_CoursesByCategory(catId, amount);

  const ret2 = await Promise.all(
    ret.map(async (item) => {
      let course = await courseModel.single(item.course_id);
      course.view_sum = item.sum_view;
      return course;
    })
  );

  if (ret2 == null) {
    returnModel.code = Code.Not_Found;
  } else {
    returnModel.code = Code.Success;
    returnModel.data = ret2;
  }
  return returnModel;
}

//#endregion

//#region Mai Linh Đồng
async function getCourseByCategory(category_id) {
  let returnModel = {};

  const courses = await courseModel.allByCategory(category_id);
  if (!courses) {
    returnModel.code = Code.Bad_Request;
    returnModel.message = Message.Bad_Request;
  } else {
    returnModel.code = Code.Success;
    returnModel.message = Message.Success;
  }
  returnModel.data = courses;

  return returnModel;
}

async function getFullDataCourses(courses) {
  let temp = 0;
  for (let i = 0; i < courses.length; i++) {
    courses[i].author = await accountModel.getAccountDetail(courses[i].lecturer_id);
    temp = await studentCourseModel.getAvgVoteOfCourse(courses[i].id);
    courses[i].avg_vote = +temp[0].vote || 0;

    temp = await studentCourseModel.getSubscriberOfCourse(courses[i].id);
    courses[i].subscriber = temp.subscriber;

    courses[i].image = await imageModel.getImageById(courses[i].img_id);
    delete courses[i].lecturer_id;
    delete courses[i].img_id;
  }
  return courses;
}

async function findCourse(text) {
  let retData = {
    data: {
      courses: [],
    },
    code: null,
    message: '',
  };
  if (text) {
    //get data from course table
    const courses = await courseModel.fullTextSearchCourse(text);
    if (courses.length > 0) {
      retData.data.courses = await getFullDataCourses(courses);
    } else {
      const categories = await categoryModel.fullTextSearchCategory(text);
      if (categories.length > 0) {
        let arrCourses = [];
        for (let i = 0; i < categories.length; i++) {
          let courses = await courseModel.coursesByCategory(categories[i].id);
          arrCourses = arrCourses.concat(courses);
        }
        retData.data.courses = await getFullDataCourses(arrCourses);
      } else {
        retData.data.courses = [];
      }
    }
    retData.code = Code.Success;
    retData.message = Message.Success;
  } else {
    retData.code = Code.Bad_Request;
    retData.message = Message.Bad_Request;
  }

  return retData;
}

async function getOutstandingCourses() {
  let retData = {};
  const courses = await courseModel.outstandingCourses();
  retData.code = Code.Success;
  retData.message = Message.Success;
  retData.data = courses;

  return retData;
}

async function getCommentsOfCourse(course_id) {
  let retData = {};
  const comments = await courseModel.getComments(course_id);
  if (comments === null) {
    retData.code = Code.Not_Found;
  } else {
    retData.code = Code.Success;
    retData.message = Message.Success;
    retData.data = comments;
  }
  return retData;
}

async function addComment(comment) {
  let retData = {};
  const result = await courseModel.addComment(comment);
  retData.code = Code.Created_Success;
  retData.message = Message.Created_Success;
  comment.comment_id = result[0];
  retData.data = { ...comment };

  return retData;
}

async function getCoursesForAdmin() {
  let retData = {
    code: Code.Success,
    message: Message.Success
  };
  const courses = await courseModel.getCoursesForAdmin();
  courses.forEach(course => {
    course.last_update = moment(course.last_update).format('DD/MM/YYYY');
  });
  retData.data = courses;

  return retData;
}

async function deleteById(course_id) {
  const course = await courseModel.single(course_id);
  if (course) {
    const { id, img_id } = course;

    const img = await imageModel.getImageById(img_id);
    const { img_source } = img;
    let imgFilePath = '';

    //delete course's image
    imageModel.deleteById(img_id);  //delete img in db
    if (img_source) {
      imgFilePath = `./public/img/${img_source}`;
      try{
        fs.unlinkSync(imgFilePath);//delete img file in server
      }catch(err){
        console.log(err);
      }
    }

    const chapters = await chapterModel.getChapterByCourseId(id);

    //delete chapter by course_id in db
    const deleteChapterResult = await chapterModel.deleteChapterByCourseId(id);

    //delete chapter's videos
    chapters.forEach(async (chapter) => {
      let videos = await videoModel.getAllByChapterId(chapter.id);

      //delete videos by chapter_id in db
      await videoModel.deleteVideoByChapterId(chapter.id);

      //delete video files in server
      videos.forEach(video => {
        let videoFilePath='';
        if (video.video_source) {
          videoFilePath = `./public/videos/${video.video_source}`;
          try{
            fs.unlinkSync(videoFilePath);
          }catch(err){
            console.log(err);
          }
        }
      })
    })

    //delete course by course_id
    await courseModel.deleteById(id);
  }

  return retData = {
    code: Code.Deleted_Success,
    message: Message.Deleted_Success
  }
}
//#endregion

module.exports = {
  getCourseDetail,
  insertCourse,
  getCourseByCategory,
  findCourse,
  getLatestCourses,
  getOutstandingCourses,
  getMostViewCourses,
  getBestSellerCoursesByCategory,
  getCommentsOfCourse,
  addComment,
  getCoursesByLecturerId,
  updateCourseImage,
  updateCourseByCourseId,
  deleteCourseById,
  getCoursesForAdmin,
  deleteById
};
