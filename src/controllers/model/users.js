const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchame = new Schema(
	{
		username: { type: String, required: true, min: 4, max: 255 },
		email: { type: String, default: '', min: 4, max: 255 },
		firstName: { type: String, default: '', max: 55 },
		lastName: { type: String, default: '', max: 55 },
		gender: { type: String, default: '', max: 25 },
		avatar: { type: String, default: '' },
		position: { type: Number, default: 0 },
		birth: { type: String, default: '', min: 4, max: 100 },
		address: { type: String, default: '', min: 4, max: 255 },
		phone: { type: String, max: 25 },
		password: { type: String, min: 6, max: 1024 },
		provider: { type: String, default: 'devDShop', min: 4, max: 50 },
		socialId: { type: String, default: '', min: 4, max: 100 },
		isBlock: { type: Boolean, default: false },
	},
	{
		timestamps: true,
	},
);

module.exports = mongoose.model(
	'users_tbls',
	userSchame.index({ '$**': 'text' }),
);
