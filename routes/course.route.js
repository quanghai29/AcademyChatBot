const router = require('express').Router();
const courseService = require('../services/course.service');
const studentService = require('../services/student.service');
const jwt = require('jsonwebtoken');

//#region Mai Linh Đồng

/**
 * @openapi
 * paths:
 *  /course?category_id={category_id}:
 *    get:
 *      description: get all of courses which has category_id = number
 *      tags: [Course]
 *      parameters:
 *          - in: query
 *            name: category_id
 *            schema:
 *              type: integer
 *              minimum: 1
 *            required: true
 *      responses:
 *          200:
 *              description: json data
 *          400:
 *              description: bad request
 */
router.get('/', async (req, res) => {
  const category_id = +req.query.category_id || 0;
  const ret = await courseService.getCourseByCategory(category_id);
  res.status(ret.code).json(ret.data);
});

/**
 * @openapi
 *  
 * /course/search:
 *  post:
 *      description: find courses which concerning key words
 *      tags: [Course]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema: {}
 *                  example:
 *                      text_search: value
 *                      
 *      responses:
 *          200:
 *              description: json data
 *          400: 
 *              description: bad request in case have not any text is sent to server
 */
router.post('/search', async (req, res) => {
  const text = req.body.text_search || "";
  const ret = await courseService.findCourse(text);
  res.status(ret.code).json(ret);
});

/**
 * @openapi
 * 
 * /course/outstanding:
 *  post:
 *      description: find outstanding courses(by vote)
 *      tags: [Course]
 *      responses:
 *          200:
 *              description: json data
 */
router.get('/outstanding', async (req, res) => {
  const ret = await courseService.getOutstandingCourses();
  res.status(ret.code).json(ret);
})

// ================= get coments of a course =============
/**
 * @openapi
 * /course/comments/{id}:
 *  get:
 *    description: get all of comments of a course
 *    tags: [Course]
 *    parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *             type: integer
 *             minimum: 1
 *             default: 1
 * 
 *    responses:
 *       200: 
 *          description: json data
 */
router.get('/comments/:id', async function (req, res) {
  const course_id = +req.params.id || 0;
  const ret = await courseService.getCommentsOfCourse(course_id);

  res.status(ret.code).json(ret.data);
})

//#endregion

//#region TienDung

/**
 * @openapi
 *
 * /course/10-latest:
 *  get:
 *      description: get 10 latest courses
 *      tags: [Course]
 *      parameters:
 *
 *      responses:
 *          200:
 *              description: json data
 */

router.get('/10-latest', async (req, res) => {
  const ret = await courseService.getLatestCourses(10);
  res.status(ret.code).json(ret.data);
});

/**
 * @openapi
 *
 * /course/10-latest:
 *  get:
 *      description: get 10 latest courses
 *      tags: [Course]
 *      parameters:
 *      responses:
 *          200:
 *              description: json data
 */

router.get('/10-mostview', async (req, res) => {
  const ret = await courseService.getMostViewCourses(10);
  res.status(ret.code).json(ret.data);
});

/**
 * @openapi
 *
 * /course/bestseller-category/{category_id}:
 *  get:
 *      description: get 5 best seller by category
 *      tags: [Course]
 *      parameters:
 *       - in: path
 *         name: category_id   # Note the name is the same as in the path
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *      responses:
 *          200:
 *              description: json data
 */

router.get('/bestseller-category/:category_id', async (req, res) => {
  const category_id = req.params.category_id;
  const ret = await courseService.getBestSellerCoursesByCategory(category_id, 5);
  res.status(ret.code).json(ret.data);
});

//#endregion

//#region QuangHai


/**
 * @openapi
 *
 * /course/mostbestseller:
 *   get:
 *     description: get detail course
 *     tags: [Course]
 *     responses:
 *       200:
 *         description: json data if sucess
 */
 router.get('/mostbestseller', async function (req, res) {
  const ret = await courseService.getBestSellerCourse();
  res.status(ret.code).json(ret.data);
});



/**
 * @openapi
 *
 * /course/category-mostbestseller:
 *   get:
 *     description: get detail course
 *     tags: [Course]
 *     responses:
 *       200:
 *         description: json data if sucess
 */
 router.get('/category-mostbestseller', async function (req, res) {
  const ret = await courseService.getBestSellerCategoies();
  res.status(ret.code).json(ret.data);
});


/**
 * @openapi
 *
 * /course/watch-course:
 *   post:
 *     description: get course learning
 *     tags: [Course]
 *     requestBody:
 *        content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              video_id:
 *                type: integer
 *                default: 1
 *            encoding:
 *     responses:
 *       200:
 *         description: json data if sucess
 */
 router.post('/watch-course', async function (req, res) {
  const course_id = req.body.course_id;

  if(course_id === null){
    return res.status(400).end();
  }
  const ret = await courseService.addViewsCourse(course_id);
  res.status(ret.code).end();
});


/**
 * @openapi
 *
 * /course/{id}:
 *   get:
 *     description: get detail course
 *     tags: [Course]
 *     parameters:
 *       - in: header
 *         name: x-access-token
 *         schema:
 *            type: string
 *       - in: path
 *         name: id   # Note the name is the same as in the path
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *     responses:
 *       200:
 *         description: json data if sucess
 */
router.get('/:id', async function (req, res) {
  const course_id = req.params.id || 0;
  const ret = await courseService.getCourseDetail(course_id);

  const accessToken = req.headers['x-access-token'];
  if(!accessToken){
      return res.status(ret.code).json(ret.data).end();
  }
  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_TOKEN);
    const student_id = decoded.userId;
    const student_course = await studentService.getHandleStudentCourse(student_id, course_id);

    if (student_course) {
      ret.data = { ...ret.data, ...student_course }
    }
  } catch (error) {
    if(accessToken){
      console.log(error);
    }
  }
  res.status(ret.code).json(ret.data);
});

//#endregion

module.exports = router;
