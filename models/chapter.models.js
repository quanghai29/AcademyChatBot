const db = require('../utils/db');

const table_name = 'chapter';
module.exports = {
    add(chapter) {
        return db(table_name).insert(chapter);
    },
    getChapterByCourseId(course_id) {
        return db(table_name).where('course_id', course_id);
    },
    getVideoByChapterId(chapter_id) {
        return db('video').where('chapter_id', chapter_id)
    },
    updateChapterbyId(newChapter, id) {
        return db(table_name).where('id', id).update(newChapter);
    },
    deleteChapterById(id) {
        return db(table_name).where('id', id).del();
    },
    insertVideo(video) {
        return db('video').insert(video);
    },
    
    deleteChapterByCourseId(course_id){
      return db.raw(`
        DELETE FROM chapter WHERE course_id = ${course_id}
      `)
    },
    updateVideobyId(newVideo, id) {
        return db('video').where('id', id).update(newVideo);
    },
    deleteVideoById(id) {
        return db('video').where('id', id).del();
    }
}