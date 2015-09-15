var authy = require('authy'),
  bodyParser = require('body-parser');
var jsonparser = bodyParser.json();
var urlencodedparser = bodyParser.urlencoded({extended: true});
var authyclient, options;


var configure = function(options) {
  if(typeof options != 'object') {
    throw new Error("options must be an object");
  }

  if(!options.hasOwnProperty("api_key")) {
    throw new Error("options must include api_key");
  }
  global.options = global.options || options;
  authyclient = authy(options.api_key);
};

var register = function() {
  configured();
  var authyregister = function(request, response, next) {
    var body = request.body;
    authyclient.register_user(body.email, body.phone, body.country_code, function(err, res) {
      if(err) {
        request.body.error = err;
      } else {
        request.body.authy_user = res.user;
        authyclient.request_sms(request.body.authy_user.id, function(err, res){
        });
      }
      next();
    });
  }
  return [urlencodedparser, jsonparser, authyregister];
};

var verify = function() {
  var authyverify = function(request, response, next) {
    body = request.body;
    authyclient.verify(body.authy_id, body.verification_code, function(err, res) {
      if(err) {
        req.body.error = err;
      } else {
        req.body = res;
      }
      next();
    });
  }

  return [urlencodedparser, jsonparser, authyverify];
};

var user_status = function() {
  var authyuserstatus = function(request, response, next) {
    body = request.body;
    authyclient.user_status(body.authy_id, function(err, res){
      if(err) {
        request.body.error = err;
      } else {
        request.body.user_status = res;
      }
      next();
    });
  }
  return [urlencodedparser, jsonparser, authyuserstatus];
};

var verification_check = function() {
  var authyverificationcheck = function(request, response, next) {
    var body = request.body;
    authyclient.phones().verification_check(body.phone, body.country_code, body.verification_code, function(err, res) {
      if(err) {
        request.body.error = err;
      } else {
        request.body = res;
      }
      next();
    });
  }
  return [urlencodedparser, jsonparser, authyverificationcheck];
};

var configured = function() {
  if(!global.options) {
    throw new Error("passport-authy needs to be configured");
  }
}
module.exports.configure = configure;
module.exports.verify = verify;
module.exports.verification_check = verification_check;
module.exports.register = register;
module.exports.user_status = user_status;