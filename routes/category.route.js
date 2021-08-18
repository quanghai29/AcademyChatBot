const router = require('express').Router();
const categoryService = require('../services/category.service');

//#region QuangHai
/**
 * @openapi
 * 
 * /category:
 *   get:
 *     description: get all category
 *     tags: [Category]
 *     responses:
 *       200:
 *         description: json data if sucess
 */
 router.get('/', async function (req, res) {
    const ret = await categoryService.getExpandedInfo();
    res.status(ret.code).json(ret.categories);
})


/**
 * @openapi
 *
 * /category/mostRegisterOfWeek:
 *   get:
 *     description: get categories most register of week
 *     tags: [Category]
 *     responses:
 *       200:
 *         description: json data if sucess
 */
 router.get('/mostRegisterOfWeek', async function (req, res) {
    const ret = await categoryService.getMostRegister({duration: 7, amount: 2});
    res.status(ret.code).json(ret.data);
  });
  
//#endregion

//#region Mai Linh Đồng
/**
 * @openapi
 * 
 *  /category/search:
 *    post:
 *       description: full text search on category table
 *       tags: [Category]
 *       requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema: {}
 *                  example: 
 *                      text_search: value
 *       
 *       responses:
 *          200:
 *              description: json data
 *          400: 
 *              description: bad request in case have not any text is sent to server
 */
router.post('/search', async (req, res)=>{
  const text = req.body.text_search || '';
  const ret = await categoryService.findCategory(text);

  res.status(ret.code).json(ret.data);
})
//#endregion
module.exports = router;
