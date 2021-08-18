const router = require('express').Router();
const multer = require('multer');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const chapterService = require('../../services/chapter.service');
//#region TienDung

/**
 * @openapi
 *
 * /lecturer/video:
 *   post:
 *     description: add a image
 *     tags: [image]
 *     parameters:
 *       - in: path
 *     responses:
 *       201:
 *         description: successfully created image
 */

const storage = multer.diskStorage({
  filename: async function (req, file, cb) {
    const filename = uuidv4() + '.mp4' ;
    req.video_source = filename;
    cb(null, filename);
  },
  destination: function(req, file, cb){
    var dir = `./public/videos`;
      if (!fs.existsSync(dir)){
          fs.mkdirSync(dir);
      }
    cb(null, dir);
  },
});

const upload = multer({ storage });

router.post('/', (req, res) => {
  if (req.file === null) {
    return res.status(400).json({ msg: 'No file uploaded' });
  }

  upload.single('video')( req,res, async err =>{
    if(err) {
      console.log(err);
      return res.status(400).end();
    }

    const entityVideo = {
      chapter_id: req.body.chapter_id,
      title: req.body.title,
      duration: req.body.duration,
      isPreview: req.body.isPreview,
      video_source: req.video_source
    };

    //xử lý insert vào db
    const ret = await chapterService.insertVideo(entityVideo);

    res.status(ret.code).json(ret.data);
  })
  
});

router.patch('/:id', async (req, res) => {
  const id = req.params.id || 0;
  const newVideo = req.body;
  const ret = await chapterService.updateVideoById(newVideo, id);
  res.status(ret.code).json(ret.data);
});

router.delete('/:id', async (req, res) => {
  const id = req.params.id || 0;
  if (id === 0) {
    return res.status(204).end();
  }
  console.log(req.body);
  fs.unlink(path.join(__dirname, `../../public/videos/${req.body.vid_source}`), async (err) => {
    if(err) {
      console.error(err);
      return res.status(400).end();
    }
    console.log('remove successfully');
    const ret = await chapterService.deleteVideoById(id);
    return res.status(ret.code).json(ret.data);
  })
});

//#endregion

module.exports = router;
