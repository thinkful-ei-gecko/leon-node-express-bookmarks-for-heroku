const uuidv4 = require('uuid/v4');

let bookmarksData = 
[
  {
    title: 'X1',
    id: uuidv4(),
    link: 'http://flyhigh.com',
    desc: 'X1 - FLY HIGH',
    rating: 4
  },
  {
    title: 'Loona',
    id: uuidv4(),
    link: 'http://loonatheworld.com',
    desc: '12 girlz',
    rating: 5
  }
];

module.exports = bookmarksData;