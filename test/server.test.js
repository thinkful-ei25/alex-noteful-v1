'use strict';

const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Express static', function (){
  it('GET request "/" should return the index page', function () {
    return chai.request(app)
      .get('/')
      .then(function (res) {
        expect(res).to.exist;
        expect(res).to.have.status(200);
        expect(res).to.be.html;
      });
  });
});

describe('404 handler', function(){
  it('should respond with a 404 when given a bad path', function (){
    return chai.request(app)
      .get('/DOES/NOT/EXIST')
      .then(function (res){
        expect(res).to.have.status(404);
      });
  });
});

describe('GET/api/notes', function() {
  it('should return the 10 default notes as an array', function () {
    return chai.request(app)
      .get('/api/notes')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('array');
        expect(res.body.length).to.be.at.least(9);
      });
  });

  it('should return an array of objects with "id", "title", "content"', function(){
    return chai.request(app)
      .get('/api/notes')
      .then(function (res) {
        const expectedKeys = ['id', 'title', 'content'];
        res.body.forEach(function(item){
          expect(item).to.be.a('object');
          expect(item).to.include.keys(expectedKeys);
        });
      });
  });
  
  it('should return correct search results for a valid query', function(){
    let searchTerm = 'cats';
    return chai.request(app)
      .get(`/api/notes/?searchTerm=${searchTerm}`)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        res.body.forEach(function(item) {
          expect(item.title).to.include.string(`${searchTerm}`);
        });
      });
  });

  it('should return an empty array for an incorrect query', function(){
    let searchTerm = 'eggs';
    return chai.request(app)
      .get(`/api/notes/?searchTerm=${searchTerm}`)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.be.a('array').that.is.empty;
      });
  });
});

describe('POST/api/notes', function(){
  it('should create and return a new item with location header when provided valid data', function(){
    const newItem = { title:"catstuff", content:"morecatstuff" };
    return chai.request(app)
      .post('/api/notes')
      .send(newItem)
      .then(function(res){
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.include.keys('title', 'content');
        expect(res.body.id).to.not.equal(null);
        expect(res.body).to.deep.equal(
          Object.assign(newItem, { id: res.body.id })
        );
      });
  });

  it('should return an object with message property "Missing title in request body" when missing "title" field', function(){
    const newItem = {  content:"morecatstuff" };
    return chai.request(app)
      .post('/api/notes')
      .send(newItem)
      .then(function(res){
        expect(res).to.have.status(400);
        expect(res.body.message).to.be.string('Missing `title` in request body');
      });
  });
});

describe('PUT/api/notes/:id', function(){
  it('should update and return a note object when given valid data', function(){
    const updateItem = { title:'othercats', content:'moreothercatastuff' };
    return chai.request(app)
      .get('/api/notes')
      .then(function(res){
        updateItem.id = res.body[0].id;
        return chai.request(app)
          .put(`/api/notes/${updateItem.id}`)
          .send(updateItem);
      })
      .then(function(res){
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res).to.be.a("object");
        expect(res.body).to.deep.equal(updateItem);
      });

  });

  it('should respond with a 404 for an invalid id', function(){
    const updateItem = { id:9999, title:'othercats', content:'moreothercatastuff' };
    return chai.request(app)
      .put(`/api/notes/${updateItem.id}`)
      .send(updateItem)
      .then(function(res){
        expect(res).to.have.status(404);
      });
  });

  it('should return an object with a message property "Missing `title` in request body" when missing "title" field', function(){
    const updateItem = {id:'1010', title: '', content:'moreothercatastuff' };
    return chai.request(app)
      .get('/api/notes')
      .then(function(res){
        updateItem.id = res.body[0].id;
        return chai.request(app)
          .put(`/api/notes/${updateItem.id}`)
          .send(updateItem);
      })
      .then(function(res){
        expect(res).to.have.status(400);
        expect(res.body.message).to.be.string('Missing `title` in request body');
      });
  });


});

describe('DELETE/api/notes/:id', function(){
  it('should delete item by id', function(){
    return chai.request(app)
      .get('/api/notes/')
      .then(function(res){
        return chai.request(app).delete(`/api/notes/${res.body[0].id}`);
      })
      .then(function(res){
        expect(res).to.have.status(204);
      });
  });
});