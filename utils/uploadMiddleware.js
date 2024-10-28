const multer = require('multer');
const path = require('path');
const { CONFIG } = require('../config');

const storage = multer.diskStorage({
	destination: './uploads/',
	filename: (req, file, cb) => {
		cb(null, `${Date.now()}-${file.originalname}`);
	},
});

const fileFilter = (req, file, cb) => {
	const ext = path.extname(file.originalname).toLowerCase();
	const allowedExtensions = [
		'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg',
		'.mp4', '.mov', '.avi', '.mkv', '.flv', '.wmv',
	];
	if (allowedExtensions.includes(ext)) {
		cb(null, true);
	} else {
		cb(new Error('Only images and videos are allowed'), false);
	}
};

// Set up multer with a file size limit of 100 MB
module.exports = multer({
	storage,
	fileFilter,
	limits: {
		fileSize: +CONFIG.MAX_FILE_SIZE * 1024 * 1024, // convert to bytes
	},
});
