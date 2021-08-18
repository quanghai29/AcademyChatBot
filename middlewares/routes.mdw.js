const swaggerUI = require('swagger-ui-express');
const {openapiSpecification} = require('../utils/swagger');
const auth = require('./auth.mdw');
const {ROLE_STUDENT, ROLE_LECTURER, ROLE_ADMIN} = require('../helper/common.helper');

module.exports = function (app) {
  // link default
  // app.get('/', (req, res) => {
  //   res.json({
  //     message: 'Hello from Online Course API',
  //   });
  // });

  // link api documents
  app.use("/api-docs",
    swaggerUI.serve,
    swaggerUI.setup(openapiSpecification, { explorer: true }
  ));
  //routers path here

  // route guest
  app.use('/auth', require('../routes/auth.route'));
  app.use('/course', require('../routes/course.route'));
  app.use('/common/media', require('../routes/common/media.route'));

  // app.use('/lecturer/course', require('../routes/lecturer/course.route'));
  // app.use('/lecturer/chapter', require('../routes/lecturer/chapter.route'));
  // app.use('/lecturer/image', require('../routes/lecturer/image.route'));
  // app.use('/lecturer/video', require('../routes/lecturer/video.route'));
  app.use('/lecturer', require('../routes/lecturer.route'));
  
  app.use('/category',require('../routes/category.route'));
  app.use('/account', require('../routes/account.route'));

  //route lecturer
  app.use('/lecturer/course', auth(ROLE_LECTURER), require('../routes/lecturer/course.route'));
  app.use('/lecturer/chapter', auth(ROLE_LECTURER), require('../routes/lecturer/chapter.route'));
  app.use('/lecturer/image', auth(ROLE_LECTURER),require('../routes/lecturer/image.route'));
  app.use('/lecturer/video', auth(ROLE_LECTURER), require('../routes/lecturer/video.route'));

  //route student
  app.use('/student/watchlist',  auth(ROLE_STUDENT),require('../routes/student/watchlist.route'));
  app.use('/student/course',  auth(ROLE_STUDENT), require('../routes/student/course.route'));
  app.use('/student', auth(ROLE_STUDENT), require('../routes/student/course.route'));

  //route admin
  app.use('/admin/category', auth(ROLE_ADMIN),require('../routes/admin/category.route'));
  app.use('/admin/student',  auth(ROLE_ADMIN),  require('../routes/admin/student.route'));
  app.use('/admin/lecturer',  auth(ROLE_ADMIN), require('../routes/admin/lecturer.route'));
  app.use('/admin/course', auth(ROLE_ADMIN), require('../routes/admin/course.route'));
};
