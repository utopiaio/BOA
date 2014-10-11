var fs = require('fs');

module.exports = {
  port: 8888,
  pgConnectionString: 'tcp://postgres:password@127.0.0.1:5432/debra',
  cookieSignature: 'Svi#isdf!93|4{5msVldx!fks(8}',
  cookieAge: 604800000, // that's 7 days i believe
  https: {
    key: fs.readFileSync('./key/key.pem'),
    cert: fs.readFileSync('./key/key-cert.pem')
  }
};
