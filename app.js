var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
const flash = require('connect-flash');
require("dotenv").config();

const staticpath=path.join(__dirname,"./public/javascripts")
// console.log(staticpath)
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const exp = require('constants');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(staticpath))


app.use(session({
    secret: process.env.SECRET_KEY, //  your secret key
    resave: false,
    saveUninitialized: true,
  })
);

// Middleware for flash messages
app.use(flash());
app.use((req, res, next) => {
  res.locals.successMessage = req.flash('success');
  res.locals.errorMessage = req.flash('error');
  res.locals.page = req.flash('page');
  res.locals.user=req.flash("user")
  res.locals.seen_notification = req.flash('seen_notification');
  next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
// app.use('/users', usersRouter);

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
