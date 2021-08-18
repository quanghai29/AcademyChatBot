const db = require("../utils/db");

const table_name = 'list_favorite';
module.exports = {
  all() {
    return db(table_name);
  },

  async single(id) {
    const watchlist = await db(table_name).where('id', id);
    if (watchlist.length === 0) {
      return null;
    }

    return watchlist[0];
  },

  async getOne({student_id, course_id}){
    const watchcourse =await db.from(table_name).where({student_id, course_id});
    if(watchcourse.length > 0)
      return watchcourse[0];
    return null;
  },

  add(watchcourse) {
    return db(table_name).insert(watchcourse);
  },

  delete(student_id, course_id){
    return db.from(table_name).where({student_id,course_id}).del();
  },

  getWatchlist(student_id){
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
      .from('list_favorite as sc')
      .where('sc.student_id', student_id)
      .as('r')
    )
    .innerJoin('student_course as sc1', 'sc1.course_id', 'r.course_id')
    .innerJoin('course', 'course.id', 'r.course_id')
    .where('course.enable_status', true)
    .leftJoin('account_detail as ad','ad.account_id', 'course.lecturer_id')
    .leftJoin('image', 'image.id', 'course.img_id')
    .groupBy('r.course_id')
  }
}