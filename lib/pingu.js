var exec = require('child_process').exec;
/// given an option and an ip it'll return the ping result wrapped in
/// a nice little object with ERY-little detail
///
/// @param {Object} option
/// @param {String} ip
/// @param {Function} callback
/// @return {Object}
exports.ping = function (option, ip, callback) {
  option.c = option.c || 8;
  option.timeout = option.timeout || 30000;

  var stat = {
    transmitted:    null, // packets transmitted
    received:       null, // packets received
    loss:           null, // packets lost in %
    time:           null, // total time of the ping test
    min:            null, // minimum rtt (round trip time) in ms
    avg:            null, // average rtt
    max:            null, // maximum rtt
    mdev:           null, // measurement deviation
    error:          null, // error count
    pipe:           null, // echo request packets that were under way at one time
    expired:        false, // on ttl expire loss will be 0%
    unreachable:    false // loss is 0%, PINGU itself is disconnected :(
  };

  exec('ping -c '+ option.c + ' '+ ip, {timeout: option.timeout}, function (error, stdout, stderr) {
    // up/drop
    // ---
    // 8 packets transmitted, 8 received, 0% packet loss, time 1403ms
    // rtt min/avg/max/mdev = 0.894/2.730/10.947/3.319 ms
    // ---
    //
    //
    // down
    // ---
    // 8 packets transmitted, 0 received, +4 errors, 100% packet loss, time 7009ms
    // pipe 5
    // ---

    stdout = String(stdout).trim();
    if (stdout.search(/expired/i) !== -1) {
      stat.expired = true;
    }

    if (stdout.search(/unreachable/i) !== -1) {
      stat.unreachable = true;
    }

    stdout = stdout.substr((stdout.lastIndexOf('---\n') + 4), stdout.length);
    stdout = stdout.split(/, |\n/);
    for (i in stdout) {
      if (stdout[i].match(/^\d+ packets transmitted/)) {
          stat.transmitted = Number(stdout[i].match(/(?:\d+)/)[0]);
      } else if (stdout[i].match(/^\d+ received/)) {
          stat.received = Number(stdout[i].match(/(?:\d+)/)[0]);
      } else if (stdout[i].match(/^\d+% packet loss/)) {
          stat.loss = Number(stdout[i].match(/(?:\d+)/)[0]);
      } else if (stdout[i].match(/^time \d+ms/)) {
          stat.time = Number(stdout[i].match(/(?:\d+)/)[0]);
      } else if (stdout[i].match(/^rtt min\/avg\/max\/mdev/)) {
          var rtt = stdout[i].match(/(?:\d+\.\d+)+/g);
          stat.min = Number(rtt[0]);
          stat.avg = Number(rtt[1]);
          stat.max = Number(rtt[2]);
          stat.mdev = Number(rtt[3]);
      } else if (stdout[i].match(/^\+\d+ errors/)) {
          stat.error = Number(stdout[i].match(/(?:\d+)/)[0]);
      } else if (stdout[i].match(/^pipe (?:\d+)/)) {
          stat.pipe = Number(stdout[i].match(/(?:\d+)/)[0]);
      }
    }

    callback(stat);
  });
};
