const router = require('express').Router();
const lecturerService = require('../services/lecturer.service');

//#region TienDung

/**
 * @openapi
 *
 * /lecturer/:id:
 *  get:
 *      description: get lecturer by id
 *      tags: [Lecturer]
 *      parameters:
 *
 *      responses:
 *          200:
 *              description: json data
 */

router.get('/:id', async (req, res) => {
    const id = req.params.id || 0;
    const ret = await lecturerService.getLecturerById(id);
    res.status(ret.code).json(ret.data);
})
//#endregion

module.exports = router;