
const courseService = require('./course.service');
const categoryService = require('./category.service');
const { type } = require('../helper/type.chatbot.helper');
const currency = require('currency.js');

function startBot() {
  return {
    'attachment': {
      'type': 'template',
      'payload': {
        'template_type': 'generic',
        'elements': [{
          'title': 'Chào mừng bạn đến với Academy Chat Bot <3 ',
          'subtitle': 'Bạn muốn xem thông tin các khóa học bằng?',
          'buttons': [
            {
              'type': 'postback',
              'title': 'Danh mục',
              'payload': JSON.stringify({ type: type.categories }),
            },
            {
              'type': 'postback',
              'title': 'Tìm kiếm từ khóa',
              'payload': JSON.stringify({ type: type.search }),
            }
          ],
        }]
      }
    }
  };
}

async function getCourseDetail(id = 1) {
  const course = (await courseService.getCourseDetail(id)).data;
  if (course) {
    //
    let msg_chapters = ``;
    course.chapters.forEach(chapter => {
      msg_chapters += `\t# ${chapter.chapter_title}  (${chapter.sum_video_chapter} bài)\n`;
    })

    const price = currency(course.price, { separator: ',', symbol: '', precision: 0 }).format();

    //
    const msg = `8-) B-) 8-) ${course.title}\n`
      + `^_^ Học phí gốc: ${price} VND\n`
      + `:O Khuyến mãi: ${course.discount} %  \n`
      + `<(") Mô tả sơ lược: ${course.short_description}\n`
      + `(^^^) Thông tin giảng viên: \n`
      + `\t :) Họ tên: ${course.lecturer_name}\n`
      + `\t ^_^ Sơ lược: ${course.lecturer_headline}\n`
      + `(y) Đánh giá:  ${course.num_rating} \n`
      + `O:) Số lượt đánh giá:  ${course.num_feedback}\n`
      + `:* Số học viên đăng ký:  ${course.num_register} \n`
      + `<(") Last updated: ${course.last_update}\n`
      + `:|] Đề cương khóa học \n`
      + msg_chapters

    return {'text': msg };
  }
  return { 'text': "Oh! Bot xin lỗi bạn :'(  ,Thông tin này chưa được cập nhật, bạn có thể thử lại sau nhé" }
}

async function getAllCategory() {
  const res = await categoryService.getAllCategory();
  if (res.data) {
    const data = res.data;
    let elements = [];
    let temp = [];
    for (let i = 0; i < data.length; i++) {
      temp.push({
        "type": "postback",
        "title": data[i].category_name,
        "payload": JSON.stringify({
          type: type.course_by_category,
          msg: data[i].id
        })
      })
      if (temp.length === 3) {
        elements.push({
          'title': 'Danh sách các danh mục',
          'buttons': temp
        })
        temp = [];
      }
    }

    if (temp.length > 0) {
      elements.push({
        'title': 'Danh sách các danh mục',
        'buttons': temp
      })
    }

    return {
      'attachment': {
        'type': 'template',
        'payload': {
          'template_type': 'generic',
          'elements': elements
        }
      }
    };
  }
  return { 'text': "Oh! Bot xin lỗi bạn :'( ,Thông tin này chưa được cập nhật, bạn có thể thử lại sau nhé" }
}

async function getCourseByCategory(category_id) {
  const res = await courseService.getCourseByCategory(category_id);
  if (res.data) {
    let elements = [];
    
    res.data.forEach(course => {
      const price = currency(course.price, { separator: ',', symbol: '', precision: 0 }).format();
      const object = {
        'title': course.title,
        'subtitle': `${price} VND, ${course.discount} %`,
        'image_url': process.env.URL + '/common/media/image/' + course.course_img_source,
        'buttons': [{
          'type': 'postback',
          'title': 'Chi tiết',
          'payload': JSON.stringify({
            type: type.course_detail,
            msg: course.id
          })
        }]
      }
      elements.push(object);
    });

    return {
      'attachment': {
        'type': 'template',
        'payload': {
          'template_type': 'generic',
          'elements': elements
        }
      }
    };
  }
  return { 'text': "Oh! Bot xin lỗi bạn :'( , Thông tin này chưa được cập nhật, bạn có thể thử lại sau nhé" }
}

async function searchCourse(msg){
  const regex = /^search\//g;
  if(msg.match(regex)){
    const res = await courseService.findCourse(msg.substr(7));

    if(res.data && res.data.courses.length > 0){
      let elements = [];

      res.data.courses.forEach(course => {
        const price = currency(course.price, { separator: ',', symbol: '', precision: 0 }).format();
        const object = {
          'title': course.title,
          'subtitle': `${price} VND, ${course.discount}%`,
          'image_url': process.env.URL + '/common/media/image/' + course.image.img_source,
          'buttons': [{
            'type': 'postback',
            'title': 'Chi tiết',
            'payload': JSON.stringify({
              type: type.course_detail,
              msg: course.id
            })
          }]
        }
        elements.push(object);
      });
  
      return {
        'attachment': {
          'type': 'template',
          'payload': {
            'template_type': 'generic',
            'elements': elements
          }
        }
      };
    }
    return {'text': "Oh! Xin lỗi bạn :'( , Bot không tìm thấy thông tin bạn cần\n Bạn vui lòng thử lại sau nhé <3"};
  }
  return {'text': 'Oh! Mình chưa hiểu lắm ^_^ , bạn có thể thử hỏi câu khác hoặc gõ "start" để bot hướng dẫn thêm nè :*'};
}

function guideSearch(){
  const msg = `Bot hướng dẫn bạn tìm kiếm theo cú pháp sau nè ^_^ ^_^ \n`
    + `\tsearch/{từ khóa cần tìm kiếm} \n`
    + `\tví dụ: search/javascript\n`
  return {'text': msg}
}

module.exports = {
  getCourseDetail, getAllCategory, startBot, getCourseByCategory, searchCourse, guideSearch
};
