const router = require('express').Router();
const categoryService = require("../../services/category.service")

router.get('/', async(req,res)=>{
  const result = await categoryService.getExpandedInfo();

  res.status(result.code).json(result);
})

router.patch('/', async(req, res)=>{
  const result = await categoryService.editCategoryItem(req.body);
  res.status(result.code).json(result);
})

router.post('/', async(req, res)=>{
  const result = await categoryService.createCategoryItem(req.body);

  res.status(result.code).json(result);
})

router.delete('/', async(req, res)=>{
  const result = await categoryService.removeItemById(req.headers.category_id);
  res.status(result.code).json(result);
})
module.exports = router;