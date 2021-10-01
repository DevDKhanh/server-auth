/*
 APi version 1.0.0
 coder: Duy Khánh
 apiAuth - SERVERAPI
*/

require('dotenv').config();
const dbUsers = require('./model/users');
const validator = require('validator');
const pbkdf2 = require('pbkdf2');
const jwt = require('jsonwebtoken');
const sanitizer = require('sanitizer');

//Check xss
const xss = str => {
	return sanitizer.sanitize(sanitizer.escape(str));
};

class AuthController {
	async register(req, res, next) {
		/*Check if the username is in the correct format.*/
		try {
			function isUsernameError(str) {
				const REGEX =
					/^(?=.{4,22}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/;
				return str.match(REGEX) == null ? true : false;
			}

			const userName = xss(req.body.userName.toLowerCase(), {});
			const email = xss(req.body.email, {});
			const passWord = xss(req.body.passWord, {});
			const passWord_re = xss(req.body.passWord_re, {});

			//check username and email in database
			const isHadName = await dbUsers.findOne({ username: userName });
			const isHadMail = await dbUsers.findOne({ email });

			/*status = 0 is failure, status = 1 is successfully, status = -1 is error*/
			if (userName && email && passWord && passWord_re) {
				if (
					validator.isEmpty(validator.trim(userName, '')) ||
					validator.isEmpty(validator.trim(email, '')) ||
					validator.isEmpty(validator.trim(passWord, '')) ||
					validator.isEmpty(validator.trim(passWord_re, ''))
				) {
					return res.status(200).json({
						status: 0,
						code: 200,
						message: 'Incomplete information provided',
						message_vn: 'Vui lòng nhập đầy đủ thông tin',
					});
				} else {
					if (isHadName) {
						return res.status(200).json({
							status: 0,
							code: 200,
							message: 'Username already in use',
							message_vn: 'Tên đăng nhập đã được sử dụng',
						});
					}

					if (isHadMail) {
						return res.status(200).json({
							status: 0,
							code: 200,
							message: 'The email address has been used',
							message_vn: 'Địa chỉ email đã được sử dụng',
						});
					}

					if (
						!validator.isLength(userName, {
							min: 4,
							max: 32,
						})
					) {
						return res.status(200).json({
							status: 0,
							code: 200,
							message: 'Length of user name is 4 - 32 characters',
							message_vn: 'Tên đăng nhập từ 4 - 32 kí tự',
						});
					}

					if (isUsernameError(userName)) {
						return res.status(200).json({
							status: 0,
							code: 200,
							message: 'Username includes characters aA-zZ, 0-9',
							message_vn: 'Tên đăng nhập gồm aA-zZ, 0-9',
						});
					}

					if (!validator.equals(passWord, passWord_re)) {
						return res.status(200).json({
							status: 0,
							code: 200,
							message: 'Re-entered password does not match',
							message_vn: 'Mật khẩu nhập lại không trùng khớp',
						});
					}

					if (
						!validator.isLength(passWord, {
							min: 6,
						})
					) {
						return res.status(200).json({
							status: 0,
							code: 200,
							message: `Minimum password length is 6 characters`,
							message_vn: `Mật khẩu tối thiểu 6 kí tự`,
						});
					}

					if (!validator.isEmail(email)) {
						return res.status(200).json({
							status: 0,
							code: 200,
							message: 'Not email',
							message_vn: 'Vui lòng nhập email chính xác',
						});
					} else {
						const derivedKey = pbkdf2.pbkdf2Sync(
							passWord,
							'salt',
							1,
							32,
							'sha512',
						);

						const newUser = new dbUsers({
							username: userName,
							email: email,
							password: derivedKey,
							isAdmin: email == process.env.EMAIL_ADMIN,
						});

						const saveData = await newUser.save();
						if (saveData) {
							return res.status(201).json({
								status: 1,
								code: 201,
								message: 'Create successfully!',
								message_vn: 'Tạo tài khoản thành công',
							});
						} else {
							return res.status(500).json({
								status: -1,
								code: 500,
								message: 'Error',
								message_vn: 'Có lỗi xảy ra',
							});
						}
					}
				}
			} else {
				return res.status(200).json({
					status: 0,
					code: 200,
					message: 'Incomplete information provided',
					message_vn: 'Vui lòng nhập đầy đủ thông tin',
				});
			}
		} catch (err) {
			return res.status(500).json({
				status: -1,
				code: 500,
				message: 'Error',
				message_vn: 'Có lỗi xảy ra',
			});
		}
	}

	async login(req, res, next) {
		try {
			const { userName, passWord } = req.body;
			const derivedKey = pbkdf2.pbkdf2Sync(
				passWord,
				'salt',
				1,
				32,
				'sha512',
			);

			if (
				validator.isEmpty(validator.trim(userName, '')) ||
				validator.isEmpty(validator.trim(passWord, ''))
			) {
				return res.status(200).json({
					status: 0,
					code: 200,
					message: 'Incomplete information provided',
					message_vn: 'Vui lòng nhập đầy đủ thông tin',
				});
			}

			//Find user on database
			const dataUser = await dbUsers.findOne({
				username: userName,
				password: derivedKey,
			});

			if (dataUser) {
				//Position >=1 is Admin
				const data = {
					username: dataUser.username,
					mail: dataUser.email,
					isBlock: dataUser.isBlock,
					isAdmin: dataUser.position >= 1,
				};
				const accessToken = jwt.sign(
					{
						data: data,
					},
					process.env.JWT_SECRET,
					{ expiresIn: '100y' },
				);

				return res.status(200).json({
					status: 1,
					code: 201,
					message: 'Login success',
					message_vn: 'Đăng nhập thành công',
					data: { ...data, accessToken },
				});
			} else {
				return res.status(200).json({
					status: 0,
					code: 200,
					message: 'Login failure',
					message_vn: 'Tài khoản hoặc mật khẩu không chính xác',
				});
			}
		} catch (err) {
			return res.status(500).json({
				status: -1,
				code: 500,
				message: 'Error',
				message_vn: 'Có lỗi xảy ra',
			});
		}
	}

	async currentUser(req, res, next) {
		try {
			const token = req.headers['authorization'].split(' ')[1];
			if (!token || token == 'null')
				return res.status(401).json({
					status: 0,
					code: 401,
					message:
						'Failed to authenticate because of bad credentials or an invalid authorization header',
				});

			jwt.verify(token, process.env.JWT_SECRET, function (err, data) {
				if (err) {
					return res.status(401).json({
						status: 0,
						code: 401,
						message: 'Forbidden',
					});
				} else {
					const user = data.data;
					return res.status(200).json({
						status: 1,
						code: 200,
						user,
						message: 'Invalid',
					});
				}
			});
		} catch (err) {
			return res.status(500).json({
				status: 0,
				code: 500,
				message: 'Error',
			});
		}
	}
}

module.exports = new AuthController();
