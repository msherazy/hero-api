const File = require('../models/file');

module.exports.viewMiddleware = async (req, res, next) => {
	try {
		const filename = req.params.filename;

		const file = await File.findOneAndUpdate(
			{ filename },
			{ $inc: { views: 1 } },
			{ new: true },
		);

		if (!file) {
			return res.status(404).json({ message: 'File not found' });
		}

		next();
	} catch (error) {
		res.status(500).json({ message: 'Error incrementing view count', error: error.message });
	}
};
