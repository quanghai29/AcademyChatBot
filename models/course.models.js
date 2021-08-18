const db = require("../utils/db");

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

  deleteCourseById(id) {
    return db(table_name).where('id', id).del();
  },

  async getCoursesByLecturerId(lecturer_id) {
    const courses = await db
      .select('c.*', 'i.img_source')
      .from('course as c')
      .where('lecturer_id', lecturer_id)
      .leftJoin('image as i', 'i.id', 'c.img_id');
    if (courses.length === 0) {
      return null;
    }
    return courses;
  },

  updateCourseImage(image_id, course_id) {
    return db(table_name).where('id', course_id).update({ img_id: image_id });
  },

  updateCourseByCourseId(newCourse, id) {
    return db(table_name).where('id', id).update(newCourse);
  },

  add(course) {
    return db(table_name).insert(course);
  },

  allByCategory(category_id) {
    return db
      .select(
        'course.*',
        'ad.fullname',
        'image.img_source as course_img_source',
        'image.img_title as course_img_title',
        db.raw('CAST(AVG(sc.vote) AS DECIMAL(10,1)) AS avg_vote')
      )
      .count('sc.id as subscriber')
      .from('course')
      .where({
        'course.category_id': category_id,
        'course.enable_status': 1
      })
      .leftJoin('image', 'image.id', 'course.img_id')
      .leftJoin('student_course as sc', 'sc.course_id', 'course.id')
      .leftJoin('account_detail as ad', 'ad.account_id', 'course.lecturer_id')
      .groupBy('course.id')
      ;
  },

  async coursesByCategory(category_id) {
    const courses = await db(table_name).where('category_id', category_id);
    return courses;
  },

  async fullTextSearchCourse(text) {
    const sql = `
    SELECT *, MATCH (title, short_description, full_description) 
    AGAINST ('${text}') as score
    FROM course WHERE MATCH (title, short_description, full_description) AGAINST ('${text}') > 0
    AND enable_status = 1
    ORDER BY score DESC;
    `;
    const courses = await db.raw(sql);

    if (courses.length === 0) {
      return null;
    }

    return courses[0];
  },

  async getLatestCourses(amount) {
    const courses = await db
      .select(
        'c.*',
        db.raw('CAST(AVG(sc.vote) AS DECIMAL(10,1)) AS rating'),
        db.raw('COUNT(sc.id) as total_student'),
        'ad.fullname as lecturer_name',
        'i.img_source'
      )
      .from('course as c')
      .leftJoin('student_course as sc', 'sc.course_id', 'c.id')
      .leftJoin('account_detail as ad', 'ad.account_id', 'c.lecturer_id')
      .leftJoin('image as i', 'i.id', 'c.img_id')
      .where('c.enable_status', 1)
      .groupBy('c.id')
      .orderBy('create_date', 'desc')
      .limit(amount);
    if (courses.length === 0) {
      return null;
    }

    return courses;
  },

  async getMostViewCourses(amount) {
    const courses = await db.raw(`
    SELECT c.*, DATE_FORMAT(c.last_update, '%m/%d/%Y'), i.img_source, COUNT(sc.id) as total_student, CAST(AVG(sc.vote) AS DECIMAL(10,1)) AS rating, ad.fullname as lecturer_name
    FROM course AS c 
    LEFT JOIN student_course AS sc ON c.id = sc.course_id 
    LEFT JOIN account_detail AS ad ON c.lecturer_id = ad.account_id 
    LEFT JOIN image AS i ON c.img_id = i.id 
    WHERE (c.last_update BETWEEN NOW() - INTERVAL 30 DAY AND NOW() ) AND c.enable_status=1
    GROUP BY c.id 
    ORDER BY c.views DESC LIMIT ${amount}
    `);

    if (courses.length === 0) {
      return null;
    }

    return courses[0];
  },

  async getBestSellerCourseByCategory(catId, amount) {
    const courses = await db.raw(`
      SELECT 
        r.*,
        ad.fullname,
        image.img_source as course_img_source,
        CAST(AVG(sc.vote) AS DECIMAL(10,1)) AS avg_vote,
        count(sc.id) as subscriber
      FROM (
        SELECT 
          c.*,
          count(sc.id) as num_register_month, 
          sc.register_date as lastest_register
        FROM course as c
        left join student_course as sc
          on sc.course_id = c.id
        where 1 = 1
          and c.category_id = ${catId}
          and sc.register_date BETWEEN NOW() - INTERVAL 1 month AND NOW()
          and c.enable_status = 1
        group by sc.course_id
        order by num_register_month desc, sc.register_date desc
        limit ${amount}
      ) as r
      left join student_course as sc
        on sc.course_id = r.id
      left join account_detail as ad
        on ad.account_id = r.lecturer_id
      left join image 
        on image.id = r.img_id
      group by sc.course_id
    `)

    if (courses.length === 0)
      return null
    return courses[0];
    //return db.raw(`call getBestsellerOfCategory(1,5)`);
  },

  async outstandingCourses() {
    const courses = await db.raw(
      `SELECT course.id, course.title, course.price, course.discount,
       course.lecturer_id, course.img_id,
      rating,total_student,sum_vote_weekly,image.img_source,
       account_detail.fullname AS lecturer_name
      FROM  course
      RIGHT JOIN 
      (SELECT course_id, SUM(vote) AS sum_vote_weekly
       FROM student_course WHERE datediff(curdate(), vote_time) <= 7
       GROUP BY(course_id)
       ORDER BY(sum_vote_weekly)
       DESC
      ) AS temp ON course.id = temp.course_id
       LEFT JOIN (
        SELECT course_id, avg(vote) AS rating, 
          COUNT(course_id) AS total_student
        FROM student_course 
        GROUP BY(course_id)
       ) AS temp_2 ON course.id = temp_2.course_id
       LEFT JOIN account_detail ON account_detail.account_id = lecturer_id
       LEFT JOIN image ON img_id = image.id
       WHERE course.enable_status = 1
       LIMIT 4;`
    )
    return courses[0];
  },

  async getComments(course_id) {
    const comments = await db
      .select(
        'sc.id',
        'sc.student_id',
        'ac.fullname',
        'sc.course_id',
        'sc.vote',
        db.raw('date_format(sc.vote_time,"%d/%m/%Y") as vote_time'),
        'sc.comment'
      )
      .from('student_course as sc')
      .where('sc.course_id', course_id)
      .whereNotNull('vote')
      .leftJoin('account_detail as ac', 'ac.account_id', 'sc.student_id')
    if (comments)
      return comments;
    return null;
  },

  async addComment(comment) {
    const result = await db('comment').insert({
      content: comment.content,
      student_id: comment.student_id,
      course_id: comment.course_id
    });

    //console.log('add comment', result);
    return result;
  },

  async detail(course_id) {
    const courses = await db
      .select(
        'course.*',
        'category.category_name',
        'account_detail.fullname as lecturer_name',
        'account_detail.headline as lecturer_headline',
        'account_detail.description as lecturer_description',
        'account_detail.img_profile as lecturer_imgprofile',
        'image.img_source as course_img_source',
        'image.img_title as course_img_title',
        db.raw('CAST(AVG(sc.vote) AS DECIMAL(10,1)) AS num_rating')
      )
      .count('sc.id as num_register')
      .count('sc.vote as num_feedback')
      .from('course')
      .where({
        'course.id': course_id,
        'course.enable_status': true
      })
      .leftJoin('account_detail', 'account_detail.account_id', 'course.lecturer_id')
      .leftJoin('image', 'image.id', 'course.img_id')
      .leftJoin('student_course as sc', 'sc.course_id', 'course.id')
      .leftJoin('category', 'category.id', 'course.category_id')
      ;

    if (courses.length > 0 && courses[0].id !== null) {
      let course = courses[0];

      //get all chapter

      const chaptersContent = await this.getContentChapter(course_id);

      const chapters_fillter = chaptersContent.map(chapter => {
        const temp = chaptersContent.filter(item => item.chapter_id == chapter.chapter_id);

        const videos = temp.map((item) => {
          return {
            video_id: item.video_id,
            video_title: item.video_title,
            duration: item.duration,
            isPreview: item.isPreview,
            video_source: item.video_source,
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

      const chapters = [...new Map(chapters_fillter.map(obj => [JSON.stringify(obj), obj])).values()];

      course.chapters = chapters;
      course.sum_video_course = chapters.reduce((n, { sum_video_chapter }) => n + sum_video_chapter, 0);
      course.sum_duration_course = chapters.reduce((n, { sum_duration_chapter }) => n + sum_duration_chapter, 0);


      return course;
    }

    return null;
  },

  getContentChapter(course_id) {
    return db
      .select(
        'chapter.id as chapter_id',
        'chapter.title as chapter_title',
        'chapter.course_id',
        'video.id as video_id',
        'video.title as video_title',
        'video.duration',
        'video.video_source',
        'video.isPreview',
      )
      .from('chapter')
      .leftJoin('video', 'video.chapter_id', 'chapter.id')
      .where('chapter.course_id', course_id)
      .orderBy('chapter.id', 'asc');
  },

  getVotedCourse(course_id) {
    return db
      .from('student_course')
      .where('course_id', course_id)
  },

  async getVotedAVGCourse(course_id) {
    const item = await db.raw(`
    SELECT course_id, CAST(AVG(vote) as DECIMAL(10,1)) as num_rating
    FROM student_course 
    WHERE course_id = ${course_id} 
    GROUP BY course_id;
    `);
    if (item[0].length === 0) {
      return null;
    }
    return item[0];
  },

  async getBestSellerCourse() {
    const courses = await db.raw(
      `
      SELECT 
        sc.course_id,
        count(sc.id) as num_register_month, 
        sc.register_date as lastest_register
      from student_course as sc
      inner join course on course.id = sc.course_id
      where 1=1
			      and course.enable_status = true
            and sc.register_date BETWEEN NOW() - INTERVAL 7 day AND NOW()
      group by sc.course_id
      order by num_register_month desc, sc.register_date desc
      limit 5
      `
    )

    if (courses === null)
      return null

    const result = courses[0].reduce((obj, item) => {
      return {
        ...obj,
        [item['course_id']]: item,
      };
    }, {});
    return result;

  },
  async getCoursesForAdmin() {
    const courses = await db.select('course.id as course_id', 'course.category_id',
      'course.title', 'course.create_date', 'course.last_update', 'course.short_description',
      'course.course_status', 'account_detail.fullname as creator', 'image.img_title',
      'image.img_source')
      .from('course').leftJoin('account_detail', 'course.lecturer_id', 'account_detail.account_id')
      .leftJoin('image', 'image.id', 'course.img_id');

    return courses.length ? courses : null;
  },

  async deleteById(id) {
    const result = await db(table_name)
      .where('id', id).del();

    return result;
  },

  async getBestSellerCategories() {
    const categories = await db.raw(`
    SELECT 
		  distinct c.id,
      c.category_name
	  FROM (
	   SELECT 
        sc.course_id,
        count(sc.id) as num_register_month, 
        sc.register_date as lastest_register
      from student_course as sc
      where sc.register_date BETWEEN NOW() - INTERVAL 7 day AND NOW()
      group by sc.course_id
      order by num_register_month desc, sc.register_date desc
      limit 5
	  ) as r
      inner join course on course.id = r.course_id
      inner join category as c on c.id = course.category_id
    `)

    if (categories.length === 0)
      return null
    return categories[0];
  },

  addViewsCourse(course_id){
    return db('course')
      .where({id: course_id})
      .increment('views', 1)
  }
};

