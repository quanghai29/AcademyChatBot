//const { getCourseLearning } = require('../services/student.service');
const db = require('../utils/db');
const moment = require('moment');

module.exports = {
  async getFavoriteCoursesOfStudent(student_id){
    const favoriteList = await db('course').rightJoin(
      function(){
        this.select('course_id', 'id as favorite_course_id')
        .from('list_favorite')
        .where('student_id', student_id)
        .as('list')
      }, 'course.id', '=', 'list.course_id'
    )

    return favoriteList;
  }, 

  async deleteOneFavoriteCourse(course_id){
    const result = await db('list_favorite')
    .where({id: course_id})
    .del();

    return result;
  },

  async getCourseLearning(student_id, course_id){
    const student_course = await db
      .select(
        'sc.student_id',
        'sc.course_id',
        'course.title'
      )
      .from("student_course as sc")
      .leftJoin("course", "course.id", "sc.course_id")
      .where({student_id,course_id});
    
    if(student_course === null || student_course.length == 0)
      return null;
    const course_learning = student_course[0];
    const chaptersContent = await this.getContentChapter(course_id, student_id);

    //get chapter and video of course
    const chapters_fillter = chaptersContent.map((chapter,idxChapter) => {
      const temp = chaptersContent.filter(item => item.chapter_id == chapter.chapter_id);

      const videos = temp.map((item, idxVideo) => {
        if(idxChapter === 0 && idxVideo === 0){
          course_learning.video_source_learning = item.video_source;
          course_learning.video_id_learning = item.video_id;
        }
        let current_time = 0; let status_completed = 0;
        if(item.current_time != null && item.status_completed != null){
          current_time = item.current_time,
          status_completed = item.status_completed
        }
        return {
          video_id: item.video_id,
          video_title: item.video_title,
          duration: item.duration,
          video_source: item.video_source,
          isLearning: true,
          current_time,
          status_completed
        }
      }).filter((item) => item.video_id != null);

      return {
        chapter_id: chapter.chapter_id,
        chapter_title: chapter.chapter_title,
        course_id: chapter.course_id,
        videos: videos,
        sum_video_chapter: videos.length,
        sum_duration_chapter: videos.reduce((n, { duration }) => n + duration, 0)
      }
    })

    //add to result
    const chapters = [...new Map(chapters_fillter.map(obj => [JSON.stringify(obj), obj])).values()];
    course_learning.chapters = chapters;
    
    return course_learning;
  },

  getContentChapter(course_id, student_id){
    return db
    .select(
      'chapter.id as chapter_id',
      'chapter.title as chapter_title',
      'chapter.course_id',
      'video.id as video_id',
      'video.title as video_title',
      'video.duration',
      'video.video_source',
      'sv.current_time',
      'sv.status_completed',
    )
    .from('chapter')
    .leftJoin('video', 'video.chapter_id', 'chapter.id')
    .leftJoin('student_video as sv',function(){
      this
        .on('sv.video_id', 'video.id')
        .on('sv.student_id', student_id)
    })
    .where('chapter.course_id', course_id)
    .orderBy('chapter.id', 'asc');
  },

  async getHandleStudentCourse(student_id, course_id){
    const result = {
      isRegister : false,
      isFeedbacked : false,
      isFavorite : false
    };

    const register = await db('student_course as sc').where({student_id, course_id});
    if(register.length > 0){
      result.isRegister = true;
      if(register[0].vote){
        result.isFeedbacked = true;
      }
    }

    const favorite = await db('list_favorite').where({student_id, course_id});
    if(favorite.length > 0){
      result.isFavorite = true;
    }
    return result
  },

  async add({student_id,course_id}){
    const checkDuplicate = await db('student_course').where({student_id,course_id});
    if(checkDuplicate.length > 0)
      return false;

    const result = await db('student_course').insert({student_id,course_id});
    console.log(result);
    if(result.length > 0)
      return true;
    return false;
  },

  async updateComment(comment){
    const result = await db('student_course')
      .where({
        student_id: comment.student_id,
        course_id: comment.course_id
      })
      .update({
        vote: comment.newRating,
        comment: comment.newComment,
        vote_time: moment().format('YYYY-MM-DD hh:mm:ss')
      })
    return result > 0;
  },

  async getStudents(){
    const result = await db.select(
      'account.id', 'account.username', 'account.email', 
      'account.create_date', 'account_detail.fullname', 'account.enable'
    ).from('account').leftJoin('account_detail', 'account.id',
    'account_detail.account_id' ).where('account.account_role', 3);

    return result;
  },

  async removeItemById(id) {
    const resultOnAccount = await db('account')
      .where('id', id)
      .del();
    const resultOnAccDetail = await db('account_detail')
    .where('id', id)
    .del();

    const result = [
      resultOnAccount,
      resultOnAccDetail
    ]
    return result;
  },

  async blockItemById(id){
    const result = await db('account').where('id', id)
    .update({enable: false});

    return result;
  },

  getCourseRegister(student_id){
    return db
      .select(
        'course.*',
        db.raw('CAST(AVG(sc1.vote) AS DECIMAL(10,1)) AS avg_vote'),
        'ad.fullname',
        'image.img_source as course_img_source'
      )
      .count('sc1.id as subscriber')
      .from(
        db
        .select('*')
        .from('student_course as sc')
        .where('sc.student_id', student_id)
        .as('r')
      )
      .innerJoin('student_course as sc1', 'sc1.course_id', 'r.course_id')
      .innerJoin('course', 'course.id', 'r.course_id')
      .where('course.enable_status', true)
      .leftJoin('account_detail as ad','ad.account_id', 'course.lecturer_id')
      .leftJoin('image', 'image.id', 'course.img_id')
      .groupBy('r.course_id')
  },

  sqlGetCourseRegister(student_id){
    return db
      .select(
        'course.*',
        'ad.fullname',
      )
    .count('sc.id as subscriber')
    .from('student_course as sc')
    .where('sc.student_id', student_id)
    .leftJoin('course','course.id','sc.course_id')
    .leftJoin('account_detail as ad','ad.account_id', student_id)
    .groupBy('course.id')
  },

  async UpdateStudentVideo(props){
    //check exist record
    const row = await db('student_video')
      .where({
        student_id: props.student_id,
        video_id: props.video_id
      })
    if(row === null){
      return null;
    }
    
    let result = null;
    if(row.length === 0){
      //insert
      result = await db('student_video')
        .insert({
          student_id: props.student_id,
          video_id: props.video_id,
          current_time: props.current_time
        })
    }else{
      //update
      result = await db('student_video')
        .where({
          student_id: props.student_id,
          video_id: props.video_id,
        })
        .update({
          current_time: props.current_time,
          status_completed: props.status_completed,
        })
    }
    return result
  },

  async getStudentVideo(student_id, video_id){
    const result = await db('student_video').where({student_id, video_id});
    if(result.length === 0)
      return {
        id: 0,
        student_id,
        video_id,
        current_time: 0,
        status_completed: 0,
      };
    return result[0];
  },
}