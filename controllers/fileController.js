const File = require('../models/file');
const { join } = require('node:path');
const { unlink } = require('node:fs');

exports.uploadFile = async (req, res) => {
	try {
		if (!req.files) {
			return res.status(400).json({ message: 'No files uploaded' });
		}

		const ownerId = req.user._id;

		const uploadedFiles = await Promise.all(
			req.files.map(async file => {
				const fileData = {
					originalName: file.originalname.substring(0, file.originalname.lastIndexOf('.')),
					filename: file.filename,
					url: `${req.serverUploadFolder}/${file.filename}`, // Construct file URL based on server path
					size: file.size,
					owner: ownerId, // Associate file with the authenticated user
					type: file.mimetype.startsWith('image/') ? 'image' : 'video',
				};

				// Save each file to the database
				const savedFile = await File.create(fileData);
				return {
					...savedFile.toObject(),
				};
			}),
		);

		res.status(200).json({
			message: 'Files uploaded and saved successfully',
			files: uploadedFiles,
		});
	} catch (error) {
		if (error.code === 'LIMIT_FILE_SIZE') {
			return res.status(400).json({ message: 'File size exceeds limit' });
		}
		res.status(500).json({ message: 'File upload failed', error: error.message });
	}
};

exports.listFiles = async (req, res) => {
	try {
		const userId = req.user._id; // Get the authenticated user's ID

		// Extract page and limit from query parameters, with defaults
		const page = parseInt(req.query.page, 10) || 1;
		const limit = parseInt(req.query.limit, 10) || 10;

		// Query options for pagination
		const options = {
			page,
			limit,
			sort: { createdAt: -1 }, // Sort by creation date in descending order
		};

		// Fetch paginated files for the owner
		const files = await File.paginate({ owner: userId }, options);

		// Respond with paginated file list
		res.status(200).json({
			message: 'Files retrieved successfully',
			files: files.docs,
			pagination: {
				totalDocs: files.totalDocs,
				totalPages: files.totalPages,
				page: files.page,
				limit: files.limit,
				hasNextPage: files.hasNextPage,
				hasPrevPage: files.hasPrevPage,
				nextPage: files.nextPage,
				prevPage: files.prevPage,
			},
		});
	} catch (error) {
		res.status(500).json({ message: 'Failed to retrieve files', error: error.message });
	}
};

exports.editFile = async (req, res) => {
	try {
		const { id } = req.params;
		const { tags, shared, originalName } = req.body;
		const userId = req.user._id;

		const updateFields = {
			...(tags && { tags }),
			...(typeof shared === 'boolean' && { shared }), // Update shared status if provided
			...(originalName && { originalName }),          // Update originalName if provided
		};

		const updatedFile = await File.findOneAndUpdate(
			{ _id: id, owner: userId },
			updateFields,
			{ new: true },
		);

		// If the file is not found or the user is not the owner
		if (!updatedFile) {
			return res.status(404).json({ message: 'File not found or you do not have permission to edit this file' });
		}

		// Respond with the updated file
		res.status(200).json({
			message: 'File updated successfully',
			file: updatedFile,
		});
	} catch (error) {
		res.status(500).json({ message: 'File update failed', error: error.message });
	}
};

exports.deleteFile = async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.user._id; // Get the authenticated user's ID

		// Find and delete the file only if it belongs to the authenticated user
		const deletedFile = await File.findOneAndDelete({
			_id: id,
			owner: userId,
		});

		// If the file is not found or the user is not the owner
		if (!deletedFile) {
			return res.status(404).json({ message: 'File not found or you do not have permission to delete this file' });
		}

		// Define the file path based on the filename
		const filePath = join(__dirname, '../uploads', deletedFile.filename);

		// Delete the file from the filesystem
		unlink(filePath, (err) => {
			if (err) {
				console.error('Failed to delete file from filesystem:', err);
				return res.status(500).json({ message: 'File deleted from database, but failed to delete from filesystem' });
			}

			// Respond with a success message if file is deleted successfully
			res.status(200).json({ message: 'File deleted successfully' });
		});
	} catch (error) {
		res.status(500).json({ message: 'File deletion failed', error: error.message });
	}
};
