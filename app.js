var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

require("dotenv").config();


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var MONGODB_URL = process.env.MONGODB_URL; // DB connection
var mongoose = require("mongoose");
mongoose.connect(MONGODB_URL).then(() => {
	if (process.env.NODE_ENV !== "final") { //don't show the log when it is test
		console.log("Connected to: --------- %s",  MONGODB_URL);
		console.log("port: -----------", process.env.PORT);
		console.log("App is running ... \n");
		console.log("Press CTRL + C to stop the process. \n");
	}
}).catch(err => { console.error("App starting error:", err.message), process.exit(1); });

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
