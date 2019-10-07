const bookmarksService = {

  getBookmarks(db) {
    return db('bookmarks').select('*');
  },
  findById(db,id) {
    return db('bookmarks').where('id',id).first();
  },
  addBookmark(db, newItem) {
    return db.insert(newItem).into('bookmarks')
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },
  deleteBookmark(db,id) {
    return db('bookmarks').where('id',id).delete();
  }

};

module.exports = bookmarksService;