const db = require('../utils/db');

const tableName = 'student_course';

module.exports = {
  async getAvgVoteOfCourse(course_id) {
    const result = await db.raw(
      `select cast(avg(vote) as decimal(10,1)) as vote from ${tableName}
      where course_id = ${course_id} `
    )
    
    return result[0];
  },

  async getSubscriberOfCourse(course_id) {
    const subscriber = await db(tableName).count('student_id as subscriber')
      .where('course_id', course_id);
    return subscriber.length > 0 ? subscriber[0] : 0;
  },

  async getSumOfVoteByCourseId(course_id){
    const sumVote = await db(tableName).sum('vote as sum_vote')
    .where('course_id', course_id);

    return sumVote[0];
  }
}