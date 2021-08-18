const router = require('express').Router();
const courseService = require('../../services/course.service');

//#region TienDung

/**
 * @openapi
 * 
 * /lecturer/course:
 *   post:
 *     description: add a course
 *     tags: [Course]
 *     parameters:
 *       - in: path
 *     responses:
 *       201:
 *         description: successfully created course
 */ 
 const schema = require('../../schema/course.json');

 router.post('/', require('../../middlewares/validate.mdw')(schema), async (req, res) => {
     const newCourse = req.body;
     const ret = await courseService.insertCourse(newCourse);
     res.status(ret.code).json(ret.data);
 })

 router.patch('/:id', async (req, res) => {
    const id = req.params.id || 0;
    const newCourse = req.body;
    const ret = await courseService.updateCourseByCourseId(newCourse, id);
    res.status(ret.code).json(ret.data);
 })

 router.get('/:id', async (req, res) => {
     const lecturer_id = req.params.id || 0;
     const ret = await courseService.getCoursesByLecturerId(lecturer_id);
     res.status(ret.code).json(ret.data);
 })

 router.delete('/:id', async (req, res) => {
    const id = req.params.id || 0;
    if(id === 0) {
        return res.status(204).end();
    }

    const ret = await courseService.deleteById(id);
    return res.status(ret.code).json({id: id});
 })
 
 //#endregion

 module.exports = router;