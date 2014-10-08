/*
 * Moe Szyslak
 *
 * lets get it ON! (Celebrity death match)
 */

// built-in and npm packages
var https = require('https');
var path = require('path');
var fs = require('fs');
var express = require('express');
var connect = require('connect');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var serveFavicon = require('serve-favicon');
var pg = require('pg');
var path = require('path');

// home brewed by Moe Szyslak :)
var pingu = require('./lib/pingu.js');
var sha1 = require('./lib/cyper.js');
var config = require('./config.js');



var client = new pg.Client(config.pgConnectionString);
//client.on('drain', client.end.bind(client));
client.connect();

// client.query('SELECT * FROM users', [], function(error, result) {
//   console.log(error);
//   console.log(result);
// });

var app = express();
app.set('port', process.env.PORT || config.port);

app.use(serveFavicon(path.join(__dirname, 'public/assets/images/favicon.ico')));
app.use(express.static(path.join(__dirname, '/public')));
app.use(expressSession({
  name: 'pingu',
  secret: config.cookieSignature,
  cookie: {
    maxAge: 604800000,
    secure: true,
    httpOnly: true
  },
  rolling: true,
  resave: true,
  saveUninitialized: true
}));
app.use(bodyParser());

/*
 * since this is going to be a super cool and COMPLEX ;) app we're going
 * to in-line functions alot
 *
 *  api/login
 *  api/log
 *  api/branches
 *  api/report
 *  api/ping
 *  api/user
 *  api/stat
 *
 **/

app.use('/api/login', function (request, response, next) {
  switch(request.method) {
    case 'GET':
      response.status(request.session.loggedIn === true ? 200 : 412);
      response.json({notify: {text: request.session.loggedIn === true ? 'welcome back Mitch!' : 'session found not, bad Luke'}});
    break;

    case 'POST':
      client.query('SELECT user_id, user_username, user_access_type, user_suspended FROM users WHERE user_username=$1 AND user_password=$2 AND user_suspended=$3', [request.body.username, sha1.sha1(request.body.password), false], function (error, result) {
        if (error) {
          response.status(500);
          response.json({notify: {text: 'something horrible has happen, call 911'}});
        } else {
          if (result.rowCount === 1) {
            request.session.loggedIn = true;
            response.status(200);
            response.json({notify: {text: 'back, welcome LUKE!'}});
          } else {
            response.status(401);
            response.json({notify: {text: 'welcome --- NAT!', type: 'error'}});
          }
        }
      });
    break;

    case 'DELETE':
      response.status(202).json({success: 'DELETE'});
    break;

    default:
      response.status(405).json({message: 'method not allowed'});
    break;
  }
});

// this makes sure angular is in-charge of routing
app.use(function (request, response) {
  response.sendFile(path.join(__dirname, '/public/index.html'));
});



var server = https.createServer(config.https, app);
server.listen(app.get('port'), '127.0.0.1');
