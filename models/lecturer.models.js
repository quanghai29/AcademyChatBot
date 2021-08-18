const db = require('../utils/db');

const table_name = 'lecturer';
module.exports = {
  async getLecturerById(id) {
    const lecturer = await db(table_name).where('id', id);
    if (lecturer.length === 0) {
      return null;
    }

    return lecturer[0];
  },

  async getLecturers() {
    const result = await db.select(
      'account.id', 'account.username', 'account.email',
      'account.create_date', 'account_detail.creator', 'account.enable'
    ).from('account').leftJoin('account_detail', 'account.id',
      'account_detail.account_id').where('account.account_role', 2);

    return result;
  },

  async removeItemById(id) {
    const resultOnAccount = await db('account')
      .where('id', id)
      .del();
    const resultOnAccDetail = await db('account_detail')
      .where('account_id', id)
      .del();

    const result = [
      resultOnAccount,
      resultOnAccDetail
    ]
    return result;
  },

  async blockById(id){
    const result = await db('account').where('id', id)
    .update({enable: false});

    return result
  },

  async getLecturerByUsername(username) {
    const lecturer = await db('account').where({
      username: username
    })

    return lecturer.length > 0 ? lecturer[0] : null;
  },

  async addLecturer(data) {
    const account = await db('account').insert(data);
    return account.length > 0 ? account[0] : null;
  }
};
