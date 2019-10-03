const app = require('../src/app');
const fixtures = require('./bookmarks.fixtures');
const {DB_URL_TEST} = require('../src/config');
const knex = require('knex');

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
  // it('GET / responds with 200 containing "Hello, world!"', () => {
  //   return supertest(app)
  //     .get('/')
  //     .expect(200, 'Hello, world!');
  // });
});