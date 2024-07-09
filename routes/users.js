const express = require('express');
const { createUsers, connexionUser, authenticateToken, getUser, editPassword } = require('../controllers/users');
const router = express.Router();

router.post('/register', createUsers);
router.post('/login', connexionUser);
router.get('/profile', authenticateToken, getUser);
router.post('/password/edit', editPassword);

module.exports = router;
