const express  = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const passport = require('passport');
const config = require('./config/db');
const port = process.env.PORT || 8080;
const app = express();

//--------------------configuration--------------------

//db 
mongoose.connect(config.database);

//express app
app.use(morgan('dev'));
app.use(bodyParser.json());

//passport
app.use(passport.initialize());

//routes
require('./app/routes')(app);

//connection
app.listen(port, function() {
	console.log(`App running on port ${port}`);
});
