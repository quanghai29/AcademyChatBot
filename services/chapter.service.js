const { Code, Message } = require('../helper/statusCode.helper');
const chapterModel = require('../models/chapter.models');
const videoModal = require('../models/video.model');
const fs = require('fs-extra');

//#region TienDung

async function insertChapter(chapter) {
  let returnModel = {};
  const ret = await chapterModel.add(chapter);
  chapter.id = ret[0];
  chapter.videos = [];
  returnModel.code = Code.Created_Success;
  returnModel.message = Message.Created_Success;
  returnModel.data = chapter;
  return returnModel;
}

async function insertVideo(video) {
  let returnModel = {};
  const ret = await chapterModel.insertVideo(video);
  video.id = ret[0];
  returnModel.code = Code.Created_Success;
  returnModel.message = Message.Created_Success;
  returnModel.data = video;
  return returnModel;
}

async function updateChapterById(newChapter, id) {
  const returnModel = {};
  const result = await chapterModel.updateChapterbyId(newChapter, id);
  if (result) {
    returnModel.code = Code.Success;
    returnModel.data = newChapter;
  } else {
    returnModel.code = Code.Bad_Request;
  }
  return returnModel;
}

async function updateVideoById(newVideo, id) {
  const returnModel = {};
  const result = await chapterModel.updateVideobyId(newVideo, id);
  if (result) {
    returnModel.code = Code.Success;
    returnModel.data = newVideo;
  } else {
    returnModel.code = Code.Bad_Request;
  }
  return returnModel;
}

async function deleteChapterById(id) {
  let returnModel = {};

  const videos = await videoModal.getAllByChapterId(id);
  if(videos) {

    // delete videos by chapter_id in db
    await videoModal.deleteVideoByChapterId(id);

    // delete video files in server
    videos.forEach((video) => {
      let videoFilePath = '';
      if (video.video_source) {
        videoFilePath = `./public/videos/${video.video_source}`;
        try {
          fs.unlinkSync(videoFilePath);
        } catch (err) {
          console.log(err);
        }
      }
    });
  }

  const ret = await chapterModel.deleteChapterById(id);
  if(ret) {
    returnModel.code = Code.Success;
    returnModel.data = id;
  } else {
    returnModel.code = Code.Bad_Request;
  }
  return returnModel;
}

async function deleteVideoById(id) {
  let returnModel = {};
  const ret = await chapterModel.deleteVideoById(id);
  if(ret) {
    returnModel.code = Code.Success;
    returnModel.data =id;
  } else {
    returnModel.code = Code.Bad_Request;
  }
  return returnModel;
}

async function getChapterWithVideoByCourseId(course_id) {
  let returnModel = {};
  const result1 = await chapterModel.getChapterByCourseId(course_id);

  const result2 = await Promise.all(
    result1.map(async (item) => {
      let videos = await chapterModel.getVideoByChapterId(item.id);
      item.videos = videos;
      return item;
    })
  );

  if (result2 == null) {
    returnModel.code = Code.Not_Found;
  } else {
    returnModel.code = Code.Success;
    returnModel.data = result2;
  }
  return returnModel;
}

//#endregion

module.exports = {
  insertChapter,
  getChapterWithVideoByCourseId,
  updateChapterById,
  deleteChapterById,
  insertVideo,
  updateVideoById,
  deleteVideoById
};
