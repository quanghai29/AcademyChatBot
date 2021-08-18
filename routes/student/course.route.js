const router = require('express').Router();
const studentService = require('../../services/student.service');
const studentVideoSchema = require('../../schema/student_video.json');

//#region QuangHai
/**
 * @openapi
 *
 * /student/course/learning/{courseId}:
 *   get:
 *     description: get course learning
 *     tags: [Student]
 *     parameters:
 *        - in: path
 *          name: courseId
 *          schema:
 *            type: integer
 *            default: 1
 *          required: true
 *        - in: header
 *          name: x-access-token
 *          schema:
 *            type: string
 *            default: mmm
 *          required: true
 *     responses:
 *       200:
 *         description: json data if sucess
 */
router.get('/learning/:courseId', async function (req, res) {
  const student_id = req.accessTokenPayload.userId;
  const course_id = req.params.courseId;

  const ret = await studentService.getCourseLearning(student_id, course_id)
  res.status(ret.code).json(ret.data);
});

/**
 * @openapi
 *
 * /student/course/learning:
 *   post:
 *     description: get course learning
 *     tags: [Student]
 *     parameters:
 *        - in: header
 *          name: x-access-token
 *          schema:
 *            type: string
 *            default: mmm
 *          required: true
 *     requestBody:
 *        content:
 *        application/json:
 *           schema:
 *           type: object
 *           properties:
 *              course_id:
 *                type: integer
 *                default: 1
 *           encoding:
 *     responses:
 *       200:
 *         description: json data if sucess
 */
router.post('/learning', async function (req, res) {
  const student_id = req.accessTokenPayload.userId;
  const course_id = req.body.course_id;
  if(course_id === undefined)
    return res.status(400).end();

  const ret = await studentService.registerCourse(student_id, course_id)
  res.status(ret.code).json(ret.data);
});



/**
 * @openapi
 * 
 * /student/course/comment:
 *  post:
 *    description: update a course's comment
 *    tags: [Student]
 *    requestBody:
 *      content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *              course_id:
 *                type: integer
 *                default: 1
 *              newRating:
 *                type: integer
 *                default: 1
 *              newComment:
 *                type: string
 *                default: ""
 *           encoding:
 *    responses:
 *      201:
 *        description: Create comment successfully
 *      401: 
 *        description: Create comment unsuccessfully
 */
const commentSchema = require('../../schema/comment.json');
router.post('/comment', require('../../middlewares/validate.mdw')(commentSchema), async (req, res) => {
  const student_id = req.accessTokenPayload.userId;
  const comment = req.body;
  comment.student_id = student_id;

  const result = await studentService.updateComment(comment);
  res.status(result.code).json(result.message);
})


/**
 * @openapi
 *
 * /student/course/register:
 *   get:
 *     description: get course register
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
 *         description: json data if sucess
 */
 router.get('/register', async function (req, res) {
  const student_id = req.accessTokenPayload.userId;
  const ret = await studentService.getCourseRegister(student_id);
  if(ret){
    return res.status(ret.code).json(ret.data);
  }
  return res.status(ret.code).json(ret.message);
});


/**
 * @openapi
 *
 * /student/course/video/update-state:
 *   post:
 *     description: get course learning
 *     tags: [Student]
 *     parameters:
 *        - in: header
 *          name: x-access-token
 *          schema:
 *            type: string
 *            default: mmm
 *          required: true
 *     requestBody:
 *        content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              video_id:
 *                type: integer
 *                default: 1
 *              current_time:
 *                type: integer
 *                default: 5
 *            encoding:
 *     responses:
 *       200:
 *         description: json data if sucess
 */
 router.post('/video/update-state', require('../../middlewares/validate.mdw')(studentVideoSchema), async function (req, res) {
  const student_id = req.accessTokenPayload.userId;
  const ret = await studentService.updateStudentVideo({...req.body, student_id});
  res.status(ret.code).end();
});



/**
 * @openapi
 *
 * /student/course/video/update-state/{video_id}:
 *   get:
 *     description: get state video learning
 *     tags: [Student]
 *     parameters:
 *        - in: header
 *          name: x-access-token
 *          schema:
 *            type: string
 *            default: mmm
 *          required: true
 *        - in: path
 *          name: video_id
 *          schema:
 *            type: integer
 *            default: 1
 *          required: true
 *     responses:
 *       200:
 *         description: json data if sucess
 */
 router.get('/video/update-state/:video_id', async function (req, res) {
  const student_id = req.accessTokenPayload.userId;
  const video_id = req.params.video_id;
  const ret = await studentService.getStudentVideo(student_id, video_id);
  res.status(ret.code).json(ret.data);
});



/**
 * @openapi
 *
 * none:
 *   post:
 *     description: get course learning
 *     tags: []
 *     requestBody:
 *      content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *              student_id:
 *                type: integer
 *                default: 1
 *              course_id:
 *                type: integer
 *                default: 1
 *           encoding:
 *     responses:
 *       200:
 *         description: json data if sucess
 */


//#endregion

module.exports = router;
