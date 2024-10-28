const jwt = require('jsonwebtoken');
const { CONFIG } = require('../config');
const User = require('../models/user');

exports.authGuard = (req, res, next) => {
	const token = req.header('Authorization')?.split(' ')[1];
	if (!token) return res.status(401).json({ message: 'Access denied' });

	jwt.verify(token, CONFIG.ACCESS_SECRET, async (err, payload) => {
		if (err) return res.status(403).json({ message: 'Invalid token' });

		const user = await User.findById(payload.userId);

		const { password, ...userWithoutPassword } = user.toObject();

		req.user = userWithoutPassword;
		next();
	});
};

