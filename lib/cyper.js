var crypto = require ('crypto');

/// returns the sha1 hash of a bare password passed
/// @param {String} password
/// @return {String}
exports.sha1 = function (rawPassword) {
  var sha1 = crypto.createHash('sha1');
  sha1.update(rawPassword, {encoding: 'utf8'});
  return sha1.digest('hex');
};
