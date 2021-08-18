const db = require('../utils/db');

const tableName = 'image';
module.exports = {
  add(image) {
    return db(tableName).insert(image);
  },
  async getImageById(image_id) {
    const image = await db(tableName).where('id', image_id);
    return image.length > 0 ? image[0] : null;
  },

  async deleteById(img_id) {
    const result = await db(tableName).where('id', img_id).del();

    return result;
  },
};
