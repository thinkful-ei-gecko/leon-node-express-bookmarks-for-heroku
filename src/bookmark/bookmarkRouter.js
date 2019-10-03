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

  .post('/', bodyParser, (req,res) => {
    const {title, link, desc, rating } = req.body;
    if (!title || !link || !desc || !rating ) {
      logger.error('/POST not completed: missing data');
      res.status(400).send('Must include all the data: title, link, desc, and rating');
    }
    let bookmark = {
      title,
      link,
      desc,
      rating: parseInt(rating),
      id: uuidv4()
    };
    bookmarksData.push(bookmark);
    logger.info('/POST created a new bookmark');
    res.status(201).json(bookmark);
  })

  .delete('/', bodyParser,(req,res) => {
    const {id} = req.body;
    if (!bookmarksData.find(bookmark => bookmark.id === id)) {
      logger.error('/DELETE - Tried to delete an ID but could not find');
      res.status(400).json({error: 'could not find id'});
    }
    bookmarksData = bookmarksData.filter(bookmark => bookmark.id !== id);
    logger.info(`/DELETE - an item with id ${id}`);
    res.status(200).json({status: 'deleted'});
  });


module.exports = bookmarkRouter;