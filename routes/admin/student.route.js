const router = require('express').Router();
const studentService = require('../../services/student.service');

router.get('/', async(req, res)=>{
  const resData = await studentService.getStudents();
  res.status(resData.code).json(resData.data);
})

router.patch('/:id', async (req, res)=>{
  const id = req.params.id || 0;
  const resData = await studentService.blockItemById(id);

  res.status(resData.code).json(resData.data);
})
module.exports = router;