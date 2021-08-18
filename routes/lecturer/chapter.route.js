const router = require('express').Router();
const chapterService = require('../../services/chapter.service');

//#region TienDung

/**
 * @openapi
 *
 * /chapter/lecturer:
 *   post:
 *     description: add a chapter
 *     tags: [chapter]
 *     parameters:
 *       - in: path
 *     responses:
 *       201:
 *         description: successfully created chapter
 */
const schema = require('../../schema/chapter.json');

router.post(
  '/',
  require('../../middlewares/validate.mdw')(schema),
  async (req, res) => {
    const newChapter = req.body;
    const ret = await chapterService.insertChapter(newChapter);
    res.status(ret.code).json(ret.data);
  }
);

router.patch('/:id', async (req, res) => {
  const id = req.params.id || 0;
  const newChapter = req.body;
  const ret = await chapterService.updateChapterById(newChapter, id);
  res.status(ret.code).json(ret.data);
});

router.get('/:id', async (req, res) => {
  const course_id = req.params.id || 0;
  if (course_id === 0) {
    return res.status(204).end();
  }

  const ret = await chapterService.getChapterWithVideoByCourseId(course_id);
  res.status(ret.code).json(ret.data);
});

router.delete('/:id', async (req, res) => {
  const id = req.params.id || 0;
  if (id === 0) {
    return res.status(204).end();
  }

  const ret = await chapterService.deleteChapterById(id);
  return res.status(ret.code).json(ret.data);
});

//#endregion

module.exports = router;
