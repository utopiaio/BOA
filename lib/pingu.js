;(function() {
  'use strict';

  var exec = require('child_process').exec;



  /// given an option and an ip it'll return the ping result wrapped in
  /// a nice little object with ERY-little detail
  /// though because of ping ubiquity some details won't appear on every platform
  /// ping seems to serve platform "flavored" stats
  ///
  /// @param {Object} option
  /// @param {String} ip
  /// @param {Function} callback
  /// @return {Object}
  exports.ping = function(option, ip, callback) {
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

    // am being "shady" with ping options, setting many params to make sure
    // shit goes down anyway
    //
    // "fix"
    // we're pining a local VPN network we "expect" the response to be in ms
    // so giving each ping a second to response is "safe" i.e. -c === -W
    // -t option doesn't apply in our case :)
    exec('ping -W '+ option.timeout  +' -c '+ option.c + ' '+ ip, {timeout: 10000}, function(error, stdout, stderr) {
      stdout = String(stdout).trim();
      if (stdout.search(/expired/i) !== -1) {
        stat.expired = true;
      }

      if (stdout.search(/unreachable/i) !== -1) {
        stat.unreachable = true;
      }

      stdout = stdout.substr((stdout.lastIndexOf('---\n') + 4), stdout.length);
      stdout = stdout.split(/\, |\n/);

      for(var i in stdout) {
        if(stdout[i].match(/transmitted$/)) {
          stat.transmitted = Number(stdout[i].match(/(?:\d+)/)[0]);
        } else if(stdout[i].match(/received$/)) {
          stat.received = Number(stdout[i].match(/(?:\d+)/)[0]);
        } else if(stdout[i].match(/loss$/)) {
          stat.loss = Number(stdout[i].match(/(?:\d+)/)[0]);
        } else if(stdout[i].match(/^time/)) {
          stat.time = Number(stdout[i].match(/(?:\d+)/)[0]);
        } else if(stdout[i].match(/^(rtt|round)/)) {
          // rtt - Linux
          // round - Mac
          // Windows - only the BRAVE go down that road
          var rtt = stdout[i].match(/(?:\d+\.\d+)+/g);
          stat.min = Number(rtt[0]);
          stat.avg = Number(rtt[1]);
          stat.max = Number(rtt[2]);
          stat.mdev = Number(rtt[3]);
        } else if(stdout[i].match(/errors$/)) {
          stat.error = Number(stdout[i].match(/(?:\d+)/)[0]);
        } else if(stdout[i].match(/^pipe/)) {
          stat.pipe = Number(stdout[i].match(/(?:\d+)/)[0]);
        }
      }

      callback(stat);
    });
  };
})();
