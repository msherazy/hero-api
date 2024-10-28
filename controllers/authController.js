const User = require('../models/user');
const jwt = require('jsonwebtoken');
const UserDto = require('../dtos/userDto');
const { CONFIG } = require('../config');

exports.register = async (req, res) => {
	const userDto = new UserDto(req.body.name, req.body.email, req.body.password);

	if (!userDto.isValid()) {
		return res.status(400).json({ message: 'Invalid input' });
	}

	try {
		const user = new User(req.body);
		await user.save();
		res.status(201).json({ message: 'User registered successfully' });
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
};

exports.login = async (req, res) => {
	const { email, password } = req.body;
	const user = await User.findOne({ email });

	if (!user || !(await user.comparePassword(password))) {
		return res.status(401).json({ message: 'Invalid credentials' });
	}

	// Generate JWT token
	const token = jwt.sign({ userId: user._id }, CONFIG.ACCESS_SECRET, {
		expiresIn: CONFIG.ACCESS_TOKEN_EXPIRY,
	});

	// Send user object excluding password
	const { password: _, ...userWithoutPassword } = user.toObject();

	res.json({
		token,
		user: userWithoutPassword,
	});
};

exports.profile = async (req, res) => {
	res.status(200).json({ ...req.user });
};
