const router = require('express').Router();
const watchlistService = require('../../services/watchllist.service');

// #region QuangHai
/**
 * @openapi
 *
 * /student/watchlist/{courseId}:
 *   post:
 *     description: add watchlist
 *     tags: [Student]
 *     parameters:
 *        - in: header
 *          name: x-access-token
 *          schema:
 *            type: string
 *            default: mmm
 *          required: true
 *        - in: path
 *          name: courseId
 *          schema:
 *            type: integer
 *            default: 1
 *          required: true
 *     responses:
 *       200:
 *         description: list course favorite of student
 */
 router.post('/', async (req, res)=>{
  const student_id = req.accessTokenPayload.userId;
  const course_id = req.body.course_id;
  if(course_id === undefined)
    return res.status(400).end(); 
  const result = await watchlistService.addWatchlist({student_id, course_id});

  res.status(result.code).json(result.message);
})

/**
 * @openapi
 *
 * /student/watchlist:
 *   get:
 *     description: get watchlist
 *     tags: [Student]
 *     parameters:
 *        - in: header
 *          name: x-access-token
 *          schema:
 *            type: string
 *            default: mmm
 *          required: true
 *     responses:
 *       200:
 *         description: list course favorite of student
 */
 router.get('/', async (req, res)=>{
  const student_id = req.accessTokenPayload.userId;
  const result = await watchlistService.getWatchlist(student_id);
  res.status(result.code).json(result.data);
})

/**
 * @openapi
 *
 * /student/watchlist/{courseId}:
 *   delete:
 *     description: delete watchlist
 *     tags: [Student]
 *     parameters:
 *        - in: header
 *          name: x-access-token
 *          schema:
 *            type: string
 *            default: mmm
 *          required: true
 *        - in: path
 *          name: courseId
 *          schema:
 *            type: integer
 *            default: 1
 *          required: true
 *     responses:
 *       200:
 *         description: list course favorite of student
 */
 router.delete('/:courseId', async (req, res)=>{
  const student_id = req.accessTokenPayload.userId;
  const course_id = req.params.courseId;
  const result = await watchlistService.deleteWatchlist(student_id,course_id);
  res.status(result.code).json(result.message);
})
// #endregion


module.exports = router;