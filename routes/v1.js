const express = require('express');
const authRoutes = require('./authRoutes');
const fileRoutes = require('./fileRoutes');
const { authGuard } = require('../guards/authGuard');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/files', authGuard, fileRoutes);

module.exports = router;
