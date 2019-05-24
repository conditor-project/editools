'use strict';
const { Readable } = require('stream');
const querystring = require('querystring');
const axios = require('axios');

class ApiHalStream extends Readable {
  constructor (
    options = {
      q: 'structCountry_s:fr',
      fq: 'producedDateY_i:2014',
      rows: 1000,
      sort: 'docid asc',
      cursorMark: '*'
    }
  ) {
    super({ objectMode: true });
    this.reading = false;
    this.counter = 0;
    this.urlBase = 'http://api.archives-ouvertes.fr/search';
    this.params = options;
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
