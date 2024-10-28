const passport = require('passport');
const { Strategy, ExtractJwt } = require('passport-jwt');
const User = require('../models/user');
const { CONFIG } = require('../config');

const opts = {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: CONFIG.ACCESS_SECRET,
	expiresIn: CONFIG.ACCESS_TOKEN_EXPIRY,
};

passport.use(
	new Strategy(opts, async (payload, done) => {
		try {
			const user = await User.findById(payload.userId);
			if (user) return done(null, user);
			return done(null, false);
		} catch (error) {
			return done(error, false);
		}
	}),
);

module.exports = passport;
