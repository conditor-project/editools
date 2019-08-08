'use strict';
const { Readable } = require('stream');
const querystring = require('querystring');
const axios = require('axios');

class ApiHalStream extends Readable {
  constructor (options, endpoint = 'search') {
    super({ objectMode: true });
    const defaultOptions = {
      q: '*',
      rows: 1000,
      sort: 'docid asc',
      cursorMark: '*'
    };
    this.reading = false;
    this.counter = 0;
    this.urlBase = `http://api.archives-ouvertes.fr/${endpoint}`;
    this.params = Object.assign(defaultOptions, options);
  }

  _read () {
    if (this.reading) return false;
    this.reading = true;
    const self = this;
    function getMoreUntilDone (url) {
      axios.get(url).then(response => {
        response.data.response.docs.map((doc) => {
          self.counter++;
          self.push(doc);
        });
        if (self.counter < response.data.response.numFound) {
          self.params.cursorMark = response.data.nextCursorMark;
          const nextUrl = `${self.urlBase}/?${querystring.stringify(self.params)}`;
          getMoreUntilDone(nextUrl);
        } else {
          self.push(null);
          self.counter = 0;
          self.reading = false;
        }
      }).catch(error => {
        self.emit('error', error);
      });
    }
    getMoreUntilDone(`${this.urlBase}/?${querystring.stringify(this.params)}`);
  }
}

module.exports = ApiHalStream;
