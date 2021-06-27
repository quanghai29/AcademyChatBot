const db = require('../utils/db');

const table_name = 'course';
module.exports = {
  all() {
    return db(table_name);
  },

  async single(id) {
    const courses = await db(table_name).where('id', id);
    if (courses.length === 0) {
      return null;
    }

    return courses[0];
  },

  add(course) {
    return db(table_name).insert(course);
  },

  async allByCategory(category_id) {
    const courses = await db(table_name).where('category_id', category_id);
    if (courses.length === 0) {
      return null;
    }

    return courses;
  },

  async fullTextSearch(text) {
    const courses = await db.raw(`
    SELECT *, MATCH (title, short_description, full_description) AGAINST ('${text}') as score
    FROM course WHERE MATCH (title, short_description, full_description) AGAINST ('${text}') > 0 ORDER BY score DESC;
    `);

    if (courses.length === 0) {
      return null;
    }

    return courses[0];
  },

  async getLatestCourses(amount) {
    const courses = await db(table_name)
      .orderBy('create_date', 'desc')
      .limit(amount);
    if (courses.length === 0) {
      return null;
    }

    return courses;
  },

  async getMostViewCourses(amount) {
    const courses = await db.raw(`
    SELECT course_id, sum(views) AS sum_view, DATE_FORMAT(upload_date, '%m/%d/%Y') 
    FROM video 
    INNER JOIN chapter 
    ON chapter_id=chapter.id 
    WHERE upload_date BETWEEN NOW() - INTERVAL 30 DAY AND NOW() 
    GROUP BY course_id 
    ORDER BY sum_view DESC LIMIT ${amount};
    `);

    if (courses.length === 0) {
      return null;
    }

    return courses[0];
  },

  async getBestSellerCourseByCategory(catId, amount) {
    const courses = await db.raw(`
    SELECT course_id, COUNT(*) AS total_course, DATE_FORMAT(register_date, '%m/%d/%Y') 
    FROM student_course 
    INNER JOIN course 
    ON course_id = course.id 
    WHERE (register_date BETWEEN NOW() - INTERVAL 30 DAY AND NOW()) AND category_id=${catId} 
    GROUP BY course_id
    ORDER BY total_course DESC LIMIT ${amount};
    `);

    if (courses.length === 0) {
      return null;
    }

    return courses[0];
  },
  async outstandingCourses() {
    const courses = await db('course')
      .rightJoin(
        function () {
          this.select('course_id')
            .sum({ sum_vote: 'vote' })
            .from('student_course')
            .whereRaw('datediff(curdate(), register_date) <= 7')
            .groupBy('course_id')
            .orderBy('sum_vote', 'desc')
            .as('sum_vote');
        },
        'course.id',
        '=',
        'sum_vote.course_id'
      )
      .limit(4);

    return courses;
  },
};