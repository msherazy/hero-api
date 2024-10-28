const express = require('express');
const {
	uploadFile,
	listFiles,
	editFile, deleteFile,
} = require('../controllers/fileController');
const upload = require('../utils/uploadMiddleware');
const { CONFIG } = require('../config');
const router = express.Router();

router.post('/upload', upload.array('files', +CONFIG.MAX_FILE_LIMIT), uploadFile);
router.get('/list', listFiles);
router.put('/edit/:id', editFile);
router.delete('/delete/:id', deleteFile);


module.exports = router;
