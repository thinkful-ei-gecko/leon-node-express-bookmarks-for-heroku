const app = require('../src/app');
const fixtures = require('./bookmarks.fixtures');
const {DB_URL_TEST} = require('../src/config');
const knex = require('knex');
const BookmarksService = require('../src/bookmark/bookmarksService');

describe('Bookmarks Endpoints', () => {

  let db;

  before(() => {
    db = knex({
      client: 'pg',
      connection: DB_URL_TEST
    });
    app.set('db',db);
  });

  before(() => db('bookmarks').truncate());
  after(() => db.destroy());

  context('/GET request',() => {

    beforeEach(() => db.insert(fixtures).into('bookmarks'));
    afterEach(() => db('bookmarks').truncate());

    it(`GET '/bookmarks' provides all the bookmarks`,() => {
      return supertest(app)
        .get('/bookmarks')
        .set({Authorization:'Bearer 7abf6605-f5f9-454f-8972-1ec4079180ca'})
        .expect(200, fixtures);
    });

    it(`GET '/bookmarks/:bookmark_id' provides the appropriate bookmark`,() => {
      let fakeId = 2;
      let expected = fixtures[fakeId -1];
      return supertest(app)
        .get(`/bookmarks/${fakeId}`)
        .set({Authorization:'Bearer 7abf6605-f5f9-454f-8972-1ec4079180ca'})
        .expect(200,expected);

    });
  });

  context('/POST request', () => {


    it(`POST '/bookmarks' posts a bookmark to the 'bookmarks' table and returns it`, () => {
      let bookmark = {
        title: 'This is the bookmark title here',
        url: 'http://fakeurl.com',
        rating: 2
      };

      return supertest(app)
        .post('/bookmarks')
        .set({Authorization:'Bearer 7abf6605-f5f9-454f-8972-1ec4079180ca'})
        .send(bookmark)
        .expect(201)
        .expect(res => {
          expect(res.body.title).to.eql(bookmark.title);
          expect(res.body.url).to.eql(bookmark.url);
          expect(res.body.rating).to.eql(bookmark.rating);
          expect(res.body).to.have.property('id');
          expect(res.headers.location).to.eql(`/bookmarks/${res.body.id}`);
        })
        .then(postRes => {
          return supertest(app)
            .get(`/bookmarks/${postRes.body.id}`)
            .set({Authorization:'Bearer 7abf6605-f5f9-454f-8972-1ec4079180ca'})
            .expect(postRes.body);
        });
    });
  });

  context.only('/DELETE request', () => {

    context('Given there is a bookmark to delete', () => {
      beforeEach(() => db.insert(fixtures).into('bookmarks'));
      afterEach(() => db('bookmarks').truncate());

      it('DELETE bookmarks/id deletes the bookmark',() => {
        let fakeId = 2;
        let expectedReturn = fixtures.filter(bookmark => bookmark.id !== fakeId);

        return supertest(app)
          .delete(`/bookmarks/${fakeId}`)
          .set({Authorization:'Bearer 7abf6605-f5f9-454f-8972-1ec4079180ca'})
          .expect(204)
          .then(() => {
            return supertest(app)
              .get('/bookmarks')
              .set({Authorization:'Bearer 7abf6605-f5f9-454f-8972-1ec4079180ca'})
              .expect(200)
              .expect(res => expect(res).to.eql(expectedReturn));
          });
      });
    });

    context('Given there are no bookmarks',() => {

      it('responds with a 404', () => {
        let fakeId = 88;
        return supertest(app)
          .delete(`/bookmarks/${fakeId}`)
          .set({Authorization:'Bearer 7abf6605-f5f9-454f-8972-1ec4079180ca'})
          .expect(404, { error: { message: `Article doesn't exist` } });
      });
    });
  });
});