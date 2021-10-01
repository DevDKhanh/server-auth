require('dotenv').config();
const nodeMailer = require('nodemailer');
const adminEmail = process.env.GMAIL;
const adminPassword = process.env.PASS_GMAIL;

const transporter = nodeMailer.createTransport({
	service: 'gmail',
	secure: false,
	auth: {
		user: adminEmail,
		pass: adminPassword,
	},
});

export const sendMail = (to, subject, pass) => {
	const options = {
		from: adminEmail,
		to: to,
		subject: subject,
		html: resetpass(pass),
	};
	return transporter.sendMail(options);
};

export const sendMailVerify = (to, subject, token, domain) => {
	const options = {
		from: adminEmail,
		to: to,
		subject: subject,
		html: verify(token, to, domain),
	};
	return transporter.sendMail(options);
};

export const sendMailForgotPass = (to, subject, number) => {
	const options = {
		from: adminEmail,
		to: to,
		subject: subject,
		html: forgotpass(number),
	};
	return transporter.sendMail(options);
};
