require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const bookmarkRouter = require('./bookmark/bookmarkRouter');
let bookmarksData = require('./store');

const app = express();

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

//To turn this off, comment this section out. Requires Bearer Token
app.use(function validateAPIKey(req,res,next) {
  let API_KEY = process.env.API_KEY;
  let userKey = req.get('Authorization');

  if (!userKey || API_KEY !== userKey.split(' ')[1]) {
    return res.status(401).send('Not authorized');
  }
  next();
});

app.use('/bookmarks',bookmarkRouter);

app.use((req,res,next) => {
  const err = new Error('Not found');
  err.status = 404;
  return next(err);
});

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: {message: 'server error'} };
  } else {
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app