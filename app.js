/*
 * Moe Szyslak, October 2014
 *
 * lets get it ON! (Celebrity death match)
 * this is going to be one LONG ass app, though if you collapse each middleware
 * then you have yourself a clean code ;)
 */



var https = require('https');
var path = require('path');
var fs = require('fs');
var express = require('express');
var connect = require('connect');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var serveFavicon = require('serve-favicon');
var pg = require('pg');

// home brewed by Moe Szyslak :)
var pingu = require('./lib/pingu.js');
var sha1 = require('./lib/cyper.js');
var config = require('./config.js');



var client = new pg.Client(config.pgConnectionString);
client.connect();

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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));



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
      response.json({});
    break;

    case 'POST':
      client.query('SELECT user_id, user_username, user_access_type, user_suspended FROM users WHERE user_username=$1 AND user_password=$2 AND user_suspended=$3', [request.body.username, sha1.sha1(String(request.body.password)), false], function (error, result) {
        if (error) {
          response.status(500);
          response.json({notify: {text: 'something horrible has happen, call 911'}});
        } else {
          if (result.rowCount === 1) {
            request.session.loggedIn = true;
            response.status(200);
            response.json({notify: {text: 'welcome, LUKE!'}});
          } else {
            response.status(401);
            response.json({notify: {text: 'welcome --- NAT!', type: 'error'}});
          }
        }
      });
    break;

    case 'DELETE':
      if (request.session.loggedIn === true) {
        delete request.session.loggedIn;
        response.status(202);
        response.json({success: 'DELETE'});
      } else {
        response.status(401);
        response.json({notify: {text: 'we in this for the long run son!', type: 'error'}});
      }
    break;

    default:
      response.status(405);
      response.json({notify: {text: 'am snitching!', type: 'error'}});
    break;
  }
});



// this middle fellow will check for authentication (i.e. session)
// and will take the appropriate measures
app.use(function (request, response, next) {
  if (request.originalUrl.search(/^\/api\//) === 0) {
    if (request.session.loggedIn === true) {
      next();
    } else {
      response.status(412);
      response.json({notify: {text: 'back of the line Mitch', type: 'error'}});
    }
  } else {
    next();
  }
});



// this makes sure angular is in-charge of routing
app.use(function (request, response) {
  response.sendFile(path.join(__dirname, '/public/index.html'));
});



var server = https.createServer(config.https, app);
server.listen(app.get('port'), '127.0.0.1');
