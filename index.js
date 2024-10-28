require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passport = require('./strategies/jwtStrategy');
const v1Routes = require('./routes/v1');
const cors = require('cors');
const morgan = require('morgan');
const winston = require('winston');
const { CONFIG } = require('./config');
const { viewMiddleware } = require('./utils/viewCountMiddleware');

const app = express();
app.use(express.json());
app.use(passport.initialize());

// Enable CORS and allow credentials if needed
app.use(
	cors((req, callback) => {
		const allowedOrigins = CONFIG.ALLOW_ORIGINS.split(',');

		const corsOption = {
			methods: 'GET, POST, DELETE, PUT, PATCH, HEAD, POST, OPTIONS',
			allowedHeaders:
				'Origin, X-Requested-With, Authorization, Content-Type, Accept, X-Idempotency-Key, Set-Cookie',
			credentials: true,
			allowCredentials: true,
		};

		if (!req.get('Origin')) {
			callback(null, { ...corsOption, origin: allowedOrigins });
			return;
		}

		if (allowedOrigins.indexOf(req.get('Origin')) !== -1) {
			corsOption.origin = true;
			callback(null, corsOption);
		} else {
			corsOption.origin = false;
			callback(
				new Error('You are not allowed to access this resource'),
				corsOption,
			);
		}
	}),
);

app.use((req, res, next) => {
	req.serverUploadFolder = `${req.protocol}://${req.get('host')}/uploads`;
	next();
});

// Use morgan to log requests
app.use(morgan('combined'));

// Configure winston logger
const logger = winston.createLogger({
	level: 'info',
	format: winston.format.combine(
		winston.format.timestamp(),
		winston.format.printf(({ timestamp, level, message }) => {
			return `${timestamp} [${level}]: ${message}`;
		}),
	),
	transports: [
		new winston.transports.Console(),
		new winston.transports.File({ filename: 'app.log' }),
	],
});
app.use('/uploads/:filename', viewMiddleware);
app.use('/uploads', express.static('uploads'));
app.use('/api/v1', v1Routes);

mongoose
	.connect(process.env.DB_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => logger.info('Connected to MongoDB'))
	.catch((err) => logger.error('MongoDB connection error:', err));
app.listen(3000, () => logger.info('Server running on port 3000'));
