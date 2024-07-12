const path = require('path');
const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const AppError = require('./utils/appError');
const devconfig = require('./utils/devconfig');
// const router = require('./routes/userRoutes'););
const productRouter = require('./routes/productRoutes');
const userRouter = require('./routes/userRoutes');
// const adminRouter = require('./routes/adminRoutes');
const riderRouter = require('./routes/riderRoutes');
const cartRouter = require('./routes/cartRoutes');
const wishListRouter = require('./routes/wishListRoutes');
const myProfileRouter = require('./routes/myProfileRoutes');
const reviewRouter = require('./routes/reviewsRoutes');
const globalErrorHandler = require('./controllers/errorControllers');
const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Servinf Static Files
app.use(express.static(path.join(__dirname, 'public')));
// 1<----Middlewares---->
if (devconfig.mode === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

// 3-Routes--
app.get('/', (req, res) => {
  res.status(200).render('base', {
    Product: 'Gorma Honey',
    user: 'Abu Bakar',
  });
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/products', (req, res) => {
  res.render('products');
});

app.get('/dashboard', (req, res) => {
  res.render('dashboard');
});

app.get('/addProducts', (req, res) => {
  res.render('addProducts');
});

app.get('/getallproducts', (req, res) => {
  res.render('getallproducts');
});

app.get('/update', (req, res) => {
  res.render('update');
});

app.get('/bakery-dairy-Products', (req, res) => {
  res.render('bakery-dairy-Products');
});

app.get('/fruits-vegetables-Products', (req, res) => {
  res.render('fruits-vegetables-Products');
});

app.get('/Stationery-Products', (req, res) => {
  res.render('Stationery-Products');
});

app.get('/Babycare-Products', (req, res) => {
  res.render('Babycare-Products');
});

app.get('/Meat-Seafood-Products', (req, res) => {
  res.render('Meat-Seafood-Products');
});

app.get('/Snacks-Products', (req, res) => {
  res.render('Snacks-Products');
});

app.get('/Petcare-Products', (req, res) => {
  res.render('Petcare-Products');
});

app.get('/breakfast-Products', (req, res) => {
  res.render('breakfast-Products');
});

app.get('/below500-Products', (req, res) => {
  res.render('below500-Products');
});

app.use('/api/v1/products', productRouter);
app.use('/api/v1/users', userRouter);
// app.use('/api/v1/admins', adminRouter);
app.use('/api/v1/riders', riderRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/wishlist', wishListRouter);
app.use('/api/v1/myProfile', myProfileRouter);
app.use('/api/v1/reviews', reviewRouter);

// handling unhandled Routes
app.all('*', (req, res, next) => {
  // const err = new Error(`Can't find ${req.originalUrl} on the server!`);
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new AppError(`Can't find ${req.originalUrl} on the server!`, 404));
});

app.use(globalErrorHandler);
module.exports = app;
