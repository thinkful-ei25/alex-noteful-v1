'use strict';

// Load array of notes
const data = require('./db/notes');
const { PORT } = require('./middleware/config');
const { requestLogger } = require('./middleware/logger');

console.log('Hello Noteful!');

const express = require('express');
const app = express();

app.use(requestLogger);
app.use(express.static('public'));

app.get('/api/notes/?',  (req, res) => {
  let list = data;
  let searchTerm = req.query.searchTerm;
  if (searchTerm) {
    list = data.filter(item => item.title.includes(searchTerm));
  }
  res.json(list);
});

app.get('/api/notes/:id', (req, res) =>{
  const id = parseInt(req.params.id, 10);
  res.json(data.find(item => item.id === id));
});


app.use(function (req, res, next){
  var err = new Error('Not Found');
  err.status = 404;
  res.status(404).json({ message: 'Not Found'});
});

app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: err
  });
});

app.listen(PORT, () => {
  console.info(`Server listening on 8080`);
}).on('error', err => {
  console.error(err);
});
