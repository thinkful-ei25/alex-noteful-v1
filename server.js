'use strict';

// Load array of notes
const data = require('./db/notes');
const simDB = require('./db/simDB');
const notes = simDB.initialize(data);

const { PORT } = require('./middleware/config');
const { requestLogger } = require('./middleware/logger');

console.log('Hello Noteful!');

const express = require('express');
const app = express();

app.use(requestLogger);
app.use(express.static('public'));

app.get('/api/notes/',  (req, res, next) => {
  const { searchTerm } = req.query;

  notes.filter(searchTerm, (err, list) => {
    if (err) {
      return next(err); // goes to error handler
    }
    res.json(list); // responds with filtered array
  });
});


app.get('/api/notes/:id', (req, res) =>{
  const id = parseInt(req.params.id, 10);

  notes.find(id, (err, list) => {
    if (err) {
      return next(err);
    }
    res.json(list);
  });
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
