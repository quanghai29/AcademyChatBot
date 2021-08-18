const router = require('express').Router();
const courseService = require('../../services/course.service');

router.get('/', async (req, res)=>{
  const result = await courseService.getCoursesForAdmin();

  res.status(result.code).json(result.data);
})

router.delete('/', async(req, res)=>{
  const course_id = req.headers['course_id'];
  const result = await courseService.deleteById(course_id);

  res.status(result.code).json(result.message);
})
module.exports = router;