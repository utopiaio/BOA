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
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var serveFavicon = require('serve-favicon');
var pg = require('pg');
var socket = require('socket.io');
var sessionStore = require('sessionstore').createSessionStore(); // Memory
var socketHandshake = require('socket.io-handshake');

// home brewed by Moe Szyslak :)
var pingu = require('./lib/pingu.js');
var sha1 = require('./lib/cyper.js');
var config = require('./config.js');

// sockets is where we're going to keep all those sockets that are connected
// {username: socket}
var sockets = {};

var client = new pg.Client(config.pgConnectionString);
client.connect();

var app = express();
app.set('port', process.env.PORT || config.port);

app.use(serveFavicon(path.join(__dirname, 'public/assets/images/favicon.ico')));
app.use(express.static(path.join(__dirname, '/public')));
app.use(expressSession({
  name: 'pingu',
  store: sessionStore,
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



app.use('/api/login', function (request, response, next) {
  switch(request.method) {
    case 'GET':
      response.status(request.session.loggedIn === true ? 200 : 412);
      response.json({});
    break;

    case 'POST':
      client.query('SELECT user_id, user_username, user_access_type, user_suspended FROM users WHERE user_username=$1 AND user_password=$2 AND user_suspended=$3', [request.body.username, sha1.sha1(String(request.body.password)), false], function (error, result) {
        if (error) {
          response.status(409);
          response.json({notify: {text: 'am sexy and i know it!'}});
        } else {
          if (result.rowCount === 1) {
            request.session.loggedIn = true;
            request.session.username = request.body.username;
            request.session.user_id = result.rows[0].user_id;
            response.status(200);
            response.json({notify: {text: 'welcome back Mitch! --- ('+ request.body.username +')'}});
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
app.use(/^\/api\/.*/, function (request, response, next) {
  if (request.session.loggedIn === true) {
    next();
  } else {
    response.status(412);
    response.json({notify: {text: 'back of the line Mitch', type: 'error'}});
  }
});



app.use('/api/branches(/:id)?', function (request, response, next) {
  switch(request.method) {
    case 'GET':
      client.query('SELECT branch_id, branch_name, branch_ip, branch_service_type, branch_access_type, branch_bandwidth, branch_service_number FROM branches;', [], function (error, result) {
        if (error) {
          response.status(409);
          response.json({notify: {text: 'who let the dogs out!', type: 'error'}});
        } else {
          response.status(200);
          response.json(result.rows);
        }
      });
    break;

    case 'POST':
      client.query('INSERT INTO branches (branch_name, branch_ip, branch_service_type, branch_access_type, branch_bandwidth, branch_service_number) VALUES ($1, $2, $3, $4, $5, $6) RETURNING branch_id, branch_name, branch_ip, branch_service_type, branch_access_type, branch_bandwidth, branch_service_number;', [request.body.branch_name, request.body.branch_ip, request.body.branch_service_type, request.body.branch_access_type, request.body.branch_bandwidth, request.body.branch_service_number], function (error, result) {
        if (error) {
          response.status(409);
          response.json({notify: {text: 'wasn\'t me', type: 'error'}});
        } else {
          response.status(202);
          response.json({notify: {text: 'hooray, new branch ('+ request.body.branch_name +')', type: 'success'}, newBranch: result.rows[0]});
          sockets[request.session.username].broadcast.json.send({code: 'NEW_BRANCH', newBranch: result.rows[0], notify: {text: 'new branch ('+ request.body.branch_name +')', type: 'info'}});
        }
      });
    break;

    case 'PUT':
      client.query('UPDATE branches SET branch_name=$1, branch_ip=$2, branch_service_type=$3, branch_access_type=$4, branch_bandwidth=$5, branch_service_number=$6 WHERE branch_id=$7 RETURNING branch_id, branch_name, branch_ip, branch_service_type, branch_access_type, branch_bandwidth, branch_service_number;', [request.body.branch_name, request.body.branch_ip, request.body.branch_service_type, request.body.branch_access_type, request.body.branch_bandwidth, request.body.branch_service_number, request.body.branch_id], function (error, result) {
        if (error) {
          response.status(409);
          response.json({notify: {text: 'girls just wanna fun', type: 'error'}});
        } else {
          response.status(200);
          response.json({notify: {text: 'branch updated ('+ request.body.branch_name +')', type: 'success'}, updatedBranch: result.rows[0]});
          sockets[request.session.username].broadcast.json.send({code: 'UPDATED_BRANCH', updatedBranch: result.rows[0], notify: {text: 'branch updated ('+ request.body.branch_name +')', type: 'info'}});
        }
      });
    break;

    case 'DELETE':
      client.query('delete from branches where branch_id=$1', [request.params['0']], function (error, result) {
        if (error) {
          response.status(409);
          response.json({notify: {text: 'GGGGG G-Unit', type: 'error'}});
        } else {
          response.status(202);
          response.json({notify: {text: 'branch deleted', type: 'success'}, deletedBranchId: Number(request.params['0'])});
          sockets[request.session.username].broadcast.json.send({code: 'DELETED_BRANCH', deletedBranchId: Number(request.params['0']), notify: {text: 'branch deleted', type: 'info'}});
        }
      });
    break;

    default:
      response.status(405);
      response.json({notify: {text: 'am snitching!', type: 'error'}});
    break;
  }
});



app.use('/api/reports(/:id)?', function (request, response, next) {
  switch(request.method) {
    case 'GET':
      client.query('SELECT report_id, report_timestamp_open, report_timestamp_close, report_alert, report_reporter, report_branch, report_ticket, report_status FROM reports;', [], function (error, result) {
        if (error) {
          response.status(409);
          response.json({notify: {text: 'am Rick James BITCH!', type: 'error'}});
        } else {
          response.status(200);
          response.json(result.rows);
        }
      });
    break;

    case 'POST':
      client.query('INSERT INTO reports (report_ticket, report_alert, report_reporter, report_branch) VALUES ($1, $2, $3, $4) RETURNING report_id, report_timestamp_open, report_timestamp_close, report_alert, report_reporter, report_branch, report_ticket, report_status;', [request.body.ticket, request.body.alert, request.session.username, request.body.branch_id], function (error, result) {
        if (error) {
          response.status(409);
          response.json({notify: {text: 'smack that! AKON', type: 'error'}});
        } else {
          // closing the connection ASAP so it doesn't keep spinning
          // we're going use our sockets for the REAL data this time round
          response.status(202);
          response.json({success: true});

          // upon a successful branch report
          // ERYone (including the reporter) gets notified
          // code name 'AC-DC' is applied because this mostly happens
          // AFTER code 'BLACK HAWK DOWN' is emitted
          io.emit('message', {
            code: 'AC-DC',
            notify: {text: 'branch reported', type: 'info'},
            report: result.rows[0]
          });
        }
      });
    break;

    case 'PUT':
      response.status(202);
      response.send('PUT');
    break;

    case 'DELETE':
      response.status(202);
      response.send('DELETE');
    break;

    default:
      response.status(405);
      response.json({notify: {text: 'am snitching!', type: 'error'}});
    break;
  }
});



app.post('/api/ping', function (request, response, next) {
  // making sure we don't get "shocked" ;)
  // we were about to be shocked, phew
  if (request.body.ip.match(/^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/) === null) {
    response.status(406);
    response.json({notify: {text: 'am snitching!', type: 'error'}});
  } else {
    // responding to the one who initiated the ping
    // PS: the result will be shared with ERYone
    response.status(202);
    response.json({notify: {text: 'ping-ing... <span class="badge">'+ request.body.ip +'</span>'}});

    pingu.ping({c: 2, timeout: 4}, request.body.ip, function (result) {
      if (result.loss === 100) {
        // broadcasting to ERYbody
        // we need all hands on deck --- so to speak
        // notification isn't going to cut it, we're going modal on this bitch
        io.emit('message', {code: 'BLACK_HAWK_DOWN', data: {result: result, branch: request.body.branch}});
      } else if (result.loss === 0) {
        // it's all good bra --- not that bra, black people brother
        io.sockets.connected[sockets[request.session.username].id].emit('message', {notify: {text: 'put the phone DOWN --- it\'s all good', type: 'success'}});
      }

      // NOTE:
      // here we're only looking out for either complete black out or 100% up
      // which obviously isn't the case in the read world, there are lots
      // of shit that could go wrong, i leave that shit to you - uncle Sam!
    });
  }
});



// this makes sure angular is in-charge of routing
app.use(function (request, response) {
  response.sendFile(path.join(__dirname, '/public/index.html'));
});



var server = https.createServer(config.https, app);
server.listen(app.get('port'), '127.0.0.1');



var io = socket(server);
io.use(socketHandshake({
  store: sessionStore,
  key: 'pingu',
  secret: config.cookieSignature,
  parser: cookieParser()
}));

// yet another middle fellow that authenticates session
io.use(function(socket, next) {
  if (socket.handshake.session.loggedIn === true) {
    next();
  } else {
    next(new Error('not authorized'));
  }
});

// if a socket connection has established connection that means it's legit
io.on('connection', function (socket) {
  // we have a connection
  sockets[socket.handshake.session.username] = socket;

  // telling ERYone the good news
  socket.broadcast.json.send({notify: {text: 'user ('+ socket.handshake.session.username +') now online', type: 'info'}});

  // this tells everyone the sad news
  socket.on('disconnect', function () {
    delete sockets[socket.handshake.session.username];
    // yet another a bit too much info
    // io.emit('message', {notify: {text: 'user ('+ socket.handshake.session.username +') now OFFline', type: 'info'}});
  });
});
