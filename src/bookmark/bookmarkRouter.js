const express = require('express');
const bookmarkRouter = express.Router();
const logger = require('../logger.js');
const bodyParser = express.json();
const xss = require('xss');
let bookmarksService = require('./bookmarksService');

let sanitizeBookmark = (bookmark) => (
  {
    id: bookmark.id,
    title: xss(bookmark.title),
    url: xss(bookmark.url),
    description: xss(bookmark.description),
    rating: xss(bookmark.rating)
  }
);

bookmarkRouter
  .route('/')
  .get((req,res,next) => {
    logger.info('/GET command reached');
    let db = req.app.get('db');
    bookmarksService.getBookmarks(db)
      .then(bookmarks => {
        res.json(bookmarks.map(bookmark=> sanitizeBookmark(bookmark)));
      })
      .catch(next);
  })
  .post(bodyParser, (req,res,next) => {
    const {title, url, rating } = req.body;
    let bookmark = { title, url, rating}

    for (const [key, value] of Object.entries(bookmark)) {
      if (value === null || !value) {
        logger.error(`/POST not completed: missing data ${value}`);
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });
      }
    }
    let newNumber = parseInt(rating);
    if (typeof newNumber !== 'number' || !newNumber || newNumber < 1 || newNumber > 5) {
      logger.error('/POST not completed: rating was not correct data');
      return res.status(400).send('The rating must be a number between 1 and 5');
    }
    logger.info('/POST created a new bookmark');
    bookmarksService.addBookmark(req.app.get('db'),bookmark)
      .then(bookmarkReturned => 
        res
          .status(201)
          .location(`/bookmarks/${bookmarkReturned.id}`)
          .json(sanitizeBookmark(bookmarkReturned)))
      .catch(next);
  });


bookmarkRouter
  .route('/:id')
  .all((req, res, next) => {
    bookmarksService.findById(
      req.app.get('db'),
      req.params.id
    )
      .then(bookmark => {
        if (!bookmark) {
          return res.status(404).json({
            error: { message: `Bookmark doesn't exist` }
          });
        }
        res.bookmark = bookmark; // save the article for the next middleware
        next(); // don't forget to call next so the next middleware happens!
      })
      .catch(next);
  })
  .get((req,res,next) => {
    let {id} = req.params;
    let db = req.app.get('db');
    bookmarksService.findById(db,id)
      .then(bookmark => {
        logger.info('/GET :id found an ID');
        res.status(200).json(sanitizeBookmark(bookmark));
      })
      .catch(next);
  })

  .delete(bodyParser,(req,res,next) => {
    let bId = req.params.id;

    bookmarksService.deleteBookmark(req.app.get('db'),bId)
      .then(() => res.status(204).end())
      .catch(next);
    logger.info(`/DELETE - an item with id ${bId}`);
    res.status(204).json({status: 'deleted'});
    logger.error('/DELETE - Tried to delete an ID but could not find');
  });

module.exports = bookmarkRouter;