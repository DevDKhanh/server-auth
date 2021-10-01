require('dotenv').config();
const Auth = require('./apiAuth');
const Product = require('./apiProduct');
const middlewaresAuth = require('../middlewares/auth');

function route(app) {
	app.use(`${process.env.BASE_API}/auth`, Auth);
	app.use(
		`${process.env.BASE_API}/product`,
		middlewaresAuth.verifyDomain,
		Product,
	);
}

module.exports = route;
