const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const middlewaresAuth = require('../middlewares/auth');

router.get('/', middlewaresAuth.authVerify, productController.index);

module.exports = router;
