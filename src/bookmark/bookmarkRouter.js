const express = require('express');
const bookmarkRouter = express.Router();
const uuidv4 = require('uuid/v4');
let bookmarksData = require('../store');
const logger = require('../logger.js');
const bodyParser = express.json();
let bookmarksService = require('./bookmarksService');


bookmarkRouter

  .get('/', (req,res,next) => {
    logger.info('/GET command reached');
    let db = req.app.get('db');
    bookmarksService.getBookmarks(db)
      .then(bookmarks => {
        res.json(bookmarks);
      })
      .catch(next);
  })

  .get('/:id', (req,res,next) => {
    let {id} = req.params;
    let db = req.app.get('db');
    bookmarksService.findById(db,id)
      .then(bookmark => {
        logger.info('/GET :id found an ID');
        res.status(200).json(bookmark);
      })
      .catch(next);
    // logger.error('/GET :id could not find ID');
    // res.status(400).json({error: 'Cannot find that ID'});
  })

  .post('/', bodyParser, (req,res,next) => {
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
          .json(bookmarkReturned))
      .catch(next);
  })

  .delete('/', bodyParser,(req,res) => {
    const {id} = req.body;

    bookmarksService.findById(req.app.get('db'),id)
      .then(returned)
    logger.info(`/DELETE - an item with id ${id}`);
    res.status(204).json({status: 'deleted'});
  });
  logger.error('/DELETE - Tried to delete an ID but could not find');

module.exports = bookmarkRouter;