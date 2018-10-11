/* global $ noteful api store */
'use strict';

$(document).ready(function () {
  noteful.bindEventListeners();

  api.search({}) 
    .then(response => {
      if (response) {
        store.notes = response;
        noteful.render(); 
      }
    })
    .catch(err => {
      console.err(err);
    });

});