const ApiHalStream = require('./hal-stream');

// const halCollector = new ApiHalStream({
//   // fq: 'labStructCountry_s:fr AND labStructRnsrIdExt_id:*',
//   // fl: 'labStructAddress_s,labStructName_s,labStructRnsrIdExt_s,halId_s'
//   fq: 'labStructCountry_s:fr',
//   fl: '*'
// });

// halCollector.on('data', data => {
//   console.log(data);
// });

const fs = require('fs');
const { EOL } = require('os');
const output = fs.createWriteStream('output.csv');
const halCollector = new ApiHalStream({
  fq: 'country_s:fr',
  fl: '*'
}, 'ref/structure');
let count = 0;
let total = 0;
halCollector.on('data', data => {
  process.stdout.write('.');
  total++;
  if (!data.address_s) count++;
  output.write(`${data.docid};"${data.name_s}";${data.country_s};${data.rnsr_s};"${data.address_s}"${EOL}`);
});

halCollector.on('end', () => {
  process.stdout.write(EOL);
  console.log('total :', total);
  console.log('count :', count);
});
