const path = require('path');
const express = require('express');
const bodyparser = require('body-parser');
const route = require('./routes');
const app = express();
const http = require('http');

const server = http.createServer(app);

const db = require('./config/db');
const session = require('express-session');
const port = process.env.PORT || 6060;

// connect db
db.connect();

//app.use
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));
app.use(express.json());

//cokie and session
app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: true,
		saveUninitialized: false,
	}),
);

route(app);

server.listen(port, () =>
	console.log(`App listening at http://localhost:${port}`),
);

module.exports = app;
