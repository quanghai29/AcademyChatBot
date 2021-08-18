const db = require("../utils/db");

const table_name = "category";
module.exports = {
  all() {
    return db(table_name);
  },

  async single(id) {
    const category = await db(table_name).where("id", id);
    if (category.length === 0) {
      return null;
    }

    return category[0];
  },

  async singleByName(category_name) {
    const category = await db(table_name).where("category_name", category_name);
    if (category.length === 0) {
      return null;
    }

    return category[0];
  },

  add(category) {
    return db(table_name).insert(category);
  },

  //{duration: số lượng ngày, amount: số dòng lấy}
  async getMostRegister({ duration, amount }) {
    const sql = `` +
      `SELECT sc.register_date, ct.*, count(*) as register 
      FROM online_academy.student_course as sc 
      inner join online_academy.course as c on sc.course_id = c.id
      inner join online_academy.category as ct on c.category_id = ct.id 
      where sc.register_date between (now() - interval ${duration} day) and now()
      group by c.category_id
      order by register, sc.register_date desc limit ${amount}`
    const categories = await db.raw(sql);
    if (categories.length > 0)
      return categories[0];
    return null;
  },

  async fullTextSearchCategory(text) {
    const sql = `SELECT *, MATCH (category_name) 
    AGAINST ('${text}') as score
    FROM category WHERE MATCH (category_name) 
    AGAINST ('${text}') > 0 
    ORDER BY score DESC`;
    const categories = await db.raw(sql);

    if (categories.length === 0) {
      return null;
    }

    return categories[0];
  },

  async getExpandedInfo() {
    const categories = await db.raw(
      `SELECT *, COUNT(course_id) AS amount_course FROM(
        SELECT category.id, category.category_name,
        category.last_update, course.id as course_id 
        FROM category LEFT JOIN course 
        ON category.id = course.category_id ) AS temp
        GROUP BY temp.id
      `
    )

    return categories[0];
  },

  async editCategoryItem(data) {
    const category = await db.raw(
      `UPDATE category SET category_name = '${data.category_name}',
        last_update = now()
        WHERE id = ${data.id}
      `
    )

    return category[0];
  },

  async removeItemById(id) {
    const result = await db(table_name)
      .where('id', id)
      .del();
    return result;
  }
};

