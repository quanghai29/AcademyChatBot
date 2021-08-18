
const db = require('../utils/db');

const table_name = 'account';
module.exports = {
  addAccount(account) {
    return db(table_name).insert(account);
  },

  addAccountDetail(data){
    return db('account_detail').insert(data);
  },

  async getAccountById(id) {
    const result = await db(table_name).where('id', id);
    return result.length > 0 ? result[0] : null;
  },

  updatePasswordAccount(password, id) {
    return db(table_name).where('id', id).update({password: password});
  },

  updateAccountImage(account_id, img_profile) {
    return db('account_detail').where('account_id', account_id).update({ img_profile: img_profile });
  },

  async getSingleAccountByEmail(email) {
    const result = await db(table_name).where('email', email);
    return result.length > 0 ? result[0] : null;
  },

  async getSingleAccountByUsername(username) {
    const result = await db(table_name).where('username', username);
    return result.length > 0 ? result[0] : null;
  },

  updateRefreshToken(id, refreshToken) {
    return db(table_name).where('id', id).update('rfToken', refreshToken);
  },

  async isValidRefreshToken(id, refreshToken) {
    const list = await db(table_name)
      .where('id', id)
      .andWhere('rfToken', refreshToken);
    if (list.length > 0) {
      return true;
    }

    return false;
  },

  async activeEmail(accountId) {
    return await db(table_name).where('id', accountId).update('confirm_email', true);
  },

  async getAccountDetail(account_id) {
    const accountDetail = await db
                    .select('ad.*', 'a.email', 'i.img_source')
                    .from('account as a')
                    .where('a.id', account_id)
                    .leftJoin('account_detail as ad', 'ad.account_id', 'a.id')
                    .leftJoin('image as i', 'i.id', 'ad.img_profile');
    return accountDetail.length ? accountDetail[0] : null;
  },

  updateDetailAccountInfo( newAccount, account_id) {
    return db('account_detail').where('account_id', account_id).update(newAccount);
  },

  async getMoreInfoAccount(account_id){
    const info = await db
      .select(
        'ad.fullname',
        'image.img_source'
      )
      .from('account_detail as ad')
      .leftJoin('image', 'image.id', 'ad.img_profile')
      .where('account_id', account_id)
      
    if(info.length > 0)
        return info[0];
    return null;
  }
};
