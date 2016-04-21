// Set the environment to local. This will make config.js load the configuration settings from the proper file.
process.env.ENV = "local";

// Require our node packages for use in the application.
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var SC = require('node-soundcloud');
var config = require('./config.js');
var hbs = require('hbs');

// Require routes javascript files for use in application routing.
var routes = require('./routes/index');
var api = require('./routes/api');

// Require DB status check middleware
var checkDBStatus = require('./routes/middleware/checkDBStatus');

// Redis Store Session
var session = require('express-session');
var RedisStore = require('connect-redis')(session);

// Allows us to pass JSON from server side (express? i think) to a client JS file via the HTML file. Look in player.js at the bottom for an example
 hbs.registerHelper('json', function(context) {
    return JSON.stringify(context);
 });

// Initialize Soundcloud client
SC.init({
  id: config.auth.client_id,
  secret: config.auth.client_secret,
  uri: config.auth.redirect_uri
});

// Initialize the express application.
var app = express();

// Make sure that the database is accessible
app.use(checkDBStatus);

// Create session manager using a Redis store.
app.use(session({
    store: new RedisStore(),
    secret: config.redis_secret
}));

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Set the environment variable
app.set('env', 'dev');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.text({type : 'application/text-enriched', limit: '10mb'}));

// Setup bodyParser and cookieParser middlewares.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Expose contents of 'public' folder on the top level domain
app.use(express.static(path.join(__dirname, 'public')));

// Allow access to bower_components
app.use('/bower_components',  express.static(__dirname + '/bower_components'));

// Make our SC middleware accessible to our router
app.use(function(req,res,next){
    req.SC = SC;
    next();
});

// Route requests to their corresponding route files.
app.use('/', routes);
app.use('/api/', api);

// Catch 404 and forward to error handler
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