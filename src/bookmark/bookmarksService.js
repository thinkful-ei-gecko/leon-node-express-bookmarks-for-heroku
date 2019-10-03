const bookmarksService = {

  getBookmarks(db) {
    return db('bookmarks').select('*');
  },
  findById(db,id) {
    return db('bookmarks').where('id',id).first();
  }

};

module.exports = bookmarksService;