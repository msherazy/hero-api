const express = require('express');
const { register, login, profile } = require('../controllers/authController');
const { authGuard } = require('../guards/authGuard');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authGuard, profile);

module.exports = router;
