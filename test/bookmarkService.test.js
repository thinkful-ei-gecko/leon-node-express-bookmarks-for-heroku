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

    afterEach(() => db('bookmarks').truncate());
    
    it('getBookmarks() returns an empty array from the bookmarks table',() => {
      bookmarksService.getBookmarks(db)
        .then(bookmarks => {
          expect(bookmarks).to.eql([]);
        });

    });

    it('addBookmark() adds a bookmark to the bookmarks table', () => {
      let bookmark = {
        title: 'This is the new title',
        url: 'http://testurl.com',
        rating: 3,
        id: 7,
        description: 'This is a description!'
      };
      bookmarksService.addBookmark(db,bookmark)
        .then(bookmark2 => {
          console.log(bookmark2);
          expect(bookmark).to.eql(bookmark2);
        });

    });
  });
});