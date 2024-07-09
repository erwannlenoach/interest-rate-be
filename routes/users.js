const express = require('express');
const { createUsers, connexionUser, authenticateToken, getUser, editPassword } = require('../controllers/users');
const router = express.Router();

router.post('/register', createUsers);
router.post('/login', connexionUser);
router.post('/profile', authenticateToken,getUser);
router.post('/password/edit', authenticateToken,editPassword);

module.exports = router;
