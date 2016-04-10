process.env.ENV = "local";

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var SC = require('node-soundcloud');
var config = require('./config.js');
var hbs = require('hbs');

//Redis Store Session
var session = require('express-session');
var RedisStore = require('connect-redis')(session);

//Allows us to pass JSON from server side (express? i think) to a client JS file via the HTML file. Look in player.js at the bottom for an example
 hbs.registerHelper('json', function(context) {
    return JSON.stringify(context);
 });

// Initialize client
SC.init({
  id: config.auth.client_id,
  secret: config.auth.client_secret,
  uri: config.auth.redirect_uri
});


var routes = require('./routes/index');
var api = require('./routes/api');

var app = express();

//create session manager using a redis store
app.use(session({
    store: new RedisStore(),
    secret: 'keyboard cat'
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// set the environment variable
app.set('env', 'dev');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.text({type : 'application/text-enriched', limit: '10mb'}));

//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));

// Make our SC middleware accessible to our router
app.use(function(req,res,next){
    req.SC = SC;
    next();
});

app.use('/', routes);
app.use('/api/', api);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'dev') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
console.log('Application Loaded...');