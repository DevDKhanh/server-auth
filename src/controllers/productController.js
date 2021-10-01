/*
 **APi version 1.0.0
 *coder: Duy Khánh
 *api product
 */

class Product {
	index(req, res, next) {
		res.send('ok');
	}
}

module.exports = new Product();
