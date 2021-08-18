const db = require('../utils/db');

const table_name = 'video';
module.exports = {
  getAllByChapterId(chapter_id){
    return db(table_name).where('chapter_id', chapter_id); 
  },

  async deleteVideoByChapterId(chapter_id){
    return await db.raw(`
      DELETE FROM ${table_name} WHERE chapter_id = ${chapter_id}
    `)
  }
}