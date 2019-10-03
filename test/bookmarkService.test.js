let bookmarksService = require('../src/bookmark/bookmarksService');
let knex = require('knex');
let fixtures = require('./bookmarks.fixtures');


describe('Bookmarks App',() => {
  let db;
  before(() => {
    db = knex({
      client: 'pg',
      connection: process.env.DB_URL_TEST
    });
  });

  after('end connection', () => db.destroy());

  describe('There is data in the bookmarks table', () => {
    beforeEach(() => db.insert(fixtures).into('bookmarks'));
    afterEach(() => db('bookmarks').truncate());

    it('getBookmarks() returns data in the bookmarks table', () => {
      bookmarksService.getBookmarks(db)
        .then(bookmarks => {
          expect(bookmarks).to.eql(fixtures);
        });
    });

    it('findById() returns a bookmark by its id',() => {
      let testId = 2;
      let expected = fixtures[testId-1];
      bookmarksService.findById(db,testId)
        .then(bookmark => {
          expect(expected).to.eql(bookmark);
        });
    });
  });

  describe('There is no data in the bookmarks table',() => {
    
    it('getBookmarks() returns an empty array from the bookmarks table',() => {
      bookmarksService.getBookmarks(db)
        .then(bookmarks => {
          expect(bookmarks).to.eql([]);
        });

    });
  });

});