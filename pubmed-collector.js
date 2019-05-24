'use strict';
const { Readable } = require('stream');
const { writeFile } = require('fs');
const xmlParser = require('fast-xml-parser');
const XmlSplit = require('xmlsplit');
const request = require('request-promise');

const baseUrl = 'http://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const url = baseUrl + '/esearch.fcgi?db=pubmed&term=2017[PDAT] AND FRANCE[Affiliation]&usehistory=y&retmode=json';
request(url).then(body => {
  const result = JSON.parse(body);
  const webenv = result.esearchresult.webenv;
  const queryKey = result.esearchresult.querykey;
  const count = result.esearchresult.count;
  const retmax = 1000;
  const efetchUrls = [];
  for (let retstart = 0; retstart < count; retstart += retmax) {
    const efetchUrl = `${baseUrl}/efetch.fcgi?db=pubmed&WebEnv=${webenv}&query_key=${queryKey}&retstart=${retstart}&retmax=${retmax}&retmode=xml`;
    efetchUrls.push(efetchUrl);
  }
  return efetchUrls;
}).mapSeries(efectUrl => {
  return request(efectUrl).then(body => {
    const articleSetStream = new Readable({
      objectMode: true,
      read () {
        this.push(body);
        this.push(null);
      }
    });
    const xmlsplit = new XmlSplit();
    const chain = articleSetStream.pipe(xmlsplit);
    chain.on('data', data => {
      const xmlString = data.toString();
      const doc = xmlParser.parse(xmlString);
      const pmId = doc.PubmedArticleSet.PubmedArticle.MedlineCitation.PMID;
      const filename = `pubmed-${pmId}.xml`;
      writeFile(filename, xmlString, error => {
        if (error) console.error(error);
      });
    });
    chain.on('error', console.error);
  });
}).catch(console.error);
